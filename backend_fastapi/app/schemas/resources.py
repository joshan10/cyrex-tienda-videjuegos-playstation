from pydantic import Field
from app.schemas.common import APIModel


class CategoriaEntrada(APIModel):
    nombre: str
    descripcion: str | None = None
    imagen_url: str | None = None


class ServicioEntrada(APIModel):
    nombre: str
    descripcion: str | None = None
    precio: float = Field(ge=0)
    duracion: str | None = None


class Stats(APIModel):
    pass
