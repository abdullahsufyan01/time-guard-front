const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = {
  get: async (endpoint: string, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },

  post: async (endpoint: string, data: any, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },

  put: async (endpoint: string, data: any, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },

  delete: async (endpoint: string, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  },
};
