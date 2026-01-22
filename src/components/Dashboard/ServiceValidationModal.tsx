import React from 'react';
import { Clock, User, Globe, AlertCircle } from 'lucide-react';

interface ServiceValidationData {
  websiteUrl: string;
  requestedDomain: string;
}

interface ServiceValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  validationData: ServiceValidationData;
}

export const ServiceValidationModal: React.FC<ServiceValidationModalProps> = ({
  isOpen,
  onClose,
  serviceName,
  validationData
}) => {
  const websiteUrl = validationData.websiteUrl;
  const requestedDomain = validationData.requestedDomain;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Servicio Creado Exitosamente
                </h3>
                <p className="text-sm text-gray-600">
                  {serviceName} está pendiente de aprobación
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Status Card */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">
                  Estado: Pendiente de Aprobación
                </h4>
                <p className="text-sm text-yellow-700">
                  Tu servicio ha sido creado pero necesita ser aprobado por un administrador 
                  antes de poder ser utilizado. Recibirás una notificación cuando sea aprobado.
                </p>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="space-y-4 mb-6">
            <h4 className="font-medium text-gray-900">Información del Servicio</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Nombre del Servicio</span>
                </div>
                <p className="text-gray-900 font-medium">{serviceName}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Dominio Solicitado</span>
                </div>
                <p className="text-gray-900 font-medium">
                  {requestedDomain || 'No especificado'}
                </p>
              </div>
            </div>

            {websiteUrl && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">URL del Sitio Web</span>
                </div>
                <p className="text-gray-900 font-medium">{websiteUrl}</p>
              </div>
            )}
          </div>

          {/* Process Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-800 mb-3">¿Qué sucede ahora?</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-blue-600">1</span>
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">Solicitud Enviada</p>
                  <p className="text-xs text-blue-600">
                    Tu solicitud ha sido enviada automáticamente a tu administrador
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-blue-600">2</span>
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">Revisión por Administrador</p>
                  <p className="text-xs text-blue-600">
                    El administrador revisará tu solicitud y verificará los detalles
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-blue-600">3</span>
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">Aprobación</p>
                  <p className="text-xs text-blue-600">
                    Una vez aprobado, tu servicio estará activo y listo para usar
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceValidationModal;
