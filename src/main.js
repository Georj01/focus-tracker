import { keys }   from './engine/input.js';
import { Camera } from './engine/camera.js';

const canvas        = document.getElementById('gameCanvas');
const ctx           = canvas.getContext('2d');
const CANVAS_WIDTH  = 800;
const CANVAS_HEIGHT = 600;
canvas.width        = CANVAS_WIDTH;
canvas.height       = CANVAS_HEIGHT;

const camera        = new Camera(CANVAS_WIDTH, CANVAS_HEIGHT);

const gameState     = {
    players: {
        'my_id': {
            id     : 'my_id',
            x      : 100,
            y      : 100,
            width  : 32,
            height : 32,
            color  : '#3b82f6',
            state  : 'IDLE'
        },
        'npc_1': {
            id     : 'npc_1',
            x      : 400,
            y      : 300,
            width  : 32,
            height : 32,
            color  : '#10b981',
            state  : 'STUDYING'
        }
    },
    pomodoro: {
        mode         : 'WORK',
        timerSeconds : 1500,
        isActive     : true
    }
};

function update(deltaTime) {
    const player = gameState.players['my_id'];
    const SPEED  = 150.0;
    const rawDx  = (keys.d || keys.ArrowRight) - (keys.a || keys.ArrowLeft);
    const rawDy  = (keys.s || keys.ArrowDown) - (keys.w || keys.ArrowUp);
    
    // Normalize velocity vector; fallback prevents division-by-zero
    const len    = Math.hypot(rawDx, rawDy) || 1.0;
    const invLen = 1.0 / len;
    const dx     = rawDx * invLen;
    const dy     = rawDy * invLen;
    
    player.x    += dx * SPEED * deltaTime;
    player.y    += dy * SPEED * deltaTime;
    
    player.x     = Math.max(0, Math.min(CANVAS_WIDTH - player.width, player.x));
    player.y     = Math.max(0, Math.min(CANVAS_HEIGHT - player.height, player.y));
    player.state = (dx !== 0 || dy !== 0) ? 'WALKING' : 'IDLE';
    
    camera.update(player.x, player.y, player.width, player.height);
    
    const timer  = gameState.pomodoro;
    if (timer.isActive && (timer.timerSeconds -= deltaTime) <= 0) {
        timer.mode         = timer.mode === 'WORK' ? 'BREAK' : 'WORK';
        timer.timerSeconds = timer.mode === 'WORK' ? 1500 : 300;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    drawGrid();
    
    Object.values(gameState.players).forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font      = '10px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(`${p.id} (${p.state})`, p.x + p.width * 0.5, p.y - 8);
    });
    ctx.restore();
    
    drawPomodoro();
}

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

function drawPomodoro() {
    const timer        = gameState.pomodoro;
    const totalSeconds = Math.max(0, Math.floor(timer.timerSeconds));
    const minutes      = Math.floor(totalSeconds / 60);
    const seconds      = totalSeconds % 60;
    const timeStr      = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const hudW         = 220;
    const hudH         = 65;
    const hudX         = (CANVAS_WIDTH - hudW) * 0.5;
    const hudY         = 20;
    
    ctx.fillStyle      = '#1e293b';
    ctx.strokeStyle    = timer.mode === 'WORK' ? '#f43f5e' : '#10b981';
    ctx.lineWidth      = 2;
    ctx.fillRect(hudX, hudY, hudW, hudH);
    ctx.strokeRect(hudX, hudY, hudW, hudH);
    
    ctx.fillStyle      = timer.mode === 'WORK' ? '#f43f5e' : '#10b981';
    ctx.font           = 'bold 11px Courier New';
    ctx.textAlign      = 'center';
    ctx.fillText(timer.mode === 'WORK' ? 'STUDY / WORK SESSION' : 'SHORT REST BREAK', CANVAS_WIDTH * 0.5, hudY + 22);
    
    ctx.fillStyle      = '#ffffff';
    ctx.font           = 'bold 24px Courier New';
    ctx.fillText(timeStr, CANVAS_WIDTH * 0.5, hudY + 48);
    
    const maxSeconds   = timer.mode === 'WORK' ? 1500 : 300;
    const progress     = timer.timerSeconds / maxSeconds;
    
    ctx.fillStyle      = '#334155';
    ctx.fillRect(hudX, hudY + hudH + 6, hudW, 6);
    ctx.fillStyle      = timer.mode === 'WORK' ? '#f43f5e' : '#10b981';
    ctx.fillRect(hudX, hudY + hudH + 6, hudW * progress, 6);
}

let lastTime = 0;

function gameLoop(currentTime) {
    if (!lastTime) lastTime = currentTime;
    let deltaTime = (currentTime - lastTime) * 0.001; // Optimized reciprocal multiplication
    lastTime = currentTime;
    
    if (deltaTime > 0.1) deltaTime = 0.1;
    update(deltaTime);
    draw();
    requestAnimationFrame(gameLoop);
}

// Bind UI controls and menu actions
const playBtn     = document.getElementById('btn-play');
const customBtn   = document.getElementById('btn-custom');
const settingsBtn = document.getElementById('btn-settings');
const uiLayer     = document.getElementById('ui-layer');

let gameLoopStarted = false;

if (playBtn) {
    playBtn.addEventListener('click', () => {
        if (uiLayer) uiLayer.style.display = 'none';
        if (!gameLoopStarted) {
            gameLoopStarted = true;
            requestAnimationFrame(gameLoop);
        }
    });
}

if (customBtn) {
    customBtn.addEventListener('click', () => {
        console.log('User Customization: Work in progress');
        alert('User Customization is currently a work in progress.');
    });
}

if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
        console.log('Settings: Work in progress');
        alert('Settings page is currently a work in progress.');
    });
}
