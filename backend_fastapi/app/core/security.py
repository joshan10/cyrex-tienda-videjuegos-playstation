from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except ValueError:
        return False


def create_token(user_id: int, correo: str, rol_id: int, rol_nombre: str) -> str:
    expires = datetime.now(timezone.utc) + _expiry(settings.jwt_expires_in)
    return jwt.encode({"id": user_id, "correo": correo, "rol_id": rol_id, "rol_nombre": rol_nombre, "exp": expires}, settings.jwt_secret, algorithm="HS256")


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])


def _expiry(value: str) -> timedelta:
    units = {"s": "seconds", "m": "minutes", "h": "hours", "d": "days"}
    amount, unit = int(value[:-1]), value[-1].lower()
    return timedelta(**{units.get(unit, "hours"): amount})


__all__ = ["JWTError", "create_token", "decode_token", "hash_password", "verify_password"]
