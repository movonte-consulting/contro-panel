import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { useServiceValidation } from './useServiceValidation'; // Adjust path
import { useApi } from './useApi';
import { API_ENDPOINTS } from '../config/api';

// 1. Mock Dependencies
vi.mock('./useApi');

// 2. Mock Config with functions for dynamic endpoints
vi.mock('../config/api', () => ({
  API_ENDPOINTS: {
    SERVICE_VALIDATION_REQUEST: '/api/validation/request',
    SERVICE_VALIDATION_REQUESTS: '/api/validation/requests',
    SERVICE_VALIDATION_PENDING: '/api/validation/pending',
    SERVICE_VALIDATION_APPROVE: (id: string) => `/api/validation/approve/${id}`,
    SERVICE_VALIDATION_REJECT: (id: string) => `/api/validation/reject/${id}`,
    SERVICE_VALIDATION_PROTECTED_TOKEN: '/api/validation/token/generate',
    SERVICE_VALIDATION_VALIDATE_TOKEN: '/api/validation/token/validate',
  },
}));

describe('useServiceValidation Hook', () => {
  const mockPost = vi.fn();
  const mockGet = vi.fn();

  // Sample Data
  const mockValidationRequest = {
    serviceName: 'Test Service',
    websiteUrl: 'https://test.com',
    requestedDomain: 'test.com',
  };

  const mockValidationResponse = {
    id: 1,
    ...mockValidationRequest,
    status: 'pending',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useApi as unknown as Mock).mockReturnValue({
      post: mockPost,
      get: mockGet,
    });
  });

  // --- INITIALIZATION ---

  it('should initialize with default states', () => {
    const { result } = renderHook(() => useServiceValidation());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  // --- CREATE VALIDATION REQUEST ---

  it('should create a validation request successfully', async () => {
    mockPost.mockResolvedValue({ data: mockValidationResponse });

    const { result } = renderHook(() => useServiceValidation());

    let response;
    await waitFor(async () => {
      response = await result.current.createValidationRequest(mockValidationRequest);
    });

    expect(mockPost).toHaveBeenCalledWith(
      API_ENDPOINTS.SERVICE_VALIDATION_REQUEST,
      mockValidationRequest
    );
    expect(response).toEqual(mockValidationResponse);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors when creating request', async () => {
    const errorMsg = 'Invalid domain';
    mockPost.mockRejectedValue(new Error(errorMsg));

    const { result } = renderHook(() => useServiceValidation());

    // 1. Verify it throws
    await expect(
      result.current.createValidationRequest(mockValidationRequest)
    ).rejects.toThrow(errorMsg);

    // 2. Verify state update
    await waitFor(() => {
      expect(result.current.error).toBe(errorMsg);
    });
    expect(result.current.loading).toBe(false);
  });

  // --- GET VALIDATIONS (User & Pending) ---

  it('should get user validations successfully', async () => {
    mockGet.mockResolvedValue({
      data: { validations: [mockValidationResponse] },
    });

    const { result } = renderHook(() => useServiceValidation());
    const data = await result.current.getUserValidations();

    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.SERVICE_VALIDATION_REQUESTS);
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe(1);
  });

  it('should get pending validations successfully', async () => {
    mockGet.mockResolvedValue({
      data: { validations: [mockValidationResponse] },
    });

    const { result } = renderHook(() => useServiceValidation());
    const data = await result.current.getPendingValidations();

    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.SERVICE_VALIDATION_PENDING);
    expect(data).toHaveLength(1);
  });

  // --- APPROVE / REJECT ---

  it('should approve validation successfully', async () => {
    const approvedMock = { ...mockValidationResponse, status: 'approved' };
    mockPost.mockResolvedValue({ data: approvedMock });

    const { result } = renderHook(() => useServiceValidation());
    const data = await result.current.approveValidation(1, 'Looks good');

    // Verify dynamic URL generation
    expect(mockPost).toHaveBeenCalledWith(
      expect.stringContaining('/approve/1'),
      { adminNotes: 'Looks good' }
    );
    expect(data.status).toBe('approved');
  });

  it('should reject validation successfully', async () => {
    const rejectedMock = { ...mockValidationResponse, status: 'rejected' };
    mockPost.mockResolvedValue({ data: rejectedMock });

    const { result } = renderHook(() => useServiceValidation());
    const data = await result.current.rejectValidation(1, 'Invalid content');

    expect(mockPost).toHaveBeenCalledWith(
      expect.stringContaining('/reject/1'),
      { adminNotes: 'Invalid content' }
    );
    expect(data.status).toBe('rejected');
  });

  // --- GENERATE PROTECTED TOKEN ---

  it('should generate protected token successfully', async () => {
    const mockTokenResponse = {
      protectedToken: 'token-123',
      serviceId: 'srv-1',
      userId: 1,
      message: 'Success',
    };

    // The hook checks response.success explicitly
    mockPost.mockResolvedValue({
      success: true,
      data: mockTokenResponse,
    });

    const { result } = renderHook(() => useServiceValidation());
    
    // Call with expiration
    const data = await result.current.generateProtectedToken('srv-1', 24);

    expect(mockPost).toHaveBeenCalledWith(
      API_ENDPOINTS.SERVICE_VALIDATION_PROTECTED_TOKEN,
      { serviceId: 'srv-1', expirationHours: 24 }
    );
    expect(data).toEqual(mockTokenResponse);
  });

  it('should handle API failure (success: false) when generating token', async () => {
    mockPost.mockResolvedValue({
      success: false,
      error: 'Service not validated',
    });

    const { result } = renderHook(() => useServiceValidation());

    await expect(
      result.current.generateProtectedToken('srv-1')
    ).rejects.toThrow('Service not validated');

    await waitFor(() => {
      expect(result.current.error).toBe('Service not validated');
    });
  });

  it('should handle missing data response when generating token', async () => {
    // API returns success true but no data
    mockPost.mockResolvedValue({
      success: true,
      data: null,
    });

    const { result } = renderHook(() => useServiceValidation());

    await expect(
      result.current.generateProtectedToken('srv-1')
    ).rejects.toThrow('No se recibieron datos del servidor');

    await waitFor(() => {
      expect(result.current.error).toBe('No se recibieron datos del servidor');
    });
  });

  // --- VALIDATE PROTECTED TOKEN ---

  it('should validate protected token successfully', async () => {
    const mockValidationResult = {
      userId: 1,
      serviceId: 'srv-1',
      isValid: true,
    };

    mockPost.mockResolvedValue({ data: mockValidationResult });

    const { result } = renderHook(() => useServiceValidation());
    const data = await result.current.validateProtectedToken('token-123');

    expect(mockPost).toHaveBeenCalledWith(
      API_ENDPOINTS.SERVICE_VALIDATION_VALIDATE_TOKEN,
      { protectedToken: 'token-123' }
    );
    expect(data).toEqual(mockValidationResult);
  });

  it('should handle errors when validating token', async () => {
    mockPost.mockRejectedValue(new Error('Invalid token'));

    const { result } = renderHook(() => useServiceValidation());

    await expect(
      result.current.validateProtectedToken('bad-token')
    ).rejects.toThrow('Invalid token');

    await waitFor(() => {
      expect(result.current.error).toBe('Invalid token');
    });
  });
  // --- BRANCH COVERAGE: Fallback Errors (Non-Error Throws) ---

  it('should use fallback error message when create request fails with non-Error object', async () => {
    // Simulamos un error que NO es instancia de Error (ej. un string)
    mockPost.mockRejectedValue('Network weirdness');

    const { result } = renderHook(() => useServiceValidation());

    await expect(
      result.current.createValidationRequest(mockValidationRequest)
    ).rejects.toEqual('Network weirdness');

    await waitFor(() => {
      // Verifica el mensaje fallback definido en el hook
      expect(result.current.error).toBe('Error al crear solicitud de validación');
    });
  });

  it('should use fallback error message when getting user validations fails with non-Error object', async () => {
    mockGet.mockRejectedValue({ some: 'object' });

    const { result } = renderHook(() => useServiceValidation());

    await expect(result.current.getUserValidations()).rejects.toEqual({ some: 'object' });

    await waitFor(() => {
      expect(result.current.error).toBe('Error al obtener solicitudes de validación');
    });
  });

  it('should use fallback error message when getting pending validations fails with non-Error object', async () => {
    mockGet.mockRejectedValue('Unknown error');

    const { result } = renderHook(() => useServiceValidation());

    await expect(result.current.getPendingValidations()).rejects.toEqual('Unknown error');

    await waitFor(() => {
      expect(result.current.error).toBe('Error al obtener solicitudes pendientes');
    });
  });

  it('should use fallback error message when approving validation fails with non-Error object', async () => {
    mockPost.mockRejectedValue('Unknown error');

    const { result } = renderHook(() => useServiceValidation());

    await expect(result.current.approveValidation(1)).rejects.toEqual('Unknown error');

    await waitFor(() => {
      expect(result.current.error).toBe('Error al aprobar solicitud');
    });
  });

  it('should use fallback error message when rejecting validation fails with non-Error object', async () => {
    mockPost.mockRejectedValue('Unknown error');

    const { result } = renderHook(() => useServiceValidation());

    await expect(result.current.rejectValidation(1, 'reason')).rejects.toEqual('Unknown error');

    await waitFor(() => {
      expect(result.current.error).toBe('Error al rechazar solicitud');
    });
  });

  // --- BRANCH COVERAGE: Empty/Missing Data (|| []) ---

  it('should return empty array if user validations are undefined in response', async () => {
    // Simulamos respuesta exitosa pero sin la propiedad 'validations'
    mockGet.mockResolvedValue({ data: {} }); 

    const { result } = renderHook(() => useServiceValidation());
    const data = await result.current.getUserValidations();

    expect(data).toEqual([]);
  });

  it('should return empty array if pending validations are undefined in response', async () => {
    mockGet.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useServiceValidation());
    const data = await result.current.getPendingValidations();

    expect(data).toEqual([]);
  });

  // Coverage para generateProtectedToken (error fallback)
  it('should use fallback error message when generating protected token fails with non-Error', async () => {
    mockPost.mockRejectedValue('Fail');

    const { result } = renderHook(() => useServiceValidation());

    await expect(result.current.generateProtectedToken('srv-1')).rejects.toEqual('Fail');

    await waitFor(() => {
      expect(result.current.error).toBe('Error al generar token protegido');
    });
  });

  // Coverage para validateProtectedToken (error fallback)
  it('should use fallback error message when validating token fails with non-Error', async () => {
    mockPost.mockRejectedValue('Fail');

    const { result } = renderHook(() => useServiceValidation());

    await expect(result.current.validateProtectedToken('tok')).rejects.toEqual('Fail');

    await waitFor(() => {
      expect(result.current.error).toBe('Error al validar token');
    });
  });
});