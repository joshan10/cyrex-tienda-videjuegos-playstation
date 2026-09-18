import { Link } from 'react-router-dom';
import LayoutPrincipal from '../components/layout/LayoutPrincipal';

export default function PagoCancelado() {
  return (
    <LayoutPrincipal>
      <section className="mx-auto flex w-full max-w-2xl px-6 py-16 md:py-24">
        <div className="w-full space-y-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/15">
            <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="font-display text-3xl text-[var(--color-text)] md:text-4xl">
            Pago Cancelado
          </h1>

          <p className="text-[var(--color-muted)]">
            El pago no fue completado. No se ha realizado ningún cargo a tu tarjeta.
          </p>

          <p className="text-sm text-[var(--color-muted)]">
            Si tuviste algún problema, puedes intentar nuevamente o contactar soporte.
          </p>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
            <Link
              to="/tienda"
              className="rounded-xl bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-[var(--color-bg)] transition hover:opacity-90"
            >
              Volver a la tienda
            </Link>
            <Link
              to="/contacto"
              className="rounded-xl border border-[var(--color-line)] px-6 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
            >
              Contactar soporte
            </Link>
          </div>
        </div>
      </section>
    </LayoutPrincipal>
  );
}
