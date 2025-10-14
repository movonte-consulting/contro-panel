import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { useAuth } from './useAuth';
import { API_ENDPOINTS } from '../config/api';

interface DisabledTicket {
  issueKey: string;
  reason: string;
  disabledAt: string;
  disabledBy: string;
}

interface TicketStatus {
  issueKey: string;
  isDisabled: boolean;
  ticketInfo?: {
    reason: string;
    disabledAt: string;
    disabledBy: string;
  };
}

interface UseTicketsReturn {
  disabledTickets: DisabledTicket[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  disableTicket: (issueKey: string, reason?: string) => Promise<boolean>;
  enableTicket: (issueKey: string) => Promise<boolean>;
  checkTicketStatus: (issueKey: string) => Promise<TicketStatus | null>;
}

export const useTickets = (): UseTicketsReturn => {
  const [disabledTickets, setDisabledTickets] = useState<DisabledTicket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { get, post } = useApi();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const fetchDisabledTickets = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Usar endpoints diferentes según el rol del usuario
      const isAdmin = user?.role === 'admin';
      const endpoint = isAdmin ? API_ENDPOINTS.TICKETS_DISABLED : API_ENDPOINTS.USER_TICKETS_DISABLED;
      
      console.log('🔄 Loading disabled tickets...', isAdmin ? '(admin)' : '(user)');
      const response = await get<{ disabledTickets: DisabledTicket[] }>(endpoint);
      
      if (response.success && response.data) {
        setDisabledTickets(response.data.disabledTickets || []);
        console.log('✅ Disabled tickets loaded:', response.data.disabledTickets?.length || 0);
      } else {
        setError(response.error || 'Error al obtener los tickets deshabilitados');
        setDisabledTickets([]);
      }
    } catch (err) {
      console.error('Error fetching disabled tickets:', err);
      setError('Error de conexión al obtener los tickets deshabilitados');
      setDisabledTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  const disableTicket = useCallback(async (issueKey: string, reason?: string): Promise<boolean> => {
    if (!issueKey) {
      setError('Se requiere el issueKey del ticket');
      return false;
    }

    try {
      setError(null);
      
      // Usar endpoints diferentes según el rol del usuario
      const isAdmin = user?.role === 'admin';
      const endpoint = isAdmin ? API_ENDPOINTS.TICKET_DISABLE(issueKey) : API_ENDPOINTS.USER_TICKET_DISABLE(issueKey);
      
      console.log('🔄 Disabling ticket:', issueKey, isAdmin ? '(admin)' : '(user)');
      const response = await post(endpoint, {
        reason: reason || 'Manual disable'
      });
      
      if (response.success) {
        console.log('✅ Ticket disabled:', issueKey);
        // Recargar la lista de tickets deshabilitados
        await fetchDisabledTickets();
        return true;
      } else {
        setError(response.error || 'Error al deshabilitar el ticket');
        return false;
      }
    } catch (err) {
      console.error('Error disabling ticket:', err);
      setError('Error de conexión al deshabilitar el ticket');
      return false;
    }
  }, [post, fetchDisabledTickets, user?.role]);

  const enableTicket = useCallback(async (issueKey: string): Promise<boolean> => {
    if (!issueKey) {
      setError('Se requiere el issueKey del ticket');
      return false;
    }

    try {
      setError(null);
      
      // Usar endpoints diferentes según el rol del usuario
      const isAdmin = user?.role === 'admin';
      const endpoint = isAdmin ? API_ENDPOINTS.TICKET_ENABLE(issueKey) : API_ENDPOINTS.USER_TICKET_ENABLE(issueKey);
      
      console.log('🔄 Enabling ticket:', issueKey, isAdmin ? '(admin)' : '(user)');
      const response = await post(endpoint);
      
      if (response.success) {
        console.log('✅ Ticket enabled:', issueKey);
        // Recargar la lista de tickets deshabilitados
        await fetchDisabledTickets();
        return true;
      } else {
        setError(response.error || 'Error al habilitar el ticket');
        return false;
      }
    } catch (err) {
      console.error('Error enabling ticket:', err);
      setError('Error de conexión al habilitar el ticket');
      return false;
    }
  }, [post, fetchDisabledTickets, user?.role]);

  const checkTicketStatus = useCallback(async (issueKey: string): Promise<TicketStatus | null> => {
    if (!issueKey) {
      setError('Se requiere el issueKey del ticket');
      return null;
    }

    try {
      setError(null);
      
      // Usar endpoints diferentes según el rol del usuario
      const isAdmin = user?.role === 'admin';
      const endpoint = isAdmin ? API_ENDPOINTS.TICKET_STATUS(issueKey) : API_ENDPOINTS.USER_TICKET_STATUS(issueKey);
      
      console.log('🔄 Checking ticket status:', issueKey, isAdmin ? '(admin)' : '(user)');
      const response = await get<{ issueKey: string; isDisabled: boolean; ticketInfo?: any }>(endpoint);
      
      if (response.success && response.data) {
        console.log('✅ Ticket status checked:', issueKey, response.data.isDisabled);
        return response.data as TicketStatus;
      } else {
        setError(response.error || 'Error al verificar el estado del ticket');
        return null;
      }
    } catch (err) {
      console.error('Error checking ticket status:', err);
      setError('Error de conexión al verificar el estado del ticket');
      return null;
    }
  }, [get, user?.role]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchDisabledTickets();
    } else if (!authLoading && !isAuthenticated) {
      setDisabledTickets([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading, fetchDisabledTickets]);

  return {
    disabledTickets,
    isLoading,
    error,
    refetch: fetchDisabledTickets,
    disableTicket,
    enableTicket,
    checkTicketStatus
  };
};

