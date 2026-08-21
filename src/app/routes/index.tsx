import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Login } from '../../features/login';
import { InitialSetup } from '../../pages/initial-setup';
import { Dashboard } from '../../pages/dashboard';
import { ProjectsPage } from '../../pages/projects';
import { UsersPage } from '../../pages/users';
import { ManagementPage } from '../../pages/management';
import { SettingsPage } from '../../pages/settings';
import { UserServicesPage } from '../../pages/user-services';
import { ChatPage } from '../../pages/chat';
import { ChatKitTestPage } from '../../pages/chatkit-test';
import { AdminServiceValidationsPage } from '../../pages/admin-service-validations';
import { Layout } from '../../widgets/layout';
import ProtectedRoute from './ProtectedRoute';
import { ErrorBoundary } from '../../shared/ui';
import { OrganizationsAdmin } from '../../pages/organizations';

// 404 Page Component
const NotFound = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <a
        href="/"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Back to home
      </a>
    </div>
  </div>
);

// Configuración de rutas
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/setup',
    element: <InitialSetup />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Layout>
          <Dashboard />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/projects',
    element: (
      <ProtectedRoute>
        <Layout>
          <ProjectsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/users',
    element: (
      <ProtectedRoute>
        <Layout>
          <UsersPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/management',
    element: (
      <ProtectedRoute>
        <Layout>
          <ManagementPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/organizations',
    element: (
      <ProtectedRoute>
        <Layout>
          <OrganizationsAdmin />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/settings',
    element: (
      <ProtectedRoute>
        <Layout>
          <SettingsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/my-services',
    element: (
      <ProtectedRoute>
        <Layout>
          <UserServicesPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/admin/service-validations',
    element: (
      <ProtectedRoute>
        <Layout>
          <AdminServiceValidationsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/chat',
    element: (
      <ProtectedRoute>
        <ErrorBoundary>
          <ChatPage />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/chatkit-test',
    element: (
      <ProtectedRoute>
        <Layout>
          <ErrorBoundary>
            <ChatKitTestPage />
          </ErrorBoundary>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

// Componente principal del router
const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
