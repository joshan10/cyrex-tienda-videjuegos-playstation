import { useMemo, useState } from 'react';
import LayoutPrincipal from '../components/layout/LayoutPrincipal';
import ScrollReveal from '../components/ScrollReveal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const initialForm = {
  nombre: '',
  correo: '',
  telefono: '',
  mensaje: ''
};

const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validatePhone = (value) => /^\+?\d{7,15}$/.test(value);

export default function Contacto() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const validators = useMemo(
    () => ({
      nombre: (value) => (!value.trim() ? 'El nombre es obligatorio.' : ''),
      correo: (value) => (!validateEmail(value) ? 'Correo invalido.' : ''),
      telefono: (value) => (!validatePhone(value) ? 'Telefono invalido.' : ''),
      mensaje: (value) => (value.trim().length < 10 ? 'El mensaje debe tener al menos 10 caracteres.' : '')
    }),
    []
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (validators[name]) {
      setErrors((prev) => ({ ...prev, [name]: validators[name](value) }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = Object.fromEntries(
      Object.entries(validators)
        .map(([key, validate]) => [key, validate(form[key])])
        .filter(([, message]) => message)
    );

    setErrors(nextErrors);
    setSent(Object.keys(nextErrors).length === 0);
  };

  return (
    <LayoutPrincipal>
      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
        <ScrollReveal>
          <div className="grid gap-10 md:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">
                Atencion Personalizada
              </p>
              <h1 className="font-display text-4xl text-[var(--color-text)] md:text-5xl">Contacto</h1>
              <p className="mt-5 max-w-md text-[var(--color-muted)]">
                Si necesitas soporte para compras, acceso o recomendaciones, nuestro equipo esta listo para
                ayudarte.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-7"
            >
              <div className="space-y-4">
                <Input id="nombre" name="nombre" label="Nombre" value={form.nombre} onChange={handleChange} error={errors.nombre} />
                <Input id="correo" name="correo" type="email" label="Correo" value={form.correo} onChange={handleChange} error={errors.correo} />
                <Input id="telefono" name="telefono" label="Telefono" value={form.telefono} onChange={handleChange} error={errors.telefono} />
                <label htmlFor="mensaje">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    Mensaje
                  </span>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={form.mensaje}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
                  />
                  {errors.mensaje ? <p className="mt-2 text-xs text-red-400">{errors.mensaje}</p> : null}
                </label>
              </div>

              <Button type="submit" className="mt-6 w-full">
                Enviar mensaje
              </Button>
              {sent ? <p className="mt-3 text-sm text-emerald-400">Mensaje enviado correctamente.</p> : null}
            </form>
          </div>
        </ScrollReveal>
      </section>
    </LayoutPrincipal>
  );
}
