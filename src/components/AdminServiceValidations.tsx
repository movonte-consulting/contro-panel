import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Globe, 
  MessageSquare,
  Search,
  RefreshCw
} from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface ServiceValidation {
  id: number;
  serviceName: string;
  serviceDescription?: string;
  websiteUrl: string;
  requestedDomain: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  validatedBy?: number;
  validatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

interface AdminServiceValidationsProps {
  onValidationUpdate?: () => void;
}

export const AdminServiceValidations: React.FC<AdminServiceValidationsProps> = ({ 
  onValidationUpdate 
}) => {
  const [validations, setValidations] = useState<ServiceValidation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValidation, setSelectedValidation] = useState<ServiceValidation | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState<number | null>(null);

  // Cargar solicitudes de validación
  const loadValidations = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.SERVICE_VALIDATION_PENDING, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar solicitudes');
      }

      const data = await response.json();
      setValidations(data.data?.validations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Aprobar solicitud
  const approveValidation = async (validationId: number) => {
    try {
      setProcessing(validationId);
      const response = await fetch(API_ENDPOINTS.SERVICE_VALIDATION_APPROVE(validationId.toString()), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminNotes: adminNotes || 'Aprobado por administrador'
        })
      });

      if (!response.ok) {
        throw new Error('Error al aprobar solicitud');
      }

      await loadValidations();
      setSelectedValidation(null);
      setAdminNotes('');
      onValidationUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aprobar solicitud');
    } finally {
      setProcessing(null);
    }
  };

  // Rechazar solicitud
  const rejectValidation = async (validationId: number) => {
    try {
      setProcessing(validationId);
      const response = await fetch(API_ENDPOINTS.SERVICE_VALIDATION_REJECT(validationId.toString()), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminNotes: adminNotes || 'Rechazado por administrador'
        })
      });

      if (!response.ok) {
        throw new Error('Error al rechazar solicitud');
      }

      await loadValidations();
      setSelectedValidation(null);
      setAdminNotes('');
      onValidationUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al rechazar solicitud');
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    loadValidations();
  }, []);

  // Filtrar validaciones
  const filteredValidations = validations.filter(validation => {
    const matchesFilter = filter === 'all' || validation.status === filter;
    const matchesSearch = searchTerm === '' || 
      validation.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      validation.user?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      validation.requestedDomain.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
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
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando solicitudes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Solicitudes de Validación</h2>
          <p className="text-gray-600">Gestiona las solicitudes de servicios de tus usuarios</p>
        </div>
        <button
          onClick={loadValidations}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por servicio, usuario o dominio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Todas' : getStatusText(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de validaciones */}
      <div className="bg-white rounded-lg shadow">
        {filteredValidations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No hay solicitudes que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredValidations.map((validation) => (
              <div key={validation.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {validation.serviceName}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(validation.status)}`}>
                        {getStatusIcon(validation.status)}
                        {getStatusText(validation.status)}
                      </span>
                    </div>
                    
                    {validation.serviceDescription && (
                      <p className="text-gray-600 mb-3">{validation.serviceDescription}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          <strong>Usuario:</strong> {validation.user?.username} ({validation.user?.email})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          <strong>Dominio:</strong> {validation.requestedDomain}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>URL: {validation.websiteUrl}</span>
                    </div>
                    
                    {validation.adminNotes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Notas del administrador:</strong> {validation.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {validation.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setSelectedValidation(validation)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Revisar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de revisión */}
      {selectedValidation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Revisar Solicitud: {selectedValidation.serviceName}
                </h3>
                <button
                  onClick={() => setSelectedValidation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario
                  </label>
                  <p className="text-gray-900">{selectedValidation.user?.username} ({selectedValidation.user?.email})</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción del Servicio
                  </label>
                  <p className="text-gray-900">{selectedValidation.serviceDescription || 'Sin descripción'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL del Sitio Web
                  </label>
                  <p className={`text-gray-900 ${!selectedValidation.websiteUrl ? 'text-gray-400 italic' : ''}`}>
                    {selectedValidation.websiteUrl || 'No especificado'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dominio Solicitado
                  </label>
                  <p className={`text-gray-900 ${!selectedValidation.requestedDomain ? 'text-gray-400 italic' : ''}`}>
                    {selectedValidation.requestedDomain || 'No especificado'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas del Administrador
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Agrega notas sobre tu decisión..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setSelectedValidation(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => rejectValidation(selectedValidation.id)}
                  disabled={processing === selectedValidation.id}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {processing === selectedValidation.id ? 'Procesando...' : 'Rechazar'}
                </button>
                <button
                  onClick={() => approveValidation(selectedValidation.id)}
                  disabled={processing === selectedValidation.id}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {processing === selectedValidation.id ? 'Procesando...' : 'Aprobar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServiceValidations;