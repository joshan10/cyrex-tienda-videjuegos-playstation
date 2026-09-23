from io import BytesIO

import cloudinary
import cloudinary.uploader
from fastapi import HTTPException

from app.core.config import settings

FOLDER = "cyrex/productos"


def _asegurar_configurado() -> None:
    if not (
        settings.cloudinary_cloud_name
        and settings.cloudinary_api_key
        and settings.cloudinary_api_secret
    ):
        raise HTTPException(
            503,
            "Cloudinary no está configurado. Agrega CLOUDINARY_CLOUD_NAME, "
            "CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en el archivo .env.",
        )
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )


def subir_imagen(content: bytes) -> dict:
    """Sube una imagen a Cloudinary y devuelve {url, public_id}."""
    _asegurar_configurado()
    try:
        result = cloudinary.uploader.upload(
            BytesIO(content),
            folder=FOLDER,
            resource_type="image",
        )
    except Exception as exc:
        raise HTTPException(502, f"Error al subir la imagen a Cloudinary: {exc}") from exc
    return {"url": result["secure_url"], "public_id": result["public_id"]}


def borrar_imagen(public_id: str) -> bool:
    """Elimina una imagen de Cloudinary. Devuelve True si se borró."""
    if not public_id:
        return False
    _asegurar_configurado()
    try:
        result = cloudinary.uploader.destroy(public_id, resource_type="image")
        return result.get("result") == "ok"
    except Exception:
        return False
