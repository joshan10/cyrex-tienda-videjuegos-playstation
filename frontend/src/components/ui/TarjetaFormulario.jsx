export function TarjetaFormulario({ children, className = '' }) {
  return (
    <div className={`tarjeta-formulario ${className}`}>
      {children}
    </div>
  );
}
