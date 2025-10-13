// Configuración de la API
const API_BASE_URL = 'https://chat.movonte.com';

export const API_ENDPOINTS = {
  // Autenticación
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  PROFILE: `${API_BASE_URL}/api/auth/profile`,
  CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`,
  REFRESH_TOKEN: `${API_BASE_URL}/api/auth/refresh`,
  
  // Usuarios
  USERS: `${API_BASE_URL}/api/users`,
  USER_PROFILE: `${API_BASE_URL}/api/users/profile`,
  
  // User Services (Servicios Personalizados por Usuario)
  USER_DASHBOARD: `${API_BASE_URL}/api/user/dashboard`,
  USER_SERVICES_CREATE: `${API_BASE_URL}/api/user/services/create`,
  USER_SERVICES_LIST: `${API_BASE_URL}/api/user/services/list`,
  USER_SERVICE_UPDATE: (serviceId: string) => `${API_BASE_URL}/api/user/services/${serviceId}`,
  USER_SERVICE_DELETE: (serviceId: string) => `${API_BASE_URL}/api/user/services/${serviceId}`,
  USER_SERVICE_CHAT: (serviceId: string) => `${API_BASE_URL}/api/user/services/${serviceId}/chat`,
  USER_ASSISTANTS: `${API_BASE_URL}/api/user/assistants`,
  USER_PROJECTS: `${API_BASE_URL}/api/user/projects`,
  USER_SERVICE_ASSISTANT: (serviceId: string) => `${API_BASE_URL}/api/user/services/${serviceId}/assistant`,
  
  // User Setup (Configuración Inicial)
  USER_SETUP_STATUS: `${API_BASE_URL}/api/user/setup/status`,
  USER_SETUP_COMPLETE: `${API_BASE_URL}/api/user/setup/complete`,
  USER_SETUP_VALIDATE_TOKENS: `${API_BASE_URL}/api/user/setup/validate-tokens`,
  
  // Admin Users Management
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_USER_UPDATE: (userId: string) => `${API_BASE_URL}/api/admin/users/${userId}`,
  ADMIN_USER_DELETE: (userId: string) => `${API_BASE_URL}/api/admin/users/${userId}`,
  ADMIN_USER_PASSWORD: (userId: string) => `${API_BASE_URL}/api/admin/users/${userId}/password`,
  ADMIN_USER_PERMISSIONS: (userId: string) => `${API_BASE_URL}/api/admin/users/${userId}/permissions`,
  
  // Dashboard
  DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
  DASHBOARD_STATS: `${API_BASE_URL}/api/dashboard/stats`,
  DASHBOARD_ACTIVITIES: `${API_BASE_URL}/api/dashboard/activities`,
  
      // Asistentes
      ASSISTANTS: `${API_BASE_URL}/api/admin/assistants`,
      
      // Proyectos
      PROJECTS: `${API_BASE_URL}/api/admin/projects`,
      PROJECTS_SET_ACTIVE: `${API_BASE_URL}/api/admin/projects/set-active`,
      
      // Servicios
      SERVICES: `${API_BASE_URL}/api/admin/services`,
      SERVICE_UPDATE: (serviceId: string) => `${API_BASE_URL}/api/admin/services/${serviceId}`,
      SERVICE_TOGGLE: (serviceId: string) => `${API_BASE_URL}/api/admin/services/${serviceId}/toggle`,
      
      // Tickets
      TICKETS_DISABLED: `${API_BASE_URL}/api/admin/tickets/disabled`,
      TICKET_DISABLE: (issueKey: string) => `${API_BASE_URL}/api/admin/tickets/${issueKey}/disable`,
      TICKET_ENABLE: (issueKey: string) => `${API_BASE_URL}/api/admin/tickets/${issueKey}/enable`,
      TICKET_STATUS: (issueKey: string) => `${API_BASE_URL}/api/admin/tickets/${issueKey}/status`,
      
      // Webhooks
      WEBHOOK_CONFIGURE: `${API_BASE_URL}/api/admin/webhook/configure`,
      WEBHOOK_TEST: `${API_BASE_URL}/api/admin/webhook/test`,
      WEBHOOK_DISABLE: `${API_BASE_URL}/api/admin/webhook/disable`,
      WEBHOOK_STATUS: `${API_BASE_URL}/api/admin/webhook/status`,
      WEBHOOK_FILTER: `${API_BASE_URL}/api/admin/webhook/filter`,
      WEBHOOKS_SAVED: `${API_BASE_URL}/api/admin/webhooks/saved`,
      WEBHOOKS_SAVE: `${API_BASE_URL}/api/admin/webhooks/save`,
      WEBHOOKS_DELETE: (id: string) => `${API_BASE_URL}/api/admin/webhooks/${id}`,
      
      // Reportes
      REPORTS: `${API_BASE_URL}/api/reports`,
      
  // Configuración
  SETTINGS: `${API_BASE_URL}/api/settings`,
  
  // ChatKit
  CHATKIT_SESSION: `${API_BASE_URL}/api/chatkit/session`,
  CHATKIT_REFRESH: `${API_BASE_URL}/api/chatkit/refresh`,
  CHATKIT_SESSION_INFO: (sessionId: string) => `${API_BASE_URL}/api/chatkit/session/${sessionId}`,
  CHATKIT_DELETE_SESSION: (sessionId: string) => `${API_BASE_URL}/api/chatkit/session/${sessionId}`,
  CHATKIT_STATS: `${API_BASE_URL}/api/chatkit/stats`,
  
  // ChatKit Widget & Webhook
  CHATKIT_WIDGET_CONNECT: `${API_BASE_URL}/api/chatkit/widget/connect`,
  CHATKIT_WIDGET_SEND: `${API_BASE_URL}/api/chatkit/widget/send`,
  CHATKIT_SESSION_STATUS: (issueKey: string) => `${API_BASE_URL}/api/chatkit/session/${issueKey}`,
  CHATKIT_WEBHOOK_JIRA: `${API_BASE_URL}/api/chatkit/webhook/jira`,
  CHATKIT_CHAT_DIRECT: `${API_BASE_URL}/api/chatkit/chat/direct`,
} as const;

export default API_BASE_URL;
