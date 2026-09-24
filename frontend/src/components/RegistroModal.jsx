import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import {
  LIMITS,
  filterAlpha,
  filterDigits,
  filterMax,
  filterPhone,
  validateApellido,
  validateCorreo,
  validateDireccion,
  validateName,
  validateNumeroDocumento,
  validatePassword,
  validateTelefono
} from '../utils/validators';

const typeOptions = [
  { value: '', label: 'Selecciona una opcion' },
  { value: 'cc', label: 'Cedula de ciudadania' },
  { value: 'ce', label: 'Cedula de extranjeria' },
  { value: 'pasaporte', label: 'Pasaporte' }
];

const initialForm = {
  nombre: '',
  apellido: '',
  tipoDocumento: '',
  numeroDocumento: '',
  direccion: '',
  telefono: '',
  correo: '',
  password: '',
  confirmPassword: ''
};

export default function RegistroModal({ isOpen, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validators = useMemo(
    () => ({
      nombre: validateName,
      apellido: validateApellido,
      tipoDocumento: (value) => (!value ? 'Selecciona un tipo de documento.' : ''),
      numeroDocumento: validateNumeroDocumento,
      direccion: validateDireccion,
      telefono: validateTelefono,
      correo: validateCorreo,
      password: (value) => (!validatePassword(value) ? 'La contrasena debe tener 8+ caracteres, una mayuscula, un numero y un simbolo.' : ''),
      confirmPassword: (value) => (value !== form.password ? 'Las contrasenas no coinciden.' : '')
    }),
    [form.password]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validators[name]?.(value) || '' }));
    setApiError('');

    if (name === 'password') {
      setErrors((prev) => ({
        ...prev,
        password: validators.password(value),
        confirmPassword: validators.confirmPassword(form.confirmPassword)
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    Object.keys(form).forEach((key) => {
      const error = validators[key](form[key]);
      if (error) nextErrors[key] = error;
    });

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    setApiError('');

    try {
      await register({
        nombre: form.nombre,
        apellido: form.apellido,
        tipo_documento: form.tipoDocumento,
        numero_documento: form.numeroDocumento,
        direccion: form.direccion,
        telefono: form.telefono,
        correo: form.correo,
        password: form.password
      });

      onClose();
      setForm(initialForm);
      navigate('/dashboard/cliente');
    } catch (error) {
      if (error.errors) {
        // Errores de validación del backend
        const backendErrors = {};
        error.errors.forEach((err) => {
          // Mapear campos del backend a nombres del frontend
          const fieldMap = {
            tipo_documento: 'tipoDocumento',
            numero_documento: 'numeroDocumento'
          };
          const field = fieldMap[err.path] || err.path;
          backendErrors[field] = err.msg;
        });
        setErrors((prev) => ({ ...prev, ...backendErrors }));
      } else {
        setApiError(error.error || 'Error al crear la cuenta. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[color:rgba(9,10,15,.72)] px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] p-6 shadow-[0_20px_60px_rgba(0,0,0,.45)] md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-display text-2xl tracking-[0.1em] text-[var(--color-text)]">Crear Cuenta</h3>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </div>

        {apiError && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {apiError}
          </div>
        )}

        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit} noValidate>
          <Input
            id="nombre"
            name="nombre"
            label="Nombre"
            value={form.nombre}
            onChange={handleChange}
            error={errors.nombre}
            filter={(v) => filterAlpha(v).slice(0, LIMITS.nombre.max)}
            maxLength={LIMITS.nombre.max}
            autoComplete="given-name"
          />
          <Input
            id="apellido"
            name="apellido"
            label="Apellido"
            value={form.apellido}
            onChange={handleChange}
            error={errors.apellido}
            filter={(v) => filterAlpha(v).slice(0, LIMITS.apellido.max)}
            maxLength={LIMITS.apellido.max}
            autoComplete="family-name"
          />
          <Select
            id="tipoDocumento"
            name="tipoDocumento"
            label="Tipo de documento"
            value={form.tipoDocumento}
            onChange={handleChange}
            options={typeOptions}
            error={errors.tipoDocumento}
          />
          <Input
            id="numeroDocumento"
            name="numeroDocumento"
            label="Numero de documento"
            value={form.numeroDocumento}
            onChange={handleChange}
            error={errors.numeroDocumento}
            filter={(v) => filterDigits(v).slice(0, LIMITS.numeroDocumento.max)}
            maxLength={LIMITS.numeroDocumento.max}
            inputMode="numeric"
          />
          <Input
            id="direccion"
            name="direccion"
            label="Direccion"
            value={form.direccion}
            onChange={handleChange}
            error={errors.direccion}
            className="md:col-span-2"
            filter={filterMax(LIMITS.direccion.max)}
            maxLength={LIMITS.direccion.max}
            autoComplete="street-address"
          />
          <Input
            id="telefono"
            name="telefono"
            label="Telefono"
            value={form.telefono}
            onChange={handleChange}
            error={errors.telefono}
            filter={filterPhone}
            maxLength={16}
            inputMode="tel"
            placeholder="+573001234567"
          />
          <Input
            id="correo"
            name="correo"
            type="email"
            label="Correo"
            value={form.correo}
            onChange={handleChange}
            error={errors.correo}
            filter={filterMax(LIMITS.correo.max)}
            maxLength={LIMITS.correo.max}
            autoComplete="email"
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Contrasena"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            filter={filterMax(LIMITS.password.max)}
            maxLength={LIMITS.password.max}
            autoComplete="new-password"
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirmar contrasena"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            filter={filterMax(LIMITS.password.max)}
            maxLength={LIMITS.password.max}
            autoComplete="new-password"
          />
          <div className="mt-2 flex justify-end gap-3 md:col-span-2">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || Object.values(errors).some(Boolean)}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-bg)] border-t-transparent" />
                  Registrando...
                </span>
              ) : (
                'Crear cuenta'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
