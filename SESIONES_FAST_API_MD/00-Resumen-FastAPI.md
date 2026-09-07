# Resumen Completo del Curso de FastAPI

> Curso: API (FastAPI) + Django REST Framework + Proyecto Integrador
> Instructor: César Augusto Moreno Mena
> Centro: CESGE
> Sesiones 21-42 | Agosto-Septiembre 2026

---

## Fase 1: Fundamentos de APIs REST (Sesiones 21-24)

### [[Sesion_21_2026-08-13]] - Introducción a APIs REST

**Concepto clave:** REST es un conjunto de restricciones arquitectónicas, no un framework.

| Principio | Significado práctico |
|-----------|---------------------|
| **Recurso** | La unidad es un sustantivo: `/libros`, `/socios`, `/prestamos` |
| **Verbo HTTP** | La acción la expresa el método: GET, POST, PUT, PATCH, DELETE |
| **Sin estado** | Cada petición viaja con todo lo necesario (incluida la autenticación) |
| **Representación** | El recurso vive en el servidor; viaja JSON por la red |
| **Interfaz uniforme** | Las mismas reglas para todos los recursos |
| **Código de estado** | 201 al crear, 204 al eliminar, 404 cuando no existe, 409 ante conflicto |

**Proyecto guía:** BiblioAPI - backend de préstamos de una biblioteca.

**Entidades:** Autor → Libro → Socio → Préstamo

**Idea fundamental:** Una API REST bien diseñada se entiende leyendo solo sus rutas y verbos, sin abrir el código.

---

### [[Sesion_22_2026-08-14]] - Primeros pasos con FastAPI

**Qué es FastAPI:** Framework web para APIs con Python moderno que aprovecha las anotaciones de tipo.

| Componente | Función |
|------------|---------|
| **FastAPI** | Framework: define la aplicación, rutas y validación |
| **Starlette** | Base: enrutamiento, middlewares, asíncrono |
| **Pydantic** | Validación y serialización (reemplaza serializers de DRF) |
| **Uvicorn** | Servidor ASGI (equivale a runserver) |
| **ASGI** | Estándar asíncrono (WASGI no contempla async) |

**Idea fundamental:** Las anotaciones de tipo NO son documentación decorativa: son la fuente única de validación, conversión y documentación OpenAPI.

**Equivalencia con DRF:**
- `django-admin startproject` → Crear carpetas y `main.py`
- `ViewSet + Router` → `@app.get("/ruta")` sobre una función
- `Serializer` → `Annotated` + modelos Pydantic
- `runserver` → `uvicorn app.main:app --reload`
- `drf-spectacular` → Incluido: `/docs` y `/redoc` desde la primera línea

**Comandos esenciales:**
```bash
python -m venv .venv
source .venv/bin/activate
pip install "fastapi[standard]==0.115.6" "uvicorn[standard]==0.34.0"
uvicorn app.main:app --reload
```

---

### [[Sesion_23_2026-08-18]] - Path params y query params con Pydantic

**Dos formas de recibir datos en GET:**

| Tipo | Ejemplo | Cuándo se usa |
|------|---------|---------------|
| **Path parameter** | `/libros/7` | Identifica el recurso. Obligatorio. Sin él la ruta no existe. |
| **Query parameter** | `/libros?categoria=novela&limite=10` | Modifica cómo se devuelve una colección. Opcional. |

**Regla de oro:** Si al quitar el dato la ruta deja de tener sentido → path param. Si la ruta sigue funcionando → query param.

**Annotated - la forma actual de declarar restricciones:**
```python
from typing import Annotated
from fastapi import Query, Path

# Path param con restricciones
libro_id: Annotated[int, Path(ge=1)]

# Query param opcional
categoria: Annotated[str | None, Query(description="Filtra por categoría")] = None
```

**Restricciones comunes:**
- `ge=1 / le=100` - Mayor/menor o igual que
- `gt=0 / lt=2100` - Estrictamente mayor/menor
- `min_length=3 / max_length=80` - Longitud
- `pattern=r"^\d{13}$"` - Expresión regular

---

### [[Sesion_24_2026-08-19]] - Repaso y práctica integradora

**Consolidación de sesiones 21-23:**
1. Recurso = sustantivo, acción = verbo HTTP
2. Entorno virtual, estructura, decoradores, uvicorn, documentación automática
3. Path identifica, query filtra. Annotated separa tipo de restricción

**Preguntas de diagnóstico clave:**
- ¿Por qué `/libros/eliminar/3` es mal diseñado? → Porque pone la acción en la ruta
- Un socio intenta cuarto préstamo → 409 Conflict
- ¿Qué diferencia entre 401 y 403? → 401 = "no sé quién eres", 403 = "sé quién eres y no te corresponde"
- GET /libros/abc → 422 antes de ejecutar la función (abc no es entero)

---

## Fase 2: Modelos y CRUD (Sesiones 25-28)

### [[Sesion_25_2026-08-20]] - Modelos de datos con Pydantic

**Concepto fundamental:** Un esquema por operación, no un esquema para todo.

| Esquema | Para qué sirve |
|---------|---------------|
| `LibroCrear` | Lo que el cliente envía al registrar |
| `LibroActualizar` | Actualización parcial (todos opcionales) |
| `LibroRespuesta` | Lo que la API devuelve (incluye campos calculados) |

**Elementos de Pydantic v2:**
```python
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

class LibroCrear(BaseModel):
    titulo: str = Field(min_length=1, max_length=200)
    isbn: str = Field(pattern=r"^\d{13}$")
    
    @field_validator("titulo")
    @classmethod
    def sin_espacios_sobrantes(cls, valor: str) -> str:
        return " ".join(valor.split())
```

**Equivalencia con DRF:**
- `class LibroSerializer` → `class LibroCrear(BaseModel)`
- `CharField(max_length=200)` → `titulo: str = Field(max_length=200)`
- `def validate_isbn(self, value)` → `@field_validator("isbn")`
- `validate(self, attrs)` → `@model_validator(mode="after")`

**Sintaxis obsoleta (NO usar):** `@validator`, `class Config`, `.dict()`, `.json()`, `orm_mode`

---

### [[Sesion_26_2026-08-21]] - Métodos HTTP y códigos de estado

**CRUD completo:**

| Verbo | Éxito | Cuerpo | Semántica |
|-------|-------|--------|-----------|
| GET | 200 OK | El recurso | Consulta. No modifica nada |
| POST | 201 Created | El recurso creado | Crea. No es idempotente |
| PUT | 200 OK | El recurso completo | Reemplaza. Es idempotente |
| PATCH | 200 OK | El recurso actualizado | Modifica solo lo enviado |
| DELETE | 204 No Content | Vacío | Elimina. Sin cuerpo |

**Diferencia clave 409 vs 422:**
- **422** = regla de formato (ISBN de 12 dígitos)
- **409** = regla de negocio (ISBN de 13 dígitos que ya existe)

**response_model:** Filtra la salida: aunque el diccionario interno tenga campos extra, solo se devuelven los declarados en el esquema.

---

### [[Sesion_27_2026-08-24]] - Documentación automática (Swagger/OpenAPI)

**OpenAPI:** FastAPI construye un documento JSON que describe la API completa siguiendo el estándar OpenAPI 3.1.

| Endpoint | Función |
|----------|---------|
| `/openapi.json` | El contrato de la API en formato legible por máquinas |
| `/docs` | Swagger UI: interfaz interactiva para ejecutar peticiones |
| `/redoc` | ReDoc: documentación de lectura |

**Refactorización 1: De un archivo único a routers**
```python
from fastapi import APIRouter

router = APIRouter(
    prefix="/libros",
    tags=["Libros"],
    responses={404: {"description": "El libro solicitado no existe."}},
)

@router.get("", summary="Listar el catálogo")
def listar_libros(...):
    ...
```

**Documentar errores:** Si un endpoint lanza HTTPException, hay que declararlo en `responses` del decorador para que aparezca en /docs.

---

### [[Sesion_28_2026-08-25]] - Repaso y práctica integradora

**Consolidación de sesiones 25-27:**
1. Un esquema por operación: Crear, Actualizar, Respuesta
2. POST crea y responde 201; DELETE responde 204 sin cuerpo
3. La documentación se deriva del código; APIRouter divide por recurso

---

## Fase 3: Excepciones, Dependencias y Middlewares (Sesiones 29-32)

### [[Sesion_29_2026-08-26]] - Manejo de errores y excepciones

**Tres capas de error:**

| Capa | Quién detecta | Respuesta |
|------|---------------|-----------|
| Validación | Pydantic, automáticamente | 422 con lista de campos |
| Regla de negocio | Módulo crud | Excepción propia del dominio |
| Traducción a HTTP | Manejador registrado | Convierte excepción a código adecuado |

**Jerarquía de excepciones:**
```python
class ErrorDeDominio(Exception):
    codigo = "error_de_dominio"

class RecursoNoEncontrado(ErrorDeDominio):
    codigo = "recurso_no_encontrado"

class ConflictoDeNegocio(ErrorDeDominio):
    codigo = "conflicto_de_negocio"
```

**Idea fundamental:** El módulo crud NO debe saber que existe HTTP. Si mañana la misma lógica se usa desde una tarea programada, un HTTPException ahí no tendría sentido.

---

### [[Sesion_30_2026-08-27]] - Inyección de dependencias (Depends)

**Qué es una dependencia:** Una función que FastAPI ejecuta antes del endpoint y cuyo resultado se inyecta como argumento.

**Características de Depends:**
1. Se declara en la firma → `Depends()` como valor del parámetro
2. Participa en la validación → sus parámetros aparecen en /docs
3. Se anida → una dependencia puede depender de otra
4. Se cachea por petición → se ejecuta una sola vez
5. Puede interrumpir → si lanza excepción, el endpoint no se ejecuta
6. Se sustituye en pruebas → `dependency_overrides`

**Ejemplo de dependencia parametrizable:**
```python
class Paginacion:
    def __init__(self, limite: int = 10, desplazamiento: int = 0):
        self.limite = limite
        self.desplazamiento = desplazamiento
    
    def aplicar(self, elementos: list) -> list:
        inicio = self.desplazamiento
        return elementos[inicio : inicio + self.limite]

PaginacionDep = Annotated[Paginacion, Depends()]
```

**Idea fundamental:** Una dependencia no es solo código compartido: es un punto de sustitución. Ese detalle es lo que permitirá cambiar la base de datos real por una de prueba en los tests.

---

### [[Sesion_31_2026-08-28]] - Middlewares, CORS y seguridad básica

**Middleware vs Dependencia:**
- **Middleware:** Se aplica a TODAS las peticiones, incluidas las 404
- **Dependencia:** Solo se aplica a los endpoints que la declaran

**CORS (Cross-Origin Resource Sharing):**
- Es una restricción del NAVEGADOR, no del servidor
- `curl` y Postman funcionan aunque CORS esté mal configurado
- La app web falla cuando CORS no está bien configurado

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Lista explícita
    allow_credentials=True,  # Permite cookies y Authorization
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    expose_headers=["X-Peticion-Id"],
    max_age=600,  # Cachea preflight 10 minutos
)
```

**Configuración con variables de entorno:**
```python
from pydantic_settings import BaseSettings

class Configuracion(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")
    
    nombre_app: str = "BiblioAPI"
    entorno: str = "desarrollo"
    depuracion: bool = True
    origenes_permitidos: list[str] = ["http://localhost:3000"]
```

---

### [[Sesion_32_2026-08-31]] - Repaso y práctica integradora

**Consolidación de sesiones 29-31:**
1. La regla de negocio lanza excepción del dominio; un manejador la traduce a HTTP
2. Depends extrae lo repetido y puede cortar la petición
3. El middleware envuelve toda petición; CORS exige lista explícita de orígenes

---

## Fase 4: Autenticación y Base de Datos (Sesiones 33-36)

### [[Sesion_33_2026-09-01]] - Autenticación y autorización (OAuth2 / JWT)

**Conceptos clave:**
- **Autenticación:** Establece quién es el solicitante. Falla con 401.
- **Autorización:** Decide si puede realizar la operación. Falla con 403.
- **JWT:** Cadena de tres partes (cabecera, carga útil, firma) codificadas en Base64URL.
- **JWT está firmado, NO cifrado:** Cualquiera puede leer su contenido; lo que no puede es modificarlo sin la clave secreta.

**Componentes:**
```python
# Seguridad
from pwdlib import PasswordHash
gestor_de_hash = PasswordHash.recommended()  # Argon2

# Tokens
import jwt
def crear_token(socio_id: int, rol: str) -> str:
    carga = {"sub": str(socio_id), "rol": rol, "exp": ...}
    return jwt.encode(carga, secret_key, algorithm="HS256")
```

**Error común:** El campo `sub` en JWT debe ser string, no entero. PyJWT 2.10 rechaza enteros.

---

### [[Sesion_34_2026-09-02]] - Conexión a bases de datos con SQLAlchemy

**Las cuatro piezas de SQLAlchemy 2.0:**

| Pieza | Función |
|-------|---------|
| **Engine** | Gestiona el pool de conexiones. Se crea una sola vez. |
| **Session** | Unidad de trabajo. Una por petición. |
| **DeclarativeBase** | Clase base de los modelos. |
| **Mapped / mapped_column** | Sintaxis tipada de SQLAlchemy 2.0. |

**Modelo ORM vs Esquema Pydantic:**
- **Modelo ORM:** Describe cómo se GUARDA el dato (tablas, columnas, claves foráneas)
- **Esquema Pydantic:** Describe qué ENTRA y qué SALE por la API

**Ejemplo de modelo:**
```python
class Libro(Base):
    __tablename__ = "libros"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    titulo: Mapped[str] = mapped_column(String(200), index=True)
    isbn: Mapped[str] = mapped_column(String(13), unique=True)
    
    autor_id: Mapped[int] = mapped_column(ForeignKey("autores.id"))
    autor: Mapped["Autor"] = relationship(back_populates="libros", lazy="joined")
```

**Problema N+1:** Listar 50 libros dispara 101 consultas si las relaciones son perezosas. Se resuelve con `lazy="joined"`.

---

### [[Sesion_35_2026-09-03]] - CRUD completo con FastAPI + SQLAlchemy

**Refactorización 2: De la memoria a la base de datos**

| Operación | En memoria | Con SQLAlchemy 2.0 |
|-----------|------------|-------------------|
| Listar | `[l for l in LIBROS if …]` | `sesion.scalars(select(Libro).where(…))` |
| Obtener | Recorrer la lista | `sesion.get(Libro, libro_id)` |
| Crear | `LISTA.append(diccionario)` | `sesion.add(objeto) + commit()` |
| Actualizar | `diccionario.update(cambios)` | `setattr(objeto, campo, valor) + commit()` |
| Eliminar | `LISTA.remove(elemento)` | `sesion.delete(objeto) + commit()` |

**Transacción:** Registrar un préstamo son dos escrituras que deben ocurrir juntas o no ocurrir. Con `commit` y `rollback` eso está garantizado.

**IntegrityError → 409:** Cuando la base rechaza un ISBN duplicado, se captura el IntegrityError y se traduce a un 409 Conflict.

---

### [[Sesion_36_2026-09-04]] - Repaso y práctica integradora

**Consolidación de sesiones 33-35:**
1. Autenticación es quién eres (401); autorización es qué puedes hacer (403)
2. Engine único por proceso, sesión por petición con yield
3. select() y where() en lugar de comprensiones de listas; commit y rollback explícitos

---

## Fase 5: Async, IA y Pruebas (Sesiones 37-42)

### [[Sesion_37_2026-09-07]] - Bases de datos asíncronas

**Qué resuelve async:**
- Un endpoint que consulta la base pasa la mayor parte de su tiempo esperando
- Con async, la función cede el control en cada `await` y el bucle de eventos atiende otras peticiones
- **async NO acelera una petición aislada:** mejora cuántas peticiones concurrentes soporta

**Cuándo NO conviene async:**
1. Operaciones de CPU (inferencia, cálculo)
2. Librerías síncronas sin equivalente asíncrono
3. Proyectos pequeños donde el equipo no domina el modelo
4. Bases de datos sin driver asíncrono

**Cambios necesarios:**
```python
# URL de la base
url_base_datos: str = "sqlite+aiosqlite:///./biblioapi.db"

# Engine asíncrono
motor = create_async_engine(configuracion.url_base_datos)

# Sesión asíncrona
FabricaDeSesiones = async_sessionmaker(bind=motor, class_=AsyncSession)

# Relaciones eager (OBLIGATORIO en async)
libro: Mapped["Libro"] = relationship(back_populates="prestamos", lazy="joined")
```

---

### [[Sesion_38_2026-09-08]] - Integración de modelos de IA en FastAPI

**Arquitectura de un endpoint con modelo:**

1. **Entrenamiento:** Ocurre fuera de la API, en un script aparte
2. **Serialización:** `joblib` guarda el pipeline completo (preprocesamiento + modelo)
3. **Carga:** Una sola vez, en el `lifespan`
4. **Construcción de variables:** Los datos se calculan desde la base
5. **Inferencia:** Operación de CPU → `run_in_threadpool`
6. **Traducción:** La probabilidad se convierte en recomendación accionable

**Idea fundamental:** El modelo predice, no decide. El endpoint devuelve una probabilidad; quién toma la decisión sigue siendo el humano.

**run_in_threadpool:** La inferencia es cálculo puro y debe salir del bucle de eventos.

---

### [[Sesion_39_2026-09-09]] - Consumo de APIs de IA externas

**Riesgos de depender de un servicio externo:**

| Riesgo | Cómo se contiene |
|--------|-----------------|
| Latencia alta | Tiempo límite explícito |
| Fallo transitorio | Reintento con espera creciente (solo 5xx o error de red) |
| Límite de uso (429) | Respetar Retry-After y degradar |
| Caída del proveedor | Degradación: respuesta alternativa peor pero útil |
| Coste por llamada | Caché y límite de longitud de entrada |
| Fuga de la clave | Clave en el entorno, nunca en el código ni repositorio |

**Patrón de degradación:**
```python
try:
    recomendaciones = await servicio.recomendar(intereses, catalogo)
except ProveedorNoDisponible:
    return RespuestaDeRecomendacion(
        recomendaciones=await _respaldo_local(sesion),
        generada_por="catalogo_local",
        aviso="El asistente no está disponible..."
    )
```

---

### [[Sesion_40_2026-09-10]] - Repaso y práctica integradora

**Consolidación de sesiones 37-39:**
1. async cede el control; las operaciones de CPU bloquean el bucle
2. El modelo se entrena fuera, se serializa con preprocesamiento, se carga una vez en lifespan
3. Toda llamada externa lleva tiempo límite, reintento selectivo y degradación

---

### [[Sesion_41_2026-09-11]] - Procesamiento en background (BackgroundTasks)

**BackgroundTasks sirve para trabajo que puede perderse sin consecuencias graves:**

| Adecuado para BackgroundTasks | Exige una cola real (Celery, RQ, ARQ) |
|------------------------------|--------------------------------------|
| Escribir línea de auditoría | Cobrar una multa |
| Invalidar caché | Generar factura |
| Notificación informativa | Correo de restablecimiento contraseña |
| Registrar métrica | Procesar archivo de miles de registros |

**Uso:**
```python
async def registrar_prestamo(
    sesion: SesionDep,
    datos: PrestamoCrear,
    tareas: BackgroundTasks,  # FastAPI lo inyecta
    bibliotecario: Bibliotecario,
):
    prestamo = await crud_prestamos.registrar(sesion, ...)
    
    # Se ejecuta DESPUÉS de enviar la respuesta
    tareas.add_task(registrar_evento, accion="prestamo_registrado", ...)
    
    return prestamo
```

**Importante:** La tarea abre su propia sesión de base de datos (la de la petición ya se cerró).

---

### [[Sesion_42_2026-09-14]] - Testing de APIs con Pytest

**Herramientas:**
- **Pytest:** Ejecutor de pruebas
- **TestClient:** Cliente que llama a la app en memoria
- **dependency_overrides:** Sustituye dependencias durante pruebas
- **Base de prueba:** SQLite en memoria, creada/destruida en cada prueba

**Fixture principal:**
```python
@pytest.fixture
def cliente(motor_prueba, fabrica_sesiones):
    async def sesion_de_prueba():
        async with fabrica_sesiones() as sesion:
            yield sesion
    
    app.dependency_overrides[obtener_sesion] = sesion_de_prueba
    prueba = TestClient(app, raise_server_exceptions=False)
    # ... crear datos de prueba ...
    yield prueba
    app.dependency_overrides.clear()  # LIMPIAR
```

**Idea fundamental:** Las dependencias que se introdujeron el 27 de agosto se cobran hoy. Como la sesión, el usuario y el modelo entran por Depends, cada uno puede sustituirse en las pruebas.

---

## Conexiones entre sesiones

### Flujo de aprendizaje
```
REST (21) → FastAPI básico (22) → Parámetros (23) → Práctica (24)
    ↓
Pydantic (25) → CRUD (26) → Documentación (27) → Práctica (28)
    ↓
Excepciones (29) → Dependencias (30) → Middlewares (31) → Práctica (32)
    ↓
JWT (33) → SQLAlchemy (34) → CRUD persistente (35) → Práctica (36)
    ↓
Async (37) → IA local (38) → IA externa (39) → Práctica (40)
    ↓
BackgroundTasks (41) → Testing (42)
```

### Evolución del proyecto BiblioAPI
- **Sesión 21:** Diseño teórico de endpoints
- **Sesión 22:** Primeros endpoints en memoria
- **Sesión 26:** CRUD completo en memoria
- **Sesión 30:** Dependencias reutilizables
- **Sesión 33:** Autenticación con JWT
- **Sesión 35:** Persistencia con SQLAlchemy
- **Sesión 37:** Conversión a async
- **Sesión 38:** Integración con modelo de IA
- **Sesión 42:** Pruebas automatizadas

### Equivalencias con Django REST Framework

| Necesidad | DRF | FastAPI |
|-----------|-----|---------|
| Crear proyecto | `django-admin startproject` | Crear carpetas y `main.py` |
| Endpoint | `ViewSet + Router` | `@app.get("/ruta")` |
| Validar entrada | `Serializer` | `Annotated` + Pydantic |
| Servidor | `runserver` | `uvicorn` |
| Documentación | `drf-spectacular` | Incluida en `/docs` |
| Paginación | `pagination_class` | Dependencia con `Depends` |
| Permisos | `permission_classes` | Dependencia que lanza excepción |
| ORM | `Django ORM` | `SQLAlchemy 2.0` |
| Migraciones | `makemigrations/migrate` | `Alembic` (fuera del curso) |
| Pruebas | `APIClient` | `TestClient` |
| Tareas background | `Celery` | `BackgroundTasks` (simple) |
