// src/components/Greeting.test.jsx
import { render, screen } from '@testing-library/react';
import { expect, describe, it } from 'vitest';
import Greeting from './Greeting';

// Agrupa las pruebas para un componente o funcionalidad
describe('Greeting Component', () => {

  // Primera prueba: Verifica el renderizado por defecto
  it('debe renderizar "Hola, Mundo!" si no se pasa ninguna prop', () => {
    // 1. Renderiza el componente usando RTL
    render(<Greeting />);

    // 2. Busca un elemento con el texto específico (criterio de usuario)
    const headingElement = screen.getByText(/Hola, Mundo!/i);

    // 3. Afirma (Assert) que el elemento está en el documento
    expect(headingElement).toBeInTheDocument();
  });

  // Segunda prueba: Verifica el renderizado con una prop
  it('debe renderizar el nombre pasado como prop', () => {
    // 1. Renderiza con la prop 'name'
    render(<Greeting name="React" />);

    // 2. Busca el texto con el nombre pasado
    const headingElement = screen.getByText(/Hola, React!/i);

    // 3. Afirma
    expect(headingElement).toBeInTheDocument();
  });
});