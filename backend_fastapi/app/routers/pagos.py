import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.dependencies import current_user, require_roles
from app.exceptions import RecursoNoEncontrado
from app.models.entities import Orden, Pago
from app.schemas.wompi import PagoEntrada, PagoRespuesta, SimularPagoEntrada, WompiWebhookPayload
from app.services.wompi import create_transaction, generate_reference, get_transaction_status, verify_webhook_signature

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/pagos", tags=["pagos"])


@router.post(
    "",
    summary="Crear un pago para una orden",
    status_code=201,
    responses={201: {"description": "Pago creado"}, 404: {"description": "Orden no encontrada"}},
)
async def create_pago(data: PagoEntrada, user: dict = Depends(require_roles("Cliente")), db: Session = Depends(get_db)):
    order = db.get(Orden, data.orden_id)
    if not order:
        raise RecursoNoEncontrado("Orden", data.orden_id)
    if order.usuario_id != user["id"]:
        from fastapi import HTTPException
        raise HTTPException(403, "No tienes acceso a esta orden.")

    reference = generate_reference()
    amount_in_cents = int(order.total * 100)

    wompi_response = await create_transaction(
        reference=reference,
        amount_in_cents=amount_in_cents,
        customer_email=data.customer_email,
        payment_method_type=data.payment_method_type,
        token=data.token,
        installments=data.installments,
    )

    transaction_data = wompi_response.get("data", {})
    wompi_transaction_id = transaction_data.get("id")

    pago = Pago(
        orden_id=order.id,
        wompi_transaction_id=wompi_transaction_id,
        reference=reference,
        amount_in_cents=amount_in_cents,
        currency="COP",
        status="PENDING",
        payment_method_type=data.payment_method_type,
        customer_email=data.customer_email,
        wompi_response=json.dumps(wompi_response),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(pago)
    db.commit()
    db.refresh(pago)

    checkout_url = None
    if settings.wompi_mock_mode:
        checkout_url = f"{settings.frontend_url}/pagos/checkout/{reference}"

    return {
        "message": "Pago creado exitosamente.",
        "pago": PagoRespuesta(
            id=pago.id,
            orden_id=pago.orden_id,
            wompi_transaction_id=pago.wompi_transaction_id,
            reference=pago.reference,
            amount_in_cents=pago.amount_in_cents,
            currency=pago.currency,
            status=pago.status,
            payment_method_type=pago.payment_method_type,
            customer_email=pago.customer_email,
            checkout_url=checkout_url,
            wompi_response=transaction_data,
        ).model_dump(),
    }


@router.get(
    "/{pago_id}",
    summary="Consultar estado de un pago",
    responses={200: {"description": "Pago encontrado"}, 404: {"description": "Pago no encontrado"}},
)
def get_pago(pago_id: int, user: dict = Depends(current_user), db: Session = Depends(get_db)):
    pago = db.get(Pago, pago_id)
    if not pago:
        raise RecursoNoEncontrado("Pago", pago_id)
    if user["rol_nombre"] == "Cliente" and pago.customer_email != user["correo"]:
        from fastapi import HTTPException
        raise HTTPException(403, "No tienes acceso a este pago.")
    return PagoRespuesta(
        id=pago.id,
        orden_id=pago.orden_id,
        wompi_transaction_id=pago.wompi_transaction_id,
        reference=pago.reference,
        amount_in_cents=pago.amount_in_cents,
        currency=pago.currency,
        status=pago.status,
        payment_method_type=pago.payment_method_type,
        customer_email=pago.customer_email,
        wompi_response=json.loads(pago.wompi_response) if pago.wompi_response else None,
    ).model_dump()


@router.get(
    "/orden/{orden_id}",
    summary="Consultar pagos de una orden",
    responses={200: {"description": "Lista de pagos"}},
)
def get_pagos_by_orden(orden_id: int, user: dict = Depends(current_user), db: Session = Depends(get_db)):
    order = db.get(Orden, orden_id)
    if not order:
        raise RecursoNoEncontrado("Orden", orden_id)
    if user["rol_nombre"] == "Cliente" and order.usuario_id != user["id"]:
        from fastapi import HTTPException
        raise HTTPException(403, "No tienes acceso a esta orden.")

    pagos = db.query(Pago).filter(Pago.orden_id == orden_id).order_by(Pago.created_at.desc()).all()
    return {
        "items": [
            PagoRespuesta(
                id=p.id,
                orden_id=p.orden_id,
                wompi_transaction_id=p.wompi_transaction_id,
                reference=p.reference,
                amount_in_cents=p.amount_in_cents,
                currency=p.currency,
                status=p.status,
                payment_method_type=p.payment_method_type,
                customer_email=p.customer_email,
            ).model_dump()
            for p in pagos
        ]
    }


@router.post(
    "/webhook",
    summary="Webhook de notificaciones de Wompi",
    include_in_schema=False,
)
async def webhook(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    logger.info("Webhook received: %s", body)

    event = body.get("event")
    if event != "transaction.updated":
        return {"received": True}

    checksum = request.headers.get("X-Event-Checksum", "")
    if checksum and not verify_webhook_signature(body, checksum):
        logger.warning("Invalid webhook signature")
        from fastapi import HTTPException
        raise HTTPException(401, "Invalid signature")

    transaction = body.get("data", {}).get("transaction", {})
    reference = transaction.get("reference")
    status = transaction.get("status")

    if not reference or not status:
        return {"received": True}

    pago = db.query(Pago).filter(Pago.reference == reference).first()
    if not pago:
        logger.warning("Pago not found for reference: %s", reference)
        return {"received": True}

    pago.status = status
    pago.wompi_transaction_id = transaction.get("id", pago.wompi_transaction_id)
    pago.wompi_response = json.dumps(body)
    pago.updated_at = datetime.now(timezone.utc)

    order = db.get(Orden, pago.orden_id)
    if order:
        if status == "APPROVED":
            order.estado = "procesando"
        elif status in ("DECLINED", "ERROR"):
            order.estado = "cancelada"

    db.commit()
    logger.info("Pago %s updated to status: %s", pago.reference, status)

    return {"received": True}


@router.post(
    "/simular",
    summary="Simular resultado de pago (solo modo mock)",
    responses={200: {"description": "Pago simulado"}},
)
async def simular_pago(data: SimularPagoEntrada, db: Session = Depends(get_db)):
    if not settings.wompi_mock_mode:
        from fastapi import HTTPException
        raise HTTPException(400, "Este endpoint solo está disponible en modo mock.")

    pago = db.query(Pago).filter(Pago.reference == data.reference).first()
    if not pago:
        raise RecursoNoEncontrado("Pago con referencia", 0)

    pago.status = data.status
    pago.updated_at = datetime.now(timezone.utc)

    order = db.get(Orden, pago.orden_id)
    if order:
        if data.status == "APPROVED":
            order.estado = "procesando"
        elif data.status in ("DECLINED", "ERROR"):
            order.estado = "cancelada"

    db.commit()

    return {
        "message": f"Pago simulado con estado: {data.status}",
        "pago": PagoRespuesta(
            id=pago.id,
            orden_id=pago.orden_id,
            wompi_transaction_id=pago.wompi_transaction_id,
            reference=pago.reference,
            amount_in_cents=pago.amount_in_cents,
            currency=pago.currency,
            status=pago.status,
            payment_method_type=pago.payment_method_type,
            customer_email=pago.customer_email,
        ).model_dump(),
    }


@router.get(
    "/checkout/{reference}",
    response_class=HTMLResponse,
    summary="Página mock de checkout (solo modo mock)",
    include_in_schema=False,
)
async def checkout_mock(reference: str, db: Session = Depends(get_db)):
    if not settings.wompi_mock_mode:
        from fastapi import HTTPException
        raise HTTPException(400, "Checkout mock no disponible en modo producción.")

    pago = db.query(Pago).filter(Pago.reference == reference).first()
    if not pago:
        return HTMLResponse("<h1>Pago no encontrado</h1>", status_code=404)

    amount_cop = pago.amount_in_cents / 100

    html = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Wompi Checkout - Mock</title>
        <style>
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{ font-family: 'Segoe UI', sans-serif; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }}
            .checkout {{ background: white; border-radius: 12px; padding: 40px; max-width: 450px; width: 100%; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .header img {{ height: 40px; }}
            .header h1 {{ color: #6C63FF; font-size: 24px; margin-top: 10px; }}
            .header p {{ color: #888; font-size: 12px; }}
            .details {{ background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px; }}
            .details .row {{ display: flex; justify-content: space-between; margin-bottom: 8px; }}
            .details .label {{ color: #666; font-size: 14px; }}
            .details .value {{ color: #333; font-weight: 600; font-size: 14px; }}
            .details .total {{ border-top: 2px solid #6C63FF; padding-top: 10px; margin-top: 10px; }}
            .details .total .value {{ color: #6C63FF; font-size: 20px; }}
            .methods {{ margin-bottom: 20px; }}
            .methods h3 {{ color: #333; margin-bottom: 10px; font-size: 16px; }}
            .method {{ border: 2px solid #e0e0e0; border-radius: 8px; padding: 15px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s; }}
            .method:hover {{ border-color: #6C63FF; background: #f8f7ff; }}
            .method.selected {{ border-color: #6C63FF; background: #f0eeff; }}
            .method-name {{ font-weight: 600; color: #333; }}
            .method-desc {{ color: #888; font-size: 12px; }}
            .actions {{ display: flex; gap: 10px; }}
            .btn {{ flex: 1; padding: 14px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s; }}
            .btn-approve {{ background: #4CAF50; color: white; }}
            .btn-approve:hover {{ background: #43A047; }}
            .btn-decline {{ background: #f44336; color: white; }}
            .btn-decline:hover {{ background: #e53935; }}
            .btn-error {{ background: #FF9800; color: white; }}
            .btn-error:hover {{ background: #FB8C00; }}
            .badge {{ display: inline-block; background: #6C63FF; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; margin-top: 5px; }}
            .result {{ text-align: center; padding: 20px; display: none; }}
            .result h2 {{ margin-bottom: 10px; }}
            .result.approved {{ color: #4CAF50; }}
            .result.declined {{ color: #f44336; }}
            .result.error {{ color: #FF9800; }}
        </style>
    </head>
    <body>
        <div class="checkout">
            <div class="header">
                <h1>Wompi</h1>
                <p>Checkout de Pago (Mock Educativo)</p>
                <span class="badge">MODO SIMULACION</span>
            </div>
            <div class="details">
                <div class="row">
                    <span class="label">Referencia</span>
                    <span class="value">{pago.reference}</span>
                </div>
                <div class="row">
                    <span class="label">Email</span>
                    <span class="value">{pago.customer_email}</span>
                </div>
                <div class="row">
                    <span class="label">Método</span>
                    <span class="value">{pago.payment_method_type}</span>
                </div>
                <div class="row total">
                    <span class="label">Total</span>
                    <span class="value">${amount_cop:,.0f} COP</span>
                </div>
            </div>
            <div class="methods">
                <h3>Simular resultado:</h3>
                <p style="color: #888; font-size: 12px; margin-bottom: 10px;">Selecciona el resultado que quieres simular</p>
            </div>
            <div class="actions">
                <button class="btn btn-approve" onclick="simulate('APPROVED')">Aprobar</button>
                <button class="btn btn-decline" onclick="simulate('DECLINED')">Rechazar</button>
                <button class="btn btn-error" onclick="simulate('ERROR')">Error</button>
            </div>
            <div class="result" id="result">
                <h2 id="resultTitle"></h2>
                <p id="resultMsg"></p>
            </div>
        </div>
        <script>
            async function simulate(status) {{
                try {{
                    const resp = await fetch('/api/pagos/simular', {{
                        method: 'POST',
                        headers: {{ 'Content-Type': 'application/json' }},
                        body: JSON.stringify({{
                            reference: '{pago.reference}',
                            status: status
                        }})
                    }});
                    const data = await resp.json();
                    document.querySelector('.actions').style.display = 'none';
                    document.querySelector('.methods').style.display = 'none';
                    const result = document.getElementById('result');
                    result.style.display = 'block';
                    result.className = 'result ' + status.toLowerCase();
                    document.getElementById('resultTitle').textContent =
                        status === 'APPROVED' ? 'Pago Aprobado' :
                        status === 'DECLINED' ? 'Pago Rechazado' : 'Error en el Pago';
                    document.getElementById('resultMsg').textContent = data.message;
                }} catch (e) {{
                    alert('Error: ' + e.message);
                }}
            }}
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html)
