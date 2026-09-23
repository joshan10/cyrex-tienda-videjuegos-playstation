import asyncio
import logging
from collections.abc import Iterable

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


FAQ_RESPONSES = (
    ("horario", "Atendemos consultas en línea todos los días. Puedes comprar productos y servicios desde la tienda.") ,
    ("envio", "Los tiempos y el costo de envío se confirman durante el proceso de compra según tu dirección."),
    ("pqr", "Puedes registrar una PQR desde tu panel. Allí podrás consultar su estado y la respuesta del equipo."),
    ("producto", "Puedo orientarte sobre productos de PlayStation. Indícame el nombre, plataforma o categoría que buscas."),
)


def faq_response(message: str) -> str:
    normalized = message.casefold()
    for keyword, response in FAQ_RESPONSES:
        if keyword in normalized:
            return response
    return "Puedo ayudarte con productos, servicios, compras, envíos y PQR. ¿Qué necesitas consultar?"


def _api_messages(history: Iterable[dict[str, str]], message: str, catalog_context: str) -> list[dict[str, str]]:
    catalog_instruction = catalog_context or "No hay catálogo disponible para esta consulta."
    return [
        {
            "role": "system",
            "content": (
                "Eres el asistente de Cyrex Store. Responde en español, con claridad y precisión. "
                "Usa exclusivamente el catálogo proporcionado para informar precios, stock, plataformas "
                "y servicios. Si un dato no aparece, dilo explícitamente y no lo inventes. "
                "Si la pregunta no se relaciona con Cyrex, indica amablemente que sólo atiendes consultas de la tienda.\n\n"
                f"CATÁLOGO ACTUAL:\n{catalog_instruction}"
            ),
        },
        *history,
        {"role": "user", "content": message},
    ]


RETRYABLE_STATUS = {408, 429, 500, 502, 503, 504}


async def generate_response(
    history: Iterable[dict[str, str]], message: str, catalog_context: str = ""
) -> tuple[str, str]:
    if not settings.ai_api_key:
        return faq_response(message), "faq"

    url = f"{settings.ai_base_url.rstrip('/')}/chat/completions"
    payload = {"model": settings.ai_model, "messages": _api_messages(history, message, catalog_context), "temperature": 0.3}
    headers = {"Authorization": f"Bearer {settings.ai_api_key}"}

    last_error: Exception | None = None
    timeout = httpx.Timeout(60.0, connect=15.0)
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(url, json=payload, headers=headers)
                if response.status_code in RETRYABLE_STATUS:
                    last_error = httpx.HTTPStatusError(
                        f"HTTP {response.status_code}", request=response.request, response=response
                    )
                    await asyncio.sleep(1.5 * (attempt + 1))
                    continue
                response.raise_for_status()
                content = response.json()["choices"][0]["message"]["content"].strip()
                if content:
                    return content, "ia"
        except httpx.TimeoutException:
            last_error = httpx.ReadTimeout("La API de IA tardó demasiado en responder.", request=None)
        except (httpx.HTTPError, KeyError, IndexError, TypeError) as exc:
            last_error = exc
        await asyncio.sleep(1.5 * (attempt + 1))

    logger.warning("Chatbot IA no disponible, usando fallback FAQ: %s", last_error)
    return faq_response(message), "faq_fallback"