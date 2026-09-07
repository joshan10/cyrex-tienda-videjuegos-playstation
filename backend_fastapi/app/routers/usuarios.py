from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password
from app.crud.resources import user_view
from app.dependencies import current_user, require_roles
from app.models.entities import Usuario
from app.models.roles import Rol
from app.schemas.common import Actualizacion, RegistroUsuario

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("")
def get_all(_: dict = Depends(require_roles("Administrador")), db: Session = Depends(get_db)):
    users = db.scalars(select(Usuario).order_by(Usuario.created_at.desc())).all()
    return {"usuarios": [user_view(db, user) for user in users]}


@router.get("/{user_id}")
def get_by_id(user_id: int, _: dict = Depends(current_user), db: Session = Depends(get_db)):
    user = db.get(Usuario, user_id)
    if not user:
        raise HTTPException(404, "Usuario no encontrado.")
    return {"usuario": user_view(db, user)}


@router.post("", status_code=201)
def create(data: RegistroUsuario, _: dict = Depends(require_roles("Administrador")), db: Session = Depends(get_db)):
    if db.scalar(select(Usuario).where((Usuario.correo == data.correo) | (Usuario.numero_documento == data.numero_documento))):
        raise HTTPException(409, "Ya existe un usuario con este correo o documento.")
    values = data.model_dump(exclude={"password"})
    values["password"] = hash_password(data.password)
    values["rol_id"] = data.rol_id or 3
    user = Usuario(**values)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "Usuario creado exitosamente.", "usuario": user_view(db, user)}


@router.put("/{user_id}")
def update(user_id: int, data: Actualizacion, _: dict = Depends(require_roles("Administrador")), db: Session = Depends(get_db)):
    user = db.get(Usuario, user_id)
    if not user:
        raise HTTPException(404, "Usuario no encontrado.")
    values = data.model_dump(exclude_unset=True)
    if "password" in values:
        values["password"] = hash_password(values["password"])
    allowed = {"nombre", "apellido", "tipo_documento", "numero_documento", "direccion", "telefono", "correo", "password", "estado", "rol_id"}
    for key, value in values.items():
        if key in allowed:
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return {"message": "Usuario actualizado exitosamente.", "usuario": user_view(db, user)}


@router.delete("/{user_id}")
def remove(user_id: int, _: dict = Depends(require_roles("Administrador")), db: Session = Depends(get_db)):
    user = db.get(Usuario, user_id)
    if not user:
        raise HTTPException(404, "Usuario no encontrado.")
    user.estado = "inactivo"
    db.commit()
    db.refresh(user)
    return {"message": "Usuario desactivado exitosamente (soft delete).", "usuario": user_view(db, user)}
