import React, { useState } from 'react';
import { Loader2, Server, CheckCircle, AlertCircle, Globe } from 'lucide-react';
import { useRemoteProjects } from '../hooks/useRemoteProjects';
import { useActivityContext } from '../contexts/ActivityContext';

const RemoteProjectsManager: React.FC = () => {
  const { 
    remoteProjects, 
    remoteActiveProject, 
    remoteServerUrl, 
    isLoading, 
    error, 
    setRemoteServerUrl, 
    setRemoteActiveProject 
  } = useRemoteProjects();
  const { addActivity } = useActivityContext();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleServerUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRemoteServerUrl(e.target.value);
  };

  const handleProjectChange = async (projectKey: string) => {
    if (!projectKey) return;

    setIsUpdating(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const success = await setRemoteActiveProject(projectKey);
      if (success) {
        setSuccessMessage(`Proyecto remoto activo cambiado a: ${projectKey}`);
        addActivity(`Remote project changed to ${projectKey}`, 'success');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Error al cambiar el proyecto remoto activo');
        addActivity(`Failed to change remote project to ${projectKey}`, 'error');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (err) {
      setErrorMessage('Error de conexión al cambiar el proyecto remoto');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="ml-3 text-gray-600">Cargando proyectos remotos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative p-6">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  const currentProject = remoteProjects.find(p => p.key === remoteActiveProject);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Server className="w-5 h-5 mr-2 text-green-600" />
          Remote Server Integration
        </h2>
      </div>

      {/* Mensajes de estado */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          {errorMessage}
        </div>
      )}

      <div className="space-y-4">
        {/* URL del Servidor Remoto */}
        <div>
          <label htmlFor="remoteServerUrl" className="block text-sm font-medium text-gray-700 mb-2">
            URL del Servidor Remoto
          </label>
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              id="remoteServerUrl"
              value={remoteServerUrl}
              onChange={handleServerUrlChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://form.movonte.com"
            />
          </div>
        </div>

        {/* Proyecto Activo Remoto */}
        <div className="bg-gradient-to-br from-green-500 to-blue-600 text-white rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium opacity-90">Proyecto Remoto Activo:</div>
              <div className="text-lg font-semibold">
                {currentProject ? currentProject.name : 'Ninguno'}
              </div>
            </div>
            {remoteActiveProject && (
              <div className="text-sm opacity-90">
                Key: {remoteActiveProject}
              </div>
            )}
          </div>
        </div>

        {/* Selector de Proyecto Remoto */}
        <div>
          <label htmlFor="remoteProjectSelect" className="block text-sm font-medium text-gray-700 mb-2">
            Cambiar Proyecto Remoto Activo
          </label>
          <div className="flex gap-2">
            <select
              id="remoteProjectSelect"
              value={remoteActiveProject || ''}
              onChange={(e) => handleProjectChange(e.target.value)}
              disabled={isUpdating}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar proyecto remoto...</option>
              {remoteProjects.map((project) => (
                <option key={project.key} value={project.key}>
                  {project.name} ({project.key})
                </option>
              ))}
            </select>
            {isUpdating && (
              <div className="flex items-center px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              </div>
            )}
          </div>
        </div>

        {/* Lista de Proyectos Remotos */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Proyectos Remotos Disponibles</h3>
          <div className="space-y-2">
            {remoteProjects.length === 0 ? (
              <div className="text-center text-gray-500 p-4">
                <Server className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <span>No hay proyectos remotos disponibles</span>
              </div>
            ) : (
              remoteProjects.map((project) => (
                <div
                  key={project.key}
                  className={`p-3 rounded-lg border transition-all ${
                    project.key === remoteActiveProject
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {project.name}
                        </h4>
                        {project.key === remoteActiveProject && (
                          <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Activo
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span>Key: {project.key}</span>
                        <span className="ml-2">• ID: {project.id}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => handleProjectChange(project.key)}
                        disabled={isUpdating || project.key === remoteActiveProject}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                          project.key === remoteActiveProject
                            ? 'bg-green-100 text-green-800 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {project.key === remoteActiveProject ? 'Activo' : 'Activar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoteProjectsManager;
