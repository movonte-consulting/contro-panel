import { describe, it, expect } from 'vitest';
import API_BASE_URL, { API_ENDPOINTS } from './api'; // Ajusta la ruta si es necesario

describe('API Configuration', () => {
  const BASE = 'https://chat.movonte.com';

  it('should have the correct base URL', () => {
    expect(API_BASE_URL).toBe(BASE);
  });

  describe('Static Endpoints', () => {
    // Probamos una muestra representativa de cada sección para asegurar que no haya typos en las rutas base
    
    it('should define correct Authentication endpoints', () => {
      expect(API_ENDPOINTS.LOGIN).toBe(`${BASE}/api/auth/login`);
      expect(API_ENDPOINTS.PROFILE).toBe(`${BASE}/api/auth/profile`);
    });

    it('should define correct User endpoints', () => {
      expect(API_ENDPOINTS.USER_DASHBOARD).toBe(`${BASE}/api/user/dashboard`);
      expect(API_ENDPOINTS.USER_SERVICES_LIST).toBe(`${BASE}/api/user/services/list`);
    });

    it('should define correct Admin endpoints', () => {
      expect(API_ENDPOINTS.DASHBOARD).toBe(`${BASE}/api/admin/dashboard`);
      expect(API_ENDPOINTS.ADMIN_USERS).toBe(`${BASE}/api/admin/users`);
    });
    
    it('should define correct ChatKit endpoints', () => {
      expect(API_ENDPOINTS.CHATKIT_SESSION).toBe(`${BASE}/api/chatkit/session`);
    });
  });

  describe('Dynamic Endpoints (Functions)', () => {
    // Aquí es CRÍTICO probar todas las funciones para asegurar que los parámetros se insertan bien
    
    describe('User Services', () => {
      const id = 'srv-123';
      
      it('generates USER_SERVICE_UPDATE url', () => {
        expect(API_ENDPOINTS.USER_SERVICE_UPDATE(id)).toBe(`${BASE}/api/user/services/${id}`);
      });
      
      it('generates USER_SERVICE_DELETE url', () => {
        expect(API_ENDPOINTS.USER_SERVICE_DELETE(id)).toBe(`${BASE}/api/user/services/${id}`);
      });
      
      it('generates USER_SERVICE_CHAT url', () => {
        expect(API_ENDPOINTS.USER_SERVICE_CHAT(id)).toBe(`${BASE}/api/user/services/${id}/chat`);
      });

      it('generates USER_SERVICE_ASSISTANT url', () => {
        expect(API_ENDPOINTS.USER_SERVICE_ASSISTANT(id)).toBe(`${BASE}/api/user/services/${id}/assistant`);
      });
    });

    describe('User Tickets', () => {
      const key = 'TI-999';

      it('generates USER_TICKET_DISABLE url', () => {
        expect(API_ENDPOINTS.USER_TICKET_DISABLE(key)).toBe(`${BASE}/api/user/tickets/${key}/disable`);
      });

      it('generates USER_TICKET_ENABLE url', () => {
        expect(API_ENDPOINTS.USER_TICKET_ENABLE(key)).toBe(`${BASE}/api/user/tickets/${key}/enable`);
      });

      it('generates USER_TICKET_STATUS url', () => {
        expect(API_ENDPOINTS.USER_TICKET_STATUS(key)).toBe(`${BASE}/api/user/tickets/${key}/status`);
      });
    });

    describe('User Webhooks', () => {
      const id = 'wh-55';

      it('generates USER_WEBHOOKS_UPDATE url', () => {
        expect(API_ENDPOINTS.USER_WEBHOOKS_UPDATE(id)).toBe(`${BASE}/api/user/webhooks/${id}`);
      });

      it('generates USER_WEBHOOKS_DELETE url', () => {
        expect(API_ENDPOINTS.USER_WEBHOOKS_DELETE(id)).toBe(`${BASE}/api/user/webhooks/${id}`);
      });
    });

    describe('Service Validation', () => {
      const id = 'val-77';

      it('generates SERVICE_VALIDATION_APPROVE url', () => {
        expect(API_ENDPOINTS.SERVICE_VALIDATION_APPROVE(id)).toBe(`${BASE}/api/admin/service-validation/${id}/approve`);
      });

      it('generates SERVICE_VALIDATION_REJECT url', () => {
        expect(API_ENDPOINTS.SERVICE_VALIDATION_REJECT(id)).toBe(`${BASE}/api/admin/service-validation/${id}/reject`);
      });
    });

    describe('Admin Users', () => {
      const userId = 'u-88';

      it('generates ADMIN_USER_UPDATE url', () => {
        expect(API_ENDPOINTS.ADMIN_USER_UPDATE(userId)).toBe(`${BASE}/api/admin/users/${userId}`);
      });

      it('generates ADMIN_USER_DELETE url', () => {
        expect(API_ENDPOINTS.ADMIN_USER_DELETE(userId)).toBe(`${BASE}/api/admin/users/${userId}`);
      });

      it('generates ADMIN_USER_PASSWORD url', () => {
        expect(API_ENDPOINTS.ADMIN_USER_PASSWORD(userId)).toBe(`${BASE}/api/admin/users/${userId}/password`);
      });

      it('generates ADMIN_USER_PERMISSIONS url', () => {
        expect(API_ENDPOINTS.ADMIN_USER_PERMISSIONS(userId)).toBe(`${BASE}/api/admin/users/${userId}/permissions`);
      });
    });

    describe('Admin Services & Tickets', () => {
      const srvId = 'srv-admin';
      const key = 'ADM-1';

      it('generates SERVICE_UPDATE url', () => {
        expect(API_ENDPOINTS.SERVICE_UPDATE(srvId)).toBe(`${BASE}/api/admin/services/${srvId}`);
      });

      it('generates SERVICE_TOGGLE url', () => {
        expect(API_ENDPOINTS.SERVICE_TOGGLE(srvId)).toBe(`${BASE}/api/admin/services/${srvId}/toggle`);
      });

      it('generates TICKET_DISABLE url', () => {
        expect(API_ENDPOINTS.TICKET_DISABLE(key)).toBe(`${BASE}/api/admin/tickets/${key}/disable`);
      });

      it('generates TICKET_ENABLE url', () => {
        expect(API_ENDPOINTS.TICKET_ENABLE(key)).toBe(`${BASE}/api/admin/tickets/${key}/enable`);
      });

      it('generates TICKET_STATUS url', () => {
        expect(API_ENDPOINTS.TICKET_STATUS(key)).toBe(`${BASE}/api/admin/tickets/${key}/status`);
      });

      it('generates WEBHOOKS_DELETE url', () => {
        expect(API_ENDPOINTS.WEBHOOKS_DELETE('wh-1')).toBe(`${BASE}/api/admin/webhooks/wh-1`);
      });
    });

    describe('ChatKit Dynamic', () => {
      const sessionId = 'sess-001';
      const issueKey = 'ISS-100';

      it('generates CHATKIT_SESSION_INFO url', () => {
        expect(API_ENDPOINTS.CHATKIT_SESSION_INFO(sessionId)).toBe(`${BASE}/api/chatkit/session/${sessionId}`);
      });

      it('generates CHATKIT_DELETE_SESSION url', () => {
        expect(API_ENDPOINTS.CHATKIT_DELETE_SESSION(sessionId)).toBe(`${BASE}/api/chatkit/session/${sessionId}`);
      });

      it('generates CHATKIT_SESSION_STATUS url', () => {
        expect(API_ENDPOINTS.CHATKIT_SESSION_STATUS(issueKey)).toBe(`${BASE}/api/chatkit/session/${issueKey}`);
      });
    });
  });
});