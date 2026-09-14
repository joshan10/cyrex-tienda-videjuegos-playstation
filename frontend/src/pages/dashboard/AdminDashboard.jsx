import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usuariosAPI, productosAPI, ordenesAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { uploadAPI } from '../../services/api';

const API_URL = 'http://localhost:4000'; // base para uploads


const tabs = [
  { id: 'resumen',   label: 'Resumen' },
  { id: 'usuarios',  label: 'Usuarios' },
  { id: 'productos', label: 'Productos' },
  { id: 'ventas',    label: 'Ventas' }
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('resumen');
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estado para modales de edición de productos
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', plataforma: 'PlayStation', imagen_url: '' });
  const [showProductModal, setShowProductModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  // Estado para modales de edición de usuarios
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ nombre: '', apellido: '', correo: '', telefono: '', direccion: '', rol_id: 3, estado: 'activo' });
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

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
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Usuarios ---
  const handleToggleUserStatus = async (id) => {
    try {
      await usuariosAPI.remove(id);
      loadData();
    } catch (err) {
      console.error(err);
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
      setShowUserModal(true);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await usuariosAPI.update(editingUser.id, userForm);
      }
      setShowUserModal(false);
      loadData();
    } catch (err) {
      console.error(err);
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
    setImageFile(null);
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalImageUrl = productForm.imagen_url;

      // Subir imagen si se seleccionó un archivo nuevo
      if (imageFile) {
        const uploadRes = await uploadAPI.uploadImage(imageFile);
        finalImageUrl = uploadRes.url;
      }

      const data = {
        ...productForm,
        imagen_url: finalImageUrl,
        precio: parseFloat(productForm.precio),
        stock: parseInt(productForm.stock) || 0
      };

      if (editingProduct) {
        await productosAPI.update(editingProduct.id, data);
      } else {
        await productosAPI.create(data);
      }
      setShowProductModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('¿Desactivar este producto?')) {
      try {
        await productosAPI.remove(id);
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // --- Órdenes ---
  const handleUpdateOrderStatus = async (id, estado) => {
    try {
      await ordenesAPI.updateEstado(id, estado);
      loadData();
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

  const getProductImage = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `${API_URL}${url}`;
    // Fallback para seed data anterior
    return `https://via.placeholder.com/300x400/171b24/c5a46d?text=Cyrex+Game`;
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
          <p className="mt-1 text-sm text-[var(--color-muted)]">Administrador — Gestión completa del sistema</p>
        </div>

        {activeTab === 'resumen' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Usuarios', value: usuarios.length, color: 'text-blue-400' },
                { label: 'Productos', value: productos.length, color: 'text-purple-400' },
                { label: 'Órdenes', value: ordenes.length, color: 'text-amber-400' },
                { label: 'Ingresos', value: stats ? formatPrice(stats.ingresos_totales) : '$0', color: 'text-emerald-400' }
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
                    <div key={v.id} className="flex items-center justify-between rounded-lg bg-[var(--color-bg)] px-4 py-3">
                      <div>
                        <p className="text-sm text-[var(--color-text)]">{v.nombre} {v.apellido}</p>
                        <p className="text-xs text-[var(--color-muted)]">{formatDate(v.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-3">
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
                          {u.estado === 'activo' && u.id !== user?.id && (
                            <button
                              onClick={() => handleToggleUserStatus(u.id)}
                              className="text-xs text-red-400 transition hover:text-red-300"
                            >
                              Desactivar
                            </button>
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
                    <div className="mt-4 flex gap-2">
                      <Button variant="secondary" className="flex-1 !py-2 !text-xs" onClick={() => openProductModal(p)}>
                        Editar
                      </Button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
                      >
                        Desactivar
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
                        No hay órdenes registradas aún.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {showProductModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[color:rgba(9,10,15,.72)] px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] p-6 shadow-[0_20px_60px_rgba(0,0,0,.45)]">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-xl text-[var(--color-text)]">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <Button variant="ghost" onClick={() => setShowProductModal(false)}>Cerrar</Button>
            </div>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <Input label="Nombre" value={productForm.nombre} onChange={(e) => setProductForm(prev => ({ ...prev, nombre: e.target.value }))} />
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">Descripción</span>
                <textarea
                  className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                  rows={3}
                  value={productForm.descripcion}
                  onChange={(e) => setProductForm(prev => ({ ...prev, descripcion: e.target.value }))}
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Precio" type="number" value={productForm.precio} onChange={(e) => setProductForm(prev => ({ ...prev, precio: e.target.value }))} />
                <Input label="Stock" type="number" value={productForm.stock} onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))} />
              </div>
              <Input label="Plataforma" value={productForm.plataforma} onChange={(e) => setProductForm(prev => ({ ...prev, plataforma: e.target.value }))} />
              
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">Imagen del producto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-sm text-[var(--color-muted)] file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--color-line)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--color-text)] hover:file:bg-[var(--color-accent)] hover:file:text-[var(--color-bg)]"
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowProductModal(false)}>Cancelar</Button>
                <Button type="submit">{editingProduct ? 'Actualizar' : 'Crear'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de Usuario */}
      {showUserModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[color:rgba(9,10,15,.72)] px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] p-6 shadow-[0_20px_60px_rgba(0,0,0,.45)]">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-xl text-[var(--color-text)]">
                Editar Usuario
              </h3>
              <Button variant="ghost" onClick={() => setShowUserModal(false)}>Cerrar</Button>
            </div>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <Input label="Nombre" value={userForm.nombre} onChange={(e) => setUserForm(prev => ({ ...prev, nombre: e.target.value }))} />
              <Input label="Apellido" value={userForm.apellido} onChange={(e) => setUserForm(prev => ({ ...prev, apellido: e.target.value }))} />
              <Input label="Correo" type="email" value={userForm.correo} onChange={(e) => setUserForm(prev => ({ ...prev, correo: e.target.value }))} />
              <Input label="Teléfono" value={userForm.telefono} onChange={(e) => setUserForm(prev => ({ ...prev, telefono: e.target.value }))} />
              <Input label="Dirección" value={userForm.direccion} onChange={(e) => setUserForm(prev => ({ ...prev, direccion: e.target.value }))} />
              
              <div className="grid grid-cols-2 gap-4">
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

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowUserModal(false)}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
