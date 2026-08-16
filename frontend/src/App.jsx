
import { Routes, Route } from 'react-router-dom';
import { LayoutPrincipal } from './components/layout/LayoutPrincipal';
import { LayoutAuth } from './components/layout/LayoutAuth';
import { Inicio } from './pages/Index';
import { Contacto } from './pages/Contacto';
import { QuienesSomos } from './pages/QuienesSomos';
import { IniciarSesion } from './pages/IniciarSesion';
import { RecuperarContrasena } from './pages/RecuperarContrasena';
import { Tienda } from './pages/Tienda';

function App() {
  return (
    <Routes>
      <Route element={<LayoutPrincipal />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/quienes-somos" element={<QuienesSomos />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/tienda" element={<Tienda />} />
      </Route>

      <Route element={<LayoutAuth />}>
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
      </Route>
    </Routes>
  );
}

export default App;
