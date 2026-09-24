import { useState } from 'react';
import Button from './ui/Button';
import { LIMITS, filterAlpha, isAlpha } from '../utils/validators';

export default function TarjetaModal({ isOpen, onClose, onConfirm, initialData }) {
  const [formData, setFormData] = useState({
    numero: initialData?.numero || '',
    nombre: initialData?.nombre || '',
    fecha: initialData?.fecha || '',
    cvv: ''
  });
  const [errors, setErrors] = useState({});
  const [showCvv, setShowCvv] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    const numeroSinEspacios = formData.numero.replace(/\s/g, '');
    if (!numeroSinEspacios || numeroSinEspacios.length < 13) {
      newErrors.numero = 'Número de tarjeta inválido (mínimo 13 dígitos)';
    }
    if (!formData.nombre || formData.nombre.trim().length < 2) {
      newErrors.nombre = 'Nombre del titular inválido (mínimo 2 caracteres)';
    } else if (!isAlpha(formData.nombre.trim())) {
      newErrors.nombre = 'El nombre del titular solo puede contener letras y espacios.';
    }
    if (!formData.fecha) {
      newErrors.fecha = 'Fecha inválida';
    }
    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = 'CVV inválido (mínimo 3 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onConfirm(formData);
      setFormData({ numero: '', nombre: '', fecha: '', cvv: '' });
      setErrors({});
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:rgba(9,10,15,.72)] px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] p-6 shadow-[0_20px_60px_rgba(0,0,0,.45)]">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-display text-xl text-[var(--color-text)]">
            {initialData ? 'Tarjeta Guardada' : 'Agregar Tarjeta de Crédito'}
          </h3>
          <button onClick={onClose} className="text-[var(--color-muted)] hover:text-[var(--color-text)]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {initialData && (
          <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-emerald-400 text-sm">
            ✓ Ya tienes una tarjeta guardada: **** {formData.numero.slice(-4)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Número de Tarjeta
            </label>
            <input
              type="text"
              value={formData.numero}
              onChange={(e) => {
                const max = e.target.maxLength;
                let next = formatCardNumber(e.target.value);
                if (max > 0 && next.length > max) next = next.slice(0, max);
                e.target.value = next;
                setFormData(prev => ({ ...prev, numero: next }));
              }}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className={`w-full rounded-xl border px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] ${
                errors.numero ? 'border-red-500' : 'border-[var(--color-line)] bg-[var(--color-surface)]'
              }`}
            />
            {errors.numero && <p className="mt-1 text-xs text-red-400">{errors.numero}</p>}
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Nombre del Titular
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => {
                const max = e.target.maxLength;
                let next = filterAlpha(e.target.value).slice(0, LIMITS.nombre.max).toUpperCase();
                if (max > 0 && next.length > max) next = next.slice(0, max);
                e.target.value = next;
                setFormData(prev => ({ ...prev, nombre: next }));
              }}
              placeholder="JUAN PEREZ"
              maxLength={LIMITS.nombre.max}
              className={`w-full rounded-xl border px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] ${
                errors.nombre ? 'border-red-500' : 'border-[var(--color-line)] bg-[var(--color-surface)]'
              }`}
            />
            {errors.nombre && <p className="mt-1 text-xs text-red-400">{errors.nombre}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Fecha de Expiración
              </label>
              <input
                type="text"
                value={formData.fecha}
                onChange={(e) => {
                  const max = e.target.maxLength;
                  let next = formatExpiry(e.target.value);
                  if (max > 0 && next.length > max) next = next.slice(0, max);
                  e.target.value = next;
                  setFormData(prev => ({ ...prev, fecha: next }));
                }}
                placeholder="MM/YY"
                maxLength={5}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] ${
                  errors.fecha ? 'border-red-500' : 'border-[var(--color-line)] bg-[var(--color-surface)]'
                }`}
              />
              {errors.fecha && <p className="mt-1 text-xs text-red-400">{errors.fecha}</p>}
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
                CVV
              </label>
              <div className="relative">
                <input
                  type={showCvv ? 'text' : 'password'}
                  value={formData.cvv}
                  onChange={(e) => {
                    const max = e.target.maxLength;
                    let next = e.target.value.replace(/[^0-9]/g, '');
                    if (max > 0 && next.length > max) next = next.slice(0, max);
                    e.target.value = next;
                    setFormData(prev => ({ ...prev, cvv: next }));
                  }}
                  placeholder="123"
                  maxLength={4}
                  className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] ${
                    errors.cvv ? 'border-red-500' : 'border-[var(--color-line)] bg-[var(--color-surface)]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCvv((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
                  tabIndex={-1}
                >
                  {showCvv ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.cvv && <p className="mt-1 text-xs text-red-400">{errors.cvv}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Confirmar Tarjeta</Button>
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-[var(--color-muted)]">
          🔒 Tus datos están protegidos con encriptación SSL
        </p>
      </div>
    </div>
  );
}
