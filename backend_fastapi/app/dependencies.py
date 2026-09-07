from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import JWTError, decode_token
from app.models.entities import Usuario
from app.models.roles import Rol


def current_user(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Acceso denegado. Token no proporcionado.")
    try:
        payload = decode_token(authorization.split(" ", 1)[1])
        user_id = payload.get("id")
        if not user_id:
            raise ValueError
    except (JWTError, ValueError, IndexError):
        raise HTTPException(status_code=401, detail="Token inválido.")
    row = db.execute(select(Usuario, Rol.nombre).join(Rol, Usuario.rol_id == Rol.id).where(Usuario.id == user_id)).first()
    if not row:
        raise HTTPException(status_code=401, detail="Token inválido. Usuario no encontrado.")
    user, role = row
    if user.estado == "inactivo":
        raise HTTPException(status_code=403, detail="Cuenta desactivada. Contacta al administrador.")
    return {"id": user.id, "nombre": user.nombre, "apellido": user.apellido, "correo": user.correo, "rol_id": user.rol_id, "rol_nombre": role}


def require_roles(*roles: str):
    def dependency(user: dict = Depends(current_user)) -> dict:
        if user["rol_nombre"] not in roles:
            raise HTTPException(status_code=403, detail=f"Acceso denegado. Se requiere rol: {' o '.join(roles)}")
        return user
    return dependency
