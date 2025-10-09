import React from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthDebug: React.FC = () => {
  const { isAuthenticated, user, token, isLoading } = useAuth();

  // Solo mostrar en desarrollo
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-lg shadow-lg text-xs z-50 max-w-sm">
      <h3 className="font-bold mb-2 text-yellow-400">🔧 Auth Debug</h3>
      <div className="space-y-1">
        <p><strong>Loading:</strong> {isLoading ? 'Sí' : 'No'}</p>
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Sí' : 'No'}</p>
        <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'No'}</p>
        <p><strong>User:</strong> {user?.username || 'No'}</p>
        <p><strong>Role:</strong> {user?.role || 'No'}</p>
        <p><strong>LocalStorage Token:</strong> {localStorage.getItem('authToken') ? 'Sí' : 'No'}</p>
        <p><strong>LocalStorage User:</strong> {localStorage.getItem('userData') ? 'Sí' : 'No'}</p>
      </div>
    </div>
  );
};

export default AuthDebug;

