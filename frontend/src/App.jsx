
import { Navigate, Route, Routes } from 'react-router-dom';
import Contacto from './pages/Contacto';
import Index from './pages/Index';
import IniciarSesion from './pages/IniciarSesion';
import QuienesSomos from './pages/QuienesSomos';
import RecoverPassword from './pages/RecoverPassword';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/iniciar-sesion" element={<IniciarSesion />} />
      <Route path="/recuperar-contrasena" element={<RecoverPassword />} />
      <Route path="/recover-password" element={<RecoverPassword />} />
      <Route path="/quienes-somos" element={<QuienesSomos />} />
      <Route path="/contacto" element={<Contacto />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
