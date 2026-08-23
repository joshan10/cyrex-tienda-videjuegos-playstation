import { NavLink } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--color-line)] bg-[var(--color-surface)]/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-[var(--color-muted)] md:flex-row md:items-center md:justify-between">
        <p>Cyrex. Experiencias PlayStation seleccionadas para jugadores exigentes.</p>
        <div className="flex items-center gap-5">
          <NavLink to="/" className="hover:text-[var(--color-text)]">
            Inicio
          </NavLink>
          <NavLink to="/quienes-somos" className="hover:text-[var(--color-text)]">
            Quienes Somos
          </NavLink>
          <NavLink to="/contacto" className="hover:text-[var(--color-text)]">
            Contacto
          </NavLink>
        </div>
      </div>
    </footer>
  );
}
