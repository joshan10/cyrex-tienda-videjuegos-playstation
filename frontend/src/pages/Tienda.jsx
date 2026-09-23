import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { productosAPI, ordenesAPI, pagosAPI } from '../services/api';
import LayoutPrincipal from '../components/layout/LayoutPrincipal';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

export default function Tienda() {
  const { user } = useAuth();
  const { addToast, ToastContainer } = useToast();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carrito, setCarrito] = useState(() => {
    const saved = localStorage.getItem('cyrex_carrito');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const loadProducts = async () => {
    try {
      const data = await productosAPI.getAll();
      const activos = (data.items || []).filter(p => p.estado === 'activo' && p.stock > 0);
      setProductos(activos);
    } catch (err) {
      console.error('Error cargando productos:', err);
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadProducts();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const getProductImage = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `${API_URL}${url}`;
    if (url.startsWith('/')) return url;
    return `/img/${url}`;
  };

  const formatPrice = (p) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p);

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === producto.id);
      if (existe) {
        if (existe.cantidad >= producto.stock) {
          addToast('No hay más stock disponible', 'error');
          return prev;
        }
        addToast(`${producto.nombre} agregado al carrito`, 'success');
        const nuevoCarrito = prev.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
        localStorage.setItem('cyrex_carrito', JSON.stringify(nuevoCarrito));
        return nuevoCarrito;
      }
      addToast(`${producto.nombre} agregado al carrito`, 'success');
      const nuevoCarrito = [...prev, { ...producto, cantidad: 1 }];
      localStorage.setItem('cyrex_carrito', JSON.stringify(nuevoCarrito));
      return nuevoCarrito;
    });
  };

  const quitarDelCarrito = (id) => {
    const nuevoCarrito = carrito.filter(item => item.id !== id);
    setCarrito(nuevoCarrito);
    localStorage.setItem('cyrex_carrito', JSON.stringify(nuevoCarrito));
  };

  const actualizarCantidad = (id, cantidad) => {
    if (cantidad <= 0) return quitarDelCarrito(id);
    const nuevoCarrito = carrito.map(item => {
      if (item.id === id) {
        if (cantidad > item.stock) {
          addToast('No hay suficiente stock', 'error');
          return item;
        }
        return { ...item, cantidad };
      }
      return item;
    });
    setCarrito(nuevoCarrito);
    localStorage.setItem('cyrex_carrito', JSON.stringify(nuevoCarrito));
  };

  const totalCarrito = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const cantidadItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  const procesarCompra = async () => {
    if (carrito.length === 0) {
      addToast('El carrito está vacío', 'error');
      return;
    }
    
    if (!user) {
      addToast('Debes iniciar sesión para comprar', 'error');
      return;
    }
    
    setProcesando(true);
    
    try {
      const orderPayload = {
        direccion_envio: (user?.direccion && user.direccion.length >= 10) ? user.direccion : `Envio a nombre de ${user.nombre} ${user.apellido}, correo: ${user.correo}`,
        notas: 'Compra desde tienda web',
        items: carrito.map(item => ({
          producto_id: item.id,
          cantidad: item.cantidad
        }))
      };

      const orderResponse = await ordenesAPI.create(orderPayload);
      const orden = orderResponse.orden;

      const pagoResponse = await pagosAPI.create({
        orden_id: orden.id,
        customer_email: user.correo,
        currency: 'usd'
      });

      setCarrito([]);
      localStorage.removeItem('cyrex_carrito');
      setIsCartOpen(false);

      window.location.href = pagoResponse.checkout_url;
    } catch (err) {
      console.error('Error al procesar la compra:', err);
      const errorMsg = err.error?.message || err.message || 'Error al procesar la compra';
      addToast(`Error: ${errorMsg}`, 'error');
    } finally {
      setProcesando(false);
    }
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
      <ToastContainer />
      <div className="relative mx-auto w-full max-w-6xl px-6 py-10">
        
        {/* Header Tienda */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">Catálogo Completo</p>
            <h1 className="font-display text-4xl text-[var(--color-text)] md:text-5xl">Cyrex Store</h1>
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 transition hover:border-[var(--color-accent)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--color-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="font-semibold text-[var(--color-text)]">Mi Carrito</span>
            {cantidadItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-[var(--color-bg)]">
                {cantidadItems}
              </span>
            )}
          </button>
        </div>

        {/* Grid de Productos */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {productos.map(p => (
            <article key={p.id} className="group overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] transition-all hover:-translate-y-1 hover:border-[var(--color-accent)] hover:shadow-[0_10px_40px_rgba(197,164,109,0.1)]">
              <div className="relative h-64 w-full overflow-hidden bg-[var(--color-bg)]">
                <img src={getProductImage(p.imagen_url)} alt={p.nombre} className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
                <div className="absolute right-3 top-3 rounded-full bg-[color:rgba(14,16,22,0.8)] px-3 py-1 text-xs font-semibold text-[var(--color-accent)] backdrop-blur-md">
                  {p.plataforma}
                </div>
              </div>
              <div className="flex flex-col gap-3 p-5">
                <div>
                  <p className="text-xs text-[var(--color-muted)]">{p.categoria_nombre}</p>
                  <h3 className="line-clamp-1 font-display text-xl text-[var(--color-text)]">{p.nombre}</h3>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg text-[var(--color-text)]">{formatPrice(p.precio)}</p>
                  <p className="text-xs text-[var(--color-muted)]">Quedan {p.stock}</p>
                </div>
                <Button onClick={() => agregarAlCarrito(p)} className="w-full mt-2">
                  Agregar al Carrito
                </Button>
              </div>
            </article>
          ))}
          
          {productos.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-[var(--color-muted)]">No hay productos disponibles en este momento.</p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar del Carrito (Modal/Offcanvas) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          
          <div className="relative flex w-full max-w-md flex-col border-l border-[var(--color-line)] bg-[var(--color-surface)] shadow-2xl transition-transform duration-300">
            <div className="flex items-center justify-between border-b border-[var(--color-line)] p-6">
              <h2 className="font-display text-2xl text-[var(--color-text)]">Tu Carrito</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-[var(--color-muted)] hover:text-[var(--color-text)]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {carrito.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-[var(--color-muted)]">
                  <svg className="mb-4 h-16 w-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                <ul className="space-y-6">
                  {carrito.map(item => (
                    <li key={item.id} className="flex gap-4">
                      <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--color-bg)]">
                        <img src={getProductImage(item.imagen_url)} alt={item.nombre} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex justify-between">
                            <h4 className="font-semibold text-[var(--color-text)] line-clamp-1">{item.nombre}</h4>
                            <button onClick={() => quitarDelCarrito(item.id)} className="text-[var(--color-muted)] hover:text-red-400">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                          <p className="text-sm font-medium text-[var(--color-accent)]">{formatPrice(item.precio)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => actualizarCantidad(item.id, item.cantidad - 1)} className="flex h-6 w-6 items-center justify-center rounded border border-[var(--color-line)] text-[var(--color-text)] hover:bg-[var(--color-bg)]">-</button>
                          <span className="text-sm text-[var(--color-text)]">{item.cantidad}</span>
                          <button onClick={() => actualizarCantidad(item.id, item.cantidad + 1)} className="flex h-6 w-6 items-center justify-center rounded border border-[var(--color-line)] text-[var(--color-text)] hover:bg-[var(--color-bg)]">+</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {carrito.length > 0 && (
              <div className="border-t border-[var(--color-line)] bg-[var(--color-bg)] p-6">
                <div className="mb-4 flex justify-between text-lg">
                  <span className="text-[var(--color-muted)]">Subtotal</span>
                  <span className="font-display font-semibold text-[var(--color-text)]">{formatPrice(totalCarrito)}</span>
                </div>
                <p className="mb-6 text-xs text-[var(--color-muted)]">Impuestos y gastos de envío calculados en el checkout.</p>
                <Button onClick={procesarCompra} disabled={procesando} className="w-full">
                  {procesando ? 'Procesando...' : 'Finalizar Compra'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </LayoutPrincipal>
  );
}
