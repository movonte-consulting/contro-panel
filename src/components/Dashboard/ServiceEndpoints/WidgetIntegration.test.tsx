import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import WidgetIntegration from './WidgetIntegration';

describe('WidgetIntegration Component', () => {
  const defaultProps = {
    serviceId: 'service-123',
    serviceName: 'Test Service',
    assistantName: 'Test Assistant',
    protectedToken: 'mock-token',
    wsBaseUrl: 'wss://test.com',
  };

  const mockWriteText = vi.fn();

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

  it('should render the component title and description', () => {
    render(<WidgetIntegration {...defaultProps} />);
    
    expect(screen.getByText('Integración con Widget HTML')).toBeInTheDocument();
    expect(screen.getByText('Widget de Chat Listo para Usar')).toBeInTheDocument();
    expect(screen.getByText(/Integra fácilmente un chat/)).toBeInTheDocument();
  });

  it('should render the generated HTML code in the pre block', () => {
    render(<WidgetIntegration {...defaultProps} />);
    
    // Check for unique strings within the generated HTML
    const codeBlock = screen.getByRole('code') || screen.getByText(/DOCTYPE html/);
    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock.textContent).toContain(defaultProps.serviceId);
    expect(codeBlock.textContent).toContain(defaultProps.serviceName);
    expect(codeBlock.textContent).toContain(defaultProps.assistantName);
    expect(codeBlock.textContent).toContain(defaultProps.wsBaseUrl);
    expect(codeBlock.textContent).toContain(defaultProps.protectedToken);
  });

  it('should use fallback token text if protectedToken is missing', () => {
    render(<WidgetIntegration {...defaultProps} protectedToken="" />);
    
    const codeBlock = screen.getByRole('code') || screen.getByText(/DOCTYPE html/);
    expect(codeBlock.textContent).toContain('YOUR_PROTECTED_TOKEN');
  });

  it('should render the warning alert about token security', () => {
    render(<WidgetIntegration {...defaultProps} />);
    
    expect(screen.getByText(/Importante: Seguridad del Token/)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.serviceName)).toBeInTheDocument();
  });

  it('should copy widget HTML to clipboard when copy button is clicked', async () => {
    render(<WidgetIntegration {...defaultProps} />);
    
    const copyButton = screen.getByText('Copiar Widget');
    
    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(mockWriteText).toHaveBeenCalledTimes(1);
    const copiedText = mockWriteText.mock.calls[0][0];
    expect(copiedText).toContain('<!DOCTYPE html>');
    expect(copiedText).toContain(defaultProps.serviceId);
  });

  it('should show "Copiado" state and revert after timeout', async () => {
    render(<WidgetIntegration {...defaultProps} />);
    
    const copyButton = screen.getByText('Copiar Widget');
    
    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(screen.getByText('Copiado')).toBeInTheDocument();
    expect(screen.queryByText('Copiar Widget')).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByText('Copiado')).not.toBeInTheDocument();
    expect(screen.getByText('Copiar Widget')).toBeInTheDocument();
  });

  it('should handle clipboard errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockWriteText.mockRejectedValueOnce(new Error('Clipboard failed'));

    render(<WidgetIntegration {...defaultProps} />);
    
    const copyButton = screen.getByText('Copiar Widget');
    
    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(consoleSpy).toHaveBeenCalled();
    expect(screen.queryByText('Copiado')).not.toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });
});