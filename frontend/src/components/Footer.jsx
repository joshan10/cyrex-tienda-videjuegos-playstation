import { NavLink } from 'react-router-dom';

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com' },
  { name: 'X', href: 'https://x.com' },
  { name: 'YouTube', href: 'https://youtube.com' },
  { name: 'Discord', href: 'https://discord.com' }
];

const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/quienes-somos', label: 'Quienes Somos' },
  { to: '/contacto', label: 'Contacto' },
  { to: '/iniciar-sesion', label: 'Iniciar Sesion' }
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-[var(--color-line)] bg-[color:rgba(14,16,22,0.88)]">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-accent)]">CYREX</p>
          <h3 className="font-display text-2xl leading-tight text-[var(--color-text)] md:text-3xl">
            Juega en serio. Colecciona con estilo.
          </h3>
          <p className="max-w-md text-sm text-[var(--color-muted)]">
            Videojuegos PlayStation seleccionados para quienes buscan rendimiento, historia y una experiencia premium de principio a fin.
          </p>
        </div>

        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text)]">Enlaces</p>
          <nav className="flex flex-col gap-3 text-sm text-[var(--color-muted)]">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className="transition-colors hover:text-[var(--color-text)]">
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text)]">Nuestras Redes</p>
          <div className="flex flex-wrap gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                {social.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-line)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-4 text-xs text-[var(--color-muted)] md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} Cyrex. Todos los derechos reservados.</p>
          <p>Diseñado para la comunidad PlayStation.</p>
        </div>
      </div>
    </footer>
  );
}
