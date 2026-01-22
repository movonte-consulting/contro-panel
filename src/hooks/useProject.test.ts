import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { useProjects } from './useProjects'; // Adjust path
import { useApi } from './useApi';
import { useAuth } from './useAuth';
import { API_ENDPOINTS } from '../config/api';

// 1. Mock Dependencies
vi.mock('./useApi');
vi.mock('./useAuth');
vi.mock('../config/api', () => ({
  API_ENDPOINTS: {
    PROJECTS: '/api/admin/projects',
    USER_PROJECTS: '/api/user/projects',
    DASHBOARD: '/api/admin/dashboard',
    USER_DASHBOARD: '/api/user/dashboard',
  },
}));

describe('useProjects Hook', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useApi as unknown as Mock).mockReturnValue({
      get: mockGet,
      post: mockPost,
    });
  });

  // --- INITIALIZATION TESTS ---

  it('should initialize with loading state', () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });

    const { result } = renderHook(() => useProjects());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.projects).toEqual([]);
    expect(result.current.activeProject).toBeNull();
  });

  it('should stop loading and clear data if not authenticated', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    const { result } = renderHook(() => useProjects());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.projects).toEqual([]);
    expect(mockGet).not.toHaveBeenCalled();
  });

  // --- ADMIN ROLE TESTS ---

  it('should fetch projects and active project correctly for ADMIN', async () => {
    // 1. Mock Auth as Admin
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'admin' },
    });

    // 2. Mock API Responses
    // Call 1: Fetch Projects (Admin Endpoint)
    mockGet.mockImplementation((endpoint) => {
      if (endpoint === API_ENDPOINTS.PROJECTS) {
        return Promise.resolve({
          success: true,
          data: {
            count: 2,
            projects: [
              { id: '1', key: 'PROJ-A', name: 'Project A', projectTypeKey: 'software' },
              { id: '2', key: 'PROJ-B', name: 'Project B', projectTypeKey: 'business' },
            ],
          },
        });
      }
      // Call 2: Fetch Active Project (Dashboard Endpoint)
      if (endpoint === API_ENDPOINTS.DASHBOARD) {
        return Promise.resolve({
          success: true,
          data: { activeProject: 'PROJ-A' },
        });
      }
      return Promise.resolve({ success: false });
    });

    const { result } = renderHook(() => useProjects());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Verify calls
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.PROJECTS);
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.DASHBOARD);

    // Verify State
    expect(result.current.projects).toHaveLength(2);
    expect(result.current.projects[0].key).toBe('PROJ-A');
    expect(result.current.activeProject).toBe('PROJ-A');
  });

  // --- USER ROLE TESTS ---

  it('should fetch projects and active project correctly for USER', async () => {
    // 1. Mock Auth as User
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'user' },
    });

    // 2. Mock API Responses
    mockGet.mockImplementation((endpoint) => {
      if (endpoint === API_ENDPOINTS.USER_PROJECTS) {
        return Promise.resolve({
          success: true,
          // User endpoint returns array directly or data.data array
          data: [
            { id: '3', key: 'USER-P', name: 'User Project', projectTypeKey: 'software' },
          ],
        });
      }
      if (endpoint === API_ENDPOINTS.USER_DASHBOARD) {
        return Promise.resolve({
          success: true,
          data: { activeProject: 'USER-P' },
        });
      }
      return Promise.resolve({ success: false });
    });

    const { result } = renderHook(() => useProjects());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Verify calls
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.USER_PROJECTS);
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.USER_DASHBOARD);

    // Verify State
    expect(result.current.projects).toHaveLength(1);
    expect(result.current.activeProject).toBe('USER-P');
  });

  // --- ERROR HANDLING TESTS ---

  it('should handle API errors when fetching projects', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'admin' },
    });

    // Mock Error
    mockGet.mockResolvedValue({
      success: false,
      error: 'Failed to fetch projects',
    });

    const { result } = renderHook(() => useProjects());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toContain('Failed to fetch projects');
    expect(result.current.projects).toEqual([]);
  });

  // --- SET ACTIVE PROJECT TESTS ---

  it('should update active project successfully', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'admin' },
    });

    // Initial load setup (empty for simplicity)
    mockGet.mockResolvedValue({ success: true, data: { projects: [] } });

    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Mock Post response
    mockPost.mockResolvedValue({ success: true });

    let success;
    await act(async () => {
      success = await result.current.setActiveProject('NEW-PROJ');
    });

    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.DASHBOARD, {
      activeProject: 'NEW-PROJ',
    });
    expect(success).toBe(true);
    expect(result.current.activeProject).toBe('NEW-PROJ');
    expect(result.current.error).toBeNull();
  });

  it('should handle error when setting active project fails', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'user' },
    });

    // Initial load
    mockGet.mockResolvedValue({ success: true, data: [] });
    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Mock Post failure
    mockPost.mockResolvedValue({
      success: false,
      error: 'Invalid Project ID',
    });

    let success;
    await act(async () => {
      success = await result.current.setActiveProject('INVALID');
    });

    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.USER_DASHBOARD, {
      activeProject: 'INVALID',
    });
    expect(success).toBe(false);
    expect(result.current.error).toBe('Invalid Project ID');
    // Active project should NOT change
    expect(result.current.activeProject).toBeNull(); 
  });

  it('should validate projectKey before calling API', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'admin' },
    });
    
    // Initial mock to pass effect
    mockGet.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let success;
    await act(async () => {
      success = await result.current.setActiveProject('');
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('Se requiere el projectKey');
    expect(mockPost).not.toHaveBeenCalled();
  });
});