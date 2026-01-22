import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserServicesManagement } from './UserServicesManagement';
import * as useUserServicesHook from '../../hooks/useUserServices';
import * as useApiHook from '../../hooks/useApi';

vi.mock('../../hooks/useUserServices');
vi.mock('../../hooks/useApi');
vi.mock('./ServiceEndpointsModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div data-testid="endpoints-modal">Endpoints Modal</div> : null
}));
vi.mock('./ServiceValidationModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div data-testid="validation-modal">Validation Modal</div> : null
}));

describe('UserServicesManagement', () => {
  const mockCreateService = vi.fn();
  const mockUpdateService = vi.fn();
  const mockDeleteService = vi.fn();
  const mockChatWithService = vi.fn();
  const mockLoadUserAssistants = vi.fn();
  const mockLoadUserProjects = vi.fn();
  const mockGet = vi.fn();

  const mockServices = [
    {
      serviceId: 'service-1',
      serviceName: 'Test Service 1',
      assistantId: 'asst-1',
      assistantName: 'Assistant 1',
      isActive: true,
      approvalStatus: 'approved',
      lastUpdated: new Date().toISOString(),
      configuration: {
        projectKey: 'PROJ1',
        disable_tickets_state: [],
        disabled_tickets: []
      }
    },
    {
      serviceId: 'service-2',
      serviceName: 'Test Service 2',
      assistantId: 'asst-2',
      assistantName: 'Assistant 2',
      isActive: false,
      approvalStatus: 'pending',
      lastUpdated: new Date().toISOString()
    }
  ];

  const mockAssistants = [
    { id: 'asst-1', name: 'Assistant 1' },
    { id: 'asst-2', name: 'Assistant 2' }
  ];

  const mockProjects = [
    { id: 'p1', key: 'PROJ1', name: 'Project 1' },
    { id: 'p2', key: 'PROJ2', name: 'Project 2' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.spyOn(useUserServicesHook, 'useUserServices').mockReturnValue({
      services: mockServices,
      assistants: mockAssistants,
      projects: mockProjects,
      isLoading: false,
      error: null,
      createService: mockCreateService,
      updateService: mockUpdateService,
      deleteService: mockDeleteService,
      chatWithService: mockChatWithService,
      loadUserAssistants: mockLoadUserAssistants,
      loadUserProjects: mockLoadUserProjects,
      refreshServices: vi.fn()
    } as any);

    vi.spyOn(useApiHook, 'useApi').mockReturnValue({
      get: mockGet
    } as any);

    mockCreateService.mockResolvedValue({ success: true, message: 'Created', isAdmin: false });
    mockUpdateService.mockResolvedValue({ success: true });
    mockDeleteService.mockResolvedValue({ success: true });
    mockChatWithService.mockResolvedValue({ success: true, response: 'AI Response' });
  });

  it('renders loading state correctly', () => {
    vi.spyOn(useUserServicesHook, 'useUserServices').mockReturnValue({
      ...useUserServicesHook.useUserServices() as any,
      isLoading: true
    });

    render(<UserServicesManagement />);
    expect(screen.getByText('Loading user services...')).toBeInTheDocument();
  });

  it('renders empty state correctly', () => {
    vi.spyOn(useUserServicesHook, 'useUserServices').mockReturnValue({
      ...useUserServicesHook.useUserServices() as any,
      services: []
    });

    render(<UserServicesManagement />);
    expect(screen.getByText('No Custom Services')).toBeInTheDocument();
    expect(screen.getByText('Create Your First Service')).toBeInTheDocument();
  });

  it('renders list of services correctly', () => {
    render(<UserServicesManagement />);
    expect(screen.getByText('Test Service 1')).toBeInTheDocument();
    expect(screen.getByText('Test Service 2')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Waiting for admin approval')).toBeInTheDocument();
  });

 it('opens create modal and submits form correctly', async () => {
    render(<UserServicesManagement />);
    
    const createBtn = screen.getByRole('button', { name: /create service/i });
    fireEvent.click(createBtn);

    expect(screen.getByText('Create New Service')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('e.g., my-custom-service'), { target: { value: 'new-service' } });
    fireEvent.change(screen.getByPlaceholderText('e.g., My Custom Service'), { target: { value: 'New Service' } });

    fireEvent.change(screen.getByRole('combobox', { name: /assistant/i }), { target: { value: 'asst-1' } });
    fireEvent.change(screen.getByRole('combobox', { name: /jira project/i }), { target: { value: 'PROJ1' } });
    
    fireEvent.change(screen.getByPlaceholderText('https://mi-sitio.com'), { target: { value: 'https://example.com' } });
    fireEvent.change(screen.getByPlaceholderText('mi-sitio.com'), { target: { value: 'example.com' } });

    const submitBtn = screen.getAllByRole('button', { name: /create service/i })[1];
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateService).toHaveBeenCalledWith({
        serviceId: 'new-service',
        serviceName: 'New Service',
        assistantId: 'asst-1',
        assistantName: 'Assistant 1',
        projectKey: 'PROJ1',
        websiteUrl: 'https://example.com',
        requestedDomain: 'example.com'
      });
    });
  });

  it('handles service deletion', async () => {
    window.confirm = vi.fn(() => true);
    render(<UserServicesManagement />);

    const deleteButtons = screen.getAllByTitle('Delete service');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockDeleteService).toHaveBeenCalledWith('service-1');
    });
  });

  it('handles service toggle', async () => {
    render(<UserServicesManagement />);

    const toggleButton = screen.getByTitle('Desactivar servicio');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(mockUpdateService).toHaveBeenCalledWith('service-1', { isActive: false });
    });
  });

  it('opens chat modal and sends message', async () => {
    render(<UserServicesManagement />);

    const testButton = screen.getByTitle('Test service');
    fireEvent.click(testButton);

    expect(screen.getByText('Test Service: Test Service 1')).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Hello AI' } });
    
    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockChatWithService).toHaveBeenCalledWith('service-1', 'Hello AI', undefined);
    });

    await waitFor(() => {
      expect(screen.getByText('AI Response')).toBeInTheDocument();
    });
  });

  it('opens project configuration and saves changes', async () => {
    mockGet.mockResolvedValue({ success: true, data: ['Open', 'In Progress', 'Done'] });
    render(<UserServicesManagement />);

    const settingsButton = screen.getByTitle('Configure Jira project');
    fireEvent.click(settingsButton);

    expect(screen.getByText('Configure Jira Project & Ticket States')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalled();
    });

    const statusCheckbox = screen.getByLabelText('Done');
    fireEvent.click(statusCheckbox);

    const ticketInput = screen.getByPlaceholderText('e.g., TI-123');
    const addButton = screen.getByText('Add');
    
    fireEvent.change(ticketInput, { target: { value: 'TEST-1' } });
    fireEvent.click(addButton);

    const saveButton = screen.getByText('Save Configuration');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateService).toHaveBeenCalledWith('service-1', {
        configuration: {
          projectKey: 'PROJ1',
          disable_tickets_state: ['Done'],
          disabled_tickets: ['TEST-1']
        }
      });
    });
  });

  it('extracts domain correctly from URL input in validation modal', async () => {
    render(<UserServicesManagement />);
    
    fireEvent.click(screen.getByRole('button', { name: /create service/i }));
    
    const domainInput = screen.getByPlaceholderText('mi-sitio.com');
    
    fireEvent.change(domainInput, { target: { value: 'https://www.google.com' } });
    
    expect(domainInput).toHaveValue('google.com');
  });

  it('shows error message on failure', async () => {
    mockDeleteService.mockRejectedValue(new Error('Failed'));
    window.confirm = vi.fn(() => true);
    
    render(<UserServicesManagement />);
    
    const deleteButtons = screen.getAllByTitle('Delete service');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Failed to delete service')).toBeInTheDocument();
    });
  });
});