from fastapi import APIRouter, Depends, Response
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.resources import get_products_with_filters, count_products_with_filters, product_view
from app.dependencies import get_producto_by_id, require_roles
from app.exceptions import ConflictoNegocio
from app.models.entities import Producto
from app.pagination import Paginacion, get_paginacion, paginate_query
from app.schemas.common import CambiarEstado, ProductoEntrada, ProductoUpdate

router = APIRouter(
    prefix="/productos",
    tags=["productos"],
)


@router.get(
    "",
    summary="Listar productos con filtros y paginación",
    responses={200: {"description": "Lista paginada de productos"}, 401: {"description": "No autenticado"}, 403: {"description": "Acceso denegado"}},
)
def get_all(
    estado: str | None = None,
    categoria_id: int | None = None,
    plataforma: str | None = None,
    search: str | None = None,
    paginacion: Paginacion = Depends(get_paginacion),
    db: Session = Depends(get_db),
):
    total = count_products_with_filters(db, estado, categoria_id, plataforma, search)
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
    products = list(db.scalars(
        query.order_by(Producto.created_at.desc())
        .offset(paginacion.skip)
        .limit(paginacion.size)
    ).all())
    return {
        "items": [product_view(db, p) for p in products],
        **paginate_query(total, paginacion),
    }


@router.get(
    "/{product_id}",
    summary="Obtener producto por ID",
    responses={200: {"description": "Producto encontrado"}, 404: {"description": "Producto no encontrado"}},
)
def get_by_id(product: Producto = Depends(get_producto_by_id), db: Session = Depends(get_db)):
    return product_view(db, product)


@router.post(
    "",
    summary="Crear un nuevo producto",
    status_code=201,
    responses={201: {"description": "Producto creado"}, 409: {"description": "Conflicto de datos"}},
)
def create(data: ProductoEntrada, _: dict = Depends(require_roles("Administrador")), db: Session = Depends(get_db)):
    product = Producto(**data.model_dump())
    db.add(product)
    try:
        db.commit()
        db.refresh(product)
    except IntegrityError:
        db.rollback()
        raise ConflictoNegocio("Ya existe un producto con esos datos.")
    return product_view(db, product)


@router.put(
    "/{product_id}",
    summary="Actualizar un producto existente",
    responses={200: {"description": "Producto actualizado"}, 404: {"description": "Producto no encontrado"}},
)
def update(
    product: Producto = Depends(get_producto_by_id),
    data: ProductoUpdate = ...,
    _: dict = Depends(require_roles("Administrador", "Empleado")),
    db: Session = Depends(get_db),
):
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product_view(db, product)


@router.patch(
    "/{product_id}/estado",
    summary="Cambiar estado de un producto (activar/desactivar)",
    responses={200: {"description": "Estado actualizado"}, 404: {"description": "Producto no encontrado"}},
)
def change_status(
    product: Producto = Depends(get_producto_by_id),
    data: CambiarEstado = ...,
    _: dict = Depends(require_roles("Administrador")),
    db: Session = Depends(get_db),
):
    product.estado = data.estado
    db.commit()
    db.refresh(product)
    return product_view(db, product)


@router.delete(
    "/{product_id}",
    summary="Eliminar un producto",
    status_code=204,
    responses={204: {"description": "Producto eliminado"}, 404: {"description": "Producto no encontrado"}},
)
def remove(
    product: Producto = Depends(get_producto_by_id),
    _: dict = Depends(require_roles("Administrador")),
    db: Session = Depends(get_db),
):
    db.delete(product)
    db.commit()
    return Response(status_code=204)
