import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface OrganizationLogoUploaderProps {
  currentLogo?: string;
  organizationName?: string;
  onLogoUpload: (logoUrl: string) => Promise<void>;
  className?: string;
}

const OrganizationLogoUploader: React.FC<OrganizationLogoUploaderProps> = ({
  currentLogo,
  organizationName,
  onLogoUpload,
  className = ''
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogo || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5MB');
      return;
    }

    setError(null);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      
      // Convertir a base64 y llamar a onLogoUpload
      uploadLogo(result);
    };
    reader.readAsDataURL(file);
  };

  const uploadLogo = async (base64String: string) => {
    setIsUploading(true);
    try {
      await onLogoUpload(base64String);
    } catch (error) {
      console.error('Error uploading logo:', error);
      setError('Error al subir el logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setPreviewUrl(null);
    setIsUploading(true);
    try {
      await onLogoUpload('');
    } catch (error) {
      console.error('Error removing logo:', error);
      setError('Error al eliminar el logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-semibold text-gray-700">
        Logo de Organización
      </label>
      
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt={`Logo de ${organizationName || 'Organización'}`}
              className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
            />
            {!isUploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                aria-label="Eliminar logo"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}

        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleClick}
            disabled={isUploading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isUploading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isUploading ? 'Subiendo...' : previewUrl ? 'Cambiar logo' : 'Agregar logo'}
            </span>
          </button>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG o GIF, máximo 5MB
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrganizationLogoUploader;

