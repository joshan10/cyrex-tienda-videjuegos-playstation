import { Boton } from '../components/ui/Boton';
import { EncabezadoPagina } from '../components/layout/EncabezadoPagina';
import { ContenedorPagina } from '../components/layout/ContenedorPagina';

import foto1 from '../assets/images/foto1.webp';
import foto2 from '../assets/images/foto2.webp';
import foto3 from '../assets/images/foto3.webp';
import foto4 from '../assets/images/foto4.webp';
import foto5 from '../assets/images/foto5.webp';
import foto6 from '../assets/images/foto6.webp';
import foto7 from '../assets/images/foto7.webp';
import foto8 from '../assets/images/foto8.webp';

const juegos = [
  {
    id: 1,
    titulo: 'Battlefield 6',
    descripcion: 'Shooter militar multijugador a gran escala, combate masivo por equipos.',
    plataforma: 'PS5 / Xbox',
    imagen: foto1,
  },
  {
    id: 2,
    titulo: 'Ghost of Yōtei',
    descripcion: 'Aventura de acción en el Japón feudal, secuela de Ghost of Tsushima.',
    plataforma: 'PS5',
    imagen: foto2,
  },
  {
    id: 3,
    titulo: 'Monster Hunter Wilds',
    descripcion: 'Caza de monstruos en un mundo abierto dinámico.',
    plataforma: 'PS5 / Xbox',
    imagen: foto3,
  },
  {
    id: 4,
    titulo: 'Assassin\'s Creed Shadows',
    descripcion: 'Sigilo y acción en el Japón feudal, dos protagonistas jugables.',
    plataforma: 'PS5 / Xbox',
    imagen: foto4,
  },
  {
    id: 5,
    titulo: 'Doom: The Dark Ages',
    descripcion: 'Shooter de acción frenética en primera persona.',
    plataforma: 'PS5 / Xbox',
    imagen: foto5,
  },
  {
    id: 6,
    titulo: 'Elden Ring Nightreign',
    descripcion: 'Spin-off cooperativo del universo de Elden Ring.',
    plataforma: 'PS4 / PS5 / Xbox',
    imagen: foto6,
  },
  {
    id: 7,
    titulo: 'Split Fiction',
    descripcion: 'Aventura cooperativa para dos jugadores.',
    plataforma: 'PS5 / Xbox',
    imagen: foto7,
  },
  {
    id: 8,
    titulo: 'Borderlands 4',
    descripcion: 'Shooter looter con generación procedural de armas.',
    plataforma: 'PS5 / Xbox',
    imagen: foto8,
  },
];

export function Tienda() {
  return (
    <div className="fondo-seccion bg-purpura-oscuro pb-20 pt-4 sm:pb-28">
      <ContenedorPagina>
        <EncabezadoPagina
          etiqueta="Catálogo 2026"
          titulo="Tienda CYREX"
          subtitulo="Explorá nuestro catálogo de los mejores títulos del año."
        />

        <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {juegos.map(({ id, titulo, descripcion, plataforma, imagen }) => (
            <article
              key={id}
              className="group flex flex-col overflow-hidden tarjeta-brillo"
            >
              <div className="relative overflow-hidden">
                <img
                  src={imagen}
                  alt={titulo}
                  className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-purpura-profundo to-transparent" />
              </div>

              <div className="flex flex-1 flex-col p-6">
                <span className="inline-block w-fit rounded-full bg-magenta-tenue px-3 py-1 font-cuerpo text-xs font-medium text-magenta-vibrante">
                  {plataforma}
                </span>
                <h2 className="mt-3 font-titulo text-base font-semibold text-blanco-frio">
                  {titulo}
                </h2>
                <p className="mt-2.5 flex-1 font-cuerpo text-sm leading-relaxed text-blanco-frio/58">
                  {descripcion}
                </p>
                <Boton variante="secundario" className="mt-5 w-full">
                  Ver más
                </Boton>
              </div>
            </article>
          ))}
        </div>
      </ContenedorPagina>
    </div>
  );
}
