const variantes = {
  primario: [
    'bg-magenta-vibrante text-blanco-frio',
    'hover:bg-magenta-oscuro hover:shadow-[var(--sombra-magenta)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta-vibrante focus-visible:ring-offset-2 focus-visible:ring-offset-purpura-profundo',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-magenta-vibrante disabled:hover:shadow-none',
  ].join(' '),
  secundario: [
    'bg-purpura-oscuro text-magenta-vibrante border border-borde-magenta',
    'hover:bg-magenta-tenue hover:border-magenta-vibrante',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta-vibrante focus-visible:ring-offset-2 focus-visible:ring-offset-purpura-profundo',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purpura-oscuro',
  ].join(' '),
};

export function Boton({
  children,
  variante = 'primario',
  tipo = 'button',
  deshabilitado = false,
  className = '',
  ...props
}) {
  return (
    <button
      type={tipo}
      disabled={deshabilitado}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3',
        'font-cuerpo text-sm font-semibold tracking-wide',
        'transition-all duration-200 cursor-pointer',
        variantes[variante] ?? variantes.primario,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
