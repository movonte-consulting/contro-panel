import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { useAuth } from './useAuth';
import { API_ENDPOINTS } from '../config/api';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  lastLogin?: string;
  permissions?: UserPermissions;
}

interface UserPermissions {
  serviceManagement: boolean;
  automaticAIDisableRules: boolean;
  webhookConfiguration: boolean;
  ticketControl: boolean;
  aiEnabledProjects: boolean;
  remoteServerIntegration: boolean;
}

interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

interface UpdateUserData {
  username: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
}

interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createUser: (userData: CreateUserData) => Promise<boolean>;
  updateUser: (userId: number, userData: UpdateUserData) => Promise<boolean>;
  deleteUser: (userId: number) => Promise<boolean>;
  changeUserPassword: (userId: number, newPassword: string) => Promise<boolean>;
  updateUserPermissions: (userId: number, permissions: UserPermissions) => Promise<boolean>;
  getUserPermissions: (userId: number) => Promise<UserPermissions | null>;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { get, post, put, delete: deleteRequest } = useApi();
  const { isAuthenticated, isLoading: authLoading, user: currentUser } = useAuth();

  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated || currentUser?.role !== 'admin') {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Loading users...');
      const response = await get<{ users: User[] }>(API_ENDPOINTS.ADMIN_USERS);
      
      if (response.success && response.data) {
        setUsers(response.data.users || []);
        console.log('✅ Users loaded:', response.data.users?.length || 0);
      } else {
        setError(response.error || 'Error al obtener los usuarios');
        setUsers([]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error de conexión al obtener los usuarios');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentUser?.role]);

  const createUser = useCallback(async (userData: CreateUserData): Promise<boolean> => {
    try {
      setError(null);
      
      console.log('🔄 Creating user:', userData.username);
      const response = await post(API_ENDPOINTS.ADMIN_USERS, userData);
      
      if (response.success) {
        console.log('✅ User created:', userData.username);
        await fetchUsers(); // Refresh the list
        return true;
      } else {
        setError(response.error || 'Error al crear el usuario');
        return false;
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Error de conexión al crear el usuario');
      return false;
    }
  }, [post, fetchUsers]);

  const updateUser = useCallback(async (userId: number, userData: UpdateUserData): Promise<boolean> => {
    try {
      setError(null);
      
      console.log('🔄 Updating user:', userId);
      const response = await put(API_ENDPOINTS.ADMIN_USER_UPDATE(userId.toString()), userData);
      
      if (response.success) {
        console.log('✅ User updated:', userId);
        await fetchUsers(); // Refresh the list
        return true;
      } else {
        setError(response.error || 'Error al actualizar el usuario');
        return false;
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Error de conexión al actualizar el usuario');
      return false;
    }
  }, [put, fetchUsers]);

  const deleteUser = useCallback(async (userId: number): Promise<boolean> => {
    try {
      setError(null);
      
      console.log('🔄 Deleting user:', userId);
      const response = await deleteRequest(API_ENDPOINTS.ADMIN_USER_DELETE(userId.toString()));
      
      if (response.success) {
        console.log('✅ User deleted:', userId);
        await fetchUsers(); // Refresh the list
        return true;
      } else {
        setError(response.error || 'Error al eliminar el usuario');
        return false;
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Error de conexión al eliminar el usuario');
      return false;
    }
  }, [deleteRequest, fetchUsers]);

  const changeUserPassword = useCallback(async (userId: number, newPassword: string): Promise<boolean> => {
    try {
      setError(null);
      
      console.log('🔄 Changing password for user:', userId);
      const response = await put(API_ENDPOINTS.ADMIN_USER_PASSWORD(userId.toString()), {
        newPassword
      });
      
      if (response.success) {
        console.log('✅ Password changed for user:', userId);
        return true;
      } else {
        setError(response.error || 'Error al cambiar la contraseña');
        return false;
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Error de conexión al cambiar la contraseña');
      return false;
    }
  }, [put]);

  const updateUserPermissions = useCallback(async (userId: number, permissions: UserPermissions): Promise<boolean> => {
    try {
      setError(null);
      
      console.log('🔄 Updating permissions for user:', userId);
      const response = await put(API_ENDPOINTS.ADMIN_USER_PERMISSIONS(userId.toString()), {
        permissions
      });
      
      if (response.success) {
        console.log('✅ Permissions updated for user:', userId);
        await fetchUsers(); // Refresh the list to get updated permissions
        return true;
      } else {
        setError(response.error || 'Error al actualizar los permisos');
        return false;
      }
    } catch (err) {
      console.error('Error updating permissions:', err);
      setError('Error de conexión al actualizar los permisos');
      return false;
    }
  }, [put, fetchUsers]);

  const getUserPermissions = useCallback(async (userId: number): Promise<UserPermissions | null> => {
    try {
      setError(null);
      
      console.log('🔄 Getting permissions for user:', userId);
      const response = await get<{ permissions: UserPermissions }>(API_ENDPOINTS.ADMIN_USER_PERMISSIONS(userId.toString()));
      
      if (response.success && response.data) {
        console.log('✅ Permissions loaded for user:', userId);
        return response.data.permissions;
      } else {
        setError(response.error || 'Error al obtener los permisos');
        return null;
      }
    } catch (err) {
      console.error('Error getting permissions:', err);
      setError('Error de conexión al obtener los permisos');
      return null;
    }
  }, [get]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && currentUser?.role === 'admin') {
      fetchUsers();
    } else if (!authLoading && (!isAuthenticated || currentUser?.role !== 'admin')) {
      setUsers([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading, currentUser?.role, fetchUsers]);

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    changeUserPassword,
    updateUserPermissions,
    getUserPermissions
  };
};

