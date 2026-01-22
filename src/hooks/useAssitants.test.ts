import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { useAssistants } from './useAssistants'; // Ajusta la ruta
import { useApi } from './useApi';
import { useAuth } from './useAuth';
import { API_ENDPOINTS } from '../config/api';

// 1. Mock de las dependencias
vi.mock('./useApi');
vi.mock('./useAuth');

// 2. Mock de la configuración de endpoints
vi.mock('../config/api', () => ({
  API_ENDPOINTS: {
    DASHBOARD: '/api/admin/dashboard',
    USER_ASSISTANTS: '/api/user/assistants',
  },
}));

describe('useAssistants Hook', () => {
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Configuración base de useApi
    (useApi as unknown as Mock).mockReturnValue({
      get: mockGet,
    });
  });

  it('debe inicializarse en loading true y arrays vacíos', () => {
    // Simulamos que auth aún está cargando
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });

    const { result } = renderHook(() => useAssistants());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.assistants).toEqual([]);
    expect(result.current.totalAssistants).toBe(0);
  });

  it('debe detener la carga y limpiar datos si el usuario NO está autenticado', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false, // Auth terminó
      user: null,
    });

    const { result } = renderHook(() => useAssistants());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.assistants).toEqual([]);
    expect(mockGet).not.toHaveBeenCalled();
  });

  // --- ESCENARIO: ADMIN ---

  it('debe hacer fetch al endpoint de ADMIN y parsear la estructura del dashboard correctamente', async () => {
    // 1. Mock Auth como ADMIN
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'admin' },
    });

    // 2. Mock Respuesta API (Estructura de dashboard admin)
    const mockAdminData = {
      assistants: [
        { id: '1', name: 'Admin Bot', model: 'gpt-4', isActive: true }
      ],
      projects: [],
      // ... otros campos del dashboard
    };

    mockGet.mockResolvedValue({
      success: true,
      data: mockAdminData,
    });

    const { result } = renderHook(() => useAssistants());

    // Esperar a que isLoading pase a false (fetch terminado)
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Verificaciones
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.DASHBOARD);
    expect(result.current.assistants).toHaveLength(1);
    expect(result.current.assistants[0].name).toBe('Admin Bot');
    expect(result.current.totalAssistants).toBe(1);
    expect(result.current.error).toBeNull();
  });

  // --- ESCENARIO: USER (NORMAL) ---

  it('debe hacer fetch al endpoint de USER y parsear la estructura de array correctamente', async () => {
    // 1. Mock Auth como USER
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'user' },
    });

    // 2. Mock Respuesta API (Estructura de usuario: array directo o envuelto en data)
    const mockUserData = [
      { id: '2', name: 'User Bot', model: 'gpt-3.5', isActive: true }
    ];

    mockGet.mockResolvedValue({
      success: true,
      data: mockUserData, // El hook maneja si viene directo o anidado
    });

    const { result } = renderHook(() => useAssistants());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.USER_ASSISTANTS);
    expect(result.current.assistants).toHaveLength(1);
    expect(result.current.assistants[0].name).toBe('User Bot');
  });

  // --- ESCENARIO: ERROR ---

  it('debe manejar errores de la API correctamente', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'user' },
    });

    mockGet.mockResolvedValue({
      success: false,
      error: 'Error interno del servidor',
    });

    const { result } = renderHook(() => useAssistants());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toContain('Error interno del servidor'); // O el mensaje fallback del hook
    expect(result.current.assistants).toEqual([]);
  });

  it('debe manejar excepciones (catch) en la llamada API', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'admin' },
    });

    mockGet.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useAssistants());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toContain('Error de conexión');
  });

 it('debe permitir hacer refetch manualmente', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'user' },
    });

    mockGet.mockResolvedValue({ success: true, data: [] });

    const { result } = renderHook(() => useAssistants());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockGet.mockClear();
    mockGet.mockResolvedValue({ 
      success: true, 
      data: [{ id: '99', name: 'Refetched Bot', model: 'gpt-4', isActive: true }] 
    });
    await result.current.refetch();
    await waitFor(() => {

      expect(result.current.assistants.length).toBeGreaterThan(0);
    });


    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(result.current.assistants[0].name).toBe('Refetched Bot');
  });
});