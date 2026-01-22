import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EndpointsList from './EndpointsList';

describe('EndpointsList Component', () => {
  const defaultProps = {
    serviceId: 'service-123',
    baseUrl: 'https://api.example.com',
    wsBaseUrl: 'wss://ws.example.com',
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

  it('should render all endpoint titles correctly', () => {
    render(<EndpointsList {...defaultProps} />);

    expect(screen.getByText('Endpoint de Chat')).toBeInTheDocument();
    expect(screen.getByText('Endpoint de Estado')).toBeInTheDocument();
    expect(screen.getByText('Crear Ticket')).toBeInTheDocument();
    expect(screen.getByText('Conectar a Ticket')).toBeInTheDocument();
    expect(screen.getByText('Enviar Mensaje a Ticket')).toBeInTheDocument();
    expect(screen.getByText('Conexión WebSocket')).toBeInTheDocument();
    expect(screen.getByText('Webhook de Jira')).toBeInTheDocument();
  });

  it('should construct correct URLs based on props', () => {
    render(<EndpointsList {...defaultProps} />);

    expect(screen.getByText('https://api.example.com/api/user/services/service-123/chat')).toBeInTheDocument();
    expect(screen.getByText('https://api.example.com/api/user/services/service-123/status')).toBeInTheDocument();
    expect(screen.getByText('wss://ws.example.com/socket.io/?serviceId=service-123')).toBeInTheDocument();
  });

  it('should display correct HTTP methods badges', () => {
    render(<EndpointsList {...defaultProps} />);

    const postBadges = screen.getAllByText('POST');
    const getBadges = screen.getAllByText('GET');
    const wsBadges = screen.getAllByText('WS');

    expect(postBadges.length).toBeGreaterThan(0);
    expect(getBadges.length).toBeGreaterThan(0);
    expect(wsBadges.length).toBeGreaterThan(0);
  });

  it('should render extra content for WebSocket and Webhook', () => {
    render(<EndpointsList {...defaultProps} />);

    expect(screen.getByText('Ventajas del WebSocket:')).toBeInTheDocument();
    expect(screen.getByText(/Respuestas instantáneas en tiempo real/)).toBeInTheDocument();
    expect(screen.getByText(/Agrega este webhook en la configuración/)).toBeInTheDocument();
  });

  it('should copy URL to clipboard when button is clicked', async () => {
    render(<EndpointsList {...defaultProps} />);

    const copyButtons = screen.getAllByText('Copiar');
    const firstButton = copyButtons[0];
    const targetUrl = 'https://api.example.com/api/user/services/service-123/chat';

    await act(async () => {
      fireEvent.click(firstButton);
    });

    expect(mockWriteText).toHaveBeenCalledTimes(1);
    expect(mockWriteText).toHaveBeenCalledWith(targetUrl);
  });

  it('should update button text to Copiado and revert after timeout', async () => {
    render(<EndpointsList {...defaultProps} />);

    const copyButtons = screen.getAllByText('Copiar');
    const firstButton = copyButtons[0];

    await act(async () => {
      fireEvent.click(firstButton);
    });

    expect(screen.getByText('Copiado')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByText('Copiado')).not.toBeInTheDocument();
    expect(screen.getAllByText('Copiar')[0]).toBeInTheDocument();
  });

  it('should handle clipboard errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockWriteText.mockRejectedValueOnce(new Error('Clipboard failed'));

    render(<EndpointsList {...defaultProps} />);

    const copyButtons = screen.getAllByText('Copiar');
    
    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });

    expect(consoleSpy).toHaveBeenCalled();
    expect(screen.queryByText('Copiado')).not.toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });
});