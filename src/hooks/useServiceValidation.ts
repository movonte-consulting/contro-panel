import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { API_ENDPOINTS } from '../config/api';

export interface ServiceValidationRequest {
  serviceName: string;
  serviceDescription?: string;
  websiteUrl: string;
  requestedDomain: string;
}

export interface ServiceValidation {
  id: number;
  serviceName: string;
  serviceDescription?: string;
  websiteUrl: string;
  requestedDomain: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  validatedBy?: number;
  validatedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface ProtectedTokenResponse {
  protectedToken: string;
  serviceId: string;
  userId: number;
  message: string;
}

export const useServiceValidation = () => {
  const { post, get } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Crear solicitud de validación de servicio
  const createValidationRequest = useCallback(async (request: ServiceValidationRequest): Promise<ServiceValidation> => {
    setLoading(true);
    setError(null);

    try {
      const response = await post<ServiceValidation>(API_ENDPOINTS.SERVICE_VALIDATION_REQUEST, request);
      return response.data!;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear solicitud de validación';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [post]);

  // Obtener solicitudes de validación del usuario
  const getUserValidations = useCallback(async (): Promise<ServiceValidation[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await get<{ validations: ServiceValidation[] }>(API_ENDPOINTS.SERVICE_VALIDATION_REQUESTS);
      return response.data?.validations || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener solicitudes de validación';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [get]);

  // Obtener solicitudes pendientes (solo para admins)
  const getPendingValidations = useCallback(async (): Promise<ServiceValidation[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await get<{ validations: ServiceValidation[] }>(API_ENDPOINTS.SERVICE_VALIDATION_PENDING);
      return response.data?.validations || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener solicitudes pendientes';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [get]);

  // Aprobar solicitud de validación (solo para admins)
  const approveValidation = useCallback(async (validationId: number, adminNotes?: string): Promise<ServiceValidation> => {
    setLoading(true);
    setError(null);

    try {
      const response = await post<ServiceValidation>(
        API_ENDPOINTS.SERVICE_VALIDATION_APPROVE(validationId.toString()),
        { adminNotes }
      );
      return response.data!;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al aprobar solicitud';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [post]);

  // Rechazar solicitud de validación (solo para admins)
  const rejectValidation = useCallback(async (validationId: number, adminNotes: string): Promise<ServiceValidation> => {
    setLoading(true);
    setError(null);

    try {
      const response = await post<ServiceValidation>(
        API_ENDPOINTS.SERVICE_VALIDATION_REJECT(validationId.toString()),
        { adminNotes }
      );
      return response.data!;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al rechazar solicitud';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [post]);

  // Generar token protegido para servicio
  const generateProtectedToken = useCallback(async (serviceId: string): Promise<ProtectedTokenResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await post<ProtectedTokenResponse>(
        API_ENDPOINTS.SERVICE_VALIDATION_PROTECTED_TOKEN,
        { serviceId }
      );
      return response.data!;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al generar token protegido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [post]);

  // Validar token protegido
  const validateProtectedToken = useCallback(async (protectedToken: string): Promise<{ userId: number; serviceId: string; isValid: boolean }> => {
    setLoading(true);
    setError(null);

    try {
      const response = await post<{ userId: number; serviceId: string; isValid: boolean }>(
        API_ENDPOINTS.SERVICE_VALIDATION_VALIDATE_TOKEN,
        { protectedToken }
      );
      return response.data!;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al validar token';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [post]);

  return {
    loading,
    error,
    createValidationRequest,
    getUserValidations,
    getPendingValidations,
    approveValidation,
    rejectValidation,
    generateProtectedToken,
    validateProtectedToken
  };
};
