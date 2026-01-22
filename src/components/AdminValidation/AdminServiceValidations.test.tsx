import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { AdminServiceValidations } from './AdminServiceValidations';

vi.mock('../../config/api', () => ({
  API_ENDPOINTS: {
    SERVICE_VALIDATION_PENDING: '/api/validations/pending',
    SERVICE_VALIDATION_APPROVE: (id: string) => `/api/validations/${id}/approve`,
    SERVICE_VALIDATION_REJECT: (id: string) => `/api/validations/${id}/reject`,
  },
}));

const mockValidations = [
  {
    id: 1,
    serviceName: 'Premium Hosting',
    serviceDescription: 'High performance hosting',
    websiteUrl: 'https://example.com',
    requestedDomain: 'example.com',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      id: 101,
      username: 'johndoe',
      email: 'john@example.com',
    },
  },
  {
    id: 2,
    serviceName: 'Email Service',
    websiteUrl: 'https://mail.test.com',
    requestedDomain: 'mail.test.com',
    status: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      id: 102,
      username: 'janedoe',
      email: 'jane@test.com',
    },
  },
];

describe('AdminServiceValidations', () => {
  const mockOnValidationUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
    Storage.prototype.getItem = vi.fn(() => 'mock-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    (globalThis.fetch as any).mockImplementation(() => new Promise(() => {}));
    render(<AdminServiceValidations />);
    expect(screen.getByText('Cargando solicitudes...')).toBeInTheDocument();
  });

  it('renders validation list after data fetch', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { validations: mockValidations } }),
    });

    render(<AdminServiceValidations />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando solicitudes...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Premium Hosting')).toBeInTheDocument();
    expect(screen.getByText('Email Service')).toBeInTheDocument();
    expect(screen.getByText('johndoe (john@example.com)')).toBeInTheDocument();
  });

  it('handles fetch error correctly', async () => {
    (globalThis.fetch as any).mockRejectedValue(new Error('Network error'));

    render(<AdminServiceValidations />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('filters validations by search term', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { validations: mockValidations } }),
    });

    render(<AdminServiceValidations />);

    await waitFor(() => {
      expect(screen.getByText('Premium Hosting')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por servicio, usuario o dominio...');
    fireEvent.change(searchInput, { target: { value: 'Email' } });

    expect(screen.queryByText('Premium Hosting')).not.toBeInTheDocument();
    expect(screen.getByText('Email Service')).toBeInTheDocument();
  });

  it('filters validations by status buttons', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { validations: mockValidations } }),
    });

    render(<AdminServiceValidations />);

    await waitFor(() => {
      expect(screen.getByText('Premium Hosting')).toBeInTheDocument();
    });

    const approvedFilter = screen.getByText('Aprobado', { selector: 'button' });
    fireEvent.click(approvedFilter);

    expect(screen.queryByText('Premium Hosting')).not.toBeInTheDocument();
    expect(screen.getByText('Email Service')).toBeInTheDocument();

    const pendingFilter = screen.getByText('Pendiente', { selector: 'button' });
    fireEvent.click(pendingFilter);

    expect(screen.getByText('Premium Hosting')).toBeInTheDocument();
    expect(screen.queryByText('Email Service')).not.toBeInTheDocument();
  });

  it('opens review modal when clicking review button', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { validations: mockValidations } }),
    });

    render(<AdminServiceValidations />);

    await waitFor(() => {
      expect(screen.getByText('Revisar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Revisar'));

    expect(screen.getByText('Revisar Solicitud: Premium Hosting')).toBeInTheDocument();
    const descriptions = screen.getAllByText('High performance hosting');
    expect(descriptions.length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText('Agrega notas sobre tu decisión...')).toBeInTheDocument();
  });

//   it('approves a validation successfully', async () => {
//     (globalThis.fetch as any).mockResolvedValueOnce({
//       ok: true,
//       json: async () => ({ data: { validations: mockValidations } }),
//     });

//     render(<AdminServiceValidations onValidationUpdate={mockOnValidationUpdate} />);

//     await waitFor(() => {
//       expect(screen.getByText('Revisar')).toBeInTheDocument();
//     });

//     fireEvent.click(screen.getByText('Revisar'));

//     const notesInput = screen.getByPlaceholderText('Agrega notas sobre tu decisión...');
//     fireEvent.change(notesInput, { target: { value: 'Looks good' } });

//     (globalThis.fetch as any).mockResolvedValueOnce({
//       ok: true,
//       json: async () => ({ success: true }),
//     });

//     (globalThis.fetch as any).mockResolvedValueOnce({
//       ok: true,
//       json: async () => ({ data: { validations: [] } }),
//     });

//     const approveButton = screen.getByText('Aprobar');
//     fireEvent.click(approveButton);

//     await waitFor(() => {
//       expect(globalThis.fetch).toHaveBeenCalledWith(
//         '/api/validations/1/approve',
//         expect.objectContaining({
//           method: 'POST',
//           body: JSON.stringify({ adminNotes: 'Looks good' }),
//         })
//       );
//     });

//     expect(mockOnValidationUpdate).toHaveBeenCalled();
//     expect(screen.queryByText('Revisar Solicitud: Premium Hosting')).not.toBeInTheDocument();
//   });
it('approves a validation successfully', async () => {
    // 1. Configuración inicial (Mismo código que tenías)
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { validations: mockValidations } }),
    });

    render(<AdminServiceValidations onValidationUpdate={mockOnValidationUpdate} />);

    await waitFor(() => {
      expect(screen.getByText('Revisar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Revisar'));

    const notesInput = screen.getByPlaceholderText('Agrega notas sobre tu decisión...');
    fireEvent.change(notesInput, { target: { value: 'Looks good' } });

    // 2. Mocks para la acción de aprobar (Mismo código que tenías)
    // Primer fetch: POST de aprobación
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    // Segundo fetch: Recarga de validaciones (loadValidations)
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { validations: [] } }),
    });

    const approveButton = screen.getByText('Aprobar');
    fireEvent.click(approveButton);

    // 3. Verificamos la llamada a la API (Esto está bien)
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/validations/1/approve',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ adminNotes: 'Looks good' }),
        })
      );
    });

    await waitFor(() => {
      expect(screen.queryByText('Revisar Solicitud: Premium Hosting')).not.toBeInTheDocument();
    });

    expect(mockOnValidationUpdate).toHaveBeenCalled();
  });
  it('rejects a validation successfully', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { validations: mockValidations } }),
    });

    render(<AdminServiceValidations onValidationUpdate={mockOnValidationUpdate} />);

    await waitFor(() => {
      expect(screen.getByText('Revisar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Revisar'));

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { validations: [] } }),
    });

    const rejectButton = screen.getByText('Rechazar');
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/validations/1/reject',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ adminNotes: 'Rechazado por administrador' }),
        })
      );
    });

    expect(mockOnValidationUpdate).toHaveBeenCalled();
  });

  it('handles empty state correctly', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { validations: [] } }),
    });

    render(<AdminServiceValidations />);

    await waitFor(() => {
      expect(screen.getByText('No hay solicitudes que coincidan con los filtros')).toBeInTheDocument();
    });
  });
});