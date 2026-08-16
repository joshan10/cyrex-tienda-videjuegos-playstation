import { Outlet } from 'react-router-dom';
import { Encabezado } from '../Header';
import { PieDePagina } from '../Footer';

export function LayoutPrincipal() {
  return (
    <div className="flex min-h-screen flex-col">
      <Encabezado />
      <main className="flex-1">
        <Outlet />
      </main>
      <PieDePagina />
    </div>
  );
}
