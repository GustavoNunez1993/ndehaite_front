export type SigninRequest = {
  username: string;
  password: string;
};

export type SigninResponse = {
  accessToken: string;
  refreshToken: string;
  [key: string]: unknown;
};

const API_URL = import.meta.env.VITE_API_URL;

export async function signin(payload: SigninRequest): Promise<SigninResponse> {
  const response = await fetch(`${API_URL}/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'No se pudo iniciar sesión');
  }

  return data as SigninResponse;
}

export async function refreshToken(refreshTokenValue: string) {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refreshToken: refreshTokenValue,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'No se pudo refrescar el token');
  }

  return data;
}