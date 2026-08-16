import { useState, useMemo } from 'react';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Boton } from '../components/ui/Boton';
import { Modal } from '../components/ui/Modal';

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_DOCUMENTO = /^[0-9]{6,12}$/;
const REGEX_TELEFONO = /^[0-9+\-\s()]{7,15}$/;
const REGEX_CONTRASENA = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const OPCIONES_DOCUMENTO = [
  { valor: 'dni', etiqueta: 'DNI' },
  { valor: 'pasaporte', etiqueta: 'Pasaporte' },
  { valor: 'cedula', etiqueta: 'Cédula' },
];

const estadoInicial = {
  nombre: '',
  apellido: '',
  tipoDocumento: '',
  numeroDocumento: '',
  direccion: '',
  telefono: '',
  correo: '',
  contrasena: '',
  confirmarContrasena: '',
};

function validarCampo(campo, valor, formulario = {}) {
  switch (campo) {
    case 'nombre':
    case 'apellido':
      if (!valor.trim()) return 'Este campo es obligatorio.';
      if (valor.trim().length < 2) return 'Debe tener al menos 2 caracteres.';
      return '';
    case 'tipoDocumento':
      if (!valor) return 'Seleccioná un tipo de documento.';
      return '';
    case 'numeroDocumento':
      if (!valor.trim()) return 'Este campo es obligatorio.';
      if (!REGEX_DOCUMENTO.test(valor.trim())) return 'Ingresá un número de documento válido (6-12 dígitos).';
      return '';
    case 'direccion':
      if (!valor.trim()) return 'Este campo es obligatorio.';
      if (valor.trim().length < 5) return 'La dirección debe tener al menos 5 caracteres.';
      return '';
    case 'telefono':
      if (!valor.trim()) return 'Este campo es obligatorio.';
      if (!REGEX_TELEFONO.test(valor.trim())) return 'Ingresá un teléfono válido.';
      return '';
    case 'correo':
      if (!valor.trim()) return 'Este campo es obligatorio.';
      if (!REGEX_CORREO.test(valor.trim())) return 'Ingresá un correo electrónico válido.';
      return '';
    case 'contrasena':
      if (!valor) return 'Este campo es obligatorio.';
      if (!REGEX_CONTRASENA.test(valor)) return 'Mínimo 8 caracteres, con letras y números.';
      return '';
    case 'confirmarContrasena':
      if (!valor) return 'Este campo es obligatorio.';
      if (valor !== formulario.contrasena) return 'Las contraseñas no coinciden.';
      return '';
    default:
      return '';
  }
}

export function RegistroModal({ abierto, onCerrar }) {
  const [formulario, setFormulario] = useState(estadoInicial);
  const [tocados, setTocados] = useState({});

  const errores = useMemo(() => {
    const resultado = {};
    Object.keys(estadoInicial).forEach((campo) => {
      resultado[campo] = validarCampo(campo, formulario[campo], formulario);
    });
    return resultado;
  }, [formulario]);

  const hayErrores = Object.values(errores).some((e) => e !== '');

  const actualizarCampo = (campo) => (e) => {
    const valor = e.target.value;
    setFormulario((prev) => ({ ...prev, [campo]: valor }));
    setTocados((prev) => ({ ...prev, [campo]: true }));
  };

  const manejarRegistro = (e) => {
    e.preventDefault();
    setTocados(Object.fromEntries(Object.keys(estadoInicial).map((k) => [k, true])));
    if (!hayErrores) {
      onCerrar();
      setFormulario(estadoInicial);
      setTocados({});
    }
  };

  const manejarCerrar = () => {
    onCerrar();
    setFormulario(estadoInicial);
    setTocados({});
  };

  const mostrarError = (campo) => (tocados[campo] ? errores[campo] : '');

  return (
    <Modal abierto={abierto} onCerrar={manejarCerrar} titulo="Crear cuenta" ancho="xl">
      <p className="-mt-2 mb-6 font-cuerpo text-sm text-blanco-frio/55">
        Completá tus datos para unirte a la comunidad CYREX.
      </p>

      <form onSubmit={manejarRegistro} className="space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            etiqueta="Nombre"
            id="registro-nombre"
            valor={formulario.nombre}
            onChange={actualizarCampo('nombre')}
            error={mostrarError('nombre')}
            requerido
          />
          <Input
            etiqueta="Apellido"
            id="registro-apellido"
            valor={formulario.apellido}
            onChange={actualizarCampo('apellido')}
            error={mostrarError('apellido')}
            requerido
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            etiqueta="Tipo de documento"
            id="registro-tipo-documento"
            valor={formulario.tipoDocumento}
            onChange={actualizarCampo('tipoDocumento')}
            opciones={OPCIONES_DOCUMENTO}
            error={mostrarError('tipoDocumento')}
            requerido
          />
          <Input
            etiqueta="Número de documento"
            id="registro-numero-documento"
            valor={formulario.numeroDocumento}
            onChange={actualizarCampo('numeroDocumento')}
            error={mostrarError('numeroDocumento')}
            requerido
          />
        </div>

        <Input
          etiqueta="Dirección"
          id="registro-direccion"
          valor={formulario.direccion}
          onChange={actualizarCampo('direccion')}
          error={mostrarError('direccion')}
          requerido
        />

        <Input
          etiqueta="Teléfono"
          id="registro-telefono"
          tipo="tel"
          valor={formulario.telefono}
          onChange={actualizarCampo('telefono')}
          placeholder="+54 11 1234-5678"
          error={mostrarError('telefono')}
          requerido
        />

        <Input
          etiqueta="Correo electrónico"
          id="registro-correo"
          tipo="email"
          valor={formulario.correo}
          onChange={actualizarCampo('correo')}
          error={mostrarError('correo')}
          requerido
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            etiqueta="Contraseña"
            id="registro-contrasena"
            tipo="password"
            valor={formulario.contrasena}
            onChange={actualizarCampo('contrasena')}
            error={mostrarError('contrasena')}
            requerido
          />
          <Input
            etiqueta="Confirmar contraseña"
            id="registro-confirmar-contrasena"
            tipo="password"
            valor={formulario.confirmarContrasena}
            onChange={actualizarCampo('confirmarContrasena')}
            error={mostrarError('confirmarContrasena')}
            requerido
          />
        </div>

        <div className="border-t border-borde-magenta pt-5">
          <Boton tipo="submit" deshabilitado={hayErrores} className="w-full">
            Registrarse
          </Boton>
        </div>
      </form>
    </Modal>
  );
}
