from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Rol(Base):
    __tablename__ = "roles"
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(50))


class Permiso(Base):
    __tablename__ = "permisos"
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100))


class RolPermiso(Base):
    __tablename__ = "roles_permisos"
    id: Mapped[int] = mapped_column(primary_key=True)
    rol_id: Mapped[int] = mapped_column(Integer)
    permiso_id: Mapped[int] = mapped_column(Integer)
