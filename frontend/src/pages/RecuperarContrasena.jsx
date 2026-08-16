import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Boton } from '../components/ui/Boton';
import { TarjetaFormulario } from '../components/ui/TarjetaFormulario';

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RecuperarContrasena() {
  const [correo, setCorreo] = useState('');
  const [tocado, setTocado] = useState(false);

  const errorCorreo = (() => {
    if (!correo.trim()) return 'El correo es obligatorio.';
    if (!REGEX_CORREO.test(correo.trim())) return 'Ingresá un correo electrónico válido.';
    return '';
  })();

  const manejarEnvio = (e) => {
    e.preventDefault();
    setTocado(true);
  };

  return (
    <div className="layout-auth">
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-titulo text-3xl font-bold text-blanco-frio">
            Recuperar contraseña
          </h1>
          <p className="mt-3 font-cuerpo text-sm leading-relaxed text-blanco-frio/60">
            Ingresá tu correo y te enviaremos instrucciones para restablecer tu contraseña.
          </p>
        </div>

        <TarjetaFormulario>
          <form onSubmit={manejarEnvio} className="space-y-6" noValidate>
            <Input
              etiqueta="Correo electrónico"
              id="recuperar-correo"
              tipo="email"
              valor={correo}
              onChange={(e) => {
                setCorreo(e.target.value);
                setTocado(true);
              }}
              placeholder="tu@email.com"
              error={tocado ? errorCorreo : ''}
              requerido
            />

            <div className="border-t border-borde-magenta pt-6">
              <Boton tipo="submit" className="w-full">
                Recuperar contraseña
              </Boton>
            </div>
          </form>
        </TarjetaFormulario>

        <p className="mt-8 text-center">
          <Link
            to="/iniciar-sesion"
            className="font-cuerpo text-sm text-magenta-vibrante transition-colors hover:text-magenta-oscuro"
          >
            ← Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
