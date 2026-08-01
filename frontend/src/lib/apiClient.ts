// src/lib/apiClient.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

// Retrieve token from local storage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('bcsithub_token');
};

// Save token and user details to local storage
export const setAuthSession = (token: string | null, user: any | null) => {
  if (token) {
    localStorage.setItem('bcsithub_token', token);
  } else {
    localStorage.removeItem('bcsithub_token');
  }

  if (user) {
    localStorage.setItem('bcsithub_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('bcsithub_user');
  }
};

// Core fetch client wrapper
async function request(path: string, options: RequestOptions = {}) {
  const url = `${API_BASE_URL}${path}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // JSON parsing failed, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  // Handle empty or text responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

export const apiClient = {
  get: (path: string, options: RequestOptions = {}) => {
    return request(path, {
      ...options,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  },

  post: (path: string, body: any, options: RequestOptions = {}) => {
    return request(path, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(body),
    });
  },

  put: (path: string, body: any, options: RequestOptions = {}) => {
    return request(path, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(body),
    });
  },

  delete: (path: string, options: RequestOptions = {}) => {
    return request(path, {
      ...options,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  },

  // Multipart helper for file uploads
  postMultipart: (path: string, formData: FormData, options: RequestOptions = {}) => {
    return request(path, {
      ...options,
      method: 'POST',
      body: formData,
      // Note: Do NOT set Content-Type header manually for FormData.
      // The browser needs to set it automatically to include the boundary parameter.
    });
  },
};
