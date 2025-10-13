import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { useAuth } from './useAuth';
import { API_ENDPOINTS } from '../config/api';

interface Assistant {
  id: string;
  name: string;
  model: string;
  isActive: boolean;
  isGlobalActive?: boolean;
}

interface DashboardData {
  assistants: Assistant[];
  projects: any[];
  serviceConfigurations: any[];
  activeProject: string;
  activeAssistant: string;
  totalAssistants: number;
}

interface UseAssistantsReturn {
  assistants: Assistant[];
  activeAssistant: string;
  totalAssistants: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAssistants = (): UseAssistantsReturn => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [activeAssistant, setActiveAssistant] = useState<string>('');
  const [totalAssistants, setTotalAssistants] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { get } = useApi();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const fetchAssistants = useCallback(async () => {
    // Solo hacer la petición si el usuario está autenticado
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Loading user assistants...');
      const response = await get<{ data: Assistant[] }>(API_ENDPOINTS.USER_ASSISTANTS);
      
      console.log('📊 User assistants response received:', response);
      
      if (response.success && response.data) {
        const assistants = response.data;
        console.log('📊 User assistants data received:', assistants);
        
        setAssistants(assistants || []);
        setTotalAssistants(assistants?.length || 0);
        
        console.log('✅ User assistants loaded:', {
          count: assistants?.length || 0
        });
      } else {
        console.error('❌ User assistants response failed:', response);
        setError(response.error || 'Error al obtener los asistentes del usuario');
        setAssistants([]);
        setActiveAssistant('');
        setTotalAssistants(0);
      }
    } catch (err) {
      console.error('Error fetching user assistants:', err);
      setError('Error de conexión al obtener los asistentes del usuario');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Solo hacer fetch si la autenticación ya se cargó y el usuario está autenticado
    if (!authLoading && isAuthenticated) {
      fetchAssistants();
    } else if (!authLoading && !isAuthenticated) {
      // Si no está autenticado, limpiar los datos
      setAssistants([]);
      setActiveAssistant('');
      setTotalAssistants(0);
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  return {
    assistants,
    activeAssistant,
    totalAssistants,
    isLoading,
    error,
    refetch: fetchAssistants
  };
};
