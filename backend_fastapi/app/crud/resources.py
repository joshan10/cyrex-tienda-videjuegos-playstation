import math
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.exceptions import StockInsuficiente
from app.models.entities import Categoria, Orden, OrdenDetalle, Producto, Servicio, Usuario
from app.models.roles import Permiso, Rol, RolPermiso
from app.schemas.common import public_dict


def user_view(db: Session, user: Usuario) -> dict:
    role = db.scalar(select(Rol.nombre).where(Rol.id == user.rol_id))
    data = public_dict(user)
    data.pop("password", None)
    data["rol_nombre"] = role
    return data


def permissions(db: Session, role_id: int) -> list[str]:
    return list(db.scalars(
        select(Permiso.nombre)
        .join(RolPermiso, Permiso.id == RolPermiso.permiso_id)
        .where(RolPermiso.rol_id == role_id)
    ).all())


def product_view(db: Session, product: Producto) -> dict:
    data = public_dict(product)
    data["categoria_nombre"] = db.scalar(
        select(Categoria.nombre).where(Categoria.id == product.categoria_id)
    )
    return data


def order_view(db: Session, order: Orden) -> dict:
    data = public_dict(order)
    user = db.get(Usuario, order.usuario_id)
    data.update({
        "usuario_nombre": user.nombre,
        "usuario_apellido": user.apellido,
        "usuario_correo": user.correo,
    })
    details = db.scalars(
        select(OrdenDetalle).where(OrdenDetalle.orden_id == order.id)
    ).all()
    data["detalles"] = []
    for detail in details:
        item = public_dict(detail)
        product = db.get(Producto, detail.producto_id)
        item.update({"producto_nombre": product.nombre, "imagen_url": product.imagen_url})
        data["detalles"].append(item)
    return data


def create_order(db: Session, user_id: int, items: list, address: str | None, notes: str | None) -> dict:
    total = Decimal("0")
    prepared = []
    for item in items:
        product = db.scalar(
            select(Producto)
            .where(Producto.id == item.producto_id, Producto.estado == "activo")
            .with_for_update()
        )
        if not product:
            raise ValueError(f"Producto con ID {item.producto_id} no encontrado o no disponible")
        if product.stock < item.cantidad:
            raise StockInsuficiente(product.nombre, product.stock)
        subtotal = product.precio * item.cantidad
        total += subtotal
        prepared.append((product, item.cantidad, subtotal))
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    order = Orden(usuario_id=user_id, total=total, direccion_envio=address, notas=notes, created_at=now, updated_at=now)
    db.add(order)
    db.flush()
    for product, quantity, subtotal in prepared:
        db.add(OrdenDetalle(
            orden_id=order.id,
            producto_id=product.id,
            cantidad=quantity,
            precio_unitario=product.precio,
            subtotal=subtotal,
            created_at=now,
        ))
        product.stock -= quantity
    db.commit()
    db.refresh(order)
    return order_view(db, order)


# --- Funciones de consulta para productos ---

def get_products_with_filters(
    db: Session,
    estado: str | None = None,
    categoria_id: int | None = None,
    plataforma: str | None = None,
    search: str | None = None,
) -> list[Producto]:
    query = select(Producto)
    if estado:
        query = query.where(Producto.estado == estado)
    if categoria_id:
        query = query.where(Producto.categoria_id == categoria_id)
    if plataforma:
        query = query.where(Producto.plataforma == plataforma)
    if search:
        query = query.where(
            (Producto.nombre.like(f"%{search}%")) | (Producto.descripcion.like(f"%{search}%"))
        )
    return list(db.scalars(query.order_by(Producto.created_at.desc())).all())


def count_products_with_filters(
    db: Session,
    estado: str | None = None,
    categoria_id: int | None = None,
    plataforma: str | None = None,
    search: str | None = None,
) -> int:
    query = select(func.count(Producto.id))
    if estado:
        query = query.where(Producto.estado == estado)
    if categoria_id:
        query = query.where(Producto.categoria_id == categoria_id)
    if plataforma:
        query = query.where(Producto.plataforma == plataforma)
    if search:
        query = query.where(
            (Producto.nombre.like(f"%{search}%")) | (Producto.descripcion.like(f"%{search}%"))
        )
    return db.scalar(query)


# --- Funciones de consulta para categorías ---

def get_all_categories(db: Session) -> list[Categoria]:
    return list(db.scalars(select(Categoria).order_by(Categoria.nombre)).all())


def count_categories(db: Session) -> int:
    return db.scalar(select(func.count(Categoria.id)))


# --- Funciones de consulta para servicios ---

def get_active_services(db: Session) -> list[Servicio]:
    return list(db.scalars(
        select(Servicio)
        .where(Servicio.estado == "activo")
        .order_by(Servicio.nombre)
    ).all())


def count_services(db: Session) -> int:
    return db.scalar(select(func.count(Servicio.id)).where(Servicio.estado == "activo"))


# --- Funciones de consulta para usuarios ---

def get_all_users(db: Session) -> list[Usuario]:
    return list(db.scalars(select(Usuario).order_by(Usuario.created_at.desc())).all())


def count_users(db: Session) -> int:
    return db.scalar(select(func.count(Usuario.id)))


# --- Funciones de consulta para órdenes ---

def get_user_orders(db: Session, user_id: int | None = None) -> list[Orden]:
    query = select(Orden).order_by(Orden.created_at.desc())
    if user_id:
        query = query.where(Orden.usuario_id == user_id)
    return list(db.scalars(query).all())


def count_orders(db: Session, user_id: int | None = None) -> int:
    query = select(func.count(Orden.id))
    if user_id:
        query = query.where(Orden.usuario_id == user_id)
    return db.scalar(query)


def get_order_stats(db: Session) -> dict:
    total = db.execute(
        select(
            func.count(Orden.id),
            func.coalesce(func.sum(Orden.total), 0),
        ).where(Orden.estado == "completada")
    ).one()

    recent = db.execute(
        select(Orden, Usuario.nombre, Usuario.apellido)
        .join(Usuario, Usuario.id == Orden.usuario_id)
        .order_by(Orden.created_at.desc())
        .limit(10)
    ).all()

    best = db.execute(
        select(
            Producto.nombre,
            func.sum(OrdenDetalle.cantidad).label("total_vendido"),
            func.sum(OrdenDetalle.subtotal).label("ingresos"),
        )
        .join(OrdenDetalle, Producto.id == OrdenDetalle.producto_id)
        .join(Orden, Orden.id == OrdenDetalle.orden_id)
        .where(Orden.estado == "completada")
        .group_by(Producto.id, Producto.nombre)
        .order_by(func.sum(OrdenDetalle.cantidad).desc())
        .limit(5)
    ).all()

    return {
        "total_ordenes": total[0],
        "ingresos_totales": float(total[1]),
        "ventas_recientes": [
            {**public_dict(order), "nombre": name, "apellido": surname}
            for order, name, surname in recent
        ],
        "productos_mas_vendidos": [
            {"nombre": name, "total_vendido": quantity, "ingresos": float(income)}
            for name, quantity, income in best
        ],
    }
