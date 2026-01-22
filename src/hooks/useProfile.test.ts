import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { useProfile } from './useProfile'; // Ajusta la ruta
import { useApi } from './useApi';
import { useAuth } from './useAuth';
import { API_ENDPOINTS } from '../config/api';

// 1. Mock de dependencias
vi.mock('./useApi');
vi.mock('./useAuth');
vi.mock('../config/api', () => ({
  API_ENDPOINTS: {
    PROFILE: '/api/profile',
  },
}));

// Mock Data
const mockUserProfile = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: 'admin',
  permissions: {
    serviceManagement: true,
    automaticAIDisableRules: true,
    webhookConfiguration: true,
    ticketControl: true,
    aiEnabledProjects: true,
    remoteServerIntegration: true,
  },
  lastLogin: '2023-01-01',
  createdAt: '2022-01-01',
  organizationLogo: 'logo.png',
};

describe('useProfile Hook', () => {
  const mockGet = vi.fn();
  const mockPut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Configuración base de los mocks
    (useApi as unknown as Mock).mockReturnValue({
      get: mockGet,
      put: mockPut,
    });
  });

  // --- TESTS DE INICIALIZACIÓN ---

  it('debe iniciar en estado de carga', () => {
    // Simulamos que auth aún está cargando
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    const { result } = renderHook(() => useProfile());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.profile).toBeNull();
  });

  it('debe detener la carga y no hacer fetch si NO está autenticado', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false, // Auth terminó
    });

    const { result } = renderHook(() => useProfile());

    // Esperamos a que el efecto corra
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.profile).toBeNull();
    expect(mockGet).not.toHaveBeenCalled();
  });

  // --- TESTS DE FETCH (GET) ---

  it('debe obtener el perfil exitosamente cuando está autenticado', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    mockGet.mockResolvedValue({
      success: true,
      data: { user: mockUserProfile },
    });

    const { result } = renderHook(() => useProfile());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.PROFILE);
    expect(result.current.profile).toEqual(mockUserProfile);
    expect(result.current.error).toBeNull();
  });

  it('debe manejar errores de la API al obtener perfil', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    mockGet.mockResolvedValue({
      success: false,
      error: 'Usuario no encontrado',
    });

    const { result } = renderHook(() => useProfile());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBe('Usuario no encontrado');
  });

  it('debe manejar errores de red (catch) al obtener perfil', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    mockGet.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useProfile());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toContain('Error de conexión');
  });

  // --- TESTS DE UPDATE (PUT) ---

  it('debe actualizar el perfil exitosamente', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    // 1. Carga inicial exitosa
    mockGet.mockResolvedValue({ success: true, data: { user: mockUserProfile } });
    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // 2. Preparamos el mock de actualización
    const updatedData = { ...mockUserProfile, username: 'Updated Name' };
    mockPut.mockResolvedValue({
      success: true,
      data: { user: updatedData },
    });

    // 3. Ejecutamos updateProfile
    let success;
    await act(async () => {
      success = await result.current.updateProfile({ username: 'Updated Name' });
    });

    expect(mockPut).toHaveBeenCalledWith(API_ENDPOINTS.PROFILE, { username: 'Updated Name' });
    expect(success).toBe(true);
    
    // Verificamos que el estado local se actualizó con la respuesta del PUT
    expect(result.current.profile?.username).toBe('Updated Name');
    expect(result.current.error).toBeNull();
  });

  it('debe manejar errores al actualizar el perfil', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    // Carga inicial para tener datos previos
    mockGet.mockResolvedValue({ success: true, data: { user: mockUserProfile } });
    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Mock error en PUT
    mockPut.mockResolvedValue({
      success: false,
      error: 'Email ya existe',
    });

    let success;
    await act(async () => {
      success = await result.current.updateProfile({ email: 'duplicate@test.com' });
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('Email ya existe');
    
    // El perfil no debió cambiar
    expect(result.current.profile?.email).toBe('test@example.com');
  });

  it('debe manejar excepciones de red al actualizar', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    
    // Carga inicial
    mockGet.mockResolvedValue({ success: true, data: { user: mockUserProfile } });
    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockPut.mockRejectedValue(new Error('Network Fail'));

    let success;
    await act(async () => {
      success = await result.current.updateProfile({ username: 'Fail' });
    });

    expect(success).toBe(false);
    expect(result.current.error).toContain('Error de conexión');
  });

  // --- TESTS DE REFETCH ---

  it('debe permitir recargar el perfil manualmente (refetch)', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    // 1. Primera carga
    mockGet.mockResolvedValueOnce({ success: true, data: { user: mockUserProfile } });
    
    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.profile?.username).toBe('testuser');

    // 2. Segunda carga (refetch) con datos nuevos
    const newData = { ...mockUserProfile, username: 'Refetched User' };
    mockGet.mockResolvedValueOnce({ success: true, data: { user: newData } });

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(result.current.profile?.username).toBe('Refetched User');
  });
});