// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas to a fixed aspect ratio or relative sizing (e.g. 800x600)
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// 1. Fake Server State Architecture
const gameState = {
    players: {
        'my_id': {
            id: 'my_id',
            x: 100,
            y: 100,
            width: 32,
            height: 32,
            color: '#3b82f6', // Premium blue for local player
            state: 'WALKING'
        },
        'npc_1': {
            id: 'npc_1',
            x: 400,
            y: 300,
            width: 32,
            height: 32,
            color: '#10b981', // Emerald green for NPC
            state: 'STUDYING'
        }
    }
};

// 2. Input Handling
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowDown: false,
    ArrowRight: false
};

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (e.key in keys || key in keys) {
        if (e.key in keys) keys[e.key] = true;
        if (key in keys) keys[key] = true;
        // Prevent default browser scrolling when playing
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
            e.preventDefault();
        }
    }
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (e.key in keys || key in keys) {
        if (e.key in keys) keys[e.key] = false;
        if (key in keys) keys[key] = false;
    }
});

// 3. Update Loop
function update() {
    const player = gameState.players['my_id'];
    const speed = 3.0; // 3 pixels per frame

    let dx = 0;
    let dy = 0;

    if (keys.w || keys.ArrowUp) dy -= 1;
    if (keys.s || keys.ArrowDown) dy += 1;
    if (keys.a || keys.ArrowLeft) dx -= 1;
    if (keys.d || keys.ArrowRight) dx += 1;

    // Normalize diagonal movement speed
    if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
    }

    // Move player based on inputs
    player.x += dx * speed;
    player.y += dy * speed;

    // Simple screen boundaries clamp
    player.x = Math.max(0, Math.min(CANVAS_WIDTH - player.width, player.x));
    player.y = Math.max(0, Math.min(CANVAS_HEIGHT - player.height, player.y));

    // Update state based on movement
    if (dx !== 0 || dy !== 0) {
        player.state = 'WALKING';
    } else {
        player.state = 'IDLE';
    }
}

// 4. Draw Loop
function draw() {
    // Clear canvas to prevent trail effects
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid background for premium aesthetics
    drawGrid();

    // Loop through all players in the gameState object and render them
    for (const id in gameState.players) {
        const p = gameState.players[id];
        
        // Draw player square
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);

        // Draw a simple designation text (optional but premium vibe)
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(`${p.id} (${p.state})`, p.x + p.width / 2, p.y - 8);
    }
}

// Visual enhancement helper: Subtle background grid
function drawGrid() {
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    const gridSize = 40;
    
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// 5. Main Game Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the loop
requestAnimationFrame(gameLoop);
