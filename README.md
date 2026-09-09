# 🎮 Cyrex - Tienda Premium PlayStation

**Backend FastAPI + Frontend React** — Plataforma de comercio electrónico para videojuegos PlayStation con sistema de roles, autenticación JWT y paneles de administración.

---

## 📋 Tabla de Contenidos

- [Descripción del Proyecto](#descripción-del-proyecto)
- [Arquitectura](#arquitectura)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Endpoints de la API](#endpoints-de-la-api)
- [Sistema de Roles](#sistema-de-roles)
- [Funcionalidades](#funcionalidades)
- [Screenshots](#screenshots)

---

## Descripción del Proyecto

**Cyrex** es una tienda en línea especializada en videojuegos PlayStation premium. El sistema permite a los usuarios registrarse, iniciar sesión, navegar por el catálogo de productos, realizar compras y gestionar sus órdenes. Cuenta con tres niveles de acceso:

- **Administrador**: Gestión completa del sistema (usuarios, productos, órdenes, estadísticas)
- **Empleado**: Gestión de inventario y órdenes
- **Cliente**: Compras, historial de órdenes y perfil personal

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │  Vite   │  │   React  │  │  Router  │  │  Tailwind CSS  │  │
│  │   8.x   │  │   19.x   │  │   7.x   │  │     4.x        │  │
│  └─────────┘  └──────────┘  └──────────┘  └────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Páginas y Componentes                │   │
│  │  Index │ Login │ Tienda │ Dashboard Admin/Empleado/CLI  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │ fetch() + JWT Bearer
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (FastAPI)                        │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ FastAPI │  │  Pydantic│  │  SQLAlchemy│  │   python-jose  │  │
│  │  0.115  │  │  Schemas │  │   2.0    │  │    JWT Auth    │  │
│  └─────────┘  └──────────┘  └──────────┘  └────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      Routers / Endpoints                │   │
│  │  Auth │ Usuarios │ Productos │ Categorías │ Órdenes     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │ SQLAlchemy ORM
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BASE DE DATOS (MySQL)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ usuarios │  │productos │  │ categorías│  │   servicios   │  │
│  ├──────────┤  ├──────────┤  ├──────────┤  ├───────────────┤  │
│  │ roles    │  │ órdenes  │  │ permisos │  │token_reset    │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tecnologías Utilizadas

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **FastAPI** | 0.115.6 | Framework web async de alto rendimiento |
| **SQLAlchemy** | 2.0.36 | ORM para Base de Datos relacional |
| **PyMySQL** | 1.1.1 | Driver MySQL |
| **Pydantic** | 2.x | Validación de datos y schemas |
| **python-jose** | 3.3.0 | Generación y verificación JWT |
| **bcrypt** | 4.2.1 | Hash seguro de contraseñas |
| **Uvicorn** | 0.34.0 | Servidor ASGI |
| **Pytest** | 8.3.4 | Framework de pruebas |

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 19.2.8 | Librería de interfaces de usuario |
| **Vite** | 8.2.0 | Build tool y dev server |
| **React Router** | 7.18.2 | Enrutamiento SPA |
| **Tailwind CSS** | 4.3.3 | Framework CSS utility-first |
| **Fetch API** | Nativo | Comunicación HTTP con backend |

---

## Estructura del Proyecto

```
proyecto/
│
├── 📂 backend_fastapi/
│   ├── 📂 app/
│   │   ├── 📄 main.py              # Entry point FastAPI
│   │   ├── 📄 dependencies.py      # Dependencias JWT
│   │   ├── 📂 core/
│   │   │   ├── 📄 config.py        # Variables de entorno (pydantic-settings)
│   │   │   ├── 📄 database.py      # Conexión SQLAlchemy
│   │   │   └── 📄 security.py      # JWT + bcrypt
│   │   ├── 📂 models/
│   │   │   ├── 📄 entities.py      # Modelos SQLAlchemy
│   │   │   └── 📄 roles.py         # Modelo Roles/Permisos
│   │   ├── 📂 schemas/
│   │   │   ├── 📄 common.py        # Esquemas Pydantic (validación)
│   │   │   └── 📄 resources.py     # Esquemas categorías/servicios
│   │   ├── 📂 crud/
│   │   │   └── 📄 resources.py     # Funciones CRUD auxiliares
│   │   └── 📂 routers/
│   │       ├── 📄 auth.py          # Auth + Registro + Login + Reset
│   │       ├── 📄 usuarios.py      # CRUD Usuarios
│   │       ├── 📄 productos.py     # CRUD Productos
│   │       ├── 📄 catalogo.py      # Categorías + Servicios
│   │       ├── 📄 ordenes.py       # Órdenes de compra
│   │       └── 📄 upload.py        # Subida de imágenes
│   ├── 📂 database/
│   │   ├── 📄 cyrex_db.sql         # Script creación BD
│   │   ├── 📄 seed_usuarios.sql    # Datos iniciales
│   │   └── 📄 migration_reset_token.sql
│   ├── 📂 tests/
│   │   ├── 📄 conftest.py          # Fixtures de testing
│   │   └── 📄 test_auth.py         # Pruebas de autenticación
│   ├── 📂 uploads/                 # Imágenes subidas
│   ├── 📄 .env                     # Variables de entorno
│   ├── 📄 .env.example             # Plantilla de variables
│   └── 📄 requirements.txt         # Dependencias Python
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📄 main.jsx             # Entry point React
│   │   ├── 📄 App.jsx              # Configuración de rutas
│   │   ├── 📄 index.css            # Estilos globales + Tailwind
│   │   ├── 📂 context/
│   │   │   └── 📄 AuthContext.jsx  # Contexto de autenticación
│   │   ├── 📂 services/
│   │   │   └── 📄 api.js           # Servicios HTTP (fetch)
│   │   ├── 📂 components/
│   │   │   ├── 📄 Header.jsx       # Navbar + menú usuario
│   │   │   ├── 📄 Footer.jsx       # Pie de página
│   │   │   ├── 📄 Carrusel.jsx     # Carrusel de juegos
│   │   │   ├── 📄 ProtectedRoute.jsx # Guard de rutas
│   │   │   ├── 📄 RegistroModal.jsx  # Modal de registro
│   │   │   ├── 📄 WhatsAppButton.jsx # Botón flotante
│   │   │   ├── 📂 layout/
│   │   │   │   └── 📄 LayoutPrincipal.jsx
│   │   │   └── 📂 ui/
│   │   │       ├── 📄 Button.jsx
│   │   │       ├── 📄 Input.jsx
│   │   │       ├── 📄 Select.jsx
│   │   │       └── 📄 Toast.jsx
│   │   ├── 📂 pages/
│   │   │   ├── 📄 Index.jsx        # Página principal
│   │   │   ├── 📄 IniciarSesion.jsx # Login
│   │   │   ├── 📄 RecuperarContrasena.jsx
│   │   │   ├── 📄 RestablecerContrasena.jsx
│   │   │   ├── 📄 QuienesSomos.jsx
│   │   │   ├── 📄 Contacto.jsx
│   │   │   ├── 📄 Tienda.jsx       # Catálogo (protegida)
│   │   │   └── 📂 dashboard/
│   │   │       ├── 📄 AdminDashboard.jsx
│   │   │       ├── 📄 EmpleadoDashboard.jsx
│   │   │       └── 📄 ClienteDashboard.jsx
│   │   └── 📂 assets/              # Imágenes, iconos
│   ├── 📄 package.json
│   ├── 📄 vite.config.js
│   └── 📄 index.html
│
├── 📂 screenshots/                  # Documentación de requerimientos
│   ├── 📄 00-INDICE-REQUERIMIENTOS.md
│   ├── 🖼️ REQ-01-Arquitectura-Tecnologica.png
│   └── ... (26 requerimientos)
│
├── 📄 Requerimientos_Proyecto_jhan.md
├── 📄 DOCUMENTACION.md
└── 📄 README.md                     # Este archivo
```

---

## Requisitos Previos

- **Python** 3.10 o superior
- **Node.js** 18+ y **pnpm** (o npm)
- **MySQL** 8.0 o superior
- **Git**

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/cyrex-project.git
cd cyrex-project
```

### 2. Configurar el Backend

```bash
# Navegar al directorio del backend
cd backend_fastapi

# Crear entorno virtual
python -m venv .venv

# Activar entorno virtual
# Linux/Mac:
source .venv/bin/activate
# Windows:
.venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

### 3. Configurar Base de Datos

```bash
# Crear la base de datos en MySQL
mysql -u root -p
CREATE DATABASE cyrex_db;
EXIT;

# Importar estructura
mysql -u root -p cyrex_db < database/cyrex_db.sql

# Importar datos iniciales (opcional)
mysql -u root -p cyrex_db < database/seed_usuarios.sql
```

### 4. Configurar Variables de Entorno

```bash
# Copiar plantilla
cp .env.example .env

# Editar .env con tus credenciales
nano .env
```

**Archivo `.env`:**
```env
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=developer
DB_PASSWORD=tu_password
DB_NAME=cyrex_db
JWT_SECRET=tu_clave_secreta_jwt_aqui
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
```

### 5. Ejecutar Backend

```bash
uvicorn app.main:app --reload --port 4000
```

La API estará disponible en: `http://localhost:4000`

### 6. Configurar el Frontend

```bash
# Navegar al directorio del frontend
cd ../frontend

# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev
```

El frontend estará disponible en: `http://localhost:5173`

---

## Configuración

### Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor backend | `4000` |
| `DB_HOST` | Host de MySQL | `localhost` |
| `DB_PORT` | Puerto de MySQL | `3306` |
| `DB_USER` | Usuario de MySQL | `developer` |
| `DB_PASSWORD` | Contraseña de MySQL | `***` |
| `DB_NAME` | Nombre de la BD | `cyrex_db` |
| `JWT_SECRET` | Secreto para firmar JWT | `clave-super-secreta` |
| `JWT_EXPIRES_IN` | Tiempo de expiración JWT | `24h` |
| `CORS_ORIGIN` | Origen permitido CORS | `http://localhost:5173` |

### Swagger UI

La documentación interactiva de la API está disponible en:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## Endpoints de la API

### Autenticación (`/api/auth`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/api/auth/register` | Registrar nuevo usuario | ❌ |
| `POST` | `/api/auth/login` | Iniciar sesión | ❌ |
| `GET` | `/api/auth/me` | Obtener perfil | ✅ |
| `POST` | `/api/auth/forgot-password` | Solicitar recuperación | ❌ |
| `POST` | `/api/auth/reset-password` | Restablecer contraseña | ❌ |

### Usuarios (`/api/usuarios`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/usuarios` | Listar todos | Admin |
| `GET` | `/api/usuarios/:id` | Obtener por ID | ✅ |
| `POST` | `/api/usuarios` | Crear usuario | Admin |
| `PUT` | `/api/usuarios/:id` | Actualizar usuario | Admin |
| `DELETE` | `/api/usuarios/:id` | Desactivar usuario | Admin |

### Productos (`/api/productos`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/productos` | Listar con filtros | ❌ |
| `GET` | `/api/productos/:id` | Obtener por ID | ❌ |
| `POST` | `/api/productos` | Crear producto | Admin |
| `PUT` | `/api/productos/:id` | Actualizar producto | Admin |
| `DELETE` | `/api/productos/:id` | Desactivar producto | Admin |

### Categorías (`/api/categorias`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/categorias` | Listar categorías | ❌ |
| `GET` | `/api/categorias/:id` | Obtener por ID | ❌ |

### Servicios (`/api/servicios`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/servicios` | Listar servicios | ❌ |
| `GET` | `/api/servicios/:id` | Obtener por ID | ❌ |

### Órdenes (`/api/ordenes`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/ordenes` | Listar órdenes | ✅ |
| `GET` | `/api/ordenes/:id` | Obtener por ID | ✅ |
| `POST` | `/api/ordenes` | Crear orden | ✅ |
| `PATCH` | `/api/ordenes/:id/estado` | Actualizar estado | Admin/Empleado |
| `GET` | `/api/ordenes/stats/ventas` | Estadísticas | Admin |

### Upload (`/api/upload`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/api/upload` | Subir imagen | ✅ |

---

## Sistema de Roles

### Roles Disponibles

| Rol | ID | Descripción |
|-----|----|-------------|
| **Administrador** | 1 | Acceso completo al sistema |
| **Empleado** | 2 | Gestión de inventario y órdenes |
| **Cliente** | 3 | Compras y perfil personal |

### Permisos por Rol

| Funcionalidad | Admin | Empleado | Cliente |
|---------------|:-----:|:--------:|:-------:|
| Ver dashboard | ✅ | ✅ | ✅ |
| Gestionar usuarios | ✅ | ❌ | ❌ |
| Crear productos | ✅ | ❌ | ❌ |
| Editar stock/estado | ✅ | ✅ | ❌ |
| Ver catálogo | ✅ | ✅ | ✅ |
| Realizar compras | ❌ | ❌ | ✅ |
| Ver historial órdenes | ✅ | ✅ | ✅ (propias) |
| Cambiar estado órdenes | ✅ | ✅ | ❌ |
| Ver estadísticas | ✅ | ❌ | ❌ |

### Autenticación JWT

```javascript
// Frontend: Enviar token en cada petición
const response = await fetch('/api/usuarios', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

```python
# Backend: Verificar token en endpoints protegidos
@router.get("")
def get_all(user: dict = Depends(require_roles("Administrador"))):
    # Solo administradores pueden acceder
    ...
```

---

## Funcionalidades

### ✅ Implementadas

- **Autenticación completa**: Registro, login, JWT, recuperación de contraseña
- **Sistema de roles**: Administrador, Empleado, Cliente con permisos diferenciados
- **CRUD completo**: Usuarios, Productos, Categorías, Servicios, Órdenes
- **Validación en tiempo real**: Frontend y Backend con Pydantic
- **Seguridad**: Contraseñas con hash bcrypt, variables de entorno
- **Paneles de administración**: Dashboards diferenciados por rol
- **Subida de imágenes**: Gestión de archivos estáticos
- **Diseño responsive**: Tailwind CSS para todos los dispositivos
- **Botón WhatsApp**: Componente flotante reutilizable
- **Documentación Swagger**: API documentada interactivamente

### 📊 Modelos de Base de Datos

- `usuarios` - Usuarios del sistema
- `roles` - Roles disponibles
- `permisos` - Permisos del sistema
- `roles_permisos` - Relación roles-permisos
- `productos` - Catálogo de productos
- `categorias` - Categorías de productos
- `servicios` - Servicios ofrecidos
- `ordenes` - Órdenes de compra
- `ordenes_detalles` - Detalle de órdenes
- `password_reset_tokens` - Tokens de recuperación

---

## Screenshots

La carpeta `screenshots/` contiene documentación visual de cada requerimiento:

```
screenshots/
├── 00-INDICE-REQUERIMIENTOS.md
├── REQ-01-Arquitectura-Tecnologica.png
├── REQ-02-Carpeta-Backend-FastAPI.png
├── REQ-03-Entorno-FastAPI.png
├── REQ-04-Base-Datos-SQL.png
├── REQ-05-Tabla-Usuarios.png
├── REQ-06-Modelos-Esquemas.png
├── REQ-07-Conexion-DB-FastAPI.png
├── REQ-08-Conexion-FullStack.png
├── REQ-09-Registro-Clientes.png
├── REQ-10-Inicio-Sesion.png
├── REQ-11-Autenticacion-JWT.png
├── REQ-12-Control-Roles.png
├── REQ-13-Hooks-React.png
├── REQ-14-Endpoints-API.png
├── REQ-15-Recuperacion-Contrasena.png
├── REQ-16-CRUD-Usuarios.png
├── REQ-17-Panel-Administracion.png
├── REQ-18-Panel-Empleado.png
├── REQ-19-Panel-Cliente.png
├── REQ-20-Usuario-Navbar.png
├── REQ-21-Validaciones-Tiempo-Real.png
├── REQ-22-Seguridad-Contrasenas.png
├── REQ-23-Variables-Entorno.png
├── REQ-24-WhatsApp-Button.png
├── REQ-25-Swagger-FastAPI.png
└── REQ-26-Pruebas-Postman.png
```

---

## Desarrollo

### Ejecutar pruebas

```bash
cd backend_fastapi
pytest tests/ -v
```

### Construir frontend para producción

```bash
cd frontend
pnpm build
```

---

## Licencia

Proyecto académico - Tercer Trimestre

---

## Autor

**Joshan pereira** - Desarrollador Full Stack

---

*Última actualización: Septiembre 2026*
