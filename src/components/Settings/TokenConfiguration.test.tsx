import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TokenConfiguration from './TokenConfiguration';
import { useInitialSetup } from '../../hooks/useInitialSetup';

// Mock del hook personalizado
vi.mock('../../hooks/useInitialSetup', () => ({
  useInitialSetup: vi.fn(),
}));

describe('TokenConfiguration Component', () => {
  const mockValidateTokens = vi.fn();
  const mockCompleteSetup = vi.fn();
  const mockClearMessages = vi.fn();
  const mockOnSuccess = vi.fn();

  // Configuración por defecto del mock para cada test
  beforeEach(() => {
    vi.clearAllMocks();
    (useInitialSetup as any).mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      success: null,
      validationResult: null,
      validateTokens: mockValidateTokens,
      completeSetup: mockCompleteSetup,
      clearMessages: mockClearMessages,
    });
  });

  it('debe renderizar todos los campos del formulario', () => {
    render(<TokenConfiguration />);
    
    expect(screen.getByLabelText(/Jira URL/i)).toBeDefined();
    expect(screen.getByLabelText(/Jira Token/i)).toBeDefined();
    expect(screen.getByLabelText(/OpenAI Token/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Validate Tokens/i })).toBeDisabled();
  });

  it('debe actualizar el estado cuando el usuario escribe en los inputs', async () => {
    const user = userEvent.setup();
    render(<TokenConfiguration />);

    const jiraUrlInput = screen.getByLabelText(/Jira URL/i) as HTMLInputElement;
    await user.type(jiraUrlInput, 'https://test.atlassian.net');
    
    expect(jiraUrlInput.value).toBe('https://test.atlassian.net');
  });

  it('debe alternar la visibilidad de los tokens al hacer clic en el icono del ojo', async () => {
    render(<TokenConfiguration />);
    const jiraTokenInput = screen.getByLabelText(/Jira Token/i);
    const toggleButtons = screen.getAllByRole('button');
    
    // El primero suele ser el de Jira (según el orden del DOM)
    const jiraToggle = toggleButtons[0];

    expect(jiraTokenInput).toHaveAttribute('type', 'password');
    await userEvent.click(jiraToggle);
    expect(jiraTokenInput).toHaveAttribute('type', 'text');
  });

  it('debe llamar a validateTokens cuando se hace clic en validar', async () => {
    mockValidateTokens.mockResolvedValue(true);
    const user = userEvent.setup();
    render(<TokenConfiguration />);

    await user.type(screen.getByLabelText(/Jira URL/i), 'https://test.net');
    await user.type(screen.getByLabelText(/Jira Token/i), 'token-123');
    await user.type(screen.getByLabelText(/OpenAI Token/i), 'sk-123');

    const validateBtn = screen.getByRole('button', { name: /Validate Tokens/i });
    expect(validateBtn).not.toBeDisabled();
    
    await user.click(validateBtn);

    expect(mockValidateTokens).toHaveBeenCalledWith({
      jiraUrl: 'https://test.net',
      jiraToken: 'token-123',
      openaiToken: 'sk-123',
    });
  });

  it('debe habilitar el botón de Guardar solo después de una validación exitosa', async () => {
    mockValidateTokens.mockResolvedValue(true);
    const user = userEvent.setup();
    render(<TokenConfiguration />);

    // Llenar datos
    await user.type(screen.getByLabelText(/Jira Token/i), 'test');
    await user.type(screen.getByLabelText(/OpenAI Token/i), 'test');

    const saveBtn = screen.getByRole('button', { name: /Save Configuration/i });
    expect(saveBtn).toBeDisabled();

    // Validar
    await user.click(screen.getByRole('button', { name: /Validate Tokens/i }));

    // Ahora debería estar habilitado
    await waitFor(() => expect(saveBtn).not.toBeDisabled());
  });

  it('debe mostrar mensajes de error cuando el hook devuelve un error', () => {
    (useInitialSetup as any).mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: 'Invalid credentials',
      success: null,
      validationResult: null,
      validateTokens: vi.fn(),
      completeSetup: vi.fn(),
      clearMessages: vi.fn(),
    });

    render(<TokenConfiguration />);
    expect(screen.getByText('Invalid credentials')).toBeDefined();
  });

  it('debe llamar a completeSetup y onSuccess al enviar el formulario', async () => {
    mockValidateTokens.mockResolvedValue(true);
    mockCompleteSetup.mockResolvedValue(true);
    const user = userEvent.setup();
    
    render(<TokenConfiguration onSuccess={mockOnSuccess} />);

    // 1. Llenamos los campos obligatorios
    await user.type(screen.getByLabelText(/Jira URL/i), 'https://test.atlassian.net');
    await user.type(screen.getByLabelText(/Jira Token/i), 'token-123');
    await user.type(screen.getByLabelText(/OpenAI Token/i), 'sk-123');

    // 2. Ejecutamos la validación
    const validateBtn = screen.getByRole('button', { name: /Validate Tokens/i });
    await user.click(validateBtn);

    // 3. Esperamos a que el botón de Guardar se habilite (esto confirma que la validación terminó)
    const saveBtn = screen.getByRole('button', { name: /Save Configuration/i });
    await waitFor(() => expect(saveBtn).not.toBeDisabled());

    // 4. Hacemos click en guardar
    await user.click(saveBtn);

    // 5. USAMOS waitFor para dar tiempo a que las promesas internas se resuelvan
    await waitFor(() => {
      expect(mockCompleteSetup).toHaveBeenCalledWith({
        jiraUrl: 'https://test.atlassian.net',
        jiraToken: 'token-123',
        openaiToken: 'sk-123',
      });
    });

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('debe mostrar el botón de cancelar si la prop showCancelButton es true', () => {
    const mockOnCancel = vi.fn();
    render(<TokenConfiguration showCancelButton={true} onCancel={mockOnCancel} />);
    
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });
});