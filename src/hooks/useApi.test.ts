import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import { useApi } from './useApi'; // Ajusta la ruta si es necesario
import { useAuth } from './useAuth';

// 1. Mock de useAuth
vi.mock('./useAuth', () => ({
  useAuth: vi.fn(),
}));

// 2. Mock global de fetch
const globalFetch = vi.fn();
vi.stubGlobal('fetch', globalFetch);

describe('useApi Hook', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Configuración por defecto: Usuario autenticado
    (useAuth as unknown as Mock).mockReturnValue({
      token: 'fake-token-123',
      logout: mockLogout,
    });
  });

  // --- TESTS DE CONFIGURACIÓN Y HEADERS ---

  it('debe incluir el token en los headers si existe y requireAuth es true', async () => {
    globalFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useApi());
    await result.current.get('/test');

    expect(globalFetch).toHaveBeenCalledWith(
      '/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer fake-token-123',
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('NO debe incluir el token si requireAuth es false', async () => {
    globalFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useApi());
    await result.current.get('/public', { requireAuth: false });

    // Verificamos los headers de la llamada
    const callArgs = globalFetch.mock.calls[0][1];
    expect(callArgs.headers).not.toHaveProperty('Authorization');
  });

  // --- TESTS DE MÉTODOS HTTP (GET, POST, ETC) ---

  it('debe enviar el body stringificado en peticiones POST', async () => {
    globalFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useApi());
    const payload = { name: 'Test' };
    
    await result.current.post('/users', payload);

    expect(globalFetch).toHaveBeenCalledWith(
      '/users',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
      })
    );
  });

  // --- TESTS DE VALIDACIÓN DE TOKEN ANTES DEL FETCH ---

  it('debe retornar error si no hay token y requireAuth es true (endpoint normal)', async () => {
    // Simulamos usuario no logueado
    (useAuth as unknown as Mock).mockReturnValue({
      token: null,
      logout: mockLogout,
    });

    const { result } = renderHook(() => useApi());
    const response = await result.current.get('/dashboard');

    expect(response.success).toBe(false);
    expect(response.error).toContain('No autenticado');
    expect(globalFetch).not.toHaveBeenCalled(); // No debe ni intentar llamar al server
    expect(mockLogout).not.toHaveBeenCalled(); // No debe hacer logout porque no es endpoint crítico
  });

  it('debe llamar a logout si no hay token y se intenta acceder a /profile', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      token: null,
      logout: mockLogout,
    });

    const { result } = renderHook(() => useApi());
    const response = await result.current.get('/profile');

    expect(response.success).toBe(false);
    expect(mockLogout).toHaveBeenCalled(); // Endpoint crítico
  });

  // --- TESTS DE RESPUESTAS DEL SERVIDOR (401, 500, OK) ---

  it('debe manejar respuesta 401 en endpoint crítico (debe hacer logout)', async () => {
    // El servidor responde que el token expiró
    globalFetch.mockResolvedValue({
      status: 401,
      ok: false,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useApi());
    const response = await result.current.get('/auth/verify');

    expect(mockLogout).toHaveBeenCalled();
    expect(response.success).toBe(false);
    expect(response.error).toContain('Sesión expirada');
  });

  it('debe manejar respuesta 401 en endpoint NO crítico (NO debe hacer logout)', async () => {
    globalFetch.mockResolvedValue({
      status: 401,
      ok: false,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useApi());
    const response = await result.current.get('/dashboard/stats');

    expect(mockLogout).not.toHaveBeenCalled(); // Diferencia clave con el test anterior
    expect(response.success).toBe(false);
    expect(response.error).toContain('Token inválido o expirado');
  });

  it('debe manejar errores genéricos del servidor (500)', async () => {
    globalFetch.mockResolvedValue({
      status: 500,
      statusText: 'Internal Server Error',
      ok: false,
      json: async () => ({ error: 'Database connection failed' }),
    });

    const { result } = renderHook(() => useApi());
    const response = await result.current.get('/data');

    expect(response.success).toBe(false);
    expect(response.error).toBe('Database connection failed');
  });

  it('debe manejar errores de parsing JSON (respuesta inválida)', async () => {
    // El servidor devuelve HTML o texto plano en lugar de JSON
    globalFetch.mockResolvedValue({
      status: 200,
      statusText: 'OK',
      ok: true,
      json: async () => { throw new Error('Invalid JSON'); },
    });

    const { result } = renderHook(() => useApi());
    const response = await result.current.get('/data');

    expect(response.success).toBe(false);
    expect(response.error).toContain('Error 200: OK'); // Fallback error
  });

  it('debe manejar errores de red (fetch throw error)', async () => {
    globalFetch.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useApi());
    const response = await result.current.get('/data');

    expect(response.success).toBe(false);
    expect(response.error).toContain('Error de conexión');
  });

  it('debe devolver data correctamente cuando todo va bien', async () => {
    const mockData = { id: 1, title: 'Success' };
    globalFetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useApi());
    const response = await result.current.get('/items');

    expect(response).toEqual(mockData);
  });
});