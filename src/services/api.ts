import { clearSession } from './authStorage';
import { showError } from '../utils/notify';

const API_URL = import.meta.env.VITE_API_URL;

type ApiOptions = RequestInit & {
  skipAuthRedirect?: boolean;
};

async function api(path: string, options: ApiOptions = {}): Promise<Response> {
  const { skipAuthRedirect = false, headers, ...requestOptions } = options;
  const token = localStorage.getItem('accessToken');

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!skipAuthRedirect && (response.status === 401 || response.status === 403)) {
    clearSession();
    showError('Sesión expirada', 'Debes iniciar sesión nuevamente.');

    setTimeout(() => {
      window.location.href = '/login';
    }, 800);
  }

  return response;
}

export default api;
