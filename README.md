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

## Funcionalidad implementada (resumen real)

- Temporizador Pomodoro con modos: `work`, `shortBreak`, `longBreak`.
- Controles de temporizador: iniciar, pausar y reiniciar.
- Tiempos personalizables desde la UI (en minutos).
- Tareas: añadir, editar, eliminar y marcar como completadas (persistencia en memoria - sesión actual).
- Estadísticas básicas mostradas en `Stats` (trabajo/descanso/ciclos) — cálculo simple en memoria.
- Toggle de modo oscuro (UI básica).
- Comentarios explicativos añadidos en los archivos principales.


## Funciones solicitadas (estado)

Checklist de las funciones que pediste integrar:

- [x] 1) Editar tareas — implementado (`TaskList`, handlers en `Pomodoro.js`).
- [x] 2) Marcar tareas como completadas — implementado (`TaskList`, handlers en `Pomodoro.js`).
- [ ] 3) Historial de sesiones — pendiente (se puede implementar guardando en `localStorage` o backend).
- [ ] 4) Notificaciones personalizadas — pendiente (actualmente la app solicita permiso y envía notificaciones por defecto).
- [ ] 5) Sonidos personalizados — pendiente (la app usa un sonido por defecto; se puede añadir selector y carga local/remota).
- [ ] 6) Estadísticas avanzadas / gráficas — pendiente (se puede añadir con `chart.js` o `recharts`).
- [ ] 8) Modo enfoque — pendiente (UI/UX para ocultar distracciones y bloquear acciones).
- [ ] 10) Soporte multilingüe — pendiente (se puede integrar `react-i18next` con archivos de traducción).

Si quieres que continúe, puedo priorizar e implementar los pendientes en el orden que prefieras.

## Cómo ejecutar (Windows PowerShell)

Abre una terminal en la carpeta `pomodoro-app` y ejecuta:

```powershell
npm install
npm start
```

La app se abrirá en `http://localhost:3000` si no hay otro proceso usando ese puerto.

## Desarrollo y pruebas

- Tests básicos generados por CRA en `src/App.test.js`.
- Para ejecutar tests:

```powershell
npm test
```

## Propuestas de implementación (siguientes pasos)

Si quieres que implemente las funciones pendientes, propongo el siguiente orden de trabajo (rápido y con entregables pequeños):

1. Persistencia de tareas e historial en `localStorage` (guardar sesión y ciclos por día).
2. Selector de sonidos + UI para previsualizar alarmas.
3. Notificaciones personalizables (mensajes editables) y opción para activarlas/desactivarlas.
4. Estadísticas con gráficas semanales (añadir `recharts`).
5. Modo foco: boton que oculta listas/controles y bloquea notificaciones adicionales.
6. Internacionalización con `react-i18next` (es/ en primeros idiomas).

Indica qué ítem quieres que haga ahora y lo implemento en el proyecto.

---

Si prefieres, también puedo extraer los comentarios actuales a documentación más extensa o crear archivos de ayuda dentro de `docs/`.
