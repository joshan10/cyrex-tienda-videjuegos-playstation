import { useState } from 'react';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Boton } from '../components/ui/Boton';
import { TarjetaFormulario } from '../components/ui/TarjetaFormulario';
import { EncabezadoPagina } from '../components/layout/EncabezadoPagina';
import { ContenedorPagina } from '../components/layout/ContenedorPagina';

export function Contacto() {
  const [formulario, setFormulario] = useState({
    nombre: '',
    email: '',
    mensaje: '',
  });

  const actualizarCampo = (campo) => (e) => {
    setFormulario((prev) => ({ ...prev, [campo]: e.target.value }));
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
  };

  return (
    <div className="fondo-seccion bg-purpura-oscuro pb-20 pt-4 sm:pb-28">
      <ContenedorPagina ancho="2xl">
        <EncabezadoPagina
          etiqueta="Hablemos"
          titulo="Contacto"
          subtitulo="¿Tenés alguna consulta? Escribinos y te respondemos a la brevedad."
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-12">
          <aside className="space-y-5">
            {[
              { titulo: 'Email', detalle: 'soporte@cyrex.com', icono: '✉️' },
              { titulo: 'Horario', detalle: 'Lun — Vie, 9:00 a 18:00 hs', icono: '🕐' },
              { titulo: 'Respuesta', detalle: 'En menos de 24 horas hábiles', icono: '⚡' },
            ].map(({ titulo, detalle, icono }) => (
              <div key={titulo} className="tarjeta-brillo flex items-start gap-4 p-5">
                <span className="icono-feature shrink-0 text-base">{icono}</span>
                <div>
                  <p className="font-titulo text-xs font-semibold uppercase tracking-wider text-magenta-vibrante">
                    {titulo}
                  </p>
                  <p className="mt-1 font-cuerpo text-sm text-blanco-frio/75">{detalle}</p>
                </div>
              </div>
            ))}
          </aside>

          <TarjetaFormulario>
            <form onSubmit={manejarEnvio} className="space-y-6" noValidate>
              <Input
                etiqueta="Nombre completo"
                id="contacto-nombre"
                valor={formulario.nombre}
                onChange={actualizarCampo('nombre')}
                placeholder="Tu nombre"
                requerido
              />

              <Input
                etiqueta="Correo electrónico"
                id="contacto-email"
                tipo="email"
                valor={formulario.email}
                onChange={actualizarCampo('email')}
                placeholder="tu@email.com"
                requerido
              />

              <Textarea
                etiqueta="Mensaje"
                id="contacto-mensaje"
                valor={formulario.mensaje}
                onChange={actualizarCampo('mensaje')}
                placeholder="Escribí tu mensaje aquí..."
                requerido
              />

              <div className="border-t border-borde-magenta pt-6">
                <Boton tipo="submit" className="w-full sm:w-auto">
                  Enviar mensaje
                </Boton>
              </div>
            </form>
          </TarjetaFormulario>
        </div>
      </ContenedorPagina>
    </div>
  );
}
