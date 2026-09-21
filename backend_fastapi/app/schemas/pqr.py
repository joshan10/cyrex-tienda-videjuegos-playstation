from datetime import datetime

from pydantic import Field

from app.schemas.common import APIModel


class PQREntrada(APIModel):
    tipo: str = Field(pattern=r"^(peticion|queja|reclamo)$")
    asunto: str = Field(min_length=3, max_length=200)
    descripcion: str = Field(min_length=10, max_length=5000)


class PQRActualizar(APIModel):
    estado: str | None = Field(default=None, pattern=r"^(pendiente|en_proceso|respondida|cerrada)$")
    respuesta: str | None = Field(default=None, max_length=5000)


class PQRRespuesta(APIModel):
    id: int
    usuario_id: int
    tipo: str
    asunto: str
    descripcion: str
    estado: str
    respuesta: str | None = None
    fecha_creacion: datetime
    fecha_respuesta: datetime | None = None


class PQRResumen(APIModel):
    total: int
    pendientes: int