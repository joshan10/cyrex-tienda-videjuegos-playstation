export function ContenedorPagina({ children, className = '', ancho = '7xl' }) {
  const anchos = {
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    '2xl': 'max-w-2xl',
    md: 'max-w-md',
  };

  return (
    <div className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${anchos[ancho] ?? anchos['7xl']} ${className}`}>
      {children}
    </div>
  );
}
