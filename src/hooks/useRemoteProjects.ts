import { useState, useEffect, useCallback } from 'react';

interface RemoteProject {
  key: string;
  name: string;
  id: string;
}

interface UseRemoteProjectsReturn {
  remoteProjects: RemoteProject[];
  remoteActiveProject: string | null;
  remoteServerUrl: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setRemoteServerUrl: (url: string) => void;
  setRemoteActiveProject: (projectKey: string) => Promise<boolean>;
}

export const useRemoteProjects = (): UseRemoteProjectsReturn => {
  const [remoteProjects, setRemoteProjects] = useState<RemoteProject[]>([]);
  const [remoteActiveProject, setRemoteActiveProjectState] = useState<string | null>(null);
  const [remoteServerUrl, setRemoteServerUrlState] = useState<string>('https://form.movonte.com');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRemoteProjects = useCallback(async () => {
    if (!remoteServerUrl) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Loading remote projects from:', remoteServerUrl);
      const response = await fetch(`${remoteServerUrl}/api/projects/available`);
      const data = await response.json();
      
      if (data.success) {
        setRemoteProjects(data.availableProjects || []);
        console.log('✅ Remote projects loaded:', data.availableProjects?.length || 0);
      } else {
        throw new Error(data.error || 'Failed to load remote projects');
      }
    } catch (err) {
      console.error('Error loading remote projects:', err);
      setError(`Error loading remote projects: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setRemoteProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [remoteServerUrl]);

  const fetchRemoteActiveProject = useCallback(async () => {
    if (!remoteServerUrl) return;

    try {
      console.log('🔄 Loading remote active project from:', remoteServerUrl);
      const response = await fetch(`${remoteServerUrl}/api/projects/current`);
      const data = await response.json();
      
      if (data.success) {
        setRemoteActiveProjectState(data.currentProject?.key || null);
        console.log('✅ Remote active project loaded:', data.currentProject?.key);
      }
    } catch (err) {
      console.error('Error loading remote active project:', err);
    }
  }, [remoteServerUrl]);

  const setRemoteServerUrl = useCallback((url: string) => {
    setRemoteServerUrlState(url);
  }, []);

  const setRemoteActiveProject = useCallback(async (projectKey: string): Promise<boolean> => {
    if (!projectKey || !remoteServerUrl) {
      setError('Se requiere el projectKey y remoteServerUrl');
      return false;
    }

    try {
      setError(null);
      
      console.log('🔄 Setting remote active project:', projectKey);
      const response = await fetch(`${remoteServerUrl}/api/projects/set-active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectKey })
      });

      const data = await response.json();
      
      if (data.success) {
        setRemoteActiveProjectState(projectKey);
        console.log('✅ Remote active project updated:', projectKey);
        return true;
      } else {
        setError(data.error || 'Error al actualizar el proyecto remoto activo');
        return false;
      }
    } catch (err) {
      console.error('Error setting remote active project:', err);
      setError('Error de conexión al actualizar el proyecto remoto activo');
      return false;
    }
  }, [remoteServerUrl]);

  useEffect(() => {
    if (remoteServerUrl) {
      fetchRemoteProjects();
      fetchRemoteActiveProject();
    }
  }, [remoteServerUrl, fetchRemoteProjects, fetchRemoteActiveProject]);

  return {
    remoteProjects,
    remoteActiveProject,
    remoteServerUrl,
    isLoading,
    error,
    refetch: fetchRemoteProjects,
    setRemoteServerUrl,
    setRemoteActiveProject
  };
};

