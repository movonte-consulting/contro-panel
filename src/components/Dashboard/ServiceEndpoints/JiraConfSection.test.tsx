import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import JiraConfigSection from './JiraConfigSection';

describe('JiraConfigSection Component', () => {
  const mockSetAssistantJiraEmail = vi.fn();
  const mockSetAssistantJiraToken = vi.fn();
  const mockSetAssistantJiraUrl = vi.fn();
  const mockSetWidgetJiraEmail = vi.fn();
  const mockSetWidgetJiraToken = vi.fn();
  const mockSetWidgetJiraUrl = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    isLoading: false,
    isSaving: false,
    assistantJiraEmail: '',
    setAssistantJiraEmail: mockSetAssistantJiraEmail,
    assistantJiraToken: '',
    setAssistantJiraToken: mockSetAssistantJiraToken,
    assistantJiraUrl: '',
    setAssistantJiraUrl: mockSetAssistantJiraUrl,
    widgetJiraEmail: '',
    setWidgetJiraEmail: mockSetWidgetJiraEmail,
    widgetJiraToken: '',
    setWidgetJiraToken: mockSetWidgetJiraToken,
    widgetJiraUrl: '',
    setWidgetJiraUrl: mockSetWidgetJiraUrl,
    onSave: mockOnSave,
    onCancel: mockOnCancel,
  };

  it('should render the component title and description', () => {
    render(<JiraConfigSection {...defaultProps} />);
    expect(screen.getByText('Configuración de Cuentas de Jira')).toBeInTheDocument();
    expect(screen.getByText(/Configura cuentas de Jira alternativas/i)).toBeInTheDocument();
  });

  it('should render Assistant and Widget sections', () => {
    render(<JiraConfigSection {...defaultProps} />);
    expect(screen.getByText('Cuenta del Asistente')).toBeInTheDocument();
    expect(screen.getByText('Cuenta del Widget')).toBeInTheDocument();
  });

  it('should handle Assistant Email input changes', () => {
    render(<JiraConfigSection {...defaultProps} />);
    const input = screen.getByPlaceholderText('assistant@movonte.com');
    fireEvent.change(input, { target: { value: 'test@assistant.com' } });
    expect(mockSetAssistantJiraEmail).toHaveBeenCalledWith('test@assistant.com');
  });

  it('should handle Assistant Token input changes', () => {
    render(<JiraConfigSection {...defaultProps} />);
    const inputs = screen.getAllByPlaceholderText('••••••••••••••••');
    fireEvent.change(inputs[0], { target: { value: 'token123' } });
    expect(mockSetAssistantJiraToken).toHaveBeenCalledWith('token123');
  });

  it('should handle Assistant URL input changes', () => {
    render(<JiraConfigSection {...defaultProps} />);
    const inputs = screen.getAllByPlaceholderText('https://movonte.atlassian.net');
    fireEvent.change(inputs[0], { target: { value: 'https://new-assistant.atlassian.net' } });
    expect(mockSetAssistantJiraUrl).toHaveBeenCalledWith('https://new-assistant.atlassian.net');
  });

  it('should handle Widget Email input changes', () => {
    render(<JiraConfigSection {...defaultProps} />);
    const input = screen.getByPlaceholderText('widget@movonte.com');
    fireEvent.change(input, { target: { value: 'test@widget.com' } });
    expect(mockSetWidgetJiraEmail).toHaveBeenCalledWith('test@widget.com');
  });

  it('should handle Widget Token input changes', () => {
    render(<JiraConfigSection {...defaultProps} />);
    const inputs = screen.getAllByPlaceholderText('••••••••••••••••');
    // The second password input corresponds to the Widget section
    fireEvent.change(inputs[1], { target: { value: 'widgetToken123' } });
    expect(mockSetWidgetJiraToken).toHaveBeenCalledWith('widgetToken123');
  });

  it('should handle Widget URL input changes', () => {
    render(<JiraConfigSection {...defaultProps} />);
    const inputs = screen.getAllByPlaceholderText('https://movonte.atlassian.net');
    // The second URL input corresponds to the Widget section
    fireEvent.change(inputs[1], { target: { value: 'https://new-widget.atlassian.net' } });
    expect(mockSetWidgetJiraUrl).toHaveBeenCalledWith('https://new-widget.atlassian.net');
  });

  it('should show loading spinner when isLoading is true', () => {
    const { container } = render(<JiraConfigSection {...defaultProps} isLoading={true} />);
    // Checking for the animate-spin class or the Lucide component structure
    const loader = container.querySelector('.animate-spin');
    expect(loader).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(<JiraConfigSection {...defaultProps} />);
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should call onSave when save button is clicked', () => {
    render(<JiraConfigSection {...defaultProps} />);
    const saveButton = screen.getByText('Guardar Cuentas');
    fireEvent.click(saveButton);
    expect(mockOnSave).toHaveBeenCalled();
  });

  it('should disable save button and show loading text when isSaving is true', () => {
    render(<JiraConfigSection {...defaultProps} isSaving={true} />);
    
    const saveButton = screen.getByRole('button', { name: /guardando/i });
    expect(saveButton).toBeDisabled();
    expect(screen.getByText('Guardando...')).toBeInTheDocument();
    
    // Ensure the normal text is not present
    expect(screen.queryByText('Guardar Cuentas')).not.toBeInTheDocument();
  });

  it('should display input values correctly', () => {
    render(
      <JiraConfigSection 
        {...defaultProps} 
        assistantJiraEmail="filled@assistant.com"
        widgetJiraEmail="filled@widget.com"
      />
    );

    expect(screen.getByDisplayValue('filled@assistant.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('filled@widget.com')).toBeInTheDocument();
  });
});