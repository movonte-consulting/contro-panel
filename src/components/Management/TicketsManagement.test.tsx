import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TicketsManagement from './TicketsManagement'; // Adjust the import path as necessary
import { useTickets } from '../../hooks/useTickets';
import { useProjects } from '../../hooks/useProjects';

// Mock the hooks
vi.mock('../../hooks/useTickets');
vi.mock('../../hooks/useProjects');

describe('TicketsManagement Component', () => {
  const mockEnableTicket = vi.fn();
  const mockDisableTicket = vi.fn();
  const mockCheckTicketStatus = vi.fn();

  // Sample data
  const mockProjects = [
    { key: 'PROJ1', name: 'Project One' },
    { key: 'PROJ2', name: 'Project Two' },
  ];

  const mockDisabledTickets = [
    {
      issueKey: 'PROJ1-101',
      reason: 'Testing reason 1',
      disabledBy: 'User A',
      disabledAt: '2023-01-01T10:00:00Z',
    },
    {
      issueKey: 'PROJ2-202',
      reason: 'Testing reason 2',
      disabledBy: 'User B',
      disabledAt: '2023-01-02T11:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    (useTickets as any).mockReturnValue({
      disabledTickets: mockDisabledTickets,
      isLoading: false,
      error: null,
      disableTicket: mockDisableTicket,
      enableTicket: mockEnableTicket,
      checkTicketStatus: mockCheckTicketStatus,
    });

    (useProjects as any).mockReturnValue({
      projects: mockProjects,
    });
  });

  it('renders loading state correctly', () => {
    (useTickets as any).mockReturnValue({
      disabledTickets: [],
      isLoading: true,
      error: null,
    });

    render(<TicketsManagement />);
    expect(screen.getByText(/Loading disabled tickets.../i)).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    const errorMessage = 'Failed to fetch tickets';
    (useTickets as any).mockReturnValue({
      disabledTickets: [],
      isLoading: false,
      error: errorMessage,
    });

    render(<TicketsManagement />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

 it('renders disabled tickets grouped by project (default view)', () => {
    render(<TicketsManagement />);

    
    expect(screen.getByRole('heading', { name: 'PROJ1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'PROJ2' })).toBeInTheDocument();


    expect(screen.getByText('Project One')).toBeInTheDocument();
    expect(screen.getByText('Project Two')).toBeInTheDocument();
    const countBadges = screen.getAllByText('1');
    expect(countBadges.length).toBeGreaterThan(0);
});

 it('allows filtering by project', async () => {
    render(<TicketsManagement />);
    const cardTitle = screen.getByRole('heading', { name: 'PROJ1' });
    fireEvent.click(cardTitle);
   
    expect(screen.getByText('PROJ1-101')).toBeInTheDocument();

    expect(screen.queryByText('PROJ2-202')).not.toBeInTheDocument();
   
    const allProjectsBtns = screen.getAllByText(/All Projects/i);
    fireEvent.click(allProjectsBtns[0]); 

    expect(screen.getByRole('heading', { name: 'PROJ2' })).toBeInTheDocument();
});

  it('switches view mode to list all tickets', () => {
    render(<TicketsManagement />);

    const allTicketsViewBtn = screen.getByText(/All Tickets/i);
    fireEvent.click(allTicketsViewBtn);

    // Should see individual tickets directly
    expect(screen.getByText('PROJ1-101')).toBeInTheDocument();
    expect(screen.getByText('PROJ2-202')).toBeInTheDocument();
  });

  it('handles ticket status check', async () => {
    const mockStatus = {
      issueKey: 'PROJ1-101',
      isDisabled: true,
      ticketInfo: {
        reason: 'Some reason',
        disabledBy: 'Admin',
        disabledAt: '2023-01-01T10:00:00Z',
      },
    };
    mockCheckTicketStatus.mockResolvedValue(mockStatus);

    render(<TicketsManagement />);

    const input = screen.getByPlaceholderText(/e.g., TI-123/i);
    fireEvent.change(input, { target: { value: 'PROJ1-101' } });

    const searchBtn = screen.getByRole('button', { name: '' }); // The button has an icon, so might be empty text or aria-label dependent. The code shows only icon.
    // Alternatively, find button by the icon or parent div structure.
    // Given the structure, it's the button next to the input.
    const buttons = screen.getAllByRole('button');
    const checkBtn = buttons.find(btn => btn.querySelector('.lucide-search')); // searching by class if possible, or position

    // Better approach given the code:
    // The button has onClick={handleCheckStatus}
    // Let's assume it's the one in the "Check Ticket Status" section.
    // We can select it by the icon if we mock lucide-react or just rely on structure.
    // Simpler: fireEvent.click on the button next to input.
    // Or add aria-label to button in source code for better testing. 
    // For now, let's target the button inside the input group.
    
    // Using a more robust selector if possible, but here we can try getting by role button within that container
    const statusSection = screen.getByText('Check Ticket Status').closest('div');
    const checkStatusBtn = statusSection?.querySelector('button');
    
    if (checkStatusBtn) fireEvent.click(checkStatusBtn);

    await waitFor(() => {
      expect(mockCheckTicketStatus).toHaveBeenCalledWith('PROJ1-101');
    });

    expect(screen.getByText('Ticket: PROJ1-101')).toBeInTheDocument();
    expect(screen.getByText('DISABLED')).toBeInTheDocument();
  });

  it('enables a ticket from the list', async () => {
    mockEnableTicket.mockResolvedValue(true);
    render(<TicketsManagement />);

    // Switch to list view to easily find buttons
    fireEvent.click(screen.getByText(/All Tickets/i));

    const enableButtons = screen.getAllByText('Enable');
    fireEvent.click(enableButtons[0]); // Enable the first ticket

    expect(mockEnableTicket).toHaveBeenCalledWith('PROJ1-101');
    
    await waitFor(() => {
      expect(screen.getByText(/AI Assistant enabled for ticket PROJ1-101/i)).toBeInTheDocument();
    });
  });

  it('shows error message when enabling a ticket fails', async () => {
    mockEnableTicket.mockResolvedValue(false);
    render(<TicketsManagement />);

    fireEvent.click(screen.getByText(/All Tickets/i));
    const enableButtons = screen.getAllByText('Enable');
    fireEvent.click(enableButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Error enabling assistant/i)).toBeInTheDocument();
    });
  });
});