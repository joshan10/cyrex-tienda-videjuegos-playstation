import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ordenesAPI, usuariosAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const tabs = [
  { id: 'perfil', label: 'Mi Perfil' },
  { id: 'ordenes', label: 'Mis Órdenes' }
];

export default function ClienteDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para edición de perfil
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nombre: '',
    apellido: '',
    direccion: '',
    telefono: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await ordenesAPI.getAll();
      // Filtrar órdenes solo del usuario actual
      const userOrdenes = (data.items || []).filter(o => o.usuario_id === user.id);
      setOrdenes(userOrdenes);
    } catch (err) {
      console.error('Error cargando órdenes:', err);
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleEditProfile = () => {
    setProfileForm({
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      direccion: user?.direccion || '',
      telefono: user?.telefono || ''
    });
    setEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      await usuariosAPI.update(user.id, profileForm);
      setEditingProfile(false);
      alert('Perfil actualizado exitosamente');
      window.location.reload();
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      alert('Error al actualizar el perfil');
    }
  };

  const handleDownloadInvoice = (orden) => {
    const invoiceContent = `
CYREX - FACTURA ELECTRÓNICA
================================
Factura #: ${orden.id}
Fecha: ${new Date(orden.created_at).toLocaleDateString('es-CO')}
Cliente: ${user?.nombre} ${user?.apellido}
Correo: ${user?.correo}
Dirección: ${user?.direccion || 'N/A'}
Teléfono: ${user?.telefono || 'N/A'}

DETALLE DE LA COMPRA
================================
${orden.detalles?.map(d => `- ${d.producto_nombre} x${d.cantidad}: $${d.precio_unitario * d.cantidad}`).join('\n')}

TOTAL: $${orden.total}
Estado: ${orden.estado}

Gracias por tu compra en Cyrex Store
    `.trim();

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factura_cyrex_${orden.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatPrice = (p) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p);
  const formatDate = (d) => new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

  const statusColors = {
    pendiente: 'bg-yellow-500/15 text-yellow-400',
    procesando: 'bg-blue-500/15 text-blue-400',
    completada: 'bg-emerald-500/15 text-emerald-400',
    cancelada: 'bg-red-500/15 text-red-400'
  };

  if (loading) {
    return (
      <DashboardLayout tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-line)] border-t-[var(--color-accent)]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">Mi Cuenta</p>
          <h1 className="font-display text-3xl text-[var(--color-text)] md:text-4xl">
            Hola, {user?.nombre}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Aquí puedes gestionar tus compras e información personal</p>
        </div>

        {activeTab === 'perfil' && (
          <div className="max-w-2xl rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl text-[var(--color-text)]">Datos Personales</h3>
              {!editingProfile && (
                <Button variant="secondary" onClick={handleEditProfile}>Editar</Button>
              )}
            </div>
            {editingProfile ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-4">
                <Input label="Nombre" value={profileForm.nombre} onChange={(e) => setProfileForm(prev => ({ ...prev, nombre: e.target.value }))} />
                <Input label="Apellido" value={profileForm.apellido} onChange={(e) => setProfileForm(prev => ({ ...prev, apellido: e.target.value }))} />
                <Input label="Dirección" value={profileForm.direccion} onChange={(e) => setProfileForm(prev => ({ ...prev, direccion: e.target.value }))} />
                <Input label="Teléfono" value={profileForm.telefono} onChange={(e) => setProfileForm(prev => ({ ...prev, telefono: e.target.value }))} />
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="secondary" type="button" onClick={() => setEditingProfile(false)}>Cancelar</Button>
                  <Button type="submit">Guardar</Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-1 border-b border-[var(--color-line)] pb-3">
                  <span className="text-xs uppercase tracking-widest text-[var(--color-muted)]">Nombre completo</span>
                  <span className="text-sm font-medium text-[var(--color-text)]">{user?.nombre} {user?.apellido}</span>
                </div>
                <div className="grid gap-1 border-b border-[var(--color-line)] pb-3">
                  <span className="text-xs uppercase tracking-widest text-[var(--color-muted)]">Correo electrónico</span>
                  <span className="text-sm font-medium text-[var(--color-text)]">{user?.correo}</span>
                </div>
                <div className="grid gap-1 border-b border-[var(--color-line)] pb-3">
                  <span className="text-xs uppercase tracking-widest text-[var(--color-muted)]">Dirección</span>
                  <span className="text-sm font-medium text-[var(--color-text)]">{user?.direccion || 'No especificada'}</span>
                </div>
                <div className="grid gap-1">
                  <span className="text-xs uppercase tracking-widest text-[var(--color-muted)]">Teléfono</span>
                  <span className="text-sm font-medium text-[var(--color-text)]">{user?.telefono || 'No especificado'}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ordenes' && (
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-widest text-[var(--color-muted)]">
                    <th className="px-5 py-4"># Orden</th>
                    <th className="px-5 py-4">Fecha</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Estado</th>
                    <th className="px-5 py-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenes.map((o) => (
                    <tr key={o.id} className="border-b border-[var(--color-line)] last:border-0">
                      <td className="px-5 py-4 font-medium text-[var(--color-text)]">#{o.id}</td>
                      <td className="px-5 py-4 text-[var(--color-muted)]">{formatDate(o.created_at)}</td>
                      <td className="px-5 py-4 font-semibold text-[var(--color-accent)]">{formatPrice(o.total)}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[o.estado]}`}>
                          {o.estado}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Button variant="secondary" className="!py-1 !px-3 !text-xs" onClick={() => handleDownloadInvoice(o)}>
                          Descargar Factura
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {ordenes.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-sm text-[var(--color-muted)]">
                        Aún no has realizado ninguna compra.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
