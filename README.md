# Pomodoro World 2D

A retro 2D virtual study space inspired by EarthBound (SNES) designed to gamify productivity. It combines an authentic top-down pixel-art environment with a complete Pomodoro timer suite, interactive study desks, integrated task management, and procedural ambient focus audio.

### Technical Breakdown & Radical Honesty
This application is designed as a zero-dependency, local-first web application. Here is the blunt, analytical reality of the current architecture:
- **Simulated Multiplayer:** There is no WebSocket or backend server. The virtual cafe atmosphere is simulated locally using procedurally spawned NPC entities that occupy designated study carrels and take breaks between Pomodoro cycles.
- **Procedural Zero-Asset Engine & Offscreen Caching:** Rather than loading external texture packs or `.mp3` sound files, graphics and sound are 100% procedurally synthesized in Vanilla JS. Pixel sprites and scenario floor grids are rasterized once onto offscreen `<canvas>` buffers (`WeakMap` / `Map` caches) for $O(1)$ hardware-accelerated `drawImage` blitting at 60 FPS, and audio (chimes, rain, cafe murmurs, fireplace crackle, and binaural alpha waves) is generated dynamically via the Web Audio API.
- **Wall-Clock Background Timer & Clamped Physics Delta:** Physics movement clamps frame deltas (`performance.now()`) to `0.1s` to prevent collision tunneling, while the Pomodoro countdown tracks real wall-clock timestamps (`Date.now()`) with a background-tab heartbeat (`setInterval` + `visibilitychange`) and live `document.title` updates so timers never freeze when the browser tab is backgrounded.
- **Local-First Persistence:** User preferences, 7-day focus history & daily streak statistics, and active to-do tasks with Pomodoro session targets are serialized directly into browser `localStorage`.
- **AABB Collision & Click-to-Move Steering:** Character movement supports both keyboard (`WASD`/Arrows) and click/tap-to-move waypoints with Axis-Aligned Bounding Box (AABB) collision sliding and memoized room obstacles.

---

## Stack
- **HTML5:** Semantic UI structure and 2D Canvas rendering context (`image-rendering: pixelated`, `imageSmoothingEnabled = false`).
- **CSS3:** Authentic Windows 98 classic GUI chrome (beveled `#c0c0c0` windows, navy gradient titlebars, sunken inputs, taskbar, and System Monitor 7-day focus chart).
- **Vanilla JS (ES6 Modules):** Decoupled modular architecture with zero external libraries:
  - `src/engine/audio.js`: Synthesized 16-bit sound effects & 4 procedural ambient soundscapes (Rain, Cafe, Fireplace, Binaural).
  - `src/engine/tasks.js`: Persistent to-do checklist with active HUD focus & Pomodoro target/completion tracking (`🍅 done/target`).
  - `src/engine/stats.js`: Daily focus streak, total focus time, and 7-day focus history analytics.
  - `src/engine/dialog.js`: Windows 98 message box typewriter dialogue system with CJK wrapping.
  - `src/engine/i18n.js`: Multilingual dictionary manager supporting English, Spanish, and Japanese.
  - `src/engine/interactions.js`: Proximity & click detection with Windows 98 tooltips for chairs, counters, bookshelves, lanterns, and NPCs.
  - `src/engine/camera.js`: Integer-aligned viewport tracking with bounds clamping and display centering.
  - `src/engine/sprites.js`: Minimalist uniform `3x` integer-grid pixel art engine with offscreen canvas caching and modular counters/bookshelves.
  - `src/engine/scenarios.js`: Scenario maps (Cafeteria, Library, Zen Garden), cached floor layers, and memoized collision boundaries.
  - `src/engine/world.js`: World state, click-to-move steering, AABB physics, and dynamic NPC break behaviors.
  - `src/engine/timer.js`: Wall-clock Pomodoro timer engine, live tab title updates, and Windows 98 LCD clock & segmented progress bar HUD.
  - `src/build-bundle.js`: Zero-dependency script that compiles all ES6 modules into `src/bundle.js` for `file://` execution.

---

## Installation & Running
This project is 100% zero-dependency and runs completely offline in any modern browser!

**Method 1: Direct File Launch (No Server Required)**
- Simply double-click `index.html` (or `src/index.html`) to launch directly in your browser (`file://`).

**Method 2: Local HTTP Server (Optional)**
```bash
# Python
python -m http.server 8000
# Open http://localhost:8000/ in your browser
```
or
```bash
# Rebuild standalone bundle after editing src/engine/*.js or src/main.js
node src/build-bundle.js
```

---

## Usage
- **Movement:** Use `W` `A` `S` `D`, `Arrow Keys`, or **Click / Tap** anywhere on the map to walk and interact.
- **Interactions (`[E]` or Click/Tap):**
  - Walk up to an empty chair at any desk and press `E` (or click the chair/prompt) to sit down and enter `STUDYING` focus state.
  - Walk up to the Espresso Bar to pour fresh coffee.
  - Walk up to library bookshelves to read study wisdom.
  - Talk to study buddy NPCs for encouragement (NPCs also take breaks and stretch during break sessions).
- **Pomodoro Timer Controls:**
  - `[Space]`: Toggle timer Play / Pause.
  - `[Tab]`: Skip to next session.
  - Live countdown is mirrored in the browser tab title (`🍅 24:59 — Pomodoro World 2D`) and continues accurately in background tabs.
- **Task Management (`[T]`):**
  - Press `T` or click the HUD Tasks button to toggle the focus to-do list.
  - Click any task to pin it as your active focus item on the top HUD, or click its `🍅` badge to set target Pomodoros (`1–8`). Completed focus sessions automatically increment the active task's Pomodoro count.
- **Audio Controls (`[M]`):**
  - Press `M` to toggle audio mute.
  - Choose from 4 procedural ambient soundscapes (Gentle Rain, Cafe Ambiance, Cozy Fireplace, or Deep Focus Binaural) in Solo Settings.
- **Multilingual Support (EN / ES / JA):**
  - Toggle between **English**, **Español**, and **日本語** instantly using the language buttons on the Main Menu or the dropdown in Solo Settings.
- **Pause & Analytics (`[ESC]`):**
  - Press `ESC` anytime to open the Pause Menu, review your 7-Day Focus History bar chart and streak, or adjust settings without losing your current session progress.

```javascript
// State representation managed in src/engine/world.js
const gameState = {
    players: {
        'my_id': { id: 'Ness', x: 600, y: 360, width: 32, height: 40, direction: 'down', state: 'IDLE' },
        'npc_1': { id: 'Study Buddy 1', x: 100, y: 186, width: 32, height: 40, state: 'STUDYING' }
    },
    pomodoro: {
        mode:         'WORK', // 'WORK' | 'BREAK' | 'LONG_BREAK'
        timerSeconds: 1500,
        isActive:     true,
        currentCycle: 1,
        totalCycles:  4
    }
};
```
