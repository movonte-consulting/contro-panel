import { useState, useEffect, useCallback } from 'react';

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
    // Verificar si hay datos de autenticación en localStorage
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
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
  }, []);

  const login = useCallback((token: string, user: UserData) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    
    setAuthState({
      isAuthenticated: true,
      user,
      token,
      isLoading: false
    });
    
    console.log('✅ Login successful, user authenticated:', user.username);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
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
      localStorage.setItem('userData', JSON.stringify(newUser));
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
