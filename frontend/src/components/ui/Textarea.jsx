export function Textarea({
  etiqueta,
  id,
  valor,
  onChange,
  placeholder,
  error,
  requerido = false,
  filas = 5,
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
      <textarea
        id={idCampo}
        value={valor}
        onChange={onChange}
        placeholder={placeholder}
        rows={filas}
        required={requerido}
        aria-invalid={!!error}
        aria-describedby={error ? `${idCampo}-error` : undefined}
        className={[
          'campo-input campo-textarea',
          error ? 'campo-input--error' : '',
        ].join(' ')}
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
