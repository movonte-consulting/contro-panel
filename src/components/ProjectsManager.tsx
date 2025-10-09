import React, { useState } from 'react';
import { Loader2, FolderOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useActivityContext } from '../contexts/ActivityContext';

const ProjectsManager: React.FC = () => {
  const { projects, activeProject, isLoading, error, setActiveProject } = useProjects();
  const { addActivity } = useActivityContext();
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleProjectChange = async (projectKey: string) => {
    if (!projectKey) return;

    setIsUpdating(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const success = await setActiveProject(projectKey);
      if (success) {
        setSuccessMessage(`Proyecto activo cambiado a: ${projectKey}`);
        addActivity(`Project changed to ${projectKey}`, 'success');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Error al cambiar el proyecto activo');
        addActivity(`Failed to change project to ${projectKey}`, 'error');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (err) {
      setErrorMessage('Error de conexión al cambiar el proyecto');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="ml-3 text-gray-600">Cargando proyectos...</p>
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FolderOpen className="w-5 h-5 mr-2 text-blue-600" />
              AI Enabled Projects
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
        {/* Proyecto Activo */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium opacity-90">Proyecto Activo:</div>
              <div className="text-lg font-semibold">
                {activeProject ? (
                  projects.find(p => p.key === activeProject)?.name || activeProject
                ) : (
                  'Ninguno'
                )}
              </div>
            </div>
            {activeProject && (
              <div className="text-sm opacity-90">
                Key: {activeProject}
              </div>
            )}
          </div>
        </div>

        {/* Selector de Proyecto */}
        <div>
          <label htmlFor="projectSelect" className="block text-sm font-medium text-gray-700 mb-2">
            Cambiar Proyecto Activo
          </label>
          <div className="flex gap-2">
            <select
              id="projectSelect"
              value={activeProject || ''}
              onChange={(e) => handleProjectChange(e.target.value)}
              disabled={isUpdating}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar proyecto...</option>
              {projects.map((project) => (
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

        {/* Lista de Proyectos */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Proyectos Disponibles</h3>
          <div className="space-y-2">
            {projects.length === 0 ? (
              <div className="text-center text-gray-500 p-4">
                <FolderOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <span>No hay proyectos disponibles</span>
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.key}
                  className={`p-3 rounded-lg border transition-all ${
                    project.key === activeProject
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {project.name}
                        </h4>
                        {project.key === activeProject && (
                          <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Activo
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span>Key: {project.key}</span>
                        <span className="ml-2">• Tipo: {project.projectTypeKey}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => handleProjectChange(project.key)}
                        disabled={isUpdating || project.key === activeProject}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                          project.key === activeProject
                            ? 'bg-blue-100 text-blue-800 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {project.key === activeProject ? 'Activo' : 'Activar'}
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

export default ProjectsManager;
