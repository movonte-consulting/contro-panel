import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { useAuth } from './useAuth';
import { API_ENDPOINTS } from '../config/api';

interface ServiceConfiguration {
  serviceId: string;
  serviceName: string;
  assistantId: string;
  assistantName: string;
  isActive: boolean;
  lastUpdated: string;
  configuration?: any;
}

// interface ServicesData {
//   serviceConfigurations: ServiceConfiguration[];
// }

interface UseServicesReturn {
  services: ServiceConfiguration[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateService: (serviceId: string, assistantId: string, assistantName: string) => Promise<boolean>;
  toggleService: (serviceId: string, isActive: boolean) => Promise<boolean>;
}

export const useServices = (): UseServicesReturn => {
  const [services, setServices] = useState<ServiceConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { get, put } = useApi();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const fetchServices = useCallback(async () => {
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
      const endpoint = isAdmin ? API_ENDPOINTS.DASHBOARD : API_ENDPOINTS.USER_SERVICES_LIST;
      
      console.log(`🔄 Loading ${isAdmin ? 'admin' : 'user'} services...`);
      console.log(`🔍 Endpoint: ${endpoint}`);
      
      const response = await get<any>(endpoint);
      
      console.log(`📊 ${isAdmin ? 'Admin' : 'User'} services response received:`, response);
      
      if (response.success && response.data) {
        console.log(`📦 Raw response.data:`, response.data);
        console.log(`📦 Is response.data an array?`, Array.isArray(response.data));
        
        // Para admin, los datos vienen del dashboard con estructura diferente
        let servicesArray: ServiceConfiguration[] = [];
        if (isAdmin) {
          // Admin: response.data.serviceConfigurations
          servicesArray = response.data.serviceConfigurations || [];
          console.log(`👑 Admin services array:`, servicesArray);
        } else {
          // Usuario: response.data es directamente el array
          if (Array.isArray(response.data)) {
            servicesArray = response.data;
          } else if (response.data.serviceConfigurations) {
            // Por si acaso viene con la misma estructura que admin
            servicesArray = response.data.serviceConfigurations;
          } else {
            servicesArray = [];
          }
          console.log(`👤 User services array:`, servicesArray);
        }
        
        setServices(servicesArray);
        
        console.log(`✅ ${isAdmin ? 'Admin' : 'User'} services loaded:`, {
          count: servicesArray.length,
          services: servicesArray
        });
      } else {
        console.error(`❌ ${isAdmin ? 'Admin' : 'User'} services response failed:`, response);
        setError(response.error || `Error al obtener los servicios ${isAdmin ? 'del sistema' : 'del usuario'}`);
        setServices([]);
      }
    } catch (err) {
      const isAdmin = user?.role === 'admin';
      console.error(`Error fetching ${isAdmin ? 'admin' : 'user'} services:`, err);
      setError(`Error de conexión al obtener los servicios ${isAdmin ? 'del sistema' : 'del usuario'}`);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  const updateService = useCallback(async (
    serviceId: string, 
    assistantId: string, 
    assistantName: string
  ): Promise<boolean> => {
    if (!serviceId || !assistantId || !assistantName) {
      setError('assistantId y assistantName son requeridos');
      return false;
    }

    try {
      setError(null);
      
      // Determinar qué endpoint usar según el rol del usuario
      const isAdmin = user?.role === 'admin';
      const endpoint = isAdmin ? API_ENDPOINTS.SERVICE_UPDATE(serviceId) : API_ENDPOINTS.USER_SERVICE_UPDATE(serviceId);
      
      console.log(`🔄 Updating ${isAdmin ? 'admin' : 'user'} service:`, { serviceId, assistantId, assistantName });
      const response = await put(endpoint, {
        assistantId,
        assistantName,
        isActive: true
      });
      
      console.log(`📊 Update ${isAdmin ? 'admin' : 'user'} service response:`, response);
      
      if (response.success) {
        // Actualizar el servicio en el estado local
        setServices(prev => prev.map(service => 
          service.serviceId === serviceId 
            ? { 
                ...service, 
                assistantId, 
                assistantName, 
                isActive: true,
                lastUpdated: new Date().toISOString()
              }
            : service
        ));
        console.log(`✅ ${isAdmin ? 'Admin' : 'User'} service updated:`, serviceId);
        return true;
      } else {
        setError(response.error || `Error al actualizar el servicio ${isAdmin ? 'del sistema' : 'del usuario'}`);
        return false;
      }
    } catch (err) {
      const isAdmin = user?.role === 'admin';
      console.error(`Error updating ${isAdmin ? 'admin' : 'user'} service:`, err);
      setError(`Error de conexión al actualizar el servicio ${isAdmin ? 'del sistema' : 'del usuario'}`);
      return false;
    }
  }, [put, user?.role]);

  const toggleService = useCallback(async (
    serviceId: string, 
    isActive: boolean
  ): Promise<boolean> => {
    try {
      setError(null);
      
      // Determinar qué endpoint usar según el rol del usuario
      const isAdmin = user?.role === 'admin';
      const endpoint = isAdmin ? API_ENDPOINTS.SERVICE_UPDATE(serviceId) : API_ENDPOINTS.USER_SERVICE_UPDATE(serviceId);
      
      console.log(`🔄 Toggling ${isAdmin ? 'admin' : 'user'} service:`, { serviceId, isActive });
      const response = await put(endpoint, {
        isActive
      });
      
      console.log(`📊 Toggle ${isAdmin ? 'admin' : 'user'} service response:`, response);
      
      if (response.success) {
        // Actualizar el servicio en el estado local
        setServices(prev => prev.map(service => 
          service.serviceId === serviceId 
            ? { ...service, isActive }
            : service
        ));
        console.log(`✅ ${isAdmin ? 'Admin' : 'User'} service toggled:`, serviceId, isActive);
        return true;
      } else {
        setError(response.error || `Error al cambiar el estado del servicio ${isAdmin ? 'del sistema' : 'del usuario'}`);
        return false;
      }
    } catch (err) {
      const isAdmin = user?.role === 'admin';
      console.error(`Error toggling ${isAdmin ? 'admin' : 'user'} service:`, err);
      setError(`Error de conexión al cambiar el estado del servicio ${isAdmin ? 'del sistema' : 'del usuario'}`);
      return false;
    }
  }, [put, user?.role]);

  useEffect(() => {
    // Solo hacer fetch si la autenticación ya se cargó y el usuario está autenticado
    if (!authLoading && isAuthenticated) {
      fetchServices();
    } else if (!authLoading && !isAuthenticated) {
      // Si no está autenticado, limpiar los datos
      setServices([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading, fetchServices]);

  return {
    services,
    isLoading,
    error,
    refetch: fetchServices,
    updateService,
    toggleService
  };
};

