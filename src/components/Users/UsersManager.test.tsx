import { render, screen, fireEvent, act, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UsersManagement from './UsersManagement';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';

// Mock de los hooks
vi.mock('../../hooks/useUsers');
vi.mock('../../hooks/useAuth');

describe('UsersManagement Component', () => {
  const mockCreateUser = vi.fn();
  const mockUpdateUser = vi.fn();
  const mockDeleteUser = vi.fn();
  const mockChangePassword = vi.fn();
  const mockGetUserPermissions = vi.fn();
  const mockUpdatePermissions = vi.fn();

  const mockUsers = [
    { id: 1, username: 'admin_user', email: 'admin@test.com', role: 'admin', isActive: true, lastLogin: '2023-10-01' },
    { id: 2, username: 'normal_user', email: 'user@test.com', role: 'user', isActive: true, lastLogin: null }
  ];

  const mockPermissions = {
    serviceManagement: true,
    automaticAIDisableRules: false,
    webhookConfiguration: true,
    ticketControl: false,
    aiEnabledProjects: false,
    remoteServerIntegration: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.alert y confirm
    vi.stubGlobal('alert', vi.fn());
    vi.stubGlobal('confirm', vi.fn(() => true));

    (useAuth as any).mockReturnValue({ user: { id: 1, role: 'admin' } });

    (useUsers as any).mockReturnValue({
      users: mockUsers,
      isLoading: false,
      error: null,
      createUser: mockCreateUser,
      updateUser: mockUpdateUser,
      deleteUser: mockDeleteUser,
      changeUserPassword: mockChangePassword,
      getUserPermissions: mockGetUserPermissions,
      updateUserPermissions: mockUpdatePermissions,
    });
  });

  // --- RENDERING & STATES ---

  it('debe mostrar el estado de carga', () => {
    (useUsers as any).mockReturnValue({ ...useUsers(), isLoading: true, users: [] });
    render(<UsersManagement />);
    expect(screen.getByText(/Loading users.../i)).toBeInTheDocument();
  });

  it('debe mostrar mensaje de error si existe', () => {
    (useUsers as any).mockReturnValue({ ...useUsers(), error: 'Failed to fetch' });
    render(<UsersManagement />);
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
  });

  it('debe denegar el acceso si el usuario no es admin', () => {
    (useAuth as any).mockReturnValue({ user: { id: 2, role: 'user' } });
    render(<UsersManagement />);
    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
  });

  // --- CREATE USER ---

  it('debe validar campos vacíos al crear usuario', async () => {
    render(<UsersManagement />);
    
    // Abrir modal
    fireEvent.click(screen.getByText(/New User/i));
    
    // SOLUCIÓN AL ERROR DEL ALERT:
    // En lugar de clickear el botón (que puede ser bloqueado por 'required'),
    // buscamos el formulario y forzamos el submit.
    // Esto asegura que se ejecute handleCreateUser y se dispare el alert de validación manual.
    const form = screen.getByRole('button', { name: /Create User/i }).closest('form');
    
    await act(async () => {
      if (form) fireEvent.submit(form);
    });

    // Ahora sí debería haberse llamado al alert
    expect(mockCreateUser).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Please fill in all required fields');
  });

  it('debe crear un usuario exitosamente', async () => {
    mockCreateUser.mockResolvedValue(true);
    render(<UsersManagement />);
    
    fireEvent.click(screen.getByText(/New User/i));
    
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'new@test.com' } });
    
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: '123456' } });

    await act(async () => {
      // Aquí podemos usar click normal porque los campos 'required' están llenos
      fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
    });

    expect(mockCreateUser).toHaveBeenCalledWith({
      username: 'newuser',
      email: 'new@test.com',
      password: '123456',
      role: 'user'
    });
  });

  // --- EDIT USER ---

  it('debe abrir el modal de edición, llenar datos y actualizar', async () => {
    mockUpdateUser.mockResolvedValue(true);
    render(<UsersManagement />);

    const editButtons = screen.getAllByTitle('Edit User');
    fireEvent.click(editButtons[1]); // Editamos al usuario índice 1

    const usernameInput = screen.getByDisplayValue('normal_user');
    const emailInput = screen.getByDisplayValue('user@test.com');

    fireEvent.change(usernameInput, { target: { value: 'edited_user' } });
    fireEvent.change(emailInput, { target: { value: 'edited@test.com' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Update User' }));
    });

    expect(mockUpdateUser).toHaveBeenCalledWith(2, {
      username: 'edited_user',
      email: 'edited@test.com',
      role: 'user',
      isActive: true
    });
  });

  // --- DELETE USER ---

  it('debe eliminar un usuario tras confirmar', async () => {
    render(<UsersManagement />);
    const deleteButton = screen.getByTitle('Delete User');
    
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(mockDeleteUser).toHaveBeenCalledWith(2);
  });

  // --- CHANGE PASSWORD ---

  it('debe validar coincidencia y longitud de password', async () => {
    render(<UsersManagement />);

    const passwordButtons = screen.getAllByTitle('Change Password');
    fireEvent.click(passwordButtons[1]);

    const inputs = document.querySelectorAll('input[type="password"]');
    const newPass = inputs[0];
    const confirmPass = inputs[1];

    // Caso 1: Passwords no coinciden
    fireEvent.change(newPass, { target: { value: '123456' } });
    fireEvent.change(confirmPass, { target: { value: '654321' } });

    await act(async () => {
      // SOLUCIÓN AL ERROR DE MULTIPLES ELEMENTOS:
      // Usamos getByText con selector 'button'. Esto busca solo el botón que TIENE ese texto visible.
      // Ignora los botones con 'title="Change Password"' (los iconos de la tabla).
      fireEvent.click(screen.getByText('Change Password', { selector: 'button' }));
    });
    expect(window.alert).toHaveBeenCalledWith('Passwords do not match');

    // Caso 2: Password muy corto
    fireEvent.change(newPass, { target: { value: '123' } });
    fireEvent.change(confirmPass, { target: { value: '123' } });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Change Password', { selector: 'button' }));
    });
    expect(window.alert).toHaveBeenCalledWith('Password must be at least 6 characters long');
    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it('debe cambiar el password exitosamente', async () => {
    mockChangePassword.mockResolvedValue(true);
    render(<UsersManagement />);

    const passwordButtons = screen.getAllByTitle('Change Password');
    fireEvent.click(passwordButtons[1]);

    const inputs = document.querySelectorAll('input[type="password"]');
    fireEvent.change(inputs[0], { target: { value: 'newsecurepass' } });
    fireEvent.change(inputs[1], { target: { value: 'newsecurepass' } });

    await act(async () => {
      // SOLUCIÓN: Usamos getByText con selector 'button' nuevamente
      fireEvent.click(screen.getByText('Change Password', { selector: 'button' }));
    });

    expect(mockChangePassword).toHaveBeenCalledWith(2, 'newsecurepass');
  });

  // --- PERMISSIONS ---

  it('debe cargar y actualizar permisos', async () => {
    mockGetUserPermissions.mockResolvedValue(mockPermissions);
    mockUpdatePermissions.mockResolvedValue(true);
    render(<UsersManagement />);

    const shieldButton = screen.getByTitle('Manage Permissions');
    
    await act(async () => {
      fireEvent.click(shieldButton);
    });

    expect(mockGetUserPermissions).toHaveBeenCalledWith(2);

    const serviceCheckbox = screen.getByLabelText(/Service Management/i);
    fireEvent.click(serviceCheckbox);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Update Permissions' }));
    });

    expect(mockUpdatePermissions).toHaveBeenCalledWith(2, expect.objectContaining({
      serviceManagement: false,
      webhookConfiguration: true
    }));
  });
});