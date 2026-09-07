from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.routers import auth, catalogo, ordenes, productos, upload, usuarios

app = FastAPI(title="Cyrex API", version="1.0.0")
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
]
if settings.cors_origin not in allowed_origins:
    allowed_origins.append(settings.cors_origin)
app.add_middleware(CORSMiddleware, allow_origins=allowed_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

uploads = Path(__file__).resolve().parent.parent / "uploads"
uploads.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads), name="uploads")
app.include_router(auth.router, prefix="/api")
app.include_router(usuarios.router, prefix="/api")
app.include_router(productos.router, prefix="/api")
app.include_router(catalogo.categories, prefix="/api")
app.include_router(catalogo.services, prefix="/api")
app.include_router(ordenes.router, prefix="/api")
app.include_router(upload.router, prefix="/api")


@app.get("/api")
def health():
    return {"status": "ok", "message": "Cyrex API v1.0 — Tienda Premium PlayStation", "endpoints": {"auth": "/api/auth", "usuarios": "/api/usuarios", "productos": "/api/productos", "categorias": "/api/categorias", "ordenes": "/api/ordenes", "servicios": "/api/servicios"}}


@app.exception_handler(ValueError)
def value_error(_, exc: ValueError):
    return JSONResponse(status_code=400, content={"error": str(exc)})


@app.exception_handler(HTTPException)
async def http_error(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail}, headers=exc.headers)


@app.exception_handler(RequestValidationError)
async def validation_error(_: Request, exc: RequestValidationError):
    return JSONResponse(status_code=400, content={"errors": [{"msg": error["msg"], "path": error["loc"][-1]} for error in exc.errors()]})
