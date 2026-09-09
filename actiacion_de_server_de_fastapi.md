Desde la raiz del proyecto, inicia el backend con:

```bash
backend_fastapi/.venv/bin/uvicorn app.main:app --app-dir backend_fastapi --host 0.0.0.0 --port 4000 --reload
```

Tambien puedes entrar primero a `backend_fastapi/` y ejecutar:

```bash
.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 4000 --reload
```

No uses `uvicorn app.main:app` directamente desde la raiz: el comando puede no encontrar el entorno virtual ni el archivo `.env` del backend.

*** para reiniar el port 4000:
fuser -k 4000/tcp