from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.resources import get_all_categories, get_active_services, count_categories, count_services
from app.dependencies import require_roles
from app.exceptions import RecursoNoEncontrado
from app.models.entities import Categoria, Servicio
from app.pagination import Paginacion, get_paginacion, paginate_query
from app.schemas.resources import CategoriaEntrada, ServicioEntrada
from app.schemas.common import Actualizacion

categories = APIRouter(
    prefix="/categorias",
    tags=["categorias"],
    dependencies=[Depends(require_roles("Administrador"))],
)

services = APIRouter(
    prefix="/servicios",
    tags=["servicios"],
)


@categories.get(
    "",
    summary="Listar todas las categorías",
    responses={200: {"description": "Lista paginada de categorías"}},
)
def categories_all(paginacion: Paginacion = Depends(get_paginacion), db: Session = Depends(get_db)):
    total = count_categories(db)
    items = get_all_categories(db)
    paginated = items[paginacion.skip : paginacion.skip + paginacion.size]
    return {
        "items": [vars_to_dict(item) for item in paginated],
        **paginate_query(total, paginacion),
    }


@categories.get(
    "/{item_id}",
    summary="Obtener categoría por ID",
    responses={200: {"description": "Categoría encontrada"}, 404: {"description": "Categoría no encontrada"}},
)
def category_by_id(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Categoria, item_id)
    if not item:
        raise RecursoNoEncontrado("Categoría", item_id)
    return vars_to_dict(item)


@categories.post(
    "",
    summary="Crear una nueva categoría",
    status_code=201,
    responses={201: {"description": "Categoría creada"}},
)
def category_create(data: CategoriaEntrada, db: Session = Depends(get_db)):
    item = Categoria(**data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"message": "Categoría creada exitosamente.", "categoria": vars_to_dict(item)}


@categories.put(
    "/{item_id}",
    summary="Actualizar una categoría",
    responses={200: {"description": "Categoría actualizada"}, 404: {"description": "Categoría no encontrada"}},
)
def category_update(item_id: int, data: Actualizacion, db: Session = Depends(get_db)):
    item = db.get(Categoria, item_id)
    if not item:
        raise RecursoNoEncontrado("Categoría", item_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        if key in {"nombre", "descripcion", "imagen_url", "estado"}:
            setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return {"message": "Categoría actualizada exitosamente.", "categoria": vars_to_dict(item)}


@categories.delete(
    "/{item_id}",
    summary="Desactivar una categoría",
    status_code=204,
    responses={204: {"description": "Categoría desactivada"}, 404: {"description": "Categoría no encontrada"}},
)
def category_remove(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Categoria, item_id)
    if not item:
        raise RecursoNoEncontrado("Categoría", item_id)
    item.estado = "inactivo"
    db.commit()
    return Response(status_code=204)


@services.get(
    "",
    summary="Listar servicios activos",
    responses={200: {"description": "Lista paginada de servicios"}},
)
def services_all(paginacion: Paginacion = Depends(get_paginacion), db: Session = Depends(get_db)):
    total = count_services(db)
    items = get_active_services(db)
    paginated = items[paginacion.skip : paginacion.skip + paginacion.size]
    return {
        "items": [vars_to_dict(item) for item in paginated],
        **paginate_query(total, paginacion),
    }


@services.get(
    "/{item_id}",
    summary="Obtener servicio por ID",
    responses={200: {"description": "Servicio encontrado"}, 404: {"description": "Servicio no encontrado"}},
)
def service_by_id(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Servicio, item_id)
    if not item:
        raise RecursoNoEncontrado("Servicio", item_id)
    return vars_to_dict(item)


@services.post(
    "",
    summary="Crear un nuevo servicio",
    status_code=201,
    responses={201: {"description": "Servicio creado"}},
    dependencies=[Depends(require_roles("Administrador"))],
)
def service_create(data: ServicioEntrada, db: Session = Depends(get_db)):
    item = Servicio(**data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"message": "Servicio creado exitosamente.", "servicio": vars_to_dict(item)}


@services.put(
    "/{item_id}",
    summary="Actualizar un servicio",
    responses={200: {"description": "Servicio actualizado"}, 404: {"description": "Servicio no encontrado"}},
    dependencies=[Depends(require_roles("Administrador"))],
)
def service_update(item_id: int, data: Actualizacion, db: Session = Depends(get_db)):
    item = db.get(Servicio, item_id)
    if not item:
        raise RecursoNoEncontrado("Servicio", item_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        if key in {"nombre", "descripcion", "precio", "duracion", "estado"}:
            setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return {"message": "Servicio actualizado exitosamente.", "servicio": vars_to_dict(item)}


@services.delete(
    "/{item_id}",
    summary="Desactivar un servicio",
    status_code=204,
    responses={204: {"description": "Servicio desactivado"}, 404: {"description": "Servicio no encontrado"}},
    dependencies=[Depends(require_roles("Administrador"))],
)
def service_remove(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Servicio, item_id)
    if not item:
        raise RecursoNoEncontrado("Servicio", item_id)
    item.estado = "inactivo"
    db.commit()
    return Response(status_code=204)


def vars_to_dict(item):
    return {key: value for key, value in vars(item).items() if not key.startswith("_")}
