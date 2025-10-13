import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { API_ENDPOINTS } from '../config/api';
import { ENV_CONFIG, debugLog } from '../config/environment';
import { 
  MessageCircle, 
  Send, 
  Settings, 
  TestTube, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  ExternalLink,
  Bot,
  User,
  AlertCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  source?: string;
}

interface TestResult {
  id?: string;
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

const ChatKitTestPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { post, get } = useApi();
  
  // Estados
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentTicket, setCurrentTicket] = useState('DEV-1');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messageCounter, setMessageCounter] = useState(0);
  const [resultCounter, setResultCounter] = useState(0);

  // Configuración de prueba
  const [testConfig, setTestConfig] = useState({
    issueKey: 'DEV-1', // Cambiado a DEV-1 para coincidir con el proyecto configurado
    customerName: 'Usuario Test',
    customerEmail: 'test@movonte.com',
    workflowId: ENV_CONFIG.CHATKIT_WORKFLOW_ID
  });

  useEffect(() => {
    if (isAuthenticated) {
      debugLog('ChatKitTestPage initialized', { user: user?.username, ticket: currentTicket });
      addMessage('system', 'Página de prueba de ChatKit cargada');
      addMessage('system', `Usuario: ${user?.username}`);
      addMessage('system', `Ticket de prueba: ${currentTicket}`);
      addMessage('system', `Workflow ID: ${testConfig.workflowId}`);
    }
  }, [isAuthenticated, user, currentTicket, testConfig.workflowId]);

  const addMessage = (role: 'user' | 'assistant' | 'system', content: string, source?: string) => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const newMessage: ChatMessage = {
      id: `msg_${timestamp}_${randomId}`,
      role,
      content,
      timestamp: new Date(),
      source
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addTestResult = (result: TestResult) => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const resultWithId = {
      ...result,
      id: `result_${timestamp}_${randomId}`
    };
    setTestResults(prev => [...prev, resultWithId]);
  };

  // Test 1: Conectar al ticket
  const testConnectToTicket = async () => {
    setIsLoading(true);
    addTestResult({
      success: false,
      message: '🔄 Probando conexión al ticket...'
    });

    try {
      const response = await post(API_ENDPOINTS.CHATKIT_WIDGET_CONNECT, {
        issueKey: testConfig.issueKey
      }, { requireAuth: true });

      if (response.success) {
        setSessionId(response.sessionId);
        setIsConnected(true);
        addTestResult({
          success: true,
          message: `✅ Conectado al ticket ${testConfig.issueKey}`,
          data: response
        });
        addMessage('system', `Conectado al ticket ${testConfig.issueKey}`);
      } else {
        throw new Error(response.error || 'Error conectando al ticket');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      addTestResult({
        success: false,
        message: `❌ Error conectando: ${errorMessage}`,
        error: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test 2: Enviar mensaje
  const testSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    setIsLoading(true);
    const message = inputMessage.trim();
    setInputMessage('');
    
    addMessage('user', message);
    addTestResult({
      success: false,
      message: `🔄 Enviando mensaje: "${message}"`
    });

    try {
      const response = await post(API_ENDPOINTS.CHATKIT_WIDGET_SEND, {
        issueKey: testConfig.issueKey,
        message: message,
        customerInfo: {
          name: testConfig.customerName,
          email: testConfig.customerEmail
        }
      }, { requireAuth: true });

      if (response.success) {
        addTestResult({
          success: true,
          message: `✅ Mensaje enviado exitosamente`,
          data: response
        });
        
        // Simular respuesta del asistente (en producción vendría del WebSocket)
        setTimeout(() => {
          addMessage('assistant', `Respuesta simulada para: "${message}". En producción, esto vendría del workflow de ChatKit.`);
        }, 1000);
      } else {
        throw new Error(response.error || 'Error enviando mensaje');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      addTestResult({
        success: false,
        message: `❌ Error enviando mensaje: ${errorMessage}`,
        error: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test 3: Probar webhook de Jira
  const testJiraWebhook = async () => {
    setIsLoading(true);
    addTestResult({
      success: false,
      message: '🔄 Probando webhook de Jira...'
    });

    try {
      const mockWebhookPayload = {
        webhookEvent: 'comment_created',
        issue: {
          key: testConfig.issueKey,
          fields: {
            summary: 'Ticket de prueba para ChatKit',
            status: { name: 'Open' }
          }
        },
        comment: {
          body: 'Este es un comentario de prueba desde Jira',
          author: {
            displayName: 'Agente Test',
            emailAddress: 'agent@movonte.com'
          }
        }
      };

      const response = await post(API_ENDPOINTS.CHATKIT_WEBHOOK_JIRA, mockWebhookPayload);

      if (response.success) {
        addTestResult({
          success: true,
          message: `✅ Webhook procesado exitosamente`,
          data: response
        });
        addMessage('system', 'Webhook de Jira procesado - respuesta simulada del asistente');
      } else {
        throw new Error(response.error || 'Error procesando webhook');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      addTestResult({
        success: false,
        message: `❌ Error procesando webhook: ${errorMessage}`,
        error: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test 4: Verificar estado de sesión
  const testSessionStatus = async () => {
    setIsLoading(true);
    addTestResult({
      success: false,
      message: '🔄 Verificando estado de sesión...'
    });

    try {
      const response = await get(`/api/chatkit/session/${testConfig.issueKey}`, { requireAuth: true });

      if (response.success) {
        addTestResult({
          success: true,
          message: `✅ Estado de sesión: ${response.hasActiveSession ? 'Activa' : 'Inactiva'}`,
          data: response
        });
      } else {
        throw new Error(response.error || 'Error verificando sesión');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      addTestResult({
        success: false,
        message: `❌ Error verificando sesión: ${errorMessage}`,
        error: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar resultados
  const clearResults = () => {
    setTestResults([]);
    setMessages([]);
    addMessage('system', 'Resultados limpiados');
  };

  // Mensajes de prueba predefinidos
  const quickMessages = [
    'Hola, ¿puedes ayudarme?',
    'Necesito soporte técnico',
    '¿Cómo puedo crear un ticket?',
    '¿Cuál es el estado de mi solicitud?',
    'Gracias por tu ayuda'
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Requerido</h2>
          <p className="text-gray-600">Necesitas estar autenticado para acceder a la página de prueba de ChatKit.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TestTube className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ChatKit Test Page</h1>
                <p className="text-gray-600">Página de prueba para la integración de ChatKit con Jira</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isConnected ? '✅ Conectado' : '❌ Desconectado'}
              </div>
              {sessionId && (
                <div className="text-sm text-gray-500">
                  Session: {sessionId.substring(0, 20)}...
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de Configuración */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Configuración de Prueba
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Key
                  </label>
                  <input
                    type="text"
                    value={testConfig.issueKey}
                    onChange={(e) => setTestConfig(prev => ({ ...prev, issueKey: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="DEMO-123"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Cliente
                  </label>
                  <input
                    type="text"
                    value={testConfig.customerName}
                    onChange={(e) => setTestConfig(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Usuario Test"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email del Cliente
                  </label>
                  <input
                    type="email"
                    value={testConfig.customerEmail}
                    onChange={(e) => setTestConfig(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="test@movonte.com"
                  />
                </div>
              </div>

              {/* Botones de Prueba */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={testConnectToTicket}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Conectar al Ticket
                </button>
                
                <button
                  onClick={testJiraWebhook}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Probar Webhook
                </button>
                
                <button
                  onClick={testSessionStatus}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Estado de Sesión
                </button>
                
                <button
                  onClick={clearResults}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Limpiar Resultados
                </button>
              </div>

              {/* Mensajes Rápidos */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Mensajes Rápidos</h4>
                <div className="space-y-2">
                  {quickMessages.map((message, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(message)}
                      className="w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      {message}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Panel de Chat */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
              {/* Header del Chat */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat de Prueba - {testConfig.issueKey}
                </h3>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.role === 'assistant'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      <div className="flex items-center space-x-2 mb-1">
                        {message.role === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : message.role === 'assistant' ? (
                          <Bot className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                        <span className="text-xs font-medium">
                          {message.role === 'user' ? 'Usuario' : 
                           message.role === 'assistant' ? 'Asistente' : 'Sistema'}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Procesando...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && testSendMessage()}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={testSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Resultados */}
        {testResults.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Resultados de Pruebas
            </h3>
            <div className="space-y-2">
              {testResults.map((result) => (
                <div
                  key={result.id || `result_${result.message}`}
                  className={`p-3 rounded-lg border ${
                    result.success
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">{result.message}</span>
                  </div>
                  {result.data && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer">Ver detalles</summary>
                      <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatKitTestPage;
