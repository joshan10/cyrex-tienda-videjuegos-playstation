from fastapi import APIRouter, Depends, Response
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password
from app.crud.resources import get_all_users, count_users, user_view
from app.dependencies import get_usuario_by_id, require_roles
from app.exceptions import ConflictoNegocio
from app.models.entities import Usuario
from app.pagination import Paginacion, get_paginacion, paginate_query
from app.schemas.common import Actualizacion, CambiarEstado, RegistroUsuario

router = APIRouter(
    prefix="/usuarios",
    tags=["usuarios"],
    dependencies=[Depends(require_roles("Administrador"))],
)


@router.get(
    "",
    summary="Listar todos los usuarios",
    responses={200: {"description": "Lista paginada de usuarios"}, 401: {"description": "No autenticado"}, 403: {"description": "Acceso denegado"}},
)
def get_all(paginacion: Paginacion = Depends(get_paginacion), db: Session = Depends(get_db)):
    total = count_users(db)
    users = get_all_users(db)
    paginated = users[paginacion.skip : paginacion.skip + paginacion.size]
    return {
        "items": [user_view(db, u) for u in paginated],
        **paginate_query(total, paginacion),
    }


@router.get(
    "/{user_id}",
    summary="Obtener usuario por ID",
    responses={200: {"description": "Usuario encontrado"}, 404: {"description": "Usuario no encontrado"}},
)
def get_by_id(usuario: Usuario = Depends(get_usuario_by_id), db: Session = Depends(get_db)):
    return user_view(db, usuario)


@router.post(
    "",
    summary="Crear un nuevo usuario",
    status_code=201,
    responses={201: {"description": "Usuario creado"}, 409: {"description": "Correo o documento duplicado"}},
)
def create(data: RegistroUsuario, db: Session = Depends(get_db)):
    if db.scalar(select(Usuario).where((Usuario.correo == data.correo) | (Usuario.numero_documento == data.numero_documento))):
        raise ConflictoNegocio("Ya existe un usuario con este correo o documento.")
    values = data.model_dump(exclude={"password"})
    values["password"] = hash_password(data.password)
    values["rol_id"] = data.rol_id or 3
    user = Usuario(**values)
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise ConflictoNegocio("Ya existe un usuario con esos datos.")
    return user_view(db, user)


@router.put(
    "/{user_id}",
    summary="Actualizar un usuario existente",
    responses={200: {"description": "Usuario actualizado"}, 404: {"description": "Usuario no encontrado"}},
)
def update(
    usuario: Usuario = Depends(get_usuario_by_id),
    data: Actualizacion = ...,
    db: Session = Depends(get_db),
):
    values = data.model_dump(exclude_unset=True)
    if "password" in values:
        values["password"] = hash_password(values["password"])
    allowed = {"nombre", "apellido", "tipo_documento", "numero_documento", "direccion", "telefono", "correo", "password", "estado", "rol_id"}
    for key, value in values.items():
        if key in allowed:
            setattr(usuario, key, value)
    db.commit()
    db.refresh(usuario)
    return user_view(db, usuario)


@router.patch(
    "/{user_id}/estado",
    summary="Cambiar estado de un usuario (activar/desactivar)",
    responses={200: {"description": "Estado actualizado"}, 404: {"description": "Usuario no encontrado"}},
)
def change_status(
    usuario: Usuario = Depends(get_usuario_by_id),
    data: CambiarEstado = ...,
    db: Session = Depends(get_db),
):
    usuario.estado = data.estado
    db.commit()
    db.refresh(usuario)
    return user_view(db, usuario)


@router.delete(
    "/{user_id}",
    summary="Eliminar un usuario",
    status_code=204,
    responses={204: {"description": "Usuario eliminado"}, 404: {"description": "Usuario no encontrado"}},
)
def remove(usuario: Usuario = Depends(get_usuario_by_id), db: Session = Depends(get_db)):
    db.delete(usuario)
    db.commit()
    return Response(status_code=204)
