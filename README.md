# Pomodoro World 2D

A retro 2D virtual study space inspired by EarthBound (SNES) designed to gamify productivity. It combines an authentic top-down pixel-art environment with a complete Pomodoro timer suite, interactive study desks, integrated task management, and procedural ambient focus audio.

### Technical Breakdown & Radical Honesty
This application is designed as a zero-dependency, local-first web application. Here is the blunt, analytical reality of the current architecture:
- **Simulated Multiplayer:** There is no WebSocket or backend server. The virtual cafe atmosphere is simulated locally using procedurally spawned NPC entities that occupy designated study carrels and desks.
- **Procedural Zero-Asset Engine:** Rather than loading megabytes of external texture packs or `.mp3` sound files, the graphics and sound are 100% procedurally synthesized in Vanilla JS. The sprites are drawn from 16-color hexadecimal arrays using the HTML5 Canvas 2D context, and the audio (chimes, white noise rain, and cafe murmurs) is generated dynamically via the Web Audio API.
- **Deterministic Time Delta:** The timer and physics engine compute frame differences using `performance.now()`. When the browser tab is minimized or backgrounded, delta-time is clamped to `0.1s` per frame to prevent first-frame teleportation bugs while preserving accurate time decay.
- **Local-First Persistence:** User preferences (study intervals, character palette, name tag), daily focus streak statistics, and active to-do tasks are serialized directly into browser `localStorage`.
- **AABB Collision Physics:** Character movement uses Axis-Aligned Bounding Box (AABB) collision checks against static room geometry (desks, counters, bookshelves, and walls) with velocity sliding along obstacles.

---

## Stack
- **HTML5:** Semantic UI structure and 2D Canvas rendering context (`image-rendering: pixelated`).
- **CSS3:** Modern dark-mode layout, glassmorphic UI overlay panels, and retro Courier typography.
- **Vanilla JS (ES6 Modules):** Decoupled modular architecture with zero external libraries or bundlers:
  - `src/engine/audio.js`: Synthesized 16-bit sound effects & procedural ambient noise.
  - `src/engine/tasks.js`: Persistent to-do checklist and active focus tracking.
  - `src/engine/stats.js`: Daily focus streak and session analytics.
  - `src/engine/dialog.js`: EarthBound-style typewriter dialogue system with CJK wrapping.
  - `src/engine/i18n.js`: Multilingual dictionary manager supporting English, Spanish, and Japanese.
  - `src/engine/interactions.js`: Proximity detection for chairs, coffee bar, and NPCs.
  - `src/engine/camera.js`: Viewport tracking with bounds clamping and automatic display centering.
  - `src/engine/sprites.js`: 4-directional pixel art character models and furniture.
  - `src/engine/scenarios.js`: Scenario maps (Cafeteria, Library, Zen Garden) and collision boundaries.

---

## Installation
Because this project uses standard browser ES Modules, it must be served through an HTTP server rather than the raw `file://` protocol.

Run it locally with any of the following standard commands:

**Method 1: Python HTTP Server (Recommended)**
```bash
python -m http.server 8000
```
Open your browser and navigate to `http://localhost:8000/src/`.

**Method 2: Node.js (npx serve)**
```bash
npx serve src
```
Open your browser and navigate to the address shown in your terminal (typically `http://localhost:3000`).

---

## Usage
- **Movement:** Use `W` `A` `S` `D` or the standard `Arrow Keys` to navigate the study space.
- **Interactions (`[E]`):**
  - Walk up to an empty chair at any desk and press `E` to sit down and enter `STUDYING` focus state.
  - Walk up to the Espresso Bar to pour fresh coffee.
  - Walk up to library bookshelves to read study wisdom.
  - Talk to study buddy NPCs for encouragement.
- **Pomodoro Timer Controls:**
  - `[Space]`: Toggle timer Play / Pause.
  - `[Tab]`: Skip to next session.
  - Sessions automatically cycle through Focus intervals, Short Breaks, and award a Long Break upon completing all scheduled cycles.
- **Task Management (`[T]`):**
  - Press `T` or click the HUD Tasks button to toggle the focus to-do list.
  - Add tasks and click any task to pin it as your active focus item on the top HUD.
- **Audio Controls (`[M]`):**
  - Press `M` to toggle audio mute.
  - Configure procedural ambient sound (Gentle Rain or Cafe Ambiance) in Solo Settings.
- **Multilingual Support (EN / ES / JA):**
  - Toggle between **English**, **Español**, and **日本語** instantly using the language buttons on the Main Menu or the dropdown in Solo Settings. Language preferences are persisted in `localStorage`.
- **Pause & Menus (`[ESC]`):**
  - Press `ESC` anytime to open the Pause Menu, review daily stats, or adjust study intervals.

```javascript
// State representation managed in src/main.js
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
