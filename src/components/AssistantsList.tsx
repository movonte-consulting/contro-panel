import React from 'react';
import { Bot, Activity, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAssistants } from '../hooks/useAssistants';

const AssistantsList: React.FC = () => {
  const { assistants, activeAssistant, totalAssistants, isLoading, error } = useAssistants();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Cargando asistentes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <XCircle className="w-8 h-8 text-red-500 mr-3" />
          <span className="text-red-600">{error}</span>
        </div>
      </div>
    );
  }

  if (assistants.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Bot className="w-8 h-8 text-gray-400 mr-3" />
          <span className="text-gray-600">No hay asistentes disponibles</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Asistentes de IA</h2>
        <div className="text-sm text-gray-500">
          Total: {totalAssistants}
        </div>
      </div>

      {/* Información del asistente activo global */}
      {activeAssistant && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium opacity-90">Asistente Activo Global:</div>
              <div className="text-lg font-semibold">
                {assistants.find(a => a.id === activeAssistant)?.name || 'Sin nombre'}
              </div>
            </div>
            <Activity className="w-6 h-6 opacity-80" />
          </div>
        </div>
      )}

      {/* Lista de asistentes */}
      <div className="space-y-3">
        {assistants.map((assistant) => {
          const isActive = assistant.isActive || false;
          const isGlobalActive = assistant.id === activeAssistant;
          
          return (
            <div
              key={assistant.id}
              className={`p-4 rounded-lg border transition-all ${
                isActive 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              } ${isGlobalActive ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                  }`}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {assistant.name || 'Sin nombre'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ID: {assistant.id} • Modelo: {assistant.model}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isGlobalActive && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      Global
                    </span>
                  )}
                  <div className="flex items-center space-x-1">
                    {isActive ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {isActive ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssistantsList;
