from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.resources import product_view
from app.dependencies import require_roles
from app.models.entities import Producto
from app.schemas.common import ProductoEntrada, ProductoUpdate

router = APIRouter(prefix="/productos", tags=["productos"])


@router.get("")
def get_all(estado: str | None = None, categoria_id: int | None = None, plataforma: str | None = None, search: str | None = None, db: Session = Depends(get_db)):
    query = select(Producto)
    if estado:
        query = query.where(Producto.estado == estado)
    if categoria_id:
        query = query.where(Producto.categoria_id == categoria_id)
    if plataforma:
        query = query.where(Producto.plataforma == plataforma)
    if search:
        query = query.where((Producto.nombre.like(f"%{search}%")) | (Producto.descripcion.like(f"%{search}%")))
    products = db.scalars(query.order_by(Producto.created_at.desc())).all()
    return {"productos": [product_view(db, product) for product in products]}


@router.get("/{product_id}")
def get_by_id(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Producto, product_id)
    if not product:
        raise HTTPException(404, "Producto no encontrado.")
    return {"producto": product_view(db, product)}


@router.post("", status_code=201)
def create(data: ProductoEntrada, _: dict = Depends(require_roles("Administrador")), db: Session = Depends(get_db)):
    product = Producto(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return {"message": "Producto creado exitosamente.", "producto": product_view(db, product)}


@router.put("/{product_id}")
def update(product_id: int, data: ProductoUpdate, _: dict = Depends(require_roles("Administrador", "Empleado")), db: Session = Depends(get_db)):
    product = db.get(Producto, product_id)
    if not product:
        raise HTTPException(404, "Producto no encontrado.")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return {"message": "Producto actualizado exitosamente.", "producto": product_view(db, product)}


@router.delete("/{product_id}")
def remove(product_id: int, _: dict = Depends(require_roles("Administrador")), db: Session = Depends(get_db)):
    product = db.get(Producto, product_id)
    if not product:
        raise HTTPException(404, "Producto no encontrado.")
    product.estado = "inactivo"
    db.commit()
    db.refresh(product)
    return {"message": "Producto desactivado exitosamente.", "producto": product_view(db, product)}
