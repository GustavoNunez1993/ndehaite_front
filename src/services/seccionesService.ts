import { getAccessToken } from './authStorage';

const API_URL = import.meta.env.VITE_API_URL;

export interface Seccion {
  id: string;
  codigo: string;
  descripcion: string;
}

export interface SeccionPayload {
  codigo: string;
  descripcion: string;
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || `Error ${response.status}`);
  }

  return response;
}

export async function listarSecciones(): Promise<Seccion[]> {
  const res = await authFetch(`${API_URL}/secciones`);
  return res.json();
}

export async function obtenerSeccion(id: string): Promise<Seccion> {
  const res = await authFetch(`${API_URL}/secciones/${id}`);
  return res.json();
}

export async function crearSeccion(payload: SeccionPayload): Promise<Seccion> {
  const res = await authFetch(`${API_URL}/secciones`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function actualizarSeccion(id: string, payload: SeccionPayload): Promise<Seccion> {
  const res = await authFetch(`${API_URL}/secciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function eliminarSeccion(id: string): Promise<void> {
  await authFetch(`${API_URL}/secciones/${id}`, {
    method: 'DELETE',
  });
}