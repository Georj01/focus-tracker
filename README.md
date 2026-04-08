# Pomodoro App

Pequeña aplicación Pomodoro creada con Create React App.

## Qué contiene

- `src/App.js` - Componente raíz de ejemplo (generado por CRA).
- `src/Pomodoro.js` - Lógica principal del temporizador Pomodoro y UI.
- `src/TaskList.js` - Componente que renderiza la lista de tareas (editar, marcar completadas, eliminar).
- `src/Stats.js` - Componente presentacional que muestra estadísticas básicas.
- `public/index.html` - HTML principal donde React monta la app.
- Archivos de configuración y soporte: `serviceWorkerRegistration.js`, `reportWebVitals.js`, `setupTests.js`.

> Los archivos contienen comentarios en español explicando su propósito y la lógica interna.


## Funciones  (estado)


- [x] 1) Editar tareas — implementado (`TaskList`, handlers en `Pomodoro.js`).
- [x] 2) Marcar tareas como completadas — implementado (`TaskList`, handlers en `Pomodoro.js`).
- [ ] 3) Historial de sesiones — pendiente (se puede implementar guardando en `localStorage` o backend).
- [ ] 4) Notificaciones personalizadas — pendiente (actualmente la app solicita permiso y envía notificaciones por defecto).
- [ ] 5) Sonidos personalizados — pendiente (la app usa un sonido por defecto; se puede añadir selector y carga local/remota).
- [ ] 6) Estadísticas avanzadas / gráficas — pendiente (se puede añadir con `chart.js` o `recharts`).
- [ ] 8) Modo enfoque — pendiente (UI/UX para ocultar distracciones y bloquear acciones).
- [ ] 10) Soporte multilingüe — pendiente (se puede integrar `react-i18next` con archivos de traducción).

## Cómo ejecutar (Windows PowerShell)

Abre una terminal en la carpeta `pomodoro-app` y ejecuta:

```powershell
npm install
npm start
```

## Desarrollo y pruebas

- Tests básicos generados por CRA en `src/App.test.js`.
- Para ejecutar tests:

```powershell
npm test
```

