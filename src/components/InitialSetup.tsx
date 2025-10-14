import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Key, Globe, Bot, CheckCircle, XCircle, Loader2, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useInitialSetup } from '../hooks/useInitialSetup';
import '../config/debug';

interface SetupFormData {
  jiraUrl: string;
  jiraToken: string;
  openaiToken: string;
}

const InitialSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  
  const [formData, setFormData] = useState<SetupFormData>({
    jiraUrl: '',
    jiraToken: '',
    openaiToken: ''
  });
  
  const [showJiraToken, setShowJiraToken] = useState(false);
  const [showOpenaiToken, setShowOpenaiToken] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [canComplete, setCanComplete] = useState(false);

  // Verificar si el usuario ya completó la configuración
  useEffect(() => {
    if (user?.isInitialSetupComplete) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
    if (isValid) {
      setCanComplete(true);
      setCurrentStep(3);
    } else {
      setCanComplete(false);
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canComplete) {
      return;
    }

    const success = await completeSetup(formData);
    if (success) {
      setCurrentStep(3);
      
      // Redirigir al dashboard después de un breve delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  };

  const toggleJiraTokenVisibility = () => {
    setShowJiraToken(!showJiraToken);
  };

  const toggleOpenaiTokenVisibility = () => {
    setShowOpenaiToken(!showOpenaiToken);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-600 to-blue-800 flex items-center justify-center p-5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white opacity-5 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white opacity-5 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white opacity-5 rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración Inicial</h1>
            <p className="text-gray-600">Configura tus tokens de Jira y OpenAI para comenzar a usar el sistema</p>
          </div>

          {/* Step Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <div className={`w-16 h-1 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">Información sobre los tokens</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Jira Token:</strong> Necesario para conectar con tu instancia de Jira</li>
                  <li>• <strong>OpenAI Token:</strong> Requerido para el funcionamiento de los asistentes de IA</li>
                  <li>• Los tokens se almacenan de forma segura y solo son accesibles para tu cuenta</li>
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
                La URL de tu instancia de Jira (ej: https://miempresa.atlassian.net)
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
                Puedes obtener tu token en: Jira → Perfil → Seguridad → Crear y usar tokens de API
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
                Puedes obtener tu token en: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a>
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
                    Configurando...
                  </>
                ) : (
                  'Completar Configuración'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Al completar la configuración, aceptas que tus tokens se almacenen de forma segura en nuestro sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitialSetup;