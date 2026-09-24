import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usuariosAPI, productosAPI, ordenesAPI, ventasAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { uploadAPI } from '../../services/api';
import { VentasBarChart, VentasLineChart, TopProductosChart, ResumenCards } from '../../components/dashboard/VentasCharts';
import {
  LIMITS,
  filterAlpha,
  filterMax,
  filterPhone,
  validateApellido,
  validateCorreo,
  validateDescripcionProducto,
  validateDireccion,
  validateName,
  validatePrecio,
  validateProductoNombre,
  validateStock,
  validateTelefono
} from '../../utils/validators';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000'; // base para uploads

const productValidators = {
  nombre: validateProductoNombre,
  descripcion: validateDescripcionProducto,
  precio: validatePrecio,
  stock: validateStock,
  plataforma: (value) => {
    const v = String(value || '').trim();
    if (!v) return 'La plataforma es obligatoria.';
    if (v.length > LIMITS.plataforma.max) return `La plataforma no puede superar ${LIMITS.plataforma.max} caracteres.`;
    return '';
  }
};

const userValidators = {
  nombre: validateName,
  apellido: validateApellido,
  correo: validateCorreo,
  telefono: validateTelefono,
  direccion: validateDireccion
};

const tabs = [
  { id: 'resumen',   label: 'Resumen' },
  { id: 'usuarios',  label: 'Usuarios' },
  { id: 'productos', label: 'Productos' },
  { id: 'ventas',    label: 'Ventas' },
  { id: 'facturas',  label: 'Facturas' },
  { id: 'reportes',  label: 'Reportes' }
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('resumen');
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [stats, setStats] = useState(null);
  const [facturas, setFacturas] = useState([]);
  const [facturasStats, setFacturasStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [facturaFilters, setFacturaFilters] = useState({
    numero_factura: '',
    cliente_correo: '',
    fecha_desde: '',
    fecha_hasta: ''
  });
  const [reporteData, setReporteData] = useState(null);
  const [reporteFechas, setReporteFechas] = useState({ fecha_inicio: '', fecha_fin: '' });

  // Estado para modales de edición de productos
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', plataforma: 'PlayStation', imagen_url: '' });
  const [productErrors, setProductErrors] = useState({});
  const [showProductModal, setShowProductModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);

  // Estado para modales de edición de usuarios
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ nombre: '', apellido: '', correo: '', telefono: '', direccion: '', rol_id: 3, estado: 'activo' });
  const [userErrors, setUserErrors] = useState({});
  const [showUserModal, setShowUserModal] = useState(false);
  const [savingUser, setSavingUser] = useState(false);

  // Estados de carga para acciones puntuales
  const [busyUserId, setBusyUserId] = useState(null);
  const [busyProductId, setBusyProductId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [facturaBusy, setFacturaBusy] = useState(false);
  const [downloadingFactura, setDownloadingFactura] = useState(null);
  const [reporteBusy, setReporteBusy] = useState(false);
  const [exporting, setExporting] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, productsData, ordersData, statsData] = await Promise.all([
        usuariosAPI.getAll(),
        productosAPI.getAll(),
        ordenesAPI.getAll(),
        ordenesAPI.getStats()
      ]);
      setUsuarios(usersData.items || []);
      setProductos(productsData.items || []);
      setOrdenes(ordersData.items || []);
      setStats(statsData.stats || null);

      // Cargar datos de ventas de forma independiente (no bloquea el resto)
      ventasAPI.getAll().then(d => setFacturas(d.items || [])).catch(() => {});
      ventasAPI.getStats().then(d => setFacturasStats(d.stats || null)).catch(() => {});
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

  // --- Usuarios ---
  const handleToggleUserStatus = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
    setBusyUserId(id);
    try {
      await usuariosAPI.changeStatus(id, nuevoEstado);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setBusyUserId(null);
    }
  };

  const handleDeleteUser = async (id) => {
    if (confirm('¿Eliminar este usuario definitivamente? Esta acción no se puede deshacer.')) {
      setBusyUserId(id);
      try {
        await usuariosAPI.remove(id);
        loadData();
      } catch (err) {
        console.error(err);
      } finally {
        setBusyUserId(null);
      }
    }
  };

  const openUserModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        telefono: user.telefono,
        direccion: user.direccion,
        rol_id: user.rol_id,
        estado: user.estado
      });
      setUserErrors({});
      setShowUserModal(true);
    }
  };

  const handleUserField = (name, filter) => (e) => {
    const value = filter ? filter(e.target.value) : e.target.value;
    e.target.value = value;
    setUserForm((prev) => ({ ...prev, [name]: value }));
    setUserErrors((prev) => ({ ...prev, [name]: userValidators[name]?.(value) || '' }));
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    Object.entries(userValidators).forEach(([key, validate]) => {
      const msg = validate(userForm[key]);
      if (msg) nextErrors[key] = msg;
    });
    setUserErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSavingUser(true);
    try {
      if (editingUser) {
        await usuariosAPI.update(editingUser.id, userForm);
      }
      setShowUserModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert(err?.error?.message || 'Error al guardar el usuario');
    } finally {
      setSavingUser(false);
    }
  };

  // --- Productos ---
  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        nombre: product.nombre,
        descripcion: product.descripcion || '',
        precio: String(product.precio),
        stock: String(product.stock),
        plataforma: product.plataforma || 'PlayStation',
        imagen_url: product.imagen_url || ''
      });
    } else {
      setEditingProduct(null);
      setProductForm({ nombre: '', descripcion: '', precio: '', stock: '', plataforma: 'PlayStation', imagen_url: '' });
    }
    setProductErrors({});
    setImageFile(null);
    setShowProductModal(true);
  };

  const handleProductField = (name, filter) => (e) => {
    const value = filter ? filter(e.target.value) : e.target.value;
    e.target.value = value;
    setProductForm((prev) => ({ ...prev, [name]: value }));
    setProductErrors((prev) => ({ ...prev, [name]: productValidators[name]?.(value) || '' }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    Object.entries(productValidators).forEach(([key, validate]) => {
      const msg = validate(productForm[key]);
      if (msg) nextErrors[key] = msg;
    });
    setProductErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSavingProduct(true);
    try {
      let finalImageUrl = productForm.imagen_url;
      let finalImagePublicId = editingProduct?.imagen_public_id || null;
      const previousPublicId = editingProduct?.imagen_public_id || null;

      // Subir imagen si se seleccionó un archivo nuevo
      if (imageFile) {
        const uploadRes = await uploadAPI.uploadImage(imageFile);
        finalImageUrl = uploadRes.url;
        finalImagePublicId = uploadRes.public_id;
      }

      const data = {
        ...productForm,
        imagen_url: finalImageUrl,
        imagen_public_id: finalImagePublicId,
        precio: parseFloat(productForm.precio),
        stock: parseInt(productForm.stock, 10) || 0
      };

      if (editingProduct) {
        await productosAPI.update(editingProduct.id, data);
        // Borrar la imagen anterior de Cloudinary solo si se reemplazó
        if (imageFile && previousPublicId && previousPublicId !== finalImagePublicId) {
          try { await uploadAPI.deleteImage(previousPublicId); } catch { /* best effort */ }
        }
      } else {
        await productosAPI.create(data);
      }
      setShowProductModal(false);
      setImageFile(null);
      loadData();
    } catch (err) {
      console.error(err);
      const msg =
        err?.error?.message ||
        err?.detail ||
        (typeof err?.error === 'string' ? err.error : null) ||
        err?.message ||
        'Error al guardar el producto';
      alert(msg);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    setBusyProductId(id);
    try {
      await productosAPI.changeStatus(id, 'inactivo');
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setBusyProductId(null);
    }
  };

  const handleDeleteProductPermanent = async (id) => {
    if (confirm('¿Eliminar este producto definitivamente? Esta acción no se puede deshacer.')) {
      setBusyProductId(id);
      try {
        await productosAPI.remove(id);
        loadData();
      } catch (err) {
        console.error(err);
      } finally {
        setBusyProductId(null);
      }
    }
  };

  // --- Órdenes ---
  const handleUpdateOrderStatus = async (id, estado) => {
    setUpdatingOrderId(id);
    try {
      await ordenesAPI.updateEstado(id, estado);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // --- Facturas ---
  const handleFacturaFilter = async () => {
    setFacturaBusy(true);
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
    } finally {
      setFacturaBusy(false);
    }
  };

  const handleClearFacturaFilters = async () => {
    setFacturaFilters({ numero_factura: '', cliente_correo: '', fecha_desde: '', fecha_hasta: '' });
    setFacturaBusy(true);
    try {
      const data = await ventasAPI.getAll();
      setFacturas(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setFacturaBusy(false);
    }
  };

  const handleDownloadFactura = async (numero) => {
    setDownloadingFactura(numero);
    try {
      await ventasAPI.downloadInvoicePdf(numero);
    } catch (err) {
      console.error(err);
      alert('No fue posible descargar la factura.');
    } finally {
      setDownloadingFactura(null);
    }
  };

  // --- Reportes ---
  const cargarReporte = async () => {
    setReporteBusy(true);
    try {
      const data = await ventasAPI.getReporteDetallado(reporteFechas.fecha_inicio, reporteFechas.fecha_fin);
      setReporteData(data.reporte || null);
    } catch (err) {
      console.error(err);
    } finally {
      setReporteBusy(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting('excel');
    try {
      await ventasAPI.downloadExcel(reporteFechas.fecha_inicio, reporteFechas.fecha_fin);
    } catch (err) {
      console.error(err);
      alert('Error al exportar Excel');
    } finally {
      setExporting(null);
    }
  };

  const handleExportPdf = async () => {
    setExporting('pdf');
    try {
      await ventasAPI.downloadPdf(reporteFechas.fecha_inicio, reporteFechas.fecha_fin);
    } catch (err) {
      console.error(err);
      alert('Error al exportar PDF');
    } finally {
      setExporting(null);
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

  const getProductImage = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `${API_URL}${url}`;
    if (url.startsWith('/')) return url;
    return `/img/${url}`;
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
          <p className="mt-1 text-sm text-[var(--color-muted)]">Administrador — Gestión completa del sistema</p>
        </div>

        {activeTab === 'resumen' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Usuarios', value: usuarios.length, color: 'text-blue-400' },
                { label: 'Productos', value: productos.length, color: 'text-purple-400' },
                { label: 'Órdenes', value: ordenes.length, color: 'text-amber-400' },
                { label: 'Ingresos', value: stats ? formatPrice(stats.ingresos_totales) : '$0', color: 'text-emerald-400' },
                { label: 'Facturas', value: facturasStats?.num_facturas || 0, color: 'text-cyan-400' },
                { label: 'Facturado', value: facturasStats ? formatPrice(facturasStats.total_facturado) : '$0', color: 'text-emerald-400' },
                { label: 'Impuestos', value: facturasStats ? formatPrice(facturasStats.total_impuestos) : '$0', color: 'text-rose-400' },
                { label: 'Descuentos', value: facturasStats ? formatPrice(facturasStats.total_descuentos) : '$0', color: 'text-orange-400' }
              ].map((card) => (
                <div key={card.label} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
                  <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">{card.label}</p>
                  <p className={`mt-2 font-display text-2xl ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>

            {stats?.ventas_recientes?.length > 0 && (
              <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--color-text)]">Ventas Recientes</h3>
                <div className="space-y-3">
                  {stats.ventas_recientes.slice(0, 5).map((v) => (
                    <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--color-bg)] px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-[var(--color-text)]">{v.nombre} {v.apellido}</p>
                        <p className="text-xs text-[var(--color-muted)]">{formatDate(v.created_at)}</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[v.estado]}`}>
                          {v.estado}
                        </span>
                        <span className="text-sm font-semibold text-[var(--color-accent)]">{formatPrice(v.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'usuarios' && (
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-widest text-[var(--color-muted)]">
                    <th className="px-5 py-4">Nombre</th>
                    <th className="px-5 py-4">Correo</th>
                    <th className="px-5 py-4">Rol</th>
                    <th className="px-5 py-4">Estado</th>
                    <th className="px-5 py-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id} className="border-b border-[var(--color-line)] last:border-0">
                      <td className="px-5 py-4 text-[var(--color-text)]">{u.nombre} {u.apellido}</td>
                      <td className="px-5 py-4 text-[var(--color-muted)]">{u.correo}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-[var(--color-accent)]/15 px-3 py-1 text-xs font-medium text-[var(--color-accent)]">
                          {u.rol_nombre}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[u.estado]}`}>
                          {u.estado}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openUserModal(u)}
                            className="text-xs text-[var(--color-accent)] transition hover:text-[var(--color-accent-soft)]"
                          >
                            Editar
                          </button>
                          {u.id !== user?.id && (
                            <>
                              <button
                                disabled={busyUserId === u.id}
                                onClick={() => handleToggleUserStatus(u.id, u.estado)}
                                className={`text-xs transition disabled:opacity-50 ${u.estado === 'activo' ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                              >
                                {busyUserId === u.id ? '...' : u.estado === 'activo' ? 'Desactivar' : 'Activar'}
                              </button>
                              <button
                                disabled={busyUserId === u.id}
                                onClick={() => handleDeleteUser(u.id)}
                                className="text-xs text-red-400 transition hover:text-red-300 disabled:opacity-50"
                              >
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'productos' && (
          <div>
            <div className="mb-4 flex justify-end">
              <Button onClick={() => openProductModal()}>+ Nuevo Producto</Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {productos.map((p) => (
                <div key={p.id} className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]">
                  <div className="h-48 w-full overflow-hidden bg-[var(--color-bg)]">
                    <img src={getProductImage(p.imagen_url)} alt={p.nombre} className="h-full w-full object-cover opacity-80 transition hover:opacity-100" />
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-[var(--color-text)]">{p.nombre}</h4>
                        <p className="text-xs text-[var(--color-muted)]">{p.plataforma} — {p.categoria_nombre || 'Sin categoría'}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[p.estado]}`}>
                        {p.estado}
                      </span>
                    </div>
                    <p className="mb-3 text-xs text-[var(--color-muted)] line-clamp-2">{p.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <p className="font-display text-lg text-[var(--color-accent)]">{formatPrice(p.precio)}</p>
                      <p className="text-xs text-[var(--color-muted)]">Stock: {p.stock}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="secondary" className="flex-1 !py-2 !text-xs" onClick={() => openProductModal(p)}>
                        Editar
                      </Button>
                      <button
                        disabled={busyProductId === p.id}
                        onClick={() => handleDeleteProduct(p.id)}
                        className={`rounded-lg border px-3 py-2 text-xs transition disabled:opacity-50 ${
                          p.estado === 'activo'
                            ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                            : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        {busyProductId === p.id ? '...' : p.estado === 'activo' ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        disabled={busyProductId === p.id}
                        onClick={() => handleDeleteProductPermanent(p.id)}
                        className="rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                        No hay órdenes registradas aún.
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
            {/* Filtros de facturación */}
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

            {/* Tabla de facturas */}
            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-widest text-[var(--color-muted)]">
                      <th className="px-5 py-4">N° Factura</th>
                      <th className="px-5 py-4">Cliente</th>
                      <th className="px-5 py-4">Subtotal</th>
                      <th className="px-5 py-4">Impuestos</th>
                      <th className="px-5 py-4">Descuento</th>
                      <th className="px-5 py-4">Total</th>
                      <th className="px-5 py-4">Estado</th>
                      <th className="px-5 py-4">Fecha</th>
                      <th className="px-5 py-4">PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturas.map((f) => (
                      <tr key={f.id} className="border-b border-[var(--color-line)] last:border-0">
                        <td className="px-5 py-4 font-mono text-xs font-medium text-[var(--color-accent)]">{f.numero_factura}</td>
                        <td className="px-5 py-4 text-[var(--color-text)]">{f.usuario_nombre} {f.usuario_apellido}</td>
                        <td className="px-5 py-4 text-[var(--color-muted)]">{formatPrice(f.subtotal)}</td>
                        <td className="px-5 py-4 text-rose-400">{formatPrice(f.impuesto_valor)}</td>
                        <td className="px-5 py-4 text-orange-400">{formatPrice(f.descuento_valor)}</td>
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
                            loading={downloadingFactura === f.numero_factura}
                            loadingText="..."
                            onClick={() => handleDownloadFactura(f.numero_factura)}
                          >
                            Descargar
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {facturas.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-5 py-10 text-center text-sm text-[var(--color-muted)]">
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

        {activeTab === 'reportes' && (
          <div className="space-y-6">
            {/* Filtros de fecha para reportes */}
            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[160px] flex-1 sm:min-w-[200px]">
                  <Input
                    label="Fecha Inicio"
                    type="date"
                    value={reporteFechas.fecha_inicio}
                    onChange={(e) => setReporteFechas(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                  />
                </div>
                <div className="min-w-[160px] flex-1 sm:min-w-[200px]">
                  <Input
                    label="Fecha Fin"
                    type="date"
                    value={reporteFechas.fecha_fin}
                    onChange={(e) => setReporteFechas(prev => ({ ...prev, fecha_fin: e.target.value }))}
                  />
                </div>
                <Button onClick={cargarReporte} loading={reporteBusy} loadingText="Generando...">Generar Reporte</Button>
                <Button variant="secondary" onClick={handleExportExcel} loading={exporting === 'excel'} loadingText="Exportando...">Exportar Excel</Button>
                <Button variant="secondary" onClick={handleExportPdf} loading={exporting === 'pdf'} loadingText="Exportando...">Exportar PDF</Button>
                <Button variant="secondary" onClick={() => { setReporteFechas({ fecha_inicio: '', fecha_fin: '' }); setReporteData(null); }}>Limpiar</Button>
              </div>
            </div>

            {/* Resumen del reporte */}
            {reporteData && (
              <>
                <ResumenCards stats={reporteData.resumen} />

                <div className="grid gap-6 lg:grid-cols-2">
                  <VentasBarChart data={reporteData.ventas_por_dia} title="Ventas por día" />
                  <VentasLineChart data={reporteData.ventas_por_dia} title="Tendencia de ventas" />
                </div>

                <TopProductosChart data={reporteData.top_productos} title="Top 10 Productos Más Vendidos" />
              </>
            )}

            {!reporteData && (
              <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 text-center sm:p-10">
                <p className="text-sm text-[var(--color-muted)]">Selecciona un rango de fechas y haz clic en "Generar Reporte" para ver los gráficos.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {showProductModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[color:rgba(9,10,15,.72)] px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] p-4 shadow-[0_20px_60px_rgba(0,0,0,.45)] sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-xl text-[var(--color-text)]">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <Button variant="ghost" disabled={savingProduct} onClick={() => setShowProductModal(false)}>Cerrar</Button>
            </div>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <Input
                label="Nombre"
                value={productForm.nombre}
                onChange={handleProductField('nombre', filterMax(LIMITS.productoNombre.max))}
                maxLength={LIMITS.productoNombre.max}
                error={productErrors.nombre}
              />
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">Descripción</span>
                <textarea
                  className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                  rows={3}
                  value={productForm.descripcion}
                  onChange={handleProductField('descripcion', filterMax(LIMITS.descripcionProducto.max))}
                  maxLength={LIMITS.descripcionProducto.max}
                />
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {productForm.descripcion.length}/{LIMITS.descripcionProducto.max}
                </p>
                {productErrors.descripcion ? (
                  <p className="mt-1 text-xs text-red-400">{productErrors.descripcion}</p>
                ) : null}
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Precio"
                  type="number"
                  value={productForm.precio}
                  onChange={handleProductField('precio')}
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  error={productErrors.precio}
                />
                <Input
                  label="Stock"
                  type="number"
                  value={productForm.stock}
                  onChange={handleProductField('stock')}
                  min={0}
                  step={1}
                  inputMode="numeric"
                  error={productErrors.stock}
                />
              </div>
              <Input
                label="Plataforma"
                value={productForm.plataforma}
                onChange={handleProductField('plataforma', filterMax(LIMITS.plataforma.max))}
                maxLength={LIMITS.plataforma.max}
                error={productErrors.plataforma}
              />

              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">Imagen del producto</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-sm text-[var(--color-muted)] file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--color-line)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--color-text)] hover:file:bg-[var(--color-accent)] hover:file:text-[var(--color-bg)]"
                />
                <p className="mt-1 text-xs text-[var(--color-muted)]">JPG, PNG, WEBP o GIF — máx. 5 MB</p>
              </label>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button variant="secondary" type="button" disabled={savingProduct} onClick={() => setShowProductModal(false)}>Cancelar</Button>
                <Button type="submit" loading={savingProduct} loadingText={editingProduct ? 'Actualizando...' : 'Creando...'}>{editingProduct ? 'Actualizar' : 'Crear'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de Usuario */}
      {showUserModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[color:rgba(9,10,15,.72)] px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] p-4 shadow-[0_20px_60px_rgba(0,0,0,.45)] sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-xl text-[var(--color-text)]">
                Editar Usuario
              </h3>
              <Button variant="ghost" disabled={savingUser} onClick={() => setShowUserModal(false)}>Cerrar</Button>
            </div>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <Input
                label="Nombre"
                value={userForm.nombre}
                onChange={handleUserField('nombre', (v) => filterAlpha(v).slice(0, LIMITS.nombre.max))}
                maxLength={LIMITS.nombre.max}
                error={userErrors.nombre}
              />
              <Input
                label="Apellido"
                value={userForm.apellido}
                onChange={handleUserField('apellido', (v) => filterAlpha(v).slice(0, LIMITS.apellido.max))}
                maxLength={LIMITS.apellido.max}
                error={userErrors.apellido}
              />
              <Input
                label="Correo"
                type="email"
                value={userForm.correo}
                onChange={handleUserField('correo', filterMax(LIMITS.correo.max))}
                maxLength={LIMITS.correo.max}
                error={userErrors.correo}
              />
              <Input
                label="Teléfono"
                value={userForm.telefono}
                onChange={handleUserField('telefono', filterPhone)}
                maxLength={16}
                inputMode="tel"
                placeholder="+573001234567"
                error={userErrors.telefono}
              />
              <Input
                label="Dirección"
                value={userForm.direccion}
                onChange={handleUserField('direccion', filterMax(LIMITS.direccion.max))}
                maxLength={LIMITS.direccion.max}
                error={userErrors.direccion}
              />
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">Rol</span>
                  <select
                    value={userForm.rol_id}
                    onChange={(e) => setUserForm(prev => ({ ...prev, rol_id: parseInt(e.target.value) }))}
                    className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                  >
                    <option value={1}>Administrador</option>
                    <option value={2}>Empleado</option>
                    <option value={3}>Cliente</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">Estado</span>
                  <select
                    value={userForm.estado}
                    onChange={(e) => setUserForm(prev => ({ ...prev, estado: e.target.value }))}
                    className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </label>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button variant="secondary" type="button" disabled={savingUser} onClick={() => setShowUserModal(false)}>Cancelar</Button>
                <Button type="submit" loading={savingUser} loadingText="Guardando...">Guardar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
