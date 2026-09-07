# Requerimientos del Proyecto (REACT + FASTAPI)

**REQ-01 - Arquitectura Tecnológica**
* Integración Full Stack: Frontend React + Vite consumiendo endpoints FastAPI en formato JSON mediante fetch, Axios u otra librería. Conexión Backend a Base de Datos relacional SQL.

**REQ-02 - Carpeta Backend con FastAPI**
* Organización clara del proyecto separando Frontend y Backend. Estructura sugerida para el backend con subcarpeta app/ y dependencias.

**REQ-03 - Entorno FastAPI**
* Configuración y activación de entorno virtual Python (venv) e instalación de dependencias principales registradas en requirements.txt (fastapi, uvicorn, sqlalchemy, etc.).

**REQ-04 - Base de Datos SQL**
* Estructura relacional SQL mantenida y completada con mínimo las entidades: Usuarios, Roles, Permisos, Productos y Servicios.

**REQ-05 - Tabla de Usuarios**
* Estructura con campos: Nombre, Apellido, Tipo/Número documento, Dirección, Teléfono, Correo, Contraseña, Rol, Estado. La contraseña debe almacenarse SOLO con hash seguro.

**REQ-06 - Modelos y Esquemas**
* Separación en FastAPI de modelos SQLAlchemy (Base de Datos) y esquemas Pydantic (Validación). Esquemas deben validar tipos, campos obligatorios, longitudes y formatos.

**REQ-07 - Conexión DB con FastAPI**
* Establecer conexión funcional con SQL. Parámetros de configuración mediante variables de entorno en archivo .env sin exponer contraseñas en código fuente.

**REQ-08 - Conexión FrontEnd, BackEnd y DB**
* Comunicación interactiva. El formulario React envía peticiones a FastAPI, que realiza re-validación (independiente del FrontEnd y opera sobre la base de datos SQL.

**REQ-09 - Registro de Clientes**
* Formulario de registro conectado a POST /api/usuarios/registro. Flujo completo: validaciones, verificación de no duplicados (correo/doc), hash de contraseña, guardar y respuesta JSON.

**REQ-10 - Inicio de Sesión**
* Formulario de login conectado a POST /api/auth/login. Flujo de inicio de sesión: FastAPI verifica credenciales y genera un JSON Web Token (JWT) si son correctas.

**REQ-11 - Autenticación JWT**
* React envía el token en la cabecera (Authorization: Bearer TOKEN) en las peticiones que lo requieran. FastAPI verifica firma, validez, expiración, usuario y rol asociado.

**REQ-12 - Control de Roles**
* Roles mínimos: Administrador, Empleado, Cliente. Control implementado en Frontend y Backend (BE tiene la autorización definitiva). Roles definen accesos y funciones.

**REQ-13 - Uso de archivos y Hooks**
* Creación e implementación de Hooks para gestionar diferentes estados en la aplicación React, utilizando los distintos Hooks disponibles, como useState, useEffect, useContext, entre otros.

**REQ-14 - Endpoints de la API**
* Creación de endpoints para la gestión de Usuarios, Productos y Servicios (operaciones REST con rutas estructuradas por entidad).

**REQ-15 - Recuperación de Contraseña**
* implementacion de la funcionalidad de  recuperación de contraseña olvidada por el usuario (Cliente-Empleado)

**REQ-16 - Operaciones CRUD Usuarios**
* CRUD completo en usuarios para Consultar, Crear, Editar, Actualizar, Eliminar y Cambiar Estado (Activo/Inactivo para mantener consistencia histórica).

**REQ-17 - Panel de Administración**
* Panel protegido por autenticación y autorización desarrollado en React, Vite, Tailwind CSS y FastAPI. Solo administradores pueden gestionar usuarios y módulos del proyecto.

**REQ-18 - Panel de Empleado**
* Panel que restringe el acceso mostrando únicamente las funcionalidades correspondientes al rol de empleado. BE valida el rol antes de permitir operaciones restringidas.

**REQ-19 - Panel de Cliente**
* Panel para el rol de cliente donde accede a sus servicios y productos. El sistema identifica al usuario mediante la información contenida en el JWT.

**REQ-20 - Usuario en el Navbar**
* React muestra el nombre del usuario autenticado en el Navbar tras el login exitoso (ej. 'Bienvenido, Juan | Cerrar sesión'). Se actualiza automáticamente al cerrar sesión.

**REQ-21 - Validaciones Tiempo Real**
* Validación de campos obligatorios, longitudes mín/máx, tipos de datos, expresiones regulares, correos, teléfonos y contraseñas. Ejecución obligatoria tanto en React como en FastAPI.

**REQ-22 - Seguridad de Contraseñas**
* Prohibición de texto plano en DB. Uso obligatorio de algoritmos de hashing seguros (como bcrypt) en FastAPI para generación, almacenamiento y verificación en login.

**REQ-23 - Variables de Entorno**
* Uso de variables de entorno (ej. en archivo .env local) para resguardar información sensible (contraseñas de base de datos, claves secretas, tokens y credenciales).

**REQ-24 - Componente Flotante WhatsApp**
* Conservar el botón reutilizable 'WhatsAppButton.jsx' con posición fija, enlace configurado y diseño coherente. Sigue funcionando con independencia del backend.

**REQ-25 - Documentación FastAPI (Swagger)**
* Habilitación y visualización de la documentación interactiva en http://127.0.0.1:8000/docs. Debe usarse Swagger UI como evidencia del funcionamiento de la API.

**REQ-26 - Pruebas con Postman Métodos HTTP**
* Evidencias de pruebas de endpoints mediante Postman o similar. Implementación y demostración de los métodos estándar GET, POST, PUT, PATCH, DELETE.

