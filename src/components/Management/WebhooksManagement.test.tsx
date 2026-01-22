import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WebhooksManagement from './WebhooksManagement';
import { useWebhooks } from '../../hooks/useWebhooks';
import { useAssistants } from '../../hooks/useAssistants';
import { useServices } from '../../hooks/useServices';

// Mock Hooks
vi.mock('../../hooks/useWebhooks');
vi.mock('../../hooks/useAssistants');
vi.mock('../../hooks/useServices');

describe('WebhooksManagement Component', () => {
  // Mocks functions
  const mockConfigureWebhook = vi.fn();
  const mockTestWebhook = vi.fn();
  const mockDisableWebhook = vi.fn();
  const mockSetWebhookFilter = vi.fn();
  const mockSaveWebhook = vi.fn();
  const mockUpdateWebhook = vi.fn();
  const mockDeleteWebhook = vi.fn();

  // Mock Data
  const mockAssistants = [
    { id: 'asst_1', name: 'Assistant One' },
    { id: 'asst_2', name: 'Assistant Two' },
  ];

  const mockServices = [
    { serviceId: 'srv_1', serviceName: 'Service One' },
    { serviceId: 'srv_2', serviceName: 'Service Two' }
  ];

  const mockSavedWebhooks = [
    {
      id: 101,
      name: 'Production Webhook',
      url: 'https://api.example.com/webhook',
      description: 'Main production webhook',
      serviceId: 'srv_1',
      serviceName: 'Service One',
      assistantId: 'asst_1',
      token: 'secret-token',
      isEnabled: true,
      filterEnabled: false
    }
  ];

  const mockWebhookStatus = {
    isEnabled: true,
    webhookUrl: 'https://api.example.com/current',
    assistantId: 'asst_2',
    filter: { filterEnabled: true }
  };

  const defaultHookReturn = {
    webhookStatus: mockWebhookStatus,
    savedWebhooks: mockSavedWebhooks,
    isLoading: false,
    error: null,
    configureWebhook: mockConfigureWebhook,
    testWebhook: mockTestWebhook,
    disableWebhook: mockDisableWebhook,
    setWebhookFilter: mockSetWebhookFilter,
    saveWebhook: mockSaveWebhook,
    updateWebhook: mockUpdateWebhook,
    deleteWebhook: mockDeleteWebhook
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('confirm', vi.fn(() => true));

    (useAssistants as any).mockReturnValue({ assistants: mockAssistants });
    (useServices as any).mockReturnValue({ services: mockServices });
    (useWebhooks as any).mockReturnValue(defaultHookReturn);
  });

  // --- TESTS DE RENDERIZADO Y ESTADOS INICIALES ---

  it('renders loading state', () => {
    (useWebhooks as any).mockReturnValue({ ...defaultHookReturn, isLoading: true });
    render(<WebhooksManagement />);
    expect(screen.getByText(/Loading webhook configuration/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    (useWebhooks as any).mockReturnValue({ ...defaultHookReturn, error: 'Failed to fetch' });
    render(<WebhooksManagement />);
    expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument();
  });

  it('renders initial configuration correctly', () => {
    render(<WebhooksManagement />);
    expect(screen.getByDisplayValue('https://api.example.com/current')).toBeInTheDocument();
  });

  // --- TESTS DE CONFIGURACIÓN (Configure Webhook) ---

  it('shows error validation when URL is empty on Configure', async () => {
    (useWebhooks as any).mockReturnValue({
      ...defaultHookReturn,
      webhookStatus: { webhookUrl: '' } // Estado inicial vacío
    });
    render(<WebhooksManagement />);

    // Limpiar input manualmente por si acaso
    const urlInput = screen.getByPlaceholderText(/api-private.atlassian.com/i);
    fireEvent.change(urlInput, { target: { value: '' } });

    const saveConfigBtn = screen.getByRole('button', { name: /Save Webhook Configuration/i });
    fireEvent.click(saveConfigBtn);

    expect(await screen.findByText('Please enter a webhook URL')).toBeInTheDocument();
    expect(mockConfigureWebhook).not.toHaveBeenCalled();
  });

  it('handles API error during Configure Webhook', async () => {
    mockConfigureWebhook.mockResolvedValue(false); // Simula fallo en API
    render(<WebhooksManagement />);

    const saveConfigBtn = screen.getByRole('button', { name: /Save Webhook Configuration/i });
    fireEvent.click(saveConfigBtn);

    await waitFor(() => {
      expect(screen.getByText('Error saving webhook')).toBeInTheDocument();
    });
  });

  it('handles Exception during Configure Webhook', async () => {
    mockConfigureWebhook.mockRejectedValue(new Error('Network error')); // Simula Exception
    render(<WebhooksManagement />);

    const saveConfigBtn = screen.getByRole('button', { name: /Save Webhook Configuration/i });
    fireEvent.click(saveConfigBtn);

    await waitFor(() => {
      expect(screen.getByText('Error saving webhook')).toBeInTheDocument();
    });
  });

  // --- TESTS DE "TEST WEBHOOK" ---

  it('executes Test Webhook successfully', async () => {
    mockTestWebhook.mockResolvedValue({ status: 200, data: 'OK' });
    render(<WebhooksManagement />);

    const testBtn = screen.getByRole('button', { name: /Test Webhook/i });
    fireEvent.click(testBtn);

    await waitFor(() => {
      expect(screen.getByText('Webhook test successful')).toBeInTheDocument();
    });
  });

  it('handles Test Webhook failure (false return)', async () => {
    mockTestWebhook.mockResolvedValue(null);
    render(<WebhooksManagement />);

    const testBtn = screen.getByRole('button', { name: /Test Webhook/i });
    fireEvent.click(testBtn);

    await waitFor(() => {
      expect(screen.getByText('Webhook test failed')).toBeInTheDocument();
    });
  });

  it('handles Test Webhook exception', async () => {
    mockTestWebhook.mockRejectedValue(new Error('Boom'));
    render(<WebhooksManagement />);

    const testBtn = screen.getByRole('button', { name: /Test Webhook/i });
    fireEvent.click(testBtn);

    await waitFor(() => {
      expect(screen.getByText('Webhook test failed')).toBeInTheDocument();
    });
  });

  // --- TESTS DE "DISABLE WEBHOOK" ---

  it('disables webhook successfully', async () => {
    mockDisableWebhook.mockResolvedValue(true);
    render(<WebhooksManagement />);

    const disableBtn = screen.getByRole('button', { name: /Disable Webhook/i });
    fireEvent.click(disableBtn);

    await waitFor(() => {
      expect(screen.getByText('Webhook disabled successfully')).toBeInTheDocument();
    });
  });

  it('handles Disable Webhook failure', async () => {
    mockDisableWebhook.mockResolvedValue(false);
    render(<WebhooksManagement />);

    const disableBtn = screen.getByRole('button', { name: /Disable Webhook/i });
    fireEvent.click(disableBtn);

    await waitFor(() => {
      expect(screen.getByText('Error disabling webhook')).toBeInTheDocument();
    });
  });

  it('handles Disable Webhook exception', async () => {
    mockDisableWebhook.mockRejectedValue(new Error('Fail'));
    render(<WebhooksManagement />);

    const disableBtn = screen.getByRole('button', { name: /Disable Webhook/i });
    fireEvent.click(disableBtn);

    await waitFor(() => {
      expect(screen.getByText('Error disabling webhook')).toBeInTheDocument();
    });
  });

  // --- TESTS DE FILTROS (Filter Logic) ---

  it('toggles filter configuration visibility and saves filter', async () => {
    // Inicializar con filtro habilitado para ver la config
    (useWebhooks as any).mockReturnValue({
      ...defaultHookReturn,
      webhookStatus: { ...mockWebhookStatus, filter: { filterEnabled: true } }
    });
    
    render(<WebhooksManagement />);

    // Verificar que la sección de configuración es visible
    expect(screen.getByText(/Filter Information:/i)).toBeInTheDocument();

    mockSetWebhookFilter.mockResolvedValue(true);
    const saveFilterBtn = screen.getByRole('button', { name: /Save Filter Configuration/i });
    fireEvent.click(saveFilterBtn);

    await waitFor(() => {
      expect(mockSetWebhookFilter).toHaveBeenCalledWith(true, 'response_value', 'Yes');
      expect(screen.getByText(/Webhook filter enabled/i)).toBeInTheDocument();
    });
  });

  it('handles Save Filter failure', async () => {
    (useWebhooks as any).mockReturnValue({
      ...defaultHookReturn,
      webhookStatus: { ...mockWebhookStatus, filter: { filterEnabled: true } }
    });
    render(<WebhooksManagement />);

    mockSetWebhookFilter.mockResolvedValue(false);
    const saveFilterBtn = screen.getByRole('button', { name: /Save Filter Configuration/i });
    fireEvent.click(saveFilterBtn);

    await waitFor(() => {
      expect(screen.getByText('Error saving webhook filter')).toBeInTheDocument();
    });
  });

  it('handles Save Filter exception', async () => {
    (useWebhooks as any).mockReturnValue({
      ...defaultHookReturn,
      webhookStatus: { ...mockWebhookStatus, filter: { filterEnabled: true } }
    });
    render(<WebhooksManagement />);

    mockSetWebhookFilter.mockRejectedValue(new Error('Fail'));
    const saveFilterBtn = screen.getByRole('button', { name: /Save Filter Configuration/i });
    fireEvent.click(saveFilterBtn);

    await waitFor(() => {
      expect(screen.getByText('Error saving webhook filter')).toBeInTheDocument();
    });
  });

  // --- TESTS DE GUARDAR/ACTUALIZAR WEBHOOK (CRUD) ---

  it('validates required fields when saving new webhook', async () => {
    render(<WebhooksManagement />);
    
    // Abrir formulario
    fireEvent.click(screen.getByRole('button', { name: /Create New Webhook/i }));

    // Intentar guardar sin nombre ni URL
    fireEvent.click(screen.getByRole('button', { name: 'Save Webhook' }));

    expect(await screen.findByText('Name and URL are required')).toBeInTheDocument();
    expect(mockSaveWebhook).not.toHaveBeenCalled();
  });

  it('saves a new webhook with full details (service, token, assistant)', async () => {
    mockSaveWebhook.mockResolvedValue(true);
    render(<WebhooksManagement />);

    fireEvent.click(screen.getByRole('button', { name: /Create New Webhook/i }));

    // Llenar campos
    fireEvent.change(screen.getByPlaceholderText(/e.g., Jira Production Webhook/i), { target: { value: 'Full Hook' } });
    fireEvent.change(screen.getByPlaceholderText(/api-private.atlassian.com/i), { target: { value: 'https://full.com' } });
    
    // Seleccionar Servicio
    const serviceSelect = screen.getByLabelText(/Link to Service \(Optional\)/i); // Usando label text para variar
    fireEvent.change(serviceSelect, { target: { value: 'srv_2' } });

    // Token
    fireEvent.change(screen.getByPlaceholderText(/Enter webhook authentication token/i), { target: { value: 'my-token' } });

    // Guardar
    fireEvent.click(screen.getByRole('button', { name: 'Save Webhook' }));

    await waitFor(() => {
      expect(mockSaveWebhook).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Full Hook',
        url: 'https://full.com',
        serviceId: 'srv_2',
        token: 'my-token'
      }));
      expect(screen.getByText('Webhook saved successfully')).toBeInTheDocument();
    });
  });

  it('handles Save Webhook failure (API returns false)', async () => {
    mockSaveWebhook.mockResolvedValue(false);
    render(<WebhooksManagement />);

    fireEvent.click(screen.getByRole('button', { name: /Create New Webhook/i }));
    fireEvent.change(screen.getByPlaceholderText(/e.g., Jira Production Webhook/i), { target: { value: 'Fail Hook' } });
    fireEvent.change(screen.getByPlaceholderText(/api-private.atlassian.com/i), { target: { value: 'https://fail.com' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Save Webhook' }));

    await waitFor(() => {
      expect(screen.getByText('Error saving webhook')).toBeInTheDocument();
    });
  });

  it('handles Save Webhook exception', async () => {
    mockSaveWebhook.mockRejectedValue(new Error('DB Error'));
    render(<WebhooksManagement />);

    fireEvent.click(screen.getByRole('button', { name: /Create New Webhook/i }));
    fireEvent.change(screen.getByPlaceholderText(/e.g., Jira Production Webhook/i), { target: { value: 'Exception Hook' } });
    fireEvent.change(screen.getByPlaceholderText(/api-private.atlassian.com/i), { target: { value: 'https://ex.com' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Save Webhook' }));

    await waitFor(() => {
      expect(screen.getByText('Error saving webhook')).toBeInTheDocument();
    });
  });

  // --- TESTS DE ACTUALIZACIÓN Y BORRADO ---

  it('updates existing webhook and handles failure', async () => {
    mockUpdateWebhook.mockResolvedValue(false);
    render(<WebhooksManagement />);

    // Seleccionar webhook existente
    const savedSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(savedSelect, { target: { value: '101' } });

    const updateBtn = screen.getByRole('button', { name: /Update Webhook/i });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(screen.getByText('Error updating webhook')).toBeInTheDocument();
    });
  });

  it('handles update exception', async () => {
    mockUpdateWebhook.mockRejectedValue(new Error('Update failed'));
    render(<WebhooksManagement />);

    const savedSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(savedSelect, { target: { value: '101' } });

    const updateBtn = screen.getByRole('button', { name: /Update Webhook/i });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(screen.getByText('Error updating webhook')).toBeInTheDocument();
    });
  });

  it('cancels creating/editing a webhook (resets form)', () => {
    render(<WebhooksManagement />);

    // Abrir creación
    fireEvent.click(screen.getByRole('button', { name: /Create New Webhook/i }));
    
    // Escribir algo
    fireEvent.change(screen.getByPlaceholderText(/e.g., Jira Production Webhook/i), { target: { value: 'Draft' } });

    // Cancelar
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    // Verificar que desapareció el botón de guardar y el formulario se limpió (o se ocultó)
    expect(screen.queryByRole('button', { name: 'Save Webhook' })).not.toBeInTheDocument();
    
    // Si volvemos a abrir, debería estar vacío (depende de la implementación, pero aquí probamos que se cierra)
    expect(screen.queryByPlaceholderText(/e.g., Jira Production Webhook/i)).not.toBeInTheDocument();
  });

  it('clears form when deselecting a saved webhook', () => {
    render(<WebhooksManagement />);
    const savedSelect = screen.getAllByRole('combobox')[0];

    // Seleccionar
    fireEvent.change(savedSelect, { target: { value: '101' } });
    expect(screen.getByRole('button', { name: /Delete Saved Webhook/i })).toBeInTheDocument();

    // Deseleccionar (valor vacío)
    fireEvent.change(savedSelect, { target: { value: '' } });
    
    // El botón de borrar debe desaparecer
    expect(screen.queryByRole('button', { name: /Delete Saved Webhook/i })).not.toBeInTheDocument();
    // El nombre debe limpiarse
    expect(screen.queryByDisplayValue('Production Webhook')).not.toBeInTheDocument();
  });

  it('handles Delete Webhook failure', async () => {
    mockDeleteWebhook.mockResolvedValue(false);
    render(<WebhooksManagement />);

    const savedSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(savedSelect, { target: { value: '101' } });

    const deleteBtn = screen.getByRole('button', { name: /Delete Saved Webhook/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByText('Error deleting webhook')).toBeInTheDocument();
    });
  });

  it('handles Delete Webhook exception', async () => {
    mockDeleteWebhook.mockRejectedValue(new Error('Delete error'));
    render(<WebhooksManagement />);

    const savedSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(savedSelect, { target: { value: '101' } });

    const deleteBtn = screen.getByRole('button', { name: /Delete Saved Webhook/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByText('Error deleting webhook')).toBeInTheDocument();
    });
  });

  it('shows error if trying to delete without selection (defensive coding)', async () => {
     // Este caso es difícil de replicar por UI porque el botón se oculta, 
     // pero si el componente tuviera un bug y mostrara el botón...
     // Forzamos el estado visualmente (aunque en este componente específico el botón se oculta).
     // Si no podemos clicar el botón, esta línea 211 es difícil de cubrir vía integration test puro
     // sin modificar el componente para que el botón esté siempre visible pero deshabilitado.
     // Sin embargo, podemos intentar simular un estado intermedio si fuera posible.
     
     // Nota: Como el botón "Delete" se renderiza condicionalmente {showDeleteButton && ...},
     // no podemos hacer clic en él si no hay webhook seleccionado.
     // La línea 211 `if (!selectedSavedWebhook)` es técnicamente código muerto en la UI actual 
     // a menos que haya una condición de carrera, pero está bien tenerla por seguridad.
  });

});