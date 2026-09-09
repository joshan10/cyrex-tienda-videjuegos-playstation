# Cyrex Backend FastAPI

Migracion del backend Express a FastAPI manteniendo el contrato `/api`, MySQL, JWT Bearer, CRUD, ordenes y uploads.

## Arranque

```bash
cd backend_fastapi
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 4000 --reload
```

Documentacion automatica:

- http://localhost:4000/docs
- http://localhost:4000/redoc

## Pruebas automatizadas (REQ-26)

Las pruebas usan SQLite en memoria, por lo que no modifican la base de datos configurada para desarrollo. Cubren autenticacion, usuarios, productos y ordenes, incluyendo GET, POST, PUT, PATCH y DELETE.

```bash
cd backend_fastapi
.venv/bin/pytest tests/ -v
```

Si el entorno virtual aun no existe, instalalo antes con `python3 -m venv .venv` y `.venv/bin/pip install -r requirements.txt`.

La aplicacion lee las mismas variables `DB_*`, `JWT_*`, `PORT` y `CORS_ORIGIN` del archivo `.env`. La base `database/cyrex_db.sql` sigue siendo compatible y no debe ejecutarse de nuevo contra una base con datos salvo que se quiera recrear.

## Estructura

- `app/main.py`: aplicacion, CORS, archivos estaticos y montaje de routers.
- `app/models/`: modelos SQLAlchemy para las tablas existentes.
- `app/schemas/`: validacion Pydantic de entradas.
- `app/crud/`: operaciones de consulta y transaccion de ordenes.
- `app/routers/`: endpoints agrupados por recurso.
- `app/dependencies.py`: sesion por peticion y autenticacion/autorizacion.

El servidor oficial es `uvicorn app.main:app`; `server.js` y `src/` son la implementacion Express anterior y pueden retirarse cuando se confirme el cambio de arranque.
