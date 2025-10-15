import React, { useState } from 'react';
import { Globe, Shield, CheckCircle, XCircle, Loader2, Info } from 'lucide-react';
import { useServiceValidation, type ServiceValidationRequest } from '../hooks/useServiceValidation';

interface ServiceValidationFormProps {
  onSuccess?: (validation: any) => void;
  onCancel?: () => void;
}

export const ServiceValidationForm: React.FC<ServiceValidationFormProps> = ({ onSuccess, onCancel }) => {
  const { createValidationRequest, loading, error } = useServiceValidation();
  const [formData, setFormData] = useState<ServiceValidationRequest>({
    serviceName: '',
    serviceDescription: '',
    websiteUrl: '',
    requestedDomain: ''
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.serviceName.trim()) {
      errors.serviceName = 'El nombre del servicio es requerido';
    }

    if (!formData.websiteUrl.trim()) {
      errors.websiteUrl = 'La URL del sitio web es requerida';
    } else {
      try {
        new URL(formData.websiteUrl);
      } catch {
        errors.websiteUrl = 'La URL no tiene un formato válido';
      }
    }

    if (!formData.requestedDomain.trim()) {
      errors.requestedDomain = 'El dominio solicitado es requerido';
    } else {
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/;
      if (!domainRegex.test(formData.requestedDomain)) {
        errors.requestedDomain = 'El dominio no tiene un formato válido';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const validation = await createValidationRequest(formData);
      onSuccess?.(validation);
    } catch (err) {
      console.error('Error creating validation request:', err);
    }
  };

  const handleInputChange = (field: keyof ServiceValidationRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Solicitar Validación de Servicio</h2>
          <p className="text-sm text-gray-600">Protege tu token y configura CORS automáticamente</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">¿Cómo funciona la validación?</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Tu token de API se mantiene protegido y no se expone</li>
              <li>• Un administrador revisará tu solicitud</li>
              <li>• Una vez aprobado, CORS se configurará automáticamente</li>
              <li>• Recibirás un token protegido para usar en tu servicio</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Servicio *
          </label>
          <input
            type="text"
            id="serviceName"
            value={formData.serviceName}
            onChange={(e) => handleInputChange('serviceName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.serviceName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Mi Servicio de Chat"
            disabled={loading}
          />
          {validationErrors.serviceName && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.serviceName}</p>
          )}
        </div>

        <div>
          <label htmlFor="serviceDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción del Servicio
          </label>
          <textarea
            id="serviceDescription"
            value={formData.serviceDescription}
            onChange={(e) => handleInputChange('serviceDescription', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe brevemente qué hace tu servicio..."
            rows={3}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-2">
            URL del Sitio Web *
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="url"
              id="websiteUrl"
              value={formData.websiteUrl}
              onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.websiteUrl ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="https://mi-sitio.com"
              disabled={loading}
            />
          </div>
          {validationErrors.websiteUrl && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.websiteUrl}</p>
          )}
        </div>

        <div>
          <label htmlFor="requestedDomain" className="block text-sm font-medium text-gray-700 mb-2">
            Dominio para CORS *
          </label>
          <input
            type="text"
            id="requestedDomain"
            value={formData.requestedDomain}
            onChange={(e) => {
              let domain = e.target.value;
              // Si el usuario ingresa una URL completa, extraer solo el dominio
              try {
                if (domain.includes('://')) {
                  const url = new URL(domain);
                  domain = url.hostname;
                  // Remover www. si está presente
                  if (domain.startsWith('www.')) {
                    domain = domain.substring(4);
                  }
                }
              } catch {
                // Si no es una URL válida, usar el valor tal como está
              }
              handleInputChange('requestedDomain', domain);
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.requestedDomain ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="mi-sitio.com"
            disabled={loading}
          />
          <p className="mt-1 text-sm text-gray-500">
            Solo el dominio (sin https:// o www). Las URLs se convertirán automáticamente a dominios.
          </p>
          {validationErrors.requestedDomain && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.requestedDomain}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Enviar Solicitud
              </>
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
