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
      
      console.log('🔄 Loading assistants from dashboard...');
      const response = await get<DashboardData>(API_ENDPOINTS.DASHBOARD);
      
      console.log('📊 Dashboard response received:', response);
      
      if (response.success && response.data) {
        const dashboardData = response.data;
        console.log('📊 Dashboard data received:', dashboardData);
        
        setAssistants(dashboardData.assistants || []);
        setActiveAssistant(dashboardData.activeAssistant || '');
        setTotalAssistants(dashboardData.totalAssistants || 0);
        
        console.log('✅ Assistants loaded:', {
          count: dashboardData.assistants?.length || 0,
          active: dashboardData.activeAssistant,
          total: dashboardData.totalAssistants
        });
      } else {
        console.error('❌ Dashboard response failed:', response);
        setError(response.error || 'Error al obtener los asistentes');
        setAssistants([]);
        setActiveAssistant('');
        setTotalAssistants(0);
      }
    } catch (err) {
      console.error('Error fetching assistants:', err);
      setError('Error de conexión al obtener los asistentes');
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
