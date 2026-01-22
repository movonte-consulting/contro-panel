import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatModal from './ChatModal';

describe('ChatModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnChat = vi.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    serviceId: 'service-123',
    serviceName: 'Test Service',
    onChat: mockOnChat,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(<ChatModal {...defaultProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render correct header and initial state', () => {
    render(<ChatModal {...defaultProps} />);
    expect(screen.getByText('Test Service: Test Service')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('should update input value when typing', () => {
    render(<ChatModal {...defaultProps} />);
    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(input).toHaveValue('Hello');
  });

  it('should disable send button when input is empty', () => {
    render(<ChatModal {...defaultProps} />);
    const button = screen.getByText('Send');
    expect(button).toBeDisabled();
  });

  it('should handle sending a message successfully', async () => {
    mockOnChat.mockResolvedValueOnce({
      success: true,
      response: 'Hello from AI',
      threadId: 'thread-1',
    });

    render(<ChatModal {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    const button = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'Hello World' } });
    fireEvent.click(button);

    // Check user message appears immediately
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    // Check loading state (spinner should appear)
    expect(button).toBeDisabled();

    await waitFor(() => {
      expect(mockOnChat).toHaveBeenCalledWith('service-123', 'Hello World', undefined);
      expect(screen.getByText('Hello from AI')).toBeInTheDocument();
    });

    // Check input is cleared
    expect(input).toHaveValue('');
  });

  it('should handle subsequent messages with threadId', async () => {
    // First interaction to set threadId
    mockOnChat.mockResolvedValueOnce({
      success: true,
      response: 'First response',
      threadId: 'thread-123',
    });

    render(<ChatModal {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    const button = screen.getByText('Send');

    // First message
    fireEvent.change(input, { target: { value: 'First' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('First response')).toBeInTheDocument();
    });

    // Second message
    mockOnChat.mockResolvedValueOnce({
      success: true,
      response: 'Second response',
    });

    fireEvent.change(input, { target: { value: 'Second' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnChat).toHaveBeenLastCalledWith('service-123', 'Second', 'thread-123');
      expect(screen.getByText('Second response')).toBeInTheDocument();
    });
  });

  it('should handle API failure (success: false)', async () => {
    mockOnChat.mockResolvedValueOnce({
      success: false,
    });

    render(<ChatModal {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Fail test' } });
    fireEvent.click(screen.getByText('Send'));

    await waitFor(() => {
      expect(screen.getByText('Error: No valid response received from the service')).toBeInTheDocument();
    });
  });

  it('should handle network/unexpected errors', async () => {
    mockOnChat.mockRejectedValueOnce(new Error('Network Error'));

    render(<ChatModal {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Crash test' } });
    fireEvent.click(screen.getByText('Send'));

    await waitFor(() => {
      expect(screen.getByText('Sorry, there was an error processing your message.')).toBeInTheDocument();
    });
  });

  it('should close modal when close button is clicked', () => {
    render(<ChatModal {...defaultProps} />);
    
    // Find the close button (the one with the XCircle icon)
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons[0]; // Assuming it's the first button in DOM order
    
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});