import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, ordenesAPI, ventasAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  LIMITS,
  filterAlpha,
  filterMax,
  filterPhone,
  validateApellido,
  validateDireccion,
  validateName,
  validateTelefono
} from '../../utils/validators';

const tabs = [
  { id: 'perfil', label: 'Mi Perfil' },
  { id: 'ordenes', label: 'Mis Órdenes' }
];

const profileValidators = {
  nombre: validateName,
  apellido: validateApellido,
  direccion: validateDireccion,
  telefono: validateTelefono
};

export default function ClienteDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');
  const [ordenes, setOrdenes] = useState([]);
  const [facturasMap, setFacturasMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Estado para edición de perfil
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nombre: '',
    apellido: '',
    direccion: '',
    telefono: ''
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const ordersData = await ordenesAPI.getAll();
      const userOrdenes = (ordersData.items || []).filter(o => o.usuario_id === user.id);
      setOrdenes(userOrdenes);

      // Cargar facturas de forma independiente
      ventasAPI.getMine().then(d => {
        const map = {};
        (d.items || []).forEach(f => { map[f.orden_id] = f; });
        setFacturasMap(map);
      }).catch(() => {});
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
    setProfileErrors({});
    setEditingProfile(true);
  };

  const handleProfileField = (name, filter) => (e) => {
    let value = filter ? filter(e.target.value) : e.target.value;
    const max = e.target.maxLength;
    if (max > 0 && value.length > max) value = value.slice(0, max);
    e.target.value = value;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setProfileErrors((prev) => ({ ...prev, [name]: profileValidators[name]?.(value) || '' }));
  };

  const handleSaveProfile = async () => {
    const nextErrors = {};
    Object.entries(profileValidators).forEach(([key, validate]) => {
      const msg = validate(profileForm[key]);
      if (msg) nextErrors[key] = msg;
    });
    setProfileErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSavingProfile(true);
    try {
      await authAPI.updateProfile(profileForm);
      setEditingProfile(false);
      alert('Perfil actualizado exitosamente');
      window.location.reload();
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      alert(err?.error?.message || 'Error al actualizar el perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDownloadInvoice = async (orden) => {
    const factura = facturasMap[orden.id];

    if (!factura) {
      alert('Esta orden todavía no tiene una factura generada.');
      return;
    }

    setDownloadingId(orden.id);
    try {
      await ventasAPI.downloadInvoicePdf(factura.numero_factura);
    } catch (err) {
      console.error(err);
      alert('No fue posible descargar la factura.');
    } finally {
      setDownloadingId(null);
    }
  };

  const formatPrice = (p) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin fecha';

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
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">Mi Cuenta</p>
          <h1 className="font-display text-3xl text-[var(--color-text)] md:text-4xl">
            Hola, {user?.nombre}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Aquí puedes gestionar tus compras e información personal</p>
        </div>

        {activeTab === 'perfil' && (
          <div className="max-w-2xl rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl text-[var(--color-text)]">Datos Personales</h3>
              {!editingProfile && (
                <Button variant="secondary" disabled={savingProfile} onClick={handleEditProfile}>Editar</Button>
              )}
            </div>
            {editingProfile ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-4">
                <Input
                  label="Nombre"
                  value={profileForm.nombre}
                  onChange={handleProfileField('nombre', (v) => filterAlpha(v).slice(0, LIMITS.nombre.max))}
                  maxLength={LIMITS.nombre.max}
                  error={profileErrors.nombre}
                />
                <Input
                  label="Apellido"
                  value={profileForm.apellido}
                  onChange={handleProfileField('apellido', (v) => filterAlpha(v).slice(0, LIMITS.apellido.max))}
                  maxLength={LIMITS.apellido.max}
                  error={profileErrors.apellido}
                />
                <Input
                  label="Dirección"
                  value={profileForm.direccion}
                  onChange={handleProfileField('direccion', filterMax(LIMITS.direccion.max))}
                  maxLength={LIMITS.direccion.max}
                  error={profileErrors.direccion}
                />
                <Input
                  label="Teléfono"
                  value={profileForm.telefono}
                  onChange={handleProfileField('telefono', filterPhone)}
                  maxLength={16}
                  inputMode="tel"
                  placeholder="+573001234567"
                  error={profileErrors.telefono}
                />
                <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
                  <Button variant="secondary" type="button" disabled={savingProfile} onClick={() => setEditingProfile(false)}>Cancelar</Button>
                  <Button type="submit" loading={savingProfile} loadingText="Guardando...">Guardar</Button>
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
                    <th className="px-5 py-4">N° Factura</th>
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
                      <td className="px-5 py-4 font-mono text-xs text-[var(--color-accent)]">
                        {facturasMap[o.id]?.numero_factura || '—'}
                      </td>
                      <td className="px-5 py-4 text-[var(--color-muted)]">{formatDate(o.created_at)}</td>
                      <td className="px-5 py-4 font-semibold text-[var(--color-accent)]">{formatPrice(o.total)}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[o.estado]}`}>
                          {o.estado}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Button
                          variant="secondary"
                          className="!py-1 !px-3 !text-xs"
                          loading={downloadingId === o.id}
                          loadingText="Descargando..."
                          onClick={() => handleDownloadInvoice(o)}
                        >
                          Descargar Factura
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {ordenes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-sm text-[var(--color-muted)]">
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
