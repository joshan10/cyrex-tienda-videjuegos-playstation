export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  loading = false,
  loadingText = 'Cargando...',
  ...props
}) {
  const variants = {
    primary:
      'bg-[var(--color-accent)] text-[var(--color-bg)] hover:bg-[var(--color-accent-soft)]',
    secondary:
      'bg-transparent text-[var(--color-text)] border border-[var(--color-line)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
    ghost:
      'bg-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]'
  };

  const isDisabled = loading || props.disabled;
  const spinnerBorder = variant === 'primary' ? 'border-[var(--color-bg)]' : 'border-[var(--color-accent)]';

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold tracking-wide transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <span
          className={`h-4 w-4 shrink-0 animate-spin rounded-full border-2 ${spinnerBorder} border-t-transparent`}
          aria-hidden="true"
        />
      )}
      {loading ? loadingText : children}
    </button>
  );
}
