# DOCUMENTACION COMPLETA - CYREX STORE

> Proyecto E-Commerce de videojuegos PlayStation
> Stack: React + Vite (Frontend) | Node.js + Express + MySQL (Backend)

---

## INDICE

1. [Estructura del Proyecto](#1-estructura-del-proyecto)
2. [Que es React y por que se usa](#2-que-es-react-y-por-que-se-usa)
3. [Conceptos Fundamentales de React](#3-conceptos-fundamentales-de-react)
4. [Todos los Hooks de React (explicados)](#4-todos-los-hooks-de-react-explicados)
5. [Hooks Personalizados del Proyecto](#5-hooks-personalizados-del-proyecto)
6. [Como Funciona el Enrutamiento](#6-como-funciona-el-enrutamiento)
7. [Manejo de Estado Global (Context API)](#7-manejo-de-estado-global-context-api)
8. [Componentes UI Reutilizables](#8-componentes-ui-reutilizables)
9. [Analisis Completo del Frontend (Archivo por Archivo)](#9-analisis-completo-del-frontend-archivo-por-archivo)
10. [Analisis Completo del Backend](#10-analisis-completo-del-backend)
11. [Base de Datos](#11-base-de-datos)
12. [Flujo de Datos Completo](#12-flujo-de-datos-completo)
13. [Resumen de Todas las Funcionalidades](#13-resumen-de-todas-las-funcionalidades)

---

## 1. ESTRUCTURA DEL PROYECTO

```
proyectos-react-tercer-trimestre/
│
├── frontend/                          # Aplicacion React (Cliente)
│   ├── src/
│   │   ├── main.jsx                   # Punto de entrada de React
│   │   ├── App.jsx                    # Componente raiz + configuracion de rutas
│   │   ├── index.css                  # Estilos globales + Tailwind CSS
│   │   │
│   │   ├── assets/                    # Recursos estaticos
│   │   │   ├── icons/                 # Logos (Cyrex.png, logo-sin-fondo.png)
│   │   │   ├── images/                # Fotos generales (foto1-10.webp)
│   │   │   └── img-games/             # Imagenes de 10 juegos destacados
│   │   │
│   │   ├── components/                # Componentes reutilizables
│   │   │   ├── Header.jsx             # Barra de navegacion
│   │   │   ├── Footer.jsx             # Pie de pagina
│   │   │   ├── Carrusel.jsx           # Carrusel automatico de juegos
│   │   │   ├── ScrollReveal.jsx       # Animacion al hacer scroll
│   │   │   ├── ProtectedRoute.jsx     # Guard de rutas autenticadas
│   │   │   ├── RegistroModal.jsx      # Modal de registro (9 campos)
│   │   │   ├── TarjetaModal.jsx       # Modal de tarjeta de credito
│   │   │   ├── WhatsAppButton.jsx     # Boton flotante de WhatsApp
│   │   │   ├── layout/
│   │   │   │   └── LayoutPrincipal.jsx # Layout: Header + children + Footer
│   │   │   └── ui/
│   │   │       ├── Button.jsx         # Boton reutilizable (3 variantes)
│   │   │       ├── Input.jsx          # Input reutilizable con label/error
│   │   │       ├── Select.jsx         # Select reutilizable con opciones
│   │   │       └── Toast.jsx          # Sistema de notificaciones + hook
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Contexto de autenticacion global
│   │   │
│   │   ├── data/
│   │   │   └── games.js               # Datos estaticos de 10 juegos
│   │   │
│   │   ├── pages/                     # Paginas de la aplicacion
│   │   │   ├── Index.jsx              # Pagina de inicio (hero + metricas)
│   │   │   ├── IniciarSesion.jsx      # Formulario de login
│   │   │   ├── RecuperarContrasena.jsx # Recuperar contrasena
│   │   │   ├── RecoverPassword.jsx    # Wrapper de RecuperarContrasena
│   │   │   ├── QuienesSomos.jsx       # Pagina estatica: Vision/Mision/Valores
│   │   │   ├── Contacto.jsx           # Formulario de contacto validado
│   │   │   ├── Tienda.jsx             # Tienda + Carrito + Compra
│   │   │   └── dashboard/
│   │   │       ├── AdminDashboard.jsx    # Panel Admin (4 tabs)
│   │   │       ├── EmpleadoDashboard.jsx # Panel Empleado (3 tabs)
│   │   │       └── ClienteDashboard.jsx  # Panel Cliente (2 tabs)
│   │   │
│   │   └── services/
│   │       └── api.js                 # Cliente HTTP para toda la API
│   │
│   ├── package.json                   # Dependencias del frontend
│   ├── vite.config.js                 # Configuracion de Vite
│   ├── eslint.config.js               # Configuracion de ESLint
│   └── index.html                     # HTML base
│
├── backend/                           # API REST (Servidor)
│   ├── server.js                      # Servidor Express (puerto 4000)
│   ├── .env                           # Variables de entorno
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js            # Pool de conexiones MySQL
│   │   │   └── jwt.js                 # Configuracion JWT
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js      # verifyToken + authorizeRoles
│   │   │   └── validators.js          # Validaciones con express-validator
│   │   ├── models/
│   │   │   ├── usuario.model.js       # CRUD usuarios + permisos
│   │   │   ├── producto.model.js      # CRUD productos + filtros
│   │   │   ├── categoria.model.js     # CRUD categorias
│   │   │   ├── servicio.model.js      # CRUD servicios
│   │   │   └── orden.model.js         # CRUD ordenes + transacciones
│   │   ├── controllers/
│   │   │   ├── auth.controller.js     # Login, register, profile
│   │   │   ├── producto.controller.js # CRUD productos
│   │   │   ├── categoria.controller.js# CRUD categorias
│   │   │   ├── usuario.controller.js  # CRUD usuarios
│   │   │   ├── orden.controller.js    # CRUD ordenes + stats
│   │   │   └── servicio.controller.js # CRUD servicios
│   │   └── routes/
│   │       ├── auth.routes.js         # /api/auth/*
│   │       ├── usuario.routes.js      # /api/usuarios/*
│   │       ├── producto.routes.js     # /api/productos/*
│   │       ├── categoria.routes.js    # /api/categorias/*
│   │       ├── orden.routes.js        # /api/ordenes/*
│   │       ├── servicio.routes.js     # /api/servicios/*
│   │       └── upload.routes.js       # /api/upload
│   │
│   ├── database/
│   │   ├── cyrex_db.sql               # Script completo de BD
│   │   └── seed_usuarios.sql          # Datos de prueba
│   │
│   └── uploads/                       # Imagenes subidas por admins
│
└── DOCUMENTACION.md                   # Documentacion existente
```

---

## 2. QUE ES REACT Y POR QUE SE USA

React es una **biblioteca JavaScript** (no un framework) creada por Meta (Facebook) para construir interfaces de usuario. Se usa en este proyecto porque:

- **Componentes reutilizables**: Cada parte de la UI es un componente independiente
- **Virtual DOM**: React actualiza solo lo que cambia, no toda la pagina
- **Ecosistema enorme**: React Router, Context API, y miles de librerias
- **Separacion clara**: UI declarativa que se actualiza segun el estado

### Como funciona React internamente

```
1. El usuario interactua (click, typing, etc.)
2. React actualiza el STATE del componente
3. React re-renderiza el componente con el nuevo estado
4. React compara el Virtual DOM viejo vs el nuevo
5. React actualiza SOLO lo que cambio en el DOM real
```

---

## 3. CONCEPTOS FUNDAMENTALES DE REACT

### 3.1 Componentes

Un componente es una **funcion que retorna JSX** (parecido a HTML dentro de JavaScript).

```jsx
// Esto es un componente funcional
function Saludo({ nombre }) {
  return <h1>Hola, {nombre}</h1>;
}

// Se usa asi:
// <Saludo nombre="Joshan" />
```

**En el proyecto hay 28 componentes** distribuidos en:
- **Componentes de layout**: LayoutPrincipal, Header, Footer
- **Componentes UI**: Button, Input, Select, Toast
- **Componentes feature**: Carrusel, ProtectedRoute, ScrollReveal, RegistroModal, TarjetaModal, WhatsAppButton
- **Paginas**: Index, Tienda, IniciarSesion, Contacto, QuienesSomos, etc.
- **Dashboards**: AdminDashboard, EmpleadoDashboard, ClienteDashboard

### 3.2 JSX

JSX es una sintaxis que parece HTML pero es JavaScript. Compila a `React.createElement()`.

```jsx
// Esto es JSX:
const elemento = (
  <div className="container">
    <h1>Tienda</h1>
    <p>{producto.nombre}</p>
    <p>${producto.precio}</p>
  </div>
);

// React lo convierte internamente en:
// React.createElement('div', {className: 'container'},
//   React.createElement('h1', null, 'Tienda'),
//   React.createElement('p', null, producto.nombre),
//   React.createElement('p', null, '$' + producto.precio)
// )
```

**Reglas de JSX:**
- Se usa `className` en lugar de `class`
- Todo debe estar dentro de un solo elemento padre (o usar Fragment `<>...</>`)
- Las expresiones JavaScript van entre llaves `{ }`
- Los eventos se escriben en camelCase (`onClick`, no `onclick`)

### 3.3 Props (Propiedades)

Son datos que un componente **recibe de su padre**. Son de solo lectura (no se pueden modificar).

```jsx
// Componente hijo que recibe props
function Button({ children, variant = 'primary', onClick }) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}

// Uso en el componente padre:
// <Button variant="secondary" onClick={miFuncion}>Click me</Button>
```

**Props en el proyecto:**
| Componente | Props que recibe |
|---|---|
| `Button` | `children`, `type`, `variant`, `className`, `...props` |
| `Input` | `label`, `error`, `id`, `className`, `...props` |
| `Select` | `label`, `error`, `id`, `options`, `className`, `...props` |
| `ProtectedRoute` | `children`, `allowedRoles` |
| `ScrollReveal` | `children`, `className`, `delay` |
| `TarjetaModal` | `isOpen`, `onClose`, `onConfirm`, `initialData` |
| `RegistroModal` | `isOpen`, `onClose` |
| `LayoutPrincipal` | `children` |

### 3.4 Props Drilling (y como se resuelve con Context)

El **prop drilling** es cuando tienes que pasar props por muchos componentes que no las usan, solo para llegar al que si las necesita.

```
App -> Header -> UserMenu -> UserName -> user.name
      (Header no usa user, solo lo pasa)
```

**Solucion en el proyecto: Context API** (se explica en la seccion 7).

---

## 4. TODOS LOS HOOKS DE REACT (EXPLICADOS)

Un **hook** es una funcion especial que permite "engancharte" a caracteristicas de React desde componentes funcionales.

### 4.1 useState

**Que hace:** Agrega estado (datos que cambian) a un componente funcional.

**Sintaxis:**
```jsx
const [valorActual, funcionParaActualizar] = useState(valorInicial);
```

**Uso en el proyecto:**

```jsx
// En Tienda.jsx - Estado del carrito con persistencia
const [carrito, setCarrito] = useState(() => {
  const saved = localStorage.getItem('cyrex_carrito');
  return saved ? JSON.parse(saved) : [];
});

// Cuando el usuario agrega un producto:
const agregarAlCarrito = (producto) => {
  setCarrito(prev => [...prev, { ...producto, cantidad: 1 }]);
  // 'prev' es el estado anterior, [...prev] crea copia
};
```

**Archivo: `Tienda.jsx` - Todas las variables de estado:**
| Variable | Tipo | Que almacena |
|---|---|---|
| `productos` | `[]` | Lista de productos de la API |
| `loading` | `true` | Si esta cargando |
| `carrito` | `[]` | Productos en el carrito |
| `isCartOpen` | `false` | Si el panel del carrito esta abierto |
| `procesando` | `false` | Si esta procesando la compra |
| `compraExitosa` | `false` | Si la compra fue exitosa |
| `ultimaOrden` | `null` | Datos de la ultima orden |

**Donde se usa useState en el proyecto (16 archivos):**
- `AuthContext.jsx`: `user`, `loading`
- `Tienda.jsx`: 7 variables de estado
- `Contacto.jsx`: `form`, `errors`, `sent`
- `IniciarSesion.jsx`: `form`, `errors`, `isRegisterOpen`, `apiError`, `isLoading`
- `RecuperarContrasena.jsx`: `email`, `error`, `sent`
- `AdminDashboard.jsx`: 13 variables de estado
- `ClienteDashboard.jsx`: 5 variables de estado
- `EmpleadoDashboard.jsx`: 8 variables de estado
- `Header.jsx`: `menuOpen`
- `Carrusel.jsx`: `index`
- `TarjetaModal.jsx`: `formData`, `errors`
- `ScrollReveal.jsx`: `visible`
- `RegistroModal.jsx`: 4 variables de estado
- `WhatsAppButton.jsx`: `isHovered`
- `Toast.jsx`: `isVisible`, `toasts`

---

### 4.2 useEffect

**Que hace:** Ejecuta **efectos secundarios** en componentes funcionales (llamadas a API, timers, suscripciones, manipulacion del DOM).

**Sintaxis:**
```jsx
useEffect(() => {
  // Codigo del efecto

  return () => {
    // Limpieza (opcional) - se ejecuta al desmontar
  };
}, [dependencias]);  // Array de dependencias
```

**Las 3 formas de dependencias:**
```jsx
useEffect(() => { ... });       // Se ejecuta EN CADA render
useEffect(() => { ... }, []);   // Se ejecuta UNA SOLA VEZ (al montar)
useEffect(() => { ... }, [x]);  // Se ejecuta cuando 'x' cambia
```

**Uso en el proyecto:**

```jsx
// En AuthContext.jsx - Verificar token al cargar la app
useEffect(() => {
  const token = localStorage.getItem('cyrex_token');
  if (token) {
    authAPI.getProfile()
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('cyrex_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  } else {
    setLoading(false);
  }
}, []);  // [] = se ejecuta UNA vez al montar
```

```jsx
// En Tienda.jsx - Cargar productos al montar
useEffect(() => {
  loadProducts();
}, []);  // Se ejecuta una vez
```

```jsx
// En Carrusel.jsx - Avance automatico del carrusel
useEffect(() => {
  const interval = setInterval(() => {
    setIndex(prev => (prev + 1) % items.length);
  }, 4200);
  return () => clearInterval(interval);  // Limpieza al desmontar
}, [items.length]);  // Se re-ejecuta si cambia la cantidad de items
```

```jsx
// En Toast.jsx - Timer para auto-ocultar notificacion
useEffect(() => {
  const timer = setTimeout(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, duration);
  return () => clearTimeout(timer);  // Limpieza: cancelar timer
}, [duration, onClose]);  // Se re-ejecuta si cambian estas dependencias
```

**Donde se usa useEffect en el proyecto (8 archivos):**
| Archivo | Dependencias | Que hace |
|---|---|---|
| `AuthContext.jsx` | `[]` | Verificar token al cargar |
| `Tienda.jsx` | `[]` | Cargar productos |
| `AdminDashboard.jsx` | `[]` | Cargar todos los datos admin |
| `ClienteDashboard.jsx` | `[user?.id]` | Cargar ordenes del usuario |
| `EmpleadoDashboard.jsx` | `[]` | Cargar productos y ordenes |
| `Carrusel.jsx` | `[items.length]` | Avance automatico del carrusel |
| `ScrollReveal.jsx` | `[]` | Configurar IntersectionObserver |
| `Toast.jsx` | `[duration, onClose]` | Timer de auto-ocultado |

---

### 4.3 useContext

**Que hace:** Permite **consumir un Context** desde cualquier componente hijo, sin necesidad de pasar props.

**Sintaxis:**
```jsx
const valor = useContext(MiContexto);
```

**Uso en el proyecto:**

```jsx
// En AuthContext.jsx - Creacion del contexto
const AuthContext = createContext(null);

// Provider que envuelve toda la app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Funciones login, register, logout...

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para consumir el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
```

```jsx
// En cualquier componente:
const { user } = useAuth();        // Obtener usuario
const { login } = useAuth();       // Obtener funcion login
const { logout } = useAuth();      // Obtener funcion logout
```

**Donde se usa useAuth (consumiendo el contexto):**
| Archivo | Que obtiene del contexto |
|---|---|
| `Tienda.jsx` | `user` |
| `Header.jsx` | `user`, `logout` |
| `IniciarSesion.jsx` | `login` |
| `RegistroModal.jsx` | `register` |
| `Carrusel.jsx` | `user` (para saber si esta logueado) |
| `ProtectedRoute.jsx` | `user`, `loading` |
| `AdminDashboard.jsx` | `user` |
| `ClienteDashboard.jsx` | `user` |
| `EmpleadoDashboard.jsx` | `user` |

---

### 4.4 useRef

**Que hace:** Crea una **referencia mutable** a un elemento del DOM o a un valor que persiste entre renders sin causar re-render.

**Sintaxis:**
```jsx
const referencia = useRef(valorInicial);
// Acceder al elemento DOM: referencia.current
```

**Uso en el proyecto:**

```jsx
// En ScrollReveal.jsx - Observar un elemento del DOM
const ref = useRef(null);

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
      }
    },
    { threshold: 0.1 }
  );
  if (ref.current) observer.observe(ref.current);
  return () => observer.disconnect();
}, []);

return (
  <div ref={ref} className={`reveal-item ${visible ? 'is-visible' : ''}`}>
    {children}
  </div>
);
```

**Diferencia importante:**
- `useState` = cuando cambia, re-renderiza el componente
- `useRef` = cuando cambia, **NO** re-renderiza

---

### 4.5 useMemo

**Que hace:** **Memoriza el resultado** de una funcion costosa para no recalcularlo en cada render.

**Sintaxis:**
```jsx
const resultado = useMemo(() => {
  return funcionCostosa(arg1, arg2);
}, [arg1, arg2]);  // Solo se recalcula cuando cambian las dependencias
```

**Uso en el proyecto:**

```jsx
// En Carrusel.jsx - Memorizar la lista de items del carrusel
const items = useMemo(() =>
  games.map((game, i) => ({
    ...game,
    src: imageModules[`../assets/img-games/${game.image}`]?.default,
  })),
  []  // Solo se calcula una vez
);
```

```jsx
// En Contacto.jsx - Memorizar objeto de validadores
const validators = useMemo(() => ({
  nombre: (v) => v.trim() ? '' : 'El nombre es requerido',
  correo: (v) => validateEmail(v) ? '' : 'Correo invalido',
  // ...
}), []);  // Se crea una sola vez
```

---

### 4.6 useNavigate

**Que hace:** Hook de React Router que permite **navegar programaticamente** (redirigir al usuario sin hacer click en un Link).

**Sintaxis:**
```jsx
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/ruta');           // Navegar a una ruta
navigate(-1);               // Volver atras
navigate('/ruta', { replace: true });  // Reemplazar historial
```

**Uso en el proyecto:**

```jsx
// En IniciarSesion.jsx - Redirigir segun rol despues del login
const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  const data = await login(form.correo, form.password);

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
};
```

**Donde se usa useNavigate:**
| Archivo | Para que lo usa |
|---|---|
| `IniciarSesion.jsx` | Redirigir al dashboard segun rol |
| `Header.jsx` | Navegar al hacer logout |
| `Carrusel.jsx` | Navegar a tienda/login al click en juego |
| `RegistroModal.jsx` | Redirigir al dashboard despues de registrarse |

---

### 4.7 Resumen de todos los hooks usados en el proyecto

| Hook | Archivos donde se usa | Funcion principal |
|---|---|---|
| `useState` | 16 archivos | Manejar estado local |
| `useEffect` | 8 archivos | Efectos secundarios (API calls, timers) |
| `useContext` | 9 archivos (via `useAuth`) | Consumir contexto de autenticacion |
| `useMemo` | 4 archivos | Memorizar valores computados |
| `useRef` | 1 archivo | Referenciar elementos del DOM |
| `useNavigate` | 4 archivos | Navegacion programatica |

---

## 5. HOOKS PERSONALIZADOS DEL PROJECTO

Un **custom hook** es una funcion que empieza con `use` y encapsula logica reutilizable que usa otros hooks.

### 5.1 useAuth

**Archivo:** `src/context/AuthContext.jsx`

```jsx
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
```

**Que retorna:**
```jsx
{
  user: {              // Objeto usuario o null
    id: 1,
    nombre: "Admin",
    apellido: "Cyrex",
    correo: "admin@cyrex.com",
    rol: "Administrador",
    // ...
  },
  loading: false,       // true mientras verifica token
  login: async (correo, password) => { ... },
  register: async (userData) => { ... },
  logout: () => { ... }
}
```

**Donde se usa:** En 9 componentes que necesitan saber si el usuario esta autenticado.

### 5.2 useToast

**Archivo:** `src/components/ui/Toast.jsx`

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

**Uso:**
```jsx
// En Tienda.jsx
const { addToast, ToastContainer } = useToast();

// Cuando se agrega producto al carrito:
addToast('Producto agregado al carrito', 'success');

// Cuando hay error:
addToast('Error al procesar compra', 'error');

// En el JSX:
<ToastContainer />
```

**Por que es un custom hook:** Encapsula toda la logica de notificaciones (crear, eliminar, renderizar) en una funcion reutilizable. Sin el hook, tendrias que repetir el estado `toasts`, `addToast`, `removeToast` y el JSX del contenedor en cada componente.

---

## 6. COMO FUNCIONA EL ENRUTAMIENTO

### Que es React Router

React Router permite crear una **SPA (Single Page Application)** donde el navegador nunca recarga la pagina completa, solo cambia el componente que se muestra.

### Configuracion en App.jsx

```jsx
import { Navigate, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rutas publicas - cualquiera puede acceder */}
        <Route path="/" element={<Index />} />
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        <Route path="/recuperar-contrasena" element={<RecoverPassword />} />
        <Route path="/quienes-somos" element={<QuienesSomos />} />
        <Route path="/contacto" element={<Contacto />} />

        {/* Rutas protegidas - requieren autenticacion */}
        <Route path="/tienda" element={
          <ProtectedRoute><Tienda /></ProtectedRoute>
        } />

        {/* Rutas por rol - requieren autenticacion + rol especifico */}
        <Route path="/dashboard/admin" element={
          <ProtectedRoute allowedRoles={['Administrador']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/empleado" element={
          <ProtectedRoute allowedRoles={['Empleado']}>
            <EmpleadoDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/cliente" element={
          <ProtectedRoute allowedRoles={['Cliente']}>
            <ClienteDashboard />
          </ProtectedRoute>
        } />

        {/* Ruta catch-all - redirige al inicio */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <WhatsAppButton />
    </AuthProvider>
  );
}
```

### Como funciona ProtectedRoute

```jsx
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Si esta cargando, muestra spinner
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent"></div>
    </div>;
  }

  // 2. Si NO esta autenticado, redirige a login
  if (!user) {
    return <Navigate to="/iniciar-sesion" state={{ from: location }} />;
  }

  // 3. Si hay roles permitidos y el usuario NO tiene uno valido
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/" />;
  }

  // 4. Todo OK - renderiza el contenido protegido
  return children;
}
```

**Flujo visual:**
```
Usuario intenta acceder a /dashboard/admin
    |
    v
ProtectedRoute carga -> loading = true -> Muestra spinner
    |
    v
loading = false -> user = null? -> Redirige a /iniciar-sesion
    |
    v
user = { rol: 'Cliente' } -> allowedRoles = ['Administrador'] -> Redirige a /
    |
    v
user = { rol: 'Administrador' } -> allowedRoles = ['Administrador'] -> Muestra AdminDashboard
```

---

## 7. MANEJO DE ESTADO GLOBAL (CONTEXT API)

### Que es Context API

Context API es la forma nativa de React para **compartir estado entre componentes** sin tener que pasar props por multiples niveles (prop drilling).

### Como funciona en el proyecto

```
main.jsx
  └── BrowserRouter
        └── App.jsx
              └── AuthProvider          <-- PROVEE el contexto
                    ├── Header          <-- CONSUME el contexto (user, logout)
                    ├── ProtectedRoute  <-- CONSUME el contexto (user, loading)
                    ├── IniciarSesion   <-- CONSUME el contexto (login)
                    ├── Tienda          <-- CONSUME el contexto (user)
                    ├── AdminDashboard  <-- CONSUME el contexto (user)
                    └── ...
```

### Flujo completo de autenticacion

```
1. APP CARGA:
   AuthContext useEffect -> busca token en localStorage
   |
   +-> Si hay token: llama a authAPI.getProfile()
   |     |
   |     +-> Exito: setUser(data.user) -> user tiene datos
   |     +-> Error: localStorage.removeItem() -> user = null
   |
   +-> Si no hay token: setLoading(false) -> user = null

2. USUARIO HACE LOGIN:
   IniciarSesion -> login(correo, password)
   |
   +-> authAPI.login() -> POST /api/auth/login
   |     |
   |     +-> Backend valida credenciales, genera JWT
   |     +-> Retorna { token, user }
   |
   +-> localStorage.setItem('cyrex_token', token)
   +-> localStorage.setItem('cyrex_user', JSON.stringify(user))
   +-> setUser(user) -> Todos los componentes se actualizan

3. USUARIO HACE LOGOUT:
   Header -> logout()
   |
   +-> localStorage.removeItem('cyrex_token')
   +-> localStorage.removeItem('cyrex_user')
   +-> setUser(null) -> Todos los componentes se actualizan
```

---

## 8. COMPONENTES UI REUTILIZABLES

### Button.jsx - 3 variantes

```jsx
function Button({ children, type = 'button', variant = 'primary', className = '', ...props }) {
  const baseClasses = 'px-5 py-2.5 rounded-lg font-medium transition-all duration-300';

  const variants = {
    primary: 'bg-accent hover:bg-accent-soft text-[#0e1016] font-semibold',
    secondary: 'border border-accent/30 text-accent hover:border-accent hover:bg-accent/10',
    ghost: 'text-muted hover:text-text',
  };

  return (
    <button type={type} className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
```

**Variantes:**
- `primary`: Fondo dorado (accent), texto oscuro
- `secondary`: Borde dorado transparente, hover con fondo sutil
- `ghost`: Sin fondo ni borde, solo texto que cambia al hover

### Input.jsx - Input con label y error

```jsx
function Input({ label, error, id, className = '', ...props }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-muted">
        {label}
      </label>
      <input
        id={id}
        className={`w-full px-4 py-2.5 bg-surface border rounded-lg text-text
          focus:outline-none focus:border-accent transition-colors
          ${error ? 'border-red-500' : 'border-line'}`}
        {...props}
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
```

### Select.jsx - Dropdown con opciones

```jsx
function Select({ label, error, id, options, className = '', ...props }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-muted">
        {label}
      </label>
      <select
        id={id}
        className="w-full px-4 py-2.5 bg-surface border border-line rounded-lg text-text
          focus:outline-none focus:border-accent transition-colors"
        {...props}
      >
        <option value="">Seleccionar...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
```

### Toast.jsx - Sistema de notificaciones

El componente `Toast` muestra una notificacion individual con:
- 3 tipos: `success` (verde), `error` (rojo), `info` (azul)
- Auto-ocultado despues de un tiempo configurable
- Animacion de entrada/salida (300ms)

El custom hook `useToast` gestiona multiples toasts simultaneos.

---

## 9. ANALISIS COMPLETO DEL FRONTEND (ARCHIVO POR ARCHIVO)

### 9.1 main.jsx - Punto de entrada

```jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

**Que hace:**
1. `StrictMode`: Activa advertencias extra en desarrollo (no afecta produccion)
2. `BrowserRouter`: Habilita el enrutamiento basado en URLs del navegador
3. `App`: Componente raiz que contiene toda la logica

---

### 9.2 App.jsx - Configuracion de rutas

**Responsabilidades:**
- Envolver todo en `AuthProvider` para autenticacion global
- Definir todas las rutas de la aplicacion
- Proteger rutas que requieren autenticacion o roles especificos
- Incluir `WhatsAppButton` en todas las paginas

---

### 9.3 AuthContext.jsx - Autenticacion global

**Estado:**
```jsx
const [user, setUser] = useState(null);       // Usuario autenticado
const [loading, setLoading] = useState(true);  // Cargando verificacion
```

**Funciones:**
| Funcion | Que hace | Retorna |
|---|---|---|
| `login(correo, password)` | POST a `/api/auth/login`, guarda token en localStorage | `{ token, user }` |
| `register(userData)` | POST a `/api/auth/register`, guarda token en localStorage | `{ token, user }` |
| `logout()` | Elimina token y usuario de localStorage, limpia estado | void |

**useEffect en AuthContext:**
```jsx
useEffect(() => {
  // Al cargar la app, verifica si hay token guardado
  const token = localStorage.getItem('cyrex_token');
  if (token) {
    // Si hay token, valida con el backend
    authAPI.getProfile()
      .then((data) => setUser(data.user))
      .catch(() => {
        // Token invalido, limpia todo
        localStorage.removeItem('cyrex_token');
        localStorage.removeItem('cyrex_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  } else {
    setLoading(false);
  }
}, []);  // Solo se ejecuta una vez
```

---

### 9.4 api.js - Cliente HTTP

**Funcion principal `request()`:**
```jsx
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('cyrex_token');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };
  const response = await fetch(`http://localhost:4000/api${endpoint}`, config);
  // Manejo de errores...
  return data;
}
```

**Que hace:**
1. Agrega automaticamente el token JWT a cada peticion
2. Maneja errores de red y respuestas HTTP
3. Parsea la respuesta JSON

**Modulos de API disponibles:**
```jsx
// Autenticacion
authAPI.login(correo, password)
authAPI.register(userData)
authAPI.getProfile()

// Usuarios
usuariosAPI.getAll()
usuariosAPI.getById(id)
usuariosAPI.create(data)
usuariosAPI.update(id, data)
usuariosAPI.remove(id)

// Productos (con filtros)
productosAPI.getAll({ estado: 'activo', search: 'god' })
productosAPI.getById(id)
productosAPI.create(data)
productosAPI.update(id, data)
productosAPI.remove(id)

// Categorias
categoriasAPI.getAll()
categoriasAPI.getById(id)

// Ordenes
ordenesAPI.getAll()
ordenesAPI.getById(id)
ordenesAPI.create(data)
ordenesAPI.updateEstado(id, estado)
ordenesAPI.getStats()

// Servicios
serviciosAPI.getAll()
serviciosAPI.getById(id)

// Subida de archivos
uploadAPI.uploadImage(file)
```

---

### 9.5 Tienda.jsx - Pagina principal de la tienda

**Hooks utilizados:**
- `useState` (7 variables): productos, loading, carrito, isCartOpen, procesando, compraExitosa, ultimaOrden
- `useEffect` ([]): Cargar productos al montar
- `useAuth()`: Obtener usuario autenticado
- `useToast()`: Mostrar notificaciones

**Funciones principales:**

```jsx
// Cargar productos desde la API
const loadProducts = async () => {
  const data = await productosAPI.getAll();
  const active = data.products.filter(p => p.estado === 'activo' && p.stock > 0);
  setProductos(active);
};

// Agregar producto al carrito
const agregarAlCarrito = (producto) => {
  const existing = carrito.find(item => item.id === producto.id);
  if (existing) {
    if (existing.cantidad >= producto.stock) {
      addToast('No hay mas stock disponible', 'error');
      return;
    }
    setCarrito(carrito.map(item =>
      item.id === producto.id
        ? { ...item, cantidad: item.cantidad + 1 }
        : item
    ));
  } else {
    setCarrito([...carrito, { ...producto, cantidad: 1 }]);
  }
  addToast(`${producto.nombre} agregado al carrito`, 'success');
};

// Procesar compra
const procesarCompra = async () => {
  setProcesando(true);
  try {
    const payload = {
      items: carrito.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad,
      })),
    };
    const data = await ordenesAPI.create(payload);
    setCarrito([]);
    localStorage.removeItem('cyrex_carrito');
    setCompraExitosa(true);
    setUltimaOrden(data.orden);
    addToast('Compra realizada exitosamente', 'success');
  } catch (error) {
    addToast(error.message, 'error');
  } finally {
    setProcesando(false);
  }
};
```

**Persistencia del carrito en localStorage:**
```jsx
// Inicializacion con useState lazy
const [carrito, setCarrito] = useState(() => {
  const saved = localStorage.getItem('cyrex_carrito');
  return saved ? JSON.parse(saved) : [];
});

// Cada vez que cambia el carrito, se guarda
useEffect(() => {
  localStorage.setItem('cyrex_carrito', JSON.stringify(carrito));
}, [carrito]);
```

---

### 9.6 AdminDashboard.jsx - Panel de administracion

**4 Tabs:**
1. **Resumen**: Estadisticas (ordenes, ingresos, productos, usuarios) + ventas recientes
2. **Usuarios**: Tabla de usuarios con editar/eliminar
3. **Productos**: Grid de productos con crear/editar/eliminar + subida de imagen
4. **Ventas**: Tabla de ordenes con actualizacion de estado

**13 variables de estado:**
```jsx
const [activeTab, setActiveTab] = useState('resumen');
const [usuarios, setUsuarios] = useState([]);
const [productos, setProductos] = useState([]);
const [ordenes, setOrdenes] = useState([]);
const [stats, setStats] = useState(null);
const [loading, setLoading] = useState(true);
const [editingProduct, setEditingProduct] = useState(null);
const [productForm, setProductForm] = useState({...});
const [showProductModal, setShowProductModal] = useState(false);
const [imageFile, setImageFile] = useState(null);
const [editingUser, setEditingUser] = useState(null);
const [userForm, setUserForm] = useState({...});
const [showUserModal, setShowUserModal] = useState(false);
```

**Carga de datos en paralelo:**
```jsx
useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  const [usuariosData, productosData, ordenesData, statsData] = await Promise.all([
    usuariosAPI.getAll(),
    productosAPI.getAll(),
    ordenesAPI.getAll(),
    ordenesAPI.getStats(),
  ]);
  setUsuarios(usuariosData.users);
  setProductos(productosData.products);
  setOrdenes(ordenesData.ordenes);
  setStats(statsData);
  setLoading(false);
};
```

---

### 9.7 EmpleadoDashboard.jsx - Panel de empleado

**3 Tabs:**
1. **Mi Perfil**: Editar nombre, apellido, direccion, telefono
2. **Productos**: Ver/editar stock y estado (no puede crear ni eliminar)
3. **Ordenes**: Ver todas las ordenes, cambiar estado

**Diferencia con Admin:** No puede gestionar usuarios ni categorias.

---

### 9.8 ClienteDashboard.jsx - Panel de cliente

**2 Tabs:**
1. **Mi Perfil**: Ver y editar datos personales
2. **Mis Ordenes**: Ver solo sus propias ordenes + descargar factura

**Detalle importante:**
```jsx
// Las ordenes se filtran por el usuario actual
useEffect(() => {
  if (user?.id) {
    loadData();
  }
}, [user?.id]);

const loadData = async () => {
  const data = await ordenesAPI.getAll();
  // Filtra solo ordenes del usuario actual
  const misOrdenes = data.ordenes.filter(o => o.usuario_id === user.id);
  setOrdenes(misOrdenes);
};
```

---

### 9.9 Header.jsx - Navegacion

**Funcionalidades:**
- Logo + nombre de la marca
- Links de navegacion: Inicio, Quienes Somos, Contacto
- Link "Tienda" (solo visible si esta logueado)
- Menu de usuario con dropdown (Mi Dashboard, Cerrar Sesion)
- Menu hamburguesa para movil
- Ruta del dashboard segun rol

```jsx
const getDashboardPath = () => {
  switch (user?.rol) {
    case 'Administrador': return '/dashboard/admin';
    case 'Empleado': return '/dashboard/empleado';
    case 'Cliente': return '/dashboard/cliente';
    default: return '/';
  }
};
```

---

### 9.10 Carrusel.jsx - Carrusel de juegos

**Hooks utilizados:**
- `useState` (1 variable): `index` - slide actual
- `useEffect` ([items.length]): Timer de avance automatico cada 4.2s
- `useMemo` ([]): Memorizar items con imagenes resueltas
- `useNavigate()`: Navegar al hacer click
- `useAuth()`: Saber si el usuario esta logueado

```jsx
useEffect(() => {
  const interval = setInterval(() => {
    setIndex(prev => (prev + 1) % items.length);
  }, 4200);
  return () => clearInterval(interval);  // Limpieza
}, [items.length]);
```

---

### 9.11 ScrollReveal.jsx - Animacion de scroll

**Hooks:**
- `useRef(null)`: Referencia al elemento del DOM
- `useState(false)`: Estado de visibilidad
- `useEffect([]): Configurar IntersectionObserver

```jsx
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    },
    { threshold: 0.1 }
  );
  if (ref.current) observer.observe(ref.current);
  return () => observer.disconnect();  // Limpieza
}, []);
```

---

### 9.12 RegistroModal.jsx - Modal de registro

**9 campos validados:**
| Campo | Validacion |
|---|---|
| `nombre` | Requerido |
| `apellido` | Requerido |
| `tipoDocumento` | Requerido (cc/ce/pasaporte) |
| `numeroDocumento` | 6-15 digitos |
| `direccion` | Minimo 6 caracteres |
| `telefono` | 7-15 digitos con prefijo + opcional |
| `correo` | Email valido (regex) |
| `password` | 8+ chars, 1 mayuscula, 1 digito, 1 simbolo |
| `confirmPassword` | Debe coincidir con password |

**Cross-validation:**
```jsx
// Cuando cambia el password, re-valida confirmPassword
if (name === 'password' && form.confirmPassword) {
  const confirmError = value !== form.confirmPassword
    ? 'Las contrasenas no coinciden' : '';
  newErrors.confirmPassword = confirmError;
}
```

---

### 9.13 TarjetaModal.jsx - Modal de tarjeta

**Campos:**
- Numero de tarjeta (formateado en grupos de 4: `1234 5678 9012 3456`)
- Nombre del titular
- Fecha de vencimiento (formato MM/YY)
- CVV (3 digitos)

**Formato automatico:**
```jsx
const formatCardNumber = (value) => {
  const v = value.replace(/\D/g, '').substring(0, 16);
  return v.replace(/(\d{4})(?=\d)/g, '$1 ');
};

const formatExpiry = (value) => {
  const v = value.replace(/\D/g, '').substring(0, 4);
  if (v.length >= 2) return v.substring(0, 2) + '/' + v.substring(2);
  return v;
};
```

---

## 10. ANALISIS COMPLETO DEL BACKEND

### 10.1 server.js - Servidor Express

**Configuracion:**
```javascript
const app = express();

// CORS - Permite peticiones del frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', ...],
  credentials: true
}));

// Middlewares globales
app.use(express.json());                    // Parsear JSON
app.use(express.urlencoded({ extended: true }));  // Parsear URL-encoded
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));  // Archivos estaticos

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/ordenes', ordenRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api', (req, res) => res.json({ message: 'Cyrex Store API' }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));

// Error handler global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

app.listen(4000);
```

### 10.2 Arquitectura MVC

```
Request HTTP
    |
    v
Routes (Define la URL y middlewares)
    |
    v
Middleware (Valida datos, verifica JWT, verifica roles)
    |
    v
Controller (Logica de negocio, llama al model)
    |
    v
Model (Ejecuta querys SQL contra MySQL)
    |
    v
Response JSON
```

### 10.3 Middleware de Autenticacion

```javascript
// verifyToken - Extrae y verifica el JWT
const verifyToken = async (req, res, next) => {
  // 1. Extraer token del header Authorization: Bearer xxx
  const token = authHeader.split(' ')[1];

  // 2. Verificar token con jwt.verify()
  const decoded = jwt.verify(token, JWT_SECRET);

  // 3. Buscar usuario en la BD
  const user = await Usuario.findById(decoded.id);

  // 4. Verificar que exista y este activo
  if (!user || user.estado !== 'activo') {
    return res.status(401).json({ message: 'Usuario no valido' });
  }

  // 5. Adjuntar usuario a la request
  req.user = {
    id: user.id,
    nombre: user.nombre,
    rol_nombre: user.rol_nombre
  };

  next();  // Continuar al siguiente middleware/controller
};

// authorizeRoles - Factory de middleware para roles
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.rol_nombre)) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    next();
  };
};
```

**Uso en rutas:**
```javascript
// Solo admin puede crear productos
router.post('/',
  verifyToken,
  authorizeRoles('Administrador'),
  productoValidation,
  ProductoController.create
);

// Admin y empleado pueden editar productos
router.put('/:id',
  verifyToken,
  authorizeRoles('Administrador', 'Empleado'),
  ProductoController.update
);

// Cualquier usuario autenticado puede ver ordenes
router.get('/',
  verifyToken,
  OrdenController.getAll
);
```

### 10.4 Validaciones con express-validator

```javascript
// Ejemplo: Validacion de registro
const registerValidation = [
  body('nombre').trim().notEmpty().isLength({ max: 100 }),
  body('apellido').trim().notEmpty().isLength({ max: 100 }),
  body('tipo_documento').isIn(['cc', 'ce', 'pasaporte']),
  body('numero_documento').trim().matches(/^\d{6,15}$/),
  body('correo').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/),
  // ...
];

// Se usa en el controller:
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}
```

### 10.5 Transacciones en la creacion de ordenes

```javascript
// En orden.model.js - create()
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();

  // 1. Verificar stock de cada producto
  for (const item of items) {
    const [product] = await connection.query(
      'SELECT id, nombre, precio, stock FROM productos WHERE id = ? AND estado = ?',
      [item.producto_id, 'activo']
    );
    if (!product) throw new Error(`Producto ${item.producto_id} no encontrado`);
    if (product.stock < item.cantidad) {
      throw new Error(`Stock insuficiente para ${product.nombre}`);
    }
  }

  // 2. Calcular total
  let total = 0;
  for (const item of items) {
    total += item.precio_unitario * item.cantidad;
  }

  // 3. Insertar orden
  const [orderResult] = await connection.query(
    'INSERT INTO ordenes (usuario_id, total, direccion_envio, notas) VALUES (?, ?, ?, ?)',
    [userId, total, direccionEnvio, notas]
  );
  const ordenId = orderResult.insertId;

  // 4. Insertar detalles y descontar stock
  for (const item of items) {
    await connection.query(
      'INSERT INTO ordenes_detalles (orden_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
      [ordenId, item.producto_id, item.cantidad, item.precio_unitario, item.subtotal]
    );
    await connection.query(
      'UPDATE productos SET stock = stock - ? WHERE id = ?',
      [item.cantidad, item.producto_id]
    );
  }

  await connection.commit();  // Todo OK, guardar cambios
} catch (error) {
  await connection.rollback();  // Error, deshacer todo
  throw error;
} finally {
  connection.release();  // Liberar conexion al pool
}
```

---

## 11. BASE DE DATOS

### 11.1 Diagrama de tablas

```
roles (3 registros)
  ├── Administrador
  ├── Empleado
  └── Cliente

permisos (18 registros)
  ├── usuarios.ver/crear/editar/eliminar
  ├── productos.ver/crear/editar/eliminar
  ├── ordenes.ver/crear/editar/eliminar
  ├── servicios.ver/crear/editar/eliminar
  └── dashboard.admin/empleado

roles_permisos (relacion N:N)

usuarios ( FK -> roles )
  ├── nombre, apellido, tipo_documento, numero_documento
  ├── direccion, telefono, correo (UNIQUE)
  ├── password (hasheada con bcrypt)
  ├── estado (activo/inactivo)
  └── rol_id (FK -> roles)

categorias
  ├── nombre (UNIQUE)
  ├── descripcion, imagen_url
  └── estado

productos ( FK -> categorias )
  ├── nombre, descripcion (TEXT)
  ├── precio (DECIMAL 10,2)
  ├── stock (INT)
  ├── imagen_url
  ├── plataforma (default 'PlayStation')
  ├── categoria_id (FK -> categorias)
  └── estado

servicios
  ├── nombre, descripcion (TEXT)
  ├── precio (DECIMAL 10,2)
  ├── duracion
  └── estado

ordenes ( FK -> usuarios )
  ├── usuario_id (FK -> usuarios)
  ├── total (DECIMAL 12,2)
  ├── estado (pendiente/procesando/completada/cancelada)
  ├── direccion_envio
  └── notas (TEXT)

ordenes_detalles ( FK -> ordenes, FK -> productos )
  ├── orden_id (FK -> ordenes)
  ├── producto_id (FK -> productos)
  ├── cantidad
  ├── precio_unitario (DECIMAL 10,2)
  └── subtotal (DECIMAL 12,2)
```

### 11.2 Datos de prueba

**Usuario admin:** admin@cyrex.com / Admin2026#

**10 productos con precios COP:**
| Producto | Precio | Stock |
|---|---|---|
| Assassin's Creed IV | $129,900 | 15 |
| Spider-Man | $179,900 | 20 |
| Horizon Forbidden West | $199,900 | 12 |
| God of War | $149,900 | 18 |
| Mortal Kombat 11 | $139,900 | 25 |
| Ratchet & Clank | $159,900 | 10 |
| The Last of Us | $189,900 | 14 |
| Red Dead Redemption 2 | $259,900 | 8 |
| Death Stranding 2 | $219,900 | 6 |
| Resident Evil Requiem | $169,900 | 11 |

---

## 12. FLUJO DE DATOS COMPLETO

### Flujo de Login

```
1. Usuario escribe email y password en IniciarSesion.jsx
2. handleChange() valida en tiempo real
3. handleSubmit() llama a login() del AuthContext
4. AuthContext llama a authAPI.login() -> POST /api/auth/login
5. Backend: auth.controller.js valida credenciales
   - bcrypt.compare() compara password hasheada
   - Genera JWT con payload: { id, nombre, correo, rol }
6. Backend retorna { token, user }
7. AuthContext guarda token y user en localStorage
8. AuthContext ejecuta setUser(user)
9. useNavigate redirige al dashboard segun rol
10. Todos los componentes que usan useAuth() se actualizan
```

### Flujo de Compra

```
1. Usuario agrega productos al carrito en Tienda.jsx
2. agregarAlCarrito() actualiza estado + localStorage
3. Usuario hace click en "Finalizar Compra"
4. procesarCompra() crea payload: { items: [{producto_id, cantidad}] }
5. ordenesAPI.create() -> POST /api/ordenes
6. Backend: orden.controller.js valida input
7. orden.model.js crea transaccion:
   - Verifica stock de cada producto
   - Calcula total
   - Inserta en ordenes
   - Inserta en ordenes_detalles
   - Descuenta stock
   - COMMIT (o ROLLBACK si hay error)
8. Backend retorna { orden: { id, total, ... } }
9. Frontend: limpia carrito, muestra factura
10. addToast() muestra notificacion de exito
```

### Flujo de Carga de Datos en Dashboard

```
1. AdminDashboard monta
2. useEffect([]) llama a loadData()
3. Promise.all() hace 4 peticiones en PARALELO:
   - usuariosAPI.getAll()
   - productosAPI.getAll()
   - ordenesAPI.getAll()
   - ordenesAPI.getStats()
4. Cada peticion -> GET /api/{endpoint}
5. Backend: controller busca en model -> model ejecuta SQL
6. Datos retornados al frontend
7. setUsuarios(), setProductos(), setOrdenes(), setStats()
8. Componente re-renderiza con los nuevos datos
```

---

## 13. RESUMEN DE TODAS LAS FUNCIONALIDADES

### Frontend

| Funcionalidad | Archivo | Hooks usados |
|---|---|---|
| Login con redireccion por rol | `IniciarSesion.jsx` | useState, useAuth, useNavigate, useMemo |
| Registro con 9 campos validados | `RegistroModal.jsx` | useState, useAuth, useNavigate, useMemo |
| Tienda con listado de productos | `Tienda.jsx` | useState, useEffect, useAuth, useToast |
| Carrito de compras persistente | `Tienda.jsx` | useState (lazy init con localStorage) |
| Proceso de compra con API | `Tienda.jsx` | useState, useToast |
| Factura descargable (.txt) | `Tienda.jsx` | - |
| Dashboard Admin (4 tabs) | `AdminDashboard.jsx` | useState, useEffect, useAuth |
| Dashboard Empleado (3 tabs) | `EmpleadoDashboard.jsx` | useState, useEffect, useAuth |
| Dashboard Cliente (2 tabs) | `ClienteDashboard.jsx` | useState, useEffect, useAuth |
| Edicion de perfil propio | Dashboards | useState, useAuth |
| Subida de imagenes | `AdminDashboard.jsx` | useState |
| Notificaciones toast | `Toast.jsx` | useState, useEffect (custom hook) |
| Carrusel automatico | `Carrusel.jsx` | useState, useEffect, useMemo, useAuth, useNavigate |
| Animaciones de scroll | `ScrollReveal.jsx` | useRef, useState, useEffect |
| Navegacion protegida | `ProtectedRoute.jsx` | useAuth |
| Header responsive con menu | `Header.jsx` | useState, useAuth, useNavigate |
| Formulario de contacto validado | `Contacto.jsx` | useState, useMemo |
| Modal de tarjeta de credito | `TarjetaModal.jsx` | useState |

### Backend

| Funcionalidad | Endpoint | Auth | Roles |
|---|---|---|---|
| Registrar usuario | POST `/api/auth/register` | No | Publico |
| Login | POST `/api/auth/login` | No | Publico |
| Ver perfil | GET `/api/auth/me` | JWT | Cualquiera |
| CRUD Usuarios | `/api/usuarios` | JWT | Admin |
| CRUD Productos | `/api/productos` | JWT | Admin (crear/eliminar), Admin+Empleado (editar) |
| CRUD Categorias | `/api/categorias` | JWT | Admin |
| CRUD Servicios | `/api/servicios` | JWT | Admin |
| CRUD Ordenes | `/api/ordenes` | JWT | Cliente (crear), Admin+Empleado (ver/editar) |
| Estadisticas de ventas | GET `/api/ordenes/stats/ventas` | JWT | Admin |
| Subir imagen | POST `/api/upload` | JWT | Admin |

---

## APRENDIZAJE: QUE ESTUDIAR SIGUIENTE

### Conceptos de React que este proyecto demuestra:
1. **Componentes funcionales** - Todos son funciones que retornan JSX
2. **Hooks de estado** - useState para datos que cambian
3. **Hooks de efecto** - useEffect para llamar APIs y timers
4. **Hooks de contexto** - useContext para estado global
5. **Hooks de referencia** - useRef para acceder al DOM
6. **Hooks de memoria** - useMemo para optimizar calculos
7. **Custom hooks** - useAuth y useToast
8. **Rutas protegidas** - ProtectedRoute con verificacion de roles
9. **Formularios controlados** - Inputs con estado y validacion
10. **Persistencia** - localStorage para carrito y sesion

### Conceptos de Backend que este proyecto demuestra:
1. **Arquitectura MVC** - Model, View (API), Controller
2. **REST API** - Endpoints RESTful con verbos HTTP correctos
3. **Autenticacion JWT** - Tokens, verify, roles
4. **Autorizacion RBAC** - Role-Based Access Control
5. **Validacion de entrada** - express-validator
6. **Transacciones SQL** - begin, commit, rollback
7. **Manejo de archivos** - Multer para subida de imagenes
8. **Soft delete** - Eliminar sin borrar (estado = 'inactivo')
9. **Pool de conexiones** - Reutilizar conexiones MySQL
10. **CORS** - Configuracion de origenes permitidos

---

*Documento generado para el proyecto Cyrex Store - 2026*
