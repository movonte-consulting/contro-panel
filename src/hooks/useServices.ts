import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { useAuth } from './useAuth';
import { API_ENDPOINTS } from '../config/api';

interface ServiceConfiguration {
  serviceId: string;
  assistantId: string;
  assistantName: string;
  isActive: boolean;
  lastUpdated: string;
}

interface ServicesData {
  serviceConfigurations: ServiceConfiguration[];
}

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
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const fetchServices = useCallback(async () => {
    // Solo hacer la petición si el usuario está autenticado
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Loading services from dashboard...');
      const response = await get<ServicesData>(API_ENDPOINTS.DASHBOARD);
      
      console.log('📊 Services response received:', response);
      
      if (response.success && response.data) {
        const dashboardData = response.data;
        console.log('📊 Services data received:', dashboardData);
        
        setServices(dashboardData.serviceConfigurations || []);
        
        console.log('✅ Services loaded:', {
          count: dashboardData.serviceConfigurations?.length || 0
        });
      } else {
        console.error('❌ Services response failed:', response);
        setError(response.error || 'Error al obtener los servicios');
        setServices([]);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Error de conexión al obtener los servicios');
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

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
      
      console.log('🔄 Updating service:', { serviceId, assistantId, assistantName });
      const response = await put(API_ENDPOINTS.SERVICE_UPDATE(serviceId), {
        assistantId,
        assistantName,
        isActive: true
      });
      
      console.log('📊 Update service response:', response);
      
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
        console.log('✅ Service updated:', serviceId);
        return true;
      } else {
        setError(response.error || 'Error al actualizar el servicio');
        return false;
      }
    } catch (err) {
      console.error('Error updating service:', err);
      setError('Error de conexión al actualizar el servicio');
      return false;
    }
  }, [put]);

  const toggleService = useCallback(async (
    serviceId: string, 
    isActive: boolean
  ): Promise<boolean> => {
    try {
      setError(null);
      
      console.log('🔄 Toggling service:', { serviceId, isActive });
      const response = await put(API_ENDPOINTS.SERVICE_TOGGLE(serviceId), {
        isActive
      });
      
      console.log('📊 Toggle service response:', response);
      
      if (response.success) {
        // Actualizar el servicio en el estado local
        setServices(prev => prev.map(service => 
          service.serviceId === serviceId 
            ? { ...service, isActive }
            : service
        ));
        console.log('✅ Service toggled:', serviceId, isActive);
        return true;
      } else {
        setError(response.error || 'Error al cambiar el estado del servicio');
        return false;
      }
    } catch (err) {
      console.error('Error toggling service:', err);
      setError('Error de conexión al cambiar el estado del servicio');
      return false;
    }
  }, [put]);

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

