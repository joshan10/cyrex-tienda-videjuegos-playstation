from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import current_user, optional_current_user
from app.models.entities import ConversacionChat, MensajeChat, Producto, Servicio
from app.schemas.chatbot import ChatHistorialRespuesta, ChatMensajeEntrada, ChatMensajeHistorial, ChatMensajeRespuesta
from app.services.chatbot import generate_response

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


@router.post("/message", response_model=ChatMensajeRespuesta)
async def send_message(data: ChatMensajeEntrada, user: dict | None = Depends(optional_current_user), db: Session = Depends(get_db)):
    conversation = db.get(ConversacionChat, data.conversacion_id) if data.conversacion_id and user else None
    if conversation and conversation.usuario_id != user["id"]:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    if not conversation and user:
        conversation = ConversacionChat(usuario_id=user["id"])
        db.add(conversation)
        db.flush()

    history_rows = []
    if conversation:
        history_rows = db.scalars(
            select(MensajeChat).where(MensajeChat.conversacion_id == conversation.id).order_by(MensajeChat.created_at)
        ).all()
    history = [{"role": row.rol, "content": row.contenido} for row in history_rows][-12:]
    if conversation:
        db.add(MensajeChat(conversacion_id=conversation.id, rol="user", contenido=data.mensaje))
    products = db.scalars(select(Producto).where(Producto.estado == "activo").order_by(Producto.nombre)).all()
    services = db.scalars(select(Servicio).where(Servicio.estado == "activo").order_by(Servicio.nombre)).all()
    catalog_context = "\n".join(
        [
            *(f"Producto: {item.nombre} | plataforma: {item.plataforma or 'N/A'} | precio: {item.precio} COP | stock: {item.stock}" for item in products),
            *(f"Servicio: {item.nombre} | precio: {item.precio} COP | duración: {item.duracion or 'N/A'}" for item in services),
        ]
    )
    reply, provider = await generate_response(history, data.mensaje, catalog_context)
    if conversation:
        db.add(MensajeChat(conversacion_id=conversation.id, rol="assistant", contenido=reply))
        db.commit()
    return {"conversacion_id": conversation.id if conversation else None, "respuesta": reply, "proveedor": provider}


@router.get("/{conversation_id}", response_model=ChatHistorialRespuesta)
def get_history(conversation_id: int, user: dict = Depends(current_user), db: Session = Depends(get_db)):
    conversation = db.get(ConversacionChat, conversation_id)
    if not conversation or conversation.usuario_id != user["id"]:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    messages = db.scalars(
        select(MensajeChat).where(MensajeChat.conversacion_id == conversation_id).order_by(MensajeChat.created_at)
    ).all()
    return {"conversacion_id": conversation_id, "mensajes": [ChatMensajeHistorial.model_validate(message) for message in messages]}