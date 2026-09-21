from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import JWTError, decode_token
from app.exceptions import AccesoDenegado, CuentaInactiva, RecursoNoEncontrado, TokenInvalido
from app.models.entities import Producto, Usuario
from app.models.roles import Rol

bearer_scheme = HTTPBearer(auto_error=False)


def optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> dict | None:
    """Returns the authenticated user when a valid bearer token is present."""
    if not credentials:
        return None
    try:
        payload = decode_token(credentials.credentials)
        user_id = payload.get("id")
        if not user_id:
            return None
    except (JWTError, ValueError, IndexError):
        return None
    row = db.execute(
        select(Usuario, Rol.nombre)
        .join(Rol, Usuario.rol_id == Rol.id)
        .where(Usuario.id == user_id)
    ).first()
    if not row or row[0].estado == "inactivo":
        return None
    user, role = row
    return {"id": user.id, "nombre": user.nombre, "apellido": user.apellido, "correo": user.correo, "rol_id": user.rol_id, "rol_nombre": role}


def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> dict:
    if not credentials:
        raise TokenInvalido("Acceso denegado. Token no proporcionado.")
    try:
        payload = decode_token(credentials.credentials)
        user_id = payload.get("id")
        if not user_id:
            raise ValueError
    except (JWTError, ValueError, IndexError):
        raise TokenInvalido("Token inválido.")
    row = db.execute(
        select(Usuario, Rol.nombre)
        .join(Rol, Usuario.rol_id == Rol.id)
        .where(Usuario.id == user_id)
    ).first()
    if not row:
        raise TokenInvalido("Token inválido. Usuario no encontrado.")
    user, role = row
    if user.estado == "inactivo":
        raise CuentaInactiva()
    return {"id": user.id, "nombre": user.nombre, "apellido": user.apellido, "correo": user.correo, "rol_id": user.rol_id, "rol_nombre": role}


def require_roles(*roles: str):
    def dependency(user: dict = Depends(current_user)) -> dict:
        if user["rol_nombre"] not in roles:
            raise AccesoDenegado(list(roles))
        return user
    return dependency


def get_producto_by_id(product_id: int, db: Session = Depends(get_db)) -> Producto:
    producto = db.get(Producto, product_id)
    if not producto:
        raise RecursoNoEncontrado("Producto", product_id)
    return producto


def get_usuario_by_id(user_id: int, db: Session = Depends(get_db)) -> Usuario:
    usuario = db.get(Usuario, user_id)
    if not usuario:
        raise RecursoNoEncontrado("Usuario", user_id)
    return usuario
