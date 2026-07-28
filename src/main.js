import { keys } from './engine/input.js';
import { Camera } from './engine/camera.js';
import { assets } from './engine/assets.js';
import { renderScenarioFloor, renderScenarioEnvironment, scenarioConfigs } from './engine/scenarios.js';

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

// World size dimensions for the cafe scenario
const WORLD_WIDTH  = 1200;
const WORLD_HEIGHT = 800;

// Initialize camera viewport tracking using dynamic boundaries
const camera = new Camera(window.innerWidth, window.innerHeight);

// Implement responsive full-screen canvas sizing
function resizeCanvas() {
    if (canvas) {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        if (camera) {
            camera.viewportWidth  = canvas.width;
            camera.viewportHeight = canvas.height;
        }
    }
}

// Call on startup to establish correct resolution bounds
resizeCanvas();

window.addEventListener('resize', resizeCanvas);

const DEFAULT_CONFIG = {
    focusTime:  25,
    breakTime:  5,
    cycles:     4,
    map:        'cafeteria',
    npcCount:   5,
    playerName: 'my_id',
    playerColor:'#3b82f6'
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
    const pId = currentConfig.playerName || 'my_id';
    
    // Reset local player node
    gameState.players = {
        'my_id': {
            id:     pId,
            x:      150,
            y:      150,
            width:  36,
            height: 36,
            color:  currentConfig.playerColor || '#3b82f6',
            state:  'IDLE'
        }
    };

    // Obtain current scenario desk layout to spawn study buddy NPCs around desks
    const scenario = scenarioConfigs[currentConfig.map] || scenarioConfigs.cafeteria;
    const desks    = scenario.desks || [];

    // Populate custom configuration defined NPC entities
    for (let i = 1; i <= currentConfig.npcCount; i++) {
        const id   = `npc_${i}`;
        
        let x, y;
        if (desks.length > 0) {
            const desk = desks[(i - 1) % desks.length];
            x = desk.x + (i % 2 === 0 ? -35 : desk.w + 5);
            y = desk.y + Math.floor((i - 1) / 2) * 10;
        } else {
            const xDiv = Math.max(1, WORLD_WIDTH - 200);
            const yDiv = Math.max(1, WORLD_HEIGHT - 200);
            x = 200 + (i * 120) % xDiv;
            y = 200 + (i * 90) % yDiv;
        }

        gameState.players[id] = {
            id:     id,
            x:      x,
            y:      y,
            width:  36,
            height: 36,
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
    if (!player) return;
    
    // Lock character controls if menu overlay is currently visible
    const isMenuOpen = uiLayer && !uiLayer.classList.contains('hidden');

    let dx = 0;
    let dy = 0;

    if (!isMenuOpen) {
        const SPEED  = 160.0;
        const rawDx  = (keys.d || keys.ArrowRight) - (keys.a || keys.ArrowLeft);
        const rawDy  = (keys.s || keys.ArrowDown) - (keys.w || keys.ArrowUp);
        
        // Normalize velocity vector
        const len    = Math.hypot(rawDx, rawDy) || 1.0;
        const invLen = 1.0 / len;
        dx           = rawDx * invLen;
        dy           = rawDy * invLen;
        
        player.x    += dx * SPEED * deltaTime;
        player.y    += dy * SPEED * deltaTime;
    }
    
    // Contain player within world scenario dimensions (18px wall thickness)
    const wallMargin = 18;
    player.x     = Math.max(wallMargin, Math.min(WORLD_WIDTH - wallMargin - player.width, player.x));
    player.y     = Math.max(wallMargin, Math.min(WORLD_HEIGHT - wallMargin - player.height, player.y));
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

    // 1. Render scenario environment floor tiles & props
    renderScenarioFloor(ctx, WORLD_WIDTH, WORLD_HEIGHT, currentConfig.map);
    renderScenarioEnvironment(ctx, WORLD_WIDTH, WORLD_HEIGHT, currentConfig.map);
    
    // 2. Render pixel art character avatars
    Object.values(gameState.players).forEach(p => {
        drawCharacterSprite(ctx, p);
    });

    ctx.restore();
    
    // 3. Render HUD UI overlay
    drawPomodoro();
}

// Render pixel art character sprite with drop shadow and status overlays
function drawCharacterSprite(ctx, p) {
    const isPlayer = p.id === currentConfig.playerName || p.id === 'my_id';
    
    // Drop shadow under character
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(p.x + p.width * 0.5, p.y + p.height - 2, p.width * 0.4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Use loaded pixel art image asset if available
    const imgAsset = isPlayer ? assets.player : assets.npc;

    if (imgAsset) {
        ctx.save();
        // Rounded circular sprite clipping for pixel avatar
        ctx.beginPath();
        ctx.arc(p.x + p.width * 0.5, p.y + p.height * 0.5, p.width * 0.48, 0, Math.PI * 2);
        ctx.clip();
        
        ctx.drawImage(imgAsset, p.x, p.y, p.width, p.height);
        ctx.restore();

        // Border ring
        ctx.strokeStyle = isPlayer ? (currentConfig.playerColor || '#3b82f6') : '#10b981';
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.arc(p.x + p.width * 0.5, p.y + p.height * 0.5, p.width * 0.48, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        // Procedural pixel art character avatar fallback
        ctx.fillStyle   = isPlayer ? (currentConfig.playerColor || p.color) : p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
        
        // Character face & eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(p.x + 8, p.y + 10, 5, 5);
        ctx.fillRect(p.x + p.width - 13, p.y + 10, 5, 5);
        
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(p.x + 10, p.y + 12, 2, 2);
        ctx.fillRect(p.x + p.width - 11, p.y + 12, 2, 2);

        // Headphones for player
        if (isPlayer) {
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(p.x + 2, p.y + 8, 4, 10);
            ctx.fillRect(p.x + p.width - 6, p.y + 8, 4, 10);
            ctx.fillRect(p.x + 4, p.y + 4, p.width - 8, 3);
        }
    }

    // Character status label badge
    const labelText = `${p.id} (${p.state})`;
    ctx.font        = 'bold 10px Courier New';
    const textWidth = ctx.measureText(labelText).width;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(p.x + p.width * 0.5 - textWidth * 0.5 - 4, p.y - 18, textWidth + 8, 14);

    ctx.fillStyle = isPlayer ? '#60a5fa' : '#34d399';
    ctx.textAlign = 'center';
    ctx.fillText(labelText, p.x + p.width * 0.5, p.y - 7);
}

function drawPomodoro() {
    const timer        = gameState.pomodoro;
    const totalSeconds = Math.max(0, Math.floor(timer.timerSeconds));
    const minutes      = Math.floor(totalSeconds / 60);
    const seconds      = totalSeconds % 60;
    const timeStr      = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const hudW         = 240;
    const hudH         = 68;
    const hudX         = (canvas.width - hudW) * 0.5;
    const hudY         = 20;
    
    ctx.fillStyle      = 'rgba(30, 41, 59, 0.95)';
    ctx.strokeStyle    = timer.mode === 'WORK' ? '#f43f5e' : '#10b981';
    ctx.lineWidth      = 2;
    ctx.fillRect(hudX, hudY, hudW, hudH);
    ctx.strokeRect(hudX, hudY, hudW, hudH);
    
    const scenarioName = (scenarioConfigs[currentConfig.map] || scenarioConfigs.cafeteria).name;
    ctx.fillStyle      = timer.mode === 'WORK' ? '#f43f5e' : '#10b981';
    ctx.font           = 'bold 10px Courier New';
    ctx.textAlign      = 'center';
    ctx.fillText(`${scenarioName} • ${timer.mode === 'WORK' ? 'STUDY SESSION' : 'REST BREAK'}`, canvas.width * 0.5, hudY + 20);
    
    ctx.fillStyle      = '#ffffff';
    ctx.font           = 'bold 24px Courier New';
    ctx.fillText(timeStr, canvas.width * 0.5, hudY + 46);
    
    const maxSeconds   = timer.mode === 'WORK' ? currentConfig.focusTime * 60 : currentConfig.breakTime * 60;
    const progress     = timer.timerSeconds / maxSeconds;
    
    ctx.fillStyle      = '#334155';
    ctx.fillRect(hudX + 10, hudY + hudH - 8, hudW - 20, 5);
    ctx.fillStyle      = timer.mode === 'WORK' ? '#f43f5e' : '#10b981';
    ctx.fillRect(hudX + 10, hudY + hudH - 8, (hudW - 20) * progress, 5);
}

let lastTime = 0;

function gameLoop(currentTime) {
    if (!lastTime) lastTime = currentTime;
    let deltaTime = (currentTime - lastTime) * 0.001;
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
const saveCustomBtn    = document.getElementById('btn-save-custom');
const customBackBtn    = document.getElementById('btn-custom-back');

const uiLayer          = document.getElementById('ui-layer');
const mainMenuPanel    = document.getElementById('main-menu');
const modeMenuPanel    = document.getElementById('mode-menu');
const configMenuPanel  = document.getElementById('solo-config-menu');
const customMenuPanel  = document.getElementById('custom-menu');
const escHint          = document.getElementById('esc-hint');

const focusInput       = document.getElementById('focus-time');
const breakInput       = document.getElementById('break-time');
const cyclesInput      = document.getElementById('cycles');
const mapSelect        = document.getElementById('map-select');
const npcInput         = document.getElementById('npc-count');
const playerNameInput  = document.getElementById('player-name');
const playerColorSelect = document.getElementById('player-color');

// Menu Panel Router Helper ('main', 'mode', 'config', 'custom', 'none')
function showPanel(target) {
    const panels = {
        'main':   mainMenuPanel,
        'mode':   modeMenuPanel,
        'config': configMenuPanel,
        'custom': customMenuPanel
    };

    if (target === 'none') {
        if (uiLayer) uiLayer.classList.add('hidden');
        if (escHint) escHint.classList.remove('hidden');
        return;
    }

    if (uiLayer) uiLayer.classList.remove('hidden');
    if (escHint) escHint.classList.add('hidden');

    Object.keys(panels).forEach(key => {
        const p = panels[key];
        if (p) {
            if (key === target) {
                p.classList.remove('hidden');
            } else {
                p.classList.add('hidden');
            }
        }
    });
}

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
                const pName     = config.playerName;
                const pColor    = config.playerColor;

                // Validate loaded bounds defensively
                if (!isNaN(focusVal) && focusVal >= 1 && focusVal <= 180)    currentConfig.focusTime  = focusVal;
                if (!isNaN(breakVal) && breakVal >= 1 && breakVal <= 60)     currentConfig.breakTime  = breakVal;
                if (!isNaN(cyclesVal) && cyclesVal >= 1 && cyclesVal <= 12)  currentConfig.cycles     = cyclesVal;
                if (!isNaN(npcVal) && npcVal >= 0 && npcVal <= 20)          currentConfig.npcCount   = npcVal;
                if (['cafeteria', 'library', 'garden'].includes(mapVal))     currentConfig.map        = mapVal;
                if (typeof pName === 'string' && pName.trim())               currentConfig.playerName = pName.trim();
                if (typeof pColor === 'string' && pColor.startsWith('#'))    currentConfig.playerColor = pColor;

                // Apply verified config to inputs
                if (focusInput)       focusInput.value        = currentConfig.focusTime;
                if (breakInput)       breakInput.value        = currentConfig.breakTime;
                if (cyclesInput)      cyclesInput.value       = currentConfig.cycles;
                if (mapSelect)        mapSelect.value         = currentConfig.map;
                if (npcInput)         npcInput.value          = currentConfig.npcCount;
                if (playerNameInput)  playerNameInput.value   = currentConfig.playerName;
                if (playerColorSelect)playerColorSelect.value = currentConfig.playerColor;
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

// Immediately kickstart background rendering loop so the scenario is visible behind menu
requestAnimationFrame(gameLoop);

// UI Screen Navigation Event Listeners
if (playBtn) {
    playBtn.addEventListener('click', () => {
        showPanel('mode');
    });
}

if (modeBackBtn) {
    modeBackBtn.addEventListener('click', () => {
        showPanel('main');
    });
}

if (soloBtn) {
    soloBtn.addEventListener('click', () => {
        showPanel('config');
    });
}

if (configBackBtn) {
    configBackBtn.addEventListener('click', () => {
        showPanel('mode');
    });
}

if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
        showPanel('config');
    });
}

if (customBtn) {
    customBtn.addEventListener('click', () => {
        showPanel('custom');
    });
}

if (customBackBtn) {
    customBackBtn.addEventListener('click', () => {
        showPanel('main');
    });
}

if (saveCustomBtn) {
    saveCustomBtn.addEventListener('click', () => {
        if (playerNameInput && playerNameInput.value.trim()) {
            currentConfig.playerName = playerNameInput.value.trim();
        }
        if (playerColorSelect) {
            currentConfig.playerColor = playerColorSelect.value;
        }

        try {
            localStorage.setItem('pomodoroConfig', JSON.stringify(currentConfig));
        } catch (err) {
            console.error('Failed to save customization:', err);
        }

        initGameWorld();
        showPanel('main');
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
            ...currentConfig,
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

        // Hide overlay menu
        showPanel('none');
        console.log('Game config initialized:', gameConfig);

        // Reset game loop time baseline
        lastTime = performance.now();
    });
}

// ESC Key listener to toggle Pause / Menu during gameplay
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (uiLayer) {
            if (uiLayer.classList.contains('hidden')) {
                showPanel('config');
            } else {
                showPanel('none');
            }
        }
    }
});
