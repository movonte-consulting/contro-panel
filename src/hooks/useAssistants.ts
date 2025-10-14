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

// interface DashboardData {
//   assistants: Assistant[];
//   projects: any[];
//   serviceConfigurations: any[];
//   activeProject: string;
//   activeAssistant: string;
//   totalAssistants: number;
// }

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
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const fetchAssistants = useCallback(async () => {
    // Solo hacer la petición si el usuario está autenticado
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Determinar qué endpoint usar según el rol del usuario
      const isAdmin = user?.role === 'admin';
      const endpoint = isAdmin ? API_ENDPOINTS.DASHBOARD : API_ENDPOINTS.USER_ASSISTANTS;
      
      console.log(`🔄 Loading ${isAdmin ? 'admin' : 'user'} assistants...`);
      const response = await get<{ data: Assistant[] }>(endpoint);
      
      console.log(`📊 ${isAdmin ? 'Admin' : 'User'} assistants response received:`, response);
      
      if (response.success && response.data) {
        const assistants = response.data;
        console.log(`📊 ${isAdmin ? 'Admin' : 'User'} assistants data received:`, assistants);
        
        // Para admin, los datos vienen del dashboard con estructura diferente
        let assistantsArray: Assistant[] = [];
        if (isAdmin) {
          // Admin: response.data.assistants
          assistantsArray = (assistants as any)?.assistants || [];
        } else {
          // Usuario: response.data (array directo o con propiedad data)
          assistantsArray = Array.isArray(assistants) ? assistants : (assistants as any)?.data || [];
        }
        
        setAssistants(assistantsArray);
        setTotalAssistants(assistantsArray.length);
        
        console.log(`✅ ${isAdmin ? 'Admin' : 'User'} assistants loaded:`, {
          count: assistantsArray.length
        });
      } else {
        console.error(`❌ ${isAdmin ? 'Admin' : 'User'} assistants response failed:`, response);
        setError(response.error || `Error al obtener los asistentes ${isAdmin ? 'del sistema' : 'del usuario'}`);
        setAssistants([]);
        setActiveAssistant('');
        setTotalAssistants(0);
      }
    } catch (err) {
      const isAdmin = user?.role === 'admin';
      console.error(`Error fetching ${isAdmin ? 'admin' : 'user'} assistants:`, err);
      setError(`Error de conexión al obtener los asistentes ${isAdmin ? 'del sistema' : 'del usuario'}`);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.role]);

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
