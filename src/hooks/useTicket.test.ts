import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { useTickets } from './useTickets'; // Adjust path
import { useApi } from './useApi';
import { useAuth } from './useAuth';
import { API_ENDPOINTS } from '../config/api';

// 1. Mock Dependencies
vi.mock('./useApi');
vi.mock('./useAuth');
vi.mock('../config/api', () => ({
  API_ENDPOINTS: {
    TICKETS_DISABLED: '/api/admin/tickets/disabled',
    USER_TICKETS_DISABLED: '/api/user/tickets/disabled',
    TICKET_DISABLE: (key: string) => `/api/admin/ticket/${key}/disable`,
    USER_TICKET_DISABLE: (key: string) => `/api/user/ticket/${key}/disable`,
    TICKET_ENABLE: (key: string) => `/api/admin/ticket/${key}/enable`,
    USER_TICKET_ENABLE: (key: string) => `/api/user/ticket/${key}/enable`,
    TICKET_STATUS: (key: string) => `/api/admin/ticket/${key}/status`,
    USER_TICKET_STATUS: (key: string) => `/api/user/ticket/${key}/status`,
  },
}));

describe('useTickets Hook', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();

  // Sample Data
  const mockDisabledTicket = {
    issueKey: 'PROJ-123',
    reason: 'Spam',
    disabledAt: '2023-01-01',
    disabledBy: 'Admin',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useApi as unknown as Mock).mockReturnValue({
      get: mockGet,
      post: mockPost,
    });
  });

  // --- INITIALIZATION ---

  it('should initialize with loading state', () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    const { result } = renderHook(() => useTickets());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.disabledTickets).toEqual([]);
  });

  it('should stop loading if not authenticated', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    const { result } = renderHook(() => useTickets());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockGet).not.toHaveBeenCalled();
  });

  // --- FETCH TICKETS ---

  it('should fetch disabled tickets for ADMIN', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'admin' },
    });

    mockGet.mockResolvedValue({
      success: true,
      data: { disabledTickets: [mockDisabledTicket] },
    });

    const { result } = renderHook(() => useTickets());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.TICKETS_DISABLED);
    expect(result.current.disabledTickets).toHaveLength(1);
    expect(result.current.disabledTickets[0].issueKey).toBe('PROJ-123');
  });

  it('should fetch disabled tickets for USER', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'user' },
    });

    mockGet.mockResolvedValue({
      success: true,
      data: { disabledTickets: [mockDisabledTicket] },
    });

    const { result } = renderHook(() => useTickets());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.USER_TICKETS_DISABLED);
    expect(result.current.disabledTickets).toHaveLength(1);
  });

  it('should handle fetch errors', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'admin' },
    });

    mockGet.mockResolvedValue({ success: false, error: 'Fetch failed' });

    const { result } = renderHook(() => useTickets());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toContain('Fetch failed');
    expect(result.current.disabledTickets).toEqual([]);
  });

  // --- DISABLE TICKET ---

  it('should disable ticket successfully and refetch', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'admin' },
    });

    // 1. Initial Fetch
    mockGet.mockResolvedValueOnce({ success: true, data: { disabledTickets: [] } });
    
    const { result } = renderHook(() => useTickets());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // 2. Prepare Disable Response
    mockPost.mockResolvedValue({ success: true });
    
    // 3. Prepare Refetch Response (called after disable)
    mockGet.mockResolvedValueOnce({ 
      success: true, 
      data: { disabledTickets: [mockDisabledTicket] } 
    });

    let success;
    await act(async () => {
      success = await result.current.disableTicket('PROJ-123', 'Testing');
    });

    expect(mockPost).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/ticket/PROJ-123/disable'),
      { reason: 'Testing' }
    );
    expect(success).toBe(true);
    
    // Verify refetch happened and state updated
    expect(mockGet).toHaveBeenCalledTimes(2); 
    expect(result.current.disabledTickets).toHaveLength(1);
  });

  it('should handle disable errors', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'user' },
    });

    // Initial fetch
    mockGet.mockResolvedValue({ success: true, data: { disabledTickets: [] } });
    const { result } = renderHook(() => useTickets());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockPost.mockResolvedValue({ success: false, error: 'Cannot disable' });

    let success;
    await act(async () => {
      success = await result.current.disableTicket('PROJ-123');
    });

    expect(success).toBe(false);
    expect(result.current.error).toContain('Cannot disable');
  });

  // --- ENABLE TICKET ---

  it('should enable ticket successfully', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'admin' },
    });

    mockGet.mockResolvedValue({ success: true, data: { disabledTickets: [] } });
    const { result } = renderHook(() => useTickets());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockPost.mockResolvedValue({ success: true });

    let success;
    await act(async () => {
      success = await result.current.enableTicket('PROJ-123');
    });

    expect(mockPost).toHaveBeenCalledWith(expect.stringContaining('/api/admin/ticket/PROJ-123/enable'));
    expect(success).toBe(true);
  });

  // --- CHECK TICKET STATUS ---

  it('should check ticket status successfully', async () => {
    (useAuth as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'user' },
    });

    mockGet.mockResolvedValue({ success: true, data: { disabledTickets: [] } }); // Initial fetch
    const { result } = renderHook(() => useTickets());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const mockStatus = { issueKey: 'PROJ-123', isDisabled: true };
    mockGet.mockResolvedValueOnce({ success: true, data: mockStatus });

    let status;
    await act(async () => {
      status = await result.current.checkTicketStatus('PROJ-123');
    });

    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/api/user/ticket/PROJ-123/status'));
    expect(status).toEqual(mockStatus);
  });

  it('should handle empty issueKey checks', async () => {
    (useAuth as unknown as Mock).mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockGet.mockResolvedValue({ success: true, data: { disabledTickets: [] } });
    
    const { result } = renderHook(() => useTickets());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let status;
    await act(async () => {
      status = await result.current.checkTicketStatus('');
    });

    expect(status).toBeNull();
    expect(result.current.error).toContain('Se requiere el issueKey');
  });
});