# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 1. PRODUCT GOAL
A minimalist 2D top-down virtual cafe where users can work/study in a shared space with a built-in Pomodoro timer to gamify productivity.

## 2. TARGET AUDIENCE / USER
Remote workers, students, and developers seeking a gamified, distraction-free multiplayer focal space to study together.

## 3. CORE FEATURES (MVP)
- **Feature 1:** 2D canvas top-down orthographic rendering of players and NPCs as colored squares (32x32).
- **Feature 2:** Local player keyboard movement (WASD/Arrow keys) with automatic status update ('IDLE', 'WALKING').
- **Feature 3:** Centralized client state architecture (`gameState`) to support future real-time synchronization (Socket.io).
- **Feature 4:** Integrated visual Pomodoro timer layout on the canvas interface.

## 4. USER FLOW
1. User loads `index.html` in the browser.
2. User is rendered as a blue character box in a virtual cafe workspace.
3. User moves using standard arrow keys or WASD.
4. User studies/works while the global Pomodoro timer tracks their session on screen.

## 5. OUT OF SCOPE (ANTI-FEATURES)
- NO complex physics, collision maps, or heavy sprite asset loading in this MVP stage.
- NO database user authentication or account storage.
- NO raw client-side direct state mutation from input handlers (all inputs modify state via centralized loop).