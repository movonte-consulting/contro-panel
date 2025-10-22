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
  Loader2,
  Wifi,
  Zap,
  MonitorPlay,
  AlertCircle
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
  const wsBaseUrl = 'wss://chat.movonte.com';
  const chatEndpoint = `${baseUrl}/api/user/services/${service.serviceId}/chat`;
  const statusEndpoint = `${baseUrl}/api/user/services/${service.serviceId}/status`;
  const wsEndpoint = `${wsBaseUrl}/socket.io/?serviceId=${service.serviceId}&token=${protectedToken || 'YOUR_PROTECTED_TOKEN'}`;

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

  const websocketJavascriptExample = `// Conexión WebSocket con Socket.IO (JavaScript)
import { io } from 'socket.io-client';

const socket = io('${wsBaseUrl}', {
  query: {
    serviceId: '${service.serviceId}',
    token: '${protectedToken || 'YOUR_PROTECTED_TOKEN'}'
  }
});

// Escuchar conexión
socket.on('connect', () => {
  console.log('Conectado al WebSocket:', socket.id);
});

// Escuchar respuestas del asistente
socket.on('assistant_response', (data) => {
  console.log('Respuesta del asistente:', data);
  // Actualizar UI con la respuesta
  updateChatUI(data.response);
});

// Enviar mensaje
function sendMessage(message, threadId = null) {
  socket.emit('user_message', {
    message: message,
    threadId: threadId
  });
}

// Desconectar
function disconnect() {
  socket.disconnect();
}`;

  const websocketPythonExample = `# Conexión WebSocket con python-socketio
import socketio

sio = socketio.Client()

@sio.event
def connect():
    print('Conectado al WebSocket')

@sio.event
def assistant_response(data):
    print('Respuesta del asistente:', data)

@sio.event
def disconnect():
    print('Desconectado del WebSocket')

# Conectar
sio.connect('${wsBaseUrl}', 
           query={'serviceId': '${service.serviceId}', 
                  'token': '${protectedToken || 'YOUR_PROTECTED_TOKEN'}'})

# Enviar mensaje
sio.emit('user_message', {
    'message': 'Hola, ¿cómo estás?',
    'threadId': 'optional-thread-id'
})

# Mantener conexión activa
sio.wait()`;

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
                  <li>• <strong>WebSocket</strong> para respuestas en tiempo real, <strong>REST API</strong> para requests puntuales</li>
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

            {/* WebSocket Endpoint */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Wifi className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Conexión WebSocket</h3>
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">WS</span>
                </div>
                <button
                  onClick={() => copyToClipboard(wsEndpoint, 'websocket-endpoint')}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {copiedItems.has('websocket-endpoint') ? (
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
                {wsEndpoint}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Conexión en tiempo real para recibir respuestas instantáneas del asistente.
              </p>
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <Zap className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800">
                      <strong>Ventajas del WebSocket:</strong>
                    </p>
                    <ul className="text-xs text-blue-700 mt-1 space-y-1">
                      <li>• Respuestas instantáneas en tiempo real</li>
                      <li>• Mantiene el contexto de conversación</li>
                      <li>• Ideal para aplicaciones interactivas</li>
                      <li>• Soporte para múltiples eventos</li>
                    </ul>
                  </div>
                </div>
              </div>
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
                  onClick={() => copyToClipboard('https://chat.movonte.com/api/chatbot/webhook/jira', 'webhook-endpoint')}
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
                https://chat.movonte.com/api/chatbot/webhook/jira
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

          {/* WebSocket Code Examples */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Wifi className="w-5 h-5 mr-2" />
              Ejemplos de Conexión WebSocket
            </h3>

            <div className="space-y-6">
              {/* WebSocket JavaScript Example */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">JavaScript/TypeScript</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(websocketJavascriptExample, 'ws-js-example')}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {copiedItems.has('ws-js-example') ? (
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
                  <code>{websocketJavascriptExample}</code>
                </pre>
              </div>

              {/* WebSocket Python Example */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Python</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(websocketPythonExample, 'ws-python-example')}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {copiedItems.has('ws-python-example') ? (
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
                  <code>{websocketPythonExample}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Widget HTML Integration */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MonitorPlay className="w-5 h-5 mr-2 text-purple-600" />
              Integración con Widget HTML
            </h3>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-5 mb-6">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-purple-900 mb-2">
                    Widget de Chat Listo para Usar
                  </h4>
                  <p className="text-sm text-purple-800 mb-3">
                    Integra fácilmente un chat en tu sitio web con nuestro widget pre-construido. 
                    Solo necesitas copiar el código HTML y configurar tu servicio.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-purple-700">
                    <Check className="w-4 h-4" />
                    <span>Responsive y personalizable</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-purple-700">
                    <Check className="w-4 h-4" />
                    <span>WebSocket en tiempo real integrado</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-purple-700">
                    <Check className="w-4 h-4" />
                    <span>Sin dependencias externas pesadas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget HTML Code */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Widget HTML Completo</span>
                  <span className="text-xs text-gray-500">(Copiar y pegar en tu sitio)</span>
                </div>
                <button
                  onClick={() => copyToClipboard(
                    `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Widget - ${service.serviceName}</title>
    <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .chat-container {
            width: 90%;
            max-width: 500px;
            height: 600px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .chat-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .status-indicator {
            width: 12px;
            height: 12px;
            background: #4ade80;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .chat-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background: #f8f9fa;
        }

        .message {
            margin-bottom: 16px;
            display: flex;
            gap: 8px;
        }

        .message.user {
            flex-direction: row-reverse;
        }

        .message-content {
            max-width: 70%;
            padding: 12px 16px;
            border-radius: 12px;
            line-height: 1.4;
            font-size: 14px;
        }

        .message.user .message-content {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-bottom-right-radius: 4px;
        }

        .message.assistant .message-content {
            background: white;
            border: 1px solid #e5e7eb;
            color: #1f2937;
            border-bottom-left-radius: 4px;
        }

        .chat-input-container {
            padding: 16px;
            background: white;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 8px;
        }

        .chat-input {
            flex: 1;
            padding: 12px 16px;
            border: 1px solid #e5e7eb;
            border-radius: 24px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        }

        .chat-input:focus {
            border-color: #667eea;
        }

        .send-button {
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 24px;
            cursor: pointer;
            font-weight: 600;
            transition: transform 0.2s;
        }

        .send-button:hover {
            transform: scale(1.05);
        }

        .send-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .typing-indicator {
            padding: 12px 16px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            display: inline-block;
        }

        .typing-indicator span {
            display: inline-block;
            width: 8px;
            height: 8px;
            background: #667eea;
            border-radius: 50%;
            margin: 0 2px;
            animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
            animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes typing {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-10px); }
        }

        .connection-status {
            font-size: 12px;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="chat-header">
            <div class="status-indicator" id="statusIndicator"></div>
            <div>
                <div style="font-weight: 600; font-size: 16px;">${service.serviceName}</div>
                <div class="connection-status" id="connectionStatus">Conectando...</div>
            </div>
        </div>
        <div class="chat-messages" id="chatMessages">
            <div class="message assistant">
                <div class="message-content">
                    ¡Hola! Soy ${service.assistantName}. ¿En qué puedo ayudarte hoy?
                </div>
            </div>
        </div>
        <div class="chat-input-container">
            <input 
                type="text" 
                class="chat-input" 
                id="messageInput" 
                placeholder="Escribe tu mensaje..."
                onkeypress="handleKeyPress(event)"
            >
            <button class="send-button" onclick="sendMessage()" id="sendButton">
                Enviar
            </button>
        </div>
    </div>

    <script>
        // ==========================================
        // CONFIGURACIÓN DEL SERVICIO
        // ==========================================
        const CONFIG = {
            serviceId: '${service.serviceId}',
            token: '${protectedToken || 'YOUR_PROTECTED_TOKEN'}',
            wsUrl: '${wsBaseUrl}',
            assistantName: '${service.assistantName}'
        };

        // ==========================================
        // CONEXIÓN WEBSOCKET
        // ==========================================
        let socket;
        let isConnected = false;
        let threadId = null;

        function connectWebSocket() {
            console.log('🔌 Conectando a WebSocket...');
            
            socket = io(CONFIG.wsUrl, {
                query: {
                    serviceId: CONFIG.serviceId,
                    token: CONFIG.token
                },
                transports: ['websocket', 'polling']
            });

            // Evento: Conexión exitosa
            socket.on('connect', () => {
                console.log('✅ Conectado a WebSocket:', socket.id);
                isConnected = true;
                updateConnectionStatus('Conectado', true);
            });

            // Evento: Respuesta del asistente
            socket.on('assistant_response', (data) => {
                console.log('📨 Respuesta del asistente:', data);
                removeTypingIndicator();
                addMessage(data.response || data.data?.response, 'assistant');
                
                // Guardar threadId para mantener contexto
                if (data.threadId || data.data?.threadId) {
                    threadId = data.threadId || data.data.threadId;
                }
            });

            // Evento: Desconexión
            socket.on('disconnect', () => {
                console.log('❌ Desconectado del WebSocket');
                isConnected = false;
                updateConnectionStatus('Desconectado', false);
            });

            // Evento: Error
            socket.on('error', (error) => {
                console.error('❌ Error en WebSocket:', error);
                updateConnectionStatus('Error de conexión', false);
            });

            // Evento: Reconexión
            socket.on('reconnect', (attemptNumber) => {
                console.log(\`🔄 Reconectado después de \${attemptNumber} intentos\`);
                isConnected = true;
                updateConnectionStatus('Conectado', true);
            });
        }

        // ==========================================
        // FUNCIONES DE UI
        // ==========================================
        function updateConnectionStatus(status, connected) {
            const statusElement = document.getElementById('connectionStatus');
            const indicator = document.getElementById('statusIndicator');
            
            statusElement.textContent = status;
            indicator.style.background = connected ? '#4ade80' : '#ef4444';
        }

        function addMessage(text, type) {
            const messagesContainer = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${type}\`;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = text;
            
            messageDiv.appendChild(contentDiv);
            messagesContainer.appendChild(messageDiv);
            
            // Scroll automático al último mensaje
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function showTypingIndicator() {
            const messagesContainer = document.getElementById('chatMessages');
            const typingDiv = document.createElement('div');
            typingDiv.className = 'message assistant';
            typingDiv.id = 'typingIndicator';
            
            typingDiv.innerHTML = \`
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            \`;
            
            messagesContainer.appendChild(typingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function removeTypingIndicator() {
            const typingIndicator = document.getElementById('typingIndicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }

        function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            
            if (!message) return;
            
            if (!isConnected) {
                alert('No estás conectado al servidor. Por favor, espera...');
                return;
            }

            // Agregar mensaje del usuario a la UI
            addMessage(message, 'user');
            
            // Mostrar indicador de "escribiendo..."
            showTypingIndicator();
            
            // Enviar mensaje por WebSocket
            socket.emit('user_message', {
                message: message,
                threadId: threadId
            });
            
            // Limpiar input
            input.value = '';
        }

        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }

        // ==========================================
        // INICIALIZACIÓN
        // ==========================================
        window.addEventListener('DOMContentLoaded', () => {
            console.log('🚀 Iniciando widget de chat...');
            console.log('📋 Configuración:', CONFIG);
            connectWebSocket();
        });

        // Cerrar conexión al cerrar la página
        window.addEventListener('beforeunload', () => {
            if (socket) {
                socket.disconnect();
            }
        });
    </script>
</body>
</html>`, 
                    'widget-html'
                  )}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {copiedItems.has('widget-html') ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Widget</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 text-sm overflow-x-auto max-h-96">
                <code>{`<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Chat - ${service.serviceName}</title>
    <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
    <style>
        /* Estilos del widget... */
    </style>
</head>
<body>
    <div class="chat-container">
        <!-- Widget de chat completo -->
    </div>

    <script>
        const CONFIG = {
            serviceId: '${service.serviceId}',
            token: '${protectedToken || 'YOUR_PROTECTED_TOKEN'}',
            wsUrl: '${wsBaseUrl}'
        };

        // Conexión WebSocket
        const socket = io(CONFIG.wsUrl, {
            query: {
                serviceId: CONFIG.serviceId,
                token: CONFIG.token
            }
        });

        socket.on('assistant_response', (data) => {
            // Mostrar respuesta en el chat
            console.log('Respuesta:', data);
        });
        
        // Ver código completo arriba ⬆️
    </script>
</body>
</html>`}</code>
              </pre>
            </div>

            {/* Instrucciones de Uso */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <h5 className="font-semibold text-blue-900 text-sm mb-1">Copiar el Código</h5>
                    <p className="text-xs text-blue-800">
                      Haz clic en "Copiar Widget" para obtener el HTML completo con tu configuración.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <h5 className="font-semibold text-green-900 text-sm mb-1">Crear Archivo HTML</h5>
                    <p className="text-xs text-green-800">
                      Guarda el código como <code className="bg-green-100 px-1 rounded">chat.html</code> en tu proyecto.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <div>
                    <h5 className="font-semibold text-purple-900 text-sm mb-1">Personalizar (Opcional)</h5>
                    <p className="text-xs text-purple-800">
                      Modifica los estilos CSS según tu marca y diseño.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                  <div>
                    <h5 className="font-semibold text-orange-900 text-sm mb-1">Probar y Publicar</h5>
                    <p className="text-xs text-orange-800">
                      Abre el archivo en tu navegador para probarlo, luego intégralo en tu sitio.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Advertencia de Token */}
            <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-yellow-900 text-sm mb-1">
                    ⚠️ Importante: Seguridad del Token
                  </h5>
                  <ul className="text-xs text-yellow-800 space-y-1">
                    <li>• El widget ya incluye tu <strong>Token Protegido</strong> automáticamente</li>
                    <li>• Este token es específico para el servicio <strong>${service.serviceName}</strong></li>
                    <li>• No compartas este archivo con terceros si contiene información sensible</li>
                    <li>• Para producción, considera inyectar el token desde el servidor</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Response Format */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Formatos de Respuesta</h3>
            
            {/* HTTP Response Format */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-800 mb-2">Respuesta HTTP (REST API)</h4>
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

            {/* WebSocket Response Format */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-800 mb-2">Eventos WebSocket</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Evento: <code className="bg-gray-100 px-1 rounded">assistant_response</code></p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <pre className="text-sm text-gray-800 overflow-x-auto">
{`{
  "response": "Respuesta del asistente...",
  "threadId": "thread-123",
  "assistantId": "${service.assistantId}",
  "assistantName": "${service.assistantName}",
  "timestamp": "2024-01-01T12:00:00Z"
}`}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Evento: <code className="bg-gray-100 px-1 rounded">connect</code></p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <pre className="text-sm text-gray-800 overflow-x-auto">
{`{
  "socketId": "socket-123",
  "serviceId": "${service.serviceId}",
  "status": "connected",
  "timestamp": "2024-01-01T12:00:00Z"
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Evento: <code className="bg-gray-100 px-1 rounded">disconnect</code></p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <pre className="text-sm text-gray-800 overflow-x-auto">
{`{
  "socketId": "socket-123",
  "serviceId": "${service.serviceId}",
  "status": "disconnected",
  "timestamp": "2024-01-01T12:00:00Z"
}`}
                    </pre>
                  </div>
                </div>
              </div>
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


