import { keys }   from './engine/input.js';
import { Camera } from './engine/camera.js';

const canvas        = document.getElementById('gameCanvas');
const ctx           = canvas.getContext('2d');
const CANVAS_WIDTH  = 800;
const CANVAS_HEIGHT = 600;
canvas.width        = CANVAS_WIDTH;
canvas.height       = CANVAS_HEIGHT;

const camera        = new Camera(CANVAS_WIDTH, CANVAS_HEIGHT);

const DEFAULT_CONFIG = {
    focusTime: 25,
    breakTime: 5,
    cycles:    4,
    map:       'cafeteria',
    npcCount:  5
};

// Mutable active configuration set
const currentConfig = { ...DEFAULT_CONFIG };

// Dynamic game state representation
const gameState = {
    players: {},
    pomodoro: {
        mode:         'WORK',
        timerSeconds: 1500,
        isActive:     true
    }
};

// Populate map entities and reset timers dynamically
function initGameWorld() {
    // Reset local player node
    gameState.players = {
        'my_id': {
            id:     'my_id',
            x:      100,
            y:      100,
            width:  32,
            height: 32,
            color:  '#3b82f6',
            state:  'IDLE'
        }
    };

    // Populate custom configuration defined NPC entities
    for (let i = 1; i <= currentConfig.npcCount; i++) {
        const id = `npc_${i}`;
        const x  = 150 + (i * 100) % (CANVAS_WIDTH - 200);
        const y  = 150 + (i * 80) % (CANVAS_HEIGHT - 200);
        gameState.players[id] = {
            id:     id,
            x:      x,
            y:      y,
            width:  32,
            height: 32,
            color:  '#10b981',
            state:  'STUDYING'
        };
    }

    // Populate active timer settings
    const timer        = gameState.pomodoro;
    timer.mode         = 'WORK';
    timer.timerSeconds = currentConfig.focusTime * 60;
    timer.isActive     = true;
}

function update(deltaTime) {
    const player = gameState.players['my_id'];
    if (!player) return; // Defensive guard in case initialization failed
    
    const SPEED  = 150.0;
    const rawDx  = (keys.d || keys.ArrowRight) - (keys.a || keys.ArrowLeft);
    const rawDy  = (keys.s || keys.ArrowDown) - (keys.w || keys.ArrowUp);
    
    // Normalize velocity vector
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
        timer.timerSeconds = timer.mode === 'WORK' ? currentConfig.focusTime * 60 : currentConfig.breakTime * 60;
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
    
    const maxSeconds   = timer.mode === 'WORK' ? currentConfig.focusTime * 60 : currentConfig.breakTime * 60;
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
const playBtn          = document.getElementById('btn-play');
const customBtn        = document.getElementById('btn-custom');
const settingsBtn      = document.getElementById('btn-settings');
const soloBtn          = document.getElementById('btn-solo');
const modeBackBtn      = document.getElementById('btn-mode-back');
const startGameBtn     = document.getElementById('btn-start-game');
const configBackBtn    = document.getElementById('btn-config-back');

const uiLayer          = document.getElementById('ui-layer');
const mainMenuPanel    = document.getElementById('main-menu');
const modeMenuPanel    = document.getElementById('mode-menu');
const configMenuPanel  = document.getElementById('solo-config-menu');

const focusInput       = document.getElementById('focus-time');
const breakInput       = document.getElementById('break-time');
const cyclesInput      = document.getElementById('cycles');
const mapSelect        = document.getElementById('map-select');
const npcInput         = document.getElementById('npc-count');

let gameLoopStarted = false;

// Load persisted settings from localStorage safely with type validation
function loadSavedSettings() {
    try {
        const saved = localStorage.getItem('pomodoroConfig');
        if (saved) {
            const config = JSON.parse(saved);
            if (config) {
                const focusVal  = parseInt(config.focusTime, 10);
                const breakVal  = parseInt(config.breakTime, 10);
                const cyclesVal = parseInt(config.cycles, 10);
                const npcVal    = parseInt(config.npcCount, 10);
                const mapVal    = config.map;

                // Validate loaded bounds defensively to prevent logic corruption
                if (!isNaN(focusVal) && focusVal >= 1 && focusVal <= 180)    currentConfig.focusTime = focusVal;
                if (!isNaN(breakVal) && breakVal >= 1 && breakVal <= 60)     currentConfig.breakTime = breakVal;
                if (!isNaN(cyclesVal) && cyclesVal >= 1 && cyclesVal <= 12)  currentConfig.cycles    = cyclesVal;
                if (!isNaN(npcVal) && npcVal >= 0 && npcVal <= 20)          currentConfig.npcCount  = npcVal;
                if (['cafeteria', 'library', 'garden'].includes(mapVal))     currentConfig.map       = mapVal;

                // Apply verified config to inputs
                if (focusInput)  focusInput.value  = currentConfig.focusTime;
                if (breakInput)  breakInput.value  = currentConfig.breakTime;
                if (cyclesInput) cyclesInput.value = currentConfig.cycles;
                if (mapSelect)   mapSelect.value   = currentConfig.map;
                if (npcInput)    npcInput.value    = currentConfig.npcCount;
            }
        }
    } catch (err) {
        console.error('Failed to parse Pomodoro configurations:', err);
    }
}

// Call settings loader immediately after element definitions
loadSavedSettings();

// Sync default or loaded state into the active world
initGameWorld();

// UI Screen Navigation Event Listeners
if (playBtn) {
    playBtn.addEventListener('click', () => {
        if (mainMenuPanel) mainMenuPanel.classList.add('hidden');
        if (modeMenuPanel) modeMenuPanel.classList.remove('hidden');
    });
}

if (modeBackBtn) {
    modeBackBtn.addEventListener('click', () => {
        if (modeMenuPanel) modeMenuPanel.classList.add('hidden');
        if (mainMenuPanel) mainMenuPanel.classList.remove('hidden');
    });
}

if (soloBtn) {
    soloBtn.addEventListener('click', () => {
        if (modeMenuPanel) modeMenuPanel.classList.add('hidden');
        if (configMenuPanel) configMenuPanel.classList.remove('hidden');
    });
}

if (configBackBtn) {
    configBackBtn.addEventListener('click', () => {
        if (configMenuPanel) configMenuPanel.classList.add('hidden');
        if (modeMenuPanel) modeMenuPanel.classList.remove('hidden');
    });
}

if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
        const focusVal  = focusInput ? parseInt(focusInput.value, 10) : 25;
        const breakVal  = breakInput ? parseInt(breakInput.value, 10) : 5;
        const cyclesVal = cyclesInput ? parseInt(cyclesInput.value, 10) : 4;
        const npcVal    = npcInput ? parseInt(npcInput.value, 10) : 5;
        const mapVal    = mapSelect ? mapSelect.value : 'cafeteria';

        // Capture input configurations into gameConfig with safe bounds validation
        const gameConfig = {
            focusTime: (!isNaN(focusVal) && focusVal >= 1 && focusVal <= 180) ? focusVal : 25,
            breakTime: (!isNaN(breakVal) && breakVal >= 1 && breakVal <= 60) ? breakVal : 5,
            cycles:    (!isNaN(cyclesVal) && cyclesVal >= 1 && cyclesVal <= 12) ? cyclesVal : 4,
            map:       ['cafeteria', 'library', 'garden'].includes(mapVal) ? mapVal : 'cafeteria',
            npcCount:  (!isNaN(npcVal) && npcVal >= 0 && npcVal <= 20) ? npcVal : 5
        };

        // Cache parameters to local configurations registry
        Object.assign(currentConfig, gameConfig);

        // Persist parameters in browser local storage
        try {
            localStorage.setItem('pomodoroConfig', JSON.stringify(gameConfig));
        } catch (err) {
            console.error('Failed to write Pomodoro configurations to localStorage:', err);
        }

        // Initialize entities and reset timers based on updated configurations
        initGameWorld();

        // Hide overlay and log parameters
        if (uiLayer) uiLayer.classList.add('hidden');
        console.log('Game config initialized:', gameConfig);

        // Kickstart the game rendering loop if not already running
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
