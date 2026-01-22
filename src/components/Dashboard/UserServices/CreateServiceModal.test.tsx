import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateServiceModal from './CreateServiceModal';

describe('CreateServiceModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnCreate = vi.fn();
  
  const mockAssistants = [
    { id: 'asst_1', name: 'Helpful Bot' },
    { id: 'asst_2', name: 'Code Bot' },
  ];

  const mockProjects = [
    { id: 'proj_1', key: 'SUP', name: 'Support' },
    { id: 'proj_2', key: 'DEV', name: 'Development' },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onCreate: mockOnCreate,
    assistants: mockAssistants,
    projects: mockProjects,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(<CreateServiceModal {...defaultProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render all form fields when open', () => {
    render(<CreateServiceModal {...defaultProps} />);

    expect(screen.getByText('Create New Service')).toBeInTheDocument();
    expect(screen.getByLabelText('Service ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Service Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Assistant')).toBeInTheDocument();
    expect(screen.getByLabelText('Jira Project')).toBeInTheDocument();
    expect(screen.getByText('Website Configuration')).toBeInTheDocument();
    expect(screen.getByLabelText('Website URL *')).toBeInTheDocument();
    expect(screen.getByLabelText('Domain for CORS *')).toBeInTheDocument();
    expect(screen.getByText('Create Service')).toBeInTheDocument();
  });

  it('should update text inputs correctly', () => {
    render(<CreateServiceModal {...defaultProps} />);

    const idInput = screen.getByLabelText('Service ID');
    const nameInput = screen.getByLabelText('Service Name');

    fireEvent.change(idInput, { target: { value: 'test-service-id' } });
    fireEvent.change(nameInput, { target: { value: 'Test Name' } });

    expect(idInput).toHaveValue('test-service-id');
    expect(nameInput).toHaveValue('Test Name');
  });

  it('should populate assistant name when an assistant is selected', async () => {
    render(<CreateServiceModal {...defaultProps} />);

    const assistantSelect = screen.getByLabelText('Assistant');
    fireEvent.change(assistantSelect, { target: { value: 'asst_1' } });

    const idInput = screen.getByLabelText('Service ID');
    const nameInput = screen.getByLabelText('Service Name');
    const projectSelect = screen.getByLabelText('Jira Project');
    const urlInput = screen.getByLabelText('Website URL *');
    const domainInput = screen.getByLabelText('Domain for CORS *');

    fireEvent.change(idInput, { target: { value: 'id' } });
    fireEvent.change(nameInput, { target: { value: 'name' } });
    fireEvent.change(projectSelect, { target: { value: 'SUP' } });
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    fireEvent.change(domainInput, { target: { value: 'example.com' } });

    const submitButton = screen.getByText('Create Service');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          assistantId: 'asst_1',
          assistantName: 'Helpful Bot'
        }),
        expect.anything()
      );
    });
  });

  it('should automatically parse domain from URL in CORS input', () => {
    render(<CreateServiceModal {...defaultProps} />);

    const domainInput = screen.getByLabelText('Domain for CORS *');

    fireEvent.change(domainInput, { target: { value: 'https://www.example.com/path' } });
    expect(domainInput).toHaveValue('example.com');

    fireEvent.change(domainInput, { target: { value: 'http://sub.domain.com' } });
    expect(domainInput).toHaveValue('sub.domain.com');

    fireEvent.change(domainInput, { target: { value: 'simple-domain.com' } });
    expect(domainInput).toHaveValue('simple-domain.com');
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(<CreateServiceModal {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when X button is clicked', () => {
    render(<CreateServiceModal {...defaultProps} />);
    
    // Finding the close button by looking for the icon wrapper or button element
    // Since there is no aria-label, we find the button containing the XCircle icon logic
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons[0]; // The X button is the first button in the DOM order
    
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should submit form with correct data', async () => {
    render(<CreateServiceModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Service ID'), { target: { value: 'svc-123' } });
    fireEvent.change(screen.getByLabelText('Service Name'), { target: { value: 'My Service' } });
    fireEvent.change(screen.getByLabelText('Assistant'), { target: { value: 'asst_2' } });
    fireEvent.change(screen.getByLabelText('Jira Project'), { target: { value: 'DEV' } });
    fireEvent.change(screen.getByLabelText('Website URL *'), { target: { value: 'https://site.com' } });
    fireEvent.change(screen.getByLabelText('Domain for CORS *'), { target: { value: 'site.com' } });

    fireEvent.click(screen.getByText('Create Service'));

    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith(
        {
          serviceId: 'svc-123',
          serviceName: 'My Service',
          assistantId: 'asst_2',
          assistantName: 'Code Bot',
          projectKey: 'DEV',
        },
        {
          websiteUrl: 'https://site.com',
          requestedDomain: 'site.com',
        }
      );
    });
  });
it('should show loading state during submission', async () => {
    // Delay resolution to ensure "Creating..." appears in DOM
    mockOnCreate.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 500)));

    render(<CreateServiceModal {...defaultProps} />);

    const idInput = screen.getByLabelText('Service ID');
    const nameInput = screen.getByLabelText('Service Name');
    const assistantSelect = screen.getByLabelText('Assistant');
    const projectSelect = screen.getByLabelText('Jira Project');
    const urlInput = screen.getByLabelText('Website URL *');
    const domainInput = screen.getByLabelText('Domain for CORS *');

    fireEvent.change(idInput, { target: { value: '1' } });
    fireEvent.change(nameInput, { target: { value: '1' } });
    fireEvent.change(assistantSelect, { target: { value: 'asst_1' } });
    fireEvent.change(projectSelect, { target: { value: 'SUP' } });
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    fireEvent.change(domainInput, { target: { value: 'example.com' } });

    // Verify state update before submitting to ensure handleSubmit has latest data
    expect(idInput).toHaveValue('1');
    expect(assistantSelect).toHaveValue('asst_1');

    const submitButton = screen.getByRole('button', { name: /Create Service/i });
    fireEvent.click(submitButton);

    // Use findByRole which is more robust for buttons with icons + text
    const loadingButton = await screen.findByRole('button', { name: /Creating/i });
    expect(loadingButton).toBeInTheDocument();
    expect(loadingButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create Service/i })).toBeEnabled();
    });
  });

  it('should handle submission errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockOnCreate.mockRejectedValue(new Error('Submission failed'));

    render(<CreateServiceModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Service ID'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Service Name'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Assistant'), { target: { value: 'asst_1' } });
    fireEvent.change(screen.getByLabelText('Jira Project'), { target: { value: 'SUP' } });
    fireEvent.change(screen.getByLabelText('Website URL *'), { target: { value: 'https://example.com' } });
    fireEvent.change(screen.getByLabelText('Domain for CORS *'), { target: { value: 'example.com' } });

    // Ensure state is updated
    expect(screen.getByLabelText('Service ID')).toHaveValue('1');

    const submitButton = screen.getByRole('button', { name: /Create Service/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error creating service:', expect.any(Error));
    });
    
    // Should return to normal state
    expect(screen.getByRole('button', { name: /Create Service/i })).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('should not submit if required fields are empty', () => {
    render(<CreateServiceModal {...defaultProps} />);
    
    // Only fill ID
    fireEvent.change(screen.getByLabelText('Service ID'), { target: { value: '123' } });
    
    const form = screen.getByRole('button', { name: /Create Service/i }).closest('form');
    
    // We can verify HTML5 validation prevents submission or check that onCreate wasn't called
    fireEvent.submit(form!);
    
    expect(mockOnCreate).not.toHaveBeenCalled();
  });
});