import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { useWebhooks } from './useWebhooks';
import { useApi } from './useApi';
import { useAuth } from './useAuth';
import { API_ENDPOINTS } from '../config/api';

// 1. Mock Dependencies
vi.mock('./useApi');
vi.mock('./useAuth');

// 2. Mock Config
vi.mock('../config/api', () => ({
  API_ENDPOINTS: {
    WEBHOOK_STATUS: '/api/admin/status',
    WEBHOOKS_SAVED: '/api/admin/saved',
    WEBHOOK_CONFIGURE: '/api/admin/configure',
    WEBHOOK_TEST: '/api/admin/test',
    WEBHOOK_DISABLE: '/api/admin/disable',
    WEBHOOK_FILTER: '/api/admin/filter',
    WEBHOOKS_SAVE: '/api/admin/save',
    WEBHOOKS_DELETE: (id: string) => `/api/admin/delete/${id}`,
    
    USER_WEBHOOK_STATUS: '/api/user/status',
    USER_WEBHOOKS_SAVED: '/api/user/saved',
    USER_WEBHOOK_CONFIGURE: '/api/user/configure',
    USER_WEBHOOK_TEST: '/api/user/test',
    USER_WEBHOOK_DISABLE: '/api/user/disable',
    USER_WEBHOOK_FILTER: '/api/user/filter',
    USER_WEBHOOKS_SAVE: '/api/user/save',
    USER_WEBHOOKS_UPDATE: (id: string) => `/api/user/update/${id}`,
    USER_WEBHOOKS_DELETE: (id: string) => `/api/user/delete/${id}`,
  },
}));

describe('useWebhooks Hook', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  const mockDelete = vi.fn();

  const mockStatus = { isEnabled: true, webhookUrl: 'http://test.com', filterEnabled: false };
  const mockSavedWebhook = { id: 1, name: 'Saved Hook', url: 'http://saved.com', isEnabled: true };

  beforeEach(() => {
    vi.clearAllMocks();
    (useApi as unknown as Mock).mockReturnValue({
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete,
    });
  });

  // --- INITIALIZATION & FETCHING ---

  it('should initialize and fetch data for USER mode', async () => {
    (useAuth as unknown as Mock).mockReturnValue({ isAuthenticated: true, isLoading: false });
    
    // Mock successful responses
    mockGet.mockImplementation((url) => {
      if (url === API_ENDPOINTS.USER_WEBHOOK_STATUS) return Promise.resolve({ success: true, data: mockStatus });
      if (url === API_ENDPOINTS.USER_WEBHOOKS_SAVED) return Promise.resolve({ success: true, data: { webhooks: [mockSavedWebhook] } });
      return Promise.resolve({ success: false });
    });

    const { result } = renderHook(() => useWebhooks());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.USER_WEBHOOK_STATUS);
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.USER_WEBHOOKS_SAVED);
    expect(result.current.webhookStatus).toEqual(mockStatus);
    expect(result.current.savedWebhooks).toHaveLength(1);
  });

  it('should handle API errors (success: false) during fetch', async () => {
    (useAuth as unknown as Mock).mockReturnValue({ isAuthenticated: true, isLoading: false });
    
    // Simulamos fallo lógico en la API (200 OK pero success false)
    mockGet.mockResolvedValue({ success: false, error: 'Fetch failed' });

    const { result } = renderHook(() => useWebhooks());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Fetch failed');
    expect(result.current.webhookStatus).toBeNull();
    expect(result.current.savedWebhooks).toEqual([]);
  });

  it('should handle Network exceptions during fetch', async () => {
    (useAuth as unknown as Mock).mockReturnValue({ isAuthenticated: true, isLoading: false });
    
    // Simulamos excepción
    mockGet.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useWebhooks());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toContain('Error de conexión');
    expect(result.current.savedWebhooks).toEqual([]);
  });

  // --- CONFIGURE ---

  it('should configure webhook successfully', async () => {
    (useAuth as unknown as Mock).mockReturnValue({ isAuthenticated: true });
    mockGet.mockResolvedValue({ success: true, data: {} });
    mockPost.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useWebhooks());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.configureWebhook('url', 'id');
    });

    expect(mockPost).toHaveBeenCalled();
    // Debe recargar el status
    expect(mockGet).toHaveBeenCalled();
  });

  it('should handle API failure during configure', async () => {
    (useAuth as unknown as Mock).mockReturnValue({ isAuthenticated: true });
    mockGet.mockResolvedValue({ success: true, data: {} });
    mockPost.mockResolvedValue({ success: false, error: 'Config error' });

    const { result } = renderHook(() => useWebhooks());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      const success = await result.current.configureWebhook('url', 'id');
      expect(success).toBe(false);
    });

    expect(result.current.error).toBe('Config error');
  });

  it('should handle validation error during configure', async () => {
    const { result } = renderHook(() => useWebhooks());
    
    await act(async () => {
      const success = await result.current.configureWebhook('', '');
      expect(success).toBe(false);
    });

    // CORRECCIÓN: Ajustamos el texto esperado para que coincida con "Se requiere la URL..."
    expect(result.current.error).toContain('Se requiere');
  });

  it('should handle exceptions during configure', async () => {
    mockPost.mockRejectedValue(new Error('Fail'));
    const { result } = renderHook(() => useWebhooks());
    await act(async () => {
      await result.current.configureWebhook('url', 'id');
    });
    expect(result.current.error).toContain('Error de conexión');
  });

  // --- TEST WEBHOOK ---

  it('should handle API failure during test', async () => {
    mockPost.mockResolvedValue({ success: false, error: 'Test failed' });
    const { result } = renderHook(() => useWebhooks());
    await act(async () => {
      const res = await result.current.testWebhook();
      expect(res).toBeNull();
    });
    expect(result.current.error).toBe('Test failed');
  });

  it('should handle exceptions during test', async () => {
    mockPost.mockRejectedValue(new Error('Fail'));
    const { result } = renderHook(() => useWebhooks());
    await act(async () => {
      await result.current.testWebhook();
    });
    expect(result.current.error).toContain('Error de conexión');
  });

  // --- DISABLE ---

  it('should handle API failure during disable', async () => {
    mockPost.mockResolvedValue({ success: false, error: 'Disable error' });
    const { result } = renderHook(() => useWebhooks());
    await act(async () => {
      const success = await result.current.disableWebhook();
      expect(success).toBe(false);
    });
    expect(result.current.error).toBe('Disable error');
  });

  it('should handle exceptions during disable', async () => {
    mockPost.mockRejectedValue(new Error('Fail'));
    const { result } = renderHook(() => useWebhooks());
    await act(async () => {
      await result.current.disableWebhook();
    });
    expect(result.current.error).toContain('Error de conexión');
  });

  // --- FILTER ---

  it('should handle API failure during filter set', async () => {
    mockPost.mockResolvedValue({ success: false, error: 'Filter error' });
    const { result } = renderHook(() => useWebhooks());
    await act(async () => {
      const success = await result.current.setWebhookFilter(false);
      expect(success).toBe(false);
    });
    expect(result.current.error).toBe('Filter error');
  });

  it('should handle exceptions during filter set', async () => {
    mockPost.mockRejectedValue(new Error('Fail'));
    const { result } = renderHook(() => useWebhooks());
    await act(async () => {
      await result.current.setWebhookFilter(false);
    });
    expect(result.current.error).toContain('Error de conexión');
  });

  // --- SAVE ---

  it('should handle API failure during save', async () => {
    mockPost.mockResolvedValue({ success: false, error: 'Save error' });
    const { result } = renderHook(() => useWebhooks());
    await act(async () => {
      const success = await result.current.saveWebhook({ name: 'n', url: 'u' });
      expect(success).toBe(false);
    });
    expect(result.current.error).toBe('Save error');
  });

  it('should handle exceptions during save', async () => {
    mockPost.mockRejectedValue(new Error('Fail'));
    const { result } = renderHook(() => useWebhooks());
    await act(async () => {
      await result.current.saveWebhook({ name: 'n', url: 'u' });
    });
    expect(result.current.error).toContain('Error de conexión');
  });

  // --- UPDATE ---

  it('should handle API failure during update', async () => {
    mockPut.mockResolvedValue({ success: false, error: 'Update error' });
    const { result } = renderHook(() => useWebhooks());
    await act(async () => {
      const success = await result.current.updateWebhook(1, { name: 'n' });
      expect(success).toBe(false);
    });
    expect(result.current.error).toBe('Update error');
  });

  it('should handle exceptions during update', async () => {
    mockPut.mockRejectedValue(new Error('Fail'));
    const { result } = renderHook(() => useWebhooks());
    await act(async () => {
      await result.current.updateWebhook(1, { name: 'n' });
    });
    expect(result.current.error).toContain('Error de conexión');
  });

  // --- DELETE ---

  it('should handle API failure during delete', async () => {
    mockDelete.mockResolvedValue({ success: false, error: 'Delete error' });
    const { result } = renderHook(() => useWebhooks());
    await act(async () => {
      const success = await result.current.deleteWebhook(1);
      expect(success).toBe(false);
    });
    expect(result.current.error).toBe('Delete error');
  });

  it('should handle exceptions during delete', async () => {
    mockDelete.mockRejectedValue(new Error('Fail'));
    const { result } = renderHook(() => useWebhooks());
    await act(async () => {
      await result.current.deleteWebhook(1);
    });
    expect(result.current.error).toContain('Error de conexión');
  });

  // --- USEEFFECT / AUTH STATE ---

  it('should reset state when user logs out', async () => {
    // 1. Iniciar autenticado
    (useAuth as unknown as Mock).mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockGet.mockResolvedValue({ success: true, data: {} });
    
    const { result, rerender } = renderHook(() => useWebhooks());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // 2. Cambiar a no autenticado (logout)
    (useAuth as unknown as Mock).mockReturnValue({ isAuthenticated: false, isLoading: false });
    rerender();

    expect(result.current.webhookStatus).toBeNull();
    expect(result.current.savedWebhooks).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});