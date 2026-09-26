from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.exceptions import ConflictoNegocio
from app.models.entities import Orden, OrdenDetalle, PQR, Producto, Usuario, Venta, VentaDetalle

ORDENES_EN_CURSO = ("pendiente", "procesando")


def _ventas_activas_de_usuario(db: Session, usuario_id: int) -> int:
    return db.scalar(
        select(func.count(Venta.id))
        .join(Orden, Venta.orden_id == Orden.id)
        .where(Orden.usuario_id == usuario_id, Venta.estado == "activa")
    ) or 0


def _ordenes_en_curso_de_usuario(db: Session, usuario_id: int) -> int:
    return db.scalar(
        select(func.count(Orden.id))
        .where(Orden.usuario_id == usuario_id, Orden.estado.in_(ORDENES_EN_CURSO))
    ) or 0


def _pqrs_de_usuario(db: Session, usuario_id: int) -> int:
    return db.scalar(select(func.count(PQR.id)).where(PQR.usuario_id == usuario_id)) or 0


def _ventas_de_producto(db: Session, producto_id: int, estado: str | None = None) -> int:
    query = (
        select(func.count(VentaDetalle.id))
        .join(Venta, VentaDetalle.venta_id == Venta.id)
        .where(VentaDetalle.producto_id == producto_id)
    )
    if estado:
        query = query.where(Venta.estado == estado)
    return db.scalar(query) or 0


def _ordenes_en_curso_de_producto(db: Session, producto_id: int) -> int:
    return db.scalar(
        select(func.count(OrdenDetalle.id))
        .join(Orden, OrdenDetalle.orden_id == Orden.id)
        .where(OrdenDetalle.producto_id == producto_id, Orden.estado.in_(ORDENES_EN_CURSO))
    ) or 0


def verificar_usuario_eliminable(db: Session, usuario: Usuario, usuario_actual_id: int | None = None) -> None:
    """Lanza ConflictoNegocio (409) si el usuario no puede eliminarse."""
    if usuario_actual_id is not None and usuario.id == usuario_actual_id:
        raise ConflictoNegocio("No puedes eliminar tu propia cuenta.")

    activas = _ventas_activas_de_usuario(db, usuario.id)
    if activas:
        raise ConflictoNegocio(
            f"No se puede eliminar al cliente porque tiene {activas} venta(s) activa(s). "
            "Anula las facturas o espera a que se procesen antes de eliminarlo."
        )

    en_curso = _ordenes_en_curso_de_usuario(db, usuario.id)
    if en_curso:
        raise ConflictoNegocio(
            f"No se puede eliminar al usuario porque tiene {en_curso} orden(es) en curso "
            "(pendiente o procesando). Cancela o completa esas órdenes antes de eliminarlo."
        )

    pqrs = _pqrs_de_usuario(db, usuario.id)
    if pqrs:
        raise ConflictoNegocio(
            f"No se puede eliminar al usuario porque tiene {pqrs} PQR(s) registrada(s). "
            "Atiende o cierra esas PQR antes de eliminarlo."
        )


def verificar_producto_eliminable(db: Session, producto: Producto) -> None:
    """Lanza ConflictoNegocio (409) si el producto no puede eliminarse."""
    activas = _ventas_de_producto(db, producto.id, estado="activa")
    if activas:
        raise ConflictoNegocio(
            f'No se puede eliminar el producto "{producto.nombre}" porque está incluido en '
            f"{activas} venta(s) activa(s). Desactívalo en su lugar para ocultarlo de la tienda."
        )

    en_curso = _ordenes_en_curso_de_producto(db, producto.id)
    if en_curso:
        raise ConflictoNegocio(
            f'No se puede eliminar el producto "{producto.nombre}" porque está incluido en '
            f"{en_curso} orden(es) en curso (pendiente o procesando). "
            "Cancela o completa esas órdenes antes de eliminarlo."
        )

    en_facturas = _ventas_de_producto(db, producto.id)
    if en_facturas:
        raise ConflictoNegocio(
            f'No se puede eliminar el producto "{producto.nombre}" porque aparece en '
            f"{en_facturas} factura(s) del histórico de ventas (aun anuladas). "
            "Desactívalo en su lugar para ocultarlo de la tienda."
        )
