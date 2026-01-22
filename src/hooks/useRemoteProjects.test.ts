import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRemoteProjects } from './useRemoteProjects';

// Mock global fetch
const globalFetch = vi.fn();
vi.stubGlobal('fetch', globalFetch);

describe('useRemoteProjects Hook', () => {
  const defaultUrl = 'https://form.movonte.com';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // --- INITIALIZATION ---

  it('should initialize with default state and attempt to fetch', async () => {
    // Mock initial fetch calls to return empty/null to avoid errors during initial render
    globalFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, availableProjects: [], currentProject: null }),
    });

    const { result } = renderHook(() => useRemoteProjects());

    expect(result.current.remoteServerUrl).toBe(defaultUrl);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    
    // Wait for initial fetch to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(globalFetch).toHaveBeenCalledTimes(2); // One for projects, one for active project
    expect(globalFetch).toHaveBeenCalledWith(`${defaultUrl}/api/projects/available`);
    expect(globalFetch).toHaveBeenCalledWith(`${defaultUrl}/api/projects/current`);
  });

  // --- FETCHING DATA (SUCCESS) ---

  it('should fetch remote projects and active project successfully', async () => {
    const mockProjects = [
      { key: 'REMOTE-1', name: 'Remote Project 1', id: '1' },
      { key: 'REMOTE-2', name: 'Remote Project 2', id: '2' },
    ];

    // Mock implementation to handle different endpoints
    globalFetch.mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/api/projects/available')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, availableProjects: mockProjects }),
        });
      }
      if (typeof url === 'string' && url.includes('/api/projects/current')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, currentProject: { key: 'REMOTE-1' } }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { result } = renderHook(() => useRemoteProjects());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.remoteProjects).toHaveLength(2);
    expect(result.current.remoteProjects[0].key).toBe('REMOTE-1');
    expect(result.current.remoteActiveProject).toBe('REMOTE-1');
    expect(result.current.error).toBeNull();
  });

  // --- FETCHING DATA (ERROR) ---

  it('should handle errors when fetching remote projects', async () => {
    globalFetch.mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/api/projects/available')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: false, error: 'Server Error' }),
        });
      }
      // Return success for current project to isolate the error
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, currentProject: null }),
      });
    });

    const { result } = renderHook(() => useRemoteProjects());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toContain('Server Error');
    expect(result.current.remoteProjects).toEqual([]);
  });

  it('should handle network exceptions during fetch', async () => {
    globalFetch.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useRemoteProjects());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toContain('Network Error');
    expect(result.current.remoteProjects).toEqual([]);
  });

  // --- CHANGING URL ---

  it('should refetch data when remote server URL changes', async () => {
    // First mock for default URL
    globalFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, availableProjects: [], currentProject: null }),
    });

    const { result } = renderHook(() => useRemoteProjects());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Clear previous calls
    globalFetch.mockClear();

    // Update URL
    const newUrl = 'https://new-api.com';
    act(() => {
      result.current.setRemoteServerUrl(newUrl);
    });

    expect(result.current.remoteServerUrl).toBe(newUrl);

    // Wait for new fetch calls
    await waitFor(() => {
      expect(globalFetch).toHaveBeenCalledWith(`${newUrl}/api/projects/available`);
    });
  });

  // --- SETTING ACTIVE PROJECT ---

  it('should set active project successfully', async () => {
    // Initial fetch mock
    globalFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, availableProjects: [], currentProject: null }),
    });

    const { result } = renderHook(() => useRemoteProjects());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Mock POST response
    globalFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    let success;
    await act(async () => {
      success = await result.current.setRemoteActiveProject('NEW-ACTIVE');
    });

    // Verify POST call
    expect(globalFetch).toHaveBeenCalledWith(
      `${defaultUrl}/api/projects/set-active`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ projectKey: 'NEW-ACTIVE' }),
      })
    );

    expect(success).toBe(true);
    expect(result.current.remoteActiveProject).toBe('NEW-ACTIVE');
  });

  it('should handle error when setting active project fails', async () => {
    // Initial fetch mock
    globalFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, availableProjects: [], currentProject: null }),
    });

    const { result } = renderHook(() => useRemoteProjects());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Mock POST failure
    globalFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, error: 'Project not found' }),
    });

    let success;
    await act(async () => {
      success = await result.current.setRemoteActiveProject('INVALID');
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('Project not found');
    expect(result.current.remoteActiveProject).toBeNull(); // Should not update state
  });

  it('should validate inputs before setting active project', async () => {
    // Initial fetch mock
    globalFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, availableProjects: [], currentProject: null }),
    });

    const { result } = renderHook(() => useRemoteProjects());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    globalFetch.mockClear();

    let success;
    await act(async () => {
      success = await result.current.setRemoteActiveProject('');
    });

    expect(success).toBe(false);
    expect(result.current.error).toContain('Se requiere el projectKey');
    expect(globalFetch).not.toHaveBeenCalled();
  });
});