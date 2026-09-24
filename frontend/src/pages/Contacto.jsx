import { useMemo, useState } from 'react';
import LayoutPrincipal from '../components/layout/LayoutPrincipal';
import ScrollReveal from '../components/ScrollReveal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import {
  LIMITS,
  filterAlpha,
  filterMax,
  filterPhone,
  validateCorreo,
  validateMensaje,
  validateName,
  validateTelefono
} from '../utils/validators';

const initialForm = {
  nombre: '',
  correo: '',
  telefono: '',
  mensaje: ''
};

export default function Contacto() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const validators = useMemo(
    () => ({
      nombre: validateName,
      correo: validateCorreo,
      telefono: validateTelefono,
      mensaje: validateMensaje
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
                <Input
                  id="nombre"
                  name="nombre"
                  label="Nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  error={errors.nombre}
                  filter={(v) => filterAlpha(v).slice(0, LIMITS.nombre.max)}
                  maxLength={LIMITS.nombre.max}
                  autoComplete="name"
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
                <label htmlFor="mensaje">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    Mensaje
                  </span>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={form.mensaje}
                    onChange={(e) => {
                      const next = e.target.value.slice(0, LIMITS.mensaje.max);
                      e.target.value = next;
                      handleChange(e);
                    }}
                    rows={4}
                    maxLength={LIMITS.mensaje.max}
                    minLength={LIMITS.mensaje.min}
                    placeholder={`Entre ${LIMITS.mensaje.min} y ${LIMITS.mensaje.max} caracteres`}
                    className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
                  />
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    {form.mensaje.length}/{LIMITS.mensaje.max}
                  </p>
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
