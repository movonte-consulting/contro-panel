import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Globe, Calendar, MessageSquare, RefreshCw } from 'lucide-react';
import { useServiceValidation, type ServiceValidation } from '../hooks/useServiceValidation';

export const UserServiceValidations: React.FC = () => {
  const { getUserValidations, loading, error } = useServiceValidation();
  const [validations, setValidations] = useState<ServiceValidation[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadValidations = async () => {
    try {
      setRefreshing(true);
      const data = await getUserValidations();
      setValidations(data);
    } catch (err) {
      console.error('Error loading validations:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadValidations();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      default:
        return 'Desconocido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && validations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando solicitudes...</span>
        </div>
      </div>
    );
  }

  if (error && validations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar solicitudes</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadValidations}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (validations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes de validación</h3>
          <p className="text-gray-600">Aún no has enviado ninguna solicitud de validación de servicio.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Mis Solicitudes de Validación</h2>
          <button
            onClick={loadValidations}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {validations.map((validation) => (
          <div key={validation.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{validation.serviceName}</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(validation.status)}`}>
                    {getStatusIcon(validation.status)}
                    {getStatusText(validation.status)}
                  </span>
                </div>

                {validation.serviceDescription && (
                  <p className="text-gray-600 mb-3">{validation.serviceDescription}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="h-4 w-4" />
                    <span className="font-medium">Sitio Web:</span>
                    <a 
                      href={validation.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      {validation.websiteUrl}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="h-4 w-4" />
                    <span className="font-medium">Dominio CORS:</span>
                    <span className="font-mono text-gray-900">{validation.requestedDomain}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Solicitado:</span>
                    <span>{formatDate(validation.createdAt)}</span>
                  </div>

                  {validation.validatedAt && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Procesado:</span>
                      <span>{formatDate(validation.validatedAt)}</span>
                    </div>
                  )}
                </div>

                {validation.adminNotes && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Notas del Administrador:</p>
                        <p className="text-sm text-gray-600">{validation.adminNotes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
