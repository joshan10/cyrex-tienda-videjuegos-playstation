# Plan: Reemplazar Wompi con Stripe — MVP Rápido

## Contexto

El proyecto SYREX actualmente tiene una integración con Wompi (pasarela de pagos colombiana) que incluye:
- 167 líneas de servicio (wompi.py)
- 368 líneas de router (pagos.py)
- 85 líneas de schemas (wompi.py)
- Mock checkout HTML de 130 líneas embebido en el router
- Endpoint de simulación de pagos

El objetivo es reemplazar toda la integración Wompi por **Stripe Checkout (Hosted)** con soporte para **USD y COP**.

## Lo que necesitas hacer tú (antes de que yo implemente)

### Paso 1: Crear cuenta en Stripe

1. Ve a https://dashboard.stripe.com/register
2. Crea una cuenta con tu email
3. Verifica tu email
4. Completa los datos básicos (nombre, país, etc.)

### Paso 2: Obtener API keys de prueba

1. En el Dashboard de Stripe, ve a **Developers → API keys**
2. Copia las dos keys:
   - **Publishable key** (`pk_test_...`) — para el frontend
   - **Secret key** (`sk_test_...`) — para el backend (NUNCA exponer en frontend)

### Paso 3: Configurar webhook de prueba

1. Ve a **Developers → Webhooks**
2. Haz clic en **Add endpoint**
3. URL: `http://localhost:4000/api/pagos/webhook` (para desarrollo local)
4. Events to send: selecciona:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
5. Copia el **Signing secret** (`whsec_...`)

### Paso 4: Activar monedas

1. Ve a **Settings → Payment methods**
2. Activa **Card payments** para USD y COP
3. En **Settings → Currencies**, habilita COP si no está activo

### Paso 5: Pasarme las keys

Cuando tengas las keys, pégalas aquí para que las configure en el `.env`:
- `sk_test_...` (secret key)
- `pk_test_...` (publishable key)
- `whsec_...` (webhook signing secret)

---

## Arquitectura de la integración Stripe

### Flujo de pago (Checkout Hosted)

```
Frontend (Tienda)          Backend (FastAPI)           Stripe
       │                         │                       │
       │  POST /pagos            │                       │
       │  {orden_id, email,      │                       │
       │   currency}             │                       │
       │ ───────────────────────>│                       │
       │                         │  Crear Pago en BD     │
       │                         │  Crear Checkout       │
       │                         │  Session con Stripe   │
       │                         │ ─────────────────────>│
       │                         │  {url: "checkout.     │
       │                         │   stripe.com/..."}    │
       │                         │ <─────────────────────│
       │  {checkout_url}         │                       │
       │ <───────────────────────│                       │
       │                         │                       │
       │  REDIRIGIR a Stripe     │                       │
       │ ────────────────────────────────────────────────>│
       │                         │                       │
       │                         │  Webhook:             │
       │                         │  checkout.session.    │
       │                         │  completed            │
       │                         │ <─────────────────────│
       │                         │  Actualizar pago      │
       │                         │  Estado: "paid"       │
       │                         │  Actualizar orden     │
       │                         │  Estado: "procesando" │
       │                         │                       │
       │  Redirigir a success    │                       │
       │  page en frontend       │                       │
```

### Archivos a crear/modificar

#### Archivos a REEMPLAZAR completamente:

| Archivo actual | Archivo nuevo | Acción |
|----------------|---------------|--------|
| `app/services/wompi.py` (167 líneas) | `app/services/stripe_service.py` | **REEMPLAZAR** — Crear Checkout Session, verificar webhook |
| `app/schemas/wompi.py` (85 líneas) | `app/schemas/pagos.py` | **REEMPLAZAR** — Schemas genéricos de pago |

#### Archivos a REESCRIBIR:

| Archivo | Acción |
|---------|--------|
| `app/routers/pagos.py` (368 líneas) | **REESCRIBIR** — Eliminar mock HTML, simulación, simplificar a: crear pago, consultar, webhook |

#### Archivos a MODIFICAR (cambios menores):

| Archivo | Cambios |
|---------|---------|
| `app/models/entities.py` | Renombrar `wompi_transaction_id` → `stripe_session_id`, `wompi_response` → `stripe_response` |
| `app/core/config.py` | Reemplazar 6 vars `wompi_*` por 3 vars `stripe_*` |
| `app/main.py` | Cambiar descripción de "Wompi" a "Stripe" en tags |
| `.env` | Reemplazar vars Wompi por vars Stripe |
| `.env.example` | Reemplazar vars Wompi por vars Stripe |
| `requirements.txt` | Agregar `stripe` SDK oficial |
| `frontend/src/services/api.js` | Cambiar comentario "PAGOS (WOMPI)" a "PAGOS (STRIPE)" |
| `frontend/src/pages/Tienda.jsx` | Reemplazar flujo de pago: en vez de crear pago + simular, redirigir a checkout_url de Stripe |

#### Archivos a ELIMINAR:

| Archivo | Razón |
|---------|-------|
| `database/migration_email_verification_token.sql` | No related, keep |

#### Archivos que NO cambian:

- `TarjetaModal.jsx` — Se mantiene pero ya no se usa para el pago principal (puede usarse como fallback futuro)
- `ClienteDashboard.jsx` — Solo muestra órdenes, no pagos
- `AdminDashboard.jsx` — Solo muestra órdenes, no pagos

### Modelo de datos actualizado (Pago)

```python
class Pago(Base):
    __tablename__ = "pagos"
    id: Mapped[int]                    # PRIMARY KEY
    orden_id: Mapped[int]             # FK -> ordenes.id
    stripe_session_id: Mapped[str | None]  # cs_test_... (Checkout Session ID)
    reference: Mapped[str]             # ORD-{ts}-{rand} (referencia interna)
    amount_in_cents: Mapped[int]       # Monto en centavos
    currency: Mapped[str]              # "usd" o "cop"
    status: Mapped[str]                # "pending", "paid", "failed", "expired"
    payment_method_type: Mapped[str | None]  # "card" (Stripe detecta automáticamente)
    customer_email: Mapped[str]        # Email del cliente
    stripe_response: Mapped[str | None]  # JSON de respuesta de Stripe
    created_at: Mapped[datetime | None]
    updated_at: Mapped[datetime | None]
```

### Schemas Pydantic

```python
# Request para crear pago
class CrearPagoStripe(BaseModel):
    orden_id: int
    customer_email: EmailStr
    currency: str = "usd"  # "usd" o "cop"

# Response de pago
class PagoRespuesta(BaseModel):
    id: int
    orden_id: int
    stripe_session_id: str | None
    reference: str
    amount_in_cents: int
    currency: str
    status: str
    payment_method_type: str | None
    customer_email: str
    checkout_url: str | None  # URL de Stripe Checkout
    created_at: datetime | None
```

### Endpoints del router pagos

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/pagos` | POST | Crear Checkout Session en Stripe, retorna `checkout_url` |
| `/pagos/{pago_id}` | GET | Consultar estado de un pago |
| `/pagos/orden/{orden_id}` | GET | Listar pagos de una orden |
| `/pagos/webhook` | POST | Webhook de Stripe (verificar firma, actualizar estado) |

**Eliminados:**
- `POST /pagos/simular` — Ya no hace falta (Stripe maneja el flujo real)
- `GET /pagos/checkout/{reference}` — Ya no hace falta (Stripe redirige a su página)

### Servicio Stripe (stripe_service.py)

```python
import stripe
from app.core.config import settings

# Crear Checkout Session
def crear_checkout_session(orden_id, customer_email, amount, currency, reference):
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": currency,
                "product_data": {"name": f"Orden #{orden_id} — SYREX"},
                "unit_amount": amount,
            },
            "quantity": 1,
        }],
        mode="payment",
        success_url=f"{settings.frontend_url}/pago-exitoso?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{settings.frontend_url}/pago-cancelado",
        metadata={"orden_id": str(orden_id), "reference": reference},
        customer_email=customer_email,
    )
    return session

# Verificar webhook signature
def verificar_webhook(payload, sig_header):
    return stripe.Webhook.construct_event(
        payload, sig_header, settings.stripe_webhook_secret
    )
```

### Configuración (.env)

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY_DEFAULT=usd
```

### Frontend — Cambios en Tienda.jsx

**Antes (Wompi):**
```javascript
const pagoRes = await pagosAPI.create({
  orden_id: orden.id,
  customer_email: user.correo,
  payment_method_type: 'CARD',
  token: 'tok_test',  // fake token
  installments: 1
});
// Inmediatamente simular aprobación
await pagosAPI.simular(pagoRes.reference, 'APPROVED');
```

**Después (Stripe):**
```javascript
const pagoRes = await pagosAPI.create({
  orden_id: orden.id,
  customer_email: user.correo,
  currency: 'usd'  // o 'cop'
});
// Redirigir a Stripe Checkout
window.location.href = pagoRes.checkout_url;
```

### Páginas nuevas en frontend

| Ruta | Componente | Propósito |
|------|------------|-----------|
| `/pago-exitoso` | `PagoExitoso.jsx` | Página de confirmación después del pago exitoso |
| `/pago-cancelado` | `PagoCancelado.jsx` | Página cuando el usuario cancela el pago |

---

## Orden de implementación

1. **Crear rama** `feature/stripe-payments`
2. **Backend:**
   a. Actualizar `requirements.txt` (agregar `stripe`)
   b. Reemplazar config en `config.py` (wompi → stripe)
   c. Actualizar modelo `Pago` en `entities.py`
   d. Crear `services/stripe_service.py`
   e. Crear `schemas/pagos.py`
   f. Reescribir `routers/pagos.py`
   g. Actualizar `main.py` (tags)
   h. Actualizar `.env` y `.env.example`
3. **Frontend:**
   a. Actualizar `api.js`
   b. Crear `PagoExitoso.jsx` y `PagoCancelado.jsx`
   c. Actualizar `Tienda.jsx`
   d. Actualizar `App.jsx` (nuevas rutas)
4. **Tests:**
   a. Actualizar `test_auth.py` si es necesario
   b. Crear tests para el nuevo flujo de pago
5. **Migración:**
   a. Crear SQL de migración para renombrar columnas
6. **Verificar:**
   a. Ejecutar todos los tests
   b. Hacer commit y merge
