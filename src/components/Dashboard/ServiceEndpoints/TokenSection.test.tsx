import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TokenSection from './TokenSection';

describe('TokenSection Component', () => {
  const mockSetExpirationHours = vi.fn();
  const mockRegenerateToken = vi.fn();
  const mockWriteText = vi.fn();

  const defaultProps = {
    expirationHours: 24,
    setExpirationHours: mockSetExpirationHours,
    tokenLoading: false,
    regenerateToken: mockRegenerateToken,
    protectedToken: 'test-protected-token',
    tokenInfo: { expirationHours: 24, expiresAt: '2025-01-01T12:00:00Z' },
    serviceId: 'service-123',
  };

  beforeEach(() => {
    vi.useFakeTimers();
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });
    mockWriteText.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should render configuration sections correctly', () => {
    render(<TokenSection {...defaultProps} />);

    expect(screen.getByText('Configuración de Expiración del Token')).toBeInTheDocument();
    expect(screen.getByText('Token Protegido del Servicio')).toBeInTheDocument();
    expect(screen.getByText('Tiempo de expiración')).toBeInTheDocument();
  });

  it('should display the current expiration hour in select', () => {
    render(<TokenSection {...defaultProps} />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('24');
  });

  it('should call setExpirationHours when select value changes', () => {
    render(<TokenSection {...defaultProps} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '72' } });
    expect(mockSetExpirationHours).toHaveBeenCalledWith(72);
  });

  it('should display loading state for regenerate button', () => {
    render(<TokenSection {...defaultProps} tokenLoading={true} />);
    expect(screen.getByText('Generando...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generando/i })).toBeDisabled();
  });

  it('should display regenerate button correctly when not loading', () => {
    render(<TokenSection {...defaultProps} />);
    expect(screen.getByText('Regenerar Token')).toBeInTheDocument();
  });

  it('should call regenerateToken when regenerate button is clicked', () => {
    render(<TokenSection {...defaultProps} />);
    const button = screen.getByText('Regenerar Token');
    fireEvent.click(button);
    expect(mockRegenerateToken).toHaveBeenCalled();
  });

  it('should display the protected token when available', () => {
    render(<TokenSection {...defaultProps} />);
    expect(screen.getByText('test-protected-token')).toBeInTheDocument();
  });

  it('should display expiration info correctly', () => {
    render(<TokenSection {...defaultProps} />);
    expect(screen.getByText(/⏰ Expira en: 24 horas/)).toBeInTheDocument();
    // Check for formatted date string, part of it is enough as locale varies
    expect(screen.getByText(/📅 Fecha de expiración:/)).toBeInTheDocument();
  });

  it('should display error state and retry button when token is missing and not loading', () => {
    render(<TokenSection {...defaultProps} protectedToken="" tokenLoading={false} />);
    
    expect(screen.getByText('No se pudo generar el token protegido.')).toBeInTheDocument();
    const retryButton = screen.getByText('Reintentar');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(mockRegenerateToken).toHaveBeenCalled();
  });

  it('should copy token to clipboard when copy button is clicked', async () => {
    render(<TokenSection {...defaultProps} />);
    const copyButton = screen.getByText('Copiar token');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(mockWriteText).toHaveBeenCalledWith('test-protected-token');
  });

  it('should show "Token copiado" message and revert after timeout', async () => {
    render(<TokenSection {...defaultProps} />);
    const copyButton = screen.getByText('Copiar token');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(screen.getByText('Token copiado')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByText('Token copiado')).not.toBeInTheDocument();
    expect(screen.getByText('Copiar token')).toBeInTheDocument();
  });

  it('should handle clipboard errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockWriteText.mockRejectedValueOnce(new Error('Copy failed'));

    render(<TokenSection {...defaultProps} />);
    const copyButton = screen.getByText('Copiar token');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to copy:', expect.any(Error));
    expect(screen.queryByText('Token copiado')).not.toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});