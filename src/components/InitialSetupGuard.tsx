import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface InitialSetupGuardProps {
  children: React.ReactNode;
}

const InitialSetupGuard: React.FC<InitialSetupGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSetup = async () => {
      // Si no está autenticado, no hacer nada
      if (!isAuthenticated || authLoading) {
        setIsChecking(false);
        return;
      }

      // Si ya está en la página de configuración inicial, no redirigir
      if (location.pathname === '/initial-setup') {
        setIsChecking(false);
        return;
      }

      // Si es admin, no necesita configuración inicial
      if (user?.role === 'admin') {
        setIsChecking(false);
        return;
      }

      // Solo verificar si el usuario ya tiene el flag de configuración inicial
      if (user?.isInitialSetupComplete === false) {
        console.log('🔄 User needs initial setup, redirecting...');
        navigate('/initial-setup');
        setIsChecking(false);
        return;
      }

      setIsChecking(false);
    };

    checkSetup();
  }, [isAuthenticated, authLoading, user?.role, user?.isInitialSetupComplete, location.pathname, navigate]);


  // Mostrar loading mientras se verifica
  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando configuración...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default InitialSetupGuard;
