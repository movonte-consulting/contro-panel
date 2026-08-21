const TOKEN_KEY = 'authToken';
const USER_KEY = 'userData';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/** Devuelve el JSON crudo del usuario persistido, sin parsear (o null si no hay nada guardado). */
export const getStoredUserRaw = (): string | null => localStorage.getItem(USER_KEY);

export const getStoredUser = <T = unknown>(): T | null => {
  const raw = getStoredUserRaw();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    return null;
  }
};

export const setStoredUser = (user: unknown): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredUser = (): void => {
  localStorage.removeItem(USER_KEY);
};
