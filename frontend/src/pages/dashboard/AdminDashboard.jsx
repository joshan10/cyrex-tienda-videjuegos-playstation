import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usuariosAPI, productosAPI, ordenesAPI, ventasAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import { useAlert } from '../../components/ui/alertContext';
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

const PAGE_SIZE = 10;

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
  const { showAlert, showConfirm } = useAlert();
  const [activeTab, setActiveTab] = useState('resumen');
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosMeta, setUsuariosMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [usuariosSearch, setUsuariosSearch] = useState('');
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  const [productosMeta, setProductosMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [productosSearch, setProductosSearch] = useState('');
  const [productosLoading, setProductosLoading] = useState(false);
  const [ordenes, setOrdenes] = useState([]);
  const [ordenesMeta, setOrdenesMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [ordenesSearch, setOrdenesSearch] = useState('');
  const [ordenesLoading, setOrdenesLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [facturas, setFacturas] = useState([]);
  const [facturasMeta, setFacturasMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [facturasLoading, setFacturasLoading] = useState(false);
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

  const loadUsuarios = async (page = 1, search = usuariosSearch) => {
    setUsuariosLoading(true);
    try {
      const data = await usuariosAPI.getAll({ page, size: PAGE_SIZE, search });
      const items = data.items || [];
      // Si la página quedó vacía (ej. tras eliminar el último de la página), retrocede
      if (items.length === 0 && page > 1) {
        await loadUsuarios(page - 1, search);
        return;
      }
      setUsuarios(items);
      setUsuariosMeta({ page: data.page || page, pages: data.pages || 0, total: data.total || 0 });
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      setUsuariosLoading(false);
    }
  };

  const loadProductos = async (page = 1, search = productosSearch) => {
    setProductosLoading(true);
    try {
      const data = await productosAPI.getAll({ page, size: PAGE_SIZE, search });
      const items = data.items || [];
      if (items.length === 0 && page > 1) {
        await loadProductos(page - 1, search);
        return;
      }
      setProductos(items);
      setProductosMeta({ page: data.page || page, pages: data.pages || 0, total: data.total || 0 });
    } catch (err) {
      console.error('Error cargando productos:', err);
    } finally {
      setProductosLoading(false);
    }
  };

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
      const statsData = await ordenesAPI.getStats();
      setStats(statsData.stats || null);

      // Cargar datos de ventas de forma independiente (no bloquea el resto)
      loadFacturas(1).catch(() => {});
      ventasAPI.getStats().then(d => setFacturasStats(d.stats || null)).catch(() => {});
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    loadData();
    loadUsuarios(1, '');
    loadProductos(1, '');
    loadOrdenes(1, '');
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  // Búsqueda con debounce (siempre vuelve a la página 1)
  const firstUsuarioSearch = useRef(true);
  useEffect(() => {
    if (firstUsuarioSearch.current) {
      firstUsuarioSearch.current = false;
      return undefined;
    }
    const timer = setTimeout(() => loadUsuarios(1, usuariosSearch), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuariosSearch]);

  const firstProductoSearch = useRef(true);
  useEffect(() => {
    if (firstProductoSearch.current) {
      firstProductoSearch.current = false;
      return undefined;
    }
    const timer = setTimeout(() => loadProductos(1, productosSearch), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productosSearch]);

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

  // --- Usuarios ---
  const handleToggleUserStatus = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
    setBusyUserId(id);
    try {
      await usuariosAPI.changeStatus(id, nuevoEstado);
      await loadUsuarios(usuariosMeta.page, usuariosSearch);
      showAlert({
        type: 'success',
        title: nuevoEstado === 'activo' ? 'Usuario activado' : 'Usuario desactivado',
        message: `El estado del usuario se cambió a "${nuevoEstado}" con éxito.`
      });
    } catch (err) {
      console.error(err);
      showAlert({
        type: 'error',
        title: 'No se pudo cambiar el estado',
        message: err?.error?.message || 'Intenta de nuevo más tarde.'
      });
    } finally {
      setBusyUserId(null);
    }
  };

  const handleDeleteUser = async (id) => {
    const confirmed = await showConfirm({
      title: 'Eliminar usuario',
      message: '¿Eliminar este usuario definitivamente? Esta acción no se puede deshacer.',
      confirmText: 'Sí, eliminar'
    });
    if (!confirmed) return;

    setBusyUserId(id);
    try {
      await usuariosAPI.remove(id);
      await loadUsuarios(usuariosMeta.page, usuariosSearch);
      showAlert({
        type: 'success',
        title: 'Usuario eliminado',
        message: 'El usuario se eliminó definitivamente.'
      });
    } catch (err) {
      console.error(err);
      showAlert({
        type: 'error',
        title: 'No se pudo eliminar',
        message: err?.error?.message || 'Intenta de nuevo más tarde.'
      });
    } finally {
      setBusyUserId(null);
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
    let value = filter ? filter(e.target.value) : e.target.value;
    const max = e.target.maxLength;
    if (max > 0 && value.length > max) value = value.slice(0, max);
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
      await loadUsuarios(usuariosMeta.page, usuariosSearch);
      showAlert({
        type: 'success',
        title: 'Usuario actualizado',
        message: 'Los datos del usuario se guardaron con éxito.'
      });
    } catch (err) {
      console.error(err);
      showAlert({
        type: 'error',
        title: 'No se pudo guardar',
        message: err?.error?.message || 'Error al guardar el usuario'
      });
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
    let value = filter ? filter(e.target.value) : e.target.value;
    const max = e.target.maxLength;
    if (max > 0 && value.length > max) value = value.slice(0, max);
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
      await loadProductos(editingProduct ? productosMeta.page : 1, productosSearch);
      showAlert({
        type: 'success',
        title: editingProduct ? 'Producto actualizado' : 'Producto creado',
        message: editingProduct
          ? 'Los cambios se guardaron con éxito.'
          : 'El producto se agregó con éxito al catálogo.'
      });
    } catch (err) {
      console.error(err);
      const msg =
        err?.error?.message ||
        err?.detail ||
        (typeof err?.error === 'string' ? err.error : null) ||
        err?.message ||
        'Error al guardar el producto';
      showAlert({ type: 'error', title: 'No se pudo guardar', message: msg });
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    setBusyProductId(id);
    try {
      await productosAPI.changeStatus(id, 'inactivo');
      await loadProductos(productosMeta.page, productosSearch);
      showAlert({
        type: 'success',
        title: 'Producto desactivado',
        message: 'El producto ya no aparece disponible en la tienda.'
      });
    } catch (err) {
      console.error(err);
      showAlert({
        type: 'error',
        title: 'No se pudo desactivar',
        message: err?.error?.message || 'Intenta de nuevo más tarde.'
      });
    } finally {
      setBusyProductId(null);
    }
  };

  const handleDeleteProductPermanent = async (id) => {
    const confirmed = await showConfirm({
      title: 'Eliminar producto',
      message: '¿Eliminar este producto definitivamente? Esta acción no se puede deshacer.',
      confirmText: 'Sí, eliminar'
    });
    if (!confirmed) return;

    setBusyProductId(id);
    try {
      await productosAPI.remove(id);
      await loadProductos(productosMeta.page, productosSearch);
      showAlert({
        type: 'success',
        title: 'Producto eliminado',
        message: 'El producto se eliminó definitivamente.'
      });
    } catch (err) {
      console.error(err);
      showAlert({
        type: 'error',
        title: 'No se pudo eliminar',
        message: err?.error?.message || 'Intenta de nuevo más tarde.'
      });
    } finally {
      setBusyProductId(null);
    }
  };

  // --- Órdenes ---
  const handleUpdateOrderStatus = async (id, estado) => {
    setUpdatingOrderId(id);
    try {
      await ordenesAPI.updateEstado(id, estado);
      await loadOrdenes(ordenesMeta.page, ordenesSearch);
      ordenesAPI.getStats().then(d => setStats(d.stats || null)).catch(() => {});
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

  const handleDownloadFactura = async (numero) => {
    setDownloadingFactura(numero);
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
      showAlert({ type: 'error', title: 'Error al exportar', message: 'No se pudo generar el archivo Excel.' });
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
      showAlert({ type: 'error', title: 'Error al exportar', message: 'No se pudo generar el archivo PDF.' });
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
                { label: 'Usuarios', value: usuariosMeta.total, color: 'text-blue-400' },
                { label: 'Productos', value: productosMeta.total, color: 'text-purple-400' },
                { label: 'Órdenes', value: ordenesMeta.total, color: 'text-amber-400' },
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
            <div className="flex flex-col gap-3 border-b border-[var(--color-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-text)]">Usuarios</h3>
                <p className="text-xs text-[var(--color-muted)]">
                  {usuariosMeta.total} {usuariosMeta.total === 1 ? 'usuario registrado' : 'usuarios registrados'}
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
                  value={usuariosSearch}
                  onChange={(e) => setUsuariosSearch(e.target.value)}
                  placeholder="Buscar por nombre o correo..."
                  aria-label="Buscar usuarios"
                  className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] py-2.5 pl-9 pr-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]"
                />
              </div>
            </div>
            <div className={`overflow-x-auto transition-opacity duration-200 ${usuariosLoading ? 'opacity-60' : ''}`}>
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
                  {usuarios.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-sm text-[var(--color-muted)]">
                        {usuariosSearch
                          ? `No se encontraron usuarios que coincidan con "${usuariosSearch}".`
                          : 'No hay usuarios registrados aún.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              page={usuariosMeta.page}
              pages={usuariosMeta.pages}
              total={usuariosMeta.total}
              size={PAGE_SIZE}
              disabled={usuariosLoading}
              onChange={(p) => loadUsuarios(p, usuariosSearch)}
            />
          </div>
        )}

        {activeTab === 'productos' && (
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-xs">
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
                  value={productosSearch}
                  onChange={(e) => setProductosSearch(e.target.value)}
                  placeholder="Buscar producto por nombre..."
                  aria-label="Buscar productos"
                  className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] py-2.5 pl-9 pr-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]"
                />
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
                <p className="text-xs text-[var(--color-muted)]">
                  {productosMeta.total} {productosMeta.total === 1 ? 'producto' : 'productos'} en catálogo
                </p>
                <Button onClick={() => openProductModal()}>+ Nuevo Producto</Button>
              </div>
            </div>

            <div className={`grid gap-4 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3 ${productosLoading ? 'opacity-60' : ''}`}>
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
              {productos.length === 0 && (
                <div className="col-span-full rounded-xl border border-dashed border-[var(--color-line)] px-5 py-10 text-center text-sm text-[var(--color-muted)]">
                  {productosSearch
                    ? `No se encontraron productos que coincidan con "${productosSearch}".`
                    : 'No hay productos registrados aún.'}
                </div>
              )}
            </div>
            <Pagination
              page={productosMeta.page}
              pages={productosMeta.pages}
              total={productosMeta.total}
              size={PAGE_SIZE}
              disabled={productosLoading}
              onChange={(p) => loadProductos(p, productosSearch)}
            />
          </div>
        )}

        {activeTab === 'ventas' && (
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div className="flex flex-col gap-3 border-b border-[var(--color-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-text)]">Ventas</h3>
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
                  aria-label="Buscar ventas por cliente"
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
                          : 'No hay órdenes registradas aún.'}
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
