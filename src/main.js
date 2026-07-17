const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

const CANVAS_WIDTH  = 800;
const CANVAS_HEIGHT = 600;
canvas.width        = CANVAS_WIDTH;
canvas.height       = CANVAS_HEIGHT;

// Decoupled Game State
const gameState = {
    players: {
        'my_id': {
            id:     'my_id',
            x:      100,
            y:      100,
            width:  32,
            height: 32,
            color:  '#3b82f6', // Local player representation
            state:  'IDLE'
        },
        'npc_1': {
            id:     'npc_1',
            x:      400,
            y:      300,
            width:  32,
            height: 32,
            color:  '#10b981', // NPC simulation node
            state:  'STUDYING'
        }
    },
    pomodoro: {
        mode:         'WORK', // 'WORK' or 'BREAK'
        timerSeconds: 1500,   // 25 minutes standard work session
        isActive:     true
    }
};

// Keyboard Input Handler Map
const keys = {
    w:          false,
    a:          false,
    s:          false,
    d:          false,
    ArrowUp:    false,
    ArrowLeft:  false,
    ArrowDown:  false,
    ArrowRight: false
};

// Frame tracking for Pomodoro seconds calculation (approx 60fps)
let frameCount = 0;

window.addEventListener('keydown', (e) => {
    const key     = e.key.toLowerCase();
    const isArrow = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key);
    
    if (isArrow) e.preventDefault(); // Prevent standard browser scroll behavior
    
    // Mitigate Prototype Pollution vulnerabilities by checking object properties safely
    const hasKey  = Object.prototype.hasOwnProperty.call(keys, e.key);
    const hasLKey = Object.prototype.hasOwnProperty.call(keys, key);
    if (hasKey)  keys[e.key] = true;
    if (hasLKey) keys[key]   = true;
});

window.addEventListener('keyup', (e) => {
    const key     = e.key.toLowerCase();
    const hasKey  = Object.prototype.hasOwnProperty.call(keys, e.key);
    const hasLKey = Object.prototype.hasOwnProperty.call(keys, key);
    if (hasKey)  keys[e.key] = false;
    if (hasLKey) keys[key]   = false;
});

function update() {
    const player = gameState.players['my_id'];
    const speed  = 3.0;

    // Movement projections based on active key states
    const rawDx = (keys.d || keys.ArrowRight) - (keys.a || keys.ArrowLeft);
    const rawDy = (keys.s || keys.ArrowDown) - (keys.w || keys.ArrowUp);

    // Optimized vector normalization using reciprocal multipliers to save division cost
    const len    = Math.hypot(rawDx, rawDy) || 1.0;
    const invLen = 1.0 / len; 
    const dx     = rawDx * invLen;
    const dy     = rawDy * invLen;

    // Translate player coordinates
    player.x += dx * speed;
    player.y += dy * speed;

    // Boundary containment checks
    player.x = Math.max(0, Math.min(CANVAS_WIDTH - player.width, player.x));
    player.y = Math.max(0, Math.min(CANVAS_HEIGHT - player.height, player.y));

    // Simple FSM state updates
    player.state = (dx !== 0 || dy !== 0) ? 'WALKING' : 'IDLE';

    // Integrate Pomodoro timer seconds decrements
    const timer = gameState.pomodoro;
    if (timer.isActive) {
        frameCount++;
        if (frameCount >= 60) {
            frameCount = 0;
            if (timer.timerSeconds > 0) {
                timer.timerSeconds--;
            } else {
                // Auto-transition between study and rest modes
                timer.mode         = timer.mode === 'WORK' ? 'BREAK' : 'WORK';
                timer.timerSeconds = timer.mode === 'WORK' ? 1500 : 300;
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawGrid();
    drawPomodoro();

    // Render characters
    Object.values(gameState.players).forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);

        // Character status overlays
        ctx.fillStyle = '#ffffff';
        ctx.font      = '10px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(`${p.id} (${p.state})`, p.x + p.width / 2, p.y - 8);
    });
}

// Unified path strokes to minimize GPU overhead (O(1) GPU strokes)
function drawGrid() {
    ctx.strokeStyle = '#334155';
    ctx.lineWidth   = 1;
    const gridSize  = 40;

    ctx.beginPath();
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();
}

// Visual HUD overlay for the Pomodoro Timer
function drawPomodoro() {
    const timer   = gameState.pomodoro;
    const minutes = Math.floor(timer.timerSeconds / 60);
    const seconds = timer.timerSeconds % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const hudW = 220;
    const hudH = 65;
    const hudX = (CANVAS_WIDTH - hudW) / 2;
    const hudY = 20;

    // HUD base container
    ctx.fillStyle   = '#1e293b';
    ctx.strokeStyle = timer.mode === 'WORK' ? '#f43f5e' : '#10b981'; // Rose border for work, Emerald for break
    ctx.lineWidth   = 2;
    ctx.fillRect(hudX, hudY, hudW, hudH);
    ctx.strokeRect(hudX, hudY, hudW, hudH);

    // Timer Mode description
    ctx.fillStyle = timer.mode === 'WORK' ? '#f43f5e' : '#10b981';
    ctx.font      = 'bold 11px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(timer.mode === 'WORK' ? 'STUDY / WORK SESSION' : 'SHORT REST BREAK', CANVAS_WIDTH / 2, hudY + 22);

    // Large visual timer clock
    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 24px Courier New';
    ctx.fillText(timeStr, CANVAS_WIDTH / 2, hudY + 48);

    // Progress bar visualization
    const maxSeconds = timer.mode === 'WORK' ? 1500 : 300;
    const progress   = timer.timerSeconds / maxSeconds;
    
    ctx.fillStyle = '#334155';
    ctx.fillRect(hudX, hudY + hudH + 6, hudW, 6);
    
    ctx.fillStyle = timer.mode === 'WORK' ? '#f43f5e' : '#10b981';
    ctx.fillRect(hudX, hudY + hudH + 6, hudW * progress, 6);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
