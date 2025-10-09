import React, { useState } from 'react';
import { Loader2, Settings, CheckCircle, AlertCircle, Bot, Power } from 'lucide-react';
import { useServices } from '../hooks/useServices';
import { useAssistants } from '../hooks/useAssistants';

const ServicesManager: React.FC = () => {
  const { services, isLoading, error, updateService, toggleService } = useServices();
  const { assistants } = useAssistants();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleAssistantChange = async (serviceId: string, assistantId: string) => {
    if (!assistantId) return;

    const assistant = assistants.find(a => a.id === assistantId);
    if (!assistant) return;

    setIsUpdating(serviceId);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const success = await updateService(serviceId, assistantId, assistant.name || 'Sin nombre');
      if (success) {
        setSuccessMessage(`Asistente "${assistant.name}" aplicado al servicio ${serviceId}`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Error al actualizar el servicio');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (err) {
      setErrorMessage('Error de conexión al actualizar el servicio');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleToggleService = async (serviceId: string, currentStatus: boolean) => {
    setIsUpdating(serviceId);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const success = await toggleService(serviceId, !currentStatus);
      if (success) {
        const newStatus = !currentStatus;
        setSuccessMessage(`Servicio ${serviceId} ${newStatus ? 'activado' : 'desactivado'}`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Error al cambiar el estado del servicio');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (err) {
      setErrorMessage('Error de conexión al cambiar el estado del servicio');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="ml-3 text-gray-600">Cargando servicios...</p>
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
          <Settings className="w-5 h-5 mr-2 text-green-600" />
          Services Management
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

      <div className="space-y-6">
        {services.length === 0 ? (
          <div className="text-center text-gray-500 p-8">
            <Settings className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <span>No hay servicios configurados</span>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.serviceId}
              className={`p-4 rounded-lg border transition-all ${
                service.isActive
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${
                    service.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                  }`}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900 capitalize">
                      {service.serviceId.replace('-', ' ')}
                    </h3>
                    <p className="text-xs text-gray-500">
                      ID: {service.serviceId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    service.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {service.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                  <button
                    onClick={() => handleToggleService(service.serviceId, service.isActive)}
                    disabled={isUpdating === service.serviceId}
                    className={`p-2 rounded-lg transition-colors ${
                      service.isActive
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={service.isActive ? 'Desactivar servicio' : 'Activar servicio'}
                  >
                    {isUpdating === service.serviceId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Power className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Información del Asistente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asistente Actual
                  </label>
                  <div className="text-sm text-gray-900">
                    {service.assistantName || 'Sin asignar'}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {service.assistantId || 'N/A'}
                  </div>
                </div>

                {/* Selector de Asistente */}
                <div>
                  <label htmlFor={`assistant-${service.serviceId}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Cambiar Asistente
                  </label>
                  <div className="flex gap-2">
                    <select
                      id={`assistant-${service.serviceId}`}
                      value={service.assistantId || ''}
                      onChange={(e) => handleAssistantChange(service.serviceId, e.target.value)}
                      disabled={isUpdating === service.serviceId}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                    >
                      <option value="">Seleccionar asistente...</option>
                      {assistants.map((assistant) => (
                        <option key={assistant.id} value={assistant.id}>
                          {assistant.name || `Assistant ${assistant.id.slice(0, 8)}`}
                        </option>
                      ))}
                    </select>
                    {isUpdating === service.serviceId && (
                      <div className="flex items-center px-3 py-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Última actualización: {new Date(service.lastUpdated).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServicesManager;
