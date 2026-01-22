import React, { useState } from 'react';
import { 
  MessageSquare, Key, MonitorPlay, Zap, Wifi, Check, Copy, type LucideIcon 
} from 'lucide-react';

interface EndpointsListProps {
  serviceId: string;
  baseUrl: string;
  wsBaseUrl: string;
}

interface EndpointItemProps {
  icon: LucideIcon;
  title: string;
  method: string;
  url: string;
  description: string;
  colorClass: string;
  badgeClass: string;
  iconClass: string;
  extraContent?: React.ReactNode;
}

const EndpointItem: React.FC<EndpointItemProps> = ({
  icon: Icon,
  title,
  method,
  url,
  description,
  colorClass,
  badgeClass,
  iconClass,
  extraContent
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon className={`w-5 h-5 ${iconClass}`} />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className={`${badgeClass} text-xs px-2 py-1 rounded-full`}>{method}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-800 break-all">
        {url}
      </div>
      <p className="text-sm text-gray-600 mt-2">
        {description}
      </p>
      {extraContent}
    </div>
  );
};

const EndpointsList: React.FC<EndpointsListProps> = ({ serviceId, baseUrl, wsBaseUrl }) => {
  return (
    <div className="space-y-6">
      <EndpointItem
        icon={MessageSquare}
        title="Endpoint de Chat"
        method="POST"
        url={`${baseUrl}/api/user/services/${serviceId}/chat`}
        description="Envía mensajes al asistente y recibe respuestas en tiempo real."
        colorClass="green"
        badgeClass="bg-green-100 text-green-800"
        iconClass="text-green-600"
      />

      <EndpointItem
        icon={Key}
        title="Endpoint de Estado"
        method="GET"
        url={`${baseUrl}/api/user/services/${serviceId}/status`}
        description="Verifica el estado del servicio y obtiene información sobre su configuración."
        colorClass="blue"
        badgeClass="bg-blue-100 text-blue-800"
        iconClass="text-blue-600"
      />

      <EndpointItem
        icon={MonitorPlay}
        title="Crear Ticket"
        method="POST"
        url={`${baseUrl}/api/service/create-ticket`}
        description="Crea un nuevo ticket en Jira usando el proyecto configurado para este servicio."
        colorClass="purple"
        badgeClass="bg-purple-100 text-purple-800"
        iconClass="text-purple-600"
      />

      <EndpointItem
        icon={Zap}
        title="Conectar a Ticket"
        method="POST"
        url={`${baseUrl}/api/widget/connect`}
        description="Conecta el widget a un ticket existente para recibir notificaciones y respuestas."
        colorClass="indigo"
        badgeClass="bg-indigo-100 text-indigo-800"
        iconClass="text-indigo-600"
      />

      <EndpointItem
        icon={MessageSquare}
        title="Enviar Mensaje a Ticket"
        method="POST"
        url={`${baseUrl}/api/widget/send-message`}
        description="Envía mensajes a un ticket específico y recibe respuestas de la IA."
        colorClass="teal"
        badgeClass="bg-teal-100 text-teal-800"
        iconClass="text-teal-600"
      />

      <EndpointItem
        icon={Wifi}
        title="Conexión WebSocket"
        method="WS"
        url={`${wsBaseUrl}/socket.io/?serviceId=${serviceId}`}
        description="Conexión en tiempo real para recibir respuestas instantáneas del asistente."
        colorClass="orange"
        badgeClass="bg-orange-100 text-orange-800"
        iconClass="text-orange-600"
        extraContent={
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <Zap className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Ventajas del WebSocket:</strong>
                </p>
                <ul className="text-xs text-blue-700 mt-1 space-y-1">
                  <li>• Respuestas instantáneas en tiempo real</li>
                  <li>• Mantiene el contexto de conversación</li>
                  <li>• Ideal para aplicaciones interactivas</li>
                  <li>• Soporte para múltiples eventos</li>
                </ul>
              </div>
            </div>
          </div>
        }
      />

      <EndpointItem
        icon={MessageSquare}
        title="Webhook de Jira"
        method="POST"
        url="https://chat.movonte.com/api/chatbot/webhook/jira"
        description="Configura este webhook en tu proyecto de Jira para recibir notificaciones automáticas."
        colorClass="purple"
        badgeClass="bg-purple-100 text-purple-800"
        iconClass="text-purple-600"
        extraContent={
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong> Agrega este webhook en la configuración de tu proyecto de Jira para que la IA pueda responder automáticamente a los tickets.
            </p>
          </div>
        }
      />
    </div>
  );
};

export default EndpointsList;