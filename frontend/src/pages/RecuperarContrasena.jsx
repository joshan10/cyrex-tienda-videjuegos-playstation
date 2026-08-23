import { useState } from 'react';
import { Link } from 'react-router-dom';
import LayoutPrincipal from '../components/layout/LayoutPrincipal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function RecuperarContrasena() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleChange = (event) => {
    const value = event.target.value;
    setEmail(value);
    setError(value && !validateEmail(value) ? 'Ingresa un correo valido.' : '');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateEmail(email)) {
      setError('Ingresa un correo valido.');
      return;
    }
    setSent(true);
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
            />
            <Button type="submit" className="mt-5 w-full">
              Enviar
            </Button>
            {sent ? <p className="mt-3 text-sm text-emerald-400">Correo enviado correctamente.</p> : null}
          </form>

          <Link to="/iniciar-sesion" className="mt-4 inline-block text-sm text-[var(--color-accent)]">
            Volver al login
          </Link>
        </div>
      </section>
    </LayoutPrincipal>
  );
}
