import { Link } from 'react-router-dom';
import logo from '../assets/icons/logo-sin-fondo.png';

export function PieDePagina() {
  const anio = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-borde-magenta bg-purpura-profundo">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Link to="/" className="inline-block transition-opacity hover:opacity-90">
              <img src={logo} alt="CYREX" className="h-10 w-auto" />
            </Link>
            <p className="mt-4 max-w-xs font-cuerpo text-sm leading-relaxed text-blanco-frio/55">
              Tu tienda de confianza para los lanzamientos más esperados del gaming.
            </p>
          </div>

          <div>
            <h3 className="font-titulo text-xs font-semibold uppercase tracking-widest text-magenta-vibrante">
              Navegación
            </h3>
            <nav className="mt-4 flex flex-col gap-2.5">
              {[
                { ruta: '/', etiqueta: 'Inicio' },
                { ruta: '/quienes-somos', etiqueta: 'Quiénes somos' },
                { ruta: '/tienda', etiqueta: 'Tienda' },
                { ruta: '/contacto', etiqueta: 'Contacto' },
              ].map(({ ruta, etiqueta }) => (
                <Link
                  key={ruta}
                  to={ruta}
                  className="font-cuerpo text-sm text-blanco-frio/65 transition-colors hover:text-magenta-vibrante"
                >
                  {etiqueta}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="font-titulo text-xs font-semibold uppercase tracking-widest text-magenta-vibrante">
              Cuenta
            </h3>
            <nav className="mt-4 flex flex-col gap-2.5">
              <Link
                to="/iniciar-sesion"
                className="font-cuerpo text-sm text-blanco-frio/65 transition-colors hover:text-magenta-vibrante"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/contacto"
                className="font-cuerpo text-sm text-blanco-frio/65 transition-colors hover:text-magenta-vibrante"
              >
                Soporte
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-10 border-t border-borde-magenta pt-6">
          <p className="text-center font-cuerpo text-xs text-blanco-frio/45">
            © {anio} CYREX. Todos los derechos reservados. Proyecto académico.
          </p>
        </div>
      </div>
    </footer>
  );
}
