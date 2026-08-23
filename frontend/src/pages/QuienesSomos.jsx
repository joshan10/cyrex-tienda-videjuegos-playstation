import LayoutPrincipal from '../components/layout/LayoutPrincipal';
import ScrollReveal from '../components/ScrollReveal';

export default function QuienesSomos() {
  return (
    <LayoutPrincipal>
      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
        <ScrollReveal>
          <div className="max-w-3xl">
            <p className="mb-4 text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">Sobre Cyrex</p>
            <h1 className="font-display text-4xl text-[var(--color-text)] md:text-5xl">Quienes Somos</h1>
            <p className="mt-6 text-[var(--color-muted)]">
              Somos una marca enfocada en jugadores de PlayStation que valoran calidad, curaduria y una
              experiencia de compra impecable. Nuestra seleccion combina clasicos, franquicias top y nuevos
              lanzamientos para mantener un catalogo de alto nivel.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <article className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
              <h2 className="font-display text-xl text-[var(--color-text)]">Vision</h2>
              <p className="mt-3 text-sm text-[var(--color-muted)]">
                Ser la referencia premium en venta de videojuegos PlayStation en la region.
              </p>
            </article>
            <article className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
              <h2 className="font-display text-xl text-[var(--color-text)]">Mision</h2>
              <p className="mt-3 text-sm text-[var(--color-muted)]">
                Conectar a cada jugador con titulos memorables a traves de una plataforma confiable y elegante.
              </p>
            </article>
            <article className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
              <h2 className="font-display text-xl text-[var(--color-text)]">Valores</h2>
              <p className="mt-3 text-sm text-[var(--color-muted)]">
                Transparencia, detalle, excelencia visual y pasion por la cultura gamer.
              </p>
            </article>
          </div>
        </ScrollReveal>
      </section>
    </LayoutPrincipal>
  );
}
