export function Input({
  etiqueta,
  id,
  tipo = 'text',
  valor,
  onChange,
  placeholder,
  error,
  requerido = false,
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
      <input
        id={idCampo}
        type={tipo}
        value={valor}
        onChange={onChange}
        placeholder={placeholder}
        required={requerido}
        aria-invalid={!!error}
        aria-describedby={error ? `${idCampo}-error` : undefined}
        className={['campo-input', error ? 'campo-input--error' : ''].join(' ')}
        {...props}
      />
      {error && (
        <p id={`${idCampo}-error`} className="font-cuerpo text-xs text-magenta-vibrante" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
