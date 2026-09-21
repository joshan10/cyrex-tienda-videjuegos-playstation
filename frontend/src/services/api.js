const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

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

  if (response.status === 204) return null;

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
  verifyEmail: (correo) =>
    request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ correo })
    }),

  login: (token, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ token, password })
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
  changeStatus: (id, estado) =>
    request(`/usuarios/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado })
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
  changeStatus: (id, estado) =>
    request(`/productos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado })
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

// =====================================================
// PAGOS (STRIPE)
// =====================================================
export const pagosAPI = {
  create: (data) =>
    request('/pagos', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getById: (id) => request(`/pagos/${id}`),
  getByOrden: (ordenId) => request(`/pagos/orden/${ordenId}`),
  simularExito: (sessionId) =>
    request('/pagos/simular-exito', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId })
    })
};

// =====================================================
// VENTAS / FACTURACIÓN
// =====================================================
export const ventasAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.append(key, val);
    });
    const query = params.toString();
    return request(`/ventas${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/ventas/${id}`),
  getByNumero: (numero) => request(`/ventas/factura/${numero}`),
  getMine: () => request('/ventas/mis-facturas'),
  create: (data) =>
    request('/ventas', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  update: (id, data) =>
    request(`/ventas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
  getStats: () => request('/ventas/stats/dashboard'),
  getReporteDiario: (fechaInicio, fechaFin) => {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);
    const query = params.toString();
    return request(`/ventas/reporte/diario${query ? `?${query}` : ''}`);
  },
  getReporteDetallado: (fechaInicio, fechaFin) => {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);
    const query = params.toString();
    return request(`/ventas/reporte/detallado${query ? `?${query}` : ''}`);
  },
  downloadExcel: async (fechaInicio, fechaFin) => {
    const token = localStorage.getItem('cyrex_token');
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);
    const query = params.toString();
    const response = await fetch(`${API_URL}/ventas/reporte/excel${query ? `?${query}` : ''}`, {
      headers: { ...(token && { Authorization: `Bearer ${token}` }) }
    });
    if (!response.ok) throw { status: response.status, error: 'Error descargando Excel' };
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte_ventas_cyrex.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  downloadPdf: async (fechaInicio, fechaFin) => {
    const token = localStorage.getItem('cyrex_token');
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);
    const query = params.toString();
    const response = await fetch(`${API_URL}/ventas/reporte/pdf${query ? `?${query}` : ''}`, {
      headers: { ...(token && { Authorization: `Bearer ${token}` }) }
    });
    if (!response.ok) throw { status: response.status, error: 'Error descargando PDF' };
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte_ventas_cyrex.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  downloadInvoicePdf: async (numeroFactura) => {
    const token = localStorage.getItem('cyrex_token');
    const response = await fetch(`${API_URL}/ventas/factura/${encodeURIComponent(numeroFactura)}/pdf`, {
      headers: { ...(token && { Authorization: `Bearer ${token}` }) }
    });
    if (!response.ok) throw { status: response.status, error: 'Error descargando factura PDF' };
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factura_${numeroFactura}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

// =====================================================
// PQR Y CHATBOT
// =====================================================
export const pqrAPI = {
  getAll: (estado = '') => request(`/pqr${estado ? `?estado=${encodeURIComponent(estado)}` : ''}`),
  getById: (id) => request(`/pqr/${id}`),
  create: (data) => request('/pqr', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/pqr/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getSummary: () => request('/pqr/resumen')
};

export const chatbotAPI = {
  send: (mensaje, conversacionId = null) => request('/chatbot/message', {
    method: 'POST',
    body: JSON.stringify({ mensaje, conversacion_id: conversacionId })
  }),
  getHistory: (conversationId) => request(`/chatbot/${conversationId}`)
};
