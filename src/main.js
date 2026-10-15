import { keys } from './engine/input.js';
import { Camera } from './engine/camera.js';
import { SPRITES, drawPixelSprite } from './engine/sprites.js';
import {
    renderScenarioFloor,
    renderScenarioEnvironment,
    scenarioConfigs,
    getStudySeats,
    getObstacles
} from './engine/scenarios.js';

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

// World size dimensions for all scenarios
const WORLD_WIDTH  = 1200;
const WORLD_HEIGHT = 800;

// Initialize camera viewport tracking with boundary clamping
const camera = new Camera(window.innerWidth, window.innerHeight);

// Responsive canvas sizing
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

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ----------------------------------------------------------------------------
// Retro Web Audio Sound Chimes (EarthBound / SNES 16-bit Style)
// ----------------------------------------------------------------------------
let audioCtx = null;
function getAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playRetroChime(type) {
    try {
        const actx = getAudioContext();
        if (!actx) return;

        if (type === 'focus_start') {
            // Bright cheerful 4-note arpeggio (C5 -> E5 -> G5 -> C6)
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, i) => {
                const osc  = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, actx.currentTime + i * 0.08);
                gain.gain.setValueAtTime(0.12, actx.currentTime + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + i * 0.08 + 0.22);
                osc.connect(gain);
                gain.connect(actx.destination);
                osc.start(actx.currentTime + i * 0.08);
                osc.stop(actx.currentTime + i * 0.08 + 0.24);
            });
        } else if (type === 'break_start') {
            // Soothing gentle chord (E5 -> D5 -> B4 -> G4)
            const notes = [659.25, 587.33, 493.88, 392.00];
            notes.forEach((freq, i) => {
                const osc  = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, actx.currentTime + i * 0.12);
                gain.gain.setValueAtTime(0.14, actx.currentTime + i * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + i * 0.12 + 0.35);
                osc.connect(gain);
                gain.connect(actx.destination);
                osc.start(actx.currentTime + i * 0.12);
                osc.stop(actx.currentTime + i * 0.12 + 0.38);
            });
        } else if (type === 'cycle_complete') {
            // Triumphant 16-bit fanfare
            const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
            notes.forEach((freq, i) => {
                const osc  = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, actx.currentTime + i * 0.1);
                gain.gain.setValueAtTime(0.08, actx.currentTime + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + i * 0.1 + 0.3);
                osc.connect(gain);
                gain.connect(actx.destination);
                osc.start(actx.currentTime + i * 0.1);
                osc.stop(actx.currentTime + i * 0.1 + 0.32);
            });
        }
    } catch (_) {
        // Audio playback error fallback
    }
}

// ----------------------------------------------------------------------------
// Configurations & Global State
// ----------------------------------------------------------------------------
const DEFAULT_CONFIG = {
    focusTime:   25,
    breakTime:   5,
    cycles:      4,
    map:         'cafeteria',
    npcCount:    5,
    playerName:  'Ness',
    playerColor: '#3b82f6'
};

const currentConfig = { ...DEFAULT_CONFIG };

const gameState = {
    players: {},
    pomodoro: {
        mode:         'WORK', // 'WORK' | 'BREAK' | 'LONG_BREAK'
        timerSeconds: 1500,
        isActive:     true,
        currentCycle: 1,
        totalCycles:  4
    }
};

// Populate map entities and reset timers dynamically
function initGameWorld() {
    const pId = (currentConfig.playerName && currentConfig.playerName.trim()) || 'Ness';

    // Spawn player near center of the room in open walking space
    gameState.players = {
        'my_id': {
            id:        pId,
            x:         600,
            y:         360,
            width:     32,
            height:    40,
            color:     currentConfig.playerColor || '#3b82f6',
            direction: 'down',
            state:     'IDLE'
        }
    };

    // Obtain designated study seats for current scenario
    const seats = getStudySeats(currentConfig.map);

    // Populate custom configuration defined NPC entities with non-overlapping seats
    const archetypes = ['NPC_SCHOLAR', 'NPC_GIRL', 'CHAR_SIT'];
    const npcColors  = ['#10b981', '#ec4899', '#f59e0b', '#8b5cf6', '#06b6d4'];

    for (let i = 1; i <= currentConfig.npcCount; i++) {
        const id = `npc_${i}`;
        let x, y, facing;

        if (i - 1 < seats.length) {
            const seat = seats[i - 1];
            x      = seat.x;
            y      = seat.y;
            facing = seat.facing || 'down';
        } else {
            // Spillover seats around cafe perimeter without overlapping desks
            const col = (i - seats.length - 1) % 4;
            const row = Math.floor((i - seats.length - 1) / 4);
            x      = 280 + col * 180;
            y      = 600 + row * 60;
            facing = 'down';
        }

        const archetype = archetypes[(i - 1) % archetypes.length];
        const color     = npcColors[(i - 1) % npcColors.length];

        gameState.players[id] = {
            id:        `Study Buddy ${i}`,
            x:         x,
            y:         y,
            width:     32,
            height:    40,
            color:     color,
            direction: facing,
            archetype: archetype,
            state:     'STUDYING'
        };
    }

    // Initialize timer parameters
    const timer        = gameState.pomodoro;
    timer.mode         = 'WORK';
    timer.timerSeconds = currentConfig.focusTime * 60;
    timer.isActive     = true;
    timer.currentCycle = 1;
    timer.totalCycles  = currentConfig.cycles || 4;
}

// ----------------------------------------------------------------------------
// Physics & AABB Collision System
// ----------------------------------------------------------------------------
function checkAABB(x, y, w, h, box) {
    return (
        x < box.x + box.w &&
        x + w > box.x &&
        y < box.y + box.h &&
        y + h > box.y
    );
}

function update(deltaTime) {
    const player = gameState.players['my_id'];
    if (!player) return;

    // Lock character controls if menu overlay is currently visible
    const isMenuOpen = uiLayer && !uiLayer.classList.contains('hidden');

    let dx = 0;
    let dy = 0;

    if (!isMenuOpen) {
        const SPEED = 160.0;
        const rawDx = (keys.d || keys.ArrowRight) - (keys.a || keys.ArrowLeft);
        const rawDy = (keys.s || keys.ArrowDown) - (keys.w || keys.ArrowUp);

        // Normalize velocity vector
        const len = Math.hypot(rawDx, rawDy);
        if (len > 0) {
            dx = (rawDx / len) * SPEED;
            dy = (rawDy / len) * SPEED;

            // Track character facing direction based on movement vector
            if (Math.abs(rawDx) >= Math.abs(rawDy)) {
                player.direction = rawDx > 0 ? 'right' : 'left';
            } else {
                player.direction = rawDy > 0 ? 'down' : 'up';
            }
            player.state = 'WALKING';
        } else {
            player.state = 'IDLE';
        }

        // Retrieve scenario solid collision bounding boxes
        const obstacles = getObstacles(currentConfig.map, WORLD_WIDTH, WORLD_HEIGHT);

        // Character hitbox inset for pleasing top-down depth (feet area)
        const hitboxMarginX = 6;
        const hitboxTopY    = 20; // Only check lower body for collisions
        const hitboxW       = player.width - hitboxMarginX * 2;
        const hitboxH       = player.height - hitboxTopY;

        // Move horizontally with obstacle collision check
        if (dx !== 0) {
            const nextX = player.x + dx * deltaTime;
            const testHitboxX = nextX + hitboxMarginX;
            const testHitboxY = player.y + hitboxTopY;

            let blockedX = false;
            for (let i = 0; i < obstacles.length; i++) {
                if (checkAABB(testHitboxX, testHitboxY, hitboxW, hitboxH, obstacles[i])) {
                    blockedX = true;
                    break;
                }
            }
            if (!blockedX) {
                player.x = nextX;
            }
        }

        // Move vertically with obstacle collision check
        if (dy !== 0) {
            const nextY = player.y + dy * deltaTime;
            const testHitboxX = player.x + hitboxMarginX;
            const testHitboxY = nextY + hitboxTopY;

            let blockedY = false;
            for (let i = 0; i < obstacles.length; i++) {
                if (checkAABB(testHitboxX, testHitboxY, hitboxW, hitboxH, obstacles[i])) {
                    blockedY = true;
                    break;
                }
            }
            if (!blockedY) {
                player.y = nextY;
            }
        }
    }

    // Clamp player to inner scenario bounds
    player.x = Math.max(20, Math.min(WORLD_WIDTH - 20 - player.width, player.x));
    player.y = Math.max(20, Math.min(WORLD_HEIGHT - 20 - player.height, player.y));

    // Smooth camera viewport boundary clamping
    camera.update(player.x, player.y, player.width, player.height, WORLD_WIDTH, WORLD_HEIGHT);

    // Pomodoro Timer Update & Full Cycle Management
    if (!isMenuOpen) {
        const timer = gameState.pomodoro;
        if (timer.isActive) {
            timer.timerSeconds -= deltaTime;

            if (timer.timerSeconds <= 0) {
                if (timer.mode === 'WORK') {
                    // Check if all work cycles completed
                    if (timer.currentCycle >= timer.totalCycles) {
                        timer.mode         = 'LONG_BREAK';
                        timer.timerSeconds = currentConfig.breakTime * 60 * 2; // Long break is double break duration
                        playRetroChime('cycle_complete');
                    } else {
                        timer.mode         = 'BREAK';
                        timer.timerSeconds = currentConfig.breakTime * 60;
                        playRetroChime('break_start');
                    }
                } else {
                    // Break completed -> advance cycle & start next focus session
                    if (timer.mode === 'BREAK') {
                        timer.currentCycle++;
                    } else {
                        timer.currentCycle = 1; // Long break resets cycle
                    }
                    timer.mode         = 'WORK';
                    timer.timerSeconds = currentConfig.focusTime * 60;
                    playRetroChime('focus_start');
                }
            }
        }
    }
}

// ----------------------------------------------------------------------------
// Rendering Pipeline
// ----------------------------------------------------------------------------
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // 1. Render scenario environment floor tiles
    renderScenarioFloor(ctx, WORLD_WIDTH, WORLD_HEIGHT, currentConfig.map);

    // 2. Render scenario furniture, props, and chairs
    renderScenarioEnvironment(ctx, WORLD_WIDTH, WORLD_HEIGHT, currentConfig.map);

    // 3. Render characters with proper Y-depth sorting
    const sortedCharacters = Object.values(gameState.players).sort((a, b) => (a.y + a.height) - (b.y + b.height));
    sortedCharacters.forEach(p => {
        drawCharacterSprite(ctx, p);
    });

    ctx.restore();

    // 4. Render EarthBound-inspired retro HUD
    drawPomodoro();
}

// Render EarthBound-style 4-directional character sprite with badge
function drawCharacterSprite(ctx, p) {
    const isPlayer = p.id === currentConfig.playerName || p.id === 'Ness' || p.id === 'my_id';

    // Drop shadow under character
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(p.x + p.width * 0.5, p.y + p.height - 2, p.width * 0.45, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const dir   = p.direction || 'down';
    const isMoving = p.state === 'WALKING';
    const time  = performance.now();
    const walkFrame = Math.floor(time / 200) % 2 === 0;

    let spriteData = SPRITES.CHAR_DOWN_IDLE;
    let flipX      = false;

    if (isPlayer) {
        if (dir === 'down') {
            spriteData = isMoving ? (walkFrame ? SPRITES.CHAR_DOWN_WALK_1 : SPRITES.CHAR_DOWN_WALK_2) : SPRITES.CHAR_DOWN_IDLE;
        } else if (dir === 'up') {
            spriteData = isMoving ? (walkFrame ? SPRITES.CHAR_UP_WALK_1 : SPRITES.CHAR_UP_WALK_2) : SPRITES.CHAR_UP_IDLE;
        } else if (dir === 'left') {
            spriteData = isMoving ? (walkFrame ? SPRITES.CHAR_SIDE_WALK_1 : SPRITES.CHAR_SIDE_WALK_2) : SPRITES.CHAR_SIDE_IDLE;
            flipX = false;
        } else if (dir === 'right') {
            spriteData = isMoving ? (walkFrame ? SPRITES.CHAR_SIDE_WALK_1 : SPRITES.CHAR_SIDE_WALK_2) : SPRITES.CHAR_SIDE_IDLE;
            flipX = true;
        }
    } else {
        // NPC archetypes
        if (p.archetype === 'NPC_SCHOLAR') {
            spriteData = SPRITES.NPC_SCHOLAR;
        } else if (p.archetype === 'NPC_GIRL') {
            spriteData = SPRITES.NPC_GIRL;
        } else {
            spriteData = SPRITES.CHAR_SIT;
        }

        if (dir === 'right') flipX = true;
    }

    const mainColor   = isPlayer ? (currentConfig.playerColor || '#3b82f6') : (p.color || '#10b981');
    const accentColor = isPlayer ? '#ef4444' : '#f59e0b';

    drawPixelSprite(ctx, spriteData, p.x, p.y, p.width, p.height, mainColor, accentColor, flipX);

    // EarthBound Dialogue Badge / Name Tag
    const tagText   = isPlayer ? p.id : (p.state === 'STUDYING' ? `📖 ${p.id}` : p.id);
    ctx.font        = 'bold 11px Courier New';
    const textWidth = ctx.measureText(tagText).width;
    const badgeW    = textWidth + 12;
    const badgeH    = 18;
    const badgeX    = p.x + p.width * 0.5 - badgeW * 0.5;
    const badgeY    = p.y - 22;

    ctx.fillStyle   = 'rgba(24, 20, 37, 0.9)';
    ctx.strokeStyle = isPlayer ? (currentConfig.playerColor || '#60a5fa') : '#34d399';
    ctx.lineWidth   = 1.5;
    ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
    ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);

    ctx.fillStyle = isPlayer ? '#ffffff' : '#a7f3d0';
    ctx.textAlign = 'center';
    ctx.fillText(tagText, p.x + p.width * 0.5, badgeY + 13);
}

// Render EarthBound Retro Pomodoro HUD
function drawPomodoro() {
    const timer        = gameState.pomodoro;
    const isMenuOpen   = uiLayer && !uiLayer.classList.contains('hidden');
    const totalSeconds = Math.max(0, Math.floor(timer.timerSeconds));
    const minutes      = Math.floor(totalSeconds / 60);
    const seconds      = totalSeconds % 60;
    const timeStr      = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const hudW = 280;
    const hudH = 78;
    const hudX = (canvas.width - hudW) * 0.5;
    const hudY = 16;

    // SNES EarthBound Double-Border HUD Frame
    ctx.fillStyle   = 'rgba(24, 20, 37, 0.96)';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth   = 2;
    ctx.fillRect(hudX, hudY, hudW, hudH);
    ctx.strokeRect(hudX, hudY, hudW, hudH);

    // Inner accent line
    const themeColor = timer.mode === 'WORK' ? '#ef4444' : (timer.mode === 'LONG_BREAK' ? '#38bdf8' : '#10b981');
    ctx.strokeStyle = themeColor;
    ctx.lineWidth   = 1;
    ctx.strokeRect(hudX + 3, hudY + 3, hudW - 6, hudH - 6);

    // Session Status Label
    const scenarioName = (scenarioConfigs[currentConfig.map] || scenarioConfigs.cafeteria).name;
    let modeText = '● FOCUS SESSION';
    if (isMenuOpen) {
        modeText = '⏸ PAUSED';
    } else if (timer.mode === 'BREAK') {
        modeText = '☕ SHORT BREAK';
    } else if (timer.mode === 'LONG_BREAK') {
        modeText = '🎉 LONG BREAK';
    }

    ctx.fillStyle = isMenuOpen ? '#facc15' : themeColor;
    ctx.font      = 'bold 11px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(`${scenarioName} • ${modeText}`, canvas.width * 0.5, hudY + 20);

    // Big Digital Clock
    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 26px Courier New';
    ctx.fillText(timeStr, canvas.width * 0.5, hudY + 48);

    // Cycle Tracker & Progress Bar
    let maxSeconds = currentConfig.focusTime * 60;
    if (timer.mode === 'BREAK') maxSeconds = currentConfig.breakTime * 60;
    if (timer.mode === 'LONG_BREAK') maxSeconds = currentConfig.breakTime * 60 * 2;

    const progress = Math.max(0, Math.min(1, timer.timerSeconds / Math.max(1, maxSeconds)));

    // Progress Bar Background
    ctx.fillStyle = '#334155';
    ctx.fillRect(hudX + 12, hudY + hudH - 12, hudW - 24, 6);

    // Progress Bar Fill
    ctx.fillStyle = themeColor;
    ctx.fillRect(hudX + 12, hudY + hudH - 12, (hudW - 24) * progress, 6);

    // Cycle Indicators (e.g. Cycle 1 of 4)
    const cycleText = `CYCLE ${timer.currentCycle}/${timer.totalCycles}`;
    ctx.fillStyle   = '#94a3b8';
    ctx.font        = 'bold 9px Courier New';
    ctx.textAlign   = 'right';
    ctx.fillText(cycleText, hudX + hudW - 12, hudY + 46);
}

// ----------------------------------------------------------------------------
// Game Loop Engine
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// DOM UI Controls & Navigation
// ----------------------------------------------------------------------------
const playBtn           = document.getElementById('btn-play');
const customBtn         = document.getElementById('btn-custom');
const settingsBtn       = document.getElementById('btn-settings');
const soloBtn           = document.getElementById('btn-solo');
const modeBackBtn       = document.getElementById('btn-mode-back');
const startGameBtn      = document.getElementById('btn-start-game');
const configBackBtn     = document.getElementById('btn-config-back');
const saveCustomBtn     = document.getElementById('btn-save-custom');
const customBackBtn     = document.getElementById('btn-custom-back');

const uiLayer           = document.getElementById('ui-layer');
const mainMenuPanel     = document.getElementById('main-menu');
const modeMenuPanel     = document.getElementById('mode-menu');
const configMenuPanel   = document.getElementById('solo-config-menu');
const customMenuPanel   = document.getElementById('custom-menu');
const pauseMenuPanel    = document.getElementById('pause-menu');
const escHint           = document.getElementById('esc-hint');

const resumeBtn         = document.getElementById('btn-resume');
const pauseSettingsBtn  = document.getElementById('btn-pause-settings');
const exitMainBtn       = document.getElementById('btn-exit-main');

const focusInput        = document.getElementById('focus-time');
const breakInput        = document.getElementById('break-time');
const cyclesInput       = document.getElementById('cycles');
const mapSelect         = document.getElementById('map-select');
const npcInput          = document.getElementById('npc-count');
const playerNameInput   = document.getElementById('player-name');
const playerColorSelect = document.getElementById('player-color');

let lastMenuPanel = 'main';
let gameStarted   = false;

// Menu Panel Router Helper ('main', 'mode', 'config', 'custom', 'pause', 'none')
function showPanel(target) {
    const panels = {
        'main':   mainMenuPanel,
        'mode':   modeMenuPanel,
        'config': configMenuPanel,
        'custom': customMenuPanel,
        'pause':  pauseMenuPanel
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

    // Update config start button label contextually
    if (target === 'config' && startGameBtn) {
        startGameBtn.textContent = gameStarted && lastMenuPanel === 'pause' ? 'Apply & Resume' : 'Start Game';
    }
}

// Safe LocalStorage Configuration Loader
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

                if (!isNaN(focusVal) && focusVal >= 1 && focusVal <= 180)    currentConfig.focusTime   = focusVal;
                if (!isNaN(breakVal) && breakVal >= 1 && breakVal <= 60)     currentConfig.breakTime   = breakVal;
                if (!isNaN(cyclesVal) && cyclesVal >= 1 && cyclesVal <= 12)  currentConfig.cycles      = cyclesVal;
                if (!isNaN(npcVal) && npcVal >= 0 && npcVal <= 20)          currentConfig.npcCount    = npcVal;
                if (['cafeteria', 'library', 'garden'].includes(mapVal))     currentConfig.map         = mapVal;
                if (typeof pName === 'string' && pName.trim())               currentConfig.playerName  = pName.trim();
                if (typeof pColor === 'string' && pColor.startsWith('#'))    currentConfig.playerColor = pColor;

                if (focusInput)        focusInput.value        = currentConfig.focusTime;
                if (breakInput)        breakInput.value        = currentConfig.breakTime;
                if (cyclesInput)       cyclesInput.value       = currentConfig.cycles;
                if (mapSelect)         mapSelect.value         = currentConfig.map;
                if (npcInput)          npcInput.value          = currentConfig.npcCount;
                if (playerNameInput)   playerNameInput.value   = currentConfig.playerName;
                if (playerColorSelect) playerColorSelect.value = currentConfig.playerColor;
            }
        }
    } catch (err) {
        console.error('Failed to load saved settings:', err);
    }
}

// ----------------------------------------------------------------------------
// Event Listeners
// ----------------------------------------------------------------------------
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
        lastMenuPanel = 'mode';
        showPanel('config');
    });
}

if (configBackBtn) {
    configBackBtn.addEventListener('click', () => {
        showPanel(lastMenuPanel);
    });
}

if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
        lastMenuPanel = 'main';
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

        const gameConfig = {
            ...currentConfig,
            focusTime: (!isNaN(focusVal) && focusVal >= 1 && focusVal <= 180) ? focusVal : 25,
            breakTime: (!isNaN(breakVal) && breakVal >= 1 && breakVal <= 60) ? breakVal : 5,
            cycles:    (!isNaN(cyclesVal) && cyclesVal >= 1 && cyclesVal <= 12) ? cyclesVal : 4,
            map:       ['cafeteria', 'library', 'garden'].includes(mapVal) ? mapVal : 'cafeteria',
            npcCount:  (!isNaN(npcVal) && npcVal >= 0 && npcVal <= 20) ? npcVal : 5
        };

        Object.assign(currentConfig, gameConfig);

        try {
            localStorage.setItem('pomodoroConfig', JSON.stringify(gameConfig));
        } catch (err) {
            console.error('Failed to persist settings:', err);
        }

        gameStarted = true;
        initGameWorld();
        showPanel('none');
        lastTime = performance.now();
        playRetroChime('focus_start');
    });
}

if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
        lastTime = performance.now();
        showPanel('none');
    });
}

if (pauseSettingsBtn) {
    pauseSettingsBtn.addEventListener('click', () => {
        lastMenuPanel = 'pause';
        showPanel('config');
    });
}

if (exitMainBtn) {
    exitMainBtn.addEventListener('click', () => {
        showPanel('main');
    });
}

// ESC Key listener to toggle Pause Menu cleanly during gameplay
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (uiLayer) {
            if (uiLayer.classList.contains('hidden')) {
                // In game -> Pause
                showPanel('pause');
            } else {
                if (pauseMenuPanel && !pauseMenuPanel.classList.contains('hidden')) {
                    // In Pause Menu -> Resume
                    lastTime = performance.now();
                    showPanel('none');
                } else if (configMenuPanel && !configMenuPanel.classList.contains('hidden')) {
                    showPanel(lastMenuPanel);
                } else if (customMenuPanel && !customMenuPanel.classList.contains('hidden')) {
                    showPanel('main');
                } else if (modeMenuPanel && !modeMenuPanel.classList.contains('hidden')) {
                    showPanel('main');
                }
            }
        }
    }
});

// ----------------------------------------------------------------------------
// Startup Initialization
// ----------------------------------------------------------------------------
loadSavedSettings();
initGameWorld();
showPanel('main');
requestAnimationFrame(gameLoop);
