import { useState, useCallback } from 'react';
import { useApi, API_ENDPOINTS } from '../../../shared/api';
import { useAuth } from '../../../entities/session';

interface SetupFormData {
  jiraUrl: string;
  jiraToken: string;
  openaiToken: string;
  organizationLogo?: string; // base64 string
}

interface ValidationResult {
  jiraToken: {
    isValid: boolean;
    message: string;
  };
  openaiToken: {
    isValid: boolean;
    message: string;
  };
  allTokensValid: boolean;
}

interface UseInitialSetupReturn {
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;
  success: string | null;
  validationResult: ValidationResult | null;
  validateTokens: (formData: SetupFormData) => Promise<boolean>;
  completeSetup: (formData: SetupFormData) => Promise<boolean>;
  clearMessages: () => void;
}

export const useInitialSetup = (): UseInitialSetupReturn => {
  const { post } = useApi();
  const { updateUser } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const validateTokens = useCallback(async (formData: SetupFormData): Promise<boolean> => {
    if (!formData.jiraToken || !formData.openaiToken) {
      setError('Por favor ingresa ambos tokens');
      return false;
    }

    setIsValidating(true);
    setError(null);
    setValidationResult(null);

    try {
      console.log('🔍 Validating tokens with URL:', API_ENDPOINTS.USER_SETUP_VALIDATE_TOKENS);
      const response = await post(API_ENDPOINTS.USER_SETUP_VALIDATE_TOKENS, {
        jiraToken: formData.jiraToken,
        openaiToken: formData.openaiToken
      });

      if (response.success) {
        setValidationResult(response.data.validation);

        if (response.data.allTokensValid) {
          setSuccess('✅ Tokens válidos! Puedes continuar con la configuración');
          return true;
        } else {
          setError('❌ Algunos tokens no son válidos. Por favor verifica e intenta nuevamente');
          return false;
        }
      } else {
        setError(response.error || 'Error validando tokens');
        return false;
      }
    } catch (err) {
      console.error('Error validating tokens:', err);
      setError('Error de conexión al validar tokens');
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [post]);

  const completeSetup = useCallback(async (formData: SetupFormData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🔍 Completing setup with URL:', API_ENDPOINTS.USER_SETUP_COMPLETE);
      const payload: any = {
        jiraUrl: formData.jiraUrl,
        jiraToken: formData.jiraToken,
        openaiToken: formData.openaiToken
      };
      const normalizedJiraUrl = (formData.jiraUrl || '').trim().toLowerCase();
      if (normalizedJiraUrl !== 'https://movonte.atlassian.net' && formData.organizationLogo) {
        payload.organizationLogo = formData.organizationLogo;
      }

      const response = await post(API_ENDPOINTS.USER_SETUP_COMPLETE, payload);

      if (response.success) {
        setSuccess('🎉 Configuración completada exitosamente!');

        // Actualizar el estado del usuario
        updateUser({ isInitialSetupComplete: true });

        return true;
      } else {
        setError(response.error || 'Error completando la configuración');
        return false;
      }
    } catch (err) {
      console.error('Error completing setup:', err);
      setError('Error de conexión al completar la configuración');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [post, updateUser]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    isLoading,
    isValidating,
    error,
    success,
    validationResult,
    validateTokens,
    completeSetup,
    clearMessages
  };
};
