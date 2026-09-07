from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import require_roles
from app.models.entities import Categoria, Servicio
from app.schemas.resources import CategoriaEntrada, ServicioEntrada
from app.schemas.common import Actualizacion

categories = APIRouter(prefix="/categorias", tags=["categorias"])
services = APIRouter(prefix="/servicios", tags=["servicios"])


@categories.get("")
def categories_all(db: Session = Depends(get_db)):
    return {"categorias": [vars_to_dict(item) for item in db.scalars(select(Categoria).order_by(Categoria.nombre)).all()]}


@categories.get("/{item_id}")
def category_by_id(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Categoria, item_id)
    if not item: raise HTTPException(404, "Categoría no encontrada.")
    return {"categoria": vars_to_dict(item)}


@categories.post("", status_code=201)
def category_create(data: CategoriaEntrada, _: dict = Depends(require_roles("Administrador")), db: Session = Depends(get_db)):
    item = Categoria(**data.model_dump()); db.add(item); db.commit(); db.refresh(item)
    return {"message": "Categoría creada exitosamente.", "categoria": vars_to_dict(item)}


@categories.put("/{item_id}")
def category_update(item_id: int, data: Actualizacion, _: dict = Depends(require_roles("Administrador")), db: Session = Depends(get_db)):
    item = db.get(Categoria, item_id)
    if not item: raise HTTPException(404, "Categoría no encontrada.")
    for key, value in data.model_dump(exclude_unset=True).items():
        if key in {"nombre", "descripcion", "imagen_url", "estado"}: setattr(item, key, value)
    db.commit(); db.refresh(item)
    return {"message": "Categoría actualizada exitosamente.", "categoria": vars_to_dict(item)}


@categories.delete("/{item_id}")
def category_remove(item_id: int, _: dict = Depends(require_roles("Administrador")), db: Session = Depends(get_db)):
    item = db.get(Categoria, item_id)
    if not item: raise HTTPException(404, "Categoría no encontrada.")
    item.estado = "inactivo"; db.commit()
    return {"message": "Categoría desactivada exitosamente."}


@services.get("")
def services_all(db: Session = Depends(get_db)):
    return {"servicios": [vars_to_dict(item) for item in db.scalars(select(Servicio).where(Servicio.estado == "activo").order_by(Servicio.nombre)).all()]}


@services.get("/{item_id}")
def service_by_id(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Servicio, item_id)
    if not item: raise HTTPException(404, "Servicio no encontrado.")
    return {"servicio": vars_to_dict(item)}


@services.post("", status_code=201)
def service_create(data: ServicioEntrada, _: dict = Depends(require_roles("Administrador")), db: Session = Depends(get_db)):
    item = Servicio(**data.model_dump()); db.add(item); db.commit(); db.refresh(item)
    return {"message": "Servicio creado exitosamente.", "servicio": vars_to_dict(item)}


@services.put("/{item_id}")
def service_update(item_id: int, data: Actualizacion, _: dict = Depends(require_roles("Administrador")), db: Session = Depends(get_db)):
    item = db.get(Servicio, item_id)
    if not item: raise HTTPException(404, "Servicio no encontrado.")
    for key, value in data.model_dump(exclude_unset=True).items():
        if key in {"nombre", "descripcion", "precio", "duracion", "estado"}: setattr(item, key, value)
    db.commit(); db.refresh(item)
    return {"message": "Servicio actualizado exitosamente.", "servicio": vars_to_dict(item)}


@services.delete("/{item_id}")
def service_remove(item_id: int, _: dict = Depends(require_roles("Administrador")), db: Session = Depends(get_db)):
    item = db.get(Servicio, item_id)
    if not item: raise HTTPException(404, "Servicio no encontrado.")
    item.estado = "inactivo"; db.commit()
    return {"message": "Servicio desactivado exitosamente."}


def vars_to_dict(item):
    return {key: value for key, value in vars(item).items() if not key.startswith("_")}
