function getPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (current >= total - 2) [total - 1, total - 2, total - 3].forEach((p) => pages.add(p));

  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result = [];
  let previous = 0;
  sorted.forEach((p) => {
    if (previous && p - previous > 1) result.push('...');
    result.push(p);
    previous = p;
  });
  return result;
}

export default function Pagination({ page = 1, pages = 1, total = 0, size = 10, onChange, disabled = false }) {
  if (!total || pages <= 1) return null;

  const from = (page - 1) * size + 1;
  const to = Math.min(page * size, total);
  const items = getPages(page, pages);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--color-line)] px-5 py-4 sm:flex-row">
      <p className="text-xs text-[var(--color-muted)]">
        Mostrando <span className="font-semibold text-[var(--color-text)]">{from}–{to}</span> de{' '}
        <span className="font-semibold text-[var(--color-text)]">{total}</span>
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={disabled || page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--color-line)] disabled:hover:text-[var(--color-text)]"
        >
          Anterior
        </button>

        {items.map((item, index) =>
          item === '...' ? (
            <span key={`gap-${index}`} className="px-1 text-xs text-[var(--color-muted)]">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              disabled={disabled}
              onClick={() => onChange(item)}
              className={`min-w-[32px] rounded-lg border px-2 py-1.5 text-xs font-medium transition disabled:opacity-40 ${
                item === page
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-bg)]'
                  : 'border-[var(--color-line)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          disabled={disabled || page >= pages}
          onClick={() => onChange(page + 1)}
          className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--color-line)] disabled:hover:text-[var(--color-text)]"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

export { Pagination };
