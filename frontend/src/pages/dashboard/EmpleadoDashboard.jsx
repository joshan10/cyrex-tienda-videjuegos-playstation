import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productosAPI, ordenesAPI } from '../../services/api';
import LayoutPrincipal from '../../components/layout/LayoutPrincipal';

const tabs = [
  { id: 'productos', label: 'Productos' },
  { id: 'ventas',    label: 'Órdenes' }
];

export default function EmpleadoDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('productos');
  const [productos, setProductos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, ordersData] = await Promise.all([
        productosAPI.getAll(),
        ordenesAPI.getAll()
      ]);
      setProductos(productsData.productos || []);
      setOrdenes(ordersData.ordenes || []);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (id, estado) => {
    try {
      await ordenesAPI.updateEstado(id, estado);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const formatPrice = (p) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p);
  const formatDate = (d) => new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

  const statusColors = {
    activo: 'bg-emerald-500/15 text-emerald-400',
    inactivo: 'bg-red-500/15 text-red-400',
    pendiente: 'bg-yellow-500/15 text-yellow-400',
    procesando: 'bg-blue-500/15 text-blue-400',
    completada: 'bg-emerald-500/15 text-emerald-400',
    cancelada: 'bg-red-500/15 text-red-400'
  };

  if (loading) {
    return (
      <LayoutPrincipal>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-line)] border-t-[var(--color-accent)]" />
        </div>
      </LayoutPrincipal>
    );
  }

  return (
    <LayoutPrincipal>
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">Panel de Control</p>
          <h1 className="font-display text-3xl text-[var(--color-text)] md:text-4xl">
            Bienvenido, {user?.nombre}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Empleado — Gestión de órdenes y visualización de inventario</p>
        </div>

        <div className="mb-8 flex flex-wrap gap-2 border-b border-[var(--color-line)] pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                  : 'text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'productos' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {productos.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]">
                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-[var(--color-text)]">{p.nombre}</h4>
                      <p className="text-xs text-[var(--color-muted)]">{p.plataforma}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[p.estado]}`}>
                      {p.estado}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4 border-t border-[var(--color-line)] pt-3">
                    <p className="font-display text-lg text-[var(--color-accent)]">{formatPrice(p.precio)}</p>
                    <p className="text-sm text-[var(--color-text)]">Stock: <span className="font-semibold">{p.stock}</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ventas' && (
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-widest text-[var(--color-muted)]">
                    <th className="px-5 py-4">#</th>
                    <th className="px-5 py-4">Cliente</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Estado</th>
                    <th className="px-5 py-4">Fecha</th>
                    <th className="px-5 py-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenes.map((o) => (
                    <tr key={o.id} className="border-b border-[var(--color-line)] last:border-0">
                      <td className="px-5 py-4 text-[var(--color-muted)]">#{o.id}</td>
                      <td className="px-5 py-4 text-[var(--color-text)]">{o.usuario_nombre} {o.usuario_apellido}</td>
                      <td className="px-5 py-4 font-semibold text-[var(--color-accent)]">{formatPrice(o.total)}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[o.estado]}`}>
                          {o.estado}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[var(--color-muted)]">{formatDate(o.created_at)}</td>
                      <td className="px-5 py-4">
                        <select
                          value={o.estado}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-2 py-1 text-xs text-[var(--color-text)] outline-none"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="procesando">Procesando</option>
                          <option value="completada">Completada</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {ordenes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-sm text-[var(--color-muted)]">
                        No hay órdenes registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </LayoutPrincipal>
  );
}
