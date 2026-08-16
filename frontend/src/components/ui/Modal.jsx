import { useEffect, useRef } from 'react';

export function Modal({ abierto, onCerrar, titulo, children, ancho = 'lg' }) {
  const overlayRef = useRef(null);

  const anchos = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  useEffect(() => {
    if (!abierto) return;

    const manejarTecla = (e) => {
      if (e.key === 'Escape') onCerrar();
    };

    document.addEventListener('keydown', manejarTecla);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', manejarTecla);
      document.body.style.overflow = '';
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const manejarClickOverlay = (e) => {
    if (e.target === overlayRef.current) onCerrar();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-purpura-profundo/85 p-4 backdrop-blur-md sm:p-6"
      onClick={manejarClickOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titulo ? 'modal-titulo' : undefined}
    >
      <div
        className={[
          'relative max-h-[92vh] w-full overflow-y-auto rounded-2xl border border-borde-magenta',
          'bg-linear-to-br from-purpura-profundo to-purpura-oscuro',
          'p-6 shadow-[var(--sombra-suave)] sm:p-8',
          anchos[ancho] ?? anchos.lg,
        ].join(' ')}
      >
        <button
          type="button"
          onClick={onCerrar}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg border border-borde-magenta text-blanco-frio/60 transition-colors hover:border-magenta-vibrante hover:bg-magenta-tenue hover:text-blanco-frio"
          aria-label="Cerrar modal"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {titulo && (
          <h2 id="modal-titulo" className="mb-6 pr-10 font-titulo text-xl font-bold text-blanco-frio sm:text-2xl">
            {titulo}
          </h2>
        )}

        {children}
      </div>
    </div>
  );
}
