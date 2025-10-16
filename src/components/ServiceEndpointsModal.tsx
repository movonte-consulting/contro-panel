import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Globe, 
  Code, 
  Key, 
  MessageSquare,
  ExternalLink,
  Info,
  Loader2
} from 'lucide-react';
import { useServiceValidation } from '../hooks/useServiceValidation';

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
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const [protectedToken, setProtectedToken] = useState<string>('');
  const [tokenLoading, setTokenLoading] = useState(false);
  const { generateProtectedToken } = useServiceValidation();

  // Generar token protegido cuando se abre el modal
  useEffect(() => {
    if (isOpen && !protectedToken) {
      setTokenLoading(true);
      generateProtectedToken(service.serviceId)
        .then(response => {
          if (response && response.protectedToken) {
            setProtectedToken(response.protectedToken);
          } else {
            console.warn('No se pudo obtener el token protegido del servicio');
          }
        })
        .catch(error => {
          console.error('Error generating protected token:', error);
          // No hacer logout aquí, solo mostrar error en la UI
        })
        .finally(() => {
          setTokenLoading(false);
        });
    }
  }, [isOpen, service.serviceId, protectedToken, generateProtectedToken]);

  if (!isOpen) return null;

  const baseUrl = 'https://chat.movonte.com';
  const chatEndpoint = `${baseUrl}/api/user/services/${service.serviceId}/chat`;
  const statusEndpoint = `${baseUrl}/api/user/services/${service.serviceId}/status`;

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set(prev).add(itemId));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const curlExample = `curl -X POST "${chatEndpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${protectedToken || 'YOUR_PROTECTED_TOKEN'}" \\
  -d '{
    "message": "Hola, ¿cómo estás?",
    "threadId": "optional-thread-id"
  }'`;

  const javascriptExample = `// Usando fetch
const response = await fetch('${chatEndpoint}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${protectedToken || 'YOUR_PROTECTED_TOKEN'}'
  },
  body: JSON.stringify({
    message: 'Hola, ¿cómo estás?',
    threadId: 'optional-thread-id'
  })
});

const data = await response.json();
console.log(data);`;

  const pythonExample = `import requests

url = '${chatEndpoint}'
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${protectedToken || 'YOUR_PROTECTED_TOKEN'}'
}
data = {
    'message': 'Hola, ¿cómo estás?',
    'threadId': 'optional-thread-id'
}

response = requests.post(url, json=data, headers=headers)
result = response.json()
print(result)`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
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
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  Información Importante
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Usa el <strong>Token Protegido</strong> mostrado abajo en lugar de tu token personal</li>
                  <li>• El <code className="bg-blue-100 px-1 rounded">threadId</code> es opcional para mantener conversaciones</li>
                  <li>• Todos los endpoints requieren el token protegido del servicio</li>
                  <li>• El servicio está configurado con el asistente: <strong>{service.assistantName}</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Protected Token Section */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Key className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-green-900 mb-2">
                  Token Protegido del Servicio
                </h3>
                {tokenLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                    <span className="text-sm text-green-700">Generando token...</span>
                  </div>
                ) : protectedToken ? (
                  <div className="space-y-2">
                    <div className="bg-white border border-green-300 rounded p-3 font-mono text-sm break-all">
                      {protectedToken}
                    </div>
                    <button
                      onClick={() => copyToClipboard(protectedToken, 'protected-token')}
                      className="flex items-center space-x-1 text-sm text-green-700 hover:text-green-800 transition-colors"
                    >
                      {copiedItems.has('protected-token') ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Token copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar token</span>
                        </>
                      )}
                    </button>
                    <p className="text-xs text-green-700">
                      Este token es específico para este servicio y no expone tus credenciales reales.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-red-700">
                      No se pudo generar el token protegido.
                    </p>
                    <p className="text-xs text-gray-600">
                      Verifica que el servicio esté activo y aprobado por el administrador.
                    </p>
                    <button
                      onClick={() => {
                        setProtectedToken('');
                        setTokenLoading(true);
                        generateProtectedToken(service.serviceId)
                          .then(response => {
                            if (response && response.protectedToken) {
                              setProtectedToken(response.protectedToken);
                            }
                          })
                          .catch(error => {
                            console.error('Error generating protected token:', error);
                          })
                          .finally(() => {
                            setTokenLoading(false);
                          });
                      }}
                      className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                    >
                      Reintentar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Endpoints Section */}
          <div className="space-y-6">
            {/* Chat Endpoint */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Endpoint de Chat</h3>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">POST</span>
                </div>
                <button
                  onClick={() => copyToClipboard(chatEndpoint, 'chat-endpoint')}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {copiedItems.has('chat-endpoint') ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-800 break-all">
                {chatEndpoint}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Envía mensajes al asistente y recibe respuestas en tiempo real.
              </p>
            </div>

            {/* Status Endpoint */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Key className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Endpoint de Estado</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">GET</span>
                </div>
                <button
                  onClick={() => copyToClipboard(statusEndpoint, 'status-endpoint')}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {copiedItems.has('status-endpoint') ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-800 break-all">
                {statusEndpoint}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Verifica el estado del servicio y obtiene información sobre su configuración.
              </p>
            </div>

            {/* Webhook Endpoint */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Webhook de Jira</h3>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">POST</span>
                </div>
                <button
                  onClick={() => copyToClipboard('https://chat.movonte.com/api/chatkit/webhook/jira', 'webhook-endpoint')}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {copiedItems.has('webhook-endpoint') ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-800 break-all">
                https://chat.movonte.com/api/chatkit/webhook/jira
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Configura este webhook en tu proyecto de Jira para recibir notificaciones automáticas.
              </p>
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Agrega este webhook en la configuración de tu proyecto de Jira para que la IA pueda responder automáticamente a los tickets.
                </p>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Code className="w-5 h-5 mr-2" />
              Ejemplos de Código
            </h3>

            <div className="space-y-6">
              {/* cURL Example */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">cURL</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(curlExample, 'curl-example')}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {copiedItems.has('curl-example') ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 text-sm overflow-x-auto">
                  <code>{curlExample}</code>
                </pre>
              </div>

              {/* JavaScript Example */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">JavaScript</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(javascriptExample, 'js-example')}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {copiedItems.has('js-example') ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 text-sm overflow-x-auto">
                  <code>{javascriptExample}</code>
                </pre>
              </div>

              {/* Python Example */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Python</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(pythonExample, 'python-example')}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {copiedItems.has('python-example') ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 text-sm overflow-x-auto">
                  <code>{pythonExample}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Response Format */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Formato de Respuesta</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <pre className="text-sm text-gray-800 overflow-x-auto">
{`{
  "success": true,
  "data": {
    "response": "Respuesta del asistente...",
    "threadId": "thread-123",
    "assistantId": "${service.assistantId}",
    "assistantName": "${service.assistantName}"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
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


