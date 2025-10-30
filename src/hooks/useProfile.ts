import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { useAuth } from './useAuth';
import { API_ENDPOINTS } from '../config/api';

interface UserPermissions {
  serviceManagement: boolean;
  automaticAIDisableRules: boolean;
  webhookConfiguration: boolean;
  ticketControl: boolean;
  aiEnabledProjects: boolean;
  remoteServerIntegration: boolean;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  permissions: UserPermissions;
  lastLogin: string;
  createdAt: string;
  jiraUrl?: string;
  organizationLogo?: string;
}

interface UseProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
}

export const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { get, put } = useApi();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const fetchProfile = useCallback(async () => {
    // Solo hacer la petición si el usuario está autenticado
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await get<{ user: UserProfile }>(API_ENDPOINTS.PROFILE);
      
      if (response.success && response.data) {
        setProfile(response.data.user);
      } else {
        setError(response.error || 'Error al obtener el perfil');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Error de conexión al obtener el perfil');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]); // Removido 'get' de las dependencias

  const updateProfile = useCallback(async (data: Partial<UserProfile>): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await put<{ user: UserProfile }>(API_ENDPOINTS.PROFILE, data);
      
      if (response.success && response.data) {
        setProfile(response.data.user);
        return true;
      } else {
        setError(response.error || 'Error al actualizar el perfil');
        return false;
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Error de conexión al actualizar el perfil');
      return false;
    }
  }, []); // Removido 'put' de las dependencias

  useEffect(() => {
    // Solo hacer fetch si la autenticación ya se cargó y el usuario está autenticado
    if (!authLoading && isAuthenticated) {
      fetchProfile();
    } else if (!authLoading && !isAuthenticated) {
      // Si no está autenticado, limpiar el perfil
      setProfile(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading]); // Removido 'fetchProfile' de las dependencias

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    updateProfile
  };
};
