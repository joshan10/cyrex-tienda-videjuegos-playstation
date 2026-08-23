import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/icons/logo-sin-fondo.png';
import Button from './ui/Button';

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/quienes-somos', label: 'Quienes Somos' },
  { to: '/contacto', label: 'Contacto' }
];

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Determinar ruta del dashboard según rol
  const getDashboardPath = () => {
    if (!user) return '/iniciar-sesion';
    switch (user.rol) {
      case 'Administrador': return '/dashboard/admin';
      case 'Empleado':      return '/dashboard/empleado';
      case 'Cliente':        return '/dashboard/cliente';
      default:               return '/';
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[color:rgba(14,16,22,0.86)] backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="flex items-center gap-3">
          <img src={logo} alt="Cyrex" className="h-10 w-10 rounded-md object-cover" />
          <div>
            <p className="font-display text-lg tracking-[0.18em] text-[var(--color-text)]">CYREX</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
              PlayStation Premium
            </p>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                  isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {user && (
            <NavLink
              to="/tienda"
              className={({ isActive }) =>
                `text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
                  isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)] hover:text-[var(--color-accent)]'
                }`
              }
            >
              Tienda
            </NavLink>
          )}
        </nav>

        {/* Sección derecha: usuario o botón login */}
        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-sm transition-all hover:border-[var(--color-accent)]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-[var(--color-bg)]">
                  {user.nombre?.charAt(0).toUpperCase()}
                </div>
                <span className="text-[var(--color-text)]">
                  Bienvenido, <span className="font-semibold">{user.nombre}</span>
                </span>
                <svg
                  className={`h-4 w-4 text-[var(--color-muted)] transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] py-2 shadow-[0_12px_40px_rgba(0,0,0,.4)]">
                  <p className="border-b border-[var(--color-line)] px-4 py-2 text-xs text-[var(--color-muted)]">
                    {user.rol}
                  </p>
                  <NavLink
                    to={getDashboardPath()}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg)]"
                  >
                    Mi Panel
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-[var(--color-bg)]"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/iniciar-sesion">
              <Button className="hidden md:inline-flex">Iniciar sesion</Button>
            </NavLink>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-muted)] md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-[var(--color-line)] bg-[var(--color-surface)] px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
              >
                {link.label}
              </NavLink>
            ))}
            {user && (
              <NavLink
                to="/tienda"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-semibold text-[var(--color-text)] transition-colors hover:text-[var(--color-accent)]"
              >
                Tienda
              </NavLink>
            )}
            {user ? (
              <>
                <NavLink
                  to={getDashboardPath()}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-[var(--color-accent)]"
                >
                  Mi Panel
                </NavLink>
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="text-left text-sm text-red-400"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <NavLink
                to="/iniciar-sesion"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-semibold text-[var(--color-accent)]"
              >
                Iniciar sesion
              </NavLink>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
