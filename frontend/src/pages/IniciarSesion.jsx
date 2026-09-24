import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RegistroModal from '../components/RegistroModal';
import LayoutPrincipal from '../components/layout/LayoutPrincipal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { LIMITS, filterMax, validateEmail } from '../utils/validators';

const sanitizeInput = (value) => value.replace(/[<>'";\\]/g, '').trim();

export default function IniciarSesion() {
  const [step, setStep] = useState(1);
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [correoError, setCorreoError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { verifyEmail, login } = useAuth();
  const navigate = useNavigate();

  const handleCorreoChange = (e) => {
    const value = sanitizeInput(e.target.value);
    setCorreo(value);
    setCorreoError('');
    setApiError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError('');
    setApiError('');
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();

    if (!validateEmail(correo)) {
      setCorreoError('Ingresa un correo válido.');
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const data = await verifyEmail(correo);
      if (data.verified) {
        setVerificationToken(data.token);
        setStep(2);
      } else {
        setCorreoError('Correo no registrado.');
      }
    } catch (error) {
      setApiError(error.error?.message || error.message || 'Error al verificar el correo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (password.length < 1) {
      setPasswordError('Ingresa tu contraseña.');
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const data = await login(verificationToken, password);

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
    } catch (error) {
      setApiError(error.error?.message || error.message || 'Contraseña incorrecta. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    setStep(1);
    setPassword('');
    setVerificationToken('');
    setApiError('');
    setPasswordError('');
  };

  return (
    <LayoutPrincipal>
      <section className="mx-auto flex w-full max-w-6xl px-6 py-16 md:py-24">
        <div className="grid w-full gap-10 md:grid-cols-2">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">Acceso Seguro</p>
            <h1 className="font-display text-4xl text-[var(--color-text)] md:text-5xl">Iniciar sesión</h1>
            <p className="max-w-md text-[var(--color-muted)]">
              Continúa tu experiencia en Cyrex y accede a lanzamientos, promociones y colecciones
              personalizadas de PlayStation.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                  step === 1
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                    : 'border-[var(--color-accent)] text-[var(--color-accent)]'
                }`}
              >
                1
              </div>
              <span className={`text-sm ${step === 1 ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'}`}>
                Correo electrónico
              </span>

              <div className="mx-2 h-px w-8 bg-[var(--color-line)]" />

              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                  step === 2
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                    : 'border-[var(--color-line)] text-[var(--color-muted)]'
                }`}
              >
                2
              </div>
              <span className={`text-sm ${step === 2 ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'}`}>
                Contraseña
              </span>
            </div>
          </div>

          <form
            className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-7 shadow-[0_14px_55px_rgba(0,0,0,.24)]"
            onSubmit={step === 1 ? handleVerifyEmail : handleLogin}
            noValidate
          >
            {apiError && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {apiError}
              </div>
            )}

            {step === 1 ? (
              <div className="space-y-4">
                <p className="text-sm text-[var(--color-muted)]">
                  Ingresa tu correo electrónico para continuar.
                </p>
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  label="Correo"
                  value={correo}
                  onChange={handleCorreoChange}
                  error={correoError}
                  placeholder="usuario@correo.com"
                  disabled={isLoading}
                  filter={(v) => filterMax(LIMITS.correo.max)(sanitizeInput(v))}
                  maxLength={LIMITS.correo.max}
                  autoComplete="email"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-[var(--color-muted)]">
                  Correo verificado: <span className="font-medium text-[var(--color-text)]">{correo}</span>
                </p>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  label="Contraseña"
                  value={password}
                  onChange={handlePasswordChange}
                  error={passwordError}
                  placeholder="********"
                  disabled={isLoading}
                  filter={filterMax(LIMITS.password.max)}
                  maxLength={LIMITS.password.max}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                >
                  ← Cambiar correo
                </button>
              </div>
            )}

            <Button type="submit" className="mt-6 w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-bg)] border-t-transparent" />
                  {step === 1 ? 'Verificando...' : 'Iniciando...'}
                </span>
              ) : step === 1 ? (
                'Continuar'
              ) : (
                'Iniciar sesión'
              )}
            </Button>

            <div className="mt-5 flex items-center justify-between text-sm">
              <Link className="text-[var(--color-muted)] transition hover:text-[var(--color-text)]" to="/recuperar-contrasena">
                Olvidé mi contraseña
              </Link>
              <button
                type="button"
                className="font-semibold text-[var(--color-accent)]"
                onClick={() => setIsRegisterOpen(true)}
              >
                Crear cuenta
              </button>
            </div>
          </form>
        </div>
      </section>

      <RegistroModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </LayoutPrincipal>
  );
}
