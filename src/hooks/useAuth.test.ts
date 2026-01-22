import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuth } from './useAuth';

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: 'admin',
  lastLogin: '2023-01-01',
  isInitialSetupComplete: true,
};

const mockToken = 'fake-jwt-token';

describe('useAuth Hook', () => {
  // Guardamos la referencia original para restaurarla
  const originalLocation = window.location;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // SOLUCIÓN AL ERROR READ-ONLY:
    // Usamos Object.defineProperty para redefinir 'window.location'
    // como un objeto que SÍ permite escritura (writable: true)
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { 
        href: '',
        assign: vi.fn(),
        replace: vi.fn(),
        reload: vi.fn(),
        origin: 'http://localhost:3000'
      },
      writable: true,
    });
  });

  afterEach(() => {
    // Restauramos el objeto location original para no afectar otros tests
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('debe inicializarse como no autenticado si no hay datos en localStorage', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('debe inicializarse como autenticado si existen datos válidos en localStorage', () => {
    localStorage.setItem('authToken', mockToken);
    localStorage.setItem('userData', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
  });

  it('debe hacer logout automáticamente si los datos en localStorage están corruptos', () => {
    localStorage.setItem('authToken', mockToken);
    localStorage.setItem('userData', 'esto-no-es-json');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('authToken')).toBeNull();

    consoleSpy.mockRestore();
  });

  it('debe permitir iniciar sesión (login)', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login(mockToken, mockUser);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('authToken')).toBe(mockToken);
  });

  it('debe permitir cerrar sesión (logout) y redirigir', () => {
    localStorage.setItem('authToken', mockToken);
    localStorage.setItem('userData', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('authToken')).toBeNull();

    // AHORA ESTO FUNCIONARÁ SIN ERRORES DE TIPO
    expect(window.location.href).toBe('/login');
  });

  it('debe permitir actualizar los datos del usuario (updateUser)', () => {
    localStorage.setItem('authToken', mockToken);
    localStorage.setItem('userData', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth());
    const updates = { username: 'new_name', email: 'new@email.com' };

    act(() => {
      result.current.updateUser(updates);
    });

    expect(result.current.user?.username).toBe('new_name');
    const storedUser = JSON.parse(localStorage.getItem('userData') || '{}');
    expect(storedUser.username).toBe('new_name');
  });
});