import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ServiceValidationModal from './ServiceValidationModal';

describe('ServiceValidationModal Component', () => {
  const mockOnClose = vi.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    serviceName: 'Test Service',
    validationData: {
      websiteUrl: 'https://example.com',
      requestedDomain: 'example.com',
    },
  };

  it('should return null if isOpen is false', () => {
    const { container } = render(
      <ServiceValidationModal {...defaultProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should render correct header and title', () => {
    render(<ServiceValidationModal {...defaultProps} />);
    
    expect(screen.getByText('Servicio Creado Exitosamente')).toBeInTheDocument();
    expect(screen.getByText(/Test Service está pendiente de aprobación/)).toBeInTheDocument();
  });

  it('should render status card with pending information', () => {
    render(<ServiceValidationModal {...defaultProps} />);
    
    expect(screen.getByText('Estado: Pendiente de Aprobación')).toBeInTheDocument();
    expect(screen.getByText(/Tu servicio ha sido creado pero necesita ser aprobado/)).toBeInTheDocument();
  });

  it('should render service information correctly', () => {
    render(<ServiceValidationModal {...defaultProps} />);
    
    expect(screen.getByText('Nombre del Servicio')).toBeInTheDocument();
    expect(screen.getByText('Test Service')).toBeInTheDocument();

    expect(screen.getByText('Dominio Solicitado')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
    
    expect(screen.getByText('URL del Sitio Web')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });

  it('should handle missing requestedDomain gracefully', () => {
    render(
      <ServiceValidationModal 
        {...defaultProps} 
        validationData={{
          ...defaultProps.validationData,
          requestedDomain: '',
        }} 
      />
    );
    
    expect(screen.getByText('No especificado')).toBeInTheDocument();
  });

  it('should not render website URL section if websiteUrl is missing', () => {
    render(
      <ServiceValidationModal 
        {...defaultProps} 
        validationData={{
          ...defaultProps.validationData,
          websiteUrl: '',
        }} 
      />
    );
    
    expect(screen.queryByText('URL del Sitio Web')).not.toBeInTheDocument();
  });

  it('should render the process steps', () => {
    render(<ServiceValidationModal {...defaultProps} />);
    
    expect(screen.getByText('¿Qué sucede ahora?')).toBeInTheDocument();
    expect(screen.getByText('Solicitud Enviada')).toBeInTheDocument();
    expect(screen.getByText('Revisión por Administrador')).toBeInTheDocument();
    expect(screen.getByText('Aprobación')).toBeInTheDocument();
  });

  it('should call onClose when "Entendido" button is clicked', () => {
    render(<ServiceValidationModal {...defaultProps} />);
    
    const button = screen.getByText('Entendido');
    fireEvent.click(button);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
it('should call onClose when "X" (close icon) button is clicked', () => {
    mockOnClose.mockClear();
    render(<ServiceValidationModal {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    const closeButton = buttons.find((btn) => btn.querySelector('svg'));

    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton!);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});