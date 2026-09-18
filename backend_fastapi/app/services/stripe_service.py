import json
import logging
import stripe

from app.core.config import settings

logger = logging.getLogger(__name__)

stripe.api_key = settings.stripe_secret_key


def crear_checkout_session(
    orden_id: int,
    customer_email: str,
    amount_in_cents: int,
    currency: str,
    reference: str,
) -> dict:
    """
    Crea una sesión de Checkout en Stripe y retorna la URL de pago.
    """
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[
            {
                "price_data": {
                    "currency": currency,
                    "product_data": {
                        "name": f"Orden #{orden_id} — SYREX",
                        "description": f"Referencia: {reference}",
                    },
                    "unit_amount": amount_in_cents,
                },
                "quantity": 1,
            }
        ],
        mode="payment",
        success_url=f"{settings.frontend_url}/pago-exitoso?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{settings.frontend_url}/pago-cancelado",
        customer_email=customer_email,
        metadata={
            "orden_id": str(orden_id),
            "reference": reference,
        },
    )
    return {
        "session_id": session.id,
        "url": session.url,
        "payment_status": session.payment_status,
    }


def verificar_webhook(payload: bytes, sig_header: str) -> dict:
    """
    Verifica la firma del webhook de Stripe y retorna el evento.
    """
    event = stripe.Webhook.construct_event(
        payload, sig_header, settings.stripe_webhook_secret
    )
    return event


def obtener_sesion_checkout(session_id: str) -> dict:
    """
    Obtiene los datos de una sesión de Checkout de Stripe.
    """
    session = stripe.checkout.Session.retrieve(session_id)
    return {
        "id": session.id,
        "payment_status": session.payment_status,
        "status": session.status,
        "amount_total": session.amount_total,
        "currency": session.currency,
        "customer_email": session.customer_details.email if session.customer_details else None,
        "metadata": session.metadata,
        "payment_intent": session.payment_intent,
    }


def generar_reference() -> str:
    """
    Genera una referencia única para el pago.
    """
    import time
    import random
    ts = int(time.time())
    rand = random.randint(1000, 9999)
    return f"ORD-{ts}-{rand}"
