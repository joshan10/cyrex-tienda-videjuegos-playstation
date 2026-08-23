
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import WhatsAppButton from './components/WhatsAppButton';
import Contacto from './pages/Contacto';
import Index from './pages/Index';
import IniciarSesion from './pages/IniciarSesion';
import QuienesSomos from './pages/QuienesSomos';
import RecoverPassword from './pages/RecoverPassword';

// Dashboards
import AdminDashboard from './pages/dashboard/AdminDashboard';
import EmpleadoDashboard from './pages/dashboard/EmpleadoDashboard';
import ClienteDashboard from './pages/dashboard/ClienteDashboard';
import Tienda from './pages/Tienda';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        <Route path="/recuperar-contrasena" element={<RecoverPassword />} />
        <Route path="/recover-password" element={<RecoverPassword />} />
        <Route path="/quienes-somos" element={<QuienesSomos />} />
        <Route path="/contacto" element={<Contacto />} />

        {/* Protected Routes */}
        <Route
          path="/tienda"
          element={
            <ProtectedRoute>
              <Tienda />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['Administrador']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/empleado"
          element={
            <ProtectedRoute allowedRoles={['Empleado']}>
              <EmpleadoDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/cliente"
          element={
            <ProtectedRoute allowedRoles={['Cliente']}>
              <ClienteDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <WhatsAppButton />
    </AuthProvider>
  );
}

export default App;
