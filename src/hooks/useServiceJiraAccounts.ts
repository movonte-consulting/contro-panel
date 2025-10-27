/**
 * Hook para gestionar cuentas de Jira por servicio
 */

import { useState, useCallback } from 'react';
import { useApi } from './useApi';

export interface ServiceJiraAccount {
  id?: number;
  userId?: number;
  serviceId: string;
  assistantJiraEmail?: string;
  assistantJiraUrl?: string;
  widgetJiraEmail?: string;
  widgetJiraUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceJiraAccountInput {
  assistantJiraEmail?: string;
  assistantJiraToken?: string;
  assistantJiraUrl?: string;
  widgetJiraEmail?: string;
  widgetJiraToken?: string;
  widgetJiraUrl?: string;
  isActive?: boolean;
}

export function useServiceJiraAccounts() {
  const { get, post, delete: del } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtener cuentas de Jira para un servicio
   */
  const getServiceJiraAccounts = useCallback(async (serviceId: string): Promise<ServiceJiraAccount | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await get<{ data: ServiceJiraAccount | null }>(
        `/api/service/${serviceId}/jira-accounts`
      );

      if (response && response.success && response.data) {
        return response.data.data;
      } else {
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener cuentas de Jira';
      setError(errorMessage);
      console.error('Error getting service Jira accounts:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [get]);

  /**
   * Crear o actualizar cuentas de Jira para un servicio
   */
  const upsertServiceJiraAccounts = useCallback(async (
    serviceId: string,
    accountData: ServiceJiraAccountInput
  ): Promise<ServiceJiraAccount> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await post<{ data: ServiceJiraAccount }>(
        `/api/service/${serviceId}/jira-accounts`,
        accountData
      );

      if (response && response.success && response.data) {
        return response.data.data;
      } else {
        throw new Error(response?.message || response?.error || 'Error al guardar cuentas de Jira');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al guardar cuentas de Jira';
      setError(errorMessage);
      console.error('Error upserting service Jira accounts:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [post]);

  /**
   * Eliminar cuentas de Jira para un servicio
   */
  const deleteServiceJiraAccounts = useCallback(async (serviceId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await del<{ success: boolean; message?: string }>(
        `/api/service/${serviceId}/jira-accounts`
      );

      if (!response.success) {
        throw new Error(response.message || 'Error al eliminar cuentas de Jira');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al eliminar cuentas de Jira';
      setError(errorMessage);
      console.error('Error deleting service Jira accounts:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [del]);

  return {
    loading,
    error,
    getServiceJiraAccounts,
    upsertServiceJiraAccounts,
    deleteServiceJiraAccounts
  };
}

