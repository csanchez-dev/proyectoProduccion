import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from './pages/Register';

describe('Botón de Registro de CONIITI', () => {
  it('realmente existe y tiene texto', () => {
    const { getByRole } = render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    // Busca un botón con type "submit"
    const submitButton = getByRole('button', { name: /Registrarse/i });
    expect(submitButton).toBeInTheDocument();
  });
});
