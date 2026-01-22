import React, { useState } from 'react';
import { MonitorPlay, Info, Check, Copy, AlertCircle } from 'lucide-react';

interface WidgetIntegrationProps {
  serviceId: string;
  serviceName: string;
  assistantName: string;
  protectedToken: string;
  wsBaseUrl: string;
}

const WidgetIntegration: React.FC<WidgetIntegrationProps> = ({
  serviceId,
  serviceName,
  assistantName,
  protectedToken,
  wsBaseUrl
}) => {
  const [copied, setCopied] = useState(false);

  const token = protectedToken || 'YOUR_PROTECTED_TOKEN';
  
  const widgetHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Widget - ${serviceName}</title>
    <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
    <style>
        /* Agrega aquí los estilos CSS */
    </style>
</head>
<body>
    <div class="chat-container">
        </div>

    <script>
        const CONFIG = {
            serviceId: '${serviceId}',
            token: '${token}',
            wsUrl: '${wsBaseUrl}',
            assistantName: '${assistantName}'
        };

        const socket = io(CONFIG.wsUrl, {
            query: {
                serviceId: CONFIG.serviceId,
                token: CONFIG.token
            }
        });

        // Lógica del chat...
    </script>
</body>
</html>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(widgetHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <MonitorPlay className="w-5 h-5 mr-2 text-purple-600" />
        Integración con Widget HTML
      </h3>
      
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-5 mb-6">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-purple-900 mb-2">
              Widget de Chat Listo para Usar
            </h4>
            <p className="text-sm text-purple-800 mb-3">
              Integra fácilmente un chat en tu sitio web con nuestro widget pre-construido. 
            </p>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Widget HTML Completo</span>
            <span className="text-xs text-gray-500">(Copiar y pegar en tu sitio)</span>
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
                <span>Copiar Widget</span>
              </>
            )}
          </button>
        </div>
        <pre className="bg-gray-900 text-gray-100 p-4 text-sm overflow-x-auto max-h-96">
          <code>{widgetHtml}</code>
        </pre>
      </div>

      <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold text-yellow-900 text-sm mb-1">
              ⚠️ Importante: Seguridad del Token
            </h5>
            <ul className="text-xs text-yellow-800 space-y-1">
              <li>• El widget ya incluye tu <strong>Token Protegido</strong> automáticamente</li>
              <li>• Este token es específico para el servicio <strong>{serviceName}</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetIntegration;