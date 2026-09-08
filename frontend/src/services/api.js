const API_URL = 'http://localhost:4000/api';

/**
 * Helper para realizar peticiones HTTP al backend
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('cyrex_token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error('API Error:', errorData);
    throw { status: response.status, ...errorData };
  }

  const data = await response.json();
  return data;
}

export const uploadAPI = {
  uploadImage: async (file) => {
    const token = localStorage.getItem('cyrex_token');
    const formData = new FormData();
    formData.append('imagen', file);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) throw { status: response.status, ...data };
    return data;
  }
};

// =====================================================
// AUTH
// =====================================================
export const authAPI = {
  login: (correo, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo, password })
    }),

  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  getProfile: () => request('/auth/me'),

  forgotPassword: (correo) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ correo })
    }),

  resetPassword: (token, password) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password })
    })
};

// =====================================================
// USUARIOS
// =====================================================
export const usuariosAPI = {
  getAll: () => request('/usuarios'),
  getById: (id) => request(`/usuarios/${id}`),
  create: (data) =>
    request('/usuarios', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  update: (id, data) =>
    request(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  remove: (id) =>
    request(`/usuarios/${id}`, { method: 'DELETE' })
};

// =====================================================
// PRODUCTOS
// =====================================================
export const productosAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.append(key, val);
    });
    const query = params.toString();
    return request(`/productos${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/productos/${id}`),
  create: (data) =>
    request('/productos', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  update: (id, data) =>
    request(`/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  remove: (id) =>
    request(`/productos/${id}`, { method: 'DELETE' })
};

// =====================================================
// CATEGORIAS
// =====================================================
export const categoriasAPI = {
  getAll: () => request('/categorias'),
  getById: (id) => request(`/categorias/${id}`)
};

// =====================================================
// ORDENES
// =====================================================
export const ordenesAPI = {
  getAll: () => request('/ordenes'),
  getById: (id) => request(`/ordenes/${id}`),
  create: (data) =>
    request('/ordenes', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateEstado: (id, estado) =>
    request(`/ordenes/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado })
    }),
  getStats: () => request('/ordenes/stats/ventas')
};

// =====================================================
// SERVICIOS
// =====================================================
export const serviciosAPI = {
  getAll: () => request('/servicios'),
  getById: (id) => request(`/servicios/${id}`)
};
