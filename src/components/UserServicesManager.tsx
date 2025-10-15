import React, { useState } from 'react';
import { 
  Bot, 
  Plus, 
  // Edit, 
  Trash2, 
  MessageSquare, 
  Power, 
  PowerOff, 
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  // Settings
} from 'lucide-react';
import { useUserServices, type CreateServiceData } from '../hooks/useUserServices';
import { useServiceValidation } from '../hooks/useServiceValidation';
import ServiceEndpointsModal from './ServiceEndpointsModal';

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateServiceData, validationInfo?: ServiceValidationData) => Promise<void>;
  assistants: Array<{ id: string; name: string }>;
}

interface ServiceValidationData {
  websiteUrl: string;
  requestedDomain: string;
}

const CreateServiceModal: React.FC<CreateServiceModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreate, 
  assistants 
}) => {
  const [formData, setFormData] = useState<CreateServiceData>({
    serviceId: '',
    serviceName: '',
    assistantId: '',
    assistantName: ''
  });
  const [validationData, setValidationData] = useState<ServiceValidationData>({
    websiteUrl: '',
    requestedDomain: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceId || !formData.serviceName || !formData.assistantId) return;
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
                  onChange={(e) => setValidationData(prev => ({ ...prev, requestedDomain: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="mi-sitio.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Only the domain (without https:// or www)
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

// Modal de validación de servicio
const ServiceValidationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  validationData: ServiceValidationData;
}> = ({ isOpen, onClose, serviceName, validationData }) => {
  const { createValidationRequest, loading } = useServiceValidation();

  const handleSubmit = async () => {
    try {
      await createValidationRequest({
        serviceName,
        websiteUrl: validationData.websiteUrl,
        requestedDomain: validationData.requestedDomain
      });
      onClose();
    } catch (error) {
      console.error('Error creating validation request:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CheckCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Service Created Successfully!</h3>
            <p className="text-sm text-gray-600">Now request validation for your website</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Service: {serviceName}</p>
            <p className="text-blue-700">Website: {validationData.websiteUrl}</p>
            <p className="text-blue-700">Domain: {validationData.requestedDomain}</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Validation Required</p>
              <p>An admin will review your request and configure CORS for your domain. You'll receive a protected token once approved.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Request Validation
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Skip for now
          </button>
        </div>
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
      if (response) {
        setChatHistory(prev => [...prev, { 
          type: 'assistant', 
          content: response.response, 
          timestamp: new Date() 
        }]);
        if (response.threadId) {
          setThreadId(response.threadId);
        }
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
    isLoading,
    error,
    createService,
    updateService,
    deleteService,
    chatWithService,
    loadUserAssistants
  } = useUserServices();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showEndpointsModal, setShowEndpointsModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedService, setSelectedService] = useState<{ id: string; name: string } | null>(null);
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
      const result = await createService(data);
      if (result) {
        setSuccessMessage(`Service '${data.serviceName}' created successfully`);
        setTimeout(() => setSuccessMessage(null), 3000);
        
        // Guardar la información del servicio creado
        setCreatedService({
          serviceId: data.serviceId,
          serviceName: data.serviceName,
          assistantId: data.assistantId,
          assistantName: data.assistantName
        });

        // Si hay información de validación, mostrar modal de validación
        if (validationInfo) {
          setValidationData(validationInfo);
          setShowValidationModal(true);
        } else {
          // Si no hay validación, mostrar modal de endpoints directamente
          setShowEndpointsModal(true);
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

  const handleTestService = (serviceId: string, serviceName: string) => {
    setSelectedService({ id: serviceId, name: serviceName });
    setShowChatModal(true);
  };

  const handleChat = async (serviceId: string, message: string, threadId?: string) => {
    return await chatWithService(serviceId, message, threadId);
  };

  // Cargar asistentes cuando se abre el modal de crear servicio
  React.useEffect(() => {
    if (showCreateModal && assistants.length === 0) {
      loadUserAssistants();
    }
  }, [showCreateModal, assistants.length, loadUserAssistants]);

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
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {service.isActive ? 'Active' : 'Pending'}
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
                
                {/* Botón de Endpoints - Solo visible si el servicio está aprobado */}
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
                
                <button
                  onClick={() => handleToggleService(service.serviceId, service.isActive)}
                  className={`px-3 py-2 rounded text-sm flex items-center ${
                    service.isActive
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {service.isActive ? (
                    <>
                      <PowerOff className="w-4 h-4 mr-1" />
                      Disable
                    </>
                  ) : (
                    <>
                      <Power className="w-4 h-4 mr-1" />
                      Enable
                    </>
                  )}
                </button>
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
    </div>
  );
};

