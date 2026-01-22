import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { useInitialSetup } from './useInitialSetup'; // Ajusta la ruta
import { useApi } from './useApi';
import { useAuth } from './useAuth';
import { API_ENDPOINTS } from '../config/api';

// 1. Mock de dependencias
vi.mock('./useApi');
vi.mock('./useAuth');
vi.mock('../config/api', () => ({
  API_ENDPOINTS: {
    USER_SETUP_VALIDATE_TOKENS: '/api/validate-tokens',
    USER_SETUP_COMPLETE: '/api/complete-setup',
  },
}));

describe('useInitialSetup Hook', () => {
  const mockPost = vi.fn();
  const mockUpdateUser = vi.fn();

  // Datos de prueba
  const validFormData = {
    jiraUrl: 'https://custom-company.atlassian.net',
    jiraToken: 'jira-123',
    openaiToken: 'openai-abc',
    organizationLogo: 'base64-image-string',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Configuración por defecto de los mocks
    (useApi as unknown as Mock).mockReturnValue({
      post: mockPost,
    });

    (useAuth as unknown as Mock).mockReturnValue({
      updateUser: mockUpdateUser,
    });
  });

  it('debe inicializarse con los estados por defecto', () => {
    const { result } = renderHook(() => useInitialSetup());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isValidating).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBeNull();
    expect(result.current.validationResult).toBeNull();
  });

  // --- TEST: validateTokens ---

  it('debe mostrar error si faltan tokens al validar', async () => {
    const { result } = renderHook(() => useInitialSetup());

    const incompleteData = { ...validFormData, jiraToken: '' };

    let success;
    await act(async () => {
      success = await result.current.validateTokens(incompleteData);
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('Por favor ingresa ambos tokens');
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('debe manejar una validación exitosa de tokens', async () => {
    // Mock respuesta exitosa de la API
    const mockValidationResponse = {
      jiraToken: { isValid: true, message: 'OK' },
      openaiToken: { isValid: true, message: 'OK' },
      allTokensValid: true,
    };

    mockPost.mockResolvedValue({
      success: true,
      data: { validation: mockValidationResponse, allTokensValid: true },
    });

    const { result } = renderHook(() => useInitialSetup());

    let success;
    await act(async () => {
      success = await result.current.validateTokens(validFormData);
    });

    expect(mockPost).toHaveBeenCalledWith(
      API_ENDPOINTS.USER_SETUP_VALIDATE_TOKENS,
      { jiraToken: 'jira-123', openaiToken: 'openai-abc' }
    );
    expect(success).toBe(true);
    expect(result.current.validationResult).toEqual(mockValidationResponse);
    expect(result.current.success).toContain('Tokens válidos');
    expect(result.current.error).toBeNull();
  });

  it('debe manejar tokens inválidos devueltos por la API', async () => {
    const mockValidationResponse = {
      jiraToken: { isValid: false, message: 'Invalid' },
      openaiToken: { isValid: true, message: 'OK' },
      allTokensValid: false,
    };

    mockPost.mockResolvedValue({
      success: true,
      data: { validation: mockValidationResponse, allTokensValid: false },
    });

    const { result } = renderHook(() => useInitialSetup());

    let success;
    await act(async () => {
      success = await result.current.validateTokens(validFormData);
    });

    expect(success).toBe(false);
    expect(result.current.validationResult).toEqual(mockValidationResponse);
    expect(result.current.error).toContain('Algunos tokens no son válidos');
  });

  it('debe manejar errores de servidor durante la validación', async () => {
    mockPost.mockResolvedValue({
      success: false,
      error: 'Internal Server Error',
    });

    const { result } = renderHook(() => useInitialSetup());

    await act(async () => {
      await result.current.validateTokens(validFormData);
    });

    expect(result.current.error).toBe('Internal Server Error');
    expect(result.current.validationResult).toBeNull();
  });

  it('debe manejar errores de conexión (catch) durante la validación', async () => {
    mockPost.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useInitialSetup());

    await act(async () => {
      await result.current.validateTokens(validFormData);
    });

    expect(result.current.error).toContain('Error de conexión');
    expect(result.current.isValidating).toBe(false); // Asegurar que loading se apagó
  });

  // --- TEST: completeSetup ---

  it('debe completar el setup exitosamente y actualizar el usuario', async () => {
    mockPost.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useInitialSetup());

    let success;
    await act(async () => {
      success = await result.current.completeSetup(validFormData);
    });

    // Verificamos payload enviado
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.USER_SETUP_COMPLETE, expect.objectContaining({
      jiraUrl: validFormData.jiraUrl,
      jiraToken: validFormData.jiraToken,
      // Debe incluir el logo porque la URL no es la default
      organizationLogo: validFormData.organizationLogo
    }));

    expect(success).toBe(true);
    expect(result.current.success).toContain('Configuración completada');
    
    // VERIFICACIÓN CLAVE: Se actualizó el usuario local
    expect(mockUpdateUser).toHaveBeenCalledWith({ isInitialSetupComplete: true });
  });

  it('NO debe enviar el logo si la URL es la de Movonte por defecto', async () => {
    mockPost.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useInitialSetup());

    const defaultUrlData = {
      ...validFormData,
      jiraUrl: 'https://movonte.atlassian.net', // URL por defecto
      organizationLogo: 'mi-logo-base64', // Aunque tenga logo
    };

    await act(async () => {
      await result.current.completeSetup(defaultUrlData);
    });

    // Verificamos que organizationLogo NO esté en el payload
    const payloadEnviado = mockPost.mock.calls[0][1];
    expect(payloadEnviado).not.toHaveProperty('organizationLogo');
    expect(payloadEnviado.jiraUrl).toBe('https://movonte.atlassian.net');
  });

  it('debe manejar errores al completar el setup', async () => {
    mockPost.mockResolvedValue({
      success: false,
      error: 'No se pudo guardar',
    });

    const { result } = renderHook(() => useInitialSetup());

    let success;
    await act(async () => {
      success = await result.current.completeSetup(validFormData);
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('No se pudo guardar');
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  // --- TEST: clearMessages ---

  it('debe limpiar los mensajes de error y éxito', async () => {
    mockPost.mockResolvedValue({ success: false, error: 'Error test' });
    const { result } = renderHook(() => useInitialSetup());

    // Generamos un error
    await act(async () => {
      await result.current.completeSetup(validFormData);
    });
    expect(result.current.error).not.toBeNull();

    // Limpiamos
    act(() => {
      result.current.clearMessages();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.success).toBeNull();
  });
});