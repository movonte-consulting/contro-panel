import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChangePasswordModal from './ChangePasswordModal';
import { useApi } from '../../hooks/useApi';

// Mock de los hooks y configuración
vi.mock('../../hooks/useApi');
vi.mock('../../config/api', () => ({
  API_ENDPOINTS: {
    CHANGE_PASSWORD: '/change-password'
  }
}));

describe("Password modal tests", () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Configuramos el mock de useApi para que devuelva la función post mockeada
    (useApi as any).mockReturnValue({
      post: mockPost
    });
  });

  it('should not render the form when isOpen is false', () => {
    render(<ChangePasswordModal isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText('Cambiar Contraseña')).not.toBeInTheDocument();
  });

  it('should render the form when isOpen is true', () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);
    // Verificamos el título
    expect(screen.getByText('Cambiar Contraseña', { selector: 'h2' })).toBeInTheDocument();
    // Verificamos un campo clave
    expect(screen.getByLabelText(/Contraseña Actual/i)).toBeInTheDocument();
  });

  it('debería mostrar error de validación si los campos están vacíos', async () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);
    
    // Busamos el botón de submit (el que dice Cambiar Contraseña dentro del form)
    // Usamos getAll porque el título y el botón tienen el mismo texto, tomamos el botón.
    const submitBtn = screen.getByRole('button', { name: /^Cambiar Contraseña$/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Todos los campos son requeridos/i)).toBeInTheDocument();
  });

  it('debería validar que la nueva contraseña tenga al menos 6 caracteres', async () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.change(screen.getByLabelText(/Contraseña Actual/i), { target: { value: 'old123' } });
    fireEvent.change(screen.getByLabelText(/^Nueva Contraseña$/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/Confirmar Nueva Contraseña/i), { target: { value: '123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /^Cambiar Contraseña$/i }));

    expect(await screen.findByText(/La nueva contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
  });

  it('should validate that the new password match', async () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.change(screen.getByLabelText(/^Nueva Contraseña$/i), { target: { value: 'newpassword123' } });
    fireEvent.change(screen.getByLabelText(/Confirmar Nueva Contraseña/i), { target: { value: 'diferente123' } });
    // Llenamos la actual para evitar el error de "campos requeridos"
    fireEvent.change(screen.getByLabelText(/Contraseña Actual/i), { target: { value: 'old123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /^Cambiar Contraseña$/i }));

    expect(await screen.findByText(/Las contraseñas nuevas no coinciden/i)).toBeInTheDocument();
  });

  it('debería alternar la visibilidad de la contraseña al hacer clic en el ojo', () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);
    
    const input = screen.getByLabelText(/Contraseña Actual/i);
    
    // MEJORA: En lugar de usar índices (screen.getAllByRole('button')[1]), 
    // buscamos el botón que está en el mismo contenedor que el input.
    // Asumimos que el input y el botón están dentro de un div relativo.
    const container = input.closest('div'); 
    const toggleBtn = container?.querySelector('button');

    if (!toggleBtn) throw new Error("No se encontró el botón de visibilidad");

    // Estado inicial: password
    expect(input).toHaveAttribute('type', 'password');
    
    // Clic para mostrar
    fireEvent.click(toggleBtn);
    expect(input).toHaveAttribute('type', 'text');
    
    // Clic para ocultar nuevamente
    fireEvent.click(toggleBtn);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('debería llamar a la API y mostrar éxito cuando los datos son válidos', async () => {
    // Simulamos respuesta exitosa del backend
    mockPost.mockResolvedValue({ success: true });
    
    render(
      <ChangePasswordModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    );

    fireEvent.change(screen.getByLabelText(/Contraseña Actual/i), { target: { value: 'actual123' } });
    fireEvent.change(screen.getByLabelText(/^Nueva Contraseña$/i), { target: { value: 'nueva123' } });
    fireEvent.change(screen.getByLabelText(/Confirmar Nueva Contraseña/i), { target: { value: 'nueva123' } });

    fireEvent.click(screen.getByRole('button', { name: /^Cambiar Contraseña$/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        '/change-password', // Validamos la ruta exacta definida en el mock de config
        { currentPassword: 'actual123', newPassword: 'nueva123' },
        { requireAuth: true }
      );
    });

    expect(await screen.findByText('Contraseña actualizada exitosamente')).toBeInTheDocument();
    
    // Verificar que se llamó al callback onSuccess
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('debería limpiar el formulario y cerrar al hacer clic en cancelar', () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);
    
    const input = screen.getByLabelText(/Contraseña Actual/i);
    fireEvent.change(input, { target: { value: 'texto sucio' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    
    expect(mockOnClose).toHaveBeenCalled();
  });
});