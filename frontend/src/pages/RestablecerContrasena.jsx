import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LayoutPrincipal from '../components/layout/LayoutPrincipal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { authAPI } from '../services/api';

export default function RestablecerContrasena() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = (name, value, allValues) => {
    if (name === 'password') {
      return value.length >= 8 ? '' : 'Mínimo 8 caracteres.';
    }
    if (name === 'confirmPassword') {
      return value === allValues.password ? '' : 'Las contraseñas no coinciden.';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    setForm(newForm);
    setErrors({ ...errors, [name]: validate(name, value, newForm) });
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {
      password: validate('password', form.password, form),
      confirmPassword: validate('confirmPassword', form.confirmPassword, form),
    };
    
    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      return;
    }

    if (!token) {
      setApiError('Falta el token de recuperación en la URL.');
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const response = await authAPI.resetPassword(token, form.password);
      setSuccessMsg(response.message);
      setTimeout(() => {
        navigate('/iniciar-sesion');
      }, 3000);
    } catch (err) {
      setApiError(err.error || 'El token es inválido o expiró.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LayoutPrincipal>
      <section className="mx-auto w-full max-w-xl px-6 py-16 md:py-24">
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-7">
          <h1 className="font-display text-3xl text-[var(--color-text)]">Nueva Contraseña</h1>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            Ingresa tu nueva contraseña para acceder a tu cuenta.
          </p>

          {!token ? (
            <div className="mt-6 rounded border border-red-500/20 bg-red-500/10 p-3 text-red-500">
              Enlace de recuperación inválido o incompleto.
            </div>
          ) : successMsg ? (
            <div className="mt-6 rounded border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-500">
              {successMsg} Redirigiendo al login...
            </div>
          ) : (
            <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
              <Input
                name="password"
                label="Nueva Contraseña"
                type="password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Mínimo 8 caracteres"
              />
              <Input
                name="confirmPassword"
                label="Confirmar Contraseña"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="Repite tu nueva contraseña"
              />
              <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
                {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </Button>
              {apiError && <p className="text-sm text-red-500">{apiError}</p>}
            </form>
          )}
        </div>
      </section>
    </LayoutPrincipal>
  );
}
