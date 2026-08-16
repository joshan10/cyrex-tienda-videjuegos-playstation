import { EncabezadoPagina } from '../components/layout/EncabezadoPagina';
import { ContenedorPagina } from '../components/layout/ContenedorPagina';

export function QuienesSomos() {
  return (
    <div className="fondo-seccion bg-purpura-oscuro pb-20 pt-4 sm:pb-28">
      <ContenedorPagina ancho="4xl">
        <EncabezadoPagina
          etiqueta="Nuestra historia"
          titulo="Quiénes somos"
          subtitulo="La tienda creada por gamers, para gamers."
        />

        <div className="mt-12 space-y-7 font-cuerpo text-base leading-[1.85] text-blanco-frio/78 sm:text-lg">
          <p className="tarjeta-brillo p-7 sm:p-8">
            <strong className="text-magenta-vibrante">CYREX</strong> nació en 2024 con una misión clara:
            ser la tienda de videojuegos que los gamers realmente merecen. Somos una marca ficticia
            creada por apasionados del gaming, para apasionados del gaming — sin intermediarios
            innecesarios ni experiencias de compra frustrantes.
          </p>
          <p>
            Desde nuestros inicios, nos enfocamos en ofrecer los lanzamientos más esperados del
            mercado con envíos rápidos, precios justos y un servicio al cliente que habla el
            mismo idioma que vos: el de los videojuegos. Trabajamos directamente con distribuidores
            para garantizar stock real y ediciones especiales que no encontrarás en otro lado.
          </p>
          <p>
            Pero CYREX es más que una tienda online. Somos una comunidad. Organizamos torneos,
            eventos de lanzamiento y espacios para que gamers de todo el país se conecten,
            compitan y compartan su pasión. Porque creemos que jugar solo es bueno, pero jugar
            juntos es legendario.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {[
            { numero: '10K+', etiqueta: 'Clientes activos' },
            { numero: '500+', etiqueta: 'Títulos en catálogo' },
            { numero: '24h', etiqueta: 'Envío express' },
          ].map(({ numero, etiqueta }) => (
            <div key={etiqueta} className="tarjeta-brillo p-8 text-center">
              <p className="font-titulo text-3xl font-bold text-magenta-vibrante sm:text-4xl">{numero}</p>
              <p className="mt-2 font-cuerpo text-sm text-blanco-frio/58">{etiqueta}</p>
            </div>
          ))}
        </div>
      </ContenedorPagina>
    </div>
  );
}
