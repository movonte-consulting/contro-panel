import { useCallback } from 'react';
import { useAuth } from './useAuth';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

export const useApi = () => {
  const { token, logout } = useAuth();

  const apiCall = useCallback(async <T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> => {
    const { requireAuth = true, ...fetchOptions } = options;

    if (requireAuth && !token) {
      if (endpoint.includes('/auth/') || endpoint.includes('/profile')) {
        logout();
        return {
          success: false,
          error: 'No autenticado. Redirigiendo al login...',
        };
      } else {
        return {
          success: false,
          error: 'No autenticado. Por favor, inicia sesión nuevamente.',
        };
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };


    if (requireAuth && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      console.log('🌐 Making API call to:', endpoint);
      const response = await fetch(endpoint, {
        ...fetchOptions,
        headers,
      });

      // Si la respuesta es 401, el token es inválido o expiró
      if (response.status === 401 && requireAuth) {
        console.log('❌ Token inválido o expirado, redirigiendo al login');
        // Solo hacer logout si es un endpoint crítico de autenticación
        if (endpoint.includes('/auth/') || endpoint.includes('/profile')) {
          logout();
          return {
            success: false,
            error: 'Sesión expirada. Redirigiendo al login...',
          };
        } else {
          // Para otros endpoints, solo devolver el error sin hacer logout
          return {
            success: false,
            error: 'Token inválido o expirado. Por favor, recarga la página.',
          };
        }
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // Si no se puede parsear JSON, devolver error genérico
        return {
          success: false,
          error: `Error ${response.status}: ${response.statusText}`,
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error ${response.status}: ${response.statusText}`,
        };
      }

      return data;
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: 'Error de conexión. Intenta nuevamente.',
      };
    }
  }, [token, logout]);

  // Métodos específicos para diferentes tipos de requests
  const get = useCallback(<T = any>(endpoint: string, options: RequestOptions = {}) =>
    apiCall<T>(endpoint, { ...options, method: 'GET' }), [apiCall]);

  const post = useCallback(<T = any>(endpoint: string, data?: any, options: RequestOptions = {}) =>
    apiCall<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }), [apiCall]);

  const put = useCallback(<T = any>(endpoint: string, data?: any, options: RequestOptions = {}) =>
    apiCall<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }), [apiCall]);

  const del = useCallback(<T = any>(endpoint: string, options: RequestOptions = {}) =>
    apiCall<T>(endpoint, { ...options, method: 'DELETE' }), [apiCall]);

  return {
    apiCall,
    get,
    post,
    put,
    delete: del,
  };
};
