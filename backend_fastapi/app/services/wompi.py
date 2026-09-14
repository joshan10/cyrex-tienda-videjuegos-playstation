import hashlib
import json
import time
import uuid
from datetime import datetime, timezone

import httpx

from app.core.config import settings


def generate_integrity_signature(reference: str, amount_in_cents: int, currency: str) -> str:
    raw = f"{reference}{amount_in_cents}{currency}{settings.wompi_integrity_secret}"
    return hashlib.sha256(raw.encode()).hexdigest()


def generate_event_signature(properties: dict, timestamp: str) -> str:
    values = "".join(str(v) for v in properties.values())
    raw = f"{values}{timestamp}{settings.wompi_events_secret}"
    return hashlib.sha256(raw.encode()).hexdigest()


def verify_webhook_signature(payload: dict, checksum: str) -> bool:
    try:
        sig = payload.get("signature", {})
        props = sig.get("properties", [])
        values = []
        for prop in props:
            keys = prop.split(".")
            obj = payload.get("data", {})
            for k in keys:
                obj = obj.get(k, "") if isinstance(obj, dict) else ""
            values.append(str(obj))
        concatenated = "".join(values)
        timestamp = payload.get("sent_at", "")
        raw = f"{concatenated}{timestamp}{settings.wompi_events_secret}"
        expected = hashlib.sha256(raw.encode()).hexdigest()
        return expected == checksum
    except Exception:
        return False


def _mock_acceptance_token() -> str:
    return f"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_acceptance_token_{int(time.time())}"


def _mock_transaction_id() -> str:
    ts = int(time.time())
    rand = uuid.uuid4().hex[:5]
    return f"1292-{ts}-{rand}"


def _mock_transaction_response(
    reference: str,
    amount_in_cents: int,
    customer_email: str,
    payment_method_type: str,
) -> dict:
    return {
        "data": {
            "id": _mock_transaction_id(),
            "reference": reference,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "amount_in_cents": amount_in_cents,
            "currency": "COP",
            "customer_email": customer_email,
            "payment_method_type": payment_method_type,
            "status": "PENDING",
            "status_message": "Transacción creada (mock)",
            "merchant": {
                "id": settings.wompi_public_key,
                "name": "Cyrex Store Mock",
                "legal_name": "Cyrex Store SAS",
            },
            "payment_method": _mock_payment_method(payment_method_type),
        }
    }


def _mock_payment_method(payment_method_type: str) -> dict:
    methods = {
        "CARD": {"type": "CARD", "brand": "VISA", "last_four": "4242"},
        "NEQUI": {"type": "NEQUI", "phone_number": "310****1234"},
        "PSE": {"type": "PSE", "bank_name": "Bancolombia"},
    }
    return methods.get(payment_method_type, {"type": payment_method_type})


async def get_acceptance_token() -> str:
    if settings.wompi_mock_mode:
        return _mock_acceptance_token()

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{settings.wompi_base_url}/merchants/{settings.wompi_public_key}",
            headers={"Authorization": f"Bearer {settings.wompi_public_key}"},
        )
        resp.raise_for_status()
        data = resp.json()
        return data["data"]["presigned_acceptance"]["acceptance_token"]


async def create_transaction(
    reference: str,
    amount_in_cents: int,
    customer_email: str,
    payment_method_type: str = "CARD",
    token: str | None = None,
    installments: int = 1,
) -> dict:
    acceptance_token = await get_acceptance_token()
    signature = generate_integrity_signature(reference, amount_in_cents, "COP")

    if settings.wompi_mock_mode:
        return _mock_transaction_response(reference, amount_in_cents, customer_email, payment_method_type)

    payment_method = {"type": payment_method_type}
    if payment_method_type == "CARD":
        payment_method["token"] = token
        payment_method["installments"] = installments
    elif payment_method_type == "NEQUI":
        payment_method["phone_number"] = token

    body = {
        "amount_in_cents": amount_in_cents,
        "currency": "COP",
        "customer_email": customer_email,
        "payment_method": payment_method,
        "reference": reference,
        "signature": signature,
        "payment_method_type": payment_method_type,
        "acceptance_token": acceptance_token,
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{settings.wompi_base_url}/transactions",
            headers={"Authorization": f"Bearer {settings.wompi_private_key}"},
            json=body,
        )
        resp.raise_for_status()
        return resp.json()


async def get_transaction_status(transaction_id: str) -> dict:
    if settings.wompi_mock_mode:
        return {
            "data": {
                "id": transaction_id,
                "status": "APPROVED",
                "status_message": "Transacción aprobada (mock)",
            }
        }

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{settings.wompi_base_url}/transactions/{transaction_id}",
            headers={"Authorization": f"Bearer {settings.wompi_public_key}"},
        )
        resp.raise_for_status()
        return resp.json()


def generate_reference(prefix: str = "ORD") -> str:
    ts = int(time.time())
    rand = uuid.uuid4().hex[:8].upper()
    return f"{prefix}-{ts}-{rand}"
