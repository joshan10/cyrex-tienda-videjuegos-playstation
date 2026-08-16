import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Boton } from '../components/ui/Boton';
import { TarjetaFormulario } from '../components/ui/TarjetaFormulario';
import { RegistroModal } from '../components/RegistroModal';

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function IniciarSesion() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [recordarme, setRecordarme] = useState(false);
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [tocado, setTocado] = useState({ correo: false, contrasena: false });

  const errorCorreo = (() => {
    if (!correo.trim()) return 'El correo es obligatorio.';
    if (!REGEX_CORREO.test(correo.trim())) return 'Ingresá un correo electrónico válido.';
    return '';
  })();

  const errorContrasena = (() => {
    if (!contrasena) return 'La contraseña es obligatoria.';
    return '';
  })();

  const manejarEnvio = (e) => {
    e.preventDefault();
    setTocado({ correo: true, contrasena: true });
  };

  return (
    <div className="layout-auth">
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-titulo text-3xl font-bold text-blanco-frio">
            Iniciar sesión
          </h1>
          <p className="mt-3 font-cuerpo text-sm text-blanco-frio/60">
            Accedé a tu cuenta CYREX
          </p>
        </div>

        <TarjetaFormulario>
          <form onSubmit={manejarEnvio} className="space-y-6" noValidate>
            <Input
              etiqueta="Correo electrónico"
              id="login-correo"
              tipo="email"
              valor={correo}
              onChange={(e) => {
                setCorreo(e.target.value);
                setTocado((prev) => ({ ...prev, correo: true }));
              }}
              placeholder="tu@email.com"
              error={tocado.correo ? errorCorreo : ''}
              requerido
            />

            <Input
              etiqueta="Contraseña"
              id="login-contrasena"
              tipo="password"
              valor={contrasena}
              onChange={(e) => {
                setContrasena(e.target.value);
                setTocado((prev) => ({ ...prev, contrasena: true }));
              }}
              placeholder="••••••••"
              error={tocado.contrasena ? errorContrasena : ''}
              requerido
            />

            <div className="flex items-center justify-between gap-4 pt-1">
              <label htmlFor="recordarme" className="flex cursor-pointer items-center gap-2.5">
                <input
                  id="recordarme"
                  type="checkbox"
                  checked={recordarme}
                  onChange={(e) => setRecordarme(e.target.checked)}
                  className="h-4 w-4 rounded border-borde-magenta bg-purpura-oscuro accent-magenta-vibrante"
                />
                <span className="font-cuerpo text-sm text-blanco-frio/75">Recordarme</span>
              </label>
              <Link
                to="/recuperar-contrasena"
                className="font-cuerpo text-sm text-magenta-vibrante transition-colors hover:text-magenta-oscuro"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <div className="border-t border-borde-magenta pt-6">
              <Boton tipo="submit" className="w-full">
                Iniciar sesión
              </Boton>
            </div>
          </form>
        </TarjetaFormulario>

        <p className="mt-8 text-center font-cuerpo text-sm text-blanco-frio/55">
          ¿No tenés cuenta?{' '}
          <button
            type="button"
            onClick={() => setModalRegistroAbierto(true)}
            className="font-semibold text-magenta-vibrante transition-colors hover:text-magenta-oscuro cursor-pointer"
          >
            Crear una cuenta
          </button>
        </p>
      </div>

      <RegistroModal
        abierto={modalRegistroAbierto}
        onCerrar={() => setModalRegistroAbierto(false)}
      />
    </div>
  );
}
