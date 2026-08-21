import { useState, useEffect, useCallback } from 'react';
import { getToken, setToken as persistToken, clearToken, getStoredUserRaw, setStoredUser, clearStoredUser } from '../../../shared/lib/sessionStorage';

interface UserPermissions {
  serviceManagement: boolean;
  automaticAIDisableRules: boolean;
  webhookConfiguration: boolean;
  ticketControl: boolean;
  aiEnabledProjects: boolean;
  remoteServerIntegration: boolean;
}

interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
  permissions?: UserPermissions;
  lastLogin: string;
  isInitialSetupComplete: boolean;
  organizationLogo?: string;
  jiraUrl?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  token: string | null;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true
  });

  useEffect(() => {
    // Verificar si hay datos de autenticación persistidos
    const token = getToken();
    const userDataRaw = getStoredUserRaw();

    if (token && userDataRaw) {
      try {
        const user = JSON.parse(userDataRaw) as UserData;
        setAuthState({
          isAuthenticated: true,
          user,
          token,
          isLoading: false
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Si hay error al parsear, limpiar datos corruptos
        logout();
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback((token: string, user: UserData) => {
    persistToken(token);
    setStoredUser(user);

    setAuthState({
      isAuthenticated: true,
      user,
      token,
      isLoading: false
    });

    console.log('✅ Login successful, user authenticated:', user.username);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    clearStoredUser();

    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false
    });

    // Redirigir al login después de limpiar el estado
    window.location.href = '/login';
  }, []);

  const updateUser = useCallback((updatedUser: Partial<UserData>) => {
    if (authState.user) {
      const newUser = { ...authState.user, ...updatedUser };
      setStoredUser(newUser);
      setAuthState(prev => ({ ...prev, user: newUser }));
    }
  }, [authState.user]);

  return {
    ...authState,
    login,
    logout,
    updateUser
  };
};
