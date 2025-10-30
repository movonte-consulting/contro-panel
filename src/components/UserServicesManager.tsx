import React, { useState } from 'react';
import { 
  Bot, 
  Plus, 
  // Edit, 
  Trash2, 
  MessageSquare, 
  Power, 
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Settings
} from 'lucide-react';
import { useUserServices, type CreateServiceData } from '../hooks/useUserServices';
import { useApi } from '../hooks/useApi';
import { API_ENDPOINTS } from '../config/api';
import ServiceEndpointsModal from './ServiceEndpointsModal';
import ServiceValidationModal from './ServiceValidationModal';

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateServiceData, validationInfo?: ServiceValidationData) => Promise<void>;
  assistants: Array<{ id: string; name: string }>;
  projects: Array<{ id: string; key: string; name: string; description?: string }>;
}

interface ServiceValidationData {
  websiteUrl: string;
  requestedDomain: string;
}

const CreateServiceModal: React.FC<CreateServiceModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreate, 
  assistants,
  projects
}) => {
  const [formData, setFormData] = useState<CreateServiceData>({
    serviceId: '',
    serviceName: '',
    assistantId: '',
    assistantName: '',
    projectKey: ''
  });
  const [validationData, setValidationData] = useState<ServiceValidationData>({
    websiteUrl: '',
    requestedDomain: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceId || !formData.serviceName || !formData.assistantId || !formData.projectKey) return;
    if (!validationData.websiteUrl || !validationData.requestedDomain) return;

    setIsSubmitting(true);
    try {
      // Crear el servicio con la información de validación
      await onCreate(formData, validationData);
    } catch (error) {
      console.error('Error creating service:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssistantChange = (assistantId: string) => {
    const assistant = assistants.find(a => a.id === assistantId);
    setFormData(prev => ({
      ...prev,
      assistantId,
      assistantName: assistant?.name || ''
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create New Service</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service ID
            </label>
            <input
              type="text"
              value={formData.serviceId}
              onChange={(e) => setFormData(prev => ({ ...prev, serviceId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., my-custom-service"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Name
            </label>
            <input
              type="text"
              value={formData.serviceName}
              onChange={(e) => setFormData(prev => ({ ...prev, serviceName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., My Custom Service"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assistant
            </label>
            <select
              value={formData.assistantId}
              onChange={(e) => handleAssistantChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select an assistant...</option>
              {assistants.map(assistant => (
                <option key={assistant.id} value={assistant.id}>
                  {assistant.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jira Project
            </label>
            <select
              value={formData.projectKey}
              onChange={(e) => setFormData(prev => ({ ...prev, projectKey: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a Jira project...</option>
              {projects.map(project => (
                <option key={project.key} value={project.key}>
                  {project.name} ({project.key})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select the Jira project where this service will be implemented
            </p>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Website Configuration</h3>
            <p className="text-xs text-gray-600 mb-4">
              Specify where this service will be used. This information will be sent for admin approval to configure CORS.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL *
                </label>
                <input
                  type="url"
                  value={validationData.websiteUrl}
                  onChange={(e) => setValidationData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://mi-sitio.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domain for CORS *
                </label>
                <input
                  type="text"
                  value={validationData.requestedDomain}
                  onChange={(e) => {
                    let domain = e.target.value;
                    // Si el usuario ingresa una URL completa, extraer solo el dominio
                    try {
                      if (domain.includes('://')) {
                        const url = new URL(domain);
                        domain = url.hostname;
                        // Remover www. si está presente
                        if (domain.startsWith('www.')) {
                          domain = domain.substring(4);
                        }
                      }
                    } catch {
                      // Si no es una URL válida, usar el valor tal como está
                    }
                    setValidationData(prev => ({ ...prev, requestedDomain: domain }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="mi-sitio.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Only the domain (without https:// or www). URLs will be automatically converted to domains.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Service
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  onChat: (serviceId: string, message: string, threadId?: string) => Promise<any>;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, serviceId, serviceName, onChat }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'assistant'; content: string; timestamp: Date }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | undefined>();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage('');
    setChatHistory(prev => [...prev, { type: 'user', content: userMessage, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const response = await onChat(serviceId, userMessage, threadId);
      console.log('📝 Full AI response received:', response);
      
      if (response && response.success) {
        setChatHistory(prev => [...prev, { 
          type: 'assistant', 
          content: response.response || 'No response received', 
          timestamp: new Date() 
        }]);
        if (response.threadId) {
          setThreadId(response.threadId);
        }
      } else {
        console.error('❌ No valid response received from chat service:', response);
        setChatHistory(prev => [...prev, { 
          type: 'assistant', 
          content: 'Error: No valid response received from the service', 
          timestamp: new Date() 
        }]);
      }
    } catch (error) {
      console.error('Error chatting:', error);
      setChatHistory(prev => [...prev, { 
        type: 'assistant', 
        content: 'Sorry, there was an error processing your message.', 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl h-96 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Test Service: {serviceName}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const UserServicesManager: React.FC = () => {
  const {
    services,
    assistants,
    projects,
    isLoading,
    error,
    createService,
    updateService,
    deleteService,
    chatWithService,
    loadUserAssistants,
    loadUserProjects
  } = useUserServices();
  const { get } = useApi();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showEndpointsModal, setShowEndpointsModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showProjectConfigModal, setShowProjectConfigModal] = useState(false);
  const [selectedService, setSelectedService] = useState<{ id: string; name: string } | null>(null);
  const [selectedServiceForConfig, setSelectedServiceForConfig] = useState<{
    serviceId: string;
    serviceName: string;
    currentProjectKey?: string;
  } | null>(null);
  const [selectedProjectKey, setSelectedProjectKey] = useState<string>('');
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState<boolean>(false);
  const [disabledTicketsList, setDisabledTicketsList] = useState<string[]>([]);
  const [newTicketKey, setNewTicketKey] = useState<string>('');
  const [createdService, setCreatedService] = useState<{
    serviceId: string;
    serviceName: string;
    assistantId: string;
    assistantName: string;
  } | null>(null);
  const [validationData, setValidationData] = useState<ServiceValidationData>({
    websiteUrl: '',
    requestedDomain: ''
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreateService = async (data: CreateServiceData, validationInfo?: ServiceValidationData) => {
    try {
      // Combinar los datos del servicio con la información de validación
      const serviceData = {
        ...data,
        websiteUrl: validationInfo?.websiteUrl,
        requestedDomain: validationInfo?.requestedDomain
      };
      
      const result = await createService(serviceData);
      if (result) {
        // Usar el mensaje del servidor que incluye información sobre admin
        const message = result.message || `Service '${data.serviceName}' created successfully`;
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 5000);
        
        // Guardar la información del servicio creado
        setCreatedService({
          serviceId: data.serviceId,
          serviceName: data.serviceName,
          assistantId: data.assistantId,
          assistantName: data.assistantName
        });

        // Si es admin, mostrar modal de endpoints directamente
        if (result.isAdmin) {
          setShowEndpointsModal(true);
        } else {
          // Si no es admin, mostrar modal de validación
          setValidationData(validationInfo || {
            websiteUrl: '',
            requestedDomain: ''
          });
          setShowValidationModal(true);
        }
      }
    } catch (error) {
      setErrorMessage('Failed to create service');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleToggleService = async (serviceId: string, isActive: boolean) => {
    try {
      const result = await updateService(serviceId, { isActive: !isActive });
      if (result) {
        setSuccessMessage(`Service ${!isActive ? 'activated' : 'deactivated'} successfully`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      setErrorMessage('Failed to update service');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleDeleteService = async (serviceId: string, serviceName: string) => {
    if (!confirm(`Are you sure you want to delete the service '${serviceName}'?`)) {
      return;
    }

    try {
      const result = await deleteService(serviceId);
      if (result) {
        setSuccessMessage(`Service '${serviceName}' deleted successfully`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      setErrorMessage('Failed to delete service');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleConfigureProject = (service: any) => {
    setSelectedServiceForConfig({
      serviceId: service.serviceId,
      serviceName: service.serviceName,
      currentProjectKey: service.configuration?.projectKey || ''
    });
    setSelectedProjectKey(service.configuration?.projectKey || '');
    setSelectedStatuses(service.configuration?.disable_tickets_state || []);
    setDisabledTicketsList(service.configuration?.disabled_tickets || []);
    setNewTicketKey('');
    setShowProjectConfigModal(true);
  };

  const handleSaveProjectAndStatuses = async () => {
    if (!selectedServiceForConfig) return;
    try {
      await updateService(selectedServiceForConfig.serviceId, {
        configuration: {
          projectKey: selectedProjectKey,
          disable_tickets_state: selectedStatuses,
          disabled_tickets: disabledTicketsList
        }
      });
      setSuccessMessage(`Configuration saved for "${selectedServiceForConfig.serviceName}"`);
      setTimeout(() => setSuccessMessage(null), 5000);
      setShowProjectConfigModal(false);
      setSelectedServiceForConfig(null);
      setAvailableStatuses([]);
      setSelectedStatuses([]);
      setSelectedProjectKey('');
      setDisabledTicketsList([]);
      setNewTicketKey('');
    } catch (error) {
      console.error('Error saving configuration:', error);
      setErrorMessage('Failed to save configuration');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleAddDisabledTicket = () => {
    if (!newTicketKey.trim()) return;
    const ticketKey = newTicketKey.trim().toUpperCase();
    if (!disabledTicketsList.includes(ticketKey)) {
      setDisabledTicketsList(prev => [...prev, ticketKey]);
      setNewTicketKey('');
    }
  };

  const handleRemoveDisabledTicket = (ticketKey: string) => {
    setDisabledTicketsList(prev => prev.filter(k => k !== ticketKey));
  };

  React.useEffect(() => {
    const loadStatuses = async () => {
      if (!showProjectConfigModal) return;
      setIsLoadingStatuses(true);
      try {
        // Intentar endpoint de usuario primero
        let response = await get(API_ENDPOINTS.USER_STATUSES_AVAILABLE);
        if (!response?.success || !response?.data) {
          // Fallback a admin si el de usuario no está disponible
          response = await get((API_ENDPOINTS as any).STATUSES_AVAILABLE || API_ENDPOINTS.USER_STATUSES_AVAILABLE);
        }
        if (response?.success && response?.data) {
          // La API del dashboard clásico devuelve array de objetos { id, name }
          const statuses: string[] = Array.isArray(response.data)
            ? response.data.map((s: any) => (typeof s === 'string' ? s : s.name)).filter(Boolean)
            : [];
          setAvailableStatuses(statuses);
        } else {
          setAvailableStatuses([]);
        }
      } catch (e) {
        setAvailableStatuses([]);
      } finally {
        setIsLoadingStatuses(false);
      }
    };
    loadStatuses();
  }, [showProjectConfigModal, get]);

  const handleTestService = (serviceId: string, serviceName: string) => {
    setSelectedService({ id: serviceId, name: serviceName });
    setShowChatModal(true);
  };

  const handleChat = async (serviceId: string, message: string, threadId?: string) => {
    return await chatWithService(serviceId, message, threadId);
  };

  // Cargar asistentes y proyectos cuando se abre el modal de crear servicio
  React.useEffect(() => {
    if (showCreateModal) {
      if (assistants.length === 0) {
        loadUserAssistants();
      }
      if (projects.length === 0) {
        loadUserProjects();
      }
    }
  }, [showCreateModal, assistants.length, projects.length, loadUserAssistants, loadUserProjects]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading user services...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">My Custom Services</h2>
          <p className="text-sm text-gray-600">Manage your personalized AI services</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Service
        </button>
      </div>

      {/* Messages */}
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

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      {/* Services List */}
      {services.length === 0 ? (
        <div className="text-center py-8">
          <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Custom Services</h3>
          <p className="text-gray-600 mb-4">Create your first personalized AI service to get started.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center mx-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Service
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.serviceId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{service.serviceName}</h3>
                  <p className="text-sm text-gray-600">ID: {service.serviceId}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  service.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : service.configuration?.adminApproved 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {service.isActive 
                    ? 'Active' 
                    : service.configuration?.adminApproved 
                      ? 'Approved'
                      : 'Pending Approval'
                  }
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Bot className="w-4 h-4 mr-2" />
                  <span className="truncate">{service.assistantName}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Updated: {new Date(service.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleTestService(service.serviceId, service.serviceName)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Test
                </button>
                
                {/* Botón de Configurar Proyecto */}
                <button
                  onClick={() => handleConfigureProject(service)}
                  className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 flex items-center"
                  title="Configure Jira project"
                >
                  <Settings className="w-4 h-4" />
                </button>
                
                {/* Botón de Endpoints - Solo visible si el servicio está activo */}
                {service.isActive && (
                  <button
                    onClick={() => {
                      setCreatedService({
                        serviceId: service.serviceId,
                        serviceName: service.serviceName,
                        assistantId: service.assistantId,
                        assistantName: service.assistantName
                      });
                      setShowEndpointsModal(true);
                    }}
                    className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 flex items-center"
                    title="View endpoints and protected token"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                
                {/* Botón de Toggle - Solo visible si YA ha sido aprobado por admin */}
                {service.configuration?.adminApproved && (
                  <button
                    onClick={() => handleToggleService(service.serviceId, service.isActive)}
                    className={`px-3 py-2 rounded text-sm flex items-center ${
                      service.isActive
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                    title={service.isActive ? 'Desactivar servicio' : 'Activar servicio'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                )}
                
                {/* Indicador de pendiente de aprobación */}
                {!service.configuration?.adminApproved && (
                  <div className="px-3 py-2 rounded text-sm bg-yellow-100 text-yellow-800 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span className="text-xs">Pending Approval</span>
                  </div>
                )}
                <button
                  onClick={() => handleDeleteService(service.serviceId, service.serviceName)}
                  className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 flex items-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateServiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateService}
        assistants={assistants}
        projects={projects}
      />

      <ChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        serviceId={selectedService?.id || ''}
        serviceName={selectedService?.name || ''}
        onChat={handleChat}
      />

      {createdService && (
        <ServiceEndpointsModal
          isOpen={showEndpointsModal}
          onClose={() => {
            setShowEndpointsModal(false);
            setCreatedService(null);
          }}
          service={createdService}
        />
      )}

      <ServiceValidationModal
        isOpen={showValidationModal}
        onClose={() => {
          setShowValidationModal(false);
          setCreatedService(null);
        }}
        serviceName={createdService?.serviceName || ''}
        validationData={validationData}
      />

      {/* Modal de Configuración de Proyecto */}
      {selectedServiceForConfig && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showProjectConfigModal ? 'block' : 'hidden'}`}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Configure Jira Project & Ticket States
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Select the Jira project for service: <strong>{selectedServiceForConfig.serviceName}</strong>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Project: {selectedServiceForConfig.currentProjectKey || 'Not configured'}
              </label>
              <select
                value={selectedProjectKey}
                onChange={(e) => setSelectedProjectKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a project...</option>
                {projects.map(project => (
                  <option key={project.key} value={project.key}>
                    {project.name} ({project.key})
                  </option>
                ))}
              </select>
            </div>

            {/* Estados a ignorar por IA */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ticket statuses to ignore (IA will omit responses)
              </label>
              {isLoadingStatuses ? (
                <div className="text-sm text-gray-500 flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Loading statuses...</div>
              ) : availableStatuses.length === 0 ? (
                <div className="text-sm text-gray-500">No statuses available</div>
              ) : (
                <div className="max-h-48 overflow-auto border rounded p-2 space-y-2">
                  {availableStatuses.map((status) => {
                    const id = `status_${status.replace(/\s+/g, '_')}`;
                    const checked = selectedStatuses.includes(status);
                    return (
                      <label key={id} htmlFor={id} className="flex items-center space-x-2 text-sm">
                        <input
                          id={id}
                          type="checkbox"
                          className="h-4 w-4"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStatuses(prev => Array.from(new Set([...prev, status])));
                            } else {
                              setSelectedStatuses(prev => prev.filter(s => s !== status));
                            }
                          }}
                        />
                        <span>{status}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">When a ticket is in any of these states, the AI will not respond for this service.</p>
            </div>

            {/* Disabled Tickets Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disabled Tickets (AI will omit responses)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTicketKey}
                  onChange={(e) => setNewTicketKey(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddDisabledTicket()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., TI-123"
                />
                <button
                  onClick={handleAddDisabledTicket}
                  disabled={!newTicketKey.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              {disabledTicketsList.length > 0 ? (
                <div className="max-h-32 overflow-auto border rounded p-2 space-y-1">
                  {disabledTicketsList.map((ticketKey) => (
                    <div key={ticketKey} className="flex items-center justify-between bg-red-50 border border-red-200 rounded px-2 py-1">
                      <span className="text-sm font-medium text-gray-900">{ticketKey}</span>
                      <button
                        onClick={() => handleRemoveDisabledTicket(ticketKey)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Remove ticket"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-2 border rounded bg-gray-50">
                  No disabled tickets
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">Specific tickets that will be ignored by the AI for this service.</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowProjectConfigModal(false);
                  setSelectedServiceForConfig(null);
                  setAvailableStatuses([]);
                  setSelectedStatuses([]);
                  setSelectedProjectKey('');
                  setDisabledTicketsList([]);
                  setNewTicketKey('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProjectAndStatuses}
                disabled={!selectedProjectKey}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

