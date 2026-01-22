import React, { useState } from 'react';
import { Clock, Loader2, RefreshCw, Key, Check, Copy } from 'lucide-react';

interface TokenSectionProps {
  expirationHours: number;
  setExpirationHours: (hours: number) => void;
  tokenLoading: boolean;
  regenerateToken: () => void;
  protectedToken: string;
  tokenInfo: { expirationHours?: number; expiresAt?: string };
  serviceId: string;
}

const TokenSection: React.FC<TokenSectionProps> = ({
  expirationHours,
  setExpirationHours,
  tokenLoading,
  regenerateToken,
  protectedToken,
  tokenInfo,
  serviceId
}) => {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set(prev).add(itemId));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Clock className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Configuración de Expiración del Token
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">
                  Tiempo de expiración
                </label>
                <select
                  value={expirationHours}
                  onChange={(e) => setExpirationHours(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value={1}>1 hora</option>
                  <option value={6}>6 horas</option>
                  <option value={12}>12 horas</option>
                  <option value={24}>24 horas (1 día)</option>
                  <option value={72}>72 horas (3 días)</option>
                  <option value={168}>168 horas (1 semana)</option>
                  <option value={720}>720 horas (30 días)</option>
                </select>
                <p className="text-xs text-blue-600 mt-1">
                  Selecciona cuánto tiempo debe durar el token protegido
                </p>
              </div>
              <button
                onClick={regenerateToken}
                disabled={tokenLoading}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-sm"
              >
                {tokenLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>{tokenLoading ? 'Generando...' : 'Regenerar Token'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Key className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-900 mb-2">
              Token Protegido del Servicio
            </h3>
            {tokenLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                <span className="text-sm text-green-700">Generando token...</span>
              </div>
            ) : protectedToken ? (
              <div className="space-y-2">
                <div className="bg-white border border-green-300 rounded p-3 font-mono text-sm break-all">
                  {protectedToken}
                </div>
                <button
                  onClick={() => copyToClipboard(protectedToken, 'protected-token')}
                  className="flex items-center space-x-1 text-sm text-green-700 hover:text-green-800 transition-colors"
                >
                  {copiedItems.has('protected-token') ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Token copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar token</span>
                    </>
                  )}
                </button>
                <div className="space-y-1">
                  <p className="text-xs text-green-700">
                    Este token es específico para este servicio y no expone tus credenciales reales.
                  </p>
                  {tokenInfo.expirationHours && (
                    <p className="text-xs text-green-600">
                      ⏰ Expira en: {tokenInfo.expirationHours} horas
                      {tokenInfo.expiresAt && (
                        <span className="block">
                          📅 Fecha de expiración: {new Date(tokenInfo.expiresAt).toLocaleString()}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-red-700">
                  No se pudo generar el token protegido.
                </p>
                <button
                  onClick={regenerateToken}
                  className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TokenSection;