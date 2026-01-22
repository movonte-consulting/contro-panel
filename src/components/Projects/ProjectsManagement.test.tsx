import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProjectsManagement from './ProjectsManagement';
import { useProjects } from '../../hooks/useProjects';

// Mock del hook personalizado
vi.mock('../../hooks/useProjects', () => ({
  useProjects: vi.fn(),
}));

describe('ProjectsManagement Component', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar el estado de carga (spinner) cuando isLoading es true', () => {
    (useProjects as any).mockReturnValue({
      projects: [],
      isLoading: true,
      error: null,
    });

    render(<ProjectsManagement />);

    expect(screen.getByText(/Cargando proyectos.../i)).toBeDefined();
    // Verificamos que el icono de carga tenga la clase de animación
    const loader = screen.getByRole('paragraph').previousSibling; 
    expect(loader).toHaveClass('animate-spin');
  });

  it('debe mostrar un mensaje de error cuando el hook devuelve un error', () => {
    const errorMessage = 'Error al conectar con Jira';
    (useProjects as any).mockReturnValue({
      projects: [],
      isLoading: false,
      error: errorMessage,
    });

    render(<ProjectsManagement />);

    expect(screen.getByText(/Error:/i)).toBeDefined();
    expect(screen.getByText(errorMessage)).toBeDefined();
  });

  it('debe mostrar el mensaje de "No hay proyectos" cuando la lista está vacía', () => {
    (useProjects as any).mockReturnValue({
      projects: [],
      isLoading: false,
      error: null,
    });

    render(<ProjectsManagement />);

    expect(screen.getByText(/No hay proyectos disponibles/i)).toBeDefined();
  });

  it('debe renderizar la lista de proyectos correctamente', () => {
  const mockProjects = [
    { name: 'Proyecto Alpha', key: 'ALP', projectTypeKey: 'software' },
    { name: 'Proyecto Beta', key: 'BET', projectTypeKey: 'service_desk' },
  ];

  (useProjects as any).mockReturnValue({
    projects: mockProjects,
    isLoading: false,
    error: null,
  });

  render(<ProjectsManagement />);

  // ... (tus otros expects)

  // Cambiamos la regex por el string exacto
  const badges = screen.getAllByText('Disponible'); 
  expect(badges).toHaveLength(2);
});

  it('debe mostrar la información del "Nuevo Sistema" siempre que no esté cargando o en error', () => {
    (useProjects as any).mockReturnValue({
      projects: [],
      isLoading: false,
      error: null,
    });

    render(<ProjectsManagement />);
    
    expect(screen.getByText(/Nuevo Sistema de Proyectos/i)).toBeDefined();
    expect(screen.getByText(/Cada servicio maneja su propio proyecto/i)).toBeDefined();
  });
});