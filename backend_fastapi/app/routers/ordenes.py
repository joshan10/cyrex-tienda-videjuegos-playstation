from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.resources import create_order, get_user_orders, count_orders, get_order_stats, order_view
from app.dependencies import require_roles, current_user
from app.exceptions import RecursoNoEncontrado
from app.models.entities import Orden
from app.pagination import Paginacion, get_paginacion, paginate_query
from app.schemas.common import EstadoOrden, OrdenEntrada

router = APIRouter(prefix="/ordenes", tags=["ordenes"])


@router.get(
    "/stats/ventas",
    summary="Estadísticas de ventas",
    responses={200: {"description": "Estadísticas de ventas"}},
    dependencies=[Depends(require_roles("Administrador"))],
)
def stats(db: Session = Depends(get_db)):
    return {"stats": get_order_stats(db)}


@router.get(
    "",
    summary="Listar órdenes",
    responses={200: {"description": "Lista paginada de órdenes"}, 401: {"description": "No autenticado"}},
)
def get_all(
    user: dict = Depends(current_user),
    paginacion: Paginacion = Depends(get_paginacion),
    db: Session = Depends(get_db),
):
    user_id = user["id"] if user["rol_nombre"] == "Cliente" else None
    total = count_orders(db, user_id)
    orders = get_user_orders(db, user_id)
    paginated = orders[paginacion.skip : paginacion.skip + paginacion.size]
    return {
        "items": [order_view(db, o) for o in paginated],
        **paginate_query(total, paginacion),
    }


@router.get(
    "/{order_id}",
    summary="Obtener orden por ID",
    responses={200: {"description": "Orden encontrada"}, 404: {"description": "Orden no encontrada"}, 403: {"description": "Acceso denegado"}},
)
def get_by_id(order_id: int, user: dict = Depends(current_user), db: Session = Depends(get_db)):
    order = db.get(Orden, order_id)
    if not order:
        raise RecursoNoEncontrado("Orden", order_id)
    if user["rol_nombre"] == "Cliente" and order.usuario_id != user["id"]:
        from fastapi import HTTPException
        raise HTTPException(403, "No tienes acceso a esta orden.")
    return order_view(db, order)


@router.post(
    "",
    summary="Crear una nueva orden",
    status_code=201,
    responses={201: {"description": "Orden creada"}, 409: {"description": "Stock insuficiente"}, 404: {"description": "Producto no encontrado"}},
)
def create(data: OrdenEntrada, user: dict = Depends(require_roles("Cliente")), db: Session = Depends(get_db)):
    orden_data = create_order(db, user["id"], data.items, data.direccion_envio, data.notas)
    return {
        "message": "Orden creada exitosamente. Procede a pagar con POST /api/pagos.",
        "orden": orden_data,
    }


@router.patch(
    "/{order_id}/estado",
    summary="Actualizar estado de orden",
    responses={200: {"description": "Estado actualizado"}, 404: {"description": "Orden no encontrada"}, 400: {"description": "Estado inválido"}},
)
def update_status(
    order_id: int,
    data: EstadoOrden,
    _: dict = Depends(require_roles("Administrador", "Empleado")),
    db: Session = Depends(get_db),
):
    if data.estado not in {"pendiente", "procesando", "completada", "cancelada"}:
        from fastapi import HTTPException
        raise HTTPException(400, "Estado inválido. Usa: pendiente, procesando, completada, cancelada")
    order = db.get(Orden, order_id)
    if not order:
        raise RecursoNoEncontrado("Orden", order_id)
    order.estado = data.estado
    db.commit()
    db.refresh(order)

    if data.estado == "completada":
        from sqlalchemy import select as sa_select
        from app.models.entities import Venta
        existing = db.scalar(sa_select(Venta).where(Venta.orden_id == order_id))
        if not existing:
            from app.crud.ventas import crear_venta
            from decimal import Decimal
            try:
                crear_venta(db, orden_id=order_id, impuesto_porcentaje=Decimal("19"))
            except Exception:
                pass

    return {"message": "Estado de orden actualizado.", "orden": order_view(db, order)}
