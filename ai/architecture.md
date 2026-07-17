# SYSTEM INSTRUCTIONS: ARCHITECTURE & SYSTEM DESIGN

## 1. HIGH-LEVEL ARCHITECTURE
- **Core Pattern:** Single-page Canvas Game Loop with a decoupled state architecture.
- **Infrastructure:** Client-side static browser execution.

## 2. DATA FLOW & STATE MANAGEMENT
- **Source of Truth:** Centralized `gameState` object containing players (coordinates, states, visual characteristics).
- **State Strategy:** Single-directional data flow. The input handlers capture key press events, the `update()` loop mutates the state, and the `draw()` loop reads directly from `gameState` to draw frames.
- **Strict Rule:** The UI rendering layer MUST NOT mutate position data or trigger side-effects directly. All coordinate updates are centralized in the `update()` tick.

## 3. COMMUNICATION & API DESIGN
- **Protocol:** None (local-first fake-backend architecture). State maps emulate network synchronization models (e.g. keyed by player IDs).

## 4. ERROR HANDLING STRATEGY
- **Global Strategy:** Validate all state keys before accessing players to prevent crashes from missing IDs.
- **Failing Gracefully:** Clamp coordinate movements to canvas limits to prevent players from moving off-screen or triggering arithmetic errors.
- **Math Safety:** Prevent division-by-zero during diagonal movement normalization by verifying vector lengths are greater than zero before dividing.