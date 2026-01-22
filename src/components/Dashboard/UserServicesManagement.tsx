import React, { useState, useEffect } from 'react';
import { Loader2, Plus, AlertCircle, CheckCircle, Bot } from 'lucide-react';
import { useUserServices, type CreateServiceData } from '../../hooks/useUserServices';
import ServiceEndpointsModal from '../Dashboard/ServiceEndpointsModal';
import ServiceValidationModal from '../Dashboard/ServiceValidationModal';
import CreateServiceModal from './UserServices/CreateServiceModal';
import ChatModal from './UserServices/ChatModal';
import ProjectConfigModal from './UserServices/ProjectConfigModal';
import ServicesList from './UserServices/ServicesList';

interface ServiceValidationData {
  websiteUrl: string;
  requestedDomain: string;
}

export const UserServicesManagement: React.FC = () => {
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
    statuses?: string[];
    disabledTickets?: string[];
  } | null>(null);

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

  useEffect(() => {
    if (showCreateModal) {
      if (assistants.length === 0) loadUserAssistants();
      if (projects.length === 0) loadUserProjects();
    }
  }, [showCreateModal, assistants.length, projects.length, loadUserAssistants, loadUserProjects]);

  const handleCreateService = async (data: CreateServiceData, validationInfo?: ServiceValidationData) => {
    try {
      const serviceData = {
        ...data,
        websiteUrl: validationInfo?.websiteUrl,
        requestedDomain: validationInfo?.requestedDomain
      };
      
      const result = await createService(serviceData);
      if (result) {
        const message = result.message || `Service '${data.serviceName}' created successfully`;
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 5000);
        
        setCreatedService({
          serviceId: data.serviceId,
          serviceName: data.serviceName,
          assistantId: data.assistantId,
          assistantName: data.assistantName
        });

        if (result.isAdmin) {
          setShowEndpointsModal(true);
        } else {
          setValidationData(validationInfo || { websiteUrl: '', requestedDomain: '' });
          setShowValidationModal(true);
        }
        setShowCreateModal(false);
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
    if (!confirm(`Are you sure you want to delete the service '${serviceName}'?`)) return;

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
      currentProjectKey: service.configuration?.projectKey || '',
      statuses: service.configuration?.disable_tickets_state || [],
      disabledTickets: service.configuration?.disabled_tickets || []
    });
    setShowProjectConfigModal(true);
  };

  const handleSaveProjectConfig = async (serviceId: string, projectKey: string, statuses: string[], disabledTickets: string[]) => {
    try {
      await updateService(serviceId, {
        configuration: {
          projectKey,
          disable_tickets_state: statuses,
          disabled_tickets: disabledTickets
        }
      });
      setSuccessMessage(`Configuration saved for "${selectedServiceForConfig?.serviceName}"`);
      setTimeout(() => setSuccessMessage(null), 5000);
      setShowProjectConfigModal(false);
      setSelectedServiceForConfig(null);
    } catch (error) {
      console.error('Error saving configuration:', error);
      setErrorMessage('Failed to save configuration');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleTestService = (serviceId: string, serviceName: string) => {
    setSelectedService({ id: serviceId, name: serviceName });
    setShowChatModal(true);
  };

  const handleViewEndpoints = (service: any) => {
    setCreatedService({
      serviceId: service.serviceId,
      serviceName: service.serviceName,
      assistantId: service.assistantId,
      assistantName: service.assistantName
    });
    setShowEndpointsModal(true);
  };

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
        <ServicesList 
          services={services}
          onTestService={handleTestService}
          onConfigureProject={handleConfigureProject}
          onViewEndpoints={handleViewEndpoints}
          onToggleService={handleToggleService}
          onDeleteService={handleDeleteService}
        />
      )}

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
        onChat={chatWithService}
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

      {selectedServiceForConfig && (
        <ProjectConfigModal
          isOpen={showProjectConfigModal}
          onClose={() => {
            setShowProjectConfigModal(false);
            setSelectedServiceForConfig(null);
          }}
          serviceId={selectedServiceForConfig.serviceId}
          serviceName={selectedServiceForConfig.serviceName}
          currentProjectKey={selectedServiceForConfig.currentProjectKey}
          initialStatuses={selectedServiceForConfig.statuses}
          initialDisabledTickets={selectedServiceForConfig.disabledTickets}
          projects={projects}
          onSave={handleSaveProjectConfig}
        />
      )}
    </div>
  );
};