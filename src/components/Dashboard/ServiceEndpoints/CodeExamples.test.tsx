import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CodeExamples from './CodeExamples';

describe('CodeExamples Component', () => {
  const defaultProps = {
    chatEndpoint: 'https://api.example.com/chat',
    protectedToken: 'mock-protected-token',
    wsBaseUrl: 'wss://ws.example.com',
    serviceId: 'service-123',
  };

  const mockWriteText = vi.fn();

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render section headers correctly', () => {
    render(<CodeExamples {...defaultProps} />);

    expect(screen.getByText('Ejemplos de Código (REST)')).toBeInTheDocument();
    expect(screen.getByText('Ejemplos de Conexión WebSocket')).toBeInTheDocument();
  });

  it('should render all code block titles', () => {
    render(<CodeExamples {...defaultProps} />);

    expect(screen.getByText('cURL')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getAllByText('Python')).toHaveLength(2); 
    expect(screen.getByText('JavaScript/TypeScript')).toBeInTheDocument();
  });

  it('should inject provided props into the code snippets', () => {
    render(<CodeExamples {...defaultProps} />);

    const codeBlocks = screen.getAllByRole('code'); 
    // Usually code is inside <code> or <pre>, text content check is safer here
    const fullText = document.body.textContent;

    expect(fullText).toContain(defaultProps.chatEndpoint);
    expect(fullText).toContain(defaultProps.protectedToken);
    expect(fullText).toContain(defaultProps.wsBaseUrl);
    expect(fullText).toContain(defaultProps.serviceId);
  });

  it('should use default placeholder if protectedToken is missing', () => {
    render(
      <CodeExamples 
        {...defaultProps} 
        protectedToken="" 
      />
    );

    const fullText = document.body.textContent;
    expect(fullText).toContain('YOUR_PROTECTED_TOKEN');
  });

  it('should copy code to clipboard when button is clicked', async () => {
    render(<CodeExamples {...defaultProps} />);

    const copyButtons = screen.getAllByText('Copiar');
    const firstButton = copyButtons[0];

    fireEvent.click(firstButton);

    expect(mockWriteText).toHaveBeenCalledTimes(1);
    expect(mockWriteText).toHaveBeenCalledWith(expect.stringContaining('curl'));
  });

  it('should change button text to "Copiado" temporarily after clicking', async () => {
    render(<CodeExamples {...defaultProps} />);

    const copyButtons = screen.getAllByText('Copiar');
    const firstButton = copyButtons[0];

    fireEvent.click(firstButton);
    const copiedElement = await screen.findByText('Copiado');
    expect(copiedElement).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Copiado')).not.toBeInTheDocument();
      expect(screen.getAllByText('Copiar')[0]).toBeInTheDocument();
    }, { timeout: 2500 });
  });

  it('should handle clipboard errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockWriteText.mockRejectedValueOnce(new Error('Clipboard error'));

    render(<CodeExamples {...defaultProps} />);

    const copyButtons = screen.getAllByText('Copiar');
    fireEvent.click(copyButtons[0]);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});