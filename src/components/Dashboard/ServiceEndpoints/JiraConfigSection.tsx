import React from 'react';
import { User, Settings, MessageSquare, Loader2, Save } from 'lucide-react';

interface JiraConfigSectionProps {
  isLoading: boolean;
  isSaving: boolean;
  assistantJiraEmail: string;
  setAssistantJiraEmail: (value: string) => void;
  assistantJiraToken: string;
  setAssistantJiraToken: (value: string) => void;
  assistantJiraUrl: string;
  setAssistantJiraUrl: (value: string) => void;
  widgetJiraEmail: string;
  setWidgetJiraEmail: (value: string) => void;
  widgetJiraToken: string;
  setWidgetJiraToken: (value: string) => void;
  widgetJiraUrl: string;
  setWidgetJiraUrl: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const JiraConfigSection: React.FC<JiraConfigSectionProps> = ({
  isLoading,
  isSaving,
  assistantJiraEmail,
  setAssistantJiraEmail,
  assistantJiraToken,
  setAssistantJiraToken,
  assistantJiraUrl,
  setAssistantJiraUrl,
  widgetJiraEmail,
  setWidgetJiraEmail,
  widgetJiraToken,
  setWidgetJiraToken,
  widgetJiraUrl,
  setWidgetJiraUrl,
  onSave,
  onCancel
}) => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-purple-900">
            Configuración de Cuentas de Jira
          </h3>
        </div>
        {isLoading && <Loader2 className="w-5 h-5 animate-spin text-purple-600" />}
      </div>
      
      <p className="text-sm text-purple-800 mb-4">
        Configura cuentas de Jira alternativas para este servicio. Si no configuras ninguna, se usarán tus credenciales principales.
      </p>

      <div className="space-y-6">
        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
            <Settings className="w-4 h-4 mr-2 text-indigo-600" />
            Cuenta del Asistente
          </h4>
          <p className="text-xs text-gray-600 mb-3">
            Esta cuenta se usará para responder automáticamente a los tickets
          </p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email de Jira
              </label>
              <input
                type="email"
                value={assistantJiraEmail}
                onChange={(e) => setAssistantJiraEmail(e.target.value)}
                placeholder="assistant@movonte.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token de Jira
              </label>
              <input
                type="password"
                value={assistantJiraToken}
                onChange={(e) => setAssistantJiraToken(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Solo necesitas ingresar el token si deseas actualizarlo
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de Jira
              </label>
              <input
                type="url"
                value={assistantJiraUrl}
                onChange={(e) => setAssistantJiraUrl(e.target.value)}
                placeholder="https://movonte.atlassian.net"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-teal-600" />
            Cuenta del Widget
          </h4>
          <p className="text-xs text-gray-600 mb-3">
            Esta cuenta se usará para interacciones del widget con Jira
          </p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email de Jira
              </label>
              <input
                type="email"
                value={widgetJiraEmail}
                onChange={(e) => setWidgetJiraEmail(e.target.value)}
                placeholder="widget@movonte.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token de Jira
              </label>
              <input
                type="password"
                value={widgetJiraToken}
                onChange={(e) => setWidgetJiraToken(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Solo necesitas ingresar el token si deseas actualizarlo
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de Jira
              </label>
              <input
                type="url"
                value={widgetJiraUrl}
                onChange={(e) => setWidgetJiraUrl(e.target.value)}
                placeholder="https://movonte.atlassian.net"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Cuentas</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JiraConfigSection;