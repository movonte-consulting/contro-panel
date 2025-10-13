import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useApi } from './useApi';
import { API_ENDPOINTS } from '../config/api';

interface ChatKitSession {
  client_secret: string;
  session_id: string;
  expires_at: string;
}

interface UseChatKitReturn {
  createSession: () => Promise<string>;
  refreshSession: (existingSecret: string) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

export const useChatKit = (): UseChatKitReturn => {
  const { isAuthenticated, user, token } = useAuth();
  const { post } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async (): Promise<string> => {
    console.log('🔍 useChatKit: createSession called', { isAuthenticated, user: user?.username, hasToken: !!token });
    
    if (!isAuthenticated || !user || !token) {
      console.error('❌ useChatKit: Usuario no autenticado o datos faltantes');
      throw new Error('Usuario no autenticado');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 useChatKit: Enviando request a', API_ENDPOINTS.CHATKIT_SESSION);
      const response = await post(API_ENDPOINTS.CHATKIT_SESSION, {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        // Información adicional del usuario para el contexto
        userContext: {
          permissions: user.permissions,
          lastLogin: user.lastLogin,
          isInitialSetupComplete: user.isInitialSetupComplete
        }
      }, { requireAuth: true });

      if (response.success && response.data?.client_secret) {
        return response.data.client_secret;
      } else {
        throw new Error(response.error || 'Error al crear sesión de ChatKit');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, token, post]);

  const refreshSession = useCallback(async (existingSecret: string): Promise<string> => {
    if (!isAuthenticated || !user || !token) {
      throw new Error('Usuario no autenticado');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await post(API_ENDPOINTS.CHATKIT_REFRESH, {
        existingSecret,
        userId: user.id
      }, { requireAuth: true });

      if (response.success && response.data?.client_secret) {
        return response.data.client_secret;
      } else {
        throw new Error(response.error || 'Error al refrescar sesión de ChatKit');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, token, post]);

  return {
    createSession,
    refreshSession,
    isLoading,
    error
  };
};
