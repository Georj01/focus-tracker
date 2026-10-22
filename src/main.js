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
import { sound } from './engine/audio.js';
import { taskManager } from './engine/tasks.js';
import { statsTracker } from './engine/stats.js';
import { dialogSystem } from './engine/dialog.js';
import { interactionManager } from './engine/interactions.js';
import { i18n } from './engine/i18n.js';

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

const WORLD_WIDTH  = 1200;
const WORLD_HEIGHT = 800;

const camera = new Camera(window.innerWidth, window.innerHeight);

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
// Configurations & Global State
// ----------------------------------------------------------------------------
const DEFAULT_CONFIG = {
    focusTime:   25,
    breakTime:   5,
    cycles:      4,
    map:         'cafeteria',
    npcCount:    5,
    playerName:  'Ness',
    playerColor: '#3b82f6',
    ambientType: 'off',
    volume:      70,
    language:    'en'
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

let gameStarted     = false;
let nearbyInteract  = null;

// Initialize map entities and study buddy NPCs
function initGameWorld() {
    const pId = (currentConfig.playerName && currentConfig.playerName.trim()) || 'Ness';

    // Reset local player node
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

    interactionManager.currentSeat = null;

    // Retrieve study seats for current scenario
    const seats = getStudySeats(currentConfig.map);

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
            const col = (i - seats.length - 1) % 4;
            const row = Math.floor((i - seats.length - 1) / 4);
            x      = 280 + col * 180;
            y      = 600 + row * 60;
            facing = 'down';
        }

        const archetype = archetypes[(i - 1) % archetypes.length];
        const color     = npcColors[(i - 1) % npcColors.length];

        gameState.players[id] = {
            id:        `${i18n.t('studyBuddyPrefix')} ${i}`,
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

    // Reset Pomodoro timer
    const timer        = gameState.pomodoro;
    timer.mode         = 'WORK';
    timer.timerSeconds = currentConfig.focusTime * 60;
    timer.isActive     = true;
    timer.currentCycle = 1;
    timer.totalCycles  = currentConfig.cycles || 4;

    updateHUDActiveTask();
}

function checkAABB(x, y, w, h, box) {
    return (
        x < box.x + box.w &&
        x + w > box.x &&
        y < box.y + box.h &&
        y + h > box.y
    );
}

// ----------------------------------------------------------------------------
// Main Update & Physics Loop
// ----------------------------------------------------------------------------
function update(deltaTime) {
    dialogSystem.update(deltaTime);

    const player = gameState.players['my_id'];
    if (!player) return;

    const isMenuOpen = uiLayer && !uiLayer.classList.contains('hidden');
    const npcs = Object.values(gameState.players).filter(p => p.id !== player.id);

    // Track nearby interactive triggers (chairs, counter, books, NPCs)
    if (!isMenuOpen) {
        nearbyInteract = interactionManager.getNearbyInteraction(player, currentConfig.map, npcs);
    } else {
        nearbyInteract = null;
    }

    let dx = 0;
    let dy = 0;

    // Movement allowed only when menu & dialogs are closed
    if (!isMenuOpen && !dialogSystem.isOpen) {
        const SPEED = 160.0;
        const rawDx = (keys.d || keys.ArrowRight) - (keys.a || keys.ArrowLeft);
        const rawDy = (keys.s || keys.ArrowDown) - (keys.w || keys.ArrowUp);

        // If player is currently seated studying, any movement key stands up
        if (interactionManager.currentSeat && (rawDx !== 0 || rawDy !== 0)) {
            interactionManager.handleInteraction(player, { type: 'stand' });
        }

        if (!interactionManager.currentSeat) {
            const len = Math.hypot(rawDx, rawDy);
            if (len > 0) {
                dx = (rawDx / len) * SPEED;
                dy = (rawDy / len) * SPEED;

                if (Math.abs(rawDx) >= Math.abs(rawDy)) {
                    player.direction = rawDx > 0 ? 'right' : 'left';
                } else {
                    player.direction = rawDy > 0 ? 'down' : 'up';
                }
                player.state = 'WALKING';
            } else {
                player.state = 'IDLE';
            }

            const obstacles = getObstacles(currentConfig.map, WORLD_WIDTH, WORLD_HEIGHT);

            const hitboxMarginX = 6;
            const hitboxTopY    = 20;
            const hitboxW       = player.width - hitboxMarginX * 2;
            const hitboxH       = player.height - hitboxTopY;

            // X-Axis Movement with AABB Collision
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
                if (!blockedX) player.x = nextX;
            }

            // Y-Axis Movement with AABB Collision
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
                if (!blockedY) player.y = nextY;
            }
        }
    }

    // Contain inside perimeter
    player.x = Math.max(20, Math.min(WORLD_WIDTH - 20 - player.width, player.x));
    player.y = Math.max(20, Math.min(WORLD_HEIGHT - 20 - player.height, player.y));

    camera.update(player.x, player.y, player.width, player.height, WORLD_WIDTH, WORLD_HEIGHT);

    // Pomodoro Timer Logic & Productivity Tracking
    if (!isMenuOpen) {
        const timer = gameState.pomodoro;
        if (timer.isActive) {
            timer.timerSeconds -= deltaTime;

            if (timer.timerSeconds <= 0) {
                if (timer.mode === 'WORK') {
                    // Record completed focus session in analytics
                    statsTracker.recordCompletedSession(currentConfig.focusTime);
                    updateStatsDisplay();

                    if (timer.currentCycle >= timer.totalCycles) {
                        timer.mode         = 'LONG_BREAK';
                        timer.timerSeconds = currentConfig.breakTime * 60 * 2;
                        sound.play('cycle_complete');
                        dialogSystem.show(i18n.t('dialogCycleTitle'), i18n.t('dialogCycleBody'));
                    } else {
                        timer.mode         = 'BREAK';
                        timer.timerSeconds = currentConfig.breakTime * 60;
                        sound.play('break_start');
                    }
                } else {
                    if (timer.mode === 'BREAK') {
                        timer.currentCycle++;
                    } else {
                        timer.currentCycle = 1;
                    }
                    timer.mode         = 'WORK';
                    timer.timerSeconds = currentConfig.focusTime * 60;
                    sound.play('focus_start');
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

    // 1. Scenario Floor
    renderScenarioFloor(ctx, WORLD_WIDTH, WORLD_HEIGHT, currentConfig.map);

    // 2. Scenario Environment Furniture & Decor
    renderScenarioEnvironment(ctx, WORLD_WIDTH, WORLD_HEIGHT, currentConfig.map);

    // 3. Characters with Y-Depth Sorting
    const sortedChars = Object.values(gameState.players).sort((a, b) => (a.y + a.height) - (b.y + b.height));
    sortedChars.forEach(p => {
        drawCharacterSprite(ctx, p);
    });

    // 4. Interactive Proximity Prompt
    if (nearbyInteract) {
        interactionManager.drawPrompt(ctx, nearbyInteract);
    }

    ctx.restore();

    // 5. EarthBound Retro Pomodoro HUD
    drawPomodoro();

    // 6. Retro Dialogue Box
    dialogSystem.draw(ctx, canvas.width, canvas.height);
}

function drawCharacterSprite(ctx, p) {
    const isPlayer = p.id === currentConfig.playerName || p.id === 'Ness' || p.id === 'my_id';

    // Drop shadow under character
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(p.x + p.width * 0.5, p.y + p.height - 2, p.width * 0.45, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const dir      = p.direction || 'down';
    const isMoving = p.state === 'WALKING';
    const isSitting = p.state === 'STUDYING' && isPlayer;
    const time     = performance.now();
    const walkFrame = Math.floor(time / 200) % 2 === 0;

    let spriteData = SPRITES.CHAR_DOWN_IDLE;
    let flipX      = false;

    if (isPlayer) {
        if (isSitting) {
            spriteData = SPRITES.CHAR_SIT;
            if (dir === 'left') flipX = false;
            if (dir === 'right') flipX = true;
        } else if (dir === 'down') {
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

    // Badge / Name Tag
    const tagText   = isPlayer ? p.id : (p.state === 'STUDYING' ? `📖 ${p.id}` : p.id);
    ctx.font        = 'bold 11px Courier New, "MS Gothic", "Noto Sans JP", monospace, sans-serif';
    const textWidth = ctx.measureText(tagText).width;
    const badgeW    = textWidth + 14;
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

    // SNES Double-Border Frame
    ctx.fillStyle   = 'rgba(24, 20, 37, 0.96)';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth   = 2;
    ctx.fillRect(hudX, hudY, hudW, hudH);
    ctx.strokeRect(hudX, hudY, hudW, hudH);

    const themeColor = timer.mode === 'WORK' ? '#ef4444' : (timer.mode === 'LONG_BREAK' ? '#38bdf8' : '#10b981');
    ctx.strokeStyle  = themeColor;
    ctx.lineWidth    = 1;
    ctx.strokeRect(hudX + 3, hudY + 3, hudW - 6, hudH - 6);

    // Multilingual Scenario Title
    let scenarioName = i18n.t('mapCafeteria');
    if (currentConfig.map === 'library') scenarioName = i18n.t('mapLibrary');
    else if (currentConfig.map === 'garden') scenarioName = i18n.t('mapGarden');

    // Multilingual Mode Label
    let modeText = i18n.t('hudFocusSession');
    if (!timer.isActive || isMenuOpen) {
        modeText = i18n.t('hudPaused');
    } else if (timer.mode === 'BREAK') {
        modeText = i18n.t('hudShortBreak');
    } else if (timer.mode === 'LONG_BREAK') {
        modeText = i18n.t('hudLongBreak');
    }

    ctx.fillStyle = (!timer.isActive || isMenuOpen) ? '#facc15' : themeColor;
    ctx.font      = 'bold 11px Courier New, "MS Gothic", "Noto Sans JP", monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${scenarioName} • ${modeText}`, canvas.width * 0.5, hudY + 20);

    // Digital Clock
    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 26px Courier New, "MS Gothic", "Noto Sans JP", monospace, sans-serif';
    ctx.fillText(timeStr, canvas.width * 0.5, hudY + 48);

    // Cycle & Progress
    let maxSeconds = currentConfig.focusTime * 60;
    if (timer.mode === 'BREAK') maxSeconds = currentConfig.breakTime * 60;
    if (timer.mode === 'LONG_BREAK') maxSeconds = currentConfig.breakTime * 60 * 2;

    const progress = Math.max(0, Math.min(1, timer.timerSeconds / Math.max(1, maxSeconds)));

    ctx.fillStyle = '#334155';
    ctx.fillRect(hudX + 12, hudY + hudH - 12, hudW - 24, 6);

    ctx.fillStyle = themeColor;
    ctx.fillRect(hudX + 12, hudY + hudH - 12, (hudW - 24) * progress, 6);

    const cycleText = `${i18n.t('hudCycle')} ${timer.currentCycle}/${timer.totalCycles}`;
    ctx.fillStyle   = '#94a3b8';
    ctx.font        = 'bold 9px Courier New, "MS Gothic", "Noto Sans JP", monospace, sans-serif';
    ctx.textAlign   = 'right';
    ctx.fillText(cycleText, hudX + hudW - 12, hudY + 46);
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

// ----------------------------------------------------------------------------
// DOM References & Event Handlers
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
const controlsLegend    = document.getElementById('controls-legend');

const resumeBtn         = document.getElementById('btn-resume');
const pauseTasksBtn     = document.getElementById('btn-pause-tasks');
const pauseSettingsBtn  = document.getElementById('btn-pause-settings');
const exitMainBtn       = document.getElementById('btn-exit-main');

const focusInput        = document.getElementById('focus-time');
const breakInput        = document.getElementById('break-time');
const cyclesInput       = document.getElementById('cycles');
const mapSelect         = document.getElementById('map-select');
const npcInput          = document.getElementById('npc-count');
const playerNameInput   = document.getElementById('player-name');
const playerColorSelect = document.getElementById('player-color');
const ambientSelect     = document.getElementById('ambient-select');
const volumeSlider      = document.getElementById('volume-slider');
const languageSelect    = document.getElementById('language-select');
const langButtons       = document.querySelectorAll('.lang-btn');

// Top HUD Elements
const hudOverlay        = document.getElementById('hud-overlay');
const hudTaskText       = document.getElementById('hud-task-text');
const hudTag            = document.getElementById('hud-tag');
const btnHudPlay        = document.getElementById('btn-hud-play');
const btnHudSkip        = document.getElementById('btn-hud-skip');
const btnHudTasks       = document.getElementById('btn-hud-tasks');
const btnHudSound       = document.getElementById('btn-hud-sound');

// Task Drawer Elements
const taskDrawer        = document.getElementById('task-drawer');
const taskForm          = document.getElementById('task-form');
const taskInput         = document.getElementById('task-input');
const taskList          = document.getElementById('task-list');
const btnCloseTasks     = document.getElementById('btn-close-tasks');
const lblDrawerTitle    = document.getElementById('lbl-drawer-title');
const btnAddTask        = document.getElementById('btn-add-task');
const lblDrawerFooter   = document.getElementById('lbl-drawer-footer');

// Pause Stats Elements
const statTodayMin      = document.getElementById('stat-today-min');
const statSessions      = document.getElementById('stat-sessions');
const statStreak        = document.getElementById('stat-streak');
const lblStatToday      = document.getElementById('lbl-stat-today');
const lblStatSessions   = document.getElementById('lbl-stat-sessions');
const lblStatStreak     = document.getElementById('lbl-stat-streak');

// Main Menu Text Labels
const lblMainTitle      = document.getElementById('lbl-main-title');
const lblMainSubtitle   = document.getElementById('lbl-main-subtitle');
const linkAbout         = document.getElementById('link-about');

// Mode Menu Labels
const lblModeTitle      = document.getElementById('lbl-mode-title');
const btnMultiplayer    = document.getElementById('btn-multiplayer');

// Config Labels
const lblConfigTitle    = document.getElementById('lbl-config-title');
const lblCfgFocus       = document.getElementById('lbl-cfg-focus');
const lblCfgBreak       = document.getElementById('lbl-cfg-break');
const lblCfgCycles      = document.getElementById('lbl-cfg-cycles');
const lblCfgMap         = document.getElementById('lbl-cfg-map');
const lblCfgNpc         = document.getElementById('lbl-cfg-npc');
const lblCfgAmbient     = document.getElementById('lbl-cfg-ambient');
const lblCfgVolume      = document.getElementById('lbl-cfg-volume');
const lblCfgLanguage    = document.getElementById('lbl-cfg-language');

// Map Options
const optMapCafeteria   = document.getElementById('opt-map-cafeteria');
const optMapLibrary     = document.getElementById('opt-map-library');
const optMapGarden      = document.getElementById('opt-map-garden');

// Ambient Options
const optAmbientOff     = document.getElementById('opt-ambient-off');
const optAmbientRain    = document.getElementById('opt-ambient-rain');
const optAmbientCafe    = document.getElementById('opt-ambient-cafe');

// Customization Labels
const lblCustomTitle    = document.getElementById('lbl-custom-title');
const lblCustomName     = document.getElementById('lbl-custom-name');
const lblCustomColor    = document.getElementById('lbl-custom-color');
const optColorNess      = document.getElementById('opt-color-ness');
const optColorPaula     = document.getElementById('opt-color-paula');
const optColorJeff      = document.getElementById('opt-color-jeff');
const optColorPoo       = document.getElementById('opt-color-poo');
const optColorPurple    = document.getElementById('opt-color-purple');
const optColorGold      = document.getElementById('opt-color-gold');

// Pause Menu Labels
const lblPauseTitle     = document.getElementById('lbl-pause-title');

// Controls Legend Elements
const legendMove        = document.getElementById('legend-move');
const legendInteract    = document.getElementById('legend-interact');
const legendPause       = document.getElementById('legend-pause');
const legendTasks       = document.getElementById('legend-tasks');
const legendMute        = document.getElementById('legend-mute');
const legendMenu        = document.getElementById('legend-menu');

let lastMenuPanel = 'main';

// ----------------------------------------------------------------------------
// Multilingual Translation Applicator
// ----------------------------------------------------------------------------
function applyLanguage(lang) {
    i18n.setLanguage(lang);
    currentConfig.language = lang;

    // Update active state on language pills
    langButtons.forEach(btn => {
        if (btn.dataset.lang === lang) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    if (languageSelect) languageSelect.value = lang;

    // Main Menu
    if (lblMainTitle)    lblMainTitle.textContent    = i18n.t('appTitle');
    if (lblMainSubtitle) lblMainSubtitle.textContent = i18n.t('appSubtitle');
    if (playBtn)         playBtn.textContent         = i18n.t('playGame');
    if (customBtn)       customBtn.textContent       = i18n.t('userCustomization');
    if (settingsBtn)     settingsBtn.textContent     = i18n.t('soloSettings');
    if (linkAbout)       linkAbout.textContent       = i18n.t('aboutProject');

    // Mode Menu
    if (lblModeTitle)    lblModeTitle.textContent    = i18n.t('selectMode');
    if (soloBtn)         soloBtn.textContent         = i18n.t('soloStudySpace');
    if (btnMultiplayer)  btnMultiplayer.textContent  = i18n.t('multiplayerSoon');
    if (modeBackBtn)     modeBackBtn.textContent     = i18n.t('back');

    // Solo Config Menu
    if (lblConfigTitle)  lblConfigTitle.textContent  = i18n.t('soloSettings');
    if (lblCfgFocus)     lblCfgFocus.textContent     = i18n.t('focusDuration');
    if (lblCfgBreak)     lblCfgBreak.textContent     = i18n.t('breakDuration');
    if (lblCfgCycles)    lblCfgCycles.textContent    = i18n.t('sessionCycles');
    if (lblCfgMap)       lblCfgMap.textContent       = i18n.t('selectMap');
    if (lblCfgNpc)       lblCfgNpc.textContent       = i18n.t('npcStudyBuddies');
    if (lblCfgAmbient)   lblCfgAmbient.textContent   = i18n.t('ambientSound');
    if (lblCfgVolume)    lblCfgVolume.textContent    = i18n.t('masterVolume');
    if (lblCfgLanguage)  lblCfgLanguage.textContent  = i18n.t('language');

    if (optMapCafeteria) optMapCafeteria.textContent = i18n.t('mapCafeteria');
    if (optMapLibrary)   optMapLibrary.textContent   = i18n.t('mapLibrary');
    if (optMapGarden)    optMapGarden.textContent    = i18n.t('mapGarden');

    if (optAmbientOff)   optAmbientOff.textContent   = i18n.t('ambientOff');
    if (optAmbientRain)  optAmbientRain.textContent  = i18n.t('ambientRain');
    if (optAmbientCafe)  optAmbientCafe.textContent  = i18n.t('ambientCafe');

    if (startGameBtn) {
        startGameBtn.textContent = gameStarted && lastMenuPanel === 'pause' ? i18n.t('applyResume') : i18n.t('startGame');
    }
    if (configBackBtn)   configBackBtn.textContent   = i18n.t('back');

    // Customization Menu
    if (lblCustomTitle)  lblCustomTitle.textContent  = i18n.t('userCustomization');
    if (lblCustomName)   lblCustomName.textContent   = i18n.t('playerNameTag');
    if (lblCustomColor)  lblCustomColor.textContent  = i18n.t('avatarColor');
    if (optColorNess)    optColorNess.textContent    = i18n.t('colorNess');
    if (optColorPaula)   optColorPaula.textContent   = i18n.t('colorPaula');
    if (optColorJeff)    optColorJeff.textContent    = i18n.t('colorJeff');
    if (optColorPoo)     optColorPoo.textContent     = i18n.t('colorPoo');
    if (optColorPurple)  optColorPurple.textContent  = i18n.t('colorPurple');
    if (optColorGold)    optColorGold.textContent    = i18n.t('colorGold');
    if (saveCustomBtn)   saveCustomBtn.textContent   = i18n.t('saveAvatar');
    if (customBackBtn)   customBackBtn.textContent   = i18n.t('back');

    // Pause Menu
    if (lblPauseTitle)    lblPauseTitle.textContent    = i18n.t('gamePaused');
    if (lblStatToday)     lblStatToday.textContent     = i18n.t('statTodayMin');
    if (lblStatSessions)  lblStatSessions.textContent  = i18n.t('statCompleted');
    if (lblStatStreak)    lblStatStreak.textContent    = i18n.t('statStreak');
    if (resumeBtn)        resumeBtn.textContent        = i18n.t('resume');
    if (pauseTasksBtn)    pauseTasksBtn.textContent    = i18n.t('tasksButton');
    if (pauseSettingsBtn) pauseSettingsBtn.textContent = i18n.t('settings');
    if (exitMainBtn)      exitMainBtn.textContent      = i18n.t('exitMainMenu');

    // HUD Elements
    if (hudTag)      hudTag.textContent      = i18n.t('currentFocus');
    if (btnHudPlay)  btnHudPlay.textContent  = gameState.pomodoro.isActive ? i18n.t('hudPause') : i18n.t('hudResume');
    if (btnHudSkip)  btnHudSkip.textContent  = i18n.t('hudSkip');
    if (btnHudTasks) btnHudTasks.textContent = i18n.t('tasksButton');
    if (btnHudSound) btnHudSound.textContent = sound.isMuted ? i18n.t('hudMuted') : i18n.t('hudAudio');

    // Task Drawer
    if (lblDrawerTitle)  lblDrawerTitle.textContent  = i18n.t('focusTasks');
    if (taskInput)       taskInput.placeholder       = i18n.t('taskPlaceholder');
    if (btnAddTask)      btnAddTask.textContent      = i18n.t('addTask');
    if (lblDrawerFooter) lblDrawerFooter.textContent = i18n.t('taskTip');

    // Bottom Legend
    if (legendMove)     legendMove.textContent     = i18n.t('legendMove');
    if (legendInteract) legendInteract.textContent = i18n.t('legendInteract');
    if (legendPause)    legendPause.textContent    = i18n.t('legendPause');
    if (legendTasks)    legendTasks.textContent    = i18n.t('legendTasks');
    if (legendMute)     legendMute.textContent     = i18n.t('legendMute');
    if (legendMenu)     legendMenu.textContent     = i18n.t('legendMenu');

    // Refresh Study Buddy names dynamically
    let buddyIdx = 1;
    Object.keys(gameState.players).forEach(k => {
        if (k !== 'my_id') {
            gameState.players[k].id = `${i18n.t('studyBuddyPrefix')} ${buddyIdx++}`;
        }
    });

    renderTasks();
    updateStatsDisplay();
}

function updateStatsDisplay() {
    const stats = statsTracker.getStats();
    if (statTodayMin) statTodayMin.textContent = stats.todayFocusMinutes;
    if (statSessions) statSessions.textContent = stats.completedSessions;
    if (statStreak)   statStreak.textContent   = stats.currentStreak;
}

function updateHUDActiveTask() {
    const active = taskManager.getActiveTask();
    if (hudTaskText) {
        hudTaskText.textContent = active ? active.text : i18n.t('defaultTask');
    }
}

function renderTasks() {
    if (!taskList) return;
    taskList.innerHTML = '';
    const tasks  = taskManager.getTasks();
    const active = taskManager.getActiveTask();

    tasks.forEach(t => {
        const item = document.createElement('div');
        item.className = `task-item ${t.completed ? 'completed' : ''} ${active && active.id === t.id ? 'active' : ''}`;

        const chk = document.createElement('input');
        chk.type      = 'checkbox';
        chk.className = 'task-check';
        chk.checked   = t.completed;
        chk.addEventListener('change', () => {
            taskManager.toggleTask(t.id);
            renderTasks();
            updateHUDActiveTask();
        });

        const span = document.createElement('span');
        span.className   = 'task-text';
        span.textContent = t.text;
        span.title       = 'Click to set as active focus task';
        span.addEventListener('click', () => {
            taskManager.setActiveTask(t.id);
            renderTasks();
            updateHUDActiveTask();
        });

        const del = document.createElement('button');
        del.className   = 'task-del';
        del.textContent = '✕';
        del.title       = 'Delete task';
        del.addEventListener('click', () => {
            taskManager.deleteTask(t.id);
            renderTasks();
            updateHUDActiveTask();
        });

        item.appendChild(chk);
        item.appendChild(span);
        item.appendChild(del);
        taskList.appendChild(item);
    });

    updateHUDActiveTask();
}

function toggleTaskDrawer(show = null) {
    if (!taskDrawer) return;
    const isVisible = !taskDrawer.classList.contains('hidden');
    const shouldShow = show !== null ? show : !isVisible;

    if (shouldShow) {
        taskDrawer.classList.remove('hidden');
        renderTasks();
        if (taskInput) taskInput.focus();
    } else {
        taskDrawer.classList.add('hidden');
    }
    sound.play('click');
}

function toggleTimerPlayPause() {
    const timer = gameState.pomodoro;
    timer.isActive = !timer.isActive;
    if (btnHudPlay) {
        btnHudPlay.textContent = timer.isActive ? i18n.t('hudPause') : i18n.t('hudResume');
    }
    sound.play('click');
}

function skipPomodoroSession() {
    const timer = gameState.pomodoro;
    timer.timerSeconds = 0.5; // Force immediate transition in next frame
    sound.play('click');
}

// Router for Menu Panels
function showPanel(target) {
    const panels = {
        'main':   mainMenuPanel,
        'mode':   modeMenuPanel,
        'config': configMenuPanel,
        'custom': customMenuPanel,
        'pause':  pauseMenuPanel
    };

    if (target === 'none') {
        if (uiLayer)        uiLayer.classList.add('hidden');
        if (hudOverlay)     hudOverlay.classList.remove('hidden');
        if (controlsLegend) controlsLegend.classList.remove('hidden');
        return;
    }

    if (uiLayer)        uiLayer.classList.remove('hidden');
    if (hudOverlay)     hudOverlay.classList.add('hidden');
    if (controlsLegend) controlsLegend.classList.add('hidden');

    Object.keys(panels).forEach(key => {
        const p = panels[key];
        if (p) {
            if (key === target) p.classList.remove('hidden');
            else p.classList.add('hidden');
        }
    });

    if (target === 'pause') {
        updateStatsDisplay();
    }

    if (target === 'config' && startGameBtn) {
        startGameBtn.textContent = gameStarted && lastMenuPanel === 'pause' ? i18n.t('applyResume') : i18n.t('startGame');
    }
}

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
                const lang      = config.language;

                if (!isNaN(focusVal) && focusVal >= 1 && focusVal <= 180)    currentConfig.focusTime   = focusVal;
                if (!isNaN(breakVal) && breakVal >= 1 && breakVal <= 60)     currentConfig.breakTime   = breakVal;
                if (!isNaN(cyclesVal) && cyclesVal >= 1 && cyclesVal <= 12)  currentConfig.cycles      = cyclesVal;
                if (!isNaN(npcVal) && npcVal >= 0 && npcVal <= 14)          currentConfig.npcCount    = npcVal;
                if (['cafeteria', 'library', 'garden'].includes(mapVal))     currentConfig.map         = mapVal;
                if (typeof pName === 'string' && pName.trim())               currentConfig.playerName  = pName.trim();
                if (typeof pColor === 'string' && pColor.startsWith('#'))    currentConfig.playerColor = pColor;
                if (['en', 'es', 'ja'].includes(lang))                       currentConfig.language    = lang;

                if (focusInput)        focusInput.value        = currentConfig.focusTime;
                if (breakInput)        breakInput.value        = currentConfig.breakTime;
                if (cyclesInput)       cyclesInput.value       = currentConfig.cycles;
                if (mapSelect)         mapSelect.value         = currentConfig.map;
                if (npcInput)          npcInput.value          = currentConfig.npcCount;
                if (playerNameInput)   playerNameInput.value   = currentConfig.playerName;
                if (playerColorSelect) playerColorSelect.value = currentConfig.playerColor;
            }
        }
    } catch (_) {}

    if (ambientSelect) ambientSelect.value = sound.ambientType;
    if (volumeSlider)  volumeSlider.value  = Math.round(sound.masterVolume * 100);

    applyLanguage(currentConfig.language || i18n.getLanguage());
}

// ----------------------------------------------------------------------------
// Event Listeners
// ----------------------------------------------------------------------------
if (playBtn) {
    playBtn.addEventListener('click', () => {
        sound.play('click');
        showPanel('mode');
    });
}
if (modeBackBtn) {
    modeBackBtn.addEventListener('click', () => {
        sound.play('click');
        showPanel('main');
    });
}
if (soloBtn) {
    soloBtn.addEventListener('click', () => {
        sound.play('click');
        lastMenuPanel = 'mode';
        showPanel('config');
    });
}
if (configBackBtn) {
    configBackBtn.addEventListener('click', () => {
        sound.play('click');
        showPanel(lastMenuPanel);
    });
}
if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
        sound.play('click');
        lastMenuPanel = 'main';
        showPanel('config');
    });
}
if (customBtn) {
    customBtn.addEventListener('click', () => {
        sound.play('click');
        showPanel('custom');
    });
}
if (customBackBtn) {
    customBackBtn.addEventListener('click', () => {
        sound.play('click');
        showPanel('main');
    });
}

// Language Switchers
langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        applyLanguage(lang);
        sound.play('click');
    });
});

if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
        applyLanguage(e.target.value);
        sound.play('click');
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
        } catch (_) {}

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
        const langVal   = languageSelect ? languageSelect.value : 'en';

        const gameConfig = {
            ...currentConfig,
            focusTime: (!isNaN(focusVal) && focusVal >= 1 && focusVal <= 180) ? focusVal : 25,
            breakTime: (!isNaN(breakVal) && breakVal >= 1 && breakVal <= 60) ? breakVal : 5,
            cycles:    (!isNaN(cyclesVal) && cyclesVal >= 1 && cyclesVal <= 12) ? cyclesVal : 4,
            map:       ['cafeteria', 'library', 'garden'].includes(mapVal) ? mapVal : 'cafeteria',
            npcCount:  (!isNaN(npcVal) && npcVal >= 0 && npcVal <= 14) ? npcVal : 5,
            language:  ['en', 'es', 'ja'].includes(langVal) ? langVal : 'en'
        };

        Object.assign(currentConfig, gameConfig);

        try {
            localStorage.setItem('pomodoroConfig', JSON.stringify(gameConfig));
        } catch (_) {}

        if (ambientSelect) {
            sound.setAmbientType(ambientSelect.value);
        }

        applyLanguage(currentConfig.language);

        gameStarted = true;
        initGameWorld();
        showPanel('none');
        lastTime = performance.now();
        sound.play('focus_start');
    });
}

if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
        sound.play('click');
        lastTime = performance.now();
        showPanel('none');
    });
}

if (pauseTasksBtn) {
    pauseTasksBtn.addEventListener('click', () => {
        sound.play('click');
        toggleTaskDrawer(true);
    });
}

if (pauseSettingsBtn) {
    pauseSettingsBtn.addEventListener('click', () => {
        sound.play('click');
        lastMenuPanel = 'pause';
        showPanel('config');
    });
}

if (exitMainBtn) {
    exitMainBtn.addEventListener('click', () => {
        sound.play('click');
        sound.stopAmbient();
        showPanel('main');
    });
}

// Volume & Ambient Sound Listeners
if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
        sound.setMasterVolume(e.target.value / 100);
    });
}

if (ambientSelect) {
    ambientSelect.addEventListener('change', (e) => {
        sound.setAmbientType(e.target.value);
    });
}

// Top HUD Buttons
if (btnHudPlay)  btnHudPlay.addEventListener('click',  toggleTimerPlayPause);
if (btnHudSkip)  btnHudSkip.addEventListener('click',  skipPomodoroSession);
if (btnHudTasks) btnHudTasks.addEventListener('click', () => toggleTaskDrawer());
if (btnHudSound) {
    btnHudSound.addEventListener('click', () => {
        const isMuted = sound.toggleMute();
        btnHudSound.textContent = isMuted ? i18n.t('hudMuted') : i18n.t('hudAudio');
        sound.play('click');
    });
}

// Task Form Submit
if (taskForm) {
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (taskInput && taskInput.value.trim()) {
            taskManager.addTask(taskInput.value.trim());
            taskInput.value = '';
            renderTasks();
            updateHUDActiveTask();
        }
    });
}

if (btnCloseTasks) {
    btnCloseTasks.addEventListener('click', () => toggleTaskDrawer(false));
}

// ----------------------------------------------------------------------------
// Universal Keyboard Shortcuts
// ----------------------------------------------------------------------------
window.addEventListener('keydown', (e) => {
    // Ignore gameplay shortcuts if typing in an input
    const activeTag = document.activeElement ? document.activeElement.tagName : '';
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(activeTag)) {
        if (e.key === 'Escape') {
            document.activeElement.blur();
            toggleTaskDrawer(false);
        }
        return;
    }

    // Dialogue advances on Space, Enter, or E
    if (dialogSystem.isOpen && [' ', 'Enter', 'e', 'E'].includes(e.key)) {
        e.preventDefault();
        dialogSystem.advance();
        return;
    }

    if (e.key === 'Escape') {
        if (taskDrawer && !taskDrawer.classList.contains('hidden')) {
            toggleTaskDrawer(false);
            return;
        }

        if (uiLayer) {
            if (uiLayer.classList.contains('hidden')) {
                showPanel('pause');
            } else {
                if (pauseMenuPanel && !pauseMenuPanel.classList.contains('hidden')) {
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
        return;
    }

    // In-game hotkeys
    const isGameActive = uiLayer && uiLayer.classList.contains('hidden');
    if (!isGameActive) return;

    // [E] Trigger Nearby Interaction
    if (e.key === 'e' || e.key === 'E') {
        const player = gameState.players['my_id'];
        if (nearbyInteract && player) {
            interactionManager.handleInteraction(player, nearbyInteract);
        }
    }

    // [Space] Toggle Timer Play/Pause
    if (e.key === ' ') {
        e.preventDefault();
        toggleTimerPlayPause();
    }

    // [T] Toggle Task Drawer
    if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        toggleTaskDrawer();
    }

    // [M] Toggle Audio Mute
    if (e.key === 'm' || e.key === 'M') {
        const isMuted = sound.toggleMute();
        if (btnHudSound) btnHudSound.textContent = isMuted ? i18n.t('hudMuted') : i18n.t('hudAudio');
    }

    // [Tab] Skip Session
    if (e.key === 'Tab') {
        e.preventDefault();
        skipPomodoroSession();
    }
});

// ----------------------------------------------------------------------------
// Startup Initialization
// ----------------------------------------------------------------------------
function startApp() {
    resizeCanvas();
    loadSavedSettings();
    initGameWorld();
    renderTasks();
    updateStatsDisplay();
    showPanel('main');
    requestAnimationFrame(gameLoop);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}
