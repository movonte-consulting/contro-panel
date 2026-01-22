import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { useServiceJiraAccounts } from './useServiceJiraAccounts';
import { useApi } from './useApi';

vi.mock('./useApi');

describe('useServiceJiraAccounts Hook', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockDel = vi.fn();

  const mockServiceId = 'srv-123';
  const mockAccountData = {
    id: 1,
    serviceId: mockServiceId,
    assistantJiraEmail: 'bot@test.com',
    assistantJiraUrl: 'https://test.atlassian.net',
    isActive: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useApi as unknown as Mock).mockReturnValue({
      get: mockGet,
      post: mockPost,
      delete: mockDel,
    });
  });

  
  it('debe inicializarse con los estados por defecto', () => {
    const { result } = renderHook(() => useServiceJiraAccounts());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

 
  it('debe obtener las cuentas de Jira exitosamente', async () => {
    mockGet.mockResolvedValue({
      success: true,
      data: { data: mockAccountData },
    });

    const { result } = renderHook(() => useServiceJiraAccounts());

    let data;
    await waitFor(async () => {
      data = await result.current.getServiceJiraAccounts(mockServiceId);
    });

    expect(mockGet).toHaveBeenCalledWith(`/api/service/${mockServiceId}/jira-accounts`);
    expect(data).toEqual(mockAccountData);
    expect(result.current.error).toBeNull();
  });

  it('debe manejar excepciones en el GET y establecer estado de error', async () => {
    mockGet.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useServiceJiraAccounts());

    await waitFor(async () => {
      await result.current.getServiceJiraAccounts(mockServiceId);
    });

    
    await waitFor(() => {
      expect(result.current.error).toBe('Network Error');
    });
    expect(result.current.loading).toBe(false);
  });

  
  it('debe crear/actualizar cuentas exitosamente', async () => {
    mockPost.mockResolvedValue({
      success: true,
      data: { data: mockAccountData },
    });

    const { result } = renderHook(() => useServiceJiraAccounts());
    const inputData = { assistantJiraEmail: 'bot@test.com' };

    let data;
    await waitFor(async () => {
      data = await result.current.upsertServiceJiraAccounts(mockServiceId, inputData);
    });

    expect(data).toEqual(mockAccountData);
    expect(result.current.error).toBeNull();
  });

  it('debe lanzar error si el POST falla', async () => {
    mockPost.mockResolvedValue({
      success: false,
      message: 'Validation failed',
    });

    const { result } = renderHook(() => useServiceJiraAccounts());
    const inputData = { assistantJiraEmail: 'bot@test.com' };

    await expect(
      result.current.upsertServiceJiraAccounts(mockServiceId, inputData)
    ).rejects.toThrow('Validation failed');


    await waitFor(() => {
      expect(result.current.error).toBe('Validation failed');
    });
    expect(result.current.loading).toBe(false);
  });

  it('debe manejar excepciones de red en el POST', async () => {
    mockPost.mockRejectedValue(new Error('Connection refused'));

    const { result } = renderHook(() => useServiceJiraAccounts());
    const inputData = {};

    await expect(
      result.current.upsertServiceJiraAccounts(mockServiceId, inputData)
    ).rejects.toThrow('Connection refused');


    await waitFor(() => {
      expect(result.current.error).toBe('Connection refused');
    });
  });


  it('debe eliminar cuentas exitosamente', async () => {
    mockDel.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useServiceJiraAccounts());

    await waitFor(async () => {
      await result.current.deleteServiceJiraAccounts(mockServiceId);
    });

    expect(result.current.error).toBeNull();
  });

  it('debe lanzar error si el DELETE falla', async () => {
    mockDel.mockResolvedValue({
      success: false,
      message: 'Cannot delete',
    });

    const { result } = renderHook(() => useServiceJiraAccounts());

    await expect(
      result.current.deleteServiceJiraAccounts(mockServiceId)
    ).rejects.toThrow('Cannot delete');

   
    await waitFor(() => {
      expect(result.current.error).toBe('Cannot delete');
    });
  });

  it('debe manejar excepciones en el DELETE', async () => {
    mockDel.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useServiceJiraAccounts());

    await expect(
      result.current.deleteServiceJiraAccounts(mockServiceId)
    ).rejects.toThrow('API Error');

    
    await waitFor(() => {
      expect(result.current.error).toBe('API Error');
    });
  });
});