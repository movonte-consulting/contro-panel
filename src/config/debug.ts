// Archivo temporal para debug de configuración
import { API_ENDPOINTS } from './api';

export const debugConfig = () => {
  console.log('🔧 Debug Configuration:');
  console.log('API_BASE_URL:', 'https://chat.movonte.com');
  console.log('USER_SETUP_VALIDATE_TOKENS:', API_ENDPOINTS.USER_SETUP_VALIDATE_TOKENS);
  console.log('USER_SETUP_COMPLETE:', API_ENDPOINTS.USER_SETUP_COMPLETE);
  console.log('USER_SETUP_STATUS:', API_ENDPOINTS.USER_SETUP_STATUS);
};

// Exportar para uso en consola del navegador
(window as any).debugConfig = debugConfig;

