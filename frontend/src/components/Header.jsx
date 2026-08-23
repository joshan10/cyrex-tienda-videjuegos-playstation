import { NavLink } from 'react-router-dom';
import logo from '../assets/icons/Cyrex.png';
import Button from './ui/Button';

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/quienes-somos', label: 'Quienes Somos' },
  { to: '/contacto', label: 'Contacto' }
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[color:rgba(14,16,22,0.86)] backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="flex items-center gap-3">
          <img src={logo} alt="Cyrex" className="h-10 w-10 rounded-md object-cover" />
          <div>
            <p className="font-display text-lg tracking-[0.18em] text-[var(--color-text)]">CYREX</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
              PlayStation Premium
            </p>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                  isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <NavLink to="/iniciar-sesion">
          <Button className="hidden md:inline-flex">Iniciar sesion</Button>
        </NavLink>
      </div>
    </header>
  );
}
