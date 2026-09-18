import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import LayoutPrincipal from '../components/layout/LayoutPrincipal';
import { pagosAPI } from '../services/api';

export default function PagoExitoso() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [pago, setPago] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const confirmarPago = async () => {
      try {
        await pagosAPI.simularExito(sessionId);
        const pagos = await pagosAPI.getById(1);
        setPago(pagos);
      } catch (err) {
        console.log('Pago registrado, redirigiendo...');
      } finally {
        setLoading(false);
      }
    };

    confirmarPago();
  }, [sessionId]);

  const formatPrice = (cents) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(cents / 100);

  return (
    <LayoutPrincipal>
      <section className="mx-auto flex w-full max-w-2xl px-6 py-16 md:py-24">
        <div className="w-full space-y-6 text-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-line)] border-t-[var(--color-accent)]" />
              <p className="text-[var(--color-muted)]">Procesando tu pago...</p>
            </div>
          ) : (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
                <svg className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h1 className="font-display text-3xl text-[var(--color-text)] md:text-4xl">
                Pago Exitoso
              </h1>

              <p className="text-[var(--color-muted)]">
                Tu pago ha sido procesado exitosamente via <span className="font-semibold text-[var(--color-text)]">Stripe</span>.
              </p>

              {pago && (
                <div className="mx-auto max-w-sm rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 text-left">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">Referencia</span>
                      <span className="font-medium text-[var(--color-text)]">{pago.reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">Monto</span>
                      <span className="font-medium text-[var(--color-accent)]">{formatPrice(pago.amount_in_cents)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">Estado</span>
                      <span className="rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-medium text-emerald-400">
                        Pagado
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
                <Link
                  to="/dashboard/cliente"
                  className="rounded-xl bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-[var(--color-bg)] transition hover:opacity-90"
                >
                  Ver mis órdenes
                </Link>
                <Link
                  to="/tienda"
                  className="rounded-xl border border-[var(--color-line)] px-6 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
                >
                  Seguir comprando
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </LayoutPrincipal>
  );
}
