import React from 'react';
import { ChatKit, useChatKit as useOpenAIChatKit } from '@openai/chatkit-react';
import { useAuth } from '../hooks/useAuth';
import { useChatKit } from '../hooks/useChatKit';
import { MessageCircle, X, Minimize2 } from 'lucide-react';

interface ChatKitWidgetProps {
  className?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  onClose?: () => void;
}

const ChatKitWidget: React.FC<ChatKitWidgetProps> = ({
  className = '',
  isMinimized = false,
  onToggleMinimize,
  onClose
}) => {
  const { isAuthenticated, user } = useAuth();
  const { createSession, refreshSession, isLoading, error } = useChatKit();

  console.log('🔍 ChatKitWidget: Component mounted', { 
    isAuthenticated, 
    user: user?.username, 
    isLoading, 
    error,
    isMinimized 
  });

  const { control } = useOpenAIChatKit({
    api: {
      async getClientSecret(existing) {
        console.log('🔍 ChatKit: getClientSecret called', { existing, isAuthenticated, user: user?.username });
        
        if (!isAuthenticated) {
          console.error('❌ ChatKit: Usuario no autenticado');
          throw new Error('Usuario no autenticado');
        }

        try {
          if (existing) {
            console.log('🔄 ChatKit: Refrescando sesión existente');
            return await refreshSession(existing);
          } else {
            console.log('🆕 ChatKit: Creando nueva sesión');
            return await createSession();
          }
        } catch (err) {
          console.error('❌ ChatKit: Error en session:', err);
          throw err;
        }
      },
    }
    // Removemos completamente el tema para usar la configuración por defecto
  });

  if (!isAuthenticated) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chat no disponible
          </h3>
          <p className="text-gray-600">
            Inicia sesión para acceder al chat con IA
          </p>
        </div>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <button
          onClick={onToggleMinimize}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Movonte AI Assistant</h3>
            <p className="text-blue-100 text-sm">Asistente inteligente</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-700 text-sm">Conectando con el asistente...</p>
          </div>
        </div>
      )}

      {/* ChatKit Component */}
      <div className="h-96">
        <ChatKit 
          control={control} 
          className="h-full w-full"
        />
      </div>
    </div>
  );
};

export default ChatKitWidget;
