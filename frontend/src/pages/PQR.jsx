import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { pqrAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import DashboardLayout from '../components/layout/DashboardLayout';

const tabs = [{ id: 'pqr', label: 'PQR' }];
const statusLabels = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  respondida: 'Respondida',
  cerrada: 'Cerrada'
};

export default function PQR() {
  const { user } = useAuth();
  const isStaff = ['Administrador', 'Empleado'].includes(user?.rol);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ tipo: 'peticion', asunto: '', descripcion: '' });

  const loadPqrs = async () => {
    try {
      setError('');
      setItems(await pqrAPI.getAll());
    } catch (err) {
      setError(err?.error?.message || 'No fue posible cargar las PQR.');
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { loadPqrs(); }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const createPqr = async (event) => {
    event.preventDefault();
    try {
      await pqrAPI.create(form);
      setForm({ tipo: 'peticion', asunto: '', descripcion: '' });
      await loadPqrs();
    } catch (err) {
      setError(err?.error?.message || 'No fue posible registrar la solicitud.');
    }
  };

  const updatePqr = async (item, estado) => {
    try {
      await pqrAPI.update(item.id, { estado });
      await loadPqrs();
    } catch (err) {
      setError(err?.error?.message || 'No fue posible actualizar la PQR.');
    }
  };

  return (
    <DashboardLayout tabs={tabs} activeTab="pqr" onTabChange={() => {}}>
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">Atención al cliente</p>
          <h1 className="font-display text-3xl text-[var(--color-text)]">Peticiones, quejas y reclamos</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Registra una solicitud y consulta su seguimiento desde un solo lugar.</p>
        </div>

        {error && <p className="mb-5 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}

        {!isStaff && (
          <form onSubmit={createPqr} className="mb-8 max-w-2xl space-y-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
            <h2 className="font-display text-xl text-[var(--color-text)]">Nueva solicitud</h2>
            <label className="grid gap-2 text-sm text-[var(--color-muted)]">
              Tipo
              <select className="rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)]" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                <option value="peticion">Petición</option>
                <option value="queja">Queja</option>
                <option value="reclamo">Reclamo</option>
              </select>
            </label>
            <Input label="Asunto" value={form.asunto} onChange={(e) => setForm({ ...form, asunto: e.target.value })} required />
            <label className="grid gap-2 text-sm text-[var(--color-muted)]">
              Descripción
              <textarea className="min-h-32 rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" minLength="10" maxLength="5000" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required />
            </label>
            <div className="flex justify-end"><Button type="submit">Registrar PQR</Button></div>
          </form>
        )}

        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]">
          <div className="border-b border-[var(--color-line)] px-5 py-4"><h2 className="font-display text-xl text-[var(--color-text)]">{isStaff ? 'Solicitudes recibidas' : 'Mis solicitudes'}</h2></div>
          {loading ? <div className="p-6 text-sm text-[var(--color-muted)]">Cargando solicitudes...</div> : items.length === 0 ? <div className="p-6 text-sm text-[var(--color-muted)]">Todavía no hay solicitudes registradas.</div> : (
            <div className="divide-y divide-[var(--color-line)]">
              {items.map((item) => (
                <article key={item.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
                  <div><div className="flex flex-wrap items-center gap-3"><h3 className="font-semibold text-[var(--color-text)]">{item.asunto}</h3><span className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs text-[var(--color-accent)]">{statusLabels[item.estado]}</span></div><p className="mt-1 text-xs uppercase tracking-widest text-[var(--color-muted)]">{item.tipo} · {new Date(item.fecha_creacion).toLocaleDateString('es-CO')}</p><p className="mt-3 text-sm text-[var(--color-muted)]">{item.descripcion}</p>{item.respuesta && <p className="mt-3 border-l-2 border-[var(--color-accent)] pl-3 text-sm text-[var(--color-text)]">{item.respuesta}</p>}</div>
                  {isStaff && <select aria-label={`Estado de PQR ${item.id}`} className="h-fit rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)]" value={item.estado} onChange={(e) => updatePqr(item, e.target.value)}><option value="pendiente">Pendiente</option><option value="en_proceso">En proceso</option><option value="respondida">Respondida</option><option value="cerrada">Cerrada</option></select>}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}