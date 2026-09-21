import logging
import time
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.exceptions import CyrexException
from app.routers import auth, catalogo, chatbot, ordenes, pagos, pqr, productos, upload, usuarios, ventas

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

tags_metadata = [
    {"name": "auth", "description": "Operaciones de autenticación y registro"},
    {"name": "usuarios", "description": "Gestión de usuarios del sistema"},
    {"name": "productos", "description": "Catálogo de productos"},
    {"name": "categorias", "description": "Gestión de categorías"},
    {"name": "servicios", "description": "Gestión de servicios"},
    {"name": "ordenes", "description": "Gestión de órdenes de compra"},
    {"name": "pagos", "description": "Gestión de pagos con Stripe"},
    {"name": "ventas", "description": "Gestión de ventas y facturación"},
    {"name": "archivos", "description": "Subida de archivos e imágenes"},
    {"name": "PQR", "description": "Peticiones, quejas y reclamos de clientes"},
    {"name": "Chatbot", "description": "Atención automatizada y conversaciones con IA"},
    {"name": "PDF y reportes", "description": "Descarga de facturas y reportes en formato PDF"},
]

app = FastAPI(
    title="Cyrex API",
    description="API para la tienda de videojuegos Cyrex. Permite gestionar productos, usuarios, órdenes y más.",
    version="1.0.0",
    openapi_tags=tags_metadata,
)

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:5176",
    "http://127.0.0.1:5176",
    "http://localhost:5177",
    "http://127.0.0.1:5177",
    "https://cyrex-fronted.vercel.app",
]
if settings.cors_origin not in allowed_origins:
    allowed_origins.append(settings.cors_origin)
extra_origins = getattr(settings, "cors_origins", "")
if extra_origins:
    for origin in extra_origins.split(","):
        origin = origin.strip()
        if origin and origin not in allowed_origins:
            allowed_origins.append(origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def logging_and_security_headers(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time

    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {duration:.4f}s")

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    return response


uploads = Path(__file__).resolve().parent.parent / "uploads"
uploads.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads), name="uploads")

app.include_router(auth.router, prefix="/api")
app.include_router(usuarios.router, prefix="/api")
app.include_router(productos.router, prefix="/api")
app.include_router(catalogo.categories, prefix="/api")
app.include_router(catalogo.services, prefix="/api")
app.include_router(ordenes.router, prefix="/api")
app.include_router(pagos.router, prefix="/api")
app.include_router(ventas.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(pqr.router, prefix="/api")
app.include_router(chatbot.router, prefix="/api")


@app.get("/api", summary="Health check de la API")
def health():
    return {
        "status": "ok",
        "message": "Cyrex API v1.0 — Tienda Premium PlayStation",
        "endpoints": {
            "auth": "/api/auth",
            "usuarios": "/api/usuarios",
            "productos": "/api/productos",
            "categorias": "/api/categorias",
            "ordenes": "/api/ordenes",
            "pagos": "/api/pagos",
            "ventas": "/api/ventas",
            "servicios": "/api/servicios",
            "archivos": "/api/archivos",
            "pqr": "/api/pqr",
            "chatbot": "/api/chatbot",
        },
    }


@app.exception_handler(CyrexException)
async def cyrex_exception_handler(request: Request, exc: CyrexException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "ok": False,
            "error": {
                "code": exc.status_code,
                "message": exc.message,
            },
        },
    )


@app.exception_handler(ValueError)
async def value_error(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=400,
        content={
            "ok": False,
            "error": {
                "code": 400,
                "message": str(exc),
            },
        },
    )


@app.exception_handler(HTTPException)
async def http_error(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "ok": False,
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
            },
        },
        headers=exc.headers,
    )


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        errors.append({
            "field": " -> ".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
        })
    return JSONResponse(
        status_code=422,
        content={
            "ok": False,
            "error": {
                "code": 422,
                "message": "Error de validación",
                "details": errors,
            },
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception("Error inesperado: %s", exc)
    return JSONResponse(
        status_code=500,
        content={
            "ok": False,
            "error": {
                "code": 500,
                "message": "Error interno del servidor",
            },
        },
    )
