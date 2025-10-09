import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Server,
  Bot,
  Settings,
  ArrowRight
} from 'lucide-react';
import { useInitialSetup, type InitialSetupData, type TokenValidationResult } from '../hooks/useInitialSetup';
import { useAuth } from '../hooks/useAuth';

const InitialSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { setupStatus, isLoading, error, checkSetupStatus, validateTokens, completeSetup } = useInitialSetup();
  
  const [formData, setFormData] = useState<InitialSetupData>({
    jiraToken: '',
    jiraUrl: '',
    openaiToken: ''
  });
  
  const [showJiraToken, setShowJiraToken] = useState(false);
  const [showOpenaiToken, setShowOpenaiToken] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [validationResult, setValidationResult] = useState<TokenValidationResult | null>(null);
  const [tokensValid, setTokensValid] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Verificar estado de configuración al cargar
  useEffect(() => {
    checkSetupStatus();
  }, [checkSetupStatus]);

  // Redirigir si ya está configurado
  useEffect(() => {
    if (setupStatus?.isInitialSetupComplete) {
      navigate('/dashboard');
    }
  }, [setupStatus, navigate]);

  const handleInputChange = (field: keyof InitialSetupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrorMessage('');
    setValidationResult(null);
    setTokensValid(false);
  };

  const handleValidateTokens = async () => {
    if (!formData.jiraToken || !formData.jiraUrl || !formData.openaiToken) {
      setErrorMessage('Por favor completa todos los campos');
      return;
    }

    setIsValidating(true);
    setErrorMessage('');

    try {
      const result = await validateTokens(formData);
      if (result.success && result.validation) {
        setValidationResult(result.validation);
        setTokensValid(true);
        setSuccessMessage('✅ Tokens válidos! Puedes continuar con la configuración');
      } else {
        setErrorMessage('❌ Algunos tokens no son válidos. Por favor verifica e intenta nuevamente');
        setTokensValid(false);
      }
    } catch (err) {
      setErrorMessage('Error validando tokens. Por favor intenta nuevamente');
      setTokensValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tokensValid) {
      setErrorMessage('Por favor valida los tokens antes de continuar');
      return;
    }

    setIsCompleting(true);
    setErrorMessage('');

    try {
      const success = await completeSetup(formData);
      if (success) {
        setSuccessMessage('¡Configuración completada exitosamente! Redirigiendo...');
        updateUser({ isInitialSetupComplete: true });
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setErrorMessage('Error al completar la configuración');
      }
    } catch (err) {
      setErrorMessage('Error de conexión al completar la configuración');
    } finally {
      setIsCompleting(false);
    }
  };

  const togglePasswordVisibility = (field: 'jiraToken' | 'openaiToken') => {
    if (field === 'jiraToken') {
      setShowJiraToken(!showJiraToken);
    } else {
      setShowOpenaiToken(!showOpenaiToken);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-lg">Verificando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-600 to-blue-800 flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Settings className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración Inicial</h1>
          <p className="text-gray-600">
            Configura tus tokens para comenzar a usar tus servicios personalizados
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Información</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                tokensValid ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {tokensValid ? <CheckCircle className="w-5 h-5" /> : '2'}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Validación</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Completar</span>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Información sobre los tokens</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Jira Token:</strong> Necesario para conectar con tu instancia de Jira</li>
            <li>• <strong>OpenAI Token:</strong> Requerido para el funcionamiento de los asistentes de IA</li>
            <li>• Los tokens se almacenan de forma segura y solo son accesibles para tu cuenta</li>
          </ul>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {errorMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleCompleteSetup} className="space-y-6">
          {/* Jira URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Server className="w-4 h-4 inline mr-2" />
              URL de Jira
            </label>
            <input
              type="url"
              value={formData.jiraUrl}
              onChange={(e) => handleInputChange('jiraUrl', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://tu-empresa.atlassian.net"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              La URL base de tu instancia de Jira
            </p>
          </div>

          {/* Jira Token */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Server className="w-4 h-4 inline mr-2" />
              Token de Jira
            </label>
            <div className="relative">
              <input
                type={showJiraToken ? 'text' : 'password'}
                value={formData.jiraToken}
                onChange={(e) => handleInputChange('jiraToken', e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa tu token de Jira"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('jiraToken')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                value={formData.openaiToken}
                onChange={(e) => handleInputChange('openaiToken', e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="sk-..."
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('openaiToken')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOpenaiToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Puedes obtener tu token en: 
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 ml-1 inline-flex items-center"
              >
                OpenAI Platform <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </p>
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Resultados de Validación:</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Server className="w-4 h-4 mr-2" />
                  <span className="text-sm text-gray-600">Jira Token:</span>
                  <span className={`ml-2 text-sm font-medium ${
                    validationResult.jiraToken.isValid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {validationResult.jiraToken.message}
                  </span>
                </div>
                <div className="flex items-center">
                  <Bot className="w-4 h-4 mr-2" />
                  <span className="text-sm text-gray-600">OpenAI Token:</span>
                  <span className={`ml-2 text-sm font-medium ${
                    validationResult.openaiToken.isValid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {validationResult.openaiToken.message}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleValidateTokens}
              disabled={isValidating || !formData.jiraToken || !formData.jiraUrl || !formData.openaiToken}
              className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isValidating && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Validar Tokens</span>
            </button>
            
            <button
              type="submit"
              disabled={!tokensValid || isCompleting}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isCompleting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Completar Configuración</span>
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Bienvenido, <span className="font-medium">{user?.username}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InitialSetupPage;
