import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.dependencies import current_user, require_roles
from app.exceptions import RecursoNoEncontrado
from app.models.entities import Orden, Pago
from app.schemas.pagos import CrearPagoStripe, PagoRespuesta, SimularPagoExitoso
from app.services.stripe_service import crear_checkout_session, generar_reference, obtener_sesion_checkout

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/pagos", tags=["pagos"])


@router.post(
    "",
    summary="Crear sesión de pago en Stripe",
    status_code=201,
    responses={201: {"description": "Sesión creada"}, 404: {"description": "Orden no encontrada"}},
)
def create_pago(
    data: CrearPagoStripe,
    user: dict = Depends(require_roles("Cliente")),
    db: Session = Depends(get_db),
):
    order = db.get(Orden, data.orden_id)
    if not order:
        raise RecursoNoEncontrado("Orden", data.orden_id)
    if order.usuario_id != user["id"]:
        raise HTTPException(403, "No tienes acceso a esta orden.")

    reference = generar_reference()
    amount_in_cents = int(order.total * 100)

    try:
        session_data = crear_checkout_session(
            orden_id=order.id,
            customer_email=data.customer_email,
            amount_in_cents=amount_in_cents,
            currency=data.currency,
            reference=reference,
        )
    except Exception as e:
        logger.error("Error creating Stripe session: %s", e)
        raise HTTPException(500, "Error al crear la sesión de pago.")

    pago = Pago(
        orden_id=order.id,
        stripe_session_id=session_data["session_id"],
        reference=reference,
        amount_in_cents=amount_in_cents,
        currency=data.currency,
        status="pending",
        payment_method_type="card",
        customer_email=data.customer_email,
        stripe_response=json.dumps(session_data),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(pago)
    db.commit()
    db.refresh(pago)

    return {
        "message": "Sesión de pago creada.",
        "checkout_url": session_data["url"],
        "pago": PagoRespuesta(
            id=pago.id,
            orden_id=pago.orden_id,
            stripe_session_id=pago.stripe_session_id,
            reference=pago.reference,
            amount_in_cents=pago.amount_in_cents,
            currency=pago.currency,
            status=pago.status,
            payment_method_type=pago.payment_method_type,
            customer_email=pago.customer_email,
            checkout_url=session_data["url"],
            created_at=pago.created_at,
        ).model_dump(),
    }


@router.get(
    "/orden/{orden_id}",
    summary="Consultar pagos de una orden",
    responses={200: {"description": "Lista de pagos"}},
)
def get_pagos_by_orden(
    orden_id: int,
    user: dict = Depends(current_user),
    db: Session = Depends(get_db),
):
    order = db.get(Orden, orden_id)
    if not order:
        raise RecursoNoEncontrado("Orden", orden_id)
    if user["rol_nombre"] == "Cliente" and order.usuario_id != user["id"]:
        raise HTTPException(403, "No tienes acceso a esta orden.")

    pagos = db.query(Pago).filter(Pago.orden_id == orden_id).order_by(Pago.created_at.desc()).all()
    return {
        "items": [
            PagoRespuesta(
                id=p.id,
                orden_id=p.orden_id,
                stripe_session_id=p.stripe_session_id,
                reference=p.reference,
                amount_in_cents=p.amount_in_cents,
                currency=p.currency,
                status=p.status,
                payment_method_type=p.payment_method_type,
                customer_email=p.customer_email,
                created_at=p.created_at,
            ).model_dump()
            for p in pagos
        ]
    }


@router.get(
    "/{pago_id}",
    summary="Consultar estado de un pago",
    responses={200: {"description": "Pago encontrado"}, 404: {"description": "Pago no encontrado"}},
)
def get_pago(
    pago_id: int,
    user: dict = Depends(current_user),
    db: Session = Depends(get_db),
):
    pago = db.get(Pago, pago_id)
    if not pago:
        raise RecursoNoEncontrado("Pago", pago_id)
    if user["rol_nombre"] == "Cliente" and pago.customer_email != user["correo"]:
        raise HTTPException(403, "No tienes acceso a este pago.")
    return PagoRespuesta(
        id=pago.id,
        orden_id=pago.orden_id,
        stripe_session_id=pago.stripe_session_id,
        reference=pago.reference,
        amount_in_cents=pago.amount_in_cents,
        currency=pago.currency,
        status=pago.status,
        payment_method_type=pago.payment_method_type,
        customer_email=pago.customer_email,
        created_at=pago.created_at,
    ).model_dump()


@router.post(
    "/webhook",
    summary="Webhook de notificaciones de Stripe",
    include_in_schema=False,
)
async def webhook(
    request: Request,
    stripe_signature: str = Header(alias="stripe-signature"),
    db: Session = Depends(get_db),
):
    body = await request.body()

    if not settings.stripe_webhook_secret:
        logger.warning("Stripe webhook secret not configured, skipping signature verification")

    try:
        from app.services.stripe_service import verificar_webhook
        event = verificar_webhook(body, stripe_signature)
    except Exception as e:
        logger.warning("Invalid webhook signature: %s", e)
        raise HTTPException(401, "Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        reference = session.get("metadata", {}).get("reference")
        stripe_session_id = session.get("id")

        pago = db.query(Pago).filter(Pago.reference == reference).first()
        if not pago:
            pago = db.query(Pago).filter(Pago.stripe_session_id == stripe_session_id).first()

        if pago:
            pago.status = "paid"
            pago.stripe_response = json.dumps(session)
            pago.updated_at = datetime.now(timezone.utc)

            order = db.get(Orden, pago.orden_id)
            if order:
                order.estado = "procesando"

            db.commit()
            logger.info("Pago %s marked as paid via webhook", pago.reference)

    elif event["type"] == "checkout.session.expired":
        session = event["data"]["object"]
        reference = session.get("metadata", {}).get("reference")

        pago = db.query(Pago).filter(Pago.reference == reference).first()
        if pago:
            pago.status = "expired"
            pago.updated_at = datetime.now(timezone.utc)
            db.commit()
            logger.info("Pago %s marked as expired via webhook", pago.reference)

    elif event["type"] == "payment_intent.payment_failed":
        session = event["data"]["object"]
        logger.warning("Payment failed: %s", session.get("id"))

    return {"received": True}


@router.post(
    "/simular-exito",
    summary="Simular pago exitoso (solo para pruebas sin webhook)",
    responses={200: {"description": "Pago marcado como exitoso"}},
)
def simular_pago_exitoso(data: SimularPagoExitoso, db: Session = Depends(get_db)):
    pago = db.query(Pago).filter(Pago.stripe_session_id == data.session_id).first()
    if not pago:
        pago = db.query(Pago).filter(Pago.reference == data.session_id).first()
    if not pago:
        raise RecursoNoEncontrado("Pago", 0)

    pago.status = "paid"
    pago.updated_at = datetime.now(timezone.utc)

    order = db.get(Orden, pago.orden_id)
    if order:
        order.estado = "procesando"

    db.commit()

    return {
        "message": "Pago marcado como exitoso.",
        "pago": PagoRespuesta(
            id=pago.id,
            orden_id=pago.orden_id,
            stripe_session_id=pago.stripe_session_id,
            reference=pago.reference,
            amount_in_cents=pago.amount_in_cents,
            currency=pago.currency,
            status=pago.status,
            payment_method_type=pago.payment_method_type,
            customer_email=pago.customer_email,
            created_at=pago.created_at,
        ).model_dump(),
    }
