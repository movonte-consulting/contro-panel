import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from '../pages/Login';
import InitialSetup from '../pages/InitialSetup';
import Dashboard from '../pages/Dashboard';
import ProjectsPage from '../pages/ProjectsPage';
import UsersPage from '../pages/UsersPage';
import ManagementPage from '../pages/ManagementPage';
import SettingsPage from '../pages/SettingsPage';
import UserServicesPage from '../pages/UserServicesPage';
import { AdminServiceValidationsPage } from '../pages/AdminServiceValidationsPage';
import Layout from '../layout/Layout';
import ProtectedRoute from '../components/commons/ProtectedRoute';
import OrganizationsAdmin from '../pages/OrganizationsAdmin';

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
    element: <LoginPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
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
    path: '*',
    element: <NotFound />,
  },
]);

// Componente principal del router
const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
