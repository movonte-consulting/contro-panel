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

interface ProjectsResponse {
  success: boolean;
  count: number;
  projects: Project[];
  timestamp: string;
}

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
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const fetchProjects = useCallback(async () => {
    // Solo hacer la petición si el usuario está autenticado
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Loading projects...');
      const response = await get<ProjectsResponse>(API_ENDPOINTS.PROJECTS);
      
      console.log('📊 Projects response received:', response);
      
      if (response.success) {
        // La respuesta tiene la estructura: { success: true, count: 10, projects: [...], timestamp: "..." }
        const projectsData = response.data || response;
        console.log('📊 Projects data received:', projectsData);
        
        const projects = (projectsData as any).projects || [];
        setProjects(projects);
        
        console.log('✅ Projects loaded:', {
          count: projects.length,
          projects: projects.map((p: any) => ({ key: p.key, name: p.name }))
        });
      } else {
        console.error('❌ Projects response failed:', response);
        setError(response.error || 'Error al obtener los proyectos');
        setProjects([]);
        setActiveProjectState(null);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Error de conexión al obtener los proyectos');
      setProjects([]);
      setActiveProjectState(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchActiveProject = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      console.log('🔄 Loading active project from dashboard...');
      const response = await get<{ 
        assistants: any[]; 
        projects: any[]; 
        serviceConfigurations: any[]; 
        activeProject: string; 
        activeAssistant: string; 
        totalAssistants: number; 
      }>(API_ENDPOINTS.DASHBOARD);
      
      if (response.success && response.data) {
        setActiveProjectState(response.data.activeProject || null);
        console.log('✅ Active project loaded:', response.data.activeProject);
      }
    } catch (err) {
      console.error('Error fetching active project:', err);
    }
  }, [isAuthenticated]);

  const setActiveProject = useCallback(async (projectKey: string): Promise<boolean> => {
    if (!projectKey) {
      setError('Se requiere el projectKey');
      return false;
    }

    try {
      setError(null);
      
      console.log('🔄 Setting active project:', projectKey);
      const response = await post(API_ENDPOINTS.PROJECTS_SET_ACTIVE, {
        projectKey
      });
      
      console.log('📊 Set active project response:', response);
      
      if (response.success) {
        setActiveProjectState(projectKey);
        console.log('✅ Active project updated:', projectKey);
        return true;
      } else {
        setError(response.error || 'Error al actualizar el proyecto activo');
        return false;
      }
    } catch (err) {
      console.error('Error setting active project:', err);
      setError('Error de conexión al actualizar el proyecto activo');
      return false;
    }
  }, [post]);

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
