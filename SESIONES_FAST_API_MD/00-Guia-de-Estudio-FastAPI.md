# Guía de Estudio: Lo que DEBES saber y estudiar sí o sí

> Prioridad alta → cae seguro en examen
> Prioridad media → puede caer, repásalo
> Prioridad baja → conocimiento de apoyo

---

## 1. Fundamentos de REST (Sesión [[Sesion_21_2026-08-13]])

### PREGUNTA SEGURO: Diferencia entre 401, 403, 409, 422

| Código | Cuándo | Ejemplo |
|--------|--------|---------|
| **401** | No sabemos quién eres | Falta token JWT o es inválido |
| **403** | Sabemos quién eres, pero no puedes | Socio intentando crear un libro (no tiene permisos) |
| **409** | Conflicto de negocio | ISBN duplicado, socio tiene 3 préstamos activos y pide el 4° |
| **422** | Error de validación | ISBN con 12 dígitos en vez de 13, título vacío |

### PREGUNTA SEGURO: CRUD = 4 operaciones

- **Create** → POST → 201 Created + cuerpo con el recurso creado
- **Read** → GET → 200 OK + cuerpo con el recurso
- **Update** → PUT o PATCH → 200 OK + cuerpo con el recurso actualizado
- **Delete** → DELETE → 204 No Content + **sin cuerpo**

### PREGUNTA SEGURO: REST es un estándar de diseño

- Los recursos se nombran como sustantivos en plural (`/libros`, `/socios`)
- Las acciones se expresan con verbos HTTP
- **Sin estado:** cada petición lleva todo lo necesario (token)
- **Uniforme:** mismas reglas para todos los recursos

### OJO: PUT vs PATCH

- **PUT:** Reemplaza el recurso completo. Todos los campos obligatorios.
- **PATCH:** Actualiza solo los campos enviados. Opcionales.

---

## 2. FastAPI Básico (Sesión [[Sesion_22_2026-08-14]])

### PREGUNTA SEGURO: ¿Qué es FastAPI y qué componentes usa?

| Componente | Función |
|------------|---------|
| **FastAPI** | Framework: define la aplicación y rutas |
| **Starlette** | Base: enrutamiento, middlewares, async |
| **Pydantic** | Validación y serialización de datos |
| **Uvicorn** | Servidor ASGI que ejecuta la app |

### PREGUNTA SEGURO: Equivalencia con Django

| Necesidad | DRF | FastAPI |
|-----------|-----|---------|
| Crear proyecto | `django-admin startproject` | Crear carpetas y `main.py` |
| Endpoint | `ViewSet + Router` | `@app.get("/ruta")` |
| Validar datos | `Serializer` | `Annotated` + Pydantic |
| Servidor | `python manage.py runserver` | `uvicorn app.main:app --reload` |
| Documentación | drf-spectacular (install) | `/docs` incluida por defecto |

### COMANDO PARA RECORDAR:
```bash
python -m venv .venv
source .venv/bin/activate
pip install "fastapi[standard]==0.115.6" "uvicorn[standard]==0.34.0"
uvicorn app.main:app --reload
```

### OJO: Las anotaciones de tipo son OBLIGATORIAS

Sin `Annotated[int, Path(ge=1)]`, FastAPI no puede validar ni documentar. Las anotaciones no son decoración: son la fuente de validación y documentación.

---

## 3. Path Params vs Query Params (Sesión [[Sesion_23_2026-08-18]])

### PREGUNTA SEGURO: ¿Cuándo usar cada uno?

| Tipo | Ejemplo | Cuándo |
|------|---------|--------|
| **Path param** | `/libros/7` | Identifica el recurso. **Obligatorio.** |
| **Query param** | `/libros?categoria=novela` | Filtra o modifica la respuesta. **Opcional.** |

### REGLA DE ORO: Si al quitar el dato la ruta deja de tener sentido → path param. Si la ruta sigue funcionando → query param.

### PREGUNTA SEGURO: Sintaxis con Annotated

```python
from typing import Annotated
from fastapi import Path, Query

@router.get("/{libro_id}")
def obtener_libro(libro_id: Annotated[int, Path(ge=1)]):
    ...

@router.get("")
def listar_libros(
    categoria: Annotated[str | None, Query()] = None,
    limite: Annotated[int, Query(ge=1, le=100)] = 10,
):
    ...
```

### OJO: GET /libros/abc → responde 422 ANTES de ejecutar tu función. Pydantic rechaza `abc` como entero automáticamente.

---

## 4. Modelos Pydantic (Sesión [[Sesion_25_2026-08-20]])

### PREGUNTA SEGURO: Un esquema por operación

| Esquema | Para qué | Ejemplo |
|---------|----------|---------|
| `LibroCrear` | Lo que el cliente envía al crear | titulo, isbn, autor_id |
| `LibroActualizar` | Actualización parcial (todos opcionales) | titulo: str \| None = None |
| `LibroRespuesta` | Lo que la API devuelve | titulo, isbn, autor, fecha_registro |

### PREGUNTA SEGURO: Validaciones comunes con Pydantic v2

```python
from pydantic import BaseModel, Field, field_validator, model_validator

class LibroCrear(BaseModel):
    titulo: str = Field(min_length=1, max_length=200)
    isbn: str = Field(pattern=r"^\d{13}$")
    num_paginas: int = Field(ge=1)
    
    @field_validator("titulo")
    @classmethod
    def sin_espacios_sobrantes(cls, valor: str) -> str:
        return " ".join(valor.split())
```

### OJO: Pydantic v2 (NO v1)

- Usar `@field_validator` (no `@validator`)
- Usar `model_config = ConfigDict(...)` (no `class Config`)
- Usar `model_dump()` (no `.dict()`)

---

## 5. Manejo de Errores (Sesión [[Sesion_29_2026-08-26]])

### PREGUNTA SEGURO: Tres capas de error

| Capa | Quién detecta | Respuesta |
|------|---------------|-----------|
| Validación | Pydantic automáticamente | 422 con lista de campos |
| Regla de negocio | módulo crud | Excepción propia del dominio |
| Traducción a HTTP | Manejador registrado | Convierte excepción a código HTTP |

### PREGUNTA SEGURO: Jerarquía de excepciones propias

```python
class ErrorDeDominio(Exception):      # Padre
    codigo = "error_de_dominio"

class RecursoNoEncontrado(ErrorDeDominio):  # Hijo
    codigo = "recurso_no_encontrado"

class ConflictoDeNegocio(ErrorDeDominio):   # Hijo
    codigo = "conflicto_de_negocio"
```

### IDEA CLAVE: El módulo crud NO debe saber que existe HTTP. Si mañana usas la misma lógica desde una tarea programada, un HTTPException no tendría sentido.

---

## 6. Dependency Injection - Depends (Sesión [[Sesion_30_2026-08-27]])

### PREGUNTA SEGURO: ¿Qué es Depends y por qué importa?

```python
from fastapi import Depends

@router.get("")
def listar_libros(sesion: SessionDep):
    ...
# SessionDep = Annotated[AsyncSession, Depends(obtener_sesion)]
```

### PREGUNTA SEGURO: Características de Depends

1. Se declara en la **firma** del endpoint
2. Participa en la **validación** (sus parámetros aparecen en /docs)
3. Se puede **anidar** (una dependencia puede depender de otra)
4. Se **cachea por petición** (se ejecuta una sola vez)
5. Puede **interrumpir** (si lanza excepción, el endpoint no se ejecuta)
6. Se **sustituye** en pruebas (`dependency_overrides`)

### EJEMPLO CLÁSICO: Dependencia parametrizable (Paginación)

```python
class Paginacion:
    def __init__(self, limite: int = 10, desplazamiento: int = 0):
        self.limite = limite
        self.desplazamiento = desplazamiento

PaginacionDep = Annotated[Paginacion, Depends()]
```

### OJO: En pruebas se usa `app.dependency_overrides[obtener_sesion] = sesion_de_prueba`

---

## 7. CORS y Middlewares (Sesión [[Sesion_31_2026-08-28]])

### PREGUNTA SEGURO: ¿Qué es CORS y por qué falla?

- CORS es una restricción del **NAVEGADOR**, no del servidor
- `curl` y Postman funcionan aunque CORS esté mal configurado
- La app web falla cuando CORS no está bien configurado

### PREGUNTA SEGURO: Configuración correcta

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],   # Lista explícita, nunca "*"
    allow_credentials=True,                      # Permite Authorization
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    max_age=600,                                 # Cachea preflight 10 min
)
```

### OJO: Middleware se aplica a TODAS las peticiones. Depends solo a los endpoints que la declaran.

---

## 8. JWT - Autenticación (Sesión [[Sesion_33_2026-09-01]])

### PREGUNTA SEGURO: Diferencia entre autenticación y autorización

| Concepto | Significado | Error típico |
|----------|-------------|--------------|
| **Autenticación** | ¿Quién eres? | 401 Unauthorized |
| **Autorización** | ¿Qué puedes hacer? | 403 Forbidden |

### PREGUNTA SEGURO: JWT = Cabecera + Carga útil + Firma

- JWT está **firmado**, NO cifrado → cualquiera puede leer el contenido, pero no modificarlo
- Campo `sub` debe ser **string** (no entero) → PyJWT 2.10 rechaza enteros

### PREGUNTA SEGURO: El flujo completo

1. El cliente envía email + contraseña al endpoint `/auth/login`
2. El servidor verifica la contraseña con `pwdlib` (Argon2)
3. Si es correcta, genera un JWT con `sub`, `rol`, `exp`
4. El cliente envía el JWT en el header `Authorization: Bearer <token>`
5. El servidor valida el token y extrae el usuario

---

## 9. SQLAlchemy 2.0 (Sesión [[Sesion_34_2026-09-02]])

### PREGUNTA SEGURO: Las 4 piezas de SQLAlchemy

| Pieza | Función |
|-------|---------|
| **Engine** | Pool de conexiones. Se crea una vez. |
| **Session** | Unidad de trabajo. Una por petición. |
| **DeclarativeBase** | Clase base de los modelos. |
| **Mapped / mapped_column** | Sintaxis tipada de SQLAlchemy 2.0. |

### PREGUNTA SEGURO: Modelo ORM vs Esquema Pydantic

- **Modelo ORM:** Cómo se **GUARDA** el dato (tablas, columnas, FK)
- **Esquema Pydantic:** Qué **ENTRA y SALE** por la API

### PREGUNTA SEGURO: Problema N+1

Listar 50 libros dispara 101 consultas si las relaciones son perezosas.
**Solución:** `lazy="joined"` en la relación.

```python
autor: Mapped["Autor"] = relationship(back_populates="libros", lazy="joined")
```

---

## 10. Async (Sesión [[Sesion_37_2026-09-07]])

### PREGUNTA SEGURO: ¿Qué resuelve async?

- Las operaciones de BD pasan tiempo esperando (red)
- Con async, la función **cede el control** y el bucle atiende otras peticiones
- **async NO acelera** una petición aislada; mejora cuántas concurrentes soporta

### PREGUNTA SEGURO: ¿Cuándo NO conviene async?

1. Operaciones de **CPU** (inferencia de modelos, cálculos)
2. Librerías **síncronas** sin equivalente asíncrono
3. Proyectos **pequeños** donde el equipo no domina async
4. Bases de datos sin **driver asíncrono**

### PREGUNTA SEGURO: Cambios necesarios

| Síncrono | Asíncrono |
|----------|-----------|
| `sqlite:///./biblioapi.db` | `sqlite+aiosqlite:///./biblioapi.db` |
| `create_engine(url)` | `create_async_engine(url)` |
| `Session` | `AsyncSession` + `async_sessionmaker` |
| `session.execute(...)` | `await session.execute(...)` |
| `relationship(lazy="select")` | `relationship(lazy="joined")` **obligatorio** |

---

## 11. BackgroundTasks (Sesión [[Sesion_41_2026-09-11]])

### PREGUNTA SEGURO: ¿Para qué sirve BackgroundTasks?

Trabajo que **puede perderse sin consecuencias graves**:
- Escribir línea de auditoría
- Invalidar caché
- Notificación informativa
- Registrar métricas

**NO usar para:** cobrar multas, generar facturas, correos de restablecimiento.

### PREGUNTA SEGURO: Cómo se usa

```python
async def crear_libro(
    datos: LibroCrear,
    sesion: SessionDep,
    tareas: BackgroundTasks,  # FastAPI lo inyecta automáticamente
):
    libro = await crud.crear(sesion, datos)
    tareas.add_task(registrar_evento, "libro_creado", libro.id)
    return libro
```

---

## 12. Testing (Sesión [[Sesion_42_2026-09-14]])

### PREGUNTA SEGURO: Las 3 herramientas clave

| Herramienta | Función |
|-------------|---------|
| **Pytest** | Ejecutor de pruebas |
| **TestClient** | Cliente que llama a la app en memoria |
| **dependency_overrides** | Sustituye dependencias durante pruebas |

### PREGUNTA SEGURO: Patrón de fixture

```python
@pytest.fixture
def cliente(motor_prueba):
    app.dependency_overrides[obtener_sesion] = sesion_de_prueba
    cliente = TestClient(app, raise_server_exceptions=False)
    yield cliente
    app.dependency_overrides.clear()  # LIMPIAR SIEMPRE
```

### OJO: La sesión de prueba crea y destruye la base en cada prueba. Los datos no se contaminan entre tests.

---

## Mapa de estudio rápido

### 10 temas que caen SEGURÍSIMO

1. **REST:** Verbos HTTP, códigos de estado, recursos
2. **FastAPI:** Qué es, componentes, equivalencia con DRF
3. **Path vs Query params:** Cuándo usar cada uno
4. **Pydantic:** field_validator, model_validator, ConfigDict
5. **Excepciones:** 401 vs 403 vs 409 vs 422, jerarquía de errores
6. **Depends:** Qué es, 6 características, dependency_overrides
7. **CORS:** Qué es, por qué falla, configuración correcta
8. **JWT:** Flujo completo, sub=string, token firmado
9. **SQLAlchemy:** 4 piezas, N+1, lazy="joined"
10. **Async:** Qué resuelve, cuándo NO usar, cambios necesarios

### Flujo de estudio sugerido

```
Semana 1: Sesiones 21-28 (REST + Pydantic + CRUD)
Semana 2: Sesiones 29-36 (Errors + Depends + JWT + SQLAlchemy)
Semana 3: Sesiones 37-42 (Async + IA + Testing)
```
