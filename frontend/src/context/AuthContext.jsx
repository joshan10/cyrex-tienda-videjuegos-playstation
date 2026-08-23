import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app, verificar si hay un token guardado
  useEffect(() => {
    const token = localStorage.getItem('cyrex_token');
    if (token) {
      authAPI.getProfile()
        .then((data) => setUser(data.user))
        .catch(() => {
          localStorage.removeItem('cyrex_token');
          localStorage.removeItem('cyrex_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (correo, password) => {
    const data = await authAPI.login(correo, password);
    localStorage.setItem('cyrex_token', data.token);
    localStorage.setItem('cyrex_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authAPI.register(userData);
    localStorage.setItem('cyrex_token', data.token);
    localStorage.setItem('cyrex_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('cyrex_token');
    localStorage.removeItem('cyrex_user');
    setUser(null);
  };

  const value = { user, loading, login, register, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
