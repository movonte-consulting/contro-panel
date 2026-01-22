import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useActivities } from './useActivities';

describe('useActivities Hook', () => {
  
  beforeEach(() => {
    // Opcional: Si quieres controlar el Date.now() para los IDs
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe inicializarse con un array de actividades vacío', () => {
    const { result } = renderHook(() => useActivities());
    expect(result.current.activities).toEqual([]);
  });

  it('debe agregar una nueva actividad correctamente', () => {
    const { result } = renderHook(() => useActivities());

    act(() => {
      result.current.addActivity('Actividad de prueba', 'success');
    });

    expect(result.current.activities).toHaveLength(1);
    expect(result.current.activities[0]).toMatchObject({
      text: 'Actividad de prueba',
      type: 'success',
    });
    // Verificamos que se generó un ID y un Timestamp
    expect(result.current.activities[0].id).toBeDefined();
    expect(result.current.activities[0].timestamp).toBeDefined();
  });

  it('debe agregar nuevas actividades al principio de la lista (LIFO)', () => {
    const { result } = renderHook(() => useActivities());

    // Agregamos la primera
    act(() => {
      result.current.addActivity('Primera', 'info');
    });

    // Avanzamos el tiempo para que el timestamp/id sea diferente
    vi.advanceTimersByTime(100);

    // Agregamos la segunda
    act(() => {
      result.current.addActivity('Segunda', 'error');
    });

    expect(result.current.activities).toHaveLength(2);
    // La "Segunda" debe estar en la posición 0
    expect(result.current.activities[0].text).toBe('Segunda');
    expect(result.current.activities[1].text).toBe('Primera');
  });

  it('debe limitar la lista a un máximo de 6 actividades', () => {
    const { result } = renderHook(() => useActivities());

    // Agregamos 7 actividades
    act(() => {
      for (let i = 1; i <= 7; i++) {
        result.current.addActivity(`Actividad ${i}`, 'info');
        // Avanzamos el tiempo un poco entre cada una para evitar IDs duplicados si el loop es muy rápido
        vi.advanceTimersByTime(10); 
      }
    });

    // Verificamos que solo haya 6
    expect(result.current.activities).toHaveLength(6);

    // Verificamos que la última agregada (la 7) esté primera
    expect(result.current.activities[0].text).toBe('Actividad 7');

    // Verificamos que la primera (Actividad 1) haya sido eliminada (ya que es la más vieja)
    const texts = result.current.activities.map(a => a.text);
    expect(texts).not.toContain('Actividad 1');
    expect(texts).toContain('Actividad 2'); // La 2 debería ser la última ahora
  });

  it('debe limpiar todas las actividades', () => {
    const { result } = renderHook(() => useActivities());

    // Llenamos datos
    act(() => {
      result.current.addActivity('Test', 'warning');
    });
    expect(result.current.activities).toHaveLength(1);

    // Limpiamos
    act(() => {
      result.current.clearActivities();
    });

    expect(result.current.activities).toEqual([]);
  });
});