import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ServicesList from './ServicesList';
import type { UserService } from '../../../hooks/useUserServices';

describe('ServicesList Component', () => {
  const mockOnTestService = vi.fn();
  const mockOnConfigureProject = vi.fn();
  const mockOnViewEndpoints = vi.fn();
  const mockOnToggleService = vi.fn();
  const mockOnDeleteService = vi.fn();

  const mockServices: UserService[] = [
    {
      serviceId: 'svc-1',
      serviceName: 'Active Service',
      assistantId: 'asst-1',
      assistantName: 'Helper Bot',
      isActive: true,
      lastUpdated: new Date('2023-01-01').toISOString(),
      approvalStatus: 'approved',
      configuration: {}
    },
    {
      serviceId: 'svc-2',
      serviceName: 'Pending Service',
      assistantId: 'asst-2',
      assistantName: 'Waiter Bot',
      isActive: false,
      lastUpdated: new Date('2023-01-02').toISOString(),
      approvalStatus: 'pending',
      configuration: {}
    },
    {
      serviceId: 'svc-3',
      serviceName: 'Rejected Service',
      assistantId: 'asst-3',
      assistantName: 'Bad Bot',
      isActive: false,
      lastUpdated: new Date('2023-01-03').toISOString(),
      approvalStatus: 'rejected',
      configuration: {}
    },
    {
      serviceId: 'svc-4',
      serviceName: 'Approved Inactive',
      assistantId: 'asst-4',
      assistantName: 'Sleeper Bot',
      isActive: false,
      lastUpdated: new Date('2023-01-04').toISOString(),
      approvalStatus: 'approved',
      configuration: {}
    }
  ];

  const defaultProps = {
    services: mockServices,
    onTestService: mockOnTestService,
    onConfigureProject: mockOnConfigureProject,
    onViewEndpoints: mockOnViewEndpoints,
    onToggleService: mockOnToggleService,
    onDeleteService: mockOnDeleteService,
  };

  it('should render all services', () => {
    render(<ServicesList {...defaultProps} />);
    expect(screen.getByText('Active Service')).toBeInTheDocument();
    expect(screen.getByText('Pending Service')).toBeInTheDocument();
    expect(screen.getByText('Rejected Service')).toBeInTheDocument();
    expect(screen.getByText('Approved Inactive')).toBeInTheDocument();
  });

  it('should render correct status badges', () => {
    render(<ServicesList {...defaultProps} />);
    
    // svc-1: Approved & Active
    const activeBadge = screen.getByText('Active');
    expect(activeBadge).toHaveClass('bg-green-100');

    // svc-2: Pending
    const pendingBadge = screen.getByText('Pending Approval');
    expect(pendingBadge).toHaveClass('bg-yellow-100');

    // svc-3: Rejected
    const rejectedBadge = screen.getByText('Rejected');
    expect(rejectedBadge).toHaveClass('bg-red-100');

    // svc-4: Approved & Inactive
    const approvedInactiveBadge = screen.getByText('Approved (Inactive)');
    expect(approvedInactiveBadge).toHaveClass('bg-blue-100');
  });

  it('should display service details correctly', () => {
    render(<ServicesList {...defaultProps} />);
    
    expect(screen.getByText('ID: svc-1')).toBeInTheDocument();
    expect(screen.getByText('Helper Bot')).toBeInTheDocument();
    // Check date formatting (local date string varies, checking partial match)
    // We mock the date in props, so we just check if it rendered the element structure
    expect(screen.getAllByText(/Updated:/)).toHaveLength(4);
  });

  it('should render action buttons ONLY for approved services', () => {
    render(<ServicesList {...defaultProps} />);
    
    // svc-1 and svc-4 are approved. They should have buttons.
    // svc-2 and svc-3 are not. They should have the alert message.

    // "Test" buttons
    const testButtons = screen.getAllByTitle('Test service');
    expect(testButtons).toHaveLength(2); // Only for svc-1 and svc-4

    // Alert messages for non-approved
    expect(screen.getByText('Waiting for admin approval')).toBeInTheDocument();
    expect(screen.getByText('Service has been rejected')).toBeInTheDocument();
  });

  it('should call onTestService when Test button is clicked', () => {
    render(<ServicesList {...defaultProps} />);
    
    // Click test on the first service (svc-1)
    const testButtons = screen.getAllByTitle('Test service');
    fireEvent.click(testButtons[0]);
    
    expect(mockOnTestService).toHaveBeenCalledWith('svc-1', 'Active Service');
  });

  it('should call onConfigureProject when Settings button is clicked', () => {
    render(<ServicesList {...defaultProps} />);
    
    const settingsButtons = screen.getAllByTitle('Configure Jira project');
    fireEvent.click(settingsButtons[0]);
    
    expect(mockOnConfigureProject).toHaveBeenCalledWith(mockServices[0]);
  });

  it('should call onViewEndpoints when CheckCircle button is clicked', () => {
    render(<ServicesList {...defaultProps} />);
    
    const endpointButtons = screen.getAllByTitle('View endpoints and protected token');
    fireEvent.click(endpointButtons[0]);
    
    expect(mockOnViewEndpoints).toHaveBeenCalledWith(mockServices[0]);
  });

    it('should call onToggleService with correct params when Power button is clicked', () => {
        render(<ServicesList {...defaultProps} />);
        
        // svc-1 is active -> Title is 'Desactivar servicio'
        const deactivateBtn = screen.getByTitle('Desactivar servicio');
        fireEvent.click(deactivateBtn);
        expect(mockOnToggleService).toHaveBeenCalledWith('svc-1', true);

        // svc-4 is inactive -> Title is 'Activar servicio'
        const activateBtn = screen.getByTitle('Activar servicio');
        fireEvent.click(activateBtn);
        expect(mockOnToggleService).toHaveBeenCalledWith('svc-4', false);
    });

  it('should render correct Power button style based on active state', () => {
    render(<ServicesList {...defaultProps} />);
    
    // svc-1 (Active) -> Red button (to deactivate)
    const deactivateBtn = screen.getByTitle('Desactivar servicio');
    expect(deactivateBtn).toHaveClass('bg-red-600');

    // svc-4 (Inactive) -> Green button (to activate)
    const activateBtn = screen.getByTitle('Activar servicio');
    expect(activateBtn).toHaveClass('bg-green-600');
  });

  it('should call onDeleteService when Trash button is clicked', () => {
    render(<ServicesList {...defaultProps} />);
    
    const deleteButtons = screen.getAllByTitle('Delete service');
    fireEvent.click(deleteButtons[0]);
    
    expect(mockOnDeleteService).toHaveBeenCalledWith('svc-1', 'Active Service');
  });
});