import { Camera } from './engine/camera.js';
import {
    renderScenarioFloor,
    renderScenarioEnvironment,
    scenarioConfigs
} from './engine/scenarios.js';
import { sound } from './engine/audio.js';
import { taskManager } from './engine/tasks.js';
import { statsTracker } from './engine/stats.js';
import { dialogSystem } from './engine/dialog.js';
import { interactionManager } from './engine/interactions.js';
import { i18n } from './engine/i18n.js';
import {
    WORLD_WIDTH,
    WORLD_HEIGHT,
    currentConfig,
    gameState,
    initGameWorld,
    updateWorldEntities,
    setPointerDestination,
    drawPointerTarget,
    drawCharacterSprite
} from './engine/world.js';
import {
    syncTimerWallClock,
    updatePomodoroTimer,
    drawPomodoroHUD
} from './engine/timer.js';

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
const camera = new Camera(window.innerWidth, window.innerHeight);

function resizeCanvas() {
    if (canvas) {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        camera.viewportWidth  = canvas.width;
        camera.viewportHeight = canvas.height;
    }
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let gameStarted    = false;
let nearbyInteract = null;
let lastMenuPanel  = 'main';

// ----------------------------------------------------------------------------
// DOM References
// ----------------------------------------------------------------------------
const el = id => document.getElementById(id);

const uiLayer           = el('ui-layer');
const mainMenuPanel     = el('main-menu');
const modeMenuPanel     = el('mode-menu');
const configMenuPanel   = el('solo-config-menu');
const customMenuPanel   = el('custom-menu');
const pauseMenuPanel    = el('pause-menu');
const controlsLegend    = el('controls-legend');
const hudOverlay        = el('hud-overlay');
const taskDrawer        = el('task-drawer');

const focusInput        = el('focus-time');
const breakInput        = el('break-time');
const cyclesInput       = el('cycles');
const mapSelect         = el('map-select');
const npcInput          = el('npc-count');
const playerNameInput   = el('player-name');
const playerColorSelect = el('player-color');
const ambientSelect     = el('ambient-select');
const volumeSlider      = el('volume-slider');
const languageSelect    = el('language-select');
const langButtons       = document.querySelectorAll('.lang-btn');

const btnHudInteract    = el('btn-hud-interact');
const btnHudPlay        = el('btn-hud-play');
const btnHudSkip        = el('btn-hud-skip');
const btnHudTasks       = el('btn-hud-tasks');
const btnHudSound       = el('btn-hud-sound');
const startGameBtn      = el('btn-start-game');
const taskForm          = el('task-form');
const taskInput         = el('task-input');
const taskList          = el('task-list');

// ----------------------------------------------------------------------------
// Main Update & Rendering Loop
// ----------------------------------------------------------------------------
function isMenuVisible() {
    return Boolean(uiLayer && !uiLayer.classList.contains('hidden'));
}

function update(deltaTime) {
    dialogSystem.update(deltaTime);

    const player = gameState.players['my_id'];
    if (!player) return;

    const isMenuOpen = isMenuVisible();
    const npcs       = Object.values(gameState.players).filter(p => p !== player);

    nearbyInteract = !isMenuOpen
        ? interactionManager.getNearbyInteraction(player, currentConfig.map, npcs)
        : null;

    if (btnHudInteract) {
        if (nearbyInteract && !dialogSystem.isOpen) {
            btnHudInteract.classList.remove('hidden');
            btnHudInteract.textContent = nearbyInteract.label;
        } else {
            btnHudInteract.classList.add('hidden');
        }
    }

    updateWorldEntities(deltaTime, isMenuOpen, nearbyInteract);
    camera.update(player.x, player.y, player.width, player.height, WORLD_WIDTH, WORLD_HEIGHT);

    updatePomodoroTimer(isMenuOpen, () => {
        renderTasks();
        updateStatsDisplay();
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    renderScenarioFloor(ctx, WORLD_WIDTH, WORLD_HEIGHT, currentConfig.map);
    renderScenarioEnvironment(ctx, WORLD_WIDTH, WORLD_HEIGHT, currentConfig.map);
    drawPointerTarget(ctx);

    const sortedChars = Object.values(gameState.players).sort((a, b) => (a.y + a.height) - (b.y + b.height));
    for (let i = 0; i < sortedChars.length; i++) {
        drawCharacterSprite(ctx, sortedChars[i]);
    }

    if (nearbyInteract) {
        interactionManager.drawPrompt(ctx, nearbyInteract);
    }

    ctx.restore();

    drawPomodoroHUD(ctx, canvas.width, isMenuVisible());
    dialogSystem.draw(ctx, canvas.width, canvas.height);
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

// Background tab heartbeat ensures Pomodoro timer never freezes when tab is hidden
setInterval(() => {
    if (document.hidden && gameStarted) {
        updatePomodoroTimer(isMenuVisible(), () => {
            renderTasks();
            updateStatsDisplay();
        });
    }
}, 1000);

document.addEventListener('visibilitychange', () => {
    if (!document.hidden && gameStarted) {
        lastTime = performance.now();
        updatePomodoroTimer(isMenuVisible(), () => {
            renderTasks();
            updateStatsDisplay();
        });
    }
});

// ----------------------------------------------------------------------------
// Click / Tap-to-Move & World Interaction
// ----------------------------------------------------------------------------
function isInteractiveLocation(wx, wy) {
    const config = scenarioConfigs[currentConfig.map] || scenarioConfigs.cafeteria;
    if (config.chairs && config.chairs.some(c => Math.hypot(wx - (c.x + c.w * 0.5), wy - (c.y + c.h * 0.5)) < 40)) {
        return true;
    }
    if (config.counter) {
        const c = config.counter;
        if (wx >= c.x - 16 && wx <= c.x + c.w + 16 && wy >= c.y - 10 && wy <= c.y + c.h + 45) return true;
    }
    if (config.bookshelves && config.bookshelves.some(b => wx >= b.x - 12 && wx <= b.x + b.w + 12 && wy >= b.y - 12 && wy <= b.y + b.h + 36)) {
        return true;
    }
    if (config.lanterns && config.lanterns.some(l => Math.hypot(wx - (l.x + l.w * 0.5), wy - (l.y + l.h * 0.5)) < 42)) {
        return true;
    }
    const player = gameState.players['my_id'];
    const npcs   = Object.values(gameState.players).filter(p => p !== player);
    return npcs.some(n => Math.hypot(wx - (n.x + n.width * 0.5), wy - (n.y + n.height * 0.5)) < 42);
}

if (canvas) {
    canvas.addEventListener('pointerdown', (e) => {
        if (isMenuVisible()) return;
        if (taskDrawer && !taskDrawer.classList.contains('hidden')) {
            toggleTaskDrawer(false);
            return;
        }
        if (dialogSystem.isOpen) {
            dialogSystem.advance();
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const wx   = (e.clientX - rect.left) + camera.x;
        const wy   = (e.clientY - rect.top) + camera.y;
        const player = gameState.players['my_id'];
        if (!player) return;

        if (nearbyInteract && interactionManager.isPointInPrompt(wx, wy)) {
            interactionManager.handleInteraction(player, nearbyInteract);
            return;
        }

        const autoInteract = isInteractiveLocation(wx, wy);
        setPointerDestination(wx, wy, autoInteract);
    });
}

// ----------------------------------------------------------------------------
// UI & Multilingual Updates
// ----------------------------------------------------------------------------
const TEXT_BINDINGS = {
    'lbl-main-title':     'appTitle',
    'lbl-main-subtitle':  'appSubtitle',
    'btn-play':           'playGame',
    'btn-custom':         'userCustomization',
    'btn-settings':       'soloSettings',
    'link-about':         'aboutProject',
    'lbl-mode-title':     'selectMode',
    'btn-solo':           'soloStudySpace',
    'btn-multiplayer':    'multiplayerSoon',
    'btn-mode-back':      'back',
    'lbl-config-title':   'soloSettings',
    'lbl-cfg-focus':      'focusDuration',
    'lbl-cfg-break':      'breakDuration',
    'lbl-cfg-cycles':     'sessionCycles',
    'lbl-cfg-map':        'selectMap',
    'lbl-cfg-npc':        'npcStudyBuddies',
    'lbl-cfg-ambient':    'ambientSound',
    'lbl-cfg-volume':     'masterVolume',
    'lbl-cfg-language':   'language',
    'opt-map-cafeteria':  'mapCafeteria',
    'opt-map-library':    'mapLibrary',
    'opt-map-garden':     'mapGarden',
    'opt-ambient-off':    'ambientOff',
    'opt-ambient-rain':   'ambientRain',
    'opt-ambient-cafe':   'ambientCafe',
    'opt-ambient-fire':   'ambientFire',
    'opt-ambient-binaural': 'ambientBinaural',
    'btn-config-back':    'back',
    'lbl-custom-title':   'userCustomization',
    'lbl-custom-name':    'playerNameTag',
    'lbl-custom-color':   'avatarColor',
    'opt-color-ness':     'colorNess',
    'opt-color-paula':    'colorPaula',
    'opt-color-jeff':     'colorJeff',
    'opt-color-poo':      'colorPoo',
    'opt-color-purple':   'colorPurple',
    'opt-color-gold':     'colorGold',
    'btn-save-custom':    'saveAvatar',
    'btn-custom-back':    'back',
    'lbl-pause-title':    'gamePaused',
    'lbl-stat-today':     'statTodayMin',
    'lbl-stat-sessions':  'statCompleted',
    'lbl-stat-total':     'statTotalFocus',
    'lbl-stat-streak':    'statStreak',
    'lbl-weekly-title':   'statWeeklyTitle',
    'btn-resume':         'resume',
    'btn-pause-tasks':    'tasksButton',
    'btn-pause-settings': 'settings',
    'btn-exit-main':      'exitMainMenu',
    'hud-tag':            'currentFocus',
    'btn-hud-skip':       'hudSkip',
    'btn-hud-tasks':      'tasksButton',
    'lbl-drawer-title':   'focusTasks',
    'btn-add-task':       'addTask',
    'lbl-drawer-footer':  'taskTip',
    'legend-move':        'legendMove',
    'legend-interact':    'legendInteract',
    'legend-pause':       'legendPause',
    'legend-tasks':       'legendTasks',
    'legend-mute':        'legendMute',
    'legend-menu':        'legendMenu'
};

function applyLanguage(lang) {
    i18n.setLanguage(lang);
    currentConfig.language = lang;

    langButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    if (languageSelect) languageSelect.value = lang;

    Object.keys(TEXT_BINDINGS).forEach(id => {
        const node = el(id);
        if (node) node.textContent = i18n.t(TEXT_BINDINGS[id]);
    });

    if (startGameBtn) {
        startGameBtn.textContent = gameStarted && lastMenuPanel === 'pause' ? i18n.t('applyResume') : i18n.t('startGame');
    }
    if (btnHudPlay)  btnHudPlay.textContent  = gameState.pomodoro.isActive ? i18n.t('hudPause') : i18n.t('hudResume');
    if (btnHudSound) btnHudSound.textContent = sound.isMuted ? i18n.t('hudMuted') : i18n.t('hudAudio');
    if (taskInput)   taskInput.placeholder   = i18n.t('taskPlaceholder');

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
    const todayNode = el('stat-today-min');
    const sessNode  = el('stat-sessions');
    const totalNode = el('stat-total-focus');
    const strkNode  = el('stat-streak');

    if (todayNode) todayNode.textContent = stats.todayFocusMinutes;
    if (sessNode)  sessNode.textContent  = stats.completedSessions;
    if (strkNode)  strkNode.textContent  = stats.currentStreak;
    if (totalNode) {
        const hrs  = Math.floor(stats.totalFocusMinutes / 60);
        const mins = stats.totalFocusMinutes % 60;
        totalNode.textContent = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    }

    const barsContainer = el('stats-weekly-bars');
    if (barsContainer) {
        barsContainer.innerHTML = '';
        const history = statsTracker.getWeeklyHistory();
        const maxMin  = Math.max(25, ...history.map(d => d.minutes));

        history.forEach(day => {
            const col = document.createElement('div');
            col.className = `weekly-bar-col ${day.isToday ? 'today' : ''}`;

            const val = document.createElement('span');
            val.className   = 'weekly-bar-val';
            val.textContent = day.minutes > 0 ? `${day.minutes}` : '';

            const fill = document.createElement('div');
            fill.className    = 'weekly-bar-fill';
            const heightPct   = Math.max(6, Math.round((day.minutes / maxMin) * 38));
            fill.style.height = `${heightPct}px`;

            const lbl = document.createElement('span');
            lbl.className   = 'weekly-bar-lbl';
            lbl.textContent = day.label;

            col.appendChild(val);
            col.appendChild(fill);
            col.appendChild(lbl);
            barsContainer.appendChild(col);
        });
    }
}

function updateHUDActiveTask() {
    const active   = taskManager.getActiveTask();
    const textNode = el('hud-task-text');
    const pomoNode = el('hud-task-pomo');
    if (textNode) {
        textNode.textContent = active ? active.text : i18n.t('defaultTask');
    }
    if (pomoNode) {
        const done   = active ? (active.pomodorosCompleted || 0) : 0;
        const target = active ? (active.pomodorosTarget || 1) : 1;
        pomoNode.textContent = `🍅 ${done}/${target}`;
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
        span.addEventListener('click', () => {
            taskManager.setActiveTask(t.id);
            renderTasks();
            updateHUDActiveTask();
        });

        const pomoBtn = document.createElement('button');
        pomoBtn.type        = 'button';
        pomoBtn.className   = 'task-pomo-btn';
        pomoBtn.title       = i18n.t('taskEstTitle');
        pomoBtn.textContent = `🍅 ${t.pomodorosCompleted || 0}/${t.pomodorosTarget || 1}`;
        pomoBtn.addEventListener('click', () => {
            taskManager.cycleTaskTarget(t.id);
            renderTasks();
            updateHUDActiveTask();
        });

        const del = document.createElement('button');
        del.type        = 'button';
        del.className   = 'task-del';
        del.textContent = '✕';
        del.addEventListener('click', () => {
            taskManager.deleteTask(t.id);
            renderTasks();
            updateHUDActiveTask();
        });

        item.appendChild(chk);
        item.appendChild(span);
        item.appendChild(pomoBtn);
        item.appendChild(del);
        taskList.appendChild(item);
    });

    updateHUDActiveTask();
}

function toggleTaskDrawer(show = null) {
    if (!taskDrawer) return;
    const isVisible  = !taskDrawer.classList.contains('hidden');
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
    const timer    = gameState.pomodoro;
    timer.isActive = !timer.isActive;
    syncTimerWallClock();
    if (btnHudPlay) {
        btnHudPlay.textContent = timer.isActive ? i18n.t('hudPause') : i18n.t('hudResume');
    }
    sound.play('click');
}

function skipPomodoroSession() {
    syncTimerWallClock();
    gameState.pomodoro.timerSeconds = 0.05;
    sound.play('click');
}

function showPanel(target) {
    const panels = {
        'main':   mainMenuPanel,
        'mode':   modeMenuPanel,
        'config': configMenuPanel,
        'custom': customMenuPanel,
        'pause':  pauseMenuPanel
    };

    syncTimerWallClock();

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
        if (panels[key]) panels[key].classList.toggle('hidden', key !== target);
    });

    if (target === 'pause') updateStatsDisplay();
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

                if (!isNaN(focusVal) && focusVal >= 1 && focusVal <= 180)   currentConfig.focusTime   = focusVal;
                if (!isNaN(breakVal) && breakVal >= 1 && breakVal <= 60)    currentConfig.breakTime   = breakVal;
                if (!isNaN(cyclesVal) && cyclesVal >= 1 && cyclesVal <= 12) currentConfig.cycles      = cyclesVal;
                if (!isNaN(npcVal) && npcVal >= 0 && npcVal <= 14)         currentConfig.npcCount    = npcVal;
                if (['cafeteria', 'library', 'garden'].includes(config.map)) currentConfig.map        = config.map;
                if (typeof config.playerName === 'string' && config.playerName.trim()) {
                    currentConfig.playerName = config.playerName.trim();
                }
                if (typeof config.playerColor === 'string' && config.playerColor.startsWith('#')) {
                    currentConfig.playerColor = config.playerColor;
                }
                if (['en', 'es', 'ja'].includes(config.language)) currentConfig.language = config.language;

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
function bindClick(id, handler) {
    const node = el(id);
    if (node) node.addEventListener('click', handler);
}

bindClick('btn-play',           () => { sound.play('click'); showPanel('mode'); });
bindClick('btn-mode-back',      () => { sound.play('click'); showPanel('main'); });
bindClick('btn-solo',           () => { sound.play('click'); lastMenuPanel = 'mode'; showPanel('config'); });
bindClick('btn-config-back',    () => { sound.play('click'); showPanel(lastMenuPanel); });
bindClick('btn-settings',       () => { sound.play('click'); lastMenuPanel = 'main'; showPanel('config'); });
bindClick('btn-custom',         () => { sound.play('click'); showPanel('custom'); });
bindClick('btn-custom-back',    () => { sound.play('click'); showPanel('main'); });
bindClick('btn-resume',         () => { sound.play('click'); lastTime = performance.now(); showPanel('none'); });
bindClick('btn-pause-tasks',    () => { sound.play('click'); toggleTaskDrawer(true); });
bindClick('btn-pause-settings', () => { sound.play('click'); lastMenuPanel = 'pause'; showPanel('config'); });
bindClick('btn-exit-main',      () => { sound.play('click'); sound.stopAmbient(); showPanel('main'); });
bindClick('btn-close-tasks',    () => toggleTaskDrawer(false));
bindClick('btn-hud-play',       toggleTimerPlayPause);
bindClick('btn-hud-skip',       skipPomodoroSession);
bindClick('btn-hud-tasks',      () => toggleTaskDrawer());

bindClick('btn-hud-interact', () => {
    const player = gameState.players['my_id'];
    if (nearbyInteract && player) {
        interactionManager.handleInteraction(player, nearbyInteract);
    }
});

bindClick('btn-hud-sound', () => {
    const isMuted = sound.toggleMute();
    if (btnHudSound) btnHudSound.textContent = isMuted ? i18n.t('hudMuted') : i18n.t('hudAudio');
    sound.play('click');
});

langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        applyLanguage(btn.dataset.lang);
        sound.play('click');
    });
});

if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
        applyLanguage(e.target.value);
        sound.play('click');
    });
}

bindClick('btn-save-custom', () => {
    if (playerNameInput && playerNameInput.value.trim()) {
        currentConfig.playerName = playerNameInput.value.trim();
    }
    if (playerColorSelect) {
        currentConfig.playerColor = playerColorSelect.value;
    }
    try {
        localStorage.setItem('pomodoroConfig', JSON.stringify(currentConfig));
    } catch (_) {}

    initGameWorld(gameStarted);
    showPanel('main');
});

bindClick('btn-start-game', () => {
    const prevMap       = currentConfig.map;
    const prevFocusTime = currentConfig.focusTime;
    const isResuming    = gameStarted && lastMenuPanel === 'pause';

    const focusVal  = focusInput ? parseInt(focusInput.value, 10) : 25;
    const breakVal  = breakInput ? parseInt(breakInput.value, 10) : 5;
    const cyclesVal = cyclesInput ? parseInt(cyclesInput.value, 10) : 4;
    const npcVal    = npcInput ? parseInt(npcInput.value, 10) : 5;
    const mapVal    = mapSelect ? mapSelect.value : 'cafeteria';
    const langVal   = languageSelect ? languageSelect.value : 'en';

    Object.assign(currentConfig, {
        focusTime: (!isNaN(focusVal) && focusVal >= 1 && focusVal <= 180) ? focusVal : 25,
        breakTime: (!isNaN(breakVal) && breakVal >= 1 && breakVal <= 60) ? breakVal : 5,
        cycles:    (!isNaN(cyclesVal) && cyclesVal >= 1 && cyclesVal <= 12) ? cyclesVal : 4,
        map:       ['cafeteria', 'library', 'garden'].includes(mapVal) ? mapVal : 'cafeteria',
        npcCount:  (!isNaN(npcVal) && npcVal >= 0 && npcVal <= 14) ? npcVal : 5,
        language:  ['en', 'es', 'ja'].includes(langVal) ? langVal : 'en'
    });

    try {
        localStorage.setItem('pomodoroConfig', JSON.stringify(currentConfig));
    } catch (_) {}

    if (ambientSelect) {
        sound.setAmbientType(ambientSelect.value);
    }

    applyLanguage(currentConfig.language);

    const preserveSession = isResuming && prevMap === currentConfig.map;
    initGameWorld(preserveSession);

    if (preserveSession && prevFocusTime !== currentConfig.focusTime && gameState.pomodoro.mode === 'WORK') {
        const diffSec = (currentConfig.focusTime - prevFocusTime) * 60;
        gameState.pomodoro.timerSeconds = Math.max(10, gameState.pomodoro.timerSeconds + diffSec);
    }

    updateHUDActiveTask();
    gameStarted = true;
    showPanel('none');
    lastTime = performance.now();
    syncTimerWallClock();
    sound.play(isResuming ? 'click' : 'focus_start');
});

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

// ----------------------------------------------------------------------------
// Universal Keyboard Shortcuts
// ----------------------------------------------------------------------------
window.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement ? document.activeElement.tagName : '';
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(activeTag)) {
        if (e.key === 'Escape') {
            document.activeElement.blur();
            toggleTaskDrawer(false);
        }
        return;
    }

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
            } else if (pauseMenuPanel && !pauseMenuPanel.classList.contains('hidden')) {
                lastTime = performance.now();
                showPanel('none');
            } else if (configMenuPanel && !configMenuPanel.classList.contains('hidden')) {
                showPanel(lastMenuPanel);
            } else if (
                (customMenuPanel && !customMenuPanel.classList.contains('hidden')) ||
                (modeMenuPanel && !modeMenuPanel.classList.contains('hidden'))
            ) {
                showPanel('main');
            }
        }
        return;
    }

    if (isMenuVisible()) return;

    if (e.key === 'e' || e.key === 'E') {
        const player = gameState.players['my_id'];
        if (nearbyInteract && player) {
            interactionManager.handleInteraction(player, nearbyInteract);
        }
    } else if (e.key === ' ') {
        e.preventDefault();
        toggleTimerPlayPause();
    } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        toggleTaskDrawer();
    } else if (e.key === 'm' || e.key === 'M') {
        const isMuted = sound.toggleMute();
        if (btnHudSound) btnHudSound.textContent = isMuted ? i18n.t('hudMuted') : i18n.t('hudAudio');
    } else if (e.key === 'Tab') {
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
