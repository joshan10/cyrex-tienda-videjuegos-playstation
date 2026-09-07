from pathlib import Path
from secrets import token_hex

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.dependencies import require_roles

router = APIRouter(prefix="/upload", tags=["upload"])
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
ALLOWED = {"jpeg", "jpg", "png", "webp", "gif"}


@router.post("")
async def upload_image(_: dict = Depends(require_roles("Administrador")), imagen: UploadFile = File(...)):
    extension = Path(imagen.filename or "").suffix.lower().lstrip(".")
    if extension not in ALLOWED or not (imagen.content_type or "").lower().endswith(extension):
        raise HTTPException(400, "Error: Solo se permiten imágenes (jpeg, jpg, png, webp, gif)")
    content = await imagen.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(413, "El archivo no puede superar 5 MB.")
    UPLOAD_DIR.mkdir(exist_ok=True)
    filename = f"{__import__('time').time_ns()}-{token_hex(4)}.{extension}"
    (UPLOAD_DIR / filename).write_bytes(content)
    return {"url": f"/uploads/{filename}"}
