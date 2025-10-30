import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  Settings,
  FileText,
  LogOut,
  Menu,
  X,
  FolderOpen,
  Bot,
  MessageCircle,
  TestTube,
  Shield
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useProfile } from '../hooks/useProfile';
import { API_ENDPOINTS } from '../config/api';
import { ActivityProvider } from '../contexts/ActivityContext';
import AuthDebug from './AuthDebug';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, updateUser } = useAuth();
  const { profile, refetch } = useProfile();
  const { post, put } = useApi();
  const navigate = useNavigate();

  const handleImageToBase64Optimized = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => {
        img.onload = () => {
          try {
            const maxSize = 256; // px
            let { width, height } = img;
            const scale = Math.min(1, maxSize / Math.max(width, height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(width * scale);
            canvas.height = Math.round(height * scale);
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas not supported'));
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png', 0.85);
            resolve(dataUrl);
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleLogout = async () => {
    try {
      // Llamar al endpoint de logout del servidor
      await post(API_ENDPOINTS.LOGOUT, {}, { requireAuth: true });
    } catch (error) {
      console.error('Error during logout:', error);
      // Continuar con el logout local aunque falle el servidor
    } finally {
      // Siempre hacer logout local
      logout();
      navigate('/login');
    }
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: MessageCircle, label: 'AI Chat', path: '/dashboard/chat' },
    ...(user?.role === 'admin' ? [
      { icon: TestTube, label: 'ChatKit Test', path: '/dashboard/chatkit-test' },
      { icon: Users, label: 'Users', path: '/dashboard/users' },
      { icon: FolderOpen, label: 'Projects', path: '/dashboard/projects' },
      { icon: Shield, label: 'Service Validations', path: '/dashboard/admin/service-validations' },
      { icon: FolderOpen, label: 'Organizations', path: '/dashboard/organizations' },
    ] : []),
    { icon: FileText, label: 'Management', path: '/dashboard/management' },
    { icon: Bot, label: 'My Services', path: '/dashboard/my-services' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <ActivityProvider>
      <div className="h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <img 
              src="/favicons/favicon-32x32.png" 
              alt="Movonte Logo" 
              className="w-10 h-10 rounded-lg"
            />
            <span className="text-xl font-bold text-white">Movonte</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info Section */}
        <div className="px-6 py-4 border-b border-gray-700 flex-shrink-0">
          {/* Organization logo below Movonte logo */}
          <div className="mb-3">
            { (profile as any)?.organizationLogo || (user as any)?.organizationLogo ? (
              <div className="flex items-center space-x-3">
                <img
                  src={(profile as any)?.organizationLogo || (user as any)?.organizationLogo}
                  alt="Organization Logo"
                  className="w-10 h-10 rounded bg-white object-contain"
                />
                <span className="text-gray-300 text-sm">
                  {(() => {
                    const raw = (profile as any)?.jiraUrl || (user as any)?.jiraUrl;
                    if (!raw) return 'Organization';
                    try {
                      const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
                      return u.hostname;
                    } catch {
                      return raw;
                    }
                  })()}
                </span>
              </div>
            ) : (
              <div>
                <label className="block text-xs text-gray-400 mb-1">Add Organization Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    if (!file.type.startsWith('image/')) return alert('Selecciona una imagen válida');
                    try {
                      const base64 = await handleImageToBase64Optimized(file);
                      const resp = await put(API_ENDPOINTS.PROFILE, { organizationLogo: base64 });
                      if (resp.success) {
                        updateUser({ organizationLogo: base64 } as any);
                        await refetch();
                      }
                    } catch (err) {
                      console.error('Error subiendo logo:', err);
                      alert('No se pudo guardar el logo. Intenta de nuevo.');
                    }
                  }}
                  className="w-full text-xs text-gray-300 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {user?.username || 'Usuario'}
              </p>
              {user?.role && (
                <p className="text-xs text-gray-400 truncate">{user.role}</p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = window.location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer with Logout */}
        <div className="flex-shrink-0 border-t border-gray-700 p-3">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-400 rounded-lg hover:bg-red-900 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Welcome, {profile?.username || user?.username || 'User'}
                </div>
                {(profile?.role || user?.role) && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {profile?.role || user?.role}
                  </span>
                )}
              </div>
          </div>
        </div>

            {/* Page content */}
            <main className="flex-1 p-3 sm:p-4 lg:p-6 xl:p-8 overflow-y-auto">
              {children}
            </main>
          </div>
          
          {/* Debug component - solo en desarrollo */}
          <AuthDebug />
        </div>
      </ActivityProvider>
    );
  };

  export default Layout;
