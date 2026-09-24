import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, productosAPI, ordenesAPI, ventasAPI } from '../../services/api';
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

export default function EmpleadoDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('productos');
  const [productos, setProductos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [facturas, setFacturas] = useState([]);
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

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, ordersData] = await Promise.all([
        productosAPI.getAll(),
        ordenesAPI.getAll()
      ]);
      setProductos(productsData.items || []);
      setOrdenes(ordersData.items || []);

      // Cargar facturas de forma independiente
      ventasAPI.getAll().then(d => setFacturas(d.items || [])).catch(() => {});
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadData();
  }, []);
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
    const value = filter ? filter(e.target.value) : e.target.value;
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

    try {
      await authAPI.updateProfile(profileForm);
      setEditingProfile(false);
      alert('Perfil actualizado exitosamente');
      window.location.reload();
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      alert(err?.error?.message || 'Error al actualizar el perfil');
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
    try {
      const data = {
        stock: parseInt(productForm.stock, 10) || 0,
        estado: productForm.estado
      };
      await productosAPI.update(editingProduct.id, data);
      setShowProductModal(false);
      loadData();
    } catch (err) {
      console.error(err);
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

  // --- Facturas ---
  const handleFacturaFilter = async () => {
    try {
      const filters = {};
      if (facturaFilters.numero_factura) filters.numero_factura = facturaFilters.numero_factura;
      if (facturaFilters.cliente_correo) filters.cliente_correo = facturaFilters.cliente_correo;
      if (facturaFilters.fecha_desde) filters.fecha_desde = facturaFilters.fecha_desde;
      if (facturaFilters.fecha_hasta) filters.fecha_hasta = facturaFilters.fecha_hasta;
      const data = await ventasAPI.getAll(filters);
      setFacturas(data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearFacturaFilters = async () => {
    setFacturaFilters({ numero_factura: '', cliente_correo: '', fecha_desde: '', fecha_hasta: '' });
    try {
      const data = await ventasAPI.getAll();
      setFacturas(data.items || []);
    } catch (err) {
      console.error(err);
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
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">Panel de Control</p>
          <h1 className="font-display text-3xl text-[var(--color-text)] md:text-4xl">
            Bienvenido, {user?.nombre}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Empleado — Gestión de órdenes y visualización de inventario</p>
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
              <div className="mt-3 flex gap-2">
                <Button onClick={handleFacturaFilter}>Buscar</Button>
                <Button variant="secondary" onClick={handleClearFacturaFilters}>Limpiar</Button>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]">
              <div className="overflow-x-auto">
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
                        <td className="px-5 py-4"><Button variant="secondary" className="!px-3 !py-1 !text-xs" onClick={() => ventasAPI.downloadInvoicePdf(f.numero_factura)}>Descargar</Button></td>
                      </tr>
                    ))}
                    {facturas.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-10 text-center text-sm text-[var(--color-muted)]">
                          No hay facturas registradas aún.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Modal de Producto para Empleado */}
      {showProductModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[color:rgba(9,10,15,.72)] px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] p-6 shadow-[0_20px_60px_rgba(0,0,0,.45)]">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-lg text-[var(--color-text)]">
                Editar Inventario
              </h3>
              <Button variant="ghost" onClick={() => setShowProductModal(false)}>Cerrar</Button>
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

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="secondary" type="button" onClick={() => setShowProductModal(false)}>Cancelar</Button>
                <Button type="submit">Actualizar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
