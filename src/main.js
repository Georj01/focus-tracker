import { keys }   from './engine/input.js';                  // Import input dictionary tracking key state changes
import { Camera } from './engine/camera.js';                 // Import Camera viewport tracking systems module
//                                                           // Space separator to organize global instances
const canvas        = document.getElementById('gameCanvas'); // Query DOM elements to bind the target game render canvas
const ctx           = canvas.getContext('2d');               // Extract canvas drawing pipeline for vector updates
const CANVAS_WIDTH  = 800;                                   // Assign fixed coordinate width dimensions for screen space
const CANVAS_HEIGHT = 600;                                   // Assign fixed coordinate height dimensions for screen space
canvas.width        = CANVAS_WIDTH;                          // Sync HTML rendering width bounds to design dimensions
canvas.height       = CANVAS_HEIGHT;                         // Sync HTML rendering height bounds to design dimensions
//                                                           // Space separator to organize global instances
const camera        = new Camera(CANVAS_WIDTH, CANVAS_HEIGHT); // Instantiate new tracking camera viewport controller
//                                                           // Space separator to organize global instances
const gameState     = {                                      // Decoupled Game State encapsulating all entity state values
    players: {                                               // Set of active player models mapped by local keys
        'my_id': {                                           // Local client player entity metadata
            id     : 'my_id',                                // Unique identifier string matching client registration
            x      : 100,                                    // Horizontal coordinate position relative to world plane
            y      : 100,                                    // Vertical coordinate position relative to world plane
            width  : 32,                                     // Player rectangular width dimension in pixels
            height : 32,                                     // Player rectangular height dimension in pixels
            color  : '#3b82f6',                              // Visual color designation mapping local player
            state  : 'IDLE'                                  // Motion status attribute for behavior state tracking
        },                                                   // End of local player description object
        'npc_1': {                                           // Simulated remote entity metadata
            id     : 'npc_1',                                // Unique identifier string matching NPC registration
            x      : 400,                                    // Horizontal coordinate position relative to world plane
            y      : 300,                                    // Vertical coordinate position relative to world plane
            width  : 32,                                     // NPC rectangular width dimension in pixels
            height : 32,                                     // NPC rectangular height dimension in pixels
            color  : '#10b981',                              // Visual color designation mapping NPC representation
            state  : 'STUDYING'                              // Motion status attribute for behavioral activity tracking
        }                                                    // End of NPC description object
    },                                                       // End of player collections dictionary
    pomodoro: {                                              // Time management tracking session subsystem configurations
        mode         : 'WORK',                               // Active interval category identifier (WORK or BREAK)
        timerSeconds : 1500,                                 // Duration constraint in seconds for current interval
        isActive     : true                                  // Subsystem active flag to step down state changes
    }                                                        // End of Pomodoro subsystem block
};                                                           // End of gameState root state container object
//                                                           // Space separator to organize execution blocks
function update(deltaTime) {                                 // Core physics state update function calculating movement and collisions
    const player = gameState.players['my_id'];               // Fetch a reference to local player object from global game state
    const SPEED  = 150.0;                                     // Define movement velocity speed scalar constant in units of pixels/second
    const rawDx  = (keys.d || keys.ArrowRight) - (keys.a || keys.ArrowLeft); // Calculate raw horizontal movement vector projection in {-1, 0, 1}
    const rawDy  = (keys.s || keys.ArrowDown) - (keys.w || keys.ArrowUp);    // Calculate raw vertical movement vector projection in {-1, 0, 1}
    const len    = Math.hypot(rawDx, rawDy) || 1.0;            // Calculate vector Euclidean norm with zero-division fallback protection
    const invLen = 1.0 / len;                                 // Precompute reciprocal norm for optimized branchless multiplication scaling
    const dx     = rawDx * invLen;                            // Multiply raw horizontal component by unit length conversion factor
    const dy     = rawDy * invLen;                            // Multiply raw vertical component by unit length conversion factor
    player.x    += dx * SPEED * deltaTime;                   // Integrate velocity onto player horizontal coordinate over elapsed time interval
    player.y    += dy * SPEED * deltaTime;                   // Integrate velocity onto player vertical coordinate over elapsed time interval
    player.x     = Math.max(0, Math.min(CANVAS_WIDTH - player.width, player.x));   // Constrain x-coordinate within [0, CANVAS_WIDTH - player.width] Euclidean interval
    player.y     = Math.max(0, Math.min(CANVAS_HEIGHT - player.height, player.y)); // Constrain y-coordinate within [0, CANVAS_HEIGHT - player.height] Euclidean interval
    player.state = (dx !== 0 || dy !== 0) ? 'WALKING' : 'IDLE'; // Determine FSM motion state by checking coordinate displacement predicate
    camera.update(player.x, player.y, player.width, player.height); // Adjust tracking viewport position target centered on local player bounds
    const timer  = gameState.pomodoro;                        // Retrieve Pomodoro state node reference from global game state container
    if (timer.isActive && (timer.timerSeconds -= deltaTime) <= 0) { // Decrease remaining time if active and evaluate phase boundary condition
        timer.mode         = timer.mode === 'WORK' ? 'BREAK' : 'WORK'; // Switch between WORK and BREAK modes using binary toggle mapping
        timer.timerSeconds = timer.mode === 'WORK' ? 1500 : 300;       // Reset remaining seconds depending on selected phase duration
    }                                                        // End of timer status evaluation branch block
}                                                            // End of update function context block
//                                                           // Space separator to organize execution blocks
function draw() {                                            // Coordinate main game frame rendering processes
    ctx.clearRect(0, 0, canvas.width, canvas.height);        // Flush frame buffer to reset canvas color buffer
    ctx.save();                                              // Preserve current transformation state matrix configurations
    ctx.translate(-camera.x, -camera.y);                     // Shift canvas coordinates offset by negative camera displacement
    drawGrid();                                              // Rasterize reference coordinates grid structure
    Object.values(gameState.players).forEach(p => {          // Render every active player registration in world coordinates
        ctx.fillStyle = p.color;                             // Match fill texture styling to current player color hex code
        ctx.fillRect(p.x, p.y, p.width, p.height);           // Render solid rectangular bounding box model
        ctx.fillStyle = '#ffffff';                           // Assign font filling color styles to white
        ctx.font      = '10px Courier New';                  // Specify context typography constraints to Courier New style
        ctx.textAlign = 'center';                            // Align horizontal typography origin center
        ctx.fillText(`${p.id} (${p.state})`, p.x + p.width / 2, p.y - 8); // Output label identifier text string offset above target
    });                                                      // End of player iteration loop block
    ctx.restore();                                           // Reinstate cached transformation matrix states to restore default scale
    drawPomodoro();                                          // Render non-translated UI overlays overlay elements HUD
}                                                            // End of draw function context block
//                                                           // Space separator to organize execution blocks
function drawGrid() {                                        // Render horizontal and vertical world-grid lines
    ctx.strokeStyle = '#334155';                             // Set line vector outline stroke color Hex code
    ctx.lineWidth   = 1;                                     // Define segment width dimensions in layout pixels
    const gridSize  = 40;                                    // Assign dimension width spacing step value between grid subdivisions
    ctx.beginPath();                                         // Open unified path container to batch all rendering commands
    for (let x = 0; x < canvas.width; x += gridSize) {       // Loop through sequential vertical divisions across width boundaries
        ctx.moveTo(x, 0);                                    // Initialize path vertex start point at coordinates (x, 0)
        ctx.lineTo(x, canvas.height);                        // Draw straight lines down to coordinates (x, canvas.height)
    }                                                        // End of vertical lines loop block
    for (let y = 0; y < canvas.height; y += gridSize) {      // Loop through sequential horizontal divisions across height boundaries
        ctx.moveTo(0, y);                                    // Initialize path vertex start point at coordinates (0, y)
        ctx.lineTo(canvas.width, y);                         // Draw straight lines right to coordinates (canvas.width, y)
    }                                                        // End of horizontal lines loop block
    ctx.stroke();                                            // Commit path lines vectors to graphics context surface in one pass
}                                                            // End of drawGrid function context block
//                                                           // Space separator to organize execution blocks
function drawPomodoro() {                                    // Coordinate overlay HUD displaying current session times
    const timer        = gameState.pomodoro;                    // Retrieve current state values of active Pomodoro session
    const totalSeconds = Math.max(0, Math.floor(timer.timerSeconds)); // Clamp and round current floating point time to integer seconds
    const minutes      = Math.floor(totalSeconds / 60);         // Compute remaining minutes by integer division with 60
    const seconds      = totalSeconds % 60;                     // Compute remaining seconds via modulo 60 arithmetic operation
    const timeStr      = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`; // Formulate display string representation
    const hudW         = 220;                                   // Specify layout width of the UI HUD panel in pixels
    const hudH         = 65;                                    // Specify layout height of the UI HUD panel in pixels
    const hudX         = (CANVAS_WIDTH - hudW) / 2;             // Center HUD panel horizontally in coordinate workspace
    const hudY         = 20;                                    // Position HUD panel offset at 20 pixels from canvas top
    ctx.fillStyle      = '#1e293b';                             // Assign container background color code in hex
    ctx.strokeStyle    = timer.mode === 'WORK' ? '#f43f5e' : '#10b981'; // Assign border color dynamically based on phase type
    ctx.lineWidth      = 2;                                     // Define border line thickness pixel scale
    ctx.fillRect(hudX, hudY, hudW, hudH);                     // Render bounding background tracking hud panel box
    ctx.strokeRect(hudX, hudY, hudW, hudH);                   // Render bordering border outline path tracking hud panel box
    ctx.fillStyle      = timer.mode === 'WORK' ? '#f43f5e' : '#10b981'; // Choose title color corresponding to active Pomodoro session phase
    ctx.font           = 'bold 11px Courier New';                 // Set context text styling to bold monospace format
    ctx.textAlign      = 'center';                                // Set horizontal alignment point relative to coordinate center
    ctx.fillText(timer.mode === 'WORK' ? 'STUDY / WORK SESSION' : 'SHORT REST BREAK', CANVAS_WIDTH / 2, hudY + 22); // Draw phase title label in panel bounds
    ctx.fillStyle      = '#ffffff';                             // Select white layout color palette for text fields
    ctx.font           = 'bold 24px Courier New';                 // Set text styling size and face type to larger Courier New block
    ctx.fillText(timeStr, CANVAS_WIDTH / 2, hudY + 48);          // Draw calculated formatted time digits string centered
    const maxSeconds   = timer.mode === 'WORK' ? 1500 : 300;     // Determine maximum duration boundary dependent on session phase
    const progress     = timer.timerSeconds / maxSeconds;       // Compute fraction percentage of time elapsed in [0, 1] interval
    ctx.fillStyle      = '#334155';                             // Set background track fill color for status bar indicator
    ctx.fillRect(hudX, hudY + hudH + 6, hudW, 6);              // Draw backing progress track rectangle in coordinate view space
    ctx.fillStyle      = timer.mode === 'WORK' ? '#f43f5e' : '#10b981'; // Dynamic color selection for active progress segment indicator
    ctx.fillRect(hudX, hudY + hudH + 6, hudW * progress, 6);   // Render filled fraction progress bar relative to calculated elapsed percentage
}                                                            // End of drawPomodoro function context block
//                                                           // Space separator to organize execution blocks
let lastTime        = 0;                                     // Stores timestamp of previous loop execution frame
//                                                           // Space separator to organize loop variables
function gameLoop(currentTime) {                             // Main callback event invoked by animation scheduler
    if (!lastTime) lastTime = currentTime;                   // Populate initial baseline execution timestamp if zero
    let deltaTime    = (currentTime - lastTime) / 1000.0;    // Compute elapsed time slice delta scaled to units of seconds
    lastTime         = currentTime;                          // Update tracking baseline timestamp to current frame tick value
    if (deltaTime > 0.1) deltaTime = 0.1;                    // Clamp max frame duration step to avoid temporal physics explosion
    update(deltaTime);                                       // Execute spatial integration and system time ticking
    draw();                                                  // Perform rendering of world space entities and UI interface overlays
    requestAnimationFrame(gameLoop);                         // Recursively register next frame scheduler execution block
}                                                            // End of gameLoop function context block
//                                                           // Space separator to organize execution initiation
requestAnimationFrame(gameLoop);                             // Fire initial request frame loop callback invocation
