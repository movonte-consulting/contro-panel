import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { useAuth } from './useAuth';
import { API_ENDPOINTS } from '../config/api';

interface Project {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
}

// interface ProjectsResponse {
//   success: boolean;
//   count: number;
//   projects: Project[];
//   timestamp: string;
// }

interface UseProjectsReturn {
  projects: Project[];
  activeProject: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setActiveProject: (projectKey: string) => Promise<boolean>;
}

export const useProjects = (): UseProjectsReturn => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProjectState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { get, post } = useApi();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const fetchProjects = useCallback(async () => {
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
      const endpoint = isAdmin ? API_ENDPOINTS.PROJECTS : API_ENDPOINTS.USER_PROJECTS;
      
      console.log(`🔄 Loading ${isAdmin ? 'admin' : 'user'} projects...`);
      const response = await get<{ data: Project[] }>(endpoint);
      
      console.log(`📊 ${isAdmin ? 'Admin' : 'User'} projects response received:`, response);
      
      if (response.success && response.data) {
        const projects = response.data;
        console.log(`📊 ${isAdmin ? 'Admin' : 'User'} projects data received:`, projects);
        
        // Para admin, los datos vienen del endpoint de proyectos con estructura diferente
        let projectsArray: Project[] = [];
        if (isAdmin) {
          // Admin: response.data (array directo)
          projectsArray = Array.isArray(projects) ? projects : [];
        } else {
          // Usuario: response.data (array directo o con propiedad data)
          projectsArray = Array.isArray(projects) ? projects : (projects as any)?.data || [];
        }
        
        setProjects(projectsArray);
        
        console.log(`✅ ${isAdmin ? 'Admin' : 'User'} projects loaded:`, {
          count: projectsArray.length,
          projects: projectsArray.map((p: Project) => ({ key: p.key, name: p.name }))
        });
      } else {
        console.error(`❌ ${isAdmin ? 'Admin' : 'User'} projects response failed:`, response);
        setError(response.error || `Error al obtener los proyectos ${isAdmin ? 'del sistema' : 'del usuario'}`);
        setProjects([]);
        setActiveProjectState(null);
      }
    } catch (err) {
      const isAdmin = user?.role === 'admin';
      console.error(`Error fetching ${isAdmin ? 'admin' : 'user'} projects:`, err);
      setError(`Error de conexión al obtener los proyectos ${isAdmin ? 'del sistema' : 'del usuario'}`);
      setProjects([]);
      setActiveProjectState(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  const fetchActiveProject = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      // Determinar qué endpoint usar según el rol del usuario
      const isAdmin = user?.role === 'admin';
      const endpoint = isAdmin ? API_ENDPOINTS.DASHBOARD : API_ENDPOINTS.USER_DASHBOARD;
      
      console.log(`🔄 Loading active project from ${isAdmin ? 'admin' : 'user'} dashboard...`);
      const response = await get<{ 
        assistants: any[]; 
        projects: any[]; 
        serviceConfigurations: any[]; 
        activeProject: string; 
        activeAssistant: string; 
        totalAssistants: number; 
      }>(endpoint);
      
      if (response.success && response.data) {
        setActiveProjectState(response.data.activeProject || null);
        console.log(`✅ Active project loaded from ${isAdmin ? 'admin' : 'user'} dashboard:`, response.data.activeProject);
      }
    } catch (err) {
      console.error(`Error fetching active project from ${user?.role === 'admin' ? 'admin' : 'user'} dashboard:`, err);
    }
  }, [isAuthenticated, user?.role]);

  const setActiveProject = useCallback(async (projectKey: string): Promise<boolean> => {
    if (!projectKey) {
      setError('Se requiere el projectKey');
      return false;
    }

    try {
      setError(null);
      
      // Determinar qué endpoint usar según el rol del usuario
      const isAdmin = user?.role === 'admin';
      const endpoint = isAdmin ? API_ENDPOINTS.DASHBOARD : API_ENDPOINTS.USER_DASHBOARD;
      
      console.log(`🔄 Setting active project for ${isAdmin ? 'admin' : 'user'}:`, projectKey);
      const response = await post(endpoint, {
        activeProject: projectKey
      });
      
      console.log(`📊 Set active project response for ${isAdmin ? 'admin' : 'user'}:`, response);
      
      if (response.success) {
        setActiveProjectState(projectKey);
        console.log(`✅ Active project updated for ${isAdmin ? 'admin' : 'user'}:`, projectKey);
        return true;
      } else {
        setError(response.error || `Error al actualizar el proyecto activo ${isAdmin ? 'del sistema' : 'del usuario'}`);
        return false;
      }
    } catch (err) {
      const isAdmin = user?.role === 'admin';
      console.error(`Error setting active project for ${isAdmin ? 'admin' : 'user'}:`, err);
      setError(`Error de conexión al actualizar el proyecto activo ${isAdmin ? 'del sistema' : 'del usuario'}`);
      return false;
    }
  }, [post, user?.role]);

  useEffect(() => {
    // Solo hacer fetch si la autenticación ya se cargó y el usuario está autenticado
    if (!authLoading && isAuthenticated) {
      fetchProjects();
      fetchActiveProject();
    } else if (!authLoading && !isAuthenticated) {
      // Si no está autenticado, limpiar los datos
      setProjects([]);
      setActiveProjectState(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading, fetchProjects, fetchActiveProject]);

  return {
    projects,
    activeProject,
    isLoading,
    error,
    refetch: fetchProjects,
    setActiveProject
  };
};
