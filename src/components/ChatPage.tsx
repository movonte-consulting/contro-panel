import React, { useState } from 'react';
import ChatKitWidget from './ChatKitWidget';
import ChatKitDebug from './ChatKitDebug';
import { MessageCircle, Settings, BarChart3, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al Dashboard</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chat con IA</h1>
                <p className="text-gray-600">Asistente inteligente de Movonte</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isFullscreen ? (
                <>
                  <BarChart3 className="w-4 h-4" />
                  <span>Vista Normal</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4" />
                  <span>Pantalla Completa</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {isFullscreen ? (
          /* Fullscreen Chat */
          <div className="h-[calc(100vh-140px)]">
            <ChatKitWidget
              className="h-full"
            />
          </div>
        ) : (
          /* Normal Layout with Stats */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Widget - Takes 3/4 of the space */}
            <div className="lg:col-span-3">
              <ChatKitWidget
                className="h-[600px]"
              />
            </div>
            
            {/* Sidebar with Stats and Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* ChatKit Debug */}
              <ChatKitDebug />
              
              {/* Chat Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Estadísticas</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Sesiones hoy</span>
                    <span className="font-semibold text-gray-900">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Mensajes enviados</span>
                    <span className="font-semibold text-gray-900">156</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tiempo promedio</span>
                    <span className="font-semibold text-gray-900">8 min</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Settings className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
                </div>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="font-medium text-gray-900">Nueva conversación</div>
                    <div className="text-sm text-gray-600">Iniciar chat limpio</div>
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="font-medium text-gray-900">Historial</div>
                    <div className="text-sm text-gray-600">Ver conversaciones anteriores</div>
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="font-medium text-gray-900">Configuración</div>
                    <div className="text-sm text-gray-600">Personalizar asistente</div>
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Consejos</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Puedes adjuntar archivos para análisis</li>
                  <li>• Usa comandos específicos para tareas</li>
                  <li>• El asistente recuerda el contexto</li>
                  <li>• Puedes pedir explicaciones detalladas</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
