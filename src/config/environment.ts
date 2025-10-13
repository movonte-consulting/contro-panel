// Configuración de variables de entorno para el frontend

export const ENV_CONFIG = {
  // URL del backend API
  API_BASE_URL: import.meta.env.VITE_URL_HOST || 'https://chat.movonte.com',
  
  // Configuración de ChatKit
  CHATKIT_WORKFLOW_ID: import.meta.env.VITE_CHATKIT_WORKFLOW_ID || 'wf_68e8201822848190bba4d97ecb00a4120acf471c2566d41d',
  
  // Configuración de desarrollo
  DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true',
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  
  // Configuración de la aplicación
  APP_NAME: 'Movonte Dashboard',
  APP_VERSION: '1.0.0'
};

// Función para obtener la URL completa de un endpoint
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = ENV_CONFIG.API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Función para logging en modo debug
export const debugLog = (message: string, data?: any): void => {
  if (ENV_CONFIG.DEBUG_MODE) {
    console.log(`[DEBUG] ${message}`, data);
  }
};

// Función para logging de desarrollo
export const devLog = (message: string, data?: any): void => {
  if (ENV_CONFIG.DEV_MODE) {
    console.log(`[DEV] ${message}`, data);
  }
};

