import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ServiceEndpointsModal from './ServiceEndpointsModal';
import { useServiceValidation } from '../../hooks/useServiceValidation';
import { useServiceJiraAccounts } from '../../hooks/useServiceJiraAccounts';

vi.mock('../../hooks/useServiceValidation');
vi.mock('../../hooks/useServiceJiraAccounts');

vi.mock('./ServiceEndpoints/JiraConfigSection', () => ({
  default: ({ onSave, onCancel }: any) => (
    <div data-testid="jira-config-section">
      <button onClick={onSave} data-testid="save-jira-btn">Save Jira</button>
      <button onClick={onCancel} data-testid="cancel-jira-btn">Cancel Jira</button>
    </div>
  ),
}));

vi.mock('./ServiceEndpoints/TokenSection', () => ({
  default: () => <div data-testid="token-section" />,
}));

vi.mock('./ServiceEndpoints/EndpointsList', () => ({
  default: () => <div data-testid="endpoints-list" />,
}));

vi.mock('./ServiceEndpoints/CodeExamples', () => ({
  default: () => <div data-testid="code-examples" />,
}));

vi.mock('./ServiceEndpoints/WidgetIntegration', () => ({
  default: () => <div data-testid="widget-integration" />,
}));

describe('ServiceEndpointsModal Component', () => {
  const mockOnClose = vi.fn();
  const mockGenerateProtectedToken = vi.fn();
  const mockGetServiceJiraAccounts = vi.fn();
  const mockUpsertServiceJiraAccounts = vi.fn();

  const defaultService = {
    serviceId: '123',
    serviceName: 'Test Service',
    assistantId: '456',
    assistantName: 'Test Assistant',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useServiceValidation).mockReturnValue({
      generateProtectedToken: mockGenerateProtectedToken,
    } as any);

    vi.mocked(useServiceJiraAccounts).mockReturnValue({
      getServiceJiraAccounts: mockGetServiceJiraAccounts,
      upsertServiceJiraAccounts: mockUpsertServiceJiraAccounts,
    } as any);

    mockGenerateProtectedToken.mockResolvedValue({
      protectedToken: 'mock-token-123',
      expirationHours: 24,
      expiresAt: new Date().toISOString(),
    });

    mockGetServiceJiraAccounts.mockResolvedValue({
      assistantJiraEmail: 'test@example.com',
      assistantJiraUrl: 'https://test.atlassian.net',
      widgetJiraEmail: 'widget@example.com',
      widgetJiraUrl: 'https://test.atlassian.net',
    });

    window.alert = vi.fn();
  });

  it('should return null when isOpen is false', () => {
    render(
      <ServiceEndpointsModal 
        isOpen={false} 
        onClose={mockOnClose} 
        service={defaultService} 
      />
    );

    expect(screen.queryByText('Endpoints del Servicio')).not.toBeInTheDocument();
  });

  it('should render correctly when isOpen is true', async () => {
    render(
      <ServiceEndpointsModal 
        isOpen={true} 
        onClose={mockOnClose} 
        service={defaultService} 
      />
    );

    expect(screen.getByText('Endpoints del Servicio')).toBeInTheDocument();
    expect(screen.getByText(/Test Service - Test Assistant/)).toBeInTheDocument();
    expect(screen.getByTestId('token-section')).toBeInTheDocument();
    expect(screen.getByTestId('endpoints-list')).toBeInTheDocument();
    expect(screen.getByTestId('code-examples')).toBeInTheDocument();
    expect(screen.getByTestId('widget-integration')).toBeInTheDocument();
  });

  it('should trigger token generation and fetch jira accounts on mount', async () => {
    render(
      <ServiceEndpointsModal 
        isOpen={true} 
        onClose={mockOnClose} 
        service={defaultService} 
      />
    );

    await waitFor(() => {
      expect(mockGenerateProtectedToken).toHaveBeenCalledWith('123', 24);
      expect(mockGetServiceJiraAccounts).toHaveBeenCalledWith('123');
    });
  });

  it('should toggle Jira Config Section when button is clicked', () => {
    render(
      <ServiceEndpointsModal 
        isOpen={true} 
        onClose={mockOnClose} 
        service={defaultService} 
      />
    );

    const configButton = screen.getByTitle('Configurar Cuentas de Jira');
    fireEvent.click(configButton);

    expect(screen.getByTestId('jira-config-section')).toBeInTheDocument();

    fireEvent.click(configButton);
    expect(screen.queryByTestId('jira-config-section')).not.toBeInTheDocument();
  });

  it('should handle saving Jira accounts successfully', async () => {
    render(
      <ServiceEndpointsModal 
        isOpen={true} 
        onClose={mockOnClose} 
        service={defaultService} 
      />
    );

    fireEvent.click(screen.getByTitle('Configurar Cuentas de Jira'));
    
    await waitFor(() => {
      expect(screen.getByTestId('save-jira-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('save-jira-btn'));

    await waitFor(() => {
      expect(mockUpsertServiceJiraAccounts).toHaveBeenCalledWith('123', expect.objectContaining({
        assistantJiraEmail: 'test@example.com',
        assistantJiraUrl: 'https://test.atlassian.net',
        isActive: true
      }));
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('exitosamente'));
    });
  });

  it('should handle errors when saving Jira accounts fails', async () => {
    mockUpsertServiceJiraAccounts.mockRejectedValue(new Error('Save failed'));
    
    render(
      <ServiceEndpointsModal 
        isOpen={true} 
        onClose={mockOnClose} 
        service={defaultService} 
      />
    );

    fireEvent.click(screen.getByTitle('Configurar Cuentas de Jira'));
    
    await waitFor(() => {
      expect(screen.getByTestId('save-jira-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('save-jira-btn'));

    await waitFor(() => {
      expect(mockUpsertServiceJiraAccounts).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Error'));
    });
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <ServiceEndpointsModal 
        isOpen={true} 
        onClose={mockOnClose} 
        service={defaultService} 
      />
    );

    const closeButtons = screen.getAllByRole('button');
    const xButton = closeButtons.find(
        btn => btn.innerHTML.includes('svg') && !btn.textContent?.includes('Cuentas Jira')
    );
    if (xButton) fireEvent.click(xButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when Entendido button is clicked', () => {
    render(
      <ServiceEndpointsModal 
        isOpen={true} 
        onClose={mockOnClose} 
        service={defaultService} 
      />
    );

    fireEvent.click(screen.getByText('Entendido'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});