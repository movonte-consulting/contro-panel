import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { API_ENDPOINTS } from '../config/api';

// Interfaces para la configuración inicial
export interface InitialSetupData {
  jiraToken: string;
  jiraUrl: string;
  openaiToken: string;
}

export interface TokenValidationResult {
  jiraToken: {
    isValid: boolean;
    message: string;
  };
  openaiToken: {
    isValid: boolean;
    message: string;
  };
}

export interface InitialSetupStatus {
  isInitialSetupComplete: boolean;
  hasTokens: boolean;
}

export interface UseInitialSetupReturn {
  setupStatus: InitialSetupStatus | null;
  isLoading: boolean;
  error: string | null;
  checkSetupStatus: () => Promise<void>;
  validateTokens: (data: InitialSetupData) => Promise<{ success: boolean; validation?: TokenValidationResult }>;
  completeSetup: (data: InitialSetupData) => Promise<boolean>;
}

export const useInitialSetup = (): UseInitialSetupReturn => {
  const [setupStatus, setSetupStatus] = useState<InitialSetupStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { get, post } = useApi();

  const checkSetupStatus = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Checking initial setup status...');
      const response = await get<{ isInitialSetupComplete: boolean }>(API_ENDPOINTS.USER_SETUP_STATUS);
      
      if (response.success && response.data) {
        setSetupStatus({
          isInitialSetupComplete: response.data.isInitialSetupComplete,
          hasTokens: response.data.isInitialSetupComplete
        });
        console.log('✅ Setup status checked:', response.data);
      } else {
        setError(response.error || 'Error al verificar el estado de configuración');
      }
    } catch (err) {
      console.error('Error checking setup status:', err);
      setError('Error de conexión al verificar el estado de configuración');
    } finally {
      setIsLoading(false);
    }
  }, [get]);

  const validateTokens = useCallback(async (data: InitialSetupData): Promise<{ success: boolean; validation?: TokenValidationResult }> => {
    try {
      setError(null);
      
      console.log('🔄 Validating tokens...');
      const response = await post<{ validation: TokenValidationResult; allTokensValid: boolean }>(
        API_ENDPOINTS.USER_SETUP_VALIDATE_TOKENS, 
        data
      );
      
      if (response.success && response.data) {
        console.log('✅ Tokens validation result:', response.data);
        return {
          success: response.data.allTokensValid,
          validation: response.data.validation
        };
      } else {
        setError(response.error || 'Error al validar los tokens');
        return { success: false };
      }
    } catch (err) {
      console.error('Error validating tokens:', err);
      setError('Error de conexión al validar los tokens');
      return { success: false };
    }
  }, [post]);

  const completeSetup = useCallback(async (data: InitialSetupData): Promise<boolean> => {
    try {
      setError(null);
      
      console.log('🔄 Completing initial setup...');
      const response = await post<{ isInitialSetupComplete: boolean }>(
        API_ENDPOINTS.USER_SETUP_COMPLETE, 
        data
      );
      
      if (response.success && response.data) {
        setSetupStatus({
          isInitialSetupComplete: true,
          hasTokens: true
        });
        console.log('✅ Initial setup completed successfully');
        return true;
      } else {
        setError(response.error || 'Error al completar la configuración inicial');
        return false;
      }
    } catch (err) {
      console.error('Error completing setup:', err);
      setError('Error de conexión al completar la configuración inicial');
      return false;
    }
  }, [post]);

  return {
    setupStatus,
    isLoading,
    error,
    checkSetupStatus,
    validateTokens,
    completeSetup
  };
};


