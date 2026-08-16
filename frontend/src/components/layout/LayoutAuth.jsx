import { Outlet, Link } from 'react-router-dom';
import logo from '../../assets/icons/logo-sin-fondo.png';

export function LayoutAuth() {
  return (
    <div className="flex min-h-screen flex-col bg-purpura-oscuro">
      <header className="shrink-0 border-b border-borde-magenta bg-purpura-profundo">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-4 sm:px-6">
          <Link to="/" className="transition-opacity hover:opacity-85" aria-label="Volver al inicio">
            <img src={logo} alt="CYREX" className="h-11 w-auto" />
          </Link>
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
