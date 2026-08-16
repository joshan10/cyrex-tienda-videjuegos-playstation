export function EncabezadoPagina({ etiqueta, titulo, subtitulo }) {
  return (
    <header className="encabezado-pagina">
      {etiqueta && <span className="encabezado-pagina__etiqueta">{etiqueta}</span>}
      <h1 className="encabezado-pagina__titulo">{titulo}</h1>
      {subtitulo && <p className="encabezado-pagina__subtitulo">{subtitulo}</p>}
      <div className="encabezado-pagina__linea" />
    </header>
  );
}
