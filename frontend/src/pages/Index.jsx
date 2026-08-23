import Carrusel from '../components/Carrusel';
import ScrollReveal from '../components/ScrollReveal';
import LayoutPrincipal from '../components/layout/LayoutPrincipal';

const metrics = [
  { value: '10', label: 'Titulos destacados' },
  { value: '24h', label: 'Entrega digital' },
  { value: '4.9/5', label: 'Satisfaccion global' }
];

export default function Index() {
  return (
    <LayoutPrincipal>
      <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-16 md:pt-24">
        <ScrollReveal>
          <div className="max-w-3xl">
            <p className="mb-4 text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Catalogo Premium PlayStation
            </p>
            <h1 className="font-display text-4xl leading-tight text-[var(--color-text)] md:text-6xl">
              Videojuegos de alto nivel para jugadores que exigen lo mejor.
            </h1>
            <p className="mt-6 max-w-2xl text-base text-[var(--color-muted)] md:text-lg">
              En Cyrex combinamos curaduria, performance y diseno para ofrecer una experiencia de compra
              elegante, clara y enfocada en titulos que realmente marcan diferencia.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <div className="my-12 grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <article key={metric.label} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
                <p className="font-display text-3xl text-[var(--color-text)]">{metric.value}</p>
                <p className="text-sm text-[var(--color-muted)]">{metric.label}</p>
              </article>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={180}>
          <Carrusel />
        </ScrollReveal>
      </section>
    </LayoutPrincipal>
  );
}
