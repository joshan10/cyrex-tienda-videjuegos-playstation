from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.exceptions import ConflictoNegocio, RecursoNoEncontrado
from app.models.entities import (
    Orden,
    OrdenDetalle,
    Producto,
    Servicio,
    Usuario,
    Venta,
    VentaDetalle,
)
from app.schemas.common import public_dict
from app.schemas.ventas import FacturaFiltros


def _generar_numero_factura(db: Session, fecha: datetime) -> str:
    year = fecha.year
    prefix = f"CYR-{year}-"
    last = db.scalar(
        select(Venta.numero_factura)
        .where(Venta.numero_factura.like(f"{prefix}%"))
        .order_by(Venta.numero_factura.desc())
        .limit(1)
    )
    if last:
        num = int(last.split("-")[-1]) + 1
    else:
        num = 1
    return f"{prefix}{num:04d}"


def crear_venta(
    db: Session,
    orden_id: int,
    impuesto_porcentaje: Decimal = Decimal("0"),
    descuento_porcentaje: Decimal = Decimal("0"),
    metodo_pago: str = "stripe",
    notas_factura: str | None = None,
) -> dict:
    orden = db.get(Orden, orden_id)
    if not orden:
        raise RecursoNoEncontrado("Orden", orden_id)

    existing = db.scalar(select(Venta).where(Venta.orden_id == orden_id))
    if existing:
        raise ConflictoNegocio(f"La orden {orden_id} ya tiene una venta asociada (factura {existing.numero_factura})")

    if orden.estado not in {"completada", "procesando"}:
        raise ConflictoNegocio(f"No se puede facturar una orden con estado '{orden.estado}'")

    detalles_orden = db.scalars(
        select(OrdenDetalle).where(OrdenDetalle.orden_id == orden_id)
    ).all()

    subtotal = Decimal("0")
    prepared_details = []
    for det in detalles_orden:
        producto = db.get(Producto, det.producto_id)
        item_subtotal = det.subtotal
        impuesto_item = item_subtotal * (impuesto_porcentaje / Decimal("100"))
        descuento_item = item_subtotal * (descuento_porcentaje / Decimal("100"))
        subtotal += item_subtotal

        servicio_id = getattr(det, "servicio_id", None)
        servicio_nombre = None
        if servicio_id:
            servicio = db.get(Servicio, servicio_id)
            if servicio:
                servicio_nombre = servicio.nombre

        prepared_details.append({
            "producto_id": det.producto_id,
            "producto_nombre": producto.nombre if producto else None,
            "servicio_id": servicio_id,
            "servicio_nombre": servicio_nombre,
            "cantidad": det.cantidad,
            "precio_unitario": det.precio_unitario,
            "impuesto_item": impuesto_item,
            "descuento_item": descuento_item,
            "subtotal": item_subtotal - descuento_item + impuesto_item,
            "imagen_url": producto.imagen_url if producto else None,
        })

    impuesto_valor = subtotal * (impuesto_porcentaje / Decimal("100"))
    descuento_valor = subtotal * (descuento_porcentaje / Decimal("100"))
    total_neto = subtotal + impuesto_valor - descuento_valor

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    fecha_venta = orden.created_at or now
    numero_factura = _generar_numero_factura(db, fecha_venta)

    venta = Venta(
        orden_id=orden_id,
        numero_factura=numero_factura,
        subtotal=subtotal,
        impuesto_valor=impuesto_valor,
        impuesto_porcentaje=impuesto_porcentaje,
        descuento_valor=descuento_valor,
        descuento_porcentaje=descuento_porcentaje,
        total_neto=total_neto,
        metodo_pago=metodo_pago,
        notas_factura=notas_factura,
        fecha_venta=fecha_venta,
        created_at=fecha_venta,
        updated_at=fecha_venta,
    )
    db.add(venta)
    db.flush()

    for detail in prepared_details:
        db.add(VentaDetalle(
            venta_id=venta.id,
            producto_id=detail["producto_id"],
            servicio_id=detail["servicio_id"],
            cantidad=detail["cantidad"],
            precio_unitario=detail["precio_unitario"],
            impuesto_item=detail["impuesto_item"],
            descuento_item=detail["descuento_item"],
            subtotal=detail["subtotal"],
            created_at=now,
        ))

    db.commit()
    db.refresh(venta)
    return venta_view(db, venta)


def venta_view(db: Session, venta: Venta) -> dict:
    data = public_dict(venta)
    user = db.get(Usuario, db.get(Orden, venta.orden_id).usuario_id) if db.get(Orden, venta.orden_id) else None
    if user:
        data.update({
            "usuario_nombre": user.nombre,
            "usuario_apellido": user.apellido,
            "usuario_correo": user.correo,
            "usuario_documento": user.numero_documento,
        })

    detalles = db.scalars(
        select(VentaDetalle).where(VentaDetalle.venta_id == venta.id)
    ).all()
    data["detalles"] = []
    for det in detalles:
        item = public_dict(det)
        producto = db.get(Producto, det.producto_id)
        item["producto_nombre"] = producto.nombre if producto else None
        item["imagen_url"] = producto.imagen_url if producto else None
        if det.servicio_id:
            servicio = db.get(Servicio, det.servicio_id)
            item["servicio_nombre"] = servicio.nombre if servicio else None
        data["detalles"].append(item)

    return data


def obtener_ventas(
    db: Session,
    filtros: FacturaFiltros | None = None,
    skip: int = 0,
    limit: int = 100,
) -> tuple[list[dict], int]:
    query = select(Venta)

    if filtros:
        if filtros.numero_factura:
            query = query.where(Venta.numero_factura.like(f"%{filtros.numero_factura}%"))
        if filtros.estado:
            query = query.where(Venta.estado == filtros.estado)
        if filtros.metodo_pago:
            query = query.where(Venta.metodo_pago == filtros.metodo_pago)
        if filtros.fecha_desde:
            try:
                fecha = datetime.strptime(filtros.fecha_desde, "%Y-%m-%d")
                query = query.where(Venta.fecha_venta >= fecha)
            except ValueError:
                pass
        if filtros.fecha_hasta:
            try:
                fecha = datetime.strptime(filtros.fecha_hasta, "%Y-%m-%d")
                query = query.where(Venta.fecha_venta <= fecha)
            except ValueError:
                pass
        if filtros.valor_minimo is not None:
            query = query.where(Venta.total_neto >= filtros.valor_minimo)
        if filtros.valor_maximo is not None:
            query = query.where(Venta.total_neto <= filtros.valor_maximo)
        if filtros.cliente_correo or filtros.cliente_documento:
            query = query.join(Orden, Venta.orden_id == Orden.id).join(Usuario, Orden.usuario_id == Usuario.id)
            if filtros.cliente_correo:
                query = query.where(Usuario.correo.like(f"%{filtros.cliente_correo}%"))
            if filtros.cliente_documento:
                query = query.where(Usuario.numero_documento.like(f"%{filtros.cliente_documento}%"))
        if filtros.producto_id or filtros.servicio_id:
            query = query.join(VentaDetalle, VentaDetalle.venta_id == Venta.id)
            if filtros.producto_id:
                query = query.where(VentaDetalle.producto_id == filtros.producto_id)
            if filtros.servicio_id:
                query = query.where(VentaDetalle.servicio_id == filtros.servicio_id)

    total = db.scalar(select(func.count()).select_from(query.subquery()))
    ventas = db.scalars(query.order_by(Venta.created_at.desc()).offset(skip).limit(limit)).all()

    return [venta_view(db, v) for v in ventas], total


def obtener_venta_por_id(db: Session, venta_id: int) -> dict | None:
    venta = db.get(Venta, venta_id)
    if not venta:
        return None
    return venta_view(db, venta)


def obtener_venta_por_numero(db: Session, numero_factura: str) -> dict | None:
    venta = db.scalar(select(Venta).where(Venta.numero_factura == numero_factura))
    if not venta:
        return None
    return venta_view(db, venta)


def actualizar_venta(
    db: Session,
    venta_id: int,
    notas_factura: str | None = None,
    descuento_porcentaje: Decimal | None = None,
    estado: str | None = None,
) -> dict | None:
    venta = db.get(Venta, venta_id)
    if not venta:
        return None

    if notas_factura is not None:
        venta.notas_factura = notas_factura
    if estado is not None:
        venta.estado = estado
    if descuento_porcentaje is not None:
        venta.descuento_porcentaje = descuento_porcentaje
        descuento_valor = venta.subtotal * (descuento_porcentaje / Decimal("100"))
        venta.descuento_valor = descuento_valor
        venta.total_neto = venta.subtotal + venta.impuesto_valor - descuento_valor

    venta.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()
    db.refresh(venta)
    return venta_view(db, venta)


def obtener_stats_ventas(db: Session) -> dict:
    stats = db.execute(
        select(
            func.count(Venta.id),
            func.coalesce(func.sum(Venta.subtotal), 0),
            func.coalesce(func.sum(Venta.impuesto_valor), 0),
            func.coalesce(func.sum(Venta.descuento_valor), 0),
            func.coalesce(func.sum(Venta.total_neto), 0),
        ).where(Venta.estado == "activa")
    ).one()

    por_estado = dict(db.execute(
        select(Venta.estado, func.count(Venta.id)).group_by(Venta.estado)
    ).all())

    recent = db.execute(
        select(Venta, Usuario.nombre, Usuario.apellido, Usuario.correo)
        .join(Orden, Venta.orden_id == Orden.id)
        .join(Usuario, Orden.usuario_id == Usuario.id)
        .order_by(Venta.created_at.desc())
        .limit(10)
    ).all()

    return {
        "total_facturado": float(stats[4]),
        "subtotal": float(stats[1]),
        "total_impuestos": float(stats[2]),
        "total_descuentos": float(stats[3]),
        "num_facturas": stats[0],
        "ventas_por_estado": por_estado,
        "ventas_recientes": [
            {
                **public_dict(venta),
                "nombre": nombre,
                "apellido": apellido,
                "correo": correo,
            }
            for venta, nombre, apellido, correo in recent
        ],
    }


def ventas_por_fecha(
    db: Session,
    fecha_inicio: str | None = None,
    fecha_fin: str | None = None,
) -> list[dict]:
    query = select(
        func.date(Venta.fecha_venta).label("fecha"),
        func.count(Venta.id).label("num_ventas"),
        func.coalesce(func.sum(Venta.subtotal), 0).label("subtotal"),
        func.coalesce(func.sum(Venta.impuesto_valor), 0).label("impuestos"),
        func.coalesce(func.sum(Venta.total_neto), 0).label("total"),
    ).where(Venta.estado == "activa").group_by(func.date(Venta.fecha_venta))

    if fecha_inicio:
        try:
            f = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
            query = query.where(func.date(Venta.fecha_venta) >= f)
        except ValueError:
            pass
    if fecha_fin:
        try:
            f = datetime.strptime(fecha_fin, "%Y-%m-%d").date()
            query = query.where(func.date(Venta.fecha_venta) <= f)
        except ValueError:
            pass

    rows = db.execute(query.order_by(func.date(Venta.fecha_venta).desc())).all()

    return [
        {
            "fecha": str(row.fecha),
            "num_ventas": row.num_ventas,
            "subtotal": float(row.subtotal),
            "impuestos": float(row.impuestos),
            "total": float(row.total),
        }
        for row in rows
    ]


def reporte_ventas_detallado(
    db: Session,
    fecha_inicio: str | None = None,
    fecha_fin: str | None = None,
) -> dict:
    base_query = select(Venta).where(Venta.estado == "activa")
    if fecha_inicio:
        try:
            f = datetime.strptime(fecha_inicio, "%Y-%m-%d")
            base_query = base_query.where(Venta.fecha_venta >= f)
        except ValueError:
            pass
    if fecha_fin:
        try:
            f = datetime.strptime(fecha_fin, "%Y-%m-%d")
            base_query = base_query.where(Venta.fecha_venta <= f)
        except ValueError:
            pass

    stats = db.execute(
        select(
            func.count(Venta.id),
            func.coalesce(func.sum(Venta.subtotal), 0),
            func.coalesce(func.sum(Venta.impuesto_valor), 0),
            func.coalesce(func.sum(Venta.descuento_valor), 0),
            func.coalesce(func.sum(Venta.total_neto), 0),
        ).where(Venta.estado == "activa").where(
            *([
                Venta.fecha_venta >= datetime.strptime(fecha_inicio, "%Y-%m-%d")
            ] if fecha_inicio else []),
            *([
                Venta.fecha_venta <= datetime.strptime(fecha_fin, "%Y-%m-%d")
            ] if fecha_fin else []),
        )
    ).one()

    # Ventas por día
    daily = ventas_por_fecha(db, fecha_inicio, fecha_fin)

    # Top productos vendidos
    top_productos_query = (
        select(
            Producto.nombre,
            func.sum(VentaDetalle.cantidad).label("unidades"),
            func.coalesce(func.sum(VentaDetalle.subtotal), 0).label("ingresos"),
        )
        .join(VentaDetalle, VentaDetalle.producto_id == Producto.id)
        .join(Venta, Venta.id == VentaDetalle.venta_id)
        .where(Venta.estado == "activa")
        .group_by(Producto.id, Producto.nombre)
        .order_by(func.sum(VentaDetalle.cantidad).desc())
        .limit(10)
    )
    if fecha_inicio:
        try:
            f = datetime.strptime(fecha_inicio, "%Y-%m-%d")
            top_productos_query = top_productos_query.where(Venta.fecha_venta >= f)
        except ValueError:
            pass
    if fecha_fin:
        try:
            f = datetime.strptime(fecha_fin, "%Y-%m-%d")
            top_productos_query = top_productos_query.where(Venta.fecha_venta <= f)
        except ValueError:
            pass

    top_productos = [
        {"nombre": row.nombre, "unidades": row.unidades, "ingresos": float(row.ingresos)}
        for row in db.execute(top_productos_query).all()
    ]

    return {
        "resumen": {
            "num_facturas": stats[0],
            "subtotal": float(stats[1]),
            "impuestos": float(stats[2]),
            "descuentos": float(stats[3]),
            "total_neto": float(stats[4]),
        },
        "ventas_por_dia": daily,
        "top_productos": top_productos,
    }


def generar_datos_excel(
    db: Session,
    fecha_inicio: str | None = None,
    fecha_fin: str | None = None,
) -> list[dict]:
    query = select(Venta).where(Venta.estado == "activa")
    if fecha_inicio:
        try:
            f = datetime.strptime(fecha_inicio, "%Y-%m-%d")
            query = query.where(Venta.fecha_venta >= f)
        except ValueError:
            pass
    if fecha_fin:
        try:
            f = datetime.strptime(fecha_fin, "%Y-%m-%d")
            query = query.where(Venta.fecha_venta <= f)
        except ValueError:
            pass

    ventas = db.scalars(query.order_by(Venta.fecha_venta.desc())).all()
    rows = []
    for v in ventas:
        orden = db.get(Orden, v.orden_id)
        usuario = db.get(Usuario, orden.usuario_id) if orden else None
        detalles = db.scalars(select(VentaDetalle).where(VentaDetalle.venta_id == v.id)).all()
        productos_parts = []
        for det in detalles:
            p = db.get(Producto, det.producto_id)
            if p:
                productos_parts.append(f"{p.nombre} x{det.cantidad}")
            else:
                productos_parts.append(f"Prod#{det.producto_id} x{det.cantidad}")
        productos_str = ", ".join(productos_parts) if productos_parts else "Sin detalles"
        rows.append({
            "numero_factura": v.numero_factura,
            "fecha": str(v.fecha_venta.date()) if v.fecha_venta else "",
            "cliente": f"{usuario.nombre} {usuario.apellido}" if usuario else "N/A",
            "correo": usuario.correo if usuario else "",
            "productos": productos_str,
            "subtotal": float(v.subtotal),
            "impuestos": float(v.impuesto_valor),
            "descuentos": float(v.descuento_valor),
            "total_neto": float(v.total_neto),
            "metodo_pago": v.metodo_pago,
        })
    return rows
