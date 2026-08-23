import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { games } from '../data/games';
import Button from './ui/Button';

import ac4 from '../assets/img-games/assassins-creed-iv-black-flag_playstation_4_ps4_cover.webp';
import deathStranding2 from '../assets/img-games/death-stranding-2.webp';
import rdr2 from '../assets/img-games/ed-dead-redemption-red-dead-redemption-2-bundle-ps5-0.webp';
import gow from '../assets/img-games/god-of-war.webp';
import horizon from '../assets/img-games/horizon-forbidden-west.webp';
import spiderman from '../assets/img-games/marvel-spider-man.webp';
import mk11 from '../assets/img-games/mortal-kombat-11-ps4.webp';
import ratchet from '../assets/img-games/ratchet-of-clank.webp';
import reRequiem from '../assets/img-games/resident-evil-requiem-ps5-0.webp';
import tlou from '../assets/img-games/the-last-of-us.webp';

const imageByFile = {
  'assassins-creed-iv-black-flag_playstation_4_ps4_cover.webp': ac4,
  'marvel-spider-man.webp': spiderman,
  'horizon-forbidden-west.webp': horizon,
  'god-of-war.webp': gow,
  'mortal-kombat-11-ps4.webp': mk11,
  'ratchet-of-clank.webp': ratchet,
  'the-last-of-us.webp': tlou,
  'ed-dead-redemption-red-dead-redemption-2-bundle-ps5-0.webp': rdr2,
  'death-stranding-2.webp': deathStranding2,
  'resident-evil-requiem-ps5-0.webp': reRequiem
};

export default function Carrusel() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  const items = useMemo(
    () => games.map((game) => ({ ...game, src: imageByFile[game.image] })),
    []
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, 4200);

    return () => clearInterval(timer);
  }, [items.length]);

  const next = () => setIndex((current) => (current + 1) % items.length);
  const prev = () => setIndex((current) => (current - 1 + items.length) % items.length);

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-2xl tracking-[0.1em] text-[var(--color-text)] md:text-3xl">
          Seleccion Curada
        </h2>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={prev} aria-label="Anterior">
            Anterior
          </Button>
          <Button variant="secondary" onClick={next} aria-label="Siguiente">
            Siguiente
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[0_14px_50px_rgba(0,0,0,.25)] md:p-6">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {items.map((game) => (
            <article
              key={game.title}
              className="grid min-w-full cursor-pointer gap-5 rounded-xl md:grid-cols-[1.15fr_1fr]"
              onClick={() => navigate(user ? '/tienda' : '/iniciar-sesion')}
            >
              <div className="overflow-hidden rounded-xl">
                <img
                  src={game.src}
                  alt={game.title}
                  className="h-72 w-full object-cover transition duration-500 hover:scale-105 md:h-96"
                />
              </div>
              <div className="flex flex-col justify-center gap-4 p-2 md:p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">
                  Cyrex Collection
                </p>
                <h3 className="font-display text-2xl text-[var(--color-text)] md:text-4xl">{game.title}</h3>
                <p className="max-w-xl text-[15px] text-[var(--color-muted)]">{game.description}</p>
                <Button className="w-fit">Comprar Ahora</Button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item, dotIndex) => (
          <button
            key={item.title}
            onClick={() => setIndex(dotIndex)}
            className={`h-1.5 rounded-full transition-all ${
              dotIndex === index ? 'w-10 bg-[var(--color-accent)]' : 'w-5 bg-[var(--color-line)]'
            }`}
            aria-label={`Ir al juego ${item.title}`}
          />
        ))}
      </div>
    </section>
  );
}
