import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { useAuth } from './useAuth';
import { API_ENDPOINTS } from '../config/api';

interface WebhookStatus {
  isEnabled: boolean;
  webhookUrl?: string;
  lastTest?: string;
  filterEnabled: boolean;
  filterCondition?: string;
  filterValue?: string;
}

interface SavedWebhook {
  id: number;
  name: string;
  url: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

interface WebhookTestResult {
  status: string;
  responseTime: number;
  webhookUrl: string;
}

interface UseWebhooksReturn {
  webhookStatus: WebhookStatus | null;
  savedWebhooks: SavedWebhook[];
  isLoading: boolean;
  error: string | null;
  refetchStatus: () => Promise<void>;
  refetchSaved: () => Promise<void>;
  configureWebhook: (webhookUrl: string, assistantId: string) => Promise<boolean>;
  testWebhook: () => Promise<WebhookTestResult | null>;
  disableWebhook: () => Promise<boolean>;
  setWebhookFilter: (filterEnabled: boolean, filterCondition?: string, filterValue?: string) => Promise<boolean>;
  saveWebhook: (name: string, url: string, description?: string) => Promise<boolean>;
  deleteWebhook: (id: number) => Promise<boolean>;
}

export const useWebhooks = (): UseWebhooksReturn => {
  const [webhookStatus, setWebhookStatus] = useState<WebhookStatus | null>(null);
  const [savedWebhooks, setSavedWebhooks] = useState<SavedWebhook[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { get, post, delete: deleteRequest } = useApi();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const fetchWebhookStatus = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      console.log('🔄 Loading webhook status...');
      const response = await get<WebhookStatus>(API_ENDPOINTS.WEBHOOK_STATUS);
      
      if (response.success && response.data) {
        setWebhookStatus(response.data);
        console.log('✅ Webhook status loaded:', response.data);
      } else {
        setError(response.error || 'Error al obtener el estado del webhook');
        setWebhookStatus(null);
      }
    } catch (err) {
      console.error('Error fetching webhook status:', err);
      setError('Error de conexión al obtener el estado del webhook');
      setWebhookStatus(null);
    }
  }, [isAuthenticated]);

  const fetchSavedWebhooks = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setError(null);
      
      console.log('🔄 Loading saved webhooks...');
      const response = await get<{ webhooks: SavedWebhook[] }>(API_ENDPOINTS.WEBHOOKS_SAVED);
      
      if (response.success && response.data) {
        setSavedWebhooks(response.data.webhooks || []);
        console.log('✅ Saved webhooks loaded:', response.data.webhooks?.length || 0);
      } else {
        setError(response.error || 'Error al obtener los webhooks guardados');
        setSavedWebhooks([]);
      }
    } catch (err) {
      console.error('Error fetching saved webhooks:', err);
      setError('Error de conexión al obtener los webhooks guardados');
      setSavedWebhooks([]);
    }
  }, [isAuthenticated]);

  const configureWebhook = useCallback(async (webhookUrl: string, assistantId: string): Promise<boolean> => {
    if (!webhookUrl || !assistantId) {
      setError('Se requiere la URL del webhook y el ID del asistente');
      return false;
    }

    try {
      setError(null);
      
      console.log('🔄 Configuring webhook:', webhookUrl);
      const response = await post(API_ENDPOINTS.WEBHOOK_CONFIGURE, {
        webhookUrl,
        assistantId
      });
      
      if (response.success) {
        console.log('✅ Webhook configured:', webhookUrl);
        await fetchWebhookStatus();
        return true;
      } else {
        setError(response.error || 'Error al configurar el webhook');
        return false;
      }
    } catch (err) {
      console.error('Error configuring webhook:', err);
      setError('Error de conexión al configurar el webhook');
      return false;
    }
  }, [post, fetchWebhookStatus]);

  const testWebhook = useCallback(async (): Promise<WebhookTestResult | null> => {
    try {
      setError(null);
      
      console.log('🔄 Testing webhook...');
      const response = await post<WebhookTestResult>(API_ENDPOINTS.WEBHOOK_TEST);
      
      if (response.success && response.data) {
        console.log('✅ Webhook tested:', response.data);
        return response.data;
      } else {
        setError(response.error || 'Error al probar el webhook');
        return null;
      }
    } catch (err) {
      console.error('Error testing webhook:', err);
      setError('Error de conexión al probar el webhook');
      return null;
    }
  }, [post]);

  const disableWebhook = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      
      console.log('🔄 Disabling webhook...');
      const response = await post(API_ENDPOINTS.WEBHOOK_DISABLE);
      
      if (response.success) {
        console.log('✅ Webhook disabled');
        await fetchWebhookStatus();
        return true;
      } else {
        setError(response.error || 'Error al deshabilitar el webhook');
        return false;
      }
    } catch (err) {
      console.error('Error disabling webhook:', err);
      setError('Error de conexión al deshabilitar el webhook');
      return false;
    }
  }, [post, fetchWebhookStatus]);

  const setWebhookFilter = useCallback(async (filterEnabled: boolean, filterCondition?: string, filterValue?: string): Promise<boolean> => {
    if (filterEnabled && (!filterCondition || !filterValue)) {
      setError('filterCondition y filterValue son requeridos cuando filterEnabled es true');
      return false;
    }

    try {
      setError(null);
      
      console.log('🔄 Setting webhook filter...');
      const response = await post(API_ENDPOINTS.WEBHOOK_FILTER, {
        filterEnabled,
        filterCondition,
        filterValue
      });
      
      if (response.success) {
        console.log('✅ Webhook filter set');
        await fetchWebhookStatus();
        return true;
      } else {
        setError(response.error || 'Error al configurar el filtro del webhook');
        return false;
      }
    } catch (err) {
      console.error('Error setting webhook filter:', err);
      setError('Error de conexión al configurar el filtro del webhook');
      return false;
    }
  }, [post, fetchWebhookStatus]);

  const saveWebhook = useCallback(async (name: string, url: string, description?: string): Promise<boolean> => {
    if (!name || !url) {
      setError('name y url son requeridos');
      return false;
    }

    try {
      setError(null);
      
      console.log('🔄 Saving webhook:', name);
      const response = await post(API_ENDPOINTS.WEBHOOKS_SAVE, {
        name,
        url,
        description
      });
      
      if (response.success) {
        console.log('✅ Webhook saved:', name);
        await fetchSavedWebhooks();
        return true;
      } else {
        setError(response.error || 'Error al guardar el webhook');
        return false;
      }
    } catch (err) {
      console.error('Error saving webhook:', err);
      setError('Error de conexión al guardar el webhook');
      return false;
    }
  }, [post, fetchSavedWebhooks]);

  const deleteWebhook = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError(null);
      
      console.log('🔄 Deleting webhook:', id);
      const response = await deleteRequest(API_ENDPOINTS.WEBHOOKS_DELETE(id.toString()));
      
      if (response.success) {
        console.log('✅ Webhook deleted:', id);
        await fetchSavedWebhooks();
        return true;
      } else {
        setError(response.error || 'Error al eliminar el webhook');
        return false;
      }
    } catch (err) {
      console.error('Error deleting webhook:', err);
      setError('Error de conexión al eliminar el webhook');
      return false;
    }
  }, [deleteRequest, fetchSavedWebhooks]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setIsLoading(true);
      Promise.all([fetchWebhookStatus(), fetchSavedWebhooks()]).finally(() => {
        setIsLoading(false);
      });
    } else if (!authLoading && !isAuthenticated) {
      setWebhookStatus(null);
      setSavedWebhooks([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading, fetchWebhookStatus, fetchSavedWebhooks]);

  return {
    webhookStatus,
    savedWebhooks,
    isLoading,
    error,
    refetchStatus: fetchWebhookStatus,
    refetchSaved: fetchSavedWebhooks,
    configureWebhook,
    testWebhook,
    disableWebhook,
    setWebhookFilter,
    saveWebhook,
    deleteWebhook
  };
};

