import { getAccessToken } from './authStorage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8084/api';

export interface RucData {
  ruc: string;
  persona: string;
  estado: string;
  esFacturador: string;
}

export async function consultarRuc(ruc: string): Promise<RucData> {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('No autenticado. Por favor inicie sesión.');
  }

  if (!ruc || ruc.trim().length === 0) {
    throw new Error('Ingrese un número de documento válido.');
  }

  try {
    const response = await fetch(`${API_URL}/ruc/${ruc}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `Error al consultar RUC: ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al conectar con el servidor. Intente nuevamente.');
  }
}
