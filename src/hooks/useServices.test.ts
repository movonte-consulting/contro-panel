import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

import { useServices } from './useServices'; // Adjust path
import { useApi } from './useApi';
import { useAuth } from './useAuth';
import { API_ENDPOINTS } from '../config/api';

// 1. Mock Dependencies
vi.mock('./useApi');
vi.mock('./useAuth');
vi.mock('../config/api', () => ({
  API_ENDPOINTS: {
    DASHBOARD: '/api/admin/dashboard',
    USER_SERVICES_LIST: '/api/user/services',
    SERVICE_UPDATE: (id: string) => `/api/admin/service/${id}`,
    USER_SERVICE_UPDATE: (id: string) => `/api/user/service/${id}`,
  },
}));

describe('useServices Hook', () => {
  const mockGet = vi.fn();
  const mockPut = vi.fn();

  // Mock Data
  const mockService = {
    serviceId: 'srv-1',
    assistantId: 'asst-1',
    assistantName: 'Bot 1',
    isActive: true,
    lastUpdated: '2023-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useApi as unknown as Mock).mockReturnValue({
      get: mockGet,
      put: mockPut,
    });
  });

  // --- INITIALIZATION ---

  it('should initialize with loading state', () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    const { result } = renderHook(() => useServices());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.services).toEqual([]);
  });

  it('should stop loading and do nothing if not authenticated', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    const { result } = renderHook(() => useServices());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockGet).not.toHaveBeenCalled();
  });

  // --- FETCHING (ADMIN vs USER) ---

  it('should fetch and parse services correctly for ADMIN', async () => {
    // 1. Auth as Admin
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'admin' },
    });

    // 2. Mock Admin Response (Nested structure)
    mockGet.mockResolvedValue({
      success: true,
      data: {
        serviceConfigurations: [mockService],
      },
    });

    const { result } = renderHook(() => useServices());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.DASHBOARD);
    expect(result.current.services).toHaveLength(1);
    expect(result.current.services[0].serviceId).toBe('srv-1');
  });

  it('should fetch and parse services correctly for USER', async () => {
    // 1. Auth as User
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'user' },
    });

    // 2. Mock User Response (Direct array or .data wrapper)
    mockGet.mockResolvedValue({
      success: true,
      data: [mockService],
    });

    const { result } = renderHook(() => useServices());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.USER_SERVICES_LIST);
    expect(result.current.services).toHaveLength(1);
  });

  it('should handle fetch errors', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'user' },
    });

    mockGet.mockResolvedValue({
      success: false,
      error: 'Fetch failed',
    });

    const { result } = renderHook(() => useServices());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toContain('Fetch failed');
    expect(result.current.services).toEqual([]);
  });

  // --- UPDATE SERVICE ---

  it('should update service successfully (Optimistic Update)', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'admin' },
    });

    // Initial Load
    mockGet.mockResolvedValue({ success: true, data: { serviceConfigurations: [mockService] } });
    const { result } = renderHook(() => useServices());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Mock Update Success
    mockPut.mockResolvedValue({ success: true });

    let success;
    await act(async () => {
      success = await result.current.updateService('srv-1', 'asst-new', 'New Bot');
    });

    // Verify API call to Admin Endpoint
    expect(mockPut).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/service/srv-1'),
      expect.objectContaining({ assistantId: 'asst-new', assistantName: 'New Bot' })
    );

    expect(success).toBe(true);
    // Verify Local State Update
    expect(result.current.services[0].assistantName).toBe('New Bot');
    expect(result.current.services[0].assistantId).toBe('asst-new');
  });

  it('should validate inputs before updating', async () => {
    (useAuth as unknown as Mock).mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockGet.mockResolvedValue({ success: true, data: [] });
    
    const { result } = renderHook(() => useServices());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let success;
    await act(async () => {
      // Missing assistantName
      success = await result.current.updateService('srv-1', 'id', '');
    });

    expect(success).toBe(false);
    expect(result.current.error).toContain('requeridos');
    expect(mockPut).not.toHaveBeenCalled();
  });

  // --- TOGGLE SERVICE ---

  it('should toggle service active state successfully', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'user' },
    });

    // Initial Load
    mockGet.mockResolvedValue({ success: true, data: [mockService] }); // Active is true
    const { result } = renderHook(() => useServices());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Mock Toggle Success
    mockPut.mockResolvedValue({ success: true });

    let success;
    await act(async () => {
      success = await result.current.toggleService('srv-1', false);
    });

    // Verify API call to User Endpoint
    expect(mockPut).toHaveBeenCalledWith(
      expect.stringContaining('/api/user/service/srv-1'),
      { isActive: false }
    );

    expect(success).toBe(true);
    // Verify Local State Update
    expect(result.current.services[0].isActive).toBe(false);
  });

  it('should handle toggle errors', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'user' },
    });

    mockGet.mockResolvedValue({ success: true, data: [mockService] });
    const { result } = renderHook(() => useServices());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockPut.mockResolvedValue({ success: false, error: 'Cannot toggle' });

    let success;
    await act(async () => {
      success = await result.current.toggleService('srv-1', false);
    });

    expect(success).toBe(false);
    expect(result.current.error).toContain('Cannot toggle');
    // State should NOT change
    expect(result.current.services[0].isActive).toBe(true);
  });
 
  it('should not fetch if refetch is called while unauthenticated', async () => {
  
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    const { result } = renderHook(() => useServices());
    
   
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    
    await act(async () => {
      await result.current.refetch();
    });

    expect(mockGet).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });
  
  it('should handle unexpected network exceptions during fetch (Admin context)', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'admin' },
    });

    
    mockGet.mockRejectedValue(new Error('Network Error'));
    const { result } = renderHook(() => useServices());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toContain('Error de conexión al obtener los servicios del sistema');
    expect(result.current.services).toEqual([]);
  });

  it('should handle unexpected network exceptions during fetch (User context)', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'user' },
    });

    mockGet.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useServices());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    
    expect(result.current.error).toContain('Error de conexión al obtener los servicios del usuario');
  });
  
  it('should handle API failure response during update', async () => {
    (useAuth as unknown as Mock).mockReturnValue({ isAuthenticated: true, user: { role: 'admin' } });
    mockGet.mockResolvedValue({ success: true, data: { serviceConfigurations: [mockService] } });
    
    const { result } = renderHook(() => useServices());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

   
    mockPut.mockResolvedValue({ success: false, error: 'DB Error' });

    let success;
    await act(async () => {
      success = await result.current.updateService('srv-1', 'new-id', 'new-name');
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('DB Error'); // O el mensaje default
  });

  it('should handle network exception during update', async () => {
    (useAuth as unknown as Mock).mockReturnValue({ isAuthenticated: true, user: { role: 'admin' } });
    mockGet.mockResolvedValue({ success: true, data: { serviceConfigurations: [mockService] } });
    
    const { result } = renderHook(() => useServices());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

   
    mockPut.mockRejectedValue(new Error('Network Crash'));

    let success;
    await act(async () => {
      success = await result.current.updateService('srv-1', 'new-id', 'new-name');
    });

    expect(success).toBe(false);
   
    expect(result.current.error).toContain('Error de conexión al actualizar el servicio del sistema');
  });
  
  it('should handle network exception during toggle', async () => {
    (useAuth as unknown as Mock).mockReturnValue({ isAuthenticated: true, user: { role: 'user' } });
    mockGet.mockResolvedValue({ success: true, data: [mockService] });
    
    const { result } = renderHook(() => useServices());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

   
    mockPut.mockRejectedValue(new Error('Network Crash'));

    let success;
    await act(async () => {
      success = await result.current.toggleService('srv-1', false);
    });

    expect(success).toBe(false);
   
    expect(result.current.error).toContain('Error de conexión al cambiar el estado del servicio del usuario');
  });
  it('should parse user services wrapped in data property', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      user: { role: 'user' },
    });

   
    mockGet.mockResolvedValue({
      success: true,
      data: { data: [mockService] }, 
    });

    const { result } = renderHook(() => useServices());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.services).toHaveLength(1);
    expect(result.current.services[0].serviceId).toBe('srv-1');
  });
});