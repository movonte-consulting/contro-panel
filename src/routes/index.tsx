import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from '../components/Login';
import Dashboard from '../components/Dashboard';
import ProjectsPage from '../components/ProjectsPage';
import UsersPage from '../components/UsersPage';
import ManagementPage from '../components/ManagementPage';
import SettingsPage from '../components/SettingsPage';
import UserServicesPage from '../components/UserServicesPage';
import UserInstancesPage from '../components/UserInstancesPage';
import InitialSetupPage from '../components/InitialSetupPage';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';

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
    path: '/dashboard/my-instances',
    element: (
      <ProtectedRoute>
        <Layout>
          <UserInstancesPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/initial-setup',
    element: (
      <ProtectedRoute>
        <InitialSetupPage />
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
