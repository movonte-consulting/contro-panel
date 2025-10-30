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
  
  // User Tickets (Tickets Personalizados por Usuario)
  USER_TICKETS_DISABLED: `${API_BASE_URL}/api/user/tickets/disabled`,
  USER_TICKET_DISABLE: (issueKey: string) => `${API_BASE_URL}/api/user/tickets/${issueKey}/disable`,
  USER_TICKET_ENABLE: (issueKey: string) => `${API_BASE_URL}/api/user/tickets/${issueKey}/enable`,
  USER_TICKET_STATUS: (issueKey: string) => `${API_BASE_URL}/api/user/tickets/${issueKey}/status`,
  // User Statuses (Estados disponibles por usuario/proyecto)
  USER_STATUSES_AVAILABLE: `${API_BASE_URL}/api/user/statuses/available`,
  
  // User Webhooks (Webhooks Personalizados por Usuario)
  USER_WEBHOOK_CONFIGURE: `${API_BASE_URL}/api/user/webhook/configure`,
  USER_WEBHOOK_TEST: `${API_BASE_URL}/api/user/webhook/test`,
  USER_WEBHOOK_DISABLE: `${API_BASE_URL}/api/user/webhook/disable`,
  USER_WEBHOOK_STATUS: `${API_BASE_URL}/api/user/webhook/status`,
  USER_WEBHOOK_FILTER: `${API_BASE_URL}/api/user/webhook/filter`,
  USER_WEBHOOKS_SAVED: `${API_BASE_URL}/api/user/webhooks/saved`,
  USER_WEBHOOKS_SAVE: `${API_BASE_URL}/api/user/webhooks/save`,
  USER_WEBHOOKS_UPDATE: (id: string) => `${API_BASE_URL}/api/user/webhooks/${id}`,
  USER_WEBHOOKS_DELETE: (id: string) => `${API_BASE_URL}/api/user/webhooks/${id}`,
  
  // Service Validation (Validación de Servicios)
  SERVICE_VALIDATION_REQUEST: `${API_BASE_URL}/api/user/service-validation/request`,
  SERVICE_VALIDATION_REQUESTS: `${API_BASE_URL}/api/user/service-validation/requests`,
  SERVICE_VALIDATION_PENDING: `${API_BASE_URL}/api/admin/service-validation/pending`,
  SERVICE_VALIDATION_APPROVE: (id: string) => `${API_BASE_URL}/api/admin/service-validation/${id}/approve`,
  SERVICE_VALIDATION_REJECT: (id: string) => `${API_BASE_URL}/api/admin/service-validation/${id}/reject`,
  SERVICE_VALIDATION_PROTECTED_TOKEN: `${API_BASE_URL}/api/user/service-validation/protected-token`,
  SERVICE_VALIDATION_VALIDATE_TOKEN: `${API_BASE_URL}/api/service-validation/validate-token`,
  
  // Admin Users Management
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_USER_UPDATE: (userId: string) => `${API_BASE_URL}/api/admin/users/${userId}`,
  ADMIN_USER_DELETE: (userId: string) => `${API_BASE_URL}/api/admin/users/${userId}`,
  ADMIN_USER_PASSWORD: (userId: string) => `${API_BASE_URL}/api/admin/users/${userId}/password`,
  ADMIN_USER_PERMISSIONS: (userId: string) => `${API_BASE_URL}/api/admin/users/${userId}/permissions`,
  ADMIN_ORGANIZATIONS: `${API_BASE_URL}/api/admin/organizations`,
  
  // Dashboard
  DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
  DASHBOARD_STATS: `${API_BASE_URL}/api/dashboard/stats`,
  DASHBOARD_ACTIVITIES: `${API_BASE_URL}/api/dashboard/activities`,
  
      // Asistentes
      ASSISTANTS: `${API_BASE_URL}/api/admin/assistants`,
      
      // Proyectos
      PROJECTS: `${API_BASE_URL}/api/admin/projects`,
      PROJECTS_SET_ACTIVE: `${API_BASE_URL}/api/admin/projects/set-active`,
      // Estados (Admin)
      STATUSES_AVAILABLE: `${API_BASE_URL}/api/admin/statuses/available`,
      
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
