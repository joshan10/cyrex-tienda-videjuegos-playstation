# Diseño de Endpoints - Cyrex API

Tabla de diseño recurso-verbo-ruta-código previa al código.

## Autenticación

| Recurso | Verbo | Ruta | Código | Descripción |
|---------|-------|------|--------|-------------|
| Auth | POST | /api/auth/register | 201 | Registrar nuevo usuario |
| Auth | POST | /api/auth/login | 200 | Iniciar sesión |
| Auth | GET | /api/auth/me | 200 | Obtener perfil del usuario autenticado |
| Auth | POST | /api/auth/forgot-password | 200 | Solicitar recuperación de contraseña |
| Auth | POST | /api/auth/reset-password | 200 | Restablecer contraseña con token |

## Usuarios

| Recurso | Verbo | Ruta | Código | Descripción |
|---------|-------|------|--------|-------------|
| Usuarios | GET | /api/usuarios | 200 | Listar todos los usuarios (Admin) |
| Usuarios | GET | /api/usuarios/{user_id} | 200 | Obtener usuario por ID |
| Usuarios | POST | /api/usuarios | 201 | Crear usuario (Admin) |
| Usuarios | PUT | /api/usuarios/{user_id} | 200 | Actualizar usuario (Admin) |
| Usuarios | DELETE | /api/usuarios/{user_id} | 204 | Desactivar usuario (Admin) |

## Productos

| Recurso | Verbo | Ruta | Código | Descripción |
|---------|-------|------|--------|-------------|
| Productos | GET | /api/productos | 200 | Listar productos con filtros y paginación |
| Productos | GET | /api/productos/{product_id} | 200 | Obtener producto por ID |
| Productos | POST | /api/productos | 201 | Crear producto (Admin) |
| Productos | PUT | /api/productos/{product_id} | 200 | Actualizar producto (Admin/Empleado) |
| Productos | DELETE | /api/productos/{product_id} | 204 | Desactivar producto (Admin) |

## Categorías

| Recurso | Verbo | Ruta | Código | Descripción |
|---------|-------|------|--------|-------------|
| Categorías | GET | /api/categorias | 200 | Listar todas las categorías |
| Categorías | GET | /api/categorias/{item_id} | 200 | Obtener categoría por ID |
| Categorías | POST | /api/categorias | 201 | Crear categoría (Admin) |
| Categorías | PUT | /api/categorias/{item_id} | 200 | Actualizar categoría (Admin) |
| Categorías | DELETE | /api/categorias/{item_id} | 204 | Desactivar categoría (Admin) |

## Servicios

| Recurso | Verbo | Ruta | Código | Descripción |
|---------|-------|------|--------|-------------|
| Servicios | GET | /api/servicios | 200 | Listar servicios activos |
| Servicios | GET | /api/servicios/{item_id} | 200 | Obtener servicio por ID |
| Servicios | POST | /api/servicios | 201 | Crear servicio (Admin) |
| Servicios | PUT | /api/servicios/{item_id} | 200 | Actualizar servicio (Admin) |
| Servicios | DELETE | /api/servicios/{item_id} | 204 | Desactivar servicio (Admin) |

## Órdenes

| Recurso | Verbo | Ruta | Código | Descripción |
|---------|-------|------|--------|-------------|
| Órdenes | GET | /api/ordenes/stats/ventas | 200 | Estadísticas de ventas (Admin) |
| Órdenes | GET | /api/ordenes | 200 | Listar órdenes |
| Órdenes | GET | /api/ordenes/{order_id} | 200 | Obtener orden por ID |
| Órdenes | POST | /api/ordenes | 201 | Crear orden (Cliente) |
| Órdenes | PATCH | /api/ordenes/{order_id}/estado | 200 | Actualizar estado de orden (Admin/Empleado) |

## Archivos

| Recurso | Verbo | Ruta | Código | Descripción |
|---------|-------|------|--------|-------------|
| Archivos | POST | /api/archivos | 201 | Subir imagen (Admin) |

## PQR

| Recurso | Verbo | Ruta | Código | Descripción |
|---------|-------|------|--------|-------------|
| PQR | POST | /api/pqr | 201 | Registrar una petición, queja o reclamo (usuario autenticado) |
| PQR | GET | /api/pqr | 200 | Listar PQR propias o todas para Admin/Empleado |
| PQR | GET | /api/pqr/{pqr_id} | 200 | Consultar una PQR propia o autorizada |
| PQR | PATCH | /api/pqr/{pqr_id} | 200 | Actualizar estado y respuesta (Admin/Empleado) |
| PQR | GET | /api/pqr/resumen | 200 | Indicadores de PQR (Admin/Empleado) |

## Chatbot

| Recurso | Verbo | Ruta | Código | Descripción |
|---------|-------|------|--------|-------------|
| Chatbot | POST | /api/chatbot/message | 200 | Enviar mensaje y recibir respuesta FAQ o IA |
| Chatbot | GET | /api/chatbot/{conversation_id} | 200 | Consultar historial propio |

## PDF y reportes

| Recurso | Verbo | Ruta | Código | Descripción |
|---------|-------|------|--------|-------------|
| Reportes | GET | /api/ventas/reporte/pdf | 200 | Descargar reporte de ventas en PDF (Administrador) |
| Facturas | GET | /api/ventas/factura/{numero_factura}/pdf | 200 | Descargar factura PDF (cliente propietario, Empleado o Administrador) |
| Facturas | GET | /api/ventas/mis-facturas | 200 | Listar facturas del cliente autenticado |

## Errores comunes

| Código | Descripción |
|--------|-------------|
| 400 | Solicitud incorrecta / Validación |
| 401 | No autenticado / Token inválido |
| 403 | Acceso denegado / Rol insuficiente |
| 404 | Recurso no encontrado |
| 409 | Conflicto (dato duplicado) |
| 413 | Archivo demasiado grande |
| 422 | Error de validación |
| 500 | Error interno del servidor |
