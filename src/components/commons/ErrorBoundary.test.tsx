import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

const ProblematicComponent = () => {
  throw new Error('Test crash error');
};

describe('ErrorBoundary', () => {
  const originalLocation = window.location;
  const consoleErrorSpy = vi.spyOn(console, 'error');

  beforeEach(() => {
    consoleErrorSpy.mockImplementation(() => {});
    
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, reload: vi.fn(), href: '' },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Safe Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Safe Content')).toBeInTheDocument();
    expect(screen.queryByText('¡Oops! Algo salió mal')).not.toBeInTheDocument();
  });

  it('renders error UI when a child component throws an error', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText('Ha ocurrido un error inesperado. Por favor, intenta recargar la página o regresa al inicio.')).toBeInTheDocument();
  });

  it('displays error details in the details section', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Detalles del error')).toBeInTheDocument();
    const errors = screen.getAllByText(/Error: Test crash error/);

    expect(errors.length).toBeGreaterThan(0);

  });

  it('reloads the page when the reload button is clicked', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByText('Recargar Página');
    fireEvent.click(reloadButton);

    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });

  it('redirects to dashboard when go home button is clicked', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    const homeButton = screen.getByText('Ir al Dashboard');
    fireEvent.click(homeButton);

    expect(window.location.href).toBe('/dashboard');
  });
});