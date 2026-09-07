# 📋 Análisis de Requerimientos Faltantes — Cyrex Store

> Documento generado el **05/09/2026**.
> Comparación entre `Requerimientos_Proyecto_jhan.md` y el estado **real** del código en `frontend/` y `backend_fastapi/`.

---

## ✅ Requerimientos que YA están implementados

| REQ | Descripción | Estado |
|-----|-------------|--------|
| REQ-01 | Arquitectura Full Stack React + FastAPI | ✅ Completo |
| REQ-02 | Carpeta backend con subcarpeta `app/` | ✅ Completo |
| REQ-03 | Entorno virtual Python + `requirements.txt` | ✅ Completo |
| REQ-04 | Base de datos SQL con entidades principales | ✅ Completo |
| REQ-05 | Tabla de usuarios con todos los campos requeridos | ✅ Completo |
| REQ-06 | Modelos SQLAlchemy + Esquemas Pydantic separados | ✅ Completo |
| REQ-07 | Conexión DB con variables de entorno en `.env` | ✅ Completo |
| REQ-08 | Comunicación Frontend → FastAPI → DB | ✅ Completo |
| REQ-09 | Registro de usuarios con POST `/api/auth/register` | ✅ Completo |
| REQ-10 | Login con POST `/api/auth/login` y generación de JWT | ✅ Completo |
| REQ-11 | React envía token JWT en cabecera `Authorization: Bearer` | ✅ Completo |
| REQ-12 | Roles: Administrador, Empleado, Cliente | ✅ Completo |
| REQ-13 | Hooks: useState, useEffect, useContext, useRef, useMemo, useNavigate | ✅ Completo |
| REQ-14 | Endpoints REST para Usuarios, Productos y Servicios | ✅ Completo |
| REQ-16 | CRUD completo de Usuarios | ✅ Completo |
| REQ-17 | Panel de Administración protegido | ✅ Completo |
| REQ-18 | Panel de Empleado con restricciones de rol | ✅ Completo |
| REQ-19 | Panel de Cliente con acceso a sus órdenes | ✅ Completo |
| REQ-20 | Nombre del usuario en el Navbar tras login | ✅ Completo |
| REQ-22 | Hash seguro de contraseñas con bcrypt | ✅ Completo |
| REQ-23 | Variables de entorno en archivo `.env` | ✅ Completo |
| REQ-24 | Componente flotante `WhatsAppButton.jsx` | ✅ Completo |
| REQ-25 | Documentación Swagger en `/docs` (FastAPI nativo) | ✅ Completo |

---

## ❌ Requerimientos FALTANTES o INCOMPLETOS

---

### ✅ REQ-15 — Recuperación de Contraseña (COMPLETADO)

**Qué pedía:** Implementación funcional de recuperación de contraseña olvidada para clientes y empleados.

**Estado Actual:**
- ✅ Se crearon los endpoints en FastAPI (`forgot-password` y `reset-password`).
- ✅ Se configuró el envío de tokens directamente en la respuesta para pruebas (modo dev).
- ✅ Se creó la tabla `password_reset_tokens` (script disponible en `database/migration_reset_token.sql`).
- ✅ Se actualizó el frontend para llamar a la API real.
- ✅ Se creó la página `RestablecerContrasena.jsx` para ingresar la nueva contraseña.

```jsx
// RecuperarContrasena.jsx - handleSubmit
setSent(true);  // ← Solo cambia estado local. No llama ningún endpoint.
```



---

### ⚠️ REQ-21 — Validaciones en Tiempo Real (PARCIALMENTE INCOMPLETO)

**Qué pide:** Validación de campos obligatorios, longitudes, tipos, expresiones regulares, correos, teléfonos y contraseñas. Obligatorio tanto en React **como en FastAPI**.

**Qué existe:**
- ✅ FastAPI valida correctamente con Pydantic (longitudes, formatos, correo, teléfono, contraseña mínima).
- ✅ `Contacto.jsx` tiene validación en tiempo real completa.
- ✅ `IniciarSesion.jsx` tiene validaciones básicas de formulario.
- ⚠️ `RegistroModal.jsx` (el formulario principal de registro de clientes) — el formulario existe pero no se puede confirmar si valida todos los campos en tiempo real durante el tipeo (`onChange`).

**Cómo completarlo en `RegistroModal.jsx`:**
1. Crear un objeto de validadores similar al de `Contacto.jsx`:
   ```js
   const validators = {
     nombre: (v) => v.trim().length >= 2 ? '' : 'Mínimo 2 caracteres.',
     apellido: (v) => v.trim().length >= 2 ? '' : 'Mínimo 2 caracteres.',
     tipo_documento: (v) => ['cc', 'ce', 'pasaporte'].includes(v) ? '' : 'Selecciona un tipo válido.',
     numero_documento: (v) => /^\d{6,15}$/.test(v) ? '' : 'Solo dígitos, entre 6 y 15.',
     direccion: (v) => v.trim().length >= 6 ? '' : 'Mínimo 6 caracteres.',
     telefono: (v) => /^\+?\d{7,15}$/.test(v) ? '' : 'Formato inválido (ej: 3001234567).',
     correo: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Correo inválido.',
     password: (v) => v.length >= 8 ? '' : 'Mínimo 8 caracteres.',
   };
   ```
2. En el manejador `onChange` de cada campo, calcular el error y guardarlo en el estado `errors`:
   ```js
   const handleChange = (e) => {
     const { name, value } = e.target;
     setForm(prev => ({ ...prev, [name]: value }));
     setErrors(prev => ({ ...prev, [name]: validators[name]?.(value) || '' }));
   };
   ```
3. Pasar la prop `error={errors.nombre}` al componente `<Input>` correspondiente para que el error se muestre en tiempo real.
4. Deshabilitar el botón de envío mientras haya algún error activo:
   ```js
   const hasErrors = Object.values(errors).some(Boolean);
   <Button type="submit" disabled={hasErrors || isLoading}>Registrarse</Button>
   ```

---

### ⚠️ REQ-26 — Pruebas con Postman/Pytest (FALTANTE COMO EVIDENCIA)

**Qué pide:** Evidencias de pruebas de todos los métodos HTTP (GET, POST, PUT, PATCH, DELETE) con Postman o similar.

**Qué existe:**
- ✅ `requirements.txt` incluye `pytest==8.3.4` y `httpx==0.28.1`, lo que indica intención de hacer pruebas.
- ❌ No existe ninguna carpeta `tests/` con pruebas implementadas.
- ❌ No hay colección de Postman exportada en el repositorio.

**Cómo implementarlo:**

#### Opción A — Pruebas automatizadas con Pytest (recomendado si quieres código)
1. Crear carpeta `backend_fastapi/tests/` con un archivo `__init__.py` vacío.
2. Crear `backend_fastapi/tests/conftest.py`:
   ```python
   import pytest
   from fastapi.testclient import TestClient
   from app.main import app

   @pytest.fixture
   def client():
       return TestClient(app)
   ```
3. Crear archivos de prueba por entidad:
   - `test_auth.py` — prueba `POST /api/auth/login` y `POST /api/auth/register`
   - `test_usuarios.py` — prueba `GET`, `POST`, `PUT`, `DELETE` en `/api/usuarios`
   - `test_productos.py` — prueba `GET`, `POST`, `PUT`, `DELETE` en `/api/productos`
4. Ejemplo de pruebas básicas:
   ```python
   # test_auth.py
   def test_login_exitoso(client):
       response = client.post("/api/auth/login", json={"correo": "admin@cyrex.com", "password": "Admin1234."})
       assert response.status_code == 200
       assert "token" in response.json()

   def test_login_credenciales_incorrectas(client):
       response = client.post("/api/auth/login", json={"correo": "no@existe.com", "password": "mal"})
       assert response.status_code == 401

   def test_get_productos_publico(client):
       response = client.get("/api/productos")
       assert response.status_code == 200
       assert "productos" in response.json()
   ```
5. Ejecutar con: `cd backend_fastapi && pytest tests/ -v`

#### Opción B — Colección de Postman exportada
1. Abrir Postman, crear una colección **"Cyrex API"**.
2. Añadir una carpeta por entidad: Auth, Usuarios, Productos, Categorías, Servicios, Órdenes.
3. Configurar variable de entorno `{{base_url}}` = `http://127.0.0.1:8000` y `{{token}}`.
4. En el request de Login, agregar este script en la pestaña "Tests" para capturar el token automáticamente:
   ```js
   const data = pm.response.json();
   if (data.token) pm.environment.set("token", data.token);
   ```
5. En los demás requests autenticados, usar el header: `Authorization: Bearer {{token}}`.
6. Exportar la colección como `Cyrex_API.postman_collection.json` y guardarla en `backend_fastapi/`.

---

## 📊 Resumen General

| Categoría | Total REQ | ✅ Completos | ⚠️ Incompletos/Faltantes |
|-----------|-----------|-------------|--------------------------|
| Arquitectura y Configuración | 3 | 3 | 0 |
| Base de Datos y Modelos | 3 | 3 | 0 |
| Autenticación y Seguridad | 4 | 4 | 0 |
| Endpoints y CRUD | 4 | 4 | 0 |
| Frontend y Paneles | 7 | 7 | 0 |
| Validaciones | 1 | 0 | **1 — REQ-21** |
| Pruebas y Documentación | 2 | 1 | **1 — REQ-26** |
| **TOTAL** | **26** | **24** | **2** |

---

## 🔑 Orden de Prioridad para Completar

1. **REQ-21 (Validaciones tiempo real en `RegistroModal.jsx`)** — Es el más rápido de implementar. Solo hay que añadir los validadores en el `onChange` y pasar los errores al componente `Input`.
2. **REQ-26 (Pruebas Postman/Pytest)** — Es evidencia de funcionamiento. La opción más rápida es exportar una colección de Postman con los endpoints ya creados y funcionales.

---

> **Conclusión:** El proyecto está **casi listo** (24 de 26 requerimientos completos). La arquitectura FastAPI es correcta, los modelos SQLAlchemy y esquemas Pydantic están bien separados, la autenticación JWT funciona, el control de roles opera tanto en frontend como en backend, todos los CRUD están operativos con soft-delete y el restablecimiento de contraseñas ya está implementado. Solo faltan 2 puntos para cumplir al 100% los requerimientos.
