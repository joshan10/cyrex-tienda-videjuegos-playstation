export default function Input({
  label,
  error,
  id,
  className = '',
  ...props
}) {
  return (
    <label className={`block ${className}`} htmlFor={id}>
      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
        {label}
      </span>
      <input
        id={id}
        className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition-colors duration-200 placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]"
        {...props}
      />
      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </label>
  );
}
