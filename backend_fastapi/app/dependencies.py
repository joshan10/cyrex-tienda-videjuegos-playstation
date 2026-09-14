from fastapi import Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import JWTError, decode_token
from app.exceptions import AccesoDenegado, CuentaInactiva, RecursoNoEncontrado, TokenInvalido
from app.models.entities import Producto, Usuario
from app.models.roles import Rol


def current_user(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise TokenInvalido("Acceso denegado. Token no proporcionado.")
    try:
        payload = decode_token(authorization.split(" ", 1)[1])
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
