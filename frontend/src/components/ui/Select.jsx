export function Select({
  etiqueta,
  id,
  valor,
  onChange,
  opciones = [],
  error,
  requerido = false,
  placeholder = 'Seleccionar...',
  className = '',
  ...props
}) {
  const idCampo = id ?? etiqueta?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {etiqueta && (
        <label htmlFor={idCampo} className="font-cuerpo text-sm font-medium text-blanco-frio/90">
          {etiqueta}
          {requerido && <span className="ml-1 text-magenta-vibrante">*</span>}
        </label>
      )}
      <select
        id={idCampo}
        value={valor}
        onChange={onChange}
        required={requerido}
        aria-invalid={!!error}
        aria-describedby={error ? `${idCampo}-error` : undefined}
        className={['campo-input cursor-pointer', error ? 'campo-input--error' : ''].join(' ')}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {opciones.map(({ valor: val, etiqueta: etiq }) => (
          <option key={val} value={val}>
            {etiq}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${idCampo}-error`} className="font-cuerpo text-xs text-magenta-vibrante" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
