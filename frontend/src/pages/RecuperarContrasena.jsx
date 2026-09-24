import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LayoutPrincipal from '../components/layout/LayoutPrincipal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { authAPI } from '../services/api';
import { LIMITS, filterMax, validateEmail } from '../utils/validators';

export default function RecuperarContrasena() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const value = filterMax(LIMITS.correo.max)(event.target.value);
    setEmail(value);
    setError(value && !validateEmail(value) ? 'Ingresa un correo valido.' : '');
    setApiError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateEmail(email)) {
      setError('Ingresa un correo valido.');
      return;
    }
    
    setIsLoading(true);
    setApiError('');
    
    try {
      const response = await authAPI.forgotPassword(email);
      // En modo desarrollo, capturamos el token de la respuesta para probar el flujo sin correo real.
      if (response.dev_token) {
        navigate(`/restablecer-contrasena?token=${response.dev_token}`);
      } else {
        // En produccion se enviaria el correo
        alert(response.message);
      }
    } catch (err) {
      setApiError(err.error || 'Ocurrió un error al procesar la solicitud.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LayoutPrincipal>
      <section className="mx-auto w-full max-w-xl px-6 py-16 md:py-24">
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-7">
          <h1 className="font-display text-3xl text-[var(--color-text)]">Recuperar Contrasena</h1>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            Te enviaremos instrucciones para restablecer el acceso a tu cuenta.
          </p>

          <form className="mt-6" onSubmit={handleSubmit} noValidate>
            <Input
              id="recoveryEmail"
              name="recoveryEmail"
              label="Correo"
              value={email}
              onChange={handleChange}
              error={error}
              type="email"
              placeholder="usuario@correo.com"
              filter={filterMax(LIMITS.correo.max)}
              maxLength={LIMITS.correo.max}
              autoComplete="email"
            />
            <Button type="submit" className="mt-5 w-full" disabled={!!error} loading={isLoading} loadingText="Enviando...">
              Enviar
            </Button>
            {apiError && <p className="mt-3 text-sm text-red-500">{apiError}</p>}
          </form>

          <Link to="/iniciar-sesion" className="mt-4 inline-block text-sm text-[var(--color-accent)]">
            Volver al login
          </Link>
        </div>
      </section>
    </LayoutPrincipal>
  );
}
