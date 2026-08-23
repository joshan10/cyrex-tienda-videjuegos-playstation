export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
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

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold tracking-wide transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
