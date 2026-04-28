/*
 Punto de entrada de la aplicación React
 - Crea la raíz React y renderiza el componente `App` dentro del elemento DOM con id 'root'.
 - Registra/Desregistra el service worker según la configuración (por defecto `unregister`).
 - Inicializa reportWebVitals para métricas de rendimiento opcionales.
 - Configura i18n para soporte multilingüe.
*/


import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Pomodoro from './Pomodoro';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import './i18n/i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Pomodoro />
  </React.StrictMode>
);

// Register service worker for offline functionality
serviceWorkerRegistration.register();

reportWebVitals();