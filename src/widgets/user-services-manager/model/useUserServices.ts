import { useState, useEffect, useCallback } from 'react';
import { useApi, API_ENDPOINTS } from '../../../shared/api';
import { useAuth } from '../../../entities/session';

// Interfaces para los servicios de usuario
export interface UserAssistant {
  id: string;
  name: string;
  instructions: string;
  model: string;
  createdAt: string;
}

export interface UserProject {
  id: string;
  key: string;
  name: string;
  description?: string;
}

export interface UserService {
  serviceId: string;
  serviceName: string;
  assistantId: string;
  assistantName: string;
  isActive: boolean;
  lastUpdated: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  configuration?: {
    adminApproved?: boolean;
    adminApprovedAt?: string;
    projectKey?: string;
    disable_tickets_state?: string[];
    disabled_tickets?: string[];
  };
}

export interface UserDashboardData {
  assistants: UserAssistant[];
  projects: UserProject[];
  serviceConfigurations: UserService[];
  totalAssistants: number;
  totalProjects: number;
  totalServices: number;
}

export interface CreateServiceData {
  serviceId: string;
  serviceName: string;
  assistantId: string;
  assistantName: string;
  projectKey: string;
  websiteUrl?: string;
  requestedDomain?: string;
}

export interface UpdateServiceData {
  assistantId?: string;
  assistantName?: string;
  isActive?: boolean;
  configuration?: {
    projectKey?: string;
    disable_tickets_state?: string[];
    disabled_tickets?: string[];
    [key: string]: any;
  };
}

export interface ChatResponse {
  success?: boolean;
  response: string;
  threadId: string;
  assistantId: string;
  assistantName: string;
}

export interface CreateServiceResponse extends UserService {
  message?: string;
  isAdmin?: boolean;
}

export const useUserServices = () => {
  const { get, post, put, delete: deleteRequest } = useApi();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [assistants, setAssistants] = useState<UserAssistant[]>([]);
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [services, setServices] = useState<UserService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar dashboard del usuario
  const loadUserDashboard = useCallback(async () => {
    // Solo cargar si el usuario está autenticado
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading user dashboard...');
      const response = await get(API_ENDPOINTS.USER_DASHBOARD);

      if (response.success && response.data) {
        console.log('📊 User dashboard data received:', response.data);
        setDashboardData(response.data);
        setAssistants(response.data.assistants || []);
        setProjects(response.data.projects || []);
        setServices(response.data.serviceConfigurations || []);
        console.log('✅ User dashboard loaded successfully');
      } else {
        throw new Error(response.error || 'Failed to load user dashboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading user dashboard';
      console.error('❌ User dashboard failed:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [get, isAuthenticated]);

  // Cargar asistentes del usuario
  const loadUserAssistants = useCallback(async () => {
    try {
      console.log('🔄 Loading user assistants...');
      const response = await get(API_ENDPOINTS.USER_ASSISTANTS);

      if (response.success && response.data) {
        console.log('📊 User assistants received:', response.data);
        setAssistants(response.data);
        console.log('✅ User assistants loaded successfully');
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to load user assistants');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading user assistants';
      console.error('❌ User assistants failed:', errorMessage);
      setError(errorMessage);
      return [];
    }
  }, [get]);

  // Cargar proyectos del usuario
  const loadUserProjects = useCallback(async () => {
    try {
      console.log('🔄 Loading user projects...');
      const response = await get(API_ENDPOINTS.USER_PROJECTS);

      if (response.success && response.data) {
        console.log('📊 User projects received:', response.data);
        setProjects(response.data);
        console.log('✅ User projects loaded successfully');
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to load user projects');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading user projects';
      console.error('❌ User projects failed:', errorMessage);
      setError(errorMessage);
      return [];
    }
  }, [get]);

  // Cargar servicios del usuario
  const loadUserServices = useCallback(async () => {
    try {
      console.log('🔄 Loading user services...');
      const response = await get(API_ENDPOINTS.USER_SERVICES_LIST);

      if (response.success && response.data) {
        console.log('📊 User services received:', response.data);
        setServices(response.data);
        console.log('✅ User services loaded successfully');
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to load user services');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading user services';
      console.error('❌ User services failed:', errorMessage);
      setError(errorMessage);
      return [];
    }
  }, [get]);

  // Crear nuevo servicio
  const createService = useCallback(async (serviceData: CreateServiceData): Promise<CreateServiceResponse | null> => {
    try {
      console.log('🔄 Creating user service:', serviceData);
      const response = await post(API_ENDPOINTS.USER_SERVICES_CREATE, serviceData);

      if (response.success && response.data) {
        console.log('✅ User service created:', response.data);
        // Recargar dashboard completo después de crear un servicio
        await loadUserDashboard();
        // Retornar la respuesta completa del servidor que incluye message e isAdmin
        return {
          ...response.data,
          message: response.message,
          isAdmin: (response as any).isAdmin
        };
      } else {
        throw new Error(response.error || 'Failed to create service');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating service';
      console.error('❌ Create service failed:', errorMessage);
      setError(errorMessage);
      return null;
    }
  }, [post, loadUserDashboard]);

  // Actualizar servicio
  const updateService = useCallback(async (serviceId: string, updateData: UpdateServiceData): Promise<UserService | null> => {
    try {
      console.log('🔄 Updating user service:', serviceId, updateData);
      const response = await put(API_ENDPOINTS.USER_SERVICE_UPDATE(serviceId), updateData);

      if (response.success && response.data) {
        console.log('✅ User service updated:', response.data);
        // Recargar dashboard completo después de actualizar
        await loadUserDashboard();
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update service');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating service';
      console.error('❌ Update service failed:', errorMessage);
      setError(errorMessage);
      return null;
    }
  }, [put, loadUserDashboard]);

  // Eliminar servicio
  const deleteService = useCallback(async (serviceId: string): Promise<boolean> => {
    try {
      console.log('🔄 Deleting user service:', serviceId);
      const response = await deleteRequest(API_ENDPOINTS.USER_SERVICE_DELETE(serviceId));

      if (response.success) {
        console.log('✅ User service deleted successfully');
        // Recargar dashboard completo después de eliminar
        await loadUserDashboard();
        return true;
      } else {
        throw new Error(response.error || 'Failed to delete service');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting service';
      console.error('❌ Delete service failed:', errorMessage);
      setError(errorMessage);
      return false;
    }
  }, [deleteRequest, loadUserDashboard]);

  // Chat con servicio
  const chatWithService = useCallback(async (serviceId: string, message: string, threadId?: string): Promise<ChatResponse | null> => {
    try {
      console.log('🔄 Chatting with service:', serviceId);
      const response = await post(API_ENDPOINTS.USER_SERVICE_CHAT(serviceId), {
        message,
        threadId
      });

      console.log('📦 Full response received:', response);

      if (response.success) {
        console.log('✅ Chat response received:', response);
        // La respuesta viene directamente en response, no en response.data
        const apiResponse = response as any;
        return {
          success: true,
          response: apiResponse.response || response.data?.response || '',
          threadId: apiResponse.threadId || response.data?.threadId || '',
          assistantId: apiResponse.assistantId || response.data?.assistantId || '',
          assistantName: apiResponse.assistantName || response.data?.assistantName || ''
        };
      } else {
        throw new Error(response.error || 'Failed to chat with service');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error chatting with service';
      console.error('❌ Chat with service failed:', errorMessage);
      setError(errorMessage);
      return null;
    }
  }, [post]);

  // Obtener asistente activo de un servicio (endpoint público)
  const getServiceAssistant = useCallback(async (serviceId: string) => {
    try {
      console.log('🔄 Getting service assistant:', serviceId);
      const response = await get(API_ENDPOINTS.USER_SERVICE_ASSISTANT(serviceId));

      if (response.success && response.data) {
        console.log('✅ Service assistant received:', response.data);
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to get service assistant');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error getting service assistant';
      console.error('❌ Get service assistant failed:', errorMessage);
      setError(errorMessage);
      return null;
    }
  }, [get]);

  // Cargar datos iniciales solo cuando la autenticación esté lista
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadUserDashboard();
    } else if (!authLoading && !isAuthenticated) {
      // Limpiar datos si no está autenticado
      setDashboardData(null);
      setAssistants([]);
      setProjects([]);
      setServices([]);
      setError(null);
    }
  }, [authLoading, isAuthenticated, loadUserDashboard]);

  return {
    // Estado
    dashboardData,
    assistants,
    projects,
    services,
    isLoading,
    error,

    // Acciones
    loadUserDashboard,
    loadUserAssistants,
    loadUserProjects,
    loadUserServices,
    createService,
    updateService,
    deleteService,
    chatWithService,
    getServiceAssistant,

    // Estadísticas
    totalAssistants: dashboardData?.totalAssistants || 0,
    totalProjects: dashboardData?.totalProjects || 0,
    totalServices: dashboardData?.totalServices || 0,
  };
};
