import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { API_ENDPOINTS } from '../config/api';

const ChatKitDebug: React.FC = () => {
  const { isAuthenticated, user, token } = useAuth();
  const { post } = useApi();
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const testChatKitEndpoint = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      console.log('🧪 Testing ChatKit endpoint...');
      
      const response = await post(API_ENDPOINTS.CHATKIT_SESSION, {
        userId: user?.id,
        username: user?.username,
        email: user?.email,
        role: user?.role,
        userContext: {
          permissions: user?.permissions,
          lastLogin: user?.lastLogin,
          isInitialSetupComplete: user?.isInitialSetupComplete
        }
      }, { requireAuth: true });

      console.log('✅ ChatKit test response:', response);
      setTestResult({ success: true, data: response });
    } catch (error) {
      console.error('❌ ChatKit test error:', error);
      setTestResult({ success: false, error: error });
    } finally {
      setIsTesting(false);
    }
  };

  const testDirectChatKit = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      console.log('🧪 Testing direct ChatKit connection...');
      
      // Probar conexión directa con ChatKit usando el client_secret
      const sessionResponse = await post(API_ENDPOINTS.CHATKIT_SESSION, {
        userId: user?.id,
        username: user?.username
      }, { requireAuth: true });

      if (sessionResponse.success && sessionResponse.data?.client_secret) {
        console.log('✅ Session created, testing ChatKit widget...');
        setTestResult({ 
          success: true, 
          data: {
            session: sessionResponse.data,
            message: 'Session created successfully. Check if ChatKit widget loads responses.'
          }
        });
      } else {
        throw new Error('Failed to create session');
      }
    } catch (error) {
      console.error('❌ Direct ChatKit test error:', error);
      setTestResult({ success: false, error: error });
    } finally {
      setIsTesting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-semibold">❌ No autenticado</h3>
        <p className="text-red-600">Necesitas estar logueado para probar ChatKit</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 ChatKit Debug</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-700">Estado de Autenticación:</h4>
          <div className="text-sm text-gray-600">
            <p>✅ Autenticado: {isAuthenticated ? 'Sí' : 'No'}</p>
            <p>👤 Usuario: {user?.username || 'N/A'}</p>
            <p>🔑 Token: {token ? 'Presente' : 'Ausente'}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700">Configuración:</h4>
          <div className="text-sm text-gray-600">
            <p>🌐 API Base: {API_ENDPOINTS.CHATKIT_SESSION}</p>
            <p>🔗 Endpoint: {API_ENDPOINTS.CHATKIT_SESSION}</p>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={testChatKitEndpoint}
            disabled={isTesting}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isTesting ? 'Probando...' : 'Probar Endpoint ChatKit'}
          </button>
          
          <button
            onClick={testDirectChatKit}
            disabled={isTesting}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isTesting ? 'Probando...' : 'Probar Conexión Directa'}
          </button>
        </div>

        {testResult && (
          <div className={`border rounded-lg p-4 ${
            testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <h4 className={`font-medium ${
              testResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {testResult.success ? '✅ Resultado del Test' : '❌ Error del Test'}
            </h4>
            <pre className="text-xs mt-2 overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatKitDebug;
