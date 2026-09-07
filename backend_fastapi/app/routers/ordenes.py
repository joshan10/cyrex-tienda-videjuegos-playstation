from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.resources import create_order, order_view, public_dict
from app.dependencies import require_roles, current_user
from app.models.entities import Orden, OrdenDetalle, Producto, Usuario
from app.schemas.common import EstadoOrden, OrdenEntrada

router = APIRouter(prefix="/ordenes", tags=["ordenes"])


@router.get("/stats/ventas")
def stats(_: dict = Depends(require_roles("Administrador")), db: Session = Depends(get_db)):
    total = db.execute(select(func.count(Orden.id), func.coalesce(func.sum(Orden.total), 0)).where(Orden.estado == "completada")).one()
    recent = db.execute(select(Orden, Usuario.nombre, Usuario.apellido).join(Usuario, Usuario.id == Orden.usuario_id).order_by(Orden.created_at.desc()).limit(10)).all()
    best = db.execute(select(Producto.nombre, func.sum(OrdenDetalle.cantidad).label("total_vendido"), func.sum(OrdenDetalle.subtotal).label("ingresos")).join(OrdenDetalle, Producto.id == OrdenDetalle.producto_id).join(Orden, Orden.id == OrdenDetalle.orden_id).where(Orden.estado == "completada").group_by(Producto.id, Producto.nombre).order_by(func.sum(OrdenDetalle.cantidad).desc()).limit(5)).all()
    return {"stats": {"total_ordenes": total[0], "ingresos_totales": float(total[1]), "ventas_recientes": [{**public_dict(order), "nombre": name, "apellido": surname} for order, name, surname in recent], "productos_mas_vendidos": [{"nombre": name, "total_vendido": quantity, "ingresos": float(income)} for name, quantity, income in best]}}


@router.get("")
def get_all(user: dict = Depends(current_user), db: Session = Depends(get_db)):
    query = select(Orden).order_by(Orden.created_at.desc())
    if user["rol_nombre"] == "Cliente": query = query.where(Orden.usuario_id == user["id"])
    return {"ordenes": [order_view(db, order) for order in db.scalars(query).all()]}


@router.get("/{order_id}")
def get_by_id(order_id: int, user: dict = Depends(current_user), db: Session = Depends(get_db)):
    order = db.get(Orden, order_id)
    if not order: raise HTTPException(404, "Orden no encontrada.")
    if user["rol_nombre"] == "Cliente" and order.usuario_id != user["id"]: raise HTTPException(403, "No tienes acceso a esta orden.")
    return {"orden": order_view(db, order)}


@router.post("", status_code=201)
def create(data: OrdenEntrada, user: dict = Depends(require_roles("Cliente")), db: Session = Depends(get_db)):
    return {"message": "Orden creada exitosamente.", "orden": create_order(db, user["id"], data.items, data.direccion_envio, data.notas)}


@router.patch("/{order_id}/estado")
def update_status(order_id: int, data: EstadoOrden, _: dict = Depends(require_roles("Administrador", "Empleado")), db: Session = Depends(get_db)):
    if data.estado not in {"pendiente", "procesando", "completada", "cancelada"}: raise HTTPException(400, "Estado inválido. Usa: pendiente, procesando, completada, cancelada")
    order = db.get(Orden, order_id)
    if not order: raise HTTPException(404, "Orden no encontrada.")
    order.estado = data.estado; db.commit(); db.refresh(order)
    return {"message": "Estado de orden actualizado.", "orden": order_view(db, order)}
