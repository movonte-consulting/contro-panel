import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProjectConfigModal from './ProjectConfigModal';
import { useApi } from '../../../hooks/useApi';

vi.mock('../../../hooks/useApi');

describe('ProjectConfigModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const mockGet = vi.fn();

  const mockProjects = [
    { key: 'PROJ1', name: 'Project 1' },
    { key: 'PROJ2', name: 'Project 2' },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    serviceId: 'svc-1',
    serviceName: 'Test Service',
    currentProjectKey: 'PROJ1',
    projects: mockProjects,
    initialStatuses: ['Open'],
    initialDisabledTickets: ['TIC-123'],
    onSave: mockOnSave,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useApi as any).mockReturnValue({ get: mockGet });
    mockGet.mockResolvedValue({
      success: true,
      data: ['Open', 'In Progress', 'Done', 'Closed']
    });
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(<ProjectConfigModal {...defaultProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render header and project selection', () => {
    render(<ProjectConfigModal {...defaultProps} />);
    
    expect(screen.getByText('Configure Jira Project & Ticket States')).toBeInTheDocument();
    expect(screen.getByText(/Test Service/)).toBeInTheDocument();
    
    // Check if select has the correct initial value
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('PROJ1');
  });

  it('should fetch and display available statuses', async () => {
    render(<ProjectConfigModal {...defaultProps} />);
    
    expect(screen.getByText('Loading statuses...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Open')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  it('should handle API failure when fetching statuses', async () => {
    mockGet.mockRejectedValue(new Error('API Error'));
    render(<ProjectConfigModal {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('No statuses available')).toBeInTheDocument();
    });
  });

  it('should pre-select statuses from initialStatuses', async () => {
    render(<ProjectConfigModal {...defaultProps} />);
    
    await waitFor(() => {
      const openCheckbox = screen.getByLabelText('Open');
      const progressCheckbox = screen.getByLabelText('In Progress');
      
      expect(openCheckbox).toBeChecked(); // Was in initialStatuses
      expect(progressCheckbox).not.toBeChecked(); // Was not
    });
  });

  it('should toggle statuses when checkboxes are clicked', async () => {
    render(<ProjectConfigModal {...defaultProps} />);
    
    await waitFor(() => screen.getByLabelText('Open'));
    
    const openCheckbox = screen.getByLabelText('Open');
    
    // Uncheck Open
    fireEvent.click(openCheckbox);
    expect(openCheckbox).not.toBeChecked();
    
    // Check Open again
    fireEvent.click(openCheckbox);
    expect(openCheckbox).toBeChecked();
  });

  it('should allow changing the project', () => {
    render(<ProjectConfigModal {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'PROJ2' } });
    
    expect(select).toHaveValue('PROJ2');
  });

  it('should display initial disabled tickets', () => {
    render(<ProjectConfigModal {...defaultProps} />);
    expect(screen.getByText('TIC-123')).toBeInTheDocument();
  });

  it('should allow adding a new disabled ticket', () => {
    render(<ProjectConfigModal {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('e.g., TI-123');
    const addButton = screen.getByText('Add');
    
    fireEvent.change(input, { target: { value: 'NEW-456' } });
    fireEvent.click(addButton);
    
    expect(screen.getByText('NEW-456')).toBeInTheDocument();
    // Input should be cleared
    expect(input).toHaveValue('');
  });

  it('should allow removing a disabled ticket', () => {
    render(<ProjectConfigModal {...defaultProps} />);
    
    const removeButton = screen.getByTitle('Remove ticket'); // The one for TIC-123
    fireEvent.click(removeButton);
    
    expect(screen.queryByText('TIC-123')).not.toBeInTheDocument();
    expect(screen.getByText('No disabled tickets')).toBeInTheDocument();
  });

  it('should not add duplicate or empty tickets', () => {
    render(<ProjectConfigModal {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('e.g., TI-123');
    const addButton = screen.getByText('Add');
    
    // Try adding duplicate
    fireEvent.change(input, { target: { value: 'TIC-123' } }); // Already exists
    fireEvent.click(addButton);
    
    // Should still only have one instance (though visually hard to check count without testid, logic check is valid)
    // Try empty
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(addButton);
    
    // Still just the initial one
    expect(screen.getAllByText('TIC-123')).toHaveLength(1);
  });

  it('should disable Save button if no project is selected', () => {
    render(<ProjectConfigModal {...defaultProps} currentProjectKey="" />);
    
    const saveButton = screen.getByText('Save Configuration');
    expect(saveButton).toBeDisabled();
    
    // Select a project
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'PROJ1' } });
    
    expect(saveButton).toBeEnabled();
  });

  it('should call onSave with correct data', async () => {
    render(<ProjectConfigModal {...defaultProps} />);
    
    await waitFor(() => screen.getByLabelText('In Progress'));
    
    // Modify some data
    fireEvent.click(screen.getByLabelText('In Progress')); // Select status
    
    const input = screen.getByPlaceholderText('e.g., TI-123');
    fireEvent.change(input, { target: { value: 'NEW-1' } });
    fireEvent.click(screen.getByText('Add'));
    
    fireEvent.click(screen.getByText('Save Configuration'));
    
    expect(mockOnSave).toHaveBeenCalledWith(
      'svc-1',
      'PROJ1',
      ['Open', 'In Progress'], // Initial + new
      ['TIC-123', 'NEW-1'] // Initial + new
    );
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(<ProjectConfigModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});