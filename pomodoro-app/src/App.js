/*
 Componente App (creado por Create React App)
 - Archivo presentacional simple que importa el logo y los estilos.
 - Muestra un encabezado con el logo, un mensaje y un enlace a la documentación de React.
 - No contiene lógica de estado compleja; sirve como punto de partida o contenedor.
*/

import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
