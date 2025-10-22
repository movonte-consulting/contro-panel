import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Mail,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface ApprovalNotification {
  id: number;
  user_id: number;
  service_id: string;
  service_name: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  created_at: string;
  updated_at: string;
  user_username: string;
  user_email: string;
}

interface ApprovalNotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApprovalNotifications: React.FC<ApprovalNotificationsProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<ApprovalNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/approval-notifications/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar notificaciones');
      }

      const data = await response.json();
      setNotifications(data.data.notifications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/admin/approval-notifications/${notificationId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Servicio aprobado por administrador'
        })
      });

      if (!response.ok) {
        throw new Error('Error al aprobar servicio');
      }

      // Recargar notificaciones
      await fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aprobar servicio');
    }
  };

  const handleReject = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/admin/approval-notifications/${notificationId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Servicio rechazado por administrador'
        })
      });

      if (!response.ok) {
        throw new Error('Error al rechazar servicio');
      }

      // Recargar notificaciones
      await fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al rechazar servicio');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Notificaciones de Aprobación
              </h2>
              <p className="text-sm text-gray-600">
                Servicios pendientes de aprobación
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchNotifications}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Cargando notificaciones...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <span className="ml-2 text-red-600">{error}</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="ml-2 text-gray-600">No hay notificaciones pendientes</span>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {notification.service_name}
                        </span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Pendiente
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{notification.user_username}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{notification.user_email}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">
                        {notification.message}
                      </p>
                      
                      <div className="text-xs text-gray-500">
                        Solicitado: {new Date(notification.created_at).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleApprove(notification.id)}
                        className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Aprobar</span>
                      </button>
                      <button
                        onClick={() => handleReject(notification.id)}
                        className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Rechazar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {notifications.length} notificación{notifications.length !== 1 ? 'es' : ''} pendiente{notifications.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalNotifications;
