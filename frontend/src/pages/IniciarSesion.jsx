import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import RegistroModal from '../components/RegistroModal';
import LayoutPrincipal from '../components/layout/LayoutPrincipal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const initialForm = {
  correo: '',
  password: '',
  remember: false
};

const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validatePassword = (value) => /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(value);

export default function IniciarSesion() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const validators = useMemo(
    () => ({
      correo: (value) => (!validateEmail(value) ? 'Ingresa un correo valido.' : ''),
      password: (value) =>
        !validatePassword(value)
          ? 'Contrasena insegura: usa 8+ caracteres, mayuscula, numero y simbolo.'
          : ''
    }),
    []
  );

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));

    if (name in validators) {
      setErrors((prev) => ({ ...prev, [name]: validators[name](value) }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {
      correo: validators.correo(form.correo),
      password: validators.password(form.password)
    };

    setErrors(nextErrors);
  };

  return (
    <LayoutPrincipal>
      <section className="mx-auto flex w-full max-w-6xl px-6 py-16 md:py-24">
        <div className="grid w-full gap-10 md:grid-cols-2">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">Acceso Seguro</p>
            <h1 className="font-display text-4xl text-[var(--color-text)] md:text-5xl">Iniciar sesion</h1>
            <p className="max-w-md text-[var(--color-muted)]">
              Continua tu experiencia en Cyrex y accede a lanzamientos, promociones y colecciones
              personalizadas de PlayStation.
            </p>
          </div>

          <form
            className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-7 shadow-[0_14px_55px_rgba(0,0,0,.24)]"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="space-y-4">
              <Input
                id="correo"
                name="correo"
                type="email"
                label="Correo"
                value={form.correo}
                onChange={handleChange}
                error={errors.correo}
                placeholder="usuario@correo.com"
              />
              <Input
                id="password"
                name="password"
                type="password"
                label="Contrasena"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="********"
              />
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm text-[var(--color-muted)]">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="h-4 w-4 rounded border-[var(--color-line)] bg-transparent"
              />
              Recordarme
            </label>

            <Button type="submit" className="mt-6 w-full">
              Iniciar sesion
            </Button>

            <div className="mt-5 flex items-center justify-between text-sm">
              <Link className="text-[var(--color-muted)] transition hover:text-[var(--color-text)]" to="/recuperar-contrasena">
                Olvide mi contrasena
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
