# Matriz de Validación Técnica — SYREX

## Información del proyecto

- **Ficha:** 3406211
- **Programa:** Tecnólogo en Análisis y Desarrollo de Software
- **Aprendiz:** JOSHAN IRE PEREIRA CABRERA
- **Instructor:** César Augusto Moreno Mena
- **Proyecto:** SYREX — Tienda Video Juegos

## Requisitos técnicos

### 1. Diseño y fundamentos REST

- Definir los endpoints del dominio siguiendo criterios REST:
  - Recurso
  - Verbo HTTP
  - Ruta
  - Código de respuesta
- Implementar parámetros de ruta y consulta con validación usando `Query`, `Path`, `Annotated` y/o type hints.
- Implementar CRUD completo sobre los recursos principales:
  - Crear
  - Listar
  - Consultar
  - Actualizar
  - Eliminar

### 2. Modelado y validación de datos — Pydantic

- Usar esquemas Pydantic v2 separados para:
  - `Create`
  - `Update`
  - `Response`
- Incluir validaciones propias del dominio mediante:
  - `field_validator`
  - `model_validator`
  - Restricciones de `Field`

### 3. Persistencia de datos — SQLAlchemy

- Definir al menos **dos entidades relacionadas** mediante modelos SQLAlchemy 2.0.
- El CRUD debe persistir los datos en una **base de datos real**, no en memoria.
- Bases de datos indicadas en la matriz:
  - SQLite
  - PostgreSQL

### 4. Autenticación y autorización

- Implementar inicio de sesión con **JWT**.
- Utilizar flujo **OAuth2 password** o un mecanismo equivalente.
- Proteger los endpoints sensibles según:
  - Autenticación
  - Rol del usuario

### 5. Manejo de errores y middlewares

- Manejar los errores de forma estandarizada.
- Utilizar `HTTPException` cuando corresponda.
- Manejar códigos como:
  - `404`
  - `422`
- Proporcionar mensajes de error claros.
- Configurar **CORS** para permitir el consumo de la API desde el frontend desarrollado en React.

### 6. Asincronía y tareas en segundo plano

- Incluir al menos un endpoint o flujo implementado con `async/await`.
- Utilizar `BackgroundTasks` u otro mecanismo equivalente para implementar al menos una tarea no bloqueante.

### 7. Integración de Inteligencia Artificial

- Exponer al menos un endpoint que integre:
  - Un modelo propio, o
  - Un servicio de IA externo.
- Gestionar las credenciales y llaves de API mediante **variables de entorno**.
- No almacenar credenciales o llaves directamente en el código.

### 8. Documentación y preparación para despliegue

- Personalizar la documentación automática de FastAPI:
  - `/docs`
  - `/redoc`
- La documentación debe incluir:
  - Tags
  - Descripciones
  - Ejemplos
- Incluir un `README` con instrucciones de:
  - Instalación
  - Ejecución
- Incluir:
  - `requirements.txt`
  - `.env.example`

### 9. Pruebas — Testing

- Implementar pruebas con **Pytest / TestClient**.
- Las pruebas deben cubrir como mínimo:
  - CRUD
  - Autenticación

### 10. Comparativa técnica y sustentación

- Incluir un análisis o sección comparativa entre:
  - FastAPI
  - Django REST Framework
- La comparación debe estar aplicada al proyecto.
- Sustentar con claridad:
  - El funcionamiento del proyecto
  - Las decisiones técnicas tomadas

## Otros requisitos

La matriz también incluye los siguientes puntos adicionales:

### 11. Manual técnico

- Elaborar un **manual técnico** del proyecto.

### 12. CI/CD

- Implementar o documentar **CI/CD**.

### 13. Pasarela de pagos

- Incluir una **pasarela de pagos**.

### 14. Base de datos normalizada

- Contar con una **base de datos normalizada**.

### 15. Respuestas a conceptos y principios

- Preparar las **respuestas a conceptos y principios** solicitados en la sustentación o validación.

## Resumen de requisitos clave

Para validar el proyecto, la matriz contempla **24 criterios evaluables**. Los puntos técnicos principales se concentran en:

1. API REST y CRUD.
2. Pydantic v2 y validaciones.
3. SQLAlchemy 2.0 y persistencia en base de datos real.
4. JWT y autorización por autenticación/rol.
5. Manejo de errores y CORS.
6. `async/await` y tareas en segundo plano.
7. Integración con IA.
8. Documentación, README y preparación para despliegue.
9. Testing con Pytest/TestClient.
10. Comparación FastAPI vs Django REST Framework.
11. Manual técnico.
12. CI/CD.
13. Pasarela de pagos.
14. Base de datos normalizada.
15. Conceptos y principios para sustentación.
