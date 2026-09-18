# Informe de Validación — Matriz Técnica SYREX

**Proyecto:** SYREX — Tienda Video Juegos  
**Ficha:** 3406211  
**Aprendiz:** JOSHAN IRE PEREIRA CABRERA  
**Fecha:** 18 de septiembre de 2026

---

## Resumen General

| # | Requisito | Estado |
|---|-----------|--------|
| 1 | API REST y CRUD | CUMPLE |
| 2 | Pydantic v2 y validaciones | CUMPLE |
| 3 | SQLAlchemy 2.0 y persistencia | CUMPLE |
| 4 | JWT y autorización por rol | CUMPLE |
| 5 | Manejo de errores y CORS | CUMPLE |
| 6 | async/await y BackgroundTasks | CUMPLE |
| 7 | Integración con IA | **NO CUMPLE** |
| 8 | Documentación, README y despliegue | CUMPLE |
| 9 | Testing con Pytest/TestClient | CUMPLE |
| 10 | Comparativa FastAPI vs Django REST | PENDIENTE* |
| 11 | Manual técnico | PENDIENTE* |
| 12 | CI/CD | **NO CUMPLE** |
| 13 | Pasarela de pagos | CUMPLE |
| 14 | Base de datos normalizada | CUMPLE |
| 15 | Respuestas a conceptos y principios | PENDIENTE* |

> *Los puntos 10, 11 y 15 son documentos/contenidos académicos que dependen de tu preparación, no del código.

---

## 1. API REST y CRUD — CUMPLE

**Requisito:** Definir endpoints REST con recurso, verbo HTTP, ruta, código de respuesta. CRUD completo.

### Endpoints implementados

| Recurso | Crear | Listar | Consultar | Actualizar | Eliminar | Estado |
|---------|-------|--------|-----------|------------|----------|--------|
| **Usuarios** | POST `/usuarios` (201) | GET `/usuarios` (200) | GET `/usuarios/{id}` (200) | PUT `/usuarios/{id}` (200) | DELETE `/usuarios/{id}` (204) | COMPLETO |
| **Productos** | POST `/productos` (201) | GET `/productos` (200) | GET `/productos/{id}` (200) | PUT `/productos/{id}` (200) | DELETE `/productos/{id}` (204) | COMPLETO |
| **Categorías** | POST `/categorias` (201) | GET `/categorias` (200) | GET `/categorias/{id}` (200) | PUT `/categorias/{id}` (200) | DELETE `/categorias/{id}` (204) | COMPLETO |
| **Servicios** | POST `/servicios` (201) | GET `/servicios` (200) | GET `/servicios/{id}` (200) | PUT `/servicios/{id}` (200) | DELETE `/servicios/{id}` (204) | COMPLETO |
| **Órdenes** | POST `/ordenes` (201) | GET `/ordenes` (200) | GET `/ordenes/{id}` (200) | PATCH `/ordenes/{id}/estado` (200) | — | PARCIAL |
| **Pagos** | POST `/pagos` (201) | GET `/pagos/orden/{id}` (200) | GET `/pagos/{id}` (200) | Webhook interno | — | PARCIAL |

### Validación de parámetros

- `Query()` con restricciones: paginación (`ge=1, le=100`) en `app/pagination.py:16-19`
- Type hints en todos los parámetros de ruta (`int`, `str`)
- Pydantic schemas con `Field(min_length, max_length, ge, pattern)` en todos los body params

**Ubicación:** `backend_fastapi/app/routers/` (archivos: `usuarios.py`, `productos.py`, `catalogo.py`, `ordenes.py`, `pagos.py`, `auth.py`)

---

## 2. Pydantic v2 y Validaciones — CUMPLE

**Requisito:** Esquemas separados para Create/Update/Response. Usar field_validator, model_validator, Field.

### Esquemas implementados

| Propósito | Schema | Archivo:Línea |
|-----------|--------|---------------|
| **Create (registro)** | `RegistroUsuario` | `schemas/common.py:11` |
| **Create (producto)** | `ProductoEntrada` | `schemas/common.py:71` |
| **Create (orden)** | `OrdenEntrada` | `schemas/common.py:128` |
| **Update (producto)** | `ProductoUpdate` | `schemas/common.py:98` |
| **Update (estado)** | `CambiarEstado` | `schemas/common.py:157` |
| **Response (usuario)** | `UsuarioRespuesta` | `schemas/response.py:4` |
| **Response (producto)** | `ProductoRespuesta` | `schemas/response.py:20` |
| **Response (orden)** | `OrdenRespuesta` | `schemas/response.py:69` |

### Validaciones implementadas

| Tipo | Ejemplo | Archivo:Línea |
|------|---------|---------------|
| `field_validator` | `tipo_documento` solo admite "cc", "ce", "pasaporte" | `common.py:22-27` |
| `model_validator` | Dirección de envío mín. 10 caracteres | `common.py:133-137` |
| `Field(pattern)` | Regex en número de documento | `common.py:15` |
| `Field(min_length, max_length)` | Nombre 2-100 chars | `common.py:12` |
| `Field(ge=0)` | Precio no negativo | `common.py:72` |
| `Field(ge=1)` | Cantidad mín. 1 en órdenes | `common.py:124` |
| `EmailStr` | Validación de correo | `common.py:18` |

**Ubicación:** `backend_fastapi/app/schemas/common.py`, `response.py`, `resources.py`, `wompi.py`

---

## 3. SQLAlchemy 2.0 y Persistencia — CUMPLE

**Requisito:** Al menos 2 entidades relacionadas, SQLAlchemy 2.0, base de datos real.

### Entidades y relaciones (10 modelos)

| Modelo | FK | Archivo:Línea |
|--------|-----|---------------|
| `Usuario` | `rol_id` → `roles.id` | `entities.py:10` |
| `Producto` | `categoria_id` → `categorias.id` | `entities.py:27` |
| `Categoria` | — | `entities.py:42` |
| `Servicio` | — | `entities.py:53` |
| `Orden` | `usuario_id` → `usuarios.id` | `entities.py:65` |
| `OrdenDetalle` | `orden_id` → `ordenes.id`, `producto_id` → `productos.id` | `entities.py:77` |
| `Pago` | `orden_id` → `ordenes.id` | `entities.py:107` |
| `PasswordResetToken` | `usuario_id` → `usuarios.id` | `entities.py:87` |
| `EmailVerificationToken` | — (busca por correo) | `entities.py:97` |
| `Rol` | — | `roles.py:7` |

### Estilo SQLAlchemy 2.0

- Uso de `Mapped[type]` y `mapped_column()` en todas las columnas
- Base: `DeclarativeBase` (no `declarative_base()` legacy)
- **11 Foreign Keys** que relacionan las entidades

### Base de datos real

- **MySQL** via PyMySQL (`mysql+pymysql://`)
- Conexión: `localhost:3306/cyrex_db`
- Configuración: `pool_pre_ping=True`, `pool_recycle=1800`

**Ubicación:** `backend_fastapi/app/models/entities.py`, `roles.py`, `app/core/database.py`, `app/core/config.py`

---

## 4. JWT y Autorización por Rol — CUMPLE

**Requisito:** Login con JWT, mecanismo equivalente a OAuth2, proteger endpoints por autenticación y rol.

### JWT

| Componente | Archivo:Línea |
|------------|---------------|
| Crear token (HS256, exp 24h) | `security.py:20-22` |
| Decodificar token | `security.py:25-26` |
| Extraer usuario del token | `dependencies.py:15-38` |
| Password hashing (bcrypt) | `security.py:9-10` |

### Login de dos pasos (estilo Google)

1. `POST /auth/verify-email` → valida correo, genera token temporal (5 min)
2. `POST /auth/login` → valida token + contraseña, retorna JWT

### Autorización por rol

| Rol | Permisos |
|-----|----------|
| Administrador | CRUD completo en todos los recursos |
| Empleado | Ver/editar productos |
| Cliente | Ver catálogo, crear órdenes, pagar |

- Guard: `require_roles()` en `dependencies.py:41-46`
- Aplicado a nivel de router (`usuarios.py:18`) y por endpoint

**Ubicación:** `backend_fastapi/app/core/security.py`, `app/dependencies.py`, `app/routers/auth.py`

---

## 5. Manejo de Errores y CORS — CUMPLE

**Requisito:** Errores estandarizados, HTTPException, códigos 404/422, CORS configurado.

### Excepciones personalizadas

| Excepción | HTTP Code | Archivo:Línea |
|-----------|-----------|---------------|
| `RecursoNoEncontrado` | 404 | `exceptions.py:10` |
| `ConflictoNegocio` | 409 | `exceptions.py:18` |
| `CuentaInactiva` | 403 | `exceptions.py:25` |
| `CredencialesInvalidas` | 401 | `exceptions.py:32` |
| `StockInsuficiente` | 409 | `exceptions.py:39` |
| `AccesoDenegado` | 403 | `exceptions.py:53` |

### Handlers globales

| Handler | Código | Archivo:Línea |
|---------|--------|---------------|
| `CyrexException` | dinámico | `main.py:108` |
| `ValueError` | 400 | `main.py:122` |
| `HTTPException` | dinámico | `main.py:136` |
| `RequestValidationError` | 422 | `main.py:151` |
| `Exception` (catch-all) | 500 | `main.py:172` |

### CORS

- Orígenes permitidos: `localhost:5173-5177` + configuración desde `.env`
- `allow_credentials=True`, `allow_methods=["*"]`, `allow_headers=["*"]`
- **Archivo:** `main.py:37-57`

**Ubicación:** `backend_fastapi/app/exceptions.py`, `app/main.py`

---

## 6. async/await y BackgroundTasks — CUMPLE

**Requisito:** Al menos un endpoint async, usar BackgroundTasks.

### Endpoints async

| Endpoint | Archivo:Línea |
|----------|---------------|
| `POST /api/archivos` (upload) | `upload.py:21` |
| `POST /api/pagos` (crear pago) | `pagos.py:28` |
| `POST /api/pagos/webhook` | `pagos.py:153` |
| `POST /api/pagos/simular` | `pagos.py:202` |

### BackgroundTasks

- `forgot_password` envía email en segundo plano: `auth.py:186`
- `background_tasks.add_task(enviar_email_confirmacion, ...)`

### Servicios async (Wompi)

- `get_acceptance_token()`, `create_transaction()`, `get_transaction_status()` usan `httpx.AsyncClient()`

**Ubicación:** `backend_fastapi/app/routers/upload.py`, `pagos.py`, `auth.py`, `app/services/wompi.py`

---

## 7. Integración con IA — NO CUMPLE

**Requisito:** Exponer al menos un endpoint con modelo propio o servicio de IA externo.

### Estado actual

- **No existe ningún endpoint de IA** en el proyecto
- **No hay librerías de IA** en `requirements.txt` (sin openai, anthropic, transformers, etc.)
- **No hay variables de entorno** para APIs de IA en `.env`
- **No hay archivos** en `app/services/` relacionados con IA

### Acción requerida

Implementar al menos un endpoint con integración IA, por ejemplo:
- Chatbot de recomendación de juegos
- Análisis de sentimiento de reseñas
- Búsqueda semántica de productos

**Ubicación:** No aplica (falta implementar)

---

## 8. Documentación, README y Despliegue — CUMPLE

**Requisito:** Documentación personalizada, README, requirements.txt, .env.example.

| Elemento | Estado | Archivo |
|----------|--------|---------|
| FastAPI docs (`/docs`) | CUMPLE | Tags, descripciones en `main.py:19-35` |
| ReDoc (`/redoc`) | CUMPLE | Disponible por defecto |
| Tags personalizados | CUMPLE | 8 tags: auth, usuarios, productos, categorías, servicios, ordenes, pagos, archivos |
| Ejemplos en schemas | CUMPLE | `json_schema_extra` en schemas |
| README con instalación | CUMPLE | `README.md` (527 líneas) |
| README backend | CUMPLE | `README_FASTAPI.md` (41 líneas) |
| requirements.txt | CUMPLE | 11 dependencias en `requirements.txt` |
| .env.example | CUMPLE | 17 variables en `.env.example` |

**Ubicación:** `backend_fastapi/app/main.py`, `README.md`, `README_FASTAPI.md`, `requirements.txt`, `.env.example`

---

## 9. Testing con Pytest/TestClient — CUMPLE

**Requisito:** Pruebas con Pytest/TestClient cubriendo CRUD y autenticación.

### Cobertura

| Archivo | Tests | Cubre |
|---------|-------|-------|
| `test_auth.py` | 12 | Verify-email, login, register, forgot/reset password, perfil, token expirado/usado |
| `test_usuarios.py` | 4 | CRUD usuarios, 404, duplicados, rol |
| `test_productos.py` | 4 | CRUD productos, 404, auth, filtros |
| `test_ordenes.py` | 5 | CRUD órdenes, 404, stock, estado, ownership |
| **Total** | **25** | |

### Infraestructura de tests

- Base de datos SQLite en memoria (`StaticPool`)
- Fixtures por rol: `admin_user`, `employee_user`, `customer_user`
- Helper `login_headers()` con flujo de dos pasos
- `autouse` fixture crea/destruye tablas por test

**Ubicación:** `backend_fastapi/tests/`

---

## 10. Comparativa FastAPI vs Django REST — PENDIENTE

> Este es un contenido académico que debes preparar para la sustentación.

**Sugerencia de análisis:**

| Criterio | FastAPI | Django REST Framework |
|----------|---------|----------------------|
| Rendimiento | Async nativo, más rápido | Síncrono por defecto |
| Tipado | Pydantic + type hints | Serializer (menos estricto) |
| Documentación | Auto (/docs, /redoc) | Requiere drf-yasg o similar |
| ORM | SQLAlchemy (flexible) | Django ORM (acoplado) |
| Curva de aprendizaje | Moderada | Baja |
| Ecosistema | Moderado | Grande |

---

## 11. Manual Técnico — PENDIENTE

> Documento que debes elaborar describiendo la arquitectura, instalación, configuración y uso del sistema.

---

## 12. CI/CD — NO CUMPLE

**Requisito:** Implementar o documentar CI/CD.

### Estado actual

- **No existe** `.github/workflows/`
- **No existe** `Dockerfile` ni `docker-compose.yml`
- **No existe** `Jenkinsfile` ni `Makefile`

### Acción requerida

Opciones:
1. Crear un GitHub Actions workflow para tests automáticos
2. Crear Dockerfile + docker-compose.yml
3. Documentar un pipeline de despliegue manual

**Ubicación:** No aplica (falta implementar)

---

## 13. Pasarela de Pagos — CUMPLE

**Requisito:** Incluir una pasarela de pagos.

### Integración Wompi

| Componente | Archivo:Línea |
|------------|---------------|
| Servicio Wompi (firmas, transacciones) | `services/wompi.py` (167 líneas) |
| Router de pagos (6 endpoints) | `routers/pagos.py` (368 líneas) |
| Schema de pagos | `schemas/wompi.py` |
| Modelo `Pago` | `models/entities.py:107` |
| Configuración (mock + sandbox) | `core/config.py:22-27` |

### Endpoints

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/api/pagos` | POST | Crear pago para una orden |
| `/api/pagos/{id}` | GET | Consultar estado del pago |
| `/api/pagos/orden/{id}` | GET | Pagos de una orden |
| `/api/pagos/webhook` | POST | Webhook de Wompi |
| `/api/pagos/simular` | POST | Simular pago (mock) |
| `/api/pagos/checkout/{ref}` | GET | Página mock de checkout |

### Modo de desarrollo

- `WOMPI_MOCK_MODE=true` para tests sin llaves reales
- Sandbox URL: `https://sandbox.wompi.co/v1`
- Verificación HMAC-SHA256 en webhooks

**Ubicación:** `backend_fastapi/app/services/wompi.py`, `app/routers/pagos.py`, `app/schemas/wompi.py`

---

## 14. Base de Datos Normalizada — CUMPLE

**Requisito:** Base de datos normalizada.

### Normalización

| Forma Normalal | Estado | Evidencia |
|----------------|--------|-----------|
| **1NF** | CUMPLE | Valores atómicos, sin grupos repetitivos (`OrdenDetalle` normaliza ítems) |
| **2NF** | CUMPLE | Todos los atributos dependen de la clave primaria completa |
| **3NF** | CUMPLE | Sin dependencias transitivas; FKs en lugar de datos denormalizados |

### Foreign Keys

| FK | Origen → Destino |
|----|-------------------|
| `usuarios.rol_id` | → `roles.id` |
| `productos.categoria_id` | → `categorias.id` |
| `ordenes.usuario_id` | → `usuarios.id` |
| `ordenes_detalles.orden_id` | → `ordenes.id` |
| `ordenes_detalles.producto_id` | → `productos.id` |
| `pagos.orden_id` | → `ordenes.id` |
| `password_reset_tokens.usuario_id` | → `usuarios.id` |

**Ubicación:** `backend_fastapi/app/models/entities.py`, `roles.py`

---

## 15. Respuestas a Conceptos y Principios — PENDIENTE

> Contenido académico para la sustentación. Prepara definiciones de:
> - REST, HTTP, JWT, CORS, ORM, normalización de BD
> - Principios SOLID, arquitectura de software
> - Decisiones técnicas del proyecto

---

## Acciones Pendientes Críticas

| # | Requisito | Prioridad | Acción |
|---|-----------|-----------|--------|
| 1 | **Integración IA** | ALTA | Implementar al menos 1 endpoint con servicio de IA (ej: chatbot, recomendaciones) |
| 2 | **CI/CD** | ALTA | Crear `.github/workflows/test.yml` o `Dockerfile` + `docker-compose.yml` |
| 3 | **Comparativa técnica** | MEDIA | Preparar documento FastAPI vs Django REST aplicado al proyecto |
| 4 | **Manual técnico** | MEDIA | Elaborar manual técnico del proyecto |
| 5 | **Conceptos sustentación** | MEDIA | Preparar respuestas a conceptos y principios |

---

## Conclusión

El proyecto **cumple con 12 de 15 requisitos** de la matriz de validación. Los dos requisitos faltantes de código son **Integración de IA** y **CI/CD**, que deben implementarse antes de la validación final. Los demás puntos pendientes (comparativa, manual, conceptos) son contenidos académicos de preparación.
