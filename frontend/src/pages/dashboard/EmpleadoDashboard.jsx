import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, productosAPI, ordenesAPI, ventasAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import { useAlert } from '../../components/ui/alertContext';
import {
  LIMITS,
  filterAlpha,
  filterMax,
  filterPhone,
  validateApellido,
  validateDireccion,
  validateName,
  validateStock,
  validateTelefono
} from '../../utils/validators';

const tabs = [
  { id: 'perfil', label: 'Mi Perfil' },
  { id: 'productos', label: 'Productos' },
  { id: 'ventas',    label: 'Órdenes' },
  { id: 'facturas',  label: 'Facturas' }
];

const profileValidators = {
  nombre: validateName,
  apellido: validateApellido,
  direccion: validateDireccion,
  telefono: validateTelefono
};

const PAGE_SIZE = 10;

export default function EmpleadoDashboard() {
  const { user, updateUser } = useAuth();
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState('productos');
  const [productos, setProductos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [ordenesMeta, setOrdenesMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [ordenesSearch, setOrdenesSearch] = useState('');
  const [ordenesLoading, setOrdenesLoading] = useState(false);
  const [facturas, setFacturas] = useState([]);
  const [facturasMeta, setFacturasMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [facturasLoading, setFacturasLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [facturaFilters, setFacturaFilters] = useState({
    numero_factura: '',
    cliente_correo: '',
    fecha_desde: '',
    fecha_hasta: ''
  });

  // Estado para el modal de edición de productos
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ stock: '', estado: 'activo' });
  const [showProductModal, setShowProductModal] = useState(false);

  // Estado para edición de perfil
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nombre: '',
    apellido: '',
    direccion: '',
    telefono: ''
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [productFormError, setProductFormError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [facturaBusy, setFacturaBusy] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const loadOrdenes = async (page = 1, search = ordenesSearch) => {
    setOrdenesLoading(true);
    try {
      const data = await ordenesAPI.getAll({ page, size: PAGE_SIZE, search });
      const items = data.items || [];
      if (items.length === 0 && page > 1) {
        await loadOrdenes(page - 1, search);
        return;
      }
      setOrdenes(items);
      setOrdenesMeta({ page: data.page || page, pages: data.pages || 0, total: data.total || 0 });
    } catch (err) {
      console.error('Error cargando órdenes:', err);
    } finally {
      setOrdenesLoading(false);
    }
  };

  const buildFacturaFilters = () => {
    const filters = {};
    if (facturaFilters.numero_factura) filters.numero_factura = facturaFilters.numero_factura;
    if (facturaFilters.cliente_correo) filters.cliente_correo = facturaFilters.cliente_correo;
    if (facturaFilters.fecha_desde) filters.fecha_desde = facturaFilters.fecha_desde;
    if (facturaFilters.fecha_hasta) filters.fecha_hasta = facturaFilters.fecha_hasta;
    return filters;
  };

  const loadFacturas = async (page = 1, filters = buildFacturaFilters()) => {
    setFacturasLoading(true);
    try {
      const data = await ventasAPI.getAll({ ...filters, page, size: PAGE_SIZE });
      const items = data.items || [];
      if (items.length === 0 && page > 1) {
        await loadFacturas(page - 1, filters);
        return;
      }
      setFacturas(items);
      setFacturasMeta({ page: data.page || page, pages: data.pages || 0, total: data.total || 0 });
    } finally {
      setFacturasLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const productsData = await productosAPI.getAll();
      setProductos(productsData.items || []);

      // Cargar facturas de forma independiente
      loadFacturas(1).catch(() => {});
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    loadData();
    loadOrdenes(1, '');
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const firstOrdenSearch = useRef(true);
  useEffect(() => {
    if (firstOrdenSearch.current) {
      firstOrdenSearch.current = false;
      return undefined;
    }
    const timer = setTimeout(() => loadOrdenes(1, ordenesSearch), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordenesSearch]);

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
      const data = await authAPI.updateProfile(profileForm);
      setEditingProfile(false);
      updateUser(data?.user);
      showAlert({
        type: 'success',
        title: 'Perfil actualizado',
        message: 'Tu información personal se guardó con éxito.'
      });
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      showAlert({
        type: 'error',
        title: 'No se pudo actualizar',
        message: err?.error?.message || 'Error al actualizar el perfil'
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const openProductModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      stock: String(product.stock),
      estado: product.estado
    });
    setProductFormError('');
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const stockError = validateStock(productForm.stock);
    if (stockError) {
      setProductFormError(stockError);
      return;
    }
    setProductFormError('');
    setSavingProduct(true);
    try {
      const data = {
        stock: parseInt(productForm.stock, 10) || 0,
        estado: productForm.estado
      };
      await productosAPI.update(editingProduct.id, data);
      setShowProductModal(false);
      loadData();
      showAlert({
        type: 'success',
        title: 'Inventario actualizado',
        message: `El producto "${editingProduct.nombre}" se actualizó con éxito.`
      });
    } catch (err) {
      console.error(err);
      showAlert({
        type: 'error',
        title: 'No se pudo actualizar',
        message: err?.error?.message || 'Error al actualizar el inventario'
      });
    } finally {
      setSavingProduct(false);
    }
  };

  const handleUpdateOrderStatus = async (id, estado) => {
    setUpdatingOrderId(id);
    try {
      await ordenesAPI.updateEstado(id, estado);
      await loadOrdenes(ordenesMeta.page, ordenesSearch);
      showAlert({
        type: 'success',
        title: 'Orden actualizada',
        message: `La orden #${id} ahora está "${estado}".`
      });
    } catch (err) {
      console.error(err);
      showAlert({
        type: 'error',
        title: 'No se pudo actualizar',
        message: err?.error?.message || 'Error al actualizar el estado de la orden'
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // --- Facturas ---
  const handleFacturaPage = async (page) => {
    try {
      await loadFacturas(page);
    } catch (err) {
      console.error(err);
      showAlert({ type: 'error', title: 'Error al cargar', message: err?.error?.message || 'No se pudieron cargar las facturas.' });
    }
  };

  const handleFacturaFilter = async () => {
    setFacturaBusy(true);
    try {
      await loadFacturas(1, buildFacturaFilters());
    } catch (err) {
      console.error(err);
      showAlert({ type: 'error', title: 'Error al buscar', message: err?.error?.message || 'No se pudieron cargar las facturas.' });
    } finally {
      setFacturaBusy(false);
    }
  };

  const handleClearFacturaFilters = async () => {
    setFacturaFilters({ numero_factura: '', cliente_correo: '', fecha_desde: '', fecha_hasta: '' });
    setFacturaBusy(true);
    try {
      await loadFacturas(1, {});
    } catch (err) {
      console.error(err);
      showAlert({ type: 'error', title: 'Error al cargar', message: err?.error?.message || 'No se pudieron cargar las facturas.' });
    } finally {
      setFacturaBusy(false);
    }
  };

  const handleDownloadInvoice = async (numero) => {
    setDownloadingId(numero);
    try {
      await ventasAPI.downloadInvoicePdf(numero);
    } catch (err) {
      console.error(err);
      showAlert({
        type: 'error',
        title: 'Descarga fallida',
        message: 'No fue posible descargar la factura.'
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const formatPrice = (p) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin fecha';

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
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">Panel de Control</p>
          <h1 className="font-display text-3xl text-[var(--color-text)] md:text-4xl">
            Bienvenido, {user?.nombre}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Empleado — Gestión de órdenes y visualización de inventario</p>
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
                  <div className="mt-4">
                    <Button variant="secondary" className="w-full !py-2 !text-xs" onClick={() => openProductModal(p)}>
                      Editar Inventario
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ventas' && (
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div className="flex flex-col gap-3 border-b border-[var(--color-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-text)]">Órdenes</h3>
                <p className="text-xs text-[var(--color-muted)]">
                  {ordenesMeta.total} {ordenesMeta.total === 1 ? 'orden registrada' : 'órdenes registradas'}
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
                <input
                  type="search"
                  value={ordenesSearch}
                  onChange={(e) => setOrdenesSearch(e.target.value)}
                  placeholder="Buscar por cliente..."
                  aria-label="Buscar órdenes por cliente"
                  className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] py-2.5 pl-9 pr-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]"
                />
              </div>
            </div>
            <div className={`overflow-x-auto transition-opacity duration-200 ${ordenesLoading ? 'opacity-60' : ''}`}>
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
                          disabled={updatingOrderId === o.id}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-2 py-1 text-xs text-[var(--color-text)] outline-none disabled:opacity-60"
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
                        {ordenesSearch
                          ? `No se encontraron órdenes del cliente "${ordenesSearch}".`
                          : 'No hay órdenes registradas.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              page={ordenesMeta.page}
              pages={ordenesMeta.pages}
              total={ordenesMeta.total}
              size={PAGE_SIZE}
              disabled={ordenesLoading}
              onChange={(p) => loadOrdenes(p, ordenesSearch)}
            />
          </div>
        )}

        {activeTab === 'facturas' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--color-text)]">Buscar Facturas</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Input
                  label="N° Factura"
                  placeholder="CYR-2026-"
                  value={facturaFilters.numero_factura}
                  onChange={(e) => setFacturaFilters(prev => ({ ...prev, numero_factura: filterMax(LIMITS.numeroFactura.max)(e.target.value) }))}
                  maxLength={LIMITS.numeroFactura.max}
                />
                <Input
                  label="Correo Cliente"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={facturaFilters.cliente_correo}
                  onChange={(e) => setFacturaFilters(prev => ({ ...prev, cliente_correo: filterMax(LIMITS.correo.max)(e.target.value) }))}
                  maxLength={LIMITS.correo.max}
                />
                <Input
                  label="Fecha Desde"
                  type="date"
                  value={facturaFilters.fecha_desde}
                  onChange={(e) => setFacturaFilters(prev => ({ ...prev, fecha_desde: e.target.value }))}
                />
                <Input
                  label="Fecha Hasta"
                  type="date"
                  value={facturaFilters.fecha_hasta}
                  onChange={(e) => setFacturaFilters(prev => ({ ...prev, fecha_hasta: e.target.value }))}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={handleFacturaFilter} loading={facturaBusy} loadingText="Buscando...">Buscar</Button>
                <Button variant="secondary" onClick={handleClearFacturaFilters} loading={facturaBusy} loadingText="Limpiando...">Limpiar</Button>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--color-line)] px-5 py-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-text)]">Facturas</h3>
                  <p className="text-xs text-[var(--color-muted)]">
                    {facturasMeta.total} {facturasMeta.total === 1 ? 'factura encontrada' : 'facturas encontradas'}
                  </p>
                </div>
              </div>
              <div className={`overflow-x-auto transition-opacity duration-200 ${facturasLoading || facturaBusy ? 'opacity-60' : ''}`}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-widest text-[var(--color-muted)]">
                      <th className="px-5 py-4">N° Factura</th>
                      <th className="px-5 py-4">Cliente</th>
                      <th className="px-5 py-4">Subtotal</th>
                      <th className="px-5 py-4">Impuestos</th>
                      <th className="px-5 py-4">Total</th>
                      <th className="px-5 py-4">Estado</th>
                      <th className="px-5 py-4">PDF</th>
                      <th className="px-5 py-4">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturas.map((f) => (
                      <tr key={f.id} className="border-b border-[var(--color-line)] last:border-0">
                        <td className="px-5 py-4 font-mono text-xs font-medium text-[var(--color-accent)]">{f.numero_factura}</td>
                        <td className="px-5 py-4 text-[var(--color-text)]">{f.usuario_nombre} {f.usuario_apellido}</td>
                        <td className="px-5 py-4 text-[var(--color-muted)]">{formatPrice(f.subtotal)}</td>
                        <td className="px-5 py-4 text-rose-400">{formatPrice(f.impuesto_valor)}</td>
                        <td className="px-5 py-4 font-semibold text-emerald-400">{formatPrice(f.total_neto)}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${f.estado === 'activa' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                            {f.estado}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[var(--color-muted)]">{formatDate(f.fecha_venta)}</td>
                        <td className="px-5 py-4">
                          <Button
                            variant="secondary"
                            className="!px-3 !py-1 !text-xs"
                            loading={downloadingId === f.numero_factura}
                            loadingText="..."
                            onClick={() => handleDownloadInvoice(f.numero_factura)}
                          >
                            Descargar
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {facturas.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-5 py-10 text-center text-sm text-[var(--color-muted)]">
                          No se encontraron facturas con los filtros aplicados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={facturasMeta.page}
                pages={facturasMeta.pages}
                total={facturasMeta.total}
                size={PAGE_SIZE}
                disabled={facturasLoading || facturaBusy}
                onChange={handleFacturaPage}
              />
            </div>
          </div>
        )}
      </section>

      {/* Modal de Producto para Empleado */}
      {showProductModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[color:rgba(9,10,15,.72)] px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] p-4 shadow-[0_20px_60px_rgba(0,0,0,.45)] max-h-[90vh] overflow-y-auto sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-lg text-[var(--color-text)]">
                Editar Inventario
              </h3>
              <Button variant="ghost" disabled={savingProduct} onClick={() => setShowProductModal(false)}>Cerrar</Button>
            </div>
            <p className="mb-4 text-sm text-[var(--color-muted)]">Editando: <strong className="text-[var(--color-text)]">{editingProduct?.nombre}</strong></p>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <Input
                label="Stock Disponible"
                type="number"
                value={productForm.stock}
                onChange={(e) => {
                  setProductForm(prev => ({ ...prev, stock: e.target.value }));
                  setProductFormError('');
                }}
                min={0}
                step={1}
                inputMode="numeric"
                error={productFormError || undefined}
              />
              
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">Estado del Producto</span>
                <select
                  value={productForm.estado}
                  onChange={(e) => setProductForm(prev => ({ ...prev, estado: e.target.value }))}
                  className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </label>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
                <Button variant="secondary" type="button" disabled={savingProduct} onClick={() => setShowProductModal(false)}>Cancelar</Button>
                <Button type="submit" loading={savingProduct} loadingText="Actualizando...">Actualizar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
