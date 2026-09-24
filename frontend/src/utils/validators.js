// Validadores y filtros de entrada compartidos por todos los formularios.
// Los límites están alineados con los schemas del backend (Pydantic) y la BD.

export const LIMITS = {
  nombre: { min: 2, max: 100 },
  apellido: { min: 2, max: 100 },
  correo: { max: 150 },
  telefono: { min: 7, max: 15 },
  numeroDocumento: { min: 6, max: 15 },
  direccion: { min: 6, max: 255 },
  password: { min: 8, max: 128 },
  mensaje: { min: 10, max: 1000 },
  asunto: { min: 3, max: 200 },
  descripcionPqr: { min: 10, max: 5000 },
  productoNombre: { min: 1, max: 200 },
  descripcionProducto: { max: 2000 },
  plataforma: { max: 50 },
  numeroFactura: { max: 50 }
};

const NAME_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?: [A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?\d{7,15}$/;
const DOC_RE = /^\d{6,15}$/;
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

export const validateEmail = (value) => EMAIL_RE.test(String(value || '').trim());
export const validatePhone = (value) => PHONE_RE.test(String(value || '').trim());
export const validatePassword = (value) => PASSWORD_RE.test(String(value || ''));

/** Solo letras (con acentos) y espacios. Sin números ni símbolos. */
export const isAlpha = (value) => NAME_RE.test(String(value || '').trim());

export function validateName(value, field = 'El nombre') {
  const v = String(value || '').trim();
  if (v.length < LIMITS.nombre.min) return `${field} debe tener al menos ${LIMITS.nombre.min} caracteres.`;
  if (v.length > LIMITS.nombre.max) return `${field} no puede superar ${LIMITS.nombre.max} caracteres.`;
  if (!isAlpha(v)) return `${field} solo puede contener letras y espacios.`;
  return '';
}

export function validateApellido(value) {
  return validateName(value, 'El apellido');
}

export function validateDireccion(value) {
  const v = String(value || '').trim();
  if (v.length < LIMITS.direccion.min) return `La dirección debe tener al menos ${LIMITS.direccion.min} caracteres.`;
  if (v.length > LIMITS.direccion.max) return `La dirección no puede superar ${LIMITS.direccion.max} caracteres.`;
  return '';
}

export function validateCorreo(value) {
  const v = String(value || '').trim();
  if (!v) return 'El correo es obligatorio.';
  if (v.length > LIMITS.correo.max) return `El correo no puede superar ${LIMITS.correo.max} caracteres.`;
  if (!validateEmail(v)) return 'Correo electrónico inválido.';
  return '';
}

export function validateTelefono(value) {
  const v = String(value || '').trim();
  if (!v) return 'El teléfono es obligatorio.';
  if (!PHONE_RE.test(v)) return 'Teléfono inválido. Usa solo números (7 a 15 dígitos) con prefijo opcional +.';
  return '';
}

export function validateNumeroDocumento(value) {
  const v = String(value || '').trim();
  if (!DOC_RE.test(v)) return 'Documento inválido. Usa solo números (6 a 15 dígitos).';
  return '';
}

export function validateMensaje(value) {
  const v = String(value || '').trim();
  if (v.length < LIMITS.mensaje.min) return `El mensaje debe tener al menos ${LIMITS.mensaje.min} caracteres.`;
  if (v.length > LIMITS.mensaje.max) return `El mensaje no puede superar ${LIMITS.mensaje.max} caracteres.`;
  return '';
}

export function validateAsunto(value) {
  const v = String(value || '').trim();
  if (v.length < LIMITS.asunto.min) return `El asunto debe tener al menos ${LIMITS.asunto.min} caracteres.`;
  if (v.length > LIMITS.asunto.max) return `El asunto no puede superar ${LIMITS.asunto.max} caracteres.`;
  return '';
}

export function validateProductoNombre(value) {
  const v = String(value || '').trim();
  if (v.length < LIMITS.productoNombre.min) return 'El nombre del producto es obligatorio.';
  if (v.length > LIMITS.productoNombre.max) return `El nombre no puede superar ${LIMITS.productoNombre.max} caracteres.`;
  return '';
}

export function validateDescripcionProducto(value) {
  const v = String(value || '').trim();
  if (v.length > LIMITS.descripcionProducto.max) return `La descripción no puede superar ${LIMITS.descripcionProducto.max} caracteres.`;
  return '';
}

export function validatePrecio(value) {
  const n = Number(value);
  if (value === '' || value === null || Number.isNaN(n)) return 'Ingresa un precio válido.';
  if (n < 0) return 'El precio no puede ser negativo.';
  return '';
}

export function validateStock(value) {
  const n = Number(value);
  if (value === '' || value === null || Number.isNaN(n)) return 'Ingresa un stock válido.';
  if (!Number.isInteger(n) || n < 0) return 'El stock debe ser un número entero positivo (o 0).';
  return '';
}

// ---------------------------------------------------------------------------
// Filtros de entrada: eliminan caracteres no permitidos mientras se escribe.
// ---------------------------------------------------------------------------

/** Deja solo letras (con acentos) y espacios. */
export const filterAlpha = (value) => String(value || '').replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/g, '');

/** Deja solo dígitos. */
export const filterDigits = (value) => String(value || '').replace(/\D/g, '');

/** Deja solo dígitos y un + inicial opcional (teléfonos). */
export const filterPhone = (value) => {
  const raw = String(value || '').replace(/[^\d+]/g, '');
  const plus = raw.startsWith('+') ? '+' : '';
  return plus + raw.replace(/\+/g, '');
};

/** Deja solo dígitos y recorta a max. */
export const filterDigitsMax = (max) => (value) => filterDigits(value).slice(0, max);

/** Recorta a max caracteres. */
export const filterMax = (max) => (value) => String(value || '').slice(0, max);

/**
 * Crea un handler de onChange que aplica un filtro y delega en onChange original.
 * Uso: onChange={withFilter(filterAlpha, handleChange)}
 */
export const withFilter =
  (filter, onChange) =>
  (event) => {
    const next = filter(event.target.value);
    if (next !== event.target.value) {
      event.target.value = next;
    }
    onChange(event);
  };
