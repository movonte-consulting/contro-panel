import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import { useAuth } from './useAuth';
import { API_ENDPOINTS } from '../config/api';

// Interfaces para las instancias de usuario
export interface UserInstance {
  id: number;
  instanceName: string;
  instanceDescription?: string;
  isActive: boolean;
  settings?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstanceData {
  instanceName: string;
  instanceDescription?: string;
  settings?: any;
}

export interface UpdateInstanceData {
  instanceName?: string;
  instanceDescription?: string;
  isActive?: boolean;
  settings?: any;
}

export interface UseUserInstancesReturn {
  instances: UserInstance[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createInstance: (data: CreateInstanceData) => Promise<boolean>;
  updateInstance: (instanceId: number, data: UpdateInstanceData) => Promise<boolean>;
  deleteInstance: (instanceId: number) => Promise<boolean>;
}

export const useUserInstances = (): UseUserInstancesReturn => {
  const [instances, setInstances] = useState<UserInstance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { get, post, put, delete: deleteRequest } = useApi();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const fetchInstances = useCallback(async () => {
    // Solo hacer la petición si el usuario está autenticado
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Loading user instances...');
      const response = await get<{ instances: UserInstance[] }>(API_ENDPOINTS.USER_INSTANCES);
      
      console.log('📊 Instances response received:', response);
      
      if (response.success && response.data) {
        setInstances(response.data.instances || []);
        console.log('✅ Instances loaded:', response.data.instances?.length || 0);
      } else {
        console.error('❌ Instances response failed:', response);
        setError(response.error || 'Error al obtener las instancias');
        setInstances([]);
      }
    } catch (err) {
      console.error('Error fetching instances:', err);
      setError('Error de conexión al obtener las instancias');
      setInstances([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, get]);

  const createInstance = useCallback(async (data: CreateInstanceData): Promise<boolean> => {
    try {
      setError(null);
      
      console.log('🔄 Creating instance:', data.instanceName);
      const response = await post(API_ENDPOINTS.USER_INSTANCES, data);
      
      if (response.success) {
        console.log('✅ Instance created:', data.instanceName);
        await fetchInstances(); // Refresh the list
        return true;
      } else {
        setError(response.error || 'Error al crear la instancia');
        return false;
      }
    } catch (err) {
      console.error('Error creating instance:', err);
      setError('Error de conexión al crear la instancia');
      return false;
    }
  }, [post, fetchInstances]);

  const updateInstance = useCallback(async (instanceId: number, data: UpdateInstanceData): Promise<boolean> => {
    try {
      setError(null);
      
      console.log('🔄 Updating instance:', instanceId);
      const response = await put(API_ENDPOINTS.USER_INSTANCE_UPDATE(instanceId.toString()), data);
      
      if (response.success) {
        console.log('✅ Instance updated:', instanceId);
        await fetchInstances(); // Refresh the list
        return true;
      } else {
        setError(response.error || 'Error al actualizar la instancia');
        return false;
      }
    } catch (err) {
      console.error('Error updating instance:', err);
      setError('Error de conexión al actualizar la instancia');
      return false;
    }
  }, [put, fetchInstances]);

  const deleteInstance = useCallback(async (instanceId: number): Promise<boolean> => {
    try {
      setError(null);
      
      console.log('🔄 Deleting instance:', instanceId);
      const response = await deleteRequest(API_ENDPOINTS.USER_INSTANCE_DELETE(instanceId.toString()));
      
      if (response.success) {
        console.log('✅ Instance deleted:', instanceId);
        await fetchInstances(); // Refresh the list
        return true;
      } else {
        setError(response.error || 'Error al eliminar la instancia');
        return false;
      }
    } catch (err) {
      console.error('Error deleting instance:', err);
      setError('Error de conexión al eliminar la instancia');
      return false;
    }
  }, [deleteRequest, fetchInstances]);

  useEffect(() => {
    // Solo hacer fetch si la autenticación ya se cargó y el usuario está autenticado
    if (!authLoading && isAuthenticated) {
      fetchInstances();
    } else if (!authLoading && !isAuthenticated) {
      // Si no está autenticado, limpiar las instancias
      setInstances([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading, fetchInstances]);

  return {
    instances,
    isLoading,
    error,
    refetch: fetchInstances,
    createInstance,
    updateInstance,
    deleteInstance
  };
};


