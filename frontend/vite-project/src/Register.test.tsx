import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from './pages/Register';

describe('Botón de Registro de CONIITI', () => {
  it('realmente existe y tiene texto', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    // Busca un botón con type "submit"
    const submitButton = screen.getByRole('button', { name: /Registrarse/i });
    expect(submitButton).toBeInTheDocument();
  });
});
