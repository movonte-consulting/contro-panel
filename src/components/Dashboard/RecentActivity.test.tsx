import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecentActivity from './RecentActivity';

describe('RecentActivity Component', () => {

  beforeEach(() => {
    vi.useFakeTimers();
    const date = new Date(2026, 0, 5, 12, 0, 0);
    vi.setSystemTime(date);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe mostrar el estado vacío cuando no hay actividades', () => {
    render(<RecentActivity activities={[]} />);

    expect(screen.getByRole('heading', { name: /Recent Activity/i, level: 2 })).toBeInTheDocument();


    expect(screen.getByText(/No recent activity/i)).toBeInTheDocument();
  });

  it('debe renderizar una lista de actividades con el formato de tiempo correcto', () => {
    const now = new Date(2026, 0, 5, 12, 0, 0);
    const tenMinsAgo = new Date(2026, 0, 5, 11, 50, 0);
    const twoHoursAgo = new Date(2026, 0, 5, 10, 0, 0);

    const mockActivities = [
      { id: '1', text: 'Sesión iniciada', type: 'success' as const, timestamp: now },
      { id: '2', text: 'Error de conexión', type: 'error' as const, timestamp: tenMinsAgo },
      { id: '3', text: 'Actualización de sistema', type: 'info' as const, timestamp: twoHoursAgo },
    ];

    render(<RecentActivity activities={mockActivities} />);
    expect(screen.getByText('Sesión iniciada')).toBeInTheDocument();
    expect(screen.getByText('Error de conexión')).toBeInTheDocument();

    expect(screen.getByText('Just now')).toBeInTheDocument();
    expect(screen.getByText('10 minutes ago')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
  });

  it('debe aplicar las clases de color correctas según el tipo', () => {
    const activity = { id: '1', text: 'Test color', type: 'warning' as const, timestamp: new Date() };

    const { container } = render(<RecentActivity activities={[activity]} />);

    const iconContainer = container.querySelector('.bg-yellow-500');
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toHaveClass('text-white');
  });

  it('debe mostrar el botón "View all"', () => {
    render(<RecentActivity activities={[]} />);
    const button = screen.getByRole('button', { name: /View all/i });
    expect(button).toBeInTheDocument();
  });
});