# Focus Tracker

A minimalist 2D top-down virtual cafe where users can work and study in a simulated shared space. It combines keyboard-controlled player avatars with an integrated Pomodoro timer to gamify productivity.

### Technical Breakdown & Radical Honesty
This application is designed as a local-first, dependency-free prototype. While the visual layer behaves like an interactive game, the underlying systems have major limitations:
- **Simulated Multiplayer:** There is no networking layer or server sync. The multiplayer experience is entirely mocked using local in-memory NPC state.
- **Frame-Rate Dependent Timer:** The Pomodoro timer relies on a raw frame-counter (`60` frames per second) instead of system-time differences (`Date.now()` or `performance.now()`). If the browser window loses focus, is throttled, or runs on a non-60Hz display, the timer speed will drift or slow down significantly.
- **Collision-Free Physics:** Movement is translated directly onto coordinate planes. There are no tile collision maps, obstacles, or physics boundaries, allowing avatars to walk over HUD overlays and other players.
- **Volatile State:** All session data, positions, and timers exist in volatile page memory. Refreshing the browser instantly wipes and resets all progress.

## Stack
- **HTML5:** 2D Canvas API for rendering grid layers, HUD, and player nodes.
- **CSS3:** Custom stylesheet for layout stabilization and dark-mode workspace backdrop.
- **Vanilla JS (ES6+):** Pure event-driven keyboard handling, decoupled FSM state container, and single-thread game loop using `requestAnimationFrame`.

## Installation
Since this project is a static frontend application with zero external dependencies, no installation or compilation is required.

Run it locally via any of the following methods:

**Method 1: Direct File Execution (No Server)**
Open the `src/index.html` file directly in any modern web browser.

**Method 2: Python HTTP Server**
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000/src/` in your browser.

**Method 3: Node.js Static Server**
```bash
npx serve src
```
Then navigate to the URL provided in your terminal output (typically `http://localhost:3000`).

## Usage
- **Movement:** Use `W` `A` `S` `D` or the standard `Arrow Keys` to navigate the blue player box around the canvas grid.
- **State Transitions:** The avatar state transitions automatically from `IDLE` to `WALKING` upon movement.
- **Pomodoro Timer:** The timer at the top of the canvas automatically cycles between:
  - **Study Session:** 25 minutes (indicated by a Rose border and bar).
  - **Short Rest Break:** 5 minutes (indicated by an Emerald border and bar).

```javascript
// Decoupled gameState structure used by the render loops
const gameState = {
    players: {
        'my_id': { id: 'my_id', x: 100, y: 100, width: 32, height: 32, color: '#3b82f6', state: 'IDLE' },
        'npc_1': { id: 'npc_1', x: 400, y: 300, width: 32, height: 32, color: '#10b981', state: 'STUDYING' }
    },
    pomodoro: {
        mode:         'WORK', // 'WORK' or 'BREAK'
        timerSeconds: 1500,
        isActive:     true
    }
};
```
