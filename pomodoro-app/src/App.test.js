/*
 Pruebas de App
 - Contiene tests básicos (por defecto un test de renderizado) para comprobar que el componente `App` se monta sin errores.
 - Útil como punto de partida para añadir pruebas más específicas del comportamiento de la app.
*/

import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
