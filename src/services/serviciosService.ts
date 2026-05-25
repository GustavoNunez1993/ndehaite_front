import {
  getAccessToken,
  getRefreshToken,
  saveSession,
  clearSession,
} from './authStorage';
import { refreshTokenRequest } from './authService';
import { showError } from '../utils/notify';

const API_URL = import.meta.env.VITE_API_URL;

export interface Servicio {
  id: string;
  codigo: string;
  descripcion: string;
}

export interface ServicioPayload {
  codigo: string;
  descripcion: string;
}

function logoutByExpiration() {
  clearSession();

  showError(
    'Sesión expirada',
    'Debes iniciar sesión nuevamente.'
  );

  setTimeout(() => {
    window.location.href = '/login';
  }, 1800);
}

async function authFetch(
  url: string,
  options: RequestInit = {},
  alreadyRetried = false
): Promise<Response> {
  const token = getAccessToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.ok) {
    return response;
  }

  if ((response.status === 401 || response.status === 403) && !alreadyRetried) {
    const currentRefreshToken = getRefreshToken();

    if (!currentRefreshToken) {
      logoutByExpiration();
      throw new Error('Sesión expirada');
    }

    try {
      const newTokens = await refreshTokenRequest(currentRefreshToken);

      if (!newTokens.accessToken || !newTokens.refreshToken) {
        logoutByExpiration();
        throw new Error('Sesión expirada');
      }

      saveSession(newTokens.accessToken, newTokens.refreshToken);

      return await authFetch(url, options, true);
    } catch (error) {
      logoutByExpiration();
      throw error instanceof Error ? error : new Error('Sesión expirada');
    }
  }

  const data = await response.json().catch(() => null);
  throw new Error(data?.message || `Error ${response.status}`);
}

export async function listarServicios(): Promise<Servicio[]> {
  const res = await authFetch(`${API_URL}/servicios`);
  return res.json();
}

export async function obtenerServicio(id: string): Promise<Servicio> {
  const res = await authFetch(`${API_URL}/servicios/${id}`);
  return res.json();
}

export async function crearServicio(payload: ServicioPayload): Promise<Servicio> {
  const res = await authFetch(`${API_URL}/servicios`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function actualizarServicio(id: string, payload: ServicioPayload): Promise<Servicio> {
  const res = await authFetch(`${API_URL}/servicios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function eliminarServicio(id: string): Promise<void> {
  await authFetch(`${API_URL}/servicios/${id}`, {
    method: 'DELETE',
  });
}
