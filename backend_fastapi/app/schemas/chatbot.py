from datetime import datetime

from pydantic import Field

from app.schemas.common import APIModel


class ChatMensajeEntrada(APIModel):
    conversacion_id: int | None = Field(default=None, ge=1)
    mensaje: str = Field(min_length=1, max_length=2000)


class ChatMensajeRespuesta(APIModel):
    conversacion_id: int | None = None
    respuesta: str
    proveedor: str


class ChatMensajeHistorial(APIModel):
    id: int
    rol: str
    contenido: str
    created_at: datetime


class ChatHistorialRespuesta(APIModel):
    conversacion_id: int
    mensajes: list[ChatMensajeHistorial]