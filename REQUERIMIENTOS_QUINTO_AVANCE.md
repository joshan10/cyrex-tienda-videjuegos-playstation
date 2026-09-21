# Requerimientos Quinto Avance - Análisis de Dificultad y Prioridad

## Clasificación de Dificultad

| Nivel | Descripción |
|-------|-------------|
| **Fácil** | Requiere poco código, se basa en funcionalidades ya existentes, bajo riesgo |
| **Medio** | Requiere nueva lógica, integración con librerías, o ajustes significativos |
| **Difícil** | Requiere integración con servicios externos, librerías complejas o arquitectura nueva |

## Clasificación de Prioridad

| Nivel | Descripción |
|-------|-------------|
| **Alta** | Base para otros módulos, sin esto no se puede avanzar |
| **Media** | Funcionalidad importante pero no bloquea otros módulos |
| **Baja** | Mejora complementaria, puede implementarse al final |

---

## Requerimientos Ordenados (Del más fácil al más difícil)

### ~~1. Consulta de facturas~~ ✅
- **Dificultad:** Fácil
- **Prioridad:** Alta
- **Depende de:** Ninguno
- **Justificación:** Ya existe el endpoint de historial de órdenes. Solo hay que crear un endpoint similar para facturas con filtros por número, cliente y fecha. Es prácticamente un CRUD de lectura.
- **Estado:** ✅ Completado - Endpoint `/api/ventas` con filtros por numero_factura, cliente_correo, fecha_desde, fecha_hasta. Tab Facturas en dashboards Admin/Empleado.

### ~~2. Integración del Dashboard con FastAPI~~ ✅
- **Dificultad:** Fácil
- **Prioridad:** Alta
- **Depende de:** Ninguno
- **Justificación:** Ya existe el endpoint `/api/ordenes/stats/ventas` y los dashboards ya están conectados parcialmente. Solo hay que completar la conexión con los nuevos endpoints que se vayan creando.
- **Estado:** ✅ Completado - AdminDashboard conectado con ventasAPI.getStats() y ventasAPI.getAll()

### ~~3. Nuevos endpoints en FastAPI~~ ✅
- **Dificultad:** Fácil
- **Prioridad:** Alta
- **Depende de:** Ninguno
- **Justificación:** Sigue el patrón de los endpoints existentes (auth, productos, ordenes). Solo hay que crear los nuevos modelos, esquemas y routers siguiendo la misma estructura ya implementada.
- **Estado:** ✅ Completado - Creados endpoints: POST/GET/PATCH /api/ventas, GET /api/ventas/stats/dashboard, GET /api/ventas/reporte/diario, GET /api/ventas/factura/{numero}

### ~~4. Dashboard de acuerdo con los roles~~ ✅
- **Dificultad:** Fácil
- **Prioridad:** Media
- **Depende de:** Requerimiento 15 (Integración Dashboard con FastAPI)
- **Justificación:** Ya está implementado el sistema de roles con ProtectedRoute y require_roles. Solo hay que ajustar la información mostrada en cada dashboard según el rol.
- **Estado:** ✅ Completado - Admin: tabs completas + Facturas. Empleado: tabs limitadas + Facturas lectura. Cliente: perfil + órdenes + factura real.

### ~~5. Registro de productos y servicios vendidos~~ ✅
- **Dificultad:** Fácil
- **Prioridad:** Alta
- **Depende de:** Requerimiento 1 (Módulo de ventas)
- **Justificación:** Ya existe la tabla `ordenes_detalles` con la misma estructura necesaria (cantidad, precio_unitario, subtotal). Solo hay que renombrar/adaptar a `detalle_ventas`.
- **Estado:** ✅ Completado - Modelo VentaDetalle con producto_id y servicio_id (nullable). Servicios asociables a items de venta.

### 6. Gestión segura de la API Key
- **Dificultad:** Fácil
- **Prioridad:** Alta
- **Depende de:** Requerimiento 18 (Integración Chatbot con IA)
- **Justificación:** Ya se usa Pydantic Settings para gestionar variables de entorno en `config.py`. Solo hay que agregar la variable de la API Key de IA al archivo `.env` y al esquema de configuración.

### ~~7. Dashboard administrativo~~ ✅
- **Dificultad:** Fácil
- **Prioridad:** Media
- **Depende de:** Requerimiento 14 (Nuevos endpoints FastAPI)
- **Justificación:** Ya existe el AdminDashboard con tabs de Resumen, Usuarios, Productos y Ventas. Solo hay que agregar las Cards de indicadores para facturación y PQR.
- **Estado:** ✅ Completado - 8 cards en Resumen (Usuarios, Productos, Órdenes, Ingresos, Facturas, Facturado, Impuestos, Descuentos). Tab Facturas con filtros y tabla completa.

### ~~8. Historial de ventas~~ ✅
- **Dificultad:** Medio
- **Prioridad:** Alta
- **Depende de:** Requerimiento 1 (Módulo de ventas)
- **Justificación:** Ya existe el endpoint de órdenes con filtros. Hay que crear un endpoint específico para ventas con filtros por fecha, cliente, producto, servicio, estado y valor. Implica crear un nuevo CRUD con múltiples parámetros de filtrado.
- **Estado:** ✅ Completado - Endpoint `/api/ventas` con filtros: numero_factura, cliente_correo, cliente_documento, fecha_desde/hasta, estado, producto_id, servicio_id, valor_minimo/maximo, metodo_pago

### ~~9. Reporte diario de ventas~~ ✅
- **Dificultad:** Medio
- **Prioridad:** Media
- **Depende de:** Requerimiento 3 (Historial de ventas)
- **Justificación:** Ya hay estadísticas de ventas en el endpoint stats. Hay que crear un endpoint que filtre por fecha específica y devuelva la información estructurada para el reporte.
- **Estado:** ✅ Completado - Endpoint `/api/ventas/reporte/detallado` con resumen, ventas_por_dia y top_productos. Tab Reportes en AdminDashboard con gráficos.

### ~~10. Consulta de facturas~~ ✅
- **Dificultad:** Medio
- **Prioridad:** Media
- **Depende de:** Requerimiento 7 (Generación de facturas)
- **Justificación:** Similar al historial de ventas, requiere crear filtros por número de factura, cliente y fecha.
- **Estado:** ✅ Completado - Endpoint `/api/ventas` con filtros completos. Tab Facturas en dashboards Admin/Empleado con búsqueda avanzada.

### ~~11. Dashboard de ventas~~ ✅
- **Dificultad:** Medio
- **Prioridad:** Media
- **Depende de:** Requerimiento 14 (Nuevos endpoints FastAPI) y Requerimiento 15 (Integración Dashboard con FastAPI)
- **Justificación:** Requiere integrar una librería de gráficos (Chart.js o Recharts) y crear componentes de gráfico de barras, gráfico lineal y Cards. El backend ya provee datos de estadísticas.
- **Estado:** ✅ Completado - Librería Recharts instalada. Componentes: VentasBarChart, VentasLineChart, TopProductosChart, ResumenCards. Tab Reportes con gráficos interactivos.

### ~~12. Filtros para los Dashboards~~ ✅
- **Dificultad:** Medio
- **Prioridad:** Media
- **Depende de:** Requerimiento 11 (Dashboard de ventas)
- **Justificación:** Requiere crear componentes de filtro (fechas, selects) y pasar los parámetros a los endpoints existentes. No es complejo pero requiere diseñar la UI de filtros.
- **Estado:** ✅ Completado - Filtros de fecha (inicio/fin) en tab Reportes. Filtros avanzados en tab Facturas (número, correo, fechas). Botones Generar Reporte, Exportar Excel, Limpiar.

### 13. Módulo de PQR
- **Dificultad:** Medio
- **Prioridad:** Media
- **Depende de:** Requerimiento 14 (Nuevos endpoints FastAPI)
- **Justificación:** Requiere crear una nueva tabla, esquemas, endpoints y componentes de frontend. Sigue el patrón CRUD ya establecido en el proyecto, pero es un módulo completamente nuevo.

### ~~14. Generación de facturas de venta~~ ✅
- **Dificultad:** Medio
- **Prioridad:** Alta
- **Depende de:** Requerimiento 1 (Módulo de ventas)
- **Justificación:** Ya existe una generación básica de factura en TXT. Hay que mejorar la estructura (número de factura, impuestos, estado) y crear el endpoint correspondiente.
- **Estado:** ✅ Completado - Endpoint POST /api/ventas genera factura con número auto-incrementable CYR-YYYY-XXXX, cálculo de impuestos y descuentos. Descarga TXT mejorada en ClienteDashboard.

### ~~15. Módulo de ventas~~ ✅
- **Dificultad:** Medio
- **Prioridad:** Alta
- **Depende de:** Ninguno (es base para otros)
- **Justificación:** Ya existe el sistema de órdenes con `ordenes` y `ordenes_detalles`. Hay que adaptar la estructura para incluir campos adicionales como impuestos, descuentos y servicios. Es el módulo base para facturación y reportes.
- **Estado:** ✅ Completado - Modelos Venta/VentaDetalle, esquemas, CRUD con filtros, router completo, estadísticas, reporte diario.

### ~~16. Exportación del reporte en Excel~~ ✅
- **Dificultad:** Medio
- **Prioridad:** Baja
- **Depende de:** Requerimiento 4 (Reporte diario de ventas)
- **Justificación:** Requiere integrar la librería `openpyxl` en el backend. La lógica es crear un archivo .xlsx con los datos del reporte. No es complejo pero requiere una librería nueva.
- **Estado:** ✅ Completado - Librería openpyxl instalada. Endpoint `/api/ventas/reporte/excel` genera archivo .xlsx con headers estilizados, datos y fila de totales. Botón "Exportar Excel" en tab Reportes.

### 17. Chatbot para atención al cliente
- **Dificultad:** Difícil
- **Prioridad:** Media
- **Depende de:** Requerimiento 14 (Nuevos endpoints FastAPI)
- **Justificación:** Requiere crear la interfaz de chat en el frontend, el backend para manejar conversaciones, y almacenar mensajes. Es un componente nuevo con UI interactiva que no tiene precedente en el proyecto.

### 18. Descarga de facturas en PDF
- **Dificultad:** Difícil
- **Prioridad:** Media
- **Depende de:** Requerimiento 7 (Generación de facturas)
- **Justificación:** Requiere integrar una librería de generación de PDF como `reportlab` o `weasyprint`. Hay que diseñar la plantilla de la factura con formato profesional, logo, tabla de productos, totales e impuestos.

### 19. Exportación del reporte en PDF
- **Dificultad:** Difícil
- **Prioridad:** Baja
- **Depende de:** Requerimiento 4 (Reporte diario de ventas) y Requerimiento 18 (Descarga de facturas en PDF)
- **Justificación:** Requiere la misma librería de PDF que la factura. Hay que crear una plantilla de reporte con encabezado, tabla de ventas, totales y pie de página. Se puede reutilizar parte de la infraestructura de la factura en PDF.

### 20. Integración del Chatbot con Inteligencia Artificial
- **Dificultad:** Difícil
- **Prioridad:** Baja
- **Depende de:** Requerimiento 17 (Chatbot) y Requerimiento 19 (Gestión segura de API Key)
- **Justificación:** Requiere integrar con la API de OpenAI u otro proveedor de IA desde FastAPI. Implica manejar contextos de conversación, historial, manejo de errores de la API, rate limiting y configuración segura de credenciales. Es la integración más compleja del proyecto.

### 21. Integración completa y despliegue del proyecto
- **Dificultad:** Difícil
- **Prioridad:** Alta
- **Depende de:** Todos los demás requerimientos
- **Justificación:** Requiere configurar Railway (o similar) para Frontend, Backend y Base de Datos. Implica variables de entorno, CORS en producción, URLs de producción, migraciones de BD y verificación de que todo funcione integrado. Es el paso final pero crítico.

---

## Resumen por Dificultad

### Fácil (7 requerimientos)
1. Consulta de facturas
2. Integración del Dashboard con FastAPI
3. Nuevos endpoints en FastAPI
4. Dashboard de acuerdo con los roles
5. Registro de productos y servicios vendidos
6. Gestión segura de la API Key
7. Dashboard administrativo

### Medio (10 requerimientos)
8. Historial de ventas
9. Reporte diario de ventas
10. Consulta de facturas
11. Dashboard de ventas
12. Filtros para los Dashboards
13. Módulo de PQR
14. Generación de facturas de venta
15. Módulo de ventas
16. Exportación del reporte en Excel

### Difícil (4 requerimientos)
17. Chatbot para atención al cliente
18. Descarga de facturas en PDF
19. Exportación del reporte en PDF
20. Integración del Chatbot con Inteligencia Artificial
21. Integración completa y despliegue del proyecto

---

## Orden de Implementación Recomendado

### Fase 1: Base (Requerimientos fáciles + Módulo de ventas) ✅ COMPLETADA
1. ~~Módulo de ventas (#15)~~ ✅
2. ~~Registro de productos y servicios vendidos (#5)~~ ✅
3. ~~Nuevos endpoints en FastAPI (#3)~~ ✅
4. ~~Integración del Dashboard con FastAPI (#2)~~ ✅
5. ~~Consulta de facturas (#1)~~ ✅
6. ~~Dashboard administrativo (#7)~~ ✅
7. ~~Dashboard de acuerdo con los roles (#4)~~ ✅

### Fase 2: Reportes y Facturación ✅ COMPLETADA
8. ~~Historial de ventas (#8)~~ ✅
9. ~~Generación de facturas de venta (#14)~~ ✅ (Fase 1)
10. ~~Reporte diario de ventas (#9)~~ ✅
11. ~~Dashboard de ventas (#11)~~ ✅
12. ~~Filtros para los Dashboards (#12)~~ ✅
13. ~~Exportación del reporte en Excel (#16)~~ ✅

### Fase 3: PQR y Chatbot ✅ IMPLEMENTADA
14. ~~Módulo de PQR (#13)~~ ✅ Backend, persistencia, roles y pantalla protegida `/pqr`
15. ~~Chatbot para atención al cliente (#17)~~ ✅ Widget global y conversaciones persistentes
16. ~~Gestión segura de la API Key (#6)~~ ✅ Variables `AI_API_KEY`, `AI_MODEL` y `AI_BASE_URL`
17. ~~Integración del Chatbot con IA (#20)~~ ✅ Proveedor compatible con OpenAI y fallback FAQ local

### Fase 4: PDF y Despliegue
18. Descarga de facturas en PDF (#18)
19. Exportación del reporte en PDF (#19)
20. Integración completa y despliegue (#21)

---

## Ejemplo de Agregación de Requerimiento

### Ejemplo: Agregar el "Módulo de PQR"

**Paso 1: Crear la tabla en la base de datos**

```sql
CREATE TABLE IF NOT EXISTS pqr (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo ENUM('peticion', 'queja', 'reclamo') NOT NULL,
    asunto VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    estado ENUM('pendiente', 'en_proceso', 'respondida', 'cerrada') DEFAULT 'pendiente',
    respuesta TEXT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta TIMESTAMP NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

**Paso 2: Crear el modelo SQLAlchemy en `backend_fastapi/app/models/entities.py`**

```python
class PQR(Base):
    __tablename__ = "pqr"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    tipo: Mapped[str] = mapped_column(String(20), nullable=False)  # peticion, queja, reclamo
    asunto: Mapped[str] = mapped_column(String(200), nullable=False)
    descripcion: Mapped[str] = mapped_column(Text, nullable=False)
    estado: Mapped[str] = mapped_column(String(20), default="pendiente")
    respuesta: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    fecha_respuesta: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    usuario: Mapped["Usuario"] = relationship("Usuario")
```

**Paso 3: Crear esquemas Pydantic en `backend_fastapi/app/schemas/common.py`**

```python
class PQREntrada(BaseModel):
    tipo: str
    asunto: str
    descripcion: str

class PQRActualizar(BaseModel):
    estado: Optional[str] = None
    respuesta: Optional[str] = None

class PQRRespuesta(BaseModel):
    id: int
    usuario_id: int
    tipo: str
    asunto: str
    descripcion: str
    estado: str
    respuesta: Optional[str]
    fecha_creacion: datetime
    fecha_respuesta: Optional[datetime]
    usuario_nombre: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
```

**Paso 4: Crear funciones CRUD en `backend_fastapi/app/crud/pqr.py`**

```python
def crear_pqr(db: Session, pqr_data: PQREntrada, usuario_id: int):
    pqr = PQR(usuario_id=usuario_id, **pqr_data.model_dump())
    db.add(pqr)
    db.commit()
    db.refresh(pqr)
    return pqr

def obtener_pqrs(db: Session, skip: int = 0, limit: int = 100, estado: str = None):
    query = db.query(PQR)
    if estado:
        query = query.filter(PQR.estado == estado)
    return query.offset(skip).limit(limit).all()

def obtener_pqr_por_id(db: Session, pqr_id: int):
    return db.query(PQR).filter(PQR.id == pqr_id).first()

def actualizar_pqr(db: Session, pqr_id: int, pqr_data: PQRActualizar):
    pqr = db.query(PQR).filter(PQR.id == pqr_id).first()
    if pqr:
        for key, value in pqr_data.model_dump(exclude_unset=True).items():
            setattr(pqr, key, value)
        db.commit()
        db.refresh(pqr)
    return pqr
```

**Paso 5: Crear router en `backend_fastapi/app/routers/pqr.py`**

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies import current_user, require_roles
from app.schemas.common import PQREntrada, PQRActualizar, PQRRespuesta
from app.crud.pqr import crear_pqr, obtener_pqrs, obtener_pqr_por_id, actualizar_pqr

router = APIRouter(prefix="/api/pqr", tags=["PQR"])

@router.post("/", response_model=PQRRespuesta)
def crear_peticion(pqr_data: PQREntrada, user=Depends(current_user), db: Session = Depends(get_db)):
    return crear_pqr(db, pqr_data, user.id)

@router.get("/", response_model=list[PQRRespuesta])
def listar_pqrs(skip: int = 0, limit: int = 100, estado: str = None,
                user=Depends(require_roles(["Administrador", "Empleado"])), db: Session = Depends(get_db)):
    return obtener_pqrs(db, skip, limit, estado)

@router.get("/{pqr_id}", response_model=PQRRespuesta)
def obtener_pqr(pqr_id: int, user=Depends(current_user), db: Session = Depends(get_db)):
    pqr = obtener_pqr_por_id(db, pqr_id)
    if not pqr:
        raise HTTPException(status_code=404, detail="PQR no encontrada")
    return pqr

@router.patch("/{pqr_id}", response_model=PQRRespuesta)
def actualizar_estado_pqr(pqr_id: int, pqr_data: PQRActualizar,
                          user=Depends(require_roles(["Administrador", "Empleado"])), db: Session = Depends(get_db)):
    pqr = actualizar_pqr(db, pqr_id, pqr_data)
    if not pqr:
        raise HTTPException(status_code=404, detail="PQR no encontrada")
    return pqr
```

**Paso 6: Registrar el router en `backend_fastapi/app/main.py`**

```python
from app.routers import pqr
app.include_router(pqr.router)
```

**Paso 7: Crear componente en React**

```jsx
// frontend/src/pages/PQR.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function PQR() {
    const { user } = useAuth();
    const [pqrs, setPqrs] = useState([]);
    const [nuevoPQR, setNuevoPQR] = useState({ tipo: 'peticion', asunto: '', descripcion: '' });

    useEffect(() => {
        cargarPQRs();
    }, []);

    const cargarPQRs = async () => {
        const response = await api.get('/api/pqr/');
        setPqrs(response.data);
    };

    const crearPQR = async (e) => {
        e.preventDefault();
        await api.post('/api/pqr/', nuevoPQR);
        cargarPQRs();
        setNuevoPQR({ tipo: 'peticion', asunto: '', descripcion: '' });
    };

    return (
        <div>
            <h2>Módulo de PQR</h2>
            <form onSubmit={crearPQR}>
                <select value={nuevoPQR.tipo} onChange={(e) => setNuevoPQR({...nuevoPQR, tipo: e.target.value})}>
                    <option value="peticion">Petición</option>
                    <option value="queja">Queja</option>
                    <option value="reclamo">Reclamo</option>
                </select>
                <input placeholder="Asunto" value={nuevoPQR.asunto}
                       onChange={(e) => setNuevoPQR({...nuevoPQR, asunto: e.target.value})} />
                <textarea placeholder="Descripción" value={nuevoPQR.descripcion}
                          onChange={(e) => setNuevoPQR({...nuevoPQR, descripcion: e.target.value})} />
                <button type="submit">Enviar PQR</button>
            </form>

            <div>
                {pqrs.map(pqr => (
                    <div key={pqr.id}>
                        <h3>{pqr.asunto}</h3>
                        <p>Tipo: {pqr.tipo} | Estado: {pqr.estado}</p>
                        <p>{pqr.descripcion}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

---

*Documento generado el 2026-09-15 para el proyecto Cyrex Store - Ficha 3406211*
