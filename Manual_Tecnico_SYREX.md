# Manual Técnico — SYREX Backend FastAPI

**Proyecto:** SYREX — Tienda Videojuegos
**Ficha:** 3406211
**Aprendiz:** JOSHAN IRE PEREIRA CABRERA
**Fecha:** 20 de septiembre de 2026

---

## 1. Descripción general del sistema

SYREX es una API REST para una tienda de videojuegos construida con **FastAPI** y **SQLAlchemy 2.0**. Permite gestionar productos, usuarios, órdenes de compra, pagos con Stripe, facturación, PQR (Peticiones, Quejas y Reclamos) y un chatbot con inteligencia artificial.

**Stack tecnológico:**

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| Framework | FastAPI | 0.115.6 |
| ORM | SQLAlchemy | 2.0.36 |
| Base de datos | MySQL (PyMySQL) | 8.x |
| Autenticación | JWT (python-jose) + bcrypt | 3.3.0 / 4.2.1 |
| Pagos | Stripe | 11.1.0 |
| IA (Chatbot) | Google Gemini (API compatible OpenAI) | gemini-3.6-flash |
| PDF | ReportLab | 4.2.5 |
| Excel | OpenPyXL | 3.1.5 |
| Testing | pytest + httpx | 8.3.4 / 0.28.1 |
| Configuración | pydantic-settings | 2.7.1 |

---

## 2. Arquitectura del sistema

### 2.1 Diagrama de capas

```
┌─────────────────────────────────────────────────┐
│                   CLIENTE                       │
│              (Frontend React)                   │
└─────────────────────┬───────────────────────────┘
                      │ HTTP/HTTPS
                      ▼
┌─────────────────────────────────────────────────┐
│                 FASTAPI (main.py)               │
│  CORS • Logging • Security Headers • Handlers   │
└─────────────────────┬───────────────────────────┘
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
    ┌─────────┐ ┌──────────┐ ┌──────────┐
    │ Routers │ │Schemas   │ │Exceptns  │
    │ (40+    │ │ Pydantic │ │ Custom   │
    │endpoints│ │          │ │          │
    └────┬────┘ └──────────┘ └──────────┘
         │
         ▼
    ┌─────────┐ ┌──────────┐ ┌──────────┐
    │  CRUD   │ │Services  │ │Depends   │
    │resources│ │(Stripe,  │ │(auth,    │
    │         │ │chatbot)  │ │roles)    │
    └────┬────┘ └──────────┘ └──────────┘
         │
         ▼
    ┌──────────────────────────────────┐
    │     SQLAlchemy 2.0 (ORM)         │
    │     16 modelos • 11+ FK          │
    └──────────────┬───────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────┐
    │        MySQL (cyrex_db)          │
    │      Base de datos real          │
    └──────────────────────────────────┘
```

### 2.2 Estructura de carpetas

```
backend_fastapi/
├── app/
│   ├── main.py              # Punto de entrada, CORS, handlers globales
│   ├── dependencies.py       # Inyección de dependencias (auth, roles)
│   ├── exceptions.py         # Jerarquía de excepciones de dominio
│   ├── pagination.py         # Paginación genérica reutilizable
│   ├── core/
│   │   ├── config.py         # Settings desde .env (pydantic-settings)
│   │   ├── database.py       # Engine, SessionLocal, get_db
│   │   ├── security.py       # JWT, bcrypt, hash/verify password
│   │   └── sanitization.py   # Anti SQL Injection, sanitización
│   ├── models/
│   │   ├── entities.py       # 14 entidades SQLAlchemy
│   │   └── roles.py          # Rol, Permiso, RolPermiso
│   ├── schemas/
│   │   ├── common.py         # Entradas: Create, Update (Pydantic)
│   │   ├── response.py       # Salidas: Response, Paginated (Pydantic)
│   │   ├── resources.py      # Schemas para uploads
│   │   ├── wompi.py          # Schemas para pagos
│   │   ├── pagos.py          # Schemas para pagos Stripe
│   │   ├── pqr.py            # Schemas para PQR
│   │   ├── chatbot.py        # Schemas para chatbot
│   │   └── ventas.py         # Schemas para facturación
│   ├── crud/
│   │   ├── resources.py      # Consultas y transacciones de BD
│   │   ├── pqr.py            # CRUD de PQR
│   │   └── ventas.py         # CRUD de ventas/facturación
│   ├── routers/
│   │   ├── auth.py           # Login, registro, forgot/reset password
│   │   ├── usuarios.py       # CRUD de usuarios
│   │   ├── productos.py      # CRUD de productos
│   │   ├── catalogo.py       # Categorías y servicios (público)
│   │   ├── ordenes.py        # CRUD de órdenes de compra
│   │   ├── pagos.py          # Pagos con Stripe (6 endpoints)
│   │   ├── ventas.py         # Facturación y reportes
│   │   ├── upload.py         # Subida de archivos/imágenes
│   │   ├── pqr.py            # Peticiones, quejas y reclamos
│   │   └── chatbot.py        # Chatbot con IA
│   └── services/
│       ├── stripe_service.py  # Integración Stripe (checkout, webhook)
│       ├── chatbot.py         # Lógica del chatbot (FAQ + Gemini)
│       └── pdf_service.py     # Generación de PDFs con ReportLab
├── tests/
│   ├── conftest.py           # Fixtures: DB SQLite, clientes HTTP
│   ├── test_auth.py          # 12 tests de autenticación
│   ├── test_usuarios.py      # 4 tests de CRUD usuarios
│   ├── test_productos.py     # 4 tests de CRUD productos
│   ├── test_ordenes.py       # 5 tests de CRUD órdenes
│   ├── test_pdf.py           # Tests de generación PDF
│   └── test_pqr_chatbot.py   # Tests de PQR y chatbot
├── database/
│   ├── cyrex_db.sql          # Script de creación de BD
│   ├── seed_usuarios.sql     # Datos iniciales
│   └── migration_*.sql       # Migraciones incrementales
├── docs/
│   └── DISENO_ENDPOINTS.md   # Diseño detallado de endpoints
├── uploads/                   # Directorio de archivos subidos
├── requirements.txt           # 14 dependencias
├── .env.example               # Variables de entorno de ejemplo
└── README_FASTAPI.md          # Instrucciones de arranque
```

---

## 3. Configuración e instalación

### 3.1 Prerrequisitos

- Python 3.11 o superior
- MySQL 8.x corriendo en `localhost:3306`
- pip (gestor de paquetes)

### 3.2 Instalación

```bash
# 1. Clonar el repositorio
cd /home/joshan/Escritorio/proyectos-react-tercer-trimestre-backend-fastapi
cd backend_fastapi

# 2. Crear entorno virtual
python3 -m venv .venv

# 3. Activar entorno virtual
source .venv/bin/activate

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores reales (jwt_secret, db_password, stripe keys)

# 6. Crear la base de datos en MySQL
mysql -u root -e "CREATE DATABASE IF NOT EXISTS cyrex_db;"

# 7. Ejecutar el script de creación
mysql -u root cyrex_db < database/cyrex_db.sql

# 8. Ejecutar seeds
mysql -u root cyrex_db < database/seed_usuarios.sql

# 9. Arrancar el servidor
uvicorn app.main:app --host 0.0.0.0 --port 4000 --reload
```

### 3.3 Variables de entorno (.env)

| Variable | Descripción | Ejemplo |
|----------|------------|---------|
| `PORT` | Puerto del servidor | `4000` |
| `DB_HOST` | Host de MySQL | `localhost` |
| `DB_PORT` | Puerto de MySQL | `3306` |
| `DB_USER` | Usuario de MySQL | `developer` |
| `DB_PASSWORD` | Contraseña de MySQL | `***` |
| `DB_NAME` | Nombre de la BD | `cyrex_db` |
| `JWT_SECRET` | Secreto para firmar JWT | `clave-larga-aleatoria` |
| `JWT_EXPIRES_IN` | Tiempo de expiración del JWT | `24h` |
| `CORS_ORIGIN` | Origen permitido CORS | `http://localhost:5173` |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe | `sk_test_xxxxx` |
| `STRIPE_PUBLISHABLE_KEY` | Clave pública de Stripe | `pk_test_xxxxx` |
| `STRIPE_WEBHOOK_SECRET` | Secreto del webhook Stripe | `whsec_xxxxx` |
| `AI_API_KEY` | Clave de Google Gemini | `AIza...` |
| `AI_MODEL` | Modelo de IA | `gemini-3.6-flash` |

### 3.4 Documentación automática

Una vez arrancado el servidor:

- **Swagger UI:** http://localhost:4000/docs
- **ReDoc:** http://localhost:4000/redoc
- **Health check:** http://localhost:4000/api

---

## 4. Endpoints de la API

### 4.1 Autenticación (`/api/auth`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Registrar nuevo usuario | No |
| POST | `/api/auth/verify-email` | Verificar correo (paso 1) | No |
| POST | `/api/auth/login` | Iniciar sesión (paso 2) | No |
| GET | `/api/auth/me` | Obtener perfil | Sí |
| POST | `/api/auth/forgot-password` | Solicitar recuperación | No |
| POST | `/api/auth/reset-password` | Restablecer contraseña | No |

**Flujo de login de dos pasos:**
1. `POST /verify-email` con `{ "correo": "usuario@email.com" }` → retorna token temporal (5 min)
2. `POST /login` con `{ "token": "...", "password": "..." }` → retorna JWT

### 4.2 Usuarios (`/api/usuarios`)

| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/api/usuarios` | Listar usuarios (paginado) | Admin |
| GET | `/api/usuarios/{id}` | Obtener usuario por ID | Admin |
| POST | `/api/usuarios` | Crear usuario | Admin |
| PUT | `/api/usuarios/{id}` | Actualizar usuario | Admin |
| DELETE | `/api/usuarios/{id}` | Eliminar usuario | Admin |

### 4.3 Productos (`/api/productos`)

| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/api/productos` | Listar con filtros y paginación | Público |
| GET | `/api/productos/{id}` | Obtener producto por ID | Público |
| POST | `/api/productos` | Crear producto | Admin |
| PUT | `/api/productos/{id}` | Actualizar producto | Admin/Empleado |
| PATCH | `/api/productos/{id}/estado` | Activar/desactivar | Admin |
| DELETE | `/api/productos/{id}` | Eliminar producto | Admin |

**Parámetros de filtro:** `estado`, `categoria_id`, `plataforma`, `search`

### 4.4 Categorías y Servicios (`/api/categorias`, `/api/servicios`)

| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/api/categorias` | Listar categorías | Público |
| POST | `/api/categorias` | Crear categoría | Admin |
| PUT | `/api/categorias/{id}` | Actualizar categoría | Admin |
| DELETE | `/api/categorias/{id}` | Eliminar categoría | Admin |
| GET | `/api/servicios` | Listar servicios | Público |
| POST | `/api/servicios` | Crear servicio | Admin |

### 4.5 Órdenes (`/api/ordenes`)

| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/api/ordenes` | Listar órdenes (paginado) | Autenticado |
| GET | `/api/ordenes/{id}` | Obtener orden por ID | Autenticado |
| POST | `/api/ordenes` | Crear orden | Cliente |
| PATCH | `/api/ordenes/{id}/estado` | Actualizar estado | Admin/Empleado |
| GET | `/api/ordenes/stats/ventas` | Estadísticas de ventas | Admin |

**Estados válidos:** `pendiente`, `procesando`, `completada`, `cancelada`

### 4.6 Pagos con Stripe (`/api/pagos`)

| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| POST | `/api/pagos` | Crear pago (sesión Stripe) | Cliente |
| GET | `/api/pagos/{id}` | Consultar estado del pago | Autenticado |
| GET | `/api/pagos/orden/{id}` | Pagos de una orden | Autenticado |
| POST | `/api/pagos/webhook` | Webhook de Stripe | Público |
| POST | `/api/pagos/simular` | Simular pago (mock) | Admin |
| GET | `/api/pagos/checkout/{ref}` | Página mock de checkout | Público |

### 4.7 Facturación y Ventas (`/api/ventas`)

| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/api/ventas` | Listar facturas | Admin |
| GET | `/api/ventas/{id}` | Obtener factura | Admin |
| GET | `/api/ventas/{id}/pdf` | Descargar factura en PDF | Admin |

### 4.8 Archivos (`/api/archivos`)

| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| POST | `/api/archivos` | Subir imagen/archivo | Admin/Empleado |

Los archivos se sirven estáticamente desde `/uploads/`.

### 4.9 PQR (`/api/pqr`)

| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| POST | `/api/pqr` | Crear PQR | Autenticado |
| GET | `/api/pqr` | Listar PQRs | Autenticado |
| GET | `/api/pqr/resumen` | Resumen de PQRs | Admin/Empleado |
| GET | `/api/pqr/{id}` | Detalle de PQR | Autenticado |
| PATCH | `/api/pqr/{id}` | Actualizar PQR | Admin/Empleado |

### 4.10 Chatbot con IA (`/api/chatbot`)

| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| POST | `/api/chatbot` | Enviar mensaje al chatbot | Autenticado |
| GET | `/api/chatbot/historial` | Ver historial de conversación | Autenticado |
| GET | `/api/chatbot/conversaciones` | Listar conversaciones | Autenticado |

---

## 5. Modelo de base de datos

### 5.1 Entidades principales

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    roles     │     │   usuarios   │     │   ordenes    │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)      │◄────│ rol_id (FK)  │     │ id (PK)      │
│ nombre       │     │ id (PK)      │◄────│ usuario_id   │
└──────────────┘     │ nombre       │     │ total        │
                     │ apellido     │     │ estado       │
                     │ correo (UQ)  │     │ direccion    │
                     │ password     │     └──────┬───────┘
                     └──────────────┘            │
                                                 │
┌──────────────┐     ┌──────────────┐     ┌──────┴───────┐
│  categorias  │     │  productos   │     │ordenes_detalles│
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)      │◄────│ categoria_id │     │ id (PK)      │
│ nombre       │     │ id (PK)      │────►│ orden_id(FK) │
└──────────────┘     │ nombre       │     │ producto_id  │
                     │ precio       │     │ cantidad     │
                     │ stock        │     │ subtotal     │
                     └──────────────┘     └──────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    pagos     │     │    ventas    │     │ventas_detalles│
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)      │     │ id (PK)      │────►│ id (PK)      │
│ orden_id(FK) │     │ orden_id(FK) │     │ venta_id(FK) │
│ reference(UQ)│     │ numero_fac.  │     │ producto_id  │
│ amount       │     │ total_neto   │     │ cantidad     │
│ status       │     │ estado       │     │ subtotal     │
└──────────────┘     └──────────────┘     └──────────────┘
```

### 5.2 Foreign Keys

| FK | Origen → Destino |
|----|-------------------|
| `usuarios.rol_id` | → `roles.id` |
| `productos.categoria_id` | → `categorias.id` |
| `ordenes.usuario_id` | → `usuarios.id` |
| `ordenes_detalles.orden_id` | → `ordenes.id` |
| `ordenes_detalles.producto_id` | → `productos.id` |
| `pagos.orden_id` | → `ordenes.id` |
| `password_reset_tokens.usuario_id` | → `usuarios.id` |
| `ventas.orden_id` | → `ordenes.id` |
| `ventas_detalles.venta_id` | → `ventas.id` |
| `ventas_detalles.producto_id` | → `productos.id` |
| `conversaciones_chat.usuario_id` | → `usuarios.id` |
| `mensajes_chat.conversacion_id` | → `conversaciones_chat.id` |
| `pqr.usuario_id` | → `usuarios.id` |

### 5.3 Normalización

| Forma Normal | Estado | Evidencia |
|--------------|--------|-----------|
| **1NF** | Cumple | Valores atómicos, `OrdenDetalle` normaliza ítems |
| **2NF** | Cumple | Todos los atributos dependen de la clave primaria completa |
| **3NF** | Cumple | Sin dependencias transitivas; FKs en lugar de datos denormalizados |

---

## 6. Seguridad

### 6.1 Autenticación JWT

- **Algoritmo:** HS256
- **Expiración:** 24 horas (configurable via `JWT_EXPIRES_IN`)
- **Payload:** `{ id, correo, rol_id, rol_nombre, exp }`
- **Login de dos pasos:** verify-email (token temporal 5 min) → login (retorna JWT)

### 6.2 Autorización por roles

| Rol | Permisos |
|-----|----------|
| **Administrador** | CRUD completo en todos los recursos |
| **Empleado** | Ver/editar productos, gestionar PQR |
| **Cliente** | Ver catálogo, crear órdenes, pagar, crear PQR |

### 6.3 Headers de seguridad

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 6.4 Protección contra SQL Injection

- Sanitización de entradas en `app/core/sanitization.py`
- Patrones de detección: `SELECT`, `INSERT`, `DROP`, `UNION`, `--`, `/*`, etc.
- Validación antes de cualquier consulta a la BD

---

## 7. Manejo de errores

### 7.1 Excepciones personalizadas

| Excepción | Código HTTP | Uso |
|-----------|-------------|-----|
| `RecursoNoEncontrado` | 404 | Entidad no encontrada |
| `ConflictoNegocio` | 409 | Dato duplicado, estado inválido |
| `CuentaInactiva` | 403 | Usuario desactivado |
| `CredencialesInvalidas` | 401 | Contraseña incorrecta |
| `StockInsuficiente` | 409 | No hay suficiente stock |
| `TokenInvalido` | 401 | JWT inválido o ausente |
| `AccesoDenegado` | 403 | Rol insuficiente |

### 7.2 Formato de respuesta de error

```json
{
  "ok": false,
  "error": {
    "code": 404,
    "message": "Producto no encontrado con id 15"
  }
}
```

### 7.3 Handlers globales (main.py)

| Handler | Código | Descripción |
|---------|--------|-------------|
| `CyrexException` | Dinámico | Excepciones de dominio |
| `ValueError` | 400 | Errores de validación Python |
| `HTTPException` | Dinámico | Excepciones HTTP de FastAPI |
| `RequestValidationError` | 422 | Errores de validación Pydantic |
| `Exception` | 500 | Catch-all para errores inesperados |

---

## 8. Testing

### 8.1 Ejecutar pruebas

```bash
cd backend_fastapi
pytest tests/ -v
```

### 8.2 Cobertura

| Archivo | Tests | Cubre |
|---------|-------|-------|
| `test_auth.py` | 12 | Verify-email, login, register, forgot/reset, token expirado |
| `test_usuarios.py` | 4 | CRUD usuarios, 404, duplicados, rol |
| `test_productos.py` | 4 | CRUD productos, 404, auth, filtros |
| `test_ordenes.py` | 5 | CRUD órdenes, 404, stock, estado, ownership |
| `test_pdf.py` | — | Generación de PDF |
| `test_pqr_chatbot.py` | — | PQR y chatbot |
| **Total** | **25+** | |

### 8.3 Infraestructura de tests

- Base de datos SQLite en memoria (`StaticPool`) — no modifica la BD de desarrollo
- Fixtures por rol: `admin_user`, `employee_user`, `customer_user`
- Helper `login_headers()` con flujo de dos pasos
- Fixture `autouse` crea/destruye tablas por test

---

## 9. Despliegue

### 9.1 Desarrollo local

```bash
uvicorn app.main:app --host 0.0.0.0 --port 4000 --reload
```

### 9.2 Producción

```bash
uvicorn app.main:app --host 0.0.0.0 --port 4000 --workers 4
```

### 9.3 Requisitos del servidor

- Python 3.11+
- MySQL 8.x
- Puerto 4000 abierto
- Variables de entorno configuradas en `.env`

---

## 10. Dependencias (requirements.txt)

```
fastapi==0.115.6
uvicorn[standard]==0.34.0
sqlalchemy==2.0.36
pymysql==1.1.1
python-jose[cryptography]==3.3.0
bcrypt==4.2.1
python-multipart==0.0.20
pydantic-settings==2.7.1
email-validator==2.2.0
pytest==8.3.4
httpx==0.28.1
stripe==11.1.0
openpyxl==3.1.5
reportlab==4.2.5
```

---

## 11. Solución de problemas

| Problema | Solución |
|----------|----------|
| `ModuleNotFoundError` | Activar entorno virtual: `source .venv/bin/activate` |
| `Access denied for user` | Verificar credenciales en `.env` |
| `Connection refused` | Verificar que MySQL está corriendo en puerto 3306 |
| `JWT decode error` | Verificar que `JWT_SECRET` coincida entre `.env` y el token |
| `CORS error` | Agregar el origen del frontend en `allowed_origins` de `main.py` |
| `Stripe webhook fails` | Verificar `STRIPE_WEBHOOK_SECRET` y que el payload sea raw bytes |
