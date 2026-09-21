from collections.abc import Iterable

import httpx

from app.core.config import settings


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


async def generate_response(
    history: Iterable[dict[str, str]], message: str, catalog_context: str = ""
) -> tuple[str, str]:
    if not settings.ai_api_key:
        return faq_response(message), "faq"

    url = f"{settings.ai_base_url.rstrip('/')}/chat/completions"
    payload = {"model": settings.ai_model, "messages": _api_messages(history, message, catalog_context), "temperature": 0.3}
    headers = {"Authorization": f"Bearer {settings.ai_api_key}"}
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"].strip()
            if content:
                return content, "ia"
    except (httpx.HTTPError, KeyError, IndexError, TypeError):
        pass
    return faq_response(message), "faq_fallback"