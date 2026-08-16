import { Link } from 'react-router-dom';
import { Carrusel } from '../components/Carrusel';
import { Boton } from '../components/ui/Boton';
import { ContenedorPagina } from '../components/layout/ContenedorPagina';

import foto1 from '../assets/images/foto1.webp';
import foto2 from '../assets/images/foto2.webp';
import foto6 from '../assets/images/foto6.webp';
import foto8 from '../assets/images/foto8.webp';

const razones = [
  {
    icono: '🎮',
    titulo: 'Variedad de plataformas',
    descripcion: 'PS5, Xbox y más. Encontrá tu juego favorito sin importar dónde juegues.',
  },
  {
    icono: '🚀',
    titulo: 'Envíos express',
    descripcion: 'Entrega en 24-48 h a todo el país. Tu próxima aventura no puede esperar.',
  },
  {
    icono: '👾',
    titulo: 'Comunidad gamer',
    descripcion: 'Torneos, streams y eventos exclusivos para miembros de la familia CYREX.',
  },
  {
    icono: '💎',
    titulo: 'Precios competitivos',
    descripcion: 'Ofertas semanales y programas de fidelidad con descuentos reales.',
  },
];

const destacados = [
  {
    titulo: 'Battlefield 6',
    descripcion: 'Shooter militar multijugador a gran escala.',
    plataforma: 'PS5 / Xbox',
    imagen: foto1,
  },
  {
    titulo: 'Ghost of Yōtei',
    descripcion: 'Aventura de acción en el Japón feudal.',
    plataforma: 'PS5',
    imagen: foto2,
  },
  {
    titulo: 'Elden Ring Nightreign',
    descripcion: 'Spin-off cooperativo del universo Elden Ring.',
    plataforma: 'PS4 / PS5 / Xbox',
    imagen: foto6,
  },
  {
    titulo: 'Borderlands 4',
    descripcion: 'Shooter looter con armas procedurales.',
    plataforma: 'PS5 / Xbox',
    imagen: foto8,
  },
];

export function Inicio() {
  return (
    <>
      {/* Hero */}
      <section className="fondo-seccion relative overflow-hidden bg-purpura-oscuro">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-magenta-vibrante/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-purpura-medio/30 blur-3xl" />

        <ContenedorPagina className="relative z-10 py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div className="order-2 lg:order-1">
              <span className="encabezado-pagina__etiqueta">Tu universo gaming</span>
              <h1 className="mt-5 font-titulo text-4xl font-bold leading-[1.1] text-blanco-frio sm:text-5xl xl:text-6xl">
                Juega sin{' '}
                <span className="bg-linear-to-r from-magenta-vibrante to-blanco-frio bg-clip-text text-transparent">
                  límites
                </span>
              </h1>
              <p className="mt-6 max-w-lg font-cuerpo text-base leading-relaxed text-blanco-frio/65 sm:text-lg">
                CYREX es tu destino para los lanzamientos más esperados del 2026.
                Descubrí, comprá y conectá con una comunidad que vive el gaming de verdad.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/tienda">
                  <Boton>Explorar tienda</Boton>
                </Link>
                <Link to="/quienes-somos">
                  <Boton variante="secundario">Conocé CYREX</Boton>
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-4 border-t border-borde-magenta pt-8">
                {[
                  { valor: '500+', label: 'Títulos' },
                  { valor: '10K+', label: 'Gamers' },
                  { valor: '24h', label: 'Envío' },
                ].map(({ valor, label }) => (
                  <div key={label}>
                    <p className="font-titulo text-xl font-bold text-magenta-vibrante sm:text-2xl">{valor}</p>
                    <p className="mt-0.5 font-cuerpo text-xs text-blanco-frio/50 sm:text-sm">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <Carrusel />
            </div>
          </div>
        </ContenedorPagina>
      </section>

      {/* Por qué elegir CYREX */}
      <section className="bg-purpura-profundo py-20 sm:py-24">
        <ContenedorPagina>
          <div className="mx-auto max-w-2xl text-center">
            <span className="encabezado-pagina__etiqueta">Ventajas</span>
            <h2 className="mt-4 font-titulo text-3xl font-bold text-blanco-frio sm:text-4xl">
              ¿Por qué elegir CYREX?
            </h2>
            <p className="mt-4 font-cuerpo text-blanco-frio/60">
              Más que una tienda, somos el punto de encuentro para gamers exigentes.
            </p>
            <div className="encabezado-pagina__linea" />
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {razones.map(({ icono, titulo, descripcion }) => (
              <article key={titulo} className="tarjeta-brillo p-7">
                <div className="icono-feature">{icono}</div>
                <h3 className="mt-5 font-titulo text-base font-semibold text-blanco-frio">{titulo}</h3>
                <p className="mt-2.5 font-cuerpo text-sm leading-relaxed text-blanco-frio/58">{descripcion}</p>
              </article>
            ))}
          </div>
        </ContenedorPagina>
      </section>

      {/* Vista previa tienda */}
      <section className="fondo-seccion bg-purpura-oscuro py-20 sm:py-24">
        <ContenedorPagina className="relative z-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="encabezado-pagina__etiqueta">Catálogo</span>
              <h2 className="mt-4 font-titulo text-3xl font-bold text-blanco-frio sm:text-4xl">
                Destacados de la semana
              </h2>
              <p className="mt-2 font-cuerpo text-blanco-frio/60">
                Los títulos que no te podés perder.
              </p>
            </div>
            <Link to="/tienda" className="shrink-0">
              <Boton variante="secundario">Ver todo el catálogo</Boton>
            </Link>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {destacados.map(({ titulo, descripcion, plataforma, imagen }) => (
              <article key={titulo} className="group tarjeta-brillo overflow-hidden">
                <div className="overflow-hidden">
                  <img
                    src={imagen}
                    alt={titulo}
                    className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <span className="inline-block rounded-full bg-magenta-tenue px-3 py-1 font-cuerpo text-xs font-medium text-magenta-vibrante">
                    {plataforma}
                  </span>
                  <h3 className="mt-3 font-titulo text-sm font-semibold text-blanco-frio">{titulo}</h3>
                  <p className="mt-1.5 font-cuerpo text-xs leading-relaxed text-blanco-frio/58">{descripcion}</p>
                </div>
              </article>
            ))}
          </div>
        </ContenedorPagina>
      </section>
    </>
  );
}
