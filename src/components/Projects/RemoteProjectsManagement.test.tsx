import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RemoteProjectsManagement from './RemoteProjectsManagement';
import { useRemoteProjects } from '../../hooks/useRemoteProjects';
import { useActivityContext } from '../../contexts/ActivityContext';

vi.mock('../../hooks/useRemoteProjects');
vi.mock('../../contexts/ActivityContext');

describe('RemoteProjectsManagement Component', () => {
  const mockSetRemoteServerUrl = vi.fn();
  const mockSetRemoteActiveProject = vi.fn();
  const mockAddActivity = vi.fn();

  const mockProjects = [
    { key: 'PROJ1', name: 'Proyecto Uno', id: '101' },
    { key: 'PROJ2', name: 'Proyecto Dos', id: '102' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useActivityContext as any).mockReturnValue({ addActivity: mockAddActivity });
    (useRemoteProjects as any).mockReturnValue({
      remoteProjects: mockProjects,
      remoteActiveProject: 'PROJ1',
      remoteServerUrl: 'https://test.com',
      isLoading: false,
      error: null,
      setRemoteServerUrl: mockSetRemoteServerUrl,
      setRemoteActiveProject: mockSetRemoteActiveProject,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe actualizar la URL del servidor cuando el usuario escribe', () => {
    render(<RemoteProjectsManagement />);
    const input = screen.getByLabelText(/URL del Servidor Remoto/i);
    
    // Usamos fireEvent para evitar el timeout de userEvent con timers
    fireEvent.change(input, { target: { value: 'https://nuevo.com' } });

    expect(mockSetRemoteServerUrl).toHaveBeenCalledWith('https://nuevo.com');
  });

  it('debe cambiar el proyecto activo con éxito y limpiar el mensaje después de 3s', async () => {
    vi.useFakeTimers();
    mockSetRemoteActiveProject.mockResolvedValue(true);
    render(<RemoteProjectsManagement />);

    // Buscamos el botón "Activar" del PROJ2 (el que no es activo)
    const activateButtons = screen.getAllByRole('button', { name: /Activar/i });
    
    await act(async () => {
      fireEvent.click(activateButtons[0]);
    });

    expect(screen.getByText(/Proyecto remoto activo cambiado a: PROJ2/i)).toBeDefined();

    // Avanzamos el reloj
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Ahora no debería estar
    expect(screen.queryByText(/Proyecto remoto activo cambiado a: PROJ2/i)).toBeNull();
  });

it('debe mostrar el proyecto actualmente activo en el banner usando un selector específico', () => {
  render(<RemoteProjectsManagement />);
  
  const label = screen.getByText(/Proyecto Remoto Activo:/i);
  const bannerContainer = label.parentElement?.parentElement;
  
  expect(bannerContainer).toHaveTextContent('Proyecto Uno');
  expect(bannerContainer).toHaveTextContent('Key: PROJ1');
});

  it('debe manejar errores al cambiar de proyecto', async () => {
    mockSetRemoteActiveProject.mockResolvedValue(false);
    render(<RemoteProjectsManagement />);

    const select = screen.getByLabelText(/Cambiar Proyecto Remoto Activo/i);
    
    await act(async () => {
      fireEvent.change(select, { target: { value: 'PROJ2' } });
    });

    expect(screen.getByText(/Error al cambiar el proyecto remoto activo/i)).toBeDefined();
    expect(mockAddActivity).toHaveBeenCalledWith(expect.any(String), 'error');
  });
});