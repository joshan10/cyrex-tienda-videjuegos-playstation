from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.dependencies import require_roles
from app.services.cloudinary_service import borrar_imagen, subir_imagen

router = APIRouter(prefix="/archivos", tags=["archivos"])
ALLOWED = {"jpeg", "jpg", "png", "webp", "gif"}


@router.post(
    "",
    summary="Subir imagen a Cloudinary",
    responses={
        400: {"description": "Formato no permitido"},
        413: {"description": "Archivo demasiado grande"},
        503: {"description": "Cloudinary no configurado"},
    },
)
async def upload_image(
    _: dict = Depends(require_roles("Administrador")),
    imagen: UploadFile = File(...),
):
    extension = Path(imagen.filename or "").suffix.lower().lstrip(".")
    if extension not in ALLOWED or not (imagen.content_type or "").lower().endswith(extension):
        raise HTTPException(400, "Error: Solo se permiten imágenes (jpeg, jpg, png, webp, gif)")
    content = await imagen.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(413, "El archivo no puede superar 5 MB.")
    return subir_imagen(content)


@router.delete(
    "",
    summary="Eliminar imagen de Cloudinary",
    responses={
        200: {"description": "Imagen eliminada (o no existía)"},
        400: {"description": "public_id requerido"},
        503: {"description": "Cloudinary no configurado"},
    },
)
def delete_image(
    public_id: str,
    _: dict = Depends(require_roles("Administrador")),
):
    if not public_id.strip():
        raise HTTPException(400, "public_id es requerido.")
    eliminada = borrar_imagen(public_id)
    return {"eliminada": eliminada, "public_id": public_id}
