import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function VentasBarChart({ data = [], title = "Ventas por día" }) {
  if (!data.length) {
    return (
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--color-text)]">{title}</h3>
        <p className="text-center text-sm text-[var(--color-muted)] py-10">No hay datos de ventas para mostrar</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--color-text)]">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
          <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-line)',
              borderRadius: '8px',
              color: 'var(--color-text)',
            }}
            formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
          />
          <Legend />
          <Bar dataKey="subtotal" name="Subtotal" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="impuestos" name="Impuestos" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="total" name="Total" fill="#C5A46D" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VentasLineChart({ data = [], title = "Tendencia de ventas" }) {
  if (!data.length) {
    return (
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--color-text)]">{title}</h3>
        <p className="text-center text-sm text-[var(--color-muted)] py-10">No hay datos de tendencia</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--color-text)]">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
          <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-line)',
              borderRadius: '8px',
              color: 'var(--color-text)',
            }}
            formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
          />
          <Legend />
          <Line type="monotone" dataKey="total" name="Total Neto" stroke="#C5A46D" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="num_ventas" name="# Ventas" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopProductosChart({ data = [], title = "Top Productos Más Vendidos" }) {
  if (!data.length) {
    return (
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--color-text)]">{title}</h3>
        <p className="text-center text-sm text-[var(--color-muted)] py-10">No hay datos de productos</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--color-text)]">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
          <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
          <YAxis dataKey="nombre" type="category" width={110} tick={{ fontSize: 10, fill: 'var(--color-muted)' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-line)',
              borderRadius: '8px',
              color: 'var(--color-text)',
            }}
          />
          <Bar dataKey="unidades" name="Unidades" fill="#C5A46D" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ResumenCards({ stats }) {
  if (!stats) return null;

  const cards = [
    { label: 'Subtotal', value: stats.subtotal, color: 'text-blue-400', prefix: '$' },
    { label: 'Impuestos', value: stats.impuestos, color: 'text-rose-400', prefix: '$' },
    { label: 'Descuentos', value: stats.descuentos, color: 'text-orange-400', prefix: '$' },
    { label: 'Total Neto', value: stats.total_neto, color: 'text-emerald-400', prefix: '$' },
  ];

  const formatValue = (v, prefix) => {
    if (prefix === '$') return `$${Number(v).toLocaleString()}`;
    return String(v);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
          <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">{c.label}</p>
          <p className={`mt-2 font-display text-2xl ${c.color}`}>{formatValue(c.value, c.prefix)}</p>
        </div>
      ))}
    </div>
  );
}
