import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from '../assets/icons/logo-sin-fondo.png';

const enlacesNav = [
  { ruta: '/', etiqueta: 'Inicio' },
  { ruta: '/quienes-somos', etiqueta: 'Quiénes somos' },
  { ruta: '/tienda', etiqueta: 'Tienda' },
  { ruta: '/contacto', etiqueta: 'Contacto' },
];

export function Encabezado() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const claseEnlace = ({ isActive }) =>
    [
      'relative font-cuerpo text-sm font-medium transition-colors duration-200 px-4 py-2 rounded-lg',
      isActive
        ? 'text-magenta-vibrante'
        : 'text-blanco-frio/75 hover:text-blanco-frio',
    ].join(' ');

  return (
    <header className="sticky top-0 z-50 border-b border-borde-magenta bg-purpura-profundo/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="shrink-0 transition-opacity hover:opacity-90"
          aria-label="CYREX — Inicio"
        >
          <img src={logo} alt="CYREX" className="h-11 w-auto sm:h-12" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {enlacesNav.map(({ ruta, etiqueta }) => (
            <NavLink key={ruta} to={ruta} className={claseEnlace}>
              {({ isActive }) => (
                <>
                  {etiqueta}
                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-magenta-vibrante" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/iniciar-sesion"
            className="inline-flex items-center rounded-lg bg-magenta-vibrante px-5 py-2.5 font-cuerpo text-sm font-semibold text-blanco-frio transition-all duration-200 hover:bg-magenta-oscuro hover:shadow-[var(--sombra-magenta)]"
          >
            Iniciar sesión
          </Link>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-borde-magenta text-blanco-frio transition-colors hover:border-magenta-vibrante hover:bg-magenta-tenue lg:hidden"
          onClick={() => setMenuAbierto((prev) => !prev)}
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuAbierto}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuAbierto ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuAbierto && (
        <nav className="border-t border-borde-magenta bg-purpura-profundo px-4 py-4 lg:hidden">
          <ul className="flex flex-col gap-1">
            {enlacesNav.map(({ ruta, etiqueta }) => (
              <li key={ruta}>
                <NavLink
                  to={ruta}
                  className={({ isActive }) =>
                    [
                      'block rounded-lg px-4 py-3 font-cuerpo text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-magenta-tenue text-magenta-vibrante'
                        : 'text-blanco-frio/80 hover:bg-magenta-tenue hover:text-blanco-frio',
                    ].join(' ')
                  }
                  onClick={() => setMenuAbierto(false)}
                >
                  {etiqueta}
                </NavLink>
              </li>
            ))}
            <li className="mt-2 border-t border-borde-magenta pt-3">
              <Link
                to="/iniciar-sesion"
                className="block rounded-lg bg-magenta-vibrante px-4 py-3 text-center font-cuerpo text-sm font-semibold text-blanco-frio"
                onClick={() => setMenuAbierto(false)}
              >
                Iniciar sesión
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
