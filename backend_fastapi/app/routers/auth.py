import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_token, hash_password, verify_password
from app.crud.resources import permissions, user_view
from app.dependencies import current_user
from app.models.entities import PasswordResetToken, Usuario
from app.models.roles import Rol
from app.schemas.common import ForgotPassword, Login, RegistroUsuario, ResetPassword

router = APIRouter(prefix="/auth", tags=["auth"])


def find_user(db: Session, email: str):
    return db.scalar(select(Usuario).where(Usuario.correo == email))


def token_for(db: Session, user: Usuario) -> str:
    role = db.scalar(select(Rol.nombre).where(Rol.id == user.rol_id))
    return create_token(user.id, user.correo, user.rol_id, role)


@router.post("/register", status_code=201)
def register(data: RegistroUsuario, db: Session = Depends(get_db)):
    if find_user(db, data.correo):
        raise HTTPException(409, "Ya existe un usuario con este correo electrónico.")
    if db.scalar(select(Usuario).where(Usuario.numero_documento == data.numero_documento)):
        raise HTTPException(409, "Ya existe un usuario con este número de documento.")
    values = data.model_dump(exclude={"rol_id", "password"})
    user = Usuario(**values, password=hash_password(data.password), rol_id=3)
    db.add(user)
    db.commit()
    db.refresh(user)
    role = db.scalar(select(Rol.nombre).where(Rol.id == user.rol_id))
    return {"message": "Usuario registrado exitosamente.", "token": token_for(db, user), "user": {"id": user.id, "nombre": user.nombre, "apellido": user.apellido, "correo": user.correo, "rol": role}}


@router.post("/login")
def login(data: Login, db: Session = Depends(get_db)):
    user = find_user(db, data.correo)
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(401, "Credenciales incorrectas.")
    if user.estado == "inactivo":
        raise HTTPException(403, "Tu cuenta está desactivada. Contacta al administrador.")
    role = db.scalar(select(Rol.nombre).where(Rol.id == user.rol_id))
    view = user_view(db, user)
    view.update({"rol": role, "permisos": permissions(db, user.rol_id)})
    view.pop("rol_nombre", None)
    return {"message": "Inicio de sesión exitoso.", "token": token_for(db, user), "user": view}


@router.get("/me")
def profile(user: dict = Depends(current_user), db: Session = Depends(get_db)):
    entity = db.get(Usuario, user["id"])
    view = user_view(db, entity)
    view.update({"rol": view.pop("rol_nombre"), "permisos": permissions(db, entity.rol_id)})
    return {"user": view}


@router.post("/forgot-password")
def forgot_password(data: ForgotPassword, db: Session = Depends(get_db)):
    user = find_user(db, data.correo)
    if not user:
        return {"message": "Si el correo existe, se han enviado instrucciones de recuperación."}
    
    token = secrets.token_urlsafe(32)
    reset_token = PasswordResetToken(
        usuario_id=user.id,
        token=token,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        used=False,
        created_at=datetime.now(timezone.utc)
    )
    db.add(reset_token)
    db.commit()
    
    return {
        "message": "Si el correo existe, se han enviado instrucciones de recuperación.",
        "dev_token": token
    }


@router.post("/reset-password")
def reset_password(data: ResetPassword, db: Session = Depends(get_db)):
    reset_entry = db.scalar(
        select(PasswordResetToken).where(
            PasswordResetToken.token == data.token,
            PasswordResetToken.used == False
        )
    )
    
    if not reset_entry:
        raise HTTPException(400, "Token inválido o ya utilizado.")
    
    if reset_entry.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(400, "El token ha expirado.")
    
    user = db.get(Usuario, reset_entry.usuario_id)
    if not user:
        raise HTTPException(404, "Usuario no encontrado.")
    
    user.password = hash_password(data.password)
    reset_entry.used = True
    db.commit()
    
    return {"message": "Contraseña actualizada exitosamente."}
