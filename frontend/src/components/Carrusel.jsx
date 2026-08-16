import { useState, useEffect, useCallback, useRef } from 'react';
import './carrusel.css';

import foto1 from '../assets/images/foto1.webp';
import foto2 from '../assets/images/foto2.webp';
import foto3 from '../assets/images/foto3.webp';
import foto4 from '../assets/images/foto4.webp';
import foto5 from '../assets/images/foto5.webp';
import foto6 from '../assets/images/foto6.webp';
import foto7 from '../assets/images/foto7.webp';
import foto8 from '../assets/images/foto8.webp';
import foto9 from '../assets/images/foto9.webp';
import foto10 from '../assets/images/foto10.webp';

const INTERVALO_AUTOPLAY = 5000;

const slides = [
  { imagen: foto1, titulo: 'Battlefield 6', descripcion: 'Combate masivo por equipos a escala cinematográfica.' },
  { imagen: foto2, titulo: 'Ghost of Yōtei', descripcion: 'Aventura samurái en el corazón del Japón feudal.' },
  { imagen: foto3, titulo: 'Monster Hunter Wilds', descripcion: 'Caza de monstruos en un ecosistema vivo y dinámico.' },
  { imagen: foto4, titulo: 'Assassin\'s Creed Shadows', descripcion: 'Sigilo y acción con dos héroes en el Japón feudal.' },
  { imagen: foto5, titulo: 'Doom: The Dark Ages', descripcion: 'Demolición demoníaca en primera persona sin pausa.' },
  { imagen: foto6, titulo: 'Elden Ring Nightreign', descripcion: 'Cooperativo intenso en el universo de FromSoftware.' },
  { imagen: foto7, titulo: 'Split Fiction', descripcion: 'Aventura cooperativa para dos jugadores sin límites.' },
  { imagen: foto8, titulo: 'Borderlands 4', descripcion: 'Looter shooter con armas procedurales y humor ácido.' },
  { imagen: foto9, titulo: 'CYREX Exclusivos', descripcion: 'Ediciones de coleccionista disponibles solo en CYREX.' },
  { imagen: foto10, titulo: 'Comunidad Gamer', descripcion: 'Eventos, torneos y lanzamientos cada semana.' },
];

export function Carrusel() {
  const [indiceActual, setIndiceActual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const intervaloRef = useRef(null);

  const totalSlides = slides.length;

  const siguienteImagen = useCallback(() => {
    setIndiceActual((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const anteriorImagen = useCallback(() => {
    setIndiceActual((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const irASlide = useCallback((indice) => {
    setIndiceActual(indice);
  }, []);

  const reiniciarAutoplay = useCallback(() => {
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    if (!pausado) {
      intervaloRef.current = setInterval(siguienteImagen, INTERVALO_AUTOPLAY);
    }
  }, [pausado, siguienteImagen]);

  useEffect(() => {
    reiniciarAutoplay();
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, [indiceActual, pausado, reiniciarAutoplay]);

  const manejarSiguiente = () => {
    siguienteImagen();
  };

  const manejarAnterior = () => {
    anteriorImagen();
  };

  const manejarIndicador = (i) => {
    irASlide(i);
  };

  return (
    <div
      className="carrusel-contenedor"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      aria-roledescription="carrusel"
      aria-label="Destacados de CYREX"
    >
      <div
        className="carrusel-pista"
        style={{ transform: `translateX(-${indiceActual * 100}%)` }}
      >
        {slides.map(({ imagen, titulo, descripcion }, i) => (
          <div key={titulo} className="carrusel-slide" aria-hidden={i !== indiceActual}>
            <img src={imagen} alt={titulo} loading={i === 0 ? 'eager' : 'lazy'} />
            <div className="carrusel-overlay">
              <h3 className="font-titulo text-lg font-bold text-blanco-frio sm:text-xl">{titulo}</h3>
              <p className="mt-1 font-cuerpo text-sm text-blanco-frio/80">{descripcion}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="carrusel-flecha izquierda"
        onClick={manejarAnterior}
        aria-label="Imagen anterior"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        type="button"
        className="carrusel-flecha derecha"
        onClick={manejarSiguiente}
        aria-label="Imagen siguiente"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="carrusel-indicadores" role="tablist">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === indiceActual}
            aria-label={`Ir a slide ${i + 1}`}
            className={`carrusel-indicador ${i === indiceActual ? 'activo' : ''}`}
            onClick={() => manejarIndicador(i)}
          />
        ))}
      </div>
    </div>
  );
}
