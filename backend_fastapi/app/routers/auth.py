import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_token, hash_password, verify_password
from app.crud.resources import permissions, user_view
from app.dependencies import current_user
from app.models.entities import Usuario, PasswordResetToken
from app.models.roles import Rol
from app.schemas.common import Login, RegistroUsuario, ForgotPassword, ResetPassword

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
        # Prevent user enumeration by returning success anyway
        return {"message": "Si el correo está registrado, se enviarán instrucciones."}
    
    # Generate token
    token = str(uuid.uuid4())
    expires = datetime.now(timezone.utc) + timedelta(hours=1)
    
    reset_token = PasswordResetToken(
        usuario_id=user.id,
        token=token,
        expires_at=expires.replace(tzinfo=None)
    )
    db.add(reset_token)
    db.commit()
    
    # In a real app, send email here. For development, return token.
    return {
        "message": "Si el correo está registrado, se enviarán instrucciones.",
        "dev_token": token
    }


@router.post("/reset-password")
def reset_password(data: ResetPassword, db: Session = Depends(get_db)):
    # Find active token
    reset_token = db.scalar(
        select(PasswordResetToken).where(
            PasswordResetToken.token == data.token,
            PasswordResetToken.used == False
        )
    )
    
    if not reset_token:
        raise HTTPException(400, "Token inválido o ya utilizado.")
        
    if reset_token.expires_at < datetime.now():
        raise HTTPException(400, "El token ha expirado.")
        
    # Find user and update password
    user = db.get(Usuario, reset_token.usuario_id)
    if not user:
        raise HTTPException(404, "Usuario no encontrado.")
        
    user.password = hash_password(data.password)
    reset_token.used = True
    db.commit()
    
    return {"message": "Contraseña actualizada exitosamente."}
