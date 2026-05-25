import {
  getAccessToken,
  getRefreshToken,
  saveSession,
  clearSession,
} from './authStorage';
import { refreshTokenRequest } from './authService';
import { showError } from '../utils/notify';

const API_URL = import.meta.env.VITE_API_URL;

export type PrioridadTurno = 'NORMAL' | 'PREFERENCIAL' | 'VIP' | 'URGENTE';

export interface CrearTurnoPayload {
  numeroTurno: string;
  prefijo?: string;
  numeroSecuencia: number;
  seccionId: string;
  prioridadTurno?: PrioridadTurno;
  nombreCliente?: string;
  documentoCliente?: string;
  observacion?: string;
}

export interface ModificarTurnoPayload {
  prioridadTurno?: PrioridadTurno;
  nombreCliente?: string;
  documentoCliente?: string;
  observacion?: string;
}

export interface Turno {
  id: string;
  numeroTurno: string;
  prefijo?: string;
  numeroSecuencia: number;
  fechaTurno?: string;
  fechaHoraEmision?: string;
  fechaHoraLlamado?: string;
  estadoTurno: string;
  prioridadTurno: PrioridadTurno;
  nombreCliente?: string;
  documentoCliente?: string;
  observacion?: string;
  moduloActual?: string;
  pantallaDestino?: string;
  seccionId: string;
  seccionDescripcion?: string;
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

export async function crearTurno(payload: CrearTurnoPayload): Promise<Turno> {
  const res = await authFetch(`${API_URL}/turnos`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return res.json();
}

export async function listarTurnos(): Promise<Turno[]> {
  const res = await authFetch(`${API_URL}/turnos`);
  return res.json();
}

export async function modificarTurno(id: string, payload: ModificarTurnoPayload): Promise<Turno> {
  const res = await authFetch(`${API_URL}/turnos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return res.json();
}

export async function llamarTurno(id: string): Promise<Turno> {
  const res = await authFetch(`${API_URL}/turnos/${id}/llamar`, {
    method: 'PUT',
    body: JSON.stringify({
      moduloActual: 'MOSTRADOR',
      pantallaDestino: 'SALA_PRINCIPAL',
    }),
  });

  return res.json();
}

export async function anularTurno(id: string, observacion = 'Turno anulado desde administración'): Promise<Turno> {
  const res = await authFetch(`${API_URL}/turnos/${id}/cancelar`, {
    method: 'PUT',
    body: JSON.stringify({ observacion }),
  });

  return res.json();
}

export async function marcarTurnoAusente(id: string, observacion = 'Cliente no se presentó'): Promise<Turno> {
  const res = await authFetch(`${API_URL}/turnos/${id}/ausente`, {
    method: 'PUT',
    body: JSON.stringify({ observacion }),
  });

  return res.json();
}

export async function listarTurnosPorSeccionYFecha(
  seccionId: string,
  fecha: string
): Promise<Turno[]> {
  const res = await authFetch(`${API_URL}/turnos/seccion/${seccionId}/fecha/${fecha}`);
  return res.json();
}
