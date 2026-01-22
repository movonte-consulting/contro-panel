import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ServicesManagement from './ServicesManagement'; // Adjust path as needed
import { useServices } from '../../hooks/useServices'; // Adjust path as needed
import { useAssistants } from '../../hooks/useAssistants'; // Adjust path as needed

// Mock the hooks
vi.mock('../../hooks/useServices');
vi.mock('../../hooks/useAssistants');

describe('ServicesManagement Component', () => {
  const mockUpdateService = vi.fn();
  const mockToggleService = vi.fn();

  const mockServices = [
    {
      serviceId: 'service-alpha',
      isActive: true,
      assistantName: 'Alpha Bot',
      assistantId: 'asst_123',
      lastUpdated: '2023-01-01T12:00:00Z'
    },
    {
      serviceId: 'service-beta',
      isActive: false,
      assistantName: null,
      assistantId: null,
      lastUpdated: '2023-01-02T12:00:00Z'
    }
  ];

  const mockAssistants = [
    { id: 'asst_123', name: 'Alpha Bot' },
    { id: 'asst_456', name: 'Beta Bot' },
    { id: 'asst_789', name: 'Gamma Bot' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Default mock implementation
    (useServices as any).mockReturnValue({
      services: mockServices,
      isLoading: false,
      error: null,
      updateService: mockUpdateService,
      toggleService: mockToggleService
    });

    (useAssistants as any).mockReturnValue({
      assistants: mockAssistants
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render loading state correctly', () => {
    (useServices as any).mockReturnValue({
      services: [],
      isLoading: true,
      error: null,
      updateService: mockUpdateService,
      toggleService: mockToggleService
    });

    render(<ServicesManagement />);
    expect(screen.getByText(/Cargando servicios.../i)).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    (useServices as any).mockReturnValue({
      services: [],
      isLoading: false,
      error: 'Failed to fetch services',
      updateService: mockUpdateService,
      toggleService: mockToggleService
    });

    render(<ServicesManagement />);
    expect(screen.getByText(/Failed to fetch services/i)).toBeInTheDocument();
  });

  it('renders empty state correctly', () => {
    (useServices as any).mockReturnValue({
      services: [],
      isLoading: false,
      error: null,
      updateService: mockUpdateService,
      toggleService: mockToggleService
    });

    render(<ServicesManagement />);
    expect(screen.getByText(/No hay servicios configurados/i)).toBeInTheDocument();
  });

  it('renders list of services correctly', () => {
    render(<ServicesManagement />);

    // Check for service names (component replaces '-' with space and capitalizes via CSS/logic)
    // The test usually checks the raw text content if CSS transform isn't applied in JSDOM,
    // but the component logic `service.serviceId.replace('-', ' ')` runs in JS.
    expect(screen.getByText('service alpha')).toBeInTheDocument();
    expect(screen.getByText('service beta')).toBeInTheDocument();

    // Check statuses
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Inactivo')).toBeInTheDocument();

    // Check assistant info
    expect(screen.getByText('Alpha Bot', { selector: 'div' })).toBeInTheDocument();
    expect(screen.getByText('Sin asignar')).toBeInTheDocument();
  });

  it('calls toggleService when the power button is clicked', async () => {
    mockToggleService.mockResolvedValue(true);
    render(<ServicesManagement />);

    // Click toggle for the first service (active -> inactive)
    const toggleButtons = screen.getAllByRole('button');
    // Filter for the specific power buttons if there are others, but here they are distinctive by title
    const deactivateBtn = screen.getByTitle('Desactivar servicio');
    
    await act(async () => {
      fireEvent.click(deactivateBtn);
    });

    expect(mockToggleService).toHaveBeenCalledWith('service-alpha', false);
    
    // Check success message
    expect(screen.getByText(/Servicio service-alpha desactivado/i)).toBeInTheDocument();

    // Fast-forward time to ensure message disappears
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByText(/Servicio service-alpha desactivado/i)).not.toBeInTheDocument();
  });

  it('handles toggleService failure', async () => {
    mockToggleService.mockResolvedValue(false);
    render(<ServicesManagement />);

    const activateBtn = screen.getByTitle('Activar servicio'); // service-beta is inactive
    
    await act(async () => {
      fireEvent.click(activateBtn);
    });

    expect(mockToggleService).toHaveBeenCalledWith('service-beta', true);
    expect(screen.getByText(/Error al cambiar el estado del servicio/i)).toBeInTheDocument();
  });

  it('calls updateService when a new assistant is selected', async () => {
    mockUpdateService.mockResolvedValue(true);
    render(<ServicesManagement />);

    // Find the select for the first service
    // We can find by label associated with the id
    const selects = screen.getAllByLabelText(/Cambiar Asistente/i);
    const serviceAlphaSelect = selects[0];

    await act(async () => {
      fireEvent.change(serviceAlphaSelect, { target: { value: 'asst_456' } });
    });

    // Check if updateService was called with correct params: serviceId, assistantId, assistantName
    expect(mockUpdateService).toHaveBeenCalledWith('service-alpha', 'asst_456', 'Beta Bot');
    
    expect(screen.getByText(/Asistente "Beta Bot" aplicado al servicio service-alpha/i)).toBeInTheDocument();
  });

  it('does not call updateService if assistant is not found or invalid', async () => {
    render(<ServicesManagement />);
    const selects = screen.getAllByLabelText(/Cambiar Asistente/i);
    const serviceAlphaSelect = selects[0];

    await act(async () => {
      fireEvent.change(serviceAlphaSelect, { target: { value: '' } });
    });

    expect(mockUpdateService).not.toHaveBeenCalled();
  });

  it('shows loading state and disables controls during updates', async () => {
    // Make the promise unresolved to simulate "in progress" state
    let resolvePromise: (val: boolean) => void;
    const promise = new Promise<boolean>((resolve) => { resolvePromise = resolve; });
    mockToggleService.mockReturnValue(promise);

    render(<ServicesManagement />);
    const deactivateBtn = screen.getByTitle('Desactivar servicio');

    await act(async () => {
      fireEvent.click(deactivateBtn);
    });

    // Check if button is disabled
    expect(deactivateBtn).toBeDisabled();
    
    // Check for spinner inside the button. 
    // Since the component conditionally renders Loader2 OR Power icon based on `isUpdating`.
    // We can check that the Power icon is gone or look for the animate-spin class.
    // Lucide icons render as svgs, checking for the class is reliable here.
    const spinner = deactivateBtn.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();

    // Check if select input for this service is also disabled
    const select = screen.getAllByLabelText(/Cambiar Asistente/i)[0];
    expect(select).toBeDisabled();

    // Resolve to clean up
    await act(async () => {
      resolvePromise!(true);
    });
  });
});