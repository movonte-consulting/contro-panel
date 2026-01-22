import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AssistantsList from './AssistantsList';
import { useAssistants } from '../../hooks/useAssistants';

vi.mock('../../hooks/useAssistants');

describe('AssistantsList Component', () => {
  const defaultMockValue = {
    assistants: [],
    activeAssistant: '',
    totalAssistants: 0,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the loading state correctly', () => {
    vi.mocked(useAssistants).mockReturnValue({
      ...defaultMockValue,
      isLoading: true,
    });

    render(<AssistantsList />);
    expect(screen.getByText(/cargando asistentes.../i)).toBeInTheDocument();
  });

  it('should render an error message if the hook fails', () => {
    const errorMessage = 'Error fetching data';
    vi.mocked(useAssistants).mockReturnValue({
      ...defaultMockValue,
      error: errorMessage,
    });

    render(<AssistantsList />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should render the empty state message when there are no assistants', () => {
    vi.mocked(useAssistants).mockReturnValue({
      ...defaultMockValue,
      assistants: [],
    });

    render(<AssistantsList />);
    expect(screen.getByText(/no hay asistentes disponibles/i)).toBeInTheDocument();
  });

  it('should render the list correctly', () => {
    vi.mocked(useAssistants).mockReturnValue({
      ...defaultMockValue,
      assistants: [
        { id: '1', name: 'Alpha', model: 'GPT-4', isActive: true }
      ],
      totalAssistants: 1,
    });

    render(<AssistantsList />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText(/GPT-4/)).toBeInTheDocument();
  });

  it('should render the assistants list and the global active assistant', () => {
    const mockAssistants = [
      { id: '1', name: 'Assistant Alpha', model: 'GPT-4', isActive: true },
      { id: '2', name: 'Assistant Beta', model: 'Claude 3', isActive: false },
    ];

    vi.mocked(useAssistants).mockReturnValue({
      assistants: mockAssistants,
      activeAssistant: '1',
      totalAssistants: 2,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<AssistantsList />);

    expect(screen.getByText('Asistentes de IA')).toBeInTheDocument();
    expect(screen.getByText('Total: 2')).toBeInTheDocument();

    expect(screen.getAllByText('Assistant Alpha')).toHaveLength(2);
    expect(screen.getByText('Assistant Beta')).toBeInTheDocument();

    expect(screen.getByText('Asistente Activo Global:')).toBeInTheDocument();
    expect(screen.getAllByText('Global').length).toBeGreaterThan(0);

    expect(screen.getByText('ACTIVO')).toBeInTheDocument();
    expect(screen.getByText('INACTIVO')).toBeInTheDocument();
  });
});