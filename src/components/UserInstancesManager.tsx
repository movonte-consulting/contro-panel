import React, { useState } from 'react';
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  Server, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Settings,
  Calendar
} from 'lucide-react';
import { useUserInstances, type UserInstance, type CreateInstanceData, type UpdateInstanceData } from '../hooks/useUserInstances';
import { useActivityContext } from '../contexts/ActivityContext';

const UserInstancesManager: React.FC = () => {
  const { 
    instances, 
    isLoading, 
    error, 
    createInstance, 
    updateInstance, 
    deleteInstance 
  } = useUserInstances();
  const { addActivity } = useActivityContext();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<UserInstance | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState<CreateInstanceData>({
    instanceName: '',
    instanceDescription: '',
    settings: {}
  });

  const handleCreateInstance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.instanceName.trim()) {
      setErrorMessage('El nombre de la instancia es requerido');
      return;
    }

    setIsUpdating(true);
    setErrorMessage('');

    try {
      const success = await createInstance(formData);
      if (success) {
        setShowCreateModal(false);
        setFormData({ instanceName: '', instanceDescription: '', settings: {} });
        setSuccessMessage('Instancia creada exitosamente');
        addActivity(`Instance "${formData.instanceName}" created`, 'success');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Error al crear la instancia');
      }
    } catch (err) {
      setErrorMessage('Error de conexión al crear la instancia');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateInstance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstance || !formData.instanceName.trim()) {
      setErrorMessage('El nombre de la instancia es requerido');
      return;
    }

    setIsUpdating(true);
    setErrorMessage('');

    try {
      const updateData: UpdateInstanceData = {
        instanceName: formData.instanceName,
        instanceDescription: formData.instanceDescription,
        settings: formData.settings
      };

      const success = await updateInstance(selectedInstance.id, updateData);
      if (success) {
        setShowEditModal(false);
        setSelectedInstance(null);
        setFormData({ instanceName: '', instanceDescription: '', settings: {} });
        setSuccessMessage('Instancia actualizada exitosamente');
        addActivity(`Instance "${formData.instanceName}" updated`, 'success');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Error al actualizar la instancia');
      }
    } catch (err) {
      setErrorMessage('Error de conexión al actualizar la instancia');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteInstance = async () => {
    if (!selectedInstance) return;

    setIsUpdating(true);
    setErrorMessage('');

    try {
      const success = await deleteInstance(selectedInstance.id);
      if (success) {
        setShowDeleteModal(false);
        setSelectedInstance(null);
        setSuccessMessage('Instancia eliminada exitosamente');
        addActivity(`Instance "${selectedInstance.instanceName}" deleted`, 'success');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Error al eliminar la instancia');
      }
    } catch (err) {
      setErrorMessage('Error de conexión al eliminar la instancia');
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditModal = (instance: UserInstance) => {
    setSelectedInstance(instance);
    setFormData({
      instanceName: instance.instanceName,
      instanceDescription: instance.instanceDescription || '',
      settings: instance.settings || {}
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (instance: UserInstance) => {
    setSelectedInstance(instance);
    setShowDeleteModal(true);
  };

  const toggleInstanceStatus = async (instance: UserInstance) => {
    setIsUpdating(true);
    setErrorMessage('');

    try {
      const success = await updateInstance(instance.id, { isActive: !instance.isActive });
      if (success) {
        setSuccessMessage(`Instancia ${instance.isActive ? 'desactivada' : 'activada'} exitosamente`);
        addActivity(`Instance "${instance.instanceName}" ${instance.isActive ? 'deactivated' : 'activated'}`, 'success');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Error al cambiar el estado de la instancia');
      }
    } catch (err) {
      setErrorMessage('Error de conexión al cambiar el estado de la instancia');
    } finally {
      setIsUpdating(false);
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando instancias...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Server className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Mis Instancias</h2>
              <p className="text-sm text-gray-600">Gestiona tus instancias personalizadas</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Instancia</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mx-6 mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {errorMessage}
        </div>
      )}

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Instances List */}
      <div className="p-6">
        {instances.length === 0 ? (
          <div className="text-center py-12">
            <Server className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes instancias</h3>
            <p className="text-gray-600 mb-6">Crea tu primera instancia para comenzar</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Crear Primera Instancia</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {instances.map((instance) => (
              <div
                key={instance.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{instance.instanceName}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        instance.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {instance.isActive ? 'Activa' : 'Inactiva'}
                      </div>
                    </div>
                    
                    {instance.instanceDescription && (
                      <p className="text-gray-600 mb-3">{instance.instanceDescription}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Creada: {formatDate(instance.createdAt)}</span>
                      </div>
                      {instance.settings && Object.keys(instance.settings).length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Settings className="w-4 h-4" />
                          <span>Configurada</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => toggleInstanceStatus(instance)}
                      disabled={isUpdating}
                      className={`p-2 rounded-lg transition-colors ${
                        instance.isActive
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={instance.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {instance.isActive ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    </button>
                    
                    <button
                      onClick={() => openEditModal(instance)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => openDeleteModal(instance)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Crear Nueva Instancia</h3>
            
            <form onSubmit={handleCreateInstance}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Instancia *
                  </label>
                  <input
                    type="text"
                    value={formData.instanceName}
                    onChange={(e) => setFormData(prev => ({ ...prev, instanceName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Mi Instancia de Producción"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.instanceDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, instanceDescription: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe el propósito de esta instancia..."
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Crear Instancia</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedInstance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar Instancia</h3>
            
            <form onSubmit={handleUpdateInstance}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Instancia *
                  </label>
                  <input
                    type="text"
                    value={formData.instanceName}
                    onChange={(e) => setFormData(prev => ({ ...prev, instanceName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.instanceDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, instanceDescription: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Actualizar Instancia</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedInstance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Eliminar Instancia</h3>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                ¿Estás seguro de que quieres eliminar la instancia <strong>"{selectedInstance.instanceName}"</strong>?
              </p>
              <p className="text-sm text-red-600">
                Esta acción no se puede deshacer.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteInstance}
                disabled={isUpdating}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInstancesManager;
