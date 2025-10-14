import React, { useState } from 'react';
import { Eye, EyeOff, Key, Globe, Bot, CheckCircle, XCircle, Loader2, AlertCircle, Settings, Save } from 'lucide-react';
import { useInitialSetup } from '../hooks/useInitialSetup';

interface TokenConfigurationProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
}

const TokenConfiguration: React.FC<TokenConfigurationProps> = ({ 
  onSuccess, 
  onCancel, 
  showCancelButton = false 
}) => {
  const { 
    isLoading, 
    isValidating, 
    error, 
    success, 
    validationResult, 
    validateTokens, 
    completeSetup, 
    clearMessages 
  } = useInitialSetup();
  
  const [formData, setFormData] = useState({
    jiraUrl: '',
    jiraToken: '',
    openaiToken: ''
  });
  
  const [showJiraToken, setShowJiraToken] = useState(false);
  const [showOpenaiToken, setShowOpenaiToken] = useState(false);
  const [canComplete, setCanComplete] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar mensajes cuando el usuario empiece a escribir
    if (error || success) {
      clearMessages();
    }
  };

  const handleValidateTokens = async () => {
    const isValid = await validateTokens(formData);
    setCanComplete(isValid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canComplete) {
      return;
    }

    const success = await completeSetup(formData);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  const toggleJiraTokenVisibility = () => {
    setShowJiraToken(!showJiraToken);
  };

  const toggleOpenaiTokenVisibility = () => {
    setShowOpenaiToken(!showOpenaiToken);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-lg mr-4">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Configuración de Tokens</h2>
            <p className="text-sm text-gray-600">Configura tus tokens de Jira y OpenAI</p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Información importante</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Los tokens se almacenan de forma segura y solo son accesibles para tu cuenta</li>
              <li>• Puedes actualizar estos tokens en cualquier momento</li>
              <li>• Los tokens son necesarios para el funcionamiento de los servicios personalizados</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <XCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Jira URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-2" />
            URL de Jira
          </label>
          <input
            type="url"
            name="jiraUrl"
            value={formData.jiraUrl}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://miempresa.atlassian.net"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            La URL de tu instancia de Jira
          </p>
        </div>

        {/* Jira Token */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Key className="w-4 h-4 inline mr-2" />
            Token de Jira
          </label>
          <div className="relative">
            <input
              type={showJiraToken ? 'text' : 'password'}
              name="jiraToken"
              value={formData.jiraToken}
              onChange={handleInputChange}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ATATT3xFfGF0..."
              required
            />
            <button
              type="button"
              onClick={toggleJiraTokenVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showJiraToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Token de API de Jira (Jira → Perfil → Seguridad → Crear y usar tokens de API)
          </p>
        </div>

        {/* OpenAI Token */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Bot className="w-4 h-4 inline mr-2" />
            Token de OpenAI
          </label>
          <div className="relative">
            <input
              type={showOpenaiToken ? 'text' : 'password'}
              name="openaiToken"
              value={formData.openaiToken}
              onChange={handleInputChange}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="sk-proj-..."
              required
            />
            <button
              type="button"
              onClick={toggleOpenaiTokenVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showOpenaiToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Token de API de OpenAI (<a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a>)
          </p>
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Resultados de Validación</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                {validationResult.jiraToken.isValid ? (
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 mr-2" />
                )}
                <span className="text-sm text-gray-700">
                  <strong>Jira Token:</strong> {validationResult.jiraToken.message}
                </span>
              </div>
              <div className="flex items-center">
                {validationResult.openaiToken.isValid ? (
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 mr-2" />
                )}
                <span className="text-sm text-gray-700">
                  <strong>OpenAI Token:</strong> {validationResult.openaiToken.message}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          {showCancelButton && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          )}
          
          <button
            type="button"
            onClick={handleValidateTokens}
            disabled={isValidating || !formData.jiraToken || !formData.openaiToken}
            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Validando...
              </>
            ) : (
              'Validar Tokens'
            )}
          </button>
          
          <button
            type="submit"
            disabled={isLoading || !canComplete}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Guardar Configuración
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TokenConfiguration;

