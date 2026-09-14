import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/icons/logo-sin-fondo.png';

function DashboardIcon({ id }) {
  if (id === 'perfil') {
    return <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /></svg>;
  }

  if (id === 'resumen') {
    return <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 19V5M4 19h16M8 16v-3M12 16V8M16 16v-6M20 16V4" /></svg>;
  }

  if (id === 'productos') {
    return <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 0v9m8-4.5-8 4.5m-8-4.5 8 4.5M8 5.25l8 4.5" /></svg>;
  }

  return <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M4 6h16v13H4zM8 6V4h8v2M8 11h8M8 15h5" /></svg>;
}

export default function DashboardLayout({ children, tabs, activeTab, onTabChange }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] lg:flex">
      <aside className="flex w-full shrink-0 flex-col border-b border-[var(--color-line)] bg-[var(--color-surface)] lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-5 lg:block lg:px-7 lg:py-7">
          <NavLink to="/" className="flex items-center gap-3">
            <img src={logo} alt="Cyrex" className="h-10 w-10 rounded-md object-cover" />
            <div>
              <p className="font-display text-lg tracking-[0.18em] text-[var(--color-text)]">CYREX</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-muted)]">Panel de control</p>
            </div>
          </NavLink>
          <div className="hidden border-t border-[var(--color-line)] pt-6 lg:mt-8 lg:block">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">Sesión activa</p>
            <p className="mt-2 font-semibold text-[var(--color-text)]">{user?.nombre}</p>
            <p className="text-xs text-[var(--color-accent)]">{user?.rol}</p>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-1 lg:flex-col lg:gap-2 lg:px-4 lg:py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors lg:w-full ${
                activeTab === tab.id
                  ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                  : 'text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]'
              }`}
            >
              <DashboardIcon id={tab.id} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="hidden space-y-2 border-t border-[var(--color-line)] p-4 lg:block">
          <NavLink to="/" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-[var(--color-muted)] transition-colors hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]">
            <span aria-hidden="true">↩</span>
            Volver a la web
          </NavLink>
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-red-400 transition-colors hover:bg-[var(--color-bg)]">
            <span aria-hidden="true">↪</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 lg:ml-72">
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-6 py-3 lg:hidden">
          <span className="text-xs text-[var(--color-muted)]">{user?.rol}</span>
          <div className="flex items-center gap-4 text-xs">
            <NavLink to="/" className="text-[var(--color-accent)]">Web principal</NavLink>
            <button type="button" onClick={handleLogout} className="text-red-400">Salir</button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}