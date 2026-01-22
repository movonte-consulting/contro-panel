import React, { useState, useEffect } from 'react';
import { Globe, Settings, X, Info, ExternalLink } from 'lucide-react';
import { useServiceValidation } from '../../hooks/useServiceValidation';
import { useServiceJiraAccounts } from '../../hooks/useServiceJiraAccounts';

import JiraConfigSection from './ServiceEndpoints/JiraConfigSection';
import TokenSection from './ServiceEndpoints/TokenSection';
import EndpointsList from './ServiceEndpoints/EndpointsList';
import CodeExamples from './ServiceEndpoints/CodeExamples';
import WidgetIntegration from './ServiceEndpoints/WidgetIntegration';

interface ServiceEndpointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    serviceId: string;
    serviceName: string;
    assistantId: string;
    assistantName: string;
  };
}

const ServiceEndpointsModal: React.FC<ServiceEndpointsModalProps> = ({ 
  isOpen, 
  onClose, 
  service 
}) => {
  const [protectedToken, setProtectedToken] = useState<string>('');
  const [tokenLoading, setTokenLoading] = useState(false);
  const [expirationHours, setExpirationHours] = useState<number>(24);
  const [tokenInfo, setTokenInfo] = useState<{expirationHours?: number, expiresAt?: string}>({});
  const { generateProtectedToken } = useServiceValidation();
  
  const [showJiraAccountsConfig, setShowJiraAccountsConfig] = useState(false);
  const [jiraAccountsLoading, setJiraAccountsLoading] = useState(false);
  const [jiraAccountsSaving, setJiraAccountsSaving] = useState(false);
  
  const [assistantJiraEmail, setAssistantJiraEmail] = useState('');
  const [assistantJiraToken, setAssistantJiraToken] = useState('');
  const [assistantJiraUrl, setAssistantJiraUrl] = useState('https://movonte.atlassian.net');
  const [widgetJiraEmail, setWidgetJiraEmail] = useState('');
  const [widgetJiraToken, setWidgetJiraToken] = useState('');
  const [widgetJiraUrl, setWidgetJiraUrl] = useState('https://movonte.atlassian.net');
  
  const { getServiceJiraAccounts, upsertServiceJiraAccounts } = useServiceJiraAccounts();

  useEffect(() => {
    if (isOpen && !protectedToken) {
      regenerateToken();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setJiraAccountsLoading(true);
      getServiceJiraAccounts(service.serviceId)
        .then(accounts => {
          if (accounts) {
            setAssistantJiraEmail(accounts.assistantJiraEmail || '');
            setAssistantJiraUrl(accounts.assistantJiraUrl || 'https://movonte.atlassian.net');
            setWidgetJiraEmail(accounts.widgetJiraEmail || '');
            setWidgetJiraUrl(accounts.widgetJiraUrl || 'https://movonte.atlassian.net');
          }
        })
        .catch(error => console.error('Error loading Jira accounts:', error))
        .finally(() => setJiraAccountsLoading(false));
    }
  }, [isOpen, service.serviceId, getServiceJiraAccounts]);

  const regenerateToken = async () => {
    setTokenLoading(true);
    setProtectedToken('');
    setTokenInfo({});
    
    try {
      const response = await generateProtectedToken(service.serviceId, expirationHours);
      if (response && response.protectedToken) {
        setProtectedToken(response.protectedToken);
        setTokenInfo({
          expirationHours: response.expirationHours,
          expiresAt: response.expiresAt
        });
      }
    } catch (error) {
      console.error('Error regenerating protected token:', error);
    } finally {
      setTokenLoading(false);
    }
  };

  const handleSaveJiraAccounts = async () => {
    setJiraAccountsSaving(true);
    try {
      await upsertServiceJiraAccounts(service.serviceId, {
        assistantJiraEmail: assistantJiraEmail || undefined,
        assistantJiraToken: assistantJiraToken || undefined,
        assistantJiraUrl: assistantJiraUrl || undefined,
        widgetJiraEmail: widgetJiraEmail || undefined,
        widgetJiraToken: widgetJiraToken || undefined,
        widgetJiraUrl: widgetJiraUrl || undefined,
        isActive: true
      });
      alert('✅ Cuentas de Jira guardadas exitosamente');
      setShowJiraAccountsConfig(false);
      setAssistantJiraToken('');
      setWidgetJiraToken('');
    } catch (error) {
      console.error('Error saving Jira accounts:', error);
      alert('❌ Error al guardar cuentas de Jira');
    } finally {
      setJiraAccountsSaving(false);
    }
  };

  if (!isOpen) return null;

  const baseUrl = 'https://chat.movonte.com';
  const wsBaseUrl = 'wss://chat.movonte.com';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Endpoints del Servicio
              </h2>
              <p className="text-sm text-gray-600">
                {service.serviceName} - {service.assistantName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowJiraAccountsConfig(!showJiraAccountsConfig)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Configurar Cuentas de Jira"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Cuentas Jira</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          
          {showJiraAccountsConfig && (
            <JiraConfigSection 
              isLoading={jiraAccountsLoading}
              isSaving={jiraAccountsSaving}
              onSave={handleSaveJiraAccounts}
              onCancel={() => setShowJiraAccountsConfig(false)}
              assistantJiraEmail={assistantJiraEmail}
              setAssistantJiraEmail={setAssistantJiraEmail}
              assistantJiraToken={assistantJiraToken}
              setAssistantJiraToken={setAssistantJiraToken}
              assistantJiraUrl={assistantJiraUrl}
              setAssistantJiraUrl={setAssistantJiraUrl}
              widgetJiraEmail={widgetJiraEmail}
              setWidgetJiraEmail={setWidgetJiraEmail}
              widgetJiraToken={widgetJiraToken}
              setWidgetJiraToken={setWidgetJiraToken}
              widgetJiraUrl={widgetJiraUrl}
              setWidgetJiraUrl={setWidgetJiraUrl}
            />
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  Información Importante
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Usa el <strong>Token Protegido</strong> mostrado abajo en lugar de tu token personal</li>
                  <li>• Todos los endpoints requieren el token protegido del servicio</li>
                  <li>• El servicio está configurado con el asistente: <strong>{service.assistantName}</strong></li>
                </ul>
              </div>
            </div>
          </div>

          <TokenSection 
            expirationHours={expirationHours}
            setExpirationHours={setExpirationHours}
            tokenLoading={tokenLoading}
            regenerateToken={regenerateToken}
            protectedToken={protectedToken}
            tokenInfo={tokenInfo}
            serviceId={service.serviceId}
          />

          <EndpointsList 
            serviceId={service.serviceId}
            baseUrl={baseUrl}
            wsBaseUrl={wsBaseUrl}
          />

          <CodeExamples 
            chatEndpoint={`${baseUrl}/api/user/services/${service.serviceId}/chat`}
            protectedToken={protectedToken}
            wsBaseUrl={wsBaseUrl}
            serviceId={service.serviceId}
          />

          <WidgetIntegration 
            serviceId={service.serviceId}
            serviceName={service.serviceName}
            assistantName={service.assistantName}
            protectedToken={protectedToken}
            wsBaseUrl={wsBaseUrl}
          />
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <ExternalLink className="w-4 h-4" />
            <span>Documentación completa disponible en la API</span>
          </div>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceEndpointsModal;