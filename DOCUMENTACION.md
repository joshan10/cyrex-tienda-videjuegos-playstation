# Documentación Completa del Proyecto Cyrex Store

## 📋 Índice
1. [Descripción General del Proyecto](#descripción-general)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [React - Conceptos Fundamentales](#react-conceptos-fundamentales)
4. [Hooks de React Utilizados](#hooks-de-react-utilizados)
5. [Análisis del Frontend](#análisis-del-frontend)
6. [Análisis del Backend](#análisis-del-backend)
7. [Funcionalidades Implementadas](#funcionalidades-implementadas)
8. [Flujo de Trabajo](#flujo-de-trabajo)

---

## 🎮 Descripción General

Cyrex Store es una aplicación web de e-commerce para productos PlayStation con arquitectura cliente-servidor:

- **Frontend**: React + Vite (SPA moderna)
- **Backend**: Node.js + Express + MySQL
- **Autenticación**: JWT (JSON Web Tokens)
- **Roles**: Administrador, Empleado, Cliente

---

## 📁 Estructura de Carpetas

```
proyectos-react-tercer-trimestre/
├── frontend/                    # Aplicación React
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   │   ├── layout/        # Layouts principales
│   │   │   └── ui/            # Componentes UI (Button, Input, Toast)
│   │   ├── context/           # Context API (AuthContext)
│   │   ├── pages/             # Páginas de la aplicación
│   │   │   └── dashboard/     # Dashboards por rol
│   │   ├── services/          # API calls
│   │   ├── assets/            # Imágenes y recursos
│   │   ├── App.jsx            # Componente principal y rutas
│   │   └── main.jsx           # Punto de entrada
│   ├── package.json
│   └── vite.config.js
├── backend/                    # API Node.js
│   ├── src/
│   │   ├── config/           # Configuración (DB)
│   │   ├── controllers/      # Lógica de negocio
│   │   ├── middleware/       # Middlewares (auth, validation)
│   │   ├── models/           # Modelos de datos
│   │   └── routes/           # Rutas de la API
│   ├── uploads/               # Archivos subidos
│   ├── server.js             # Servidor Express
│   └── .env                  # Variables de entorno
└── DOCUMENTACION.md           # Este archivo
```

---

## ⚛️ React - Conceptos Fundamentales

### ¿Qué es React?
React es una biblioteca JavaScript para construir interfaces de usuario. Permite crear componentes reutilizables y manejar el estado de forma eficiente.

### Conceptos Clave

#### 1. **Componentes**
Los componentes son bloques de construcción de React. Pueden ser funcionales o de clase.

```jsx
// Componente funcional
function MiComponente() {
  return <div>Hola Mundo</div>;
}
```

#### 2. **JSX**
JSX es una extensión de JavaScript que permite escribir HTML dentro de JavaScript.

```jsx
const elemento = <h1>Hola, mundo!</h1>;
```

#### 3. **Props (Propiedades)**
Los props son datos que se pasan de un componente padre a un componente hijo.

```jsx
function Saludo({ nombre }) {
  return <h1>Hola, {nombre}</h1>;
}

// Uso: <Saludo nombre="Juan" />
```

#### 4. **State (Estado)**
El estado es información que un componente mantiene y puede cambiar con el tiempo.

```jsx
const [contador, setContador] = useState(0);
```

---

## 🪝 Hooks de React Utilizados

Los hooks son funciones especiales que permiten usar características de React en componentes funcionales.

### 1. **useState**
Permite agregar estado a componentes funcionales.

**Sintaxis:**
```jsx
const [estado, setEstado] = useState(valorInicial);
```

**Uso en el proyecto:**

#### En `Tienda.jsx`:
```jsx
// Estado para productos
const [productos, setProductos] = useState([]);

// Estado para carrito con inicialización desde localStorage
const [carrito, setCarrito] = useState(() => {
  const saved = localStorage.getItem('cyrex_carrito');
  return saved ? JSON.parse(saved) : [];
});

// Estado para controlar modal del carrito
const [isCartOpen, setIsCartOpen] = useState(false);
```

**Explicación:**
- `useState` crea una variable de estado y una función para actualizarla
- La inicialización con función lazy (`() => { ... }`) se usa cuando el valor inicial requiere cálculo
- El estado del carrito persiste usando localStorage

#### En `AuthContext.jsx`:
```jsx
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
```

**Explicación:**
- `user`: almacena la información del usuario autenticado
- `loading`: indica si está verificando la autenticación

#### En `Toast.jsx`:
```jsx
const [isVisible, setIsVisible] = useState(true);
const [toasts, setToasts] = useState([]);
```

**Explicación:**
- `isVisible`: controla la visibilidad de un toast individual
- `toasts`: array de todas las notificaciones activas

---

### 2. **useEffect**
Permite ejecutar efectos secundarios en componentes funcionales (llamadas a API, suscripciones, manipulación del DOM).

**Sintaxis:**
```jsx
useEffect(() => {
  // código del efecto
  return () => {
    // limpieza (opcional)
  };
}, [dependencias]);
```

**Uso en el proyecto:**

#### En `AuthContext.jsx`:
```jsx
useEffect(() => {
  const token = localStorage.getItem('cyrex_token');
  if (token) {
    authAPI.getProfile()
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('cyrex_token');
        localStorage.removeItem('cyrex_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  } else {
    setLoading(false);
  }
}, []);
```

**Explicación:**
- Se ejecuta solo una vez (array de dependencias vacío `[]`)
- Verifica si hay un token guardado al cargar la app
- Si hay token, obtiene el perfil del usuario
- Si hay error, limpia el token y el usuario
- `finally` asegura que `loading` se establezca en false

#### En `Tienda.jsx`:
```jsx
useEffect(() => {
  loadProducts();
}, []);
```

**Explicación:**
- Carga los productos al montar el componente
- Se ejecuta solo una vez

#### En `Toast.jsx`:
```jsx
useEffect(() => {
  const timer = setTimeout(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, duration);

  return () => clearTimeout(timer);
}, [duration, onClose]);
```

**Explicación:**
- Crea un temporizador para ocultar el toast después de `duration` ms
- La función de retorno limpia el temporizador (cleanup)
- Se ejecuta cada vez que cambian `duration` o `onClose`

---

### 3. **useContext**
Permite consumir contextos de React para compartir estado entre componentes sin prop drilling.

**Sintaxis:**
```jsx
const contexto = useContext(MiContexto);
```

**Uso en el proyecto:**

#### En `AuthContext.jsx`:
```jsx
// Creación del contexto
const AuthContext = createContext(null);

// Provider que envuelve la aplicación
export function AuthProvider({ children }) {
  const value = { user, loading, login, register, logout };
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
```

**Explicación:**
- `createContext` crea un contexto para compartir autenticación
- `AuthProvider` provee el contexto a todos los componentes hijos
- `useAuth` es un hook personalizado que facilita el consumo del contexto
- El hook verifica que se use dentro del provider

#### En `Tienda.jsx`:
```jsx
const { user } = useAuth();
```

**Explicación:**
- Obtiene el usuario autenticado del contexto
- No necesita recibir props de componentes padres

#### En `IniciarSesion.jsx`:
```jsx
const { login } = useAuth();
```

**Explicación:**
- Obtiene la función `login` del contexto
- Permite iniciar sesión desde cualquier componente

---

### 4. **useNavigate**
Hook de React Router para navegación programática.

**Uso en el proyecto:**

#### En `IniciarSesion.jsx`:
```jsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Redirección según rol
switch (data.user.rol) {
  case 'Administrador':
    navigate('/dashboard/admin');
    break;
  case 'Empleado':
    navigate('/dashboard/empleado');
    break;
  default:
    navigate('/dashboard/cliente');
}
```

**Explicación:**
- `useNavigate` devuelve una función para navegar
- Redirige al usuario según su rol después del login

---

### 5. **Custom Hooks**
Hooks personalizados que encapsulan lógica reutilizable.

#### `useToast` en `Toast.jsx`:
```jsx
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );

  return { addToast, ToastContainer };
}
```

**Explicación:**
- Encapsula la lógica de notificaciones
- `addToast`: agrega una nueva notificación
- `removeToast`: elimina una notificación por ID
- `ToastContainer`: componente que renderiza todas las notificaciones
- Retorna las funciones y el componente para usar en otros componentes

**Uso en `Tienda.jsx`:**
```jsx
const { addToast, ToastContainer } = useToast();

// Agregar notificación
addToast('Producto agregado al carrito', 'success');

// Renderizar contenedor en el JSX
<ToastContainer />
```

---

## 🎨 Análisis del Frontend

### Archivos Principales

#### 1. **App.jsx**
Componente principal que define las rutas de la aplicación.

**Funcionalidades:**
- Configuración de rutas con React Router
- Protección de rutas con `ProtectedRoute`
- Envoltura con `AuthProvider` para autenticación global

**Rutas Públicas:**
- `/` - Página de inicio
- `/iniciar-sesion` - Login
- `/recuperar-contrasena` - Recuperar contraseña
- `/quienes-somos` - Información de la empresa
- `/contacto` - Formulario de contacto

**Rutas Protegidas:**
- `/tienda` - Tienda (requiere autenticación)
- `/dashboard/admin` - Dashboard administrador (rol: Administrador)
- `/dashboard/empleado` - Dashboard empleado (rol: Empleado)
- `/dashboard/cliente` - Dashboard cliente (rol: Cliente)

---

#### 2. **AuthContext.jsx**
Contexto para manejar la autenticación en toda la aplicación.

**Funcionalidades:**
- `login`: Inicia sesión y guarda token en localStorage
- `register`: Registra nuevo usuario
- `logout`: Cierra sesión y limpia localStorage
- Verificación automática de token al cargar la app

**Estado:**
- `user`: Datos del usuario autenticado
- `loading`: Estado de carga durante verificación

---

#### 3. **Tienda.jsx**
Página principal de la tienda con carrito de compras.

**Hooks utilizados:**
- `useState`: productos, carrito, estados de UI
- `useEffect`: cargar productos al montar
- `useAuth`: obtener usuario autenticado
- `useToast`: notificaciones

**Funcionalidades:**
- Listado de productos activos
- Carrito de compras persistente en localStorage
- Agregar/eliminar productos del carrito
- Procesar compra (creación de orden)
- Descargar factura electrónica

**Estado del carrito:**
```jsx
const [carrito, setCarrito] = useState(() => {
  const saved = localStorage.getItem('cyrex_carrito');
  return saved ? JSON.parse(saved) : [];
});
```

**Funciones clave:**
- `agregarAlCarrito`: Agrega producto al carrito con validación de stock
- `quitarDelCarrito`: Elimina producto del carrito
- `actualizarCantidad`: Modifica cantidad de un producto
- `procesarCompra`: Crea orden en el backend
- `handleDownloadInvoice`: Genera y descarga factura

---

#### 4. **Dashboard Components**

##### **AdminDashboard.jsx**
Panel de administración completo.

**Funcionalidades:**
- Gestión de usuarios (crear, editar, eliminar)
- Gestión de productos (crear, editar, eliminar, stock)
- Gestión de categorías
- Gestión de órdenes (ver todas, cambiar estado)
- Gestión de servicios

##### **EmpleadoDashboard.jsx**
Panel limitado para empleados.

**Funcionalidades:**
- Gestión de productos (editar stock y estado)
- Gestión de órdenes (ver todas, cambiar estado)
- Edición de perfil personal

##### **ClienteDashboard.jsx**
Panel básico para clientes.

**Funcionalidades:**
- Ver órdenes propias (filtradas por usuario)
- Descargar facturas de órdenes
- Edición de perfil personal

---

#### 5. **Componentes UI**

##### **Button.jsx**
Componente de botón reutilizable.

**Props:**
- `variant`: estilo del botón ('primary', 'secondary')
- `disabled`: estado deshabilitado
- `onClick`: función al click

##### **Input.jsx**
Componente de input reutilizable.

**Props:**
- `type`: tipo de input
- `placeholder`: texto
- `value`: valor controlado
- `onChange`: función al cambiar
- `error`: mensaje de error

##### **Toast.jsx**
Sistema de notificaciones.

**Componentes:**
- `Toast`: Notificación individual
- `useToast`: Hook para gestionar notificaciones

**Tipos:**
- `success`: Notificación verde (éxito)
- `error`: Notificación roja (error)
- `info`: Notificación azul (información)

---

#### 6. **ProtectedRoute.jsx**
Componente para proteger rutas.

**Funcionalidades:**
- Verifica si el usuario está autenticado
- Verifica si tiene el rol permitido
- Redirige a login si no está autenticado
- Redirige a dashboard si no tiene rol

---

#### 7. **api.js**
Servicio para llamadas a la API.

**Funciones:**
- `request`: Helper para hacer peticiones HTTP
- `authAPI`: Endpoints de autenticación
- `usuariosAPI`: Endpoints de usuarios
- `productosAPI`: Endpoints de productos
- `ordenesAPI`: Endpoints de órdenes

**Uso:**
```jsx
const data = await productosAPI.getAll();
const response = await ordenesAPI.create(payload);
```

---

## 🔧 Análisis del Backend

### Archivos Principales

#### 1. **server.js**
Punto de entrada del servidor Express.

**Configuración:**
- CORS para permitir peticiones del frontend
- Middlewares globales (JSON, URL encoding, archivos estáticos)
- Rutas de la API
- Manejo de errores global

**Middlewares:**
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', ...],
  credentials: true
}));
app.use(express.json());
```

**Rutas:**
- `/api/auth` - Autenticación
- `/api/usuarios` - Usuarios
- `/api/productos` - Productos
- `/api/categorias` - Categorías
- `/api/ordenes` - Órdenes
- `/api/servicios` - Servicios
- `/api/upload` - Subida de archivos

---

#### 2. **Controllers**
Lógica de negocio de cada entidad.

**auth.controller.js:**
- `register`: Crea nuevo usuario
- `login`: Autentica usuario y genera JWT
- `getProfile`: Obtiene perfil del usuario autenticado

**producto.controller.js:**
- `getAll`: Obtiene todos los productos
- `getById`: Obtiene producto por ID
- `create`: Crea nuevo producto
- `update`: Actualiza producto
- `delete`: Elimina producto (soft delete)

**orden.controller.js:**
- `getAll`: Obtiene todas las órdenes
- `getById`: Obtiene orden por ID
- `create`: Crea nueva orden
- `updateStatus`: Actualiza estado de orden

---

#### 3. **Models**
Modelos de datos para interactuar con MySQL.

**usuario.model.js:**
- Métodos para CRUD de usuarios
- Validación de credenciales
- Obtención de permisos por rol

**producto.model.js:**
- Métodos para CRUD de productos
- Filtrado por estado y stock

**orden.model.js:**
- Métodos para CRUD de órdenes
- Creación de detalles de orden

---

#### 4. **Middleware**

**auth.middleware.js:**
- `verifyToken`: Verifica JWT en headers
- `authorizeRoles`: Verifica roles permitidos
- `authorizePermiso`: Verifica permisos específicos

**validators.js:**
- Validación de datos de entrada con express-validator
- `registerValidation`: Valida datos de registro
- `loginValidation`: Valida datos de login

---

#### 5. **Routes**
Definición de endpoints de la API.

**auth.routes.js:**
- `POST /register` - Registrar usuario
- `POST /login` - Iniciar sesión
- `GET /me` - Obtener perfil

**producto.routes.js:**
- `GET /` - Obtener todos los productos
- `GET /:id` - Obtener producto por ID
- `POST /` - Crear producto (requiere autenticación y rol)
- `PUT /:id` - Actualizar producto
- `DELETE /:id` - Eliminar producto

**orden.routes.js:**
- `GET /` - Obtener todas las órdenes
- `POST /` - Crear orden
- `PUT /:id/estado` - Actualizar estado

---

#### 6. **Config**

**database.js:**
- Configuración de conexión a MySQL
- Pool de conexiones para mejor rendimiento

```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true
});
```

---

## ✨ Funcionalidades Implementadas

### 1. **Autenticación**
- Registro de usuarios
- Login con JWT
- Logout
- Persistencia de sesión con localStorage
- Protección de rutas por rol

### 2. **Gestión de Usuarios**
- CRUD de usuarios (solo administrador)
- Edición de perfil propio (todos los roles)
- Asignación de roles

### 3. **Gestión de Productos**
- Listado de productos
- Creación de productos (admin)
- Edición de productos (admin/empleado)
- Eliminación de productos (admin)
- Control de stock
- Estados (activo/inactivo)

### 4. **Tienda y Carrito**
- Listado de productos activos
- Carrito de compras
- Persistencia del carrito en localStorage
- Agregar/eliminar productos
- Actualizar cantidades
- Validación de stock

### 5. **Proceso de Compra**
- Creación de órdenes
- Procesamiento de compra
- Notificaciones de éxito/error
- Generación de factura electrónica
- Descarga de factura

### 6. **Dashboards por Rol**

**Administrador:**
- Panel completo
- Gestión de usuarios
- Gestión de productos
- Gestión de categorías
- Gestión de órdenes
- Gestión de servicios

**Empleado:**
- Panel limitado
- Gestión de productos (stock y estado)
- Gestión de órdenes
- Edición de perfil

**Cliente:**
- Panel básico
- Ver órdenes propias
- Descargar facturas
- Edición de perfil

### 7. **Notificaciones**
- Sistema de Toast personalizado
- Tipos: success, error, info
- Auto-ocultado después de tiempo configurable
- Múltiples notificaciones simultáneas

---

## 🔄 Flujo de Trabajo

### 1. **Registro y Login**
1. Usuario se registra en `/iniciar-sesion` (modal de registro)
2. Datos enviados a `/api/auth/register`
3. Backend crea usuario y genera JWT
4. Token guardado en localStorage
5. Usuario redirigido según rol

### 2. **Navegación en Tienda**
1. Usuario autenticado accede a `/tienda`
2. `ProtectedRoute` verifica autenticación
3. `Tienda.jsx` carga productos desde `/api/productos`
4. Productos filtrados por estado 'activo' y stock > 0
5. Usuario puede agregar productos al carrito

### 3. **Proceso de Compra**
1. Usuario agrega productos al carrito
2. Carrito persiste en localStorage
3. Usuario hace clic en "Finalizar Compra"
4. Validación: carrito no vacío, usuario autenticado
5. Payload enviado a `/api/ordenes` con `items`
6. Backend crea orden y detalles
7. Carrito limpiado y localStorage actualizado
8. Notificación de éxito mostrada
9. Factura generada y disponible para descarga

### 4. **Gestión de Órdenes**
1. Cliente ve sus órdenes en `/dashboard/cliente`
2. Órdenes filtradas por `usuario_id`
3. Puede descargar factura de cada orden
4. Empleado/Admin ven todas las órdenes
5. Pueden cambiar estado de órdenes

### 5. **Edición de Perfil**
1. Usuario accede a tab "Mi Perfil" en dashboard
2. Formulario pre-llenado con datos actuales
3. Usuario modifica campos (nombre, apellido, dirección, teléfono)
4. Datos enviados a `/api/usuarios/:id`
5. Backend actualiza usuario en base de datos
6. Contexto actualizado con nuevos datos

---

## 🎓 Conceptos de React Aprendidos

### 1. **Componentes Funcionales**
- Todos los componentes son funciones
- Más simples que componentes de clase
- Hooks permiten usar estado y efectos

### 2. **Hooks Personalizados**
- `useAuth`: Encapsula lógica de autenticación
- `useToast`: Encapsula lógica de notificaciones
- Reutilizables en toda la aplicación

### 3. **Context API**
- Compartir estado sin prop drilling
- `AuthContext` para autenticación global
- Evita pasar props por múltiples niveles

### 4. **Manejo de Estado**
- `useState` para estado local
- `useContext` para estado global
- localStorage para persistencia

### 5. **Efectos Secundarios**
- `useEffect` para llamadas a API
- Cleanup de efectos (timers, suscripciones)
- Dependencias para control de ejecución

### 6. **Rutas Protegidas**
- `ProtectedRoute` componente
- Verificación de autenticación
- Verificación de roles
- Redirección condicional

### 7. **Formularios Controlados**
- Inputs con estado
- Validación en tiempo real
- Manejo de errores

### 8. **Optimización**
- Inicialización lazy de useState
- Memorización (potencial con useMemo/useCallback)
- Lazy loading de componentes

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [Vite](https://vitejs.dev)
- [Express](https://expressjs.com)

### Conceptos Clave para Aprender
- **Lifting State Up**: Elevar estado a componentes padres
- **Composition**: Composición de componentes
- **Render Props**: Patrón de render props
- **Custom Hooks**: Crear hooks personalizados
- **Performance**: useMemo, useCallback, React.memo

---

## 🚀 Próximos Pasos Sugeridos

1. **Mejorar el sistema de notificaciones**
   - Agregar sonidos
   - Posicionamiento configurable
   - Temas personalizados

2. **Implementar paginación**
   - Para listados de productos
   - Para listados de órdenes

3. **Agregar búsqueda y filtros**
   - Búsqueda de productos
   - Filtros por categoría
   - Filtros por precio

4. **Mejorar la experiencia de compra**
   - Wishlist de productos
   - Historial de compras
   - Recomendaciones

5. **Optimizar rendimiento**
   - Code splitting
   - Lazy loading de imágenes
   - Memoización de componentes

---

## 📝 Notas Finales

Este proyecto es una excelente oportunidad para aprender:
- **React moderno**: Hooks, Context API, React Router
- **API REST**: Diseño de endpoints, autenticación JWT
- **Base de datos**: MySQL, modelos de datos
- **Arquitectura**: Separación frontend/backend, clean code
- **Buenas prácticas**: Reutilización de componentes, custom hooks

**Consejos para aprender:**
1. Experimenta con los hooks: crea tus propios custom hooks
2. Modifica componentes: agrega nuevas funcionalidades
3. Analiza el flujo de datos: cómo pasa la información entre componentes
4. Practica con el backend: crea nuevos endpoints
5. Mejora la UI: agrega animaciones, transiciones

¡Sigue explorando y aprendiendo! 🎉
