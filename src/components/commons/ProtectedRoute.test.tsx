import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../../hooks/useAuth';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />,
}));

describe('ProtectedRoute', () => {
  const MockChild = () => <div>Protected Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when isLoading is true', () => {
    (useAuth as any).mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      user: null,
    });

    render(
      <ProtectedRoute>
        <MockChild />
      </ProtectedRoute>
    );

    expect(screen.getByText('Verificando autenticación...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: null,
    });

    render(
      <ProtectedRoute>
        <MockChild />
      </ProtectedRoute>
    );

    const redirect = screen.getByTestId('navigate');
    expect(redirect).toBeInTheDocument();
    expect(redirect).toHaveAttribute('data-to', '/login');
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to setup when authenticated but initial setup is false', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { isInitialSetupComplete: false },
    });

    render(
      <ProtectedRoute>
        <MockChild />
      </ProtectedRoute>
    );

    const redirect = screen.getByTestId('navigate');
    expect(redirect).toBeInTheDocument();
    expect(redirect).toHaveAttribute('data-to', '/setup');
  });

  it('redirects to setup when authenticated but initial setup is undefined', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { isInitialSetupComplete: undefined },
    });

    render(
      <ProtectedRoute>
        <MockChild />
      </ProtectedRoute>
    );

    const redirect = screen.getByTestId('navigate');
    expect(redirect).toBeInTheDocument();
    expect(redirect).toHaveAttribute('data-to', '/setup');
  });

  it('renders children when authenticated and setup is complete', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { isInitialSetupComplete: true },
    });

    render(
      <ProtectedRoute>
        <MockChild />
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });
});