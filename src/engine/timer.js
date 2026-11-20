// Deterministic Wall-Clock Pomodoro Timer Engine & Canvas HUD Renderer
// Preserves accurate countdown even when browser tab is backgrounded or minimized

import { sound } from './audio.js';
import { statsTracker } from './stats.js';
import { taskManager } from './tasks.js';
import { dialogSystem } from './dialog.js';
import { i18n } from './i18n.js';
import { currentConfig, gameState, syncNpcBreakState } from './world.js';

const DEFAULT_DOC_TITLE = 'Pomodoro World 2D — Virtual Focus Cafe';
let lastWallTimestamp   = Date.now();
let lastTitleSecond     = -1;

export function syncTimerWallClock() {
    lastWallTimestamp = Date.now();
}

export function updateDocumentTitle(isMenuOpen) {
    if (typeof document === 'undefined') return;
    const timer = gameState.pomodoro;
    if (isMenuOpen || !timer.isActive) {
        if (document.title !== DEFAULT_DOC_TITLE) {
            document.title = DEFAULT_DOC_TITLE;
        }
        lastTitleSecond = -1;
        return;
    }

    const totalSeconds = Math.max(0, Math.floor(timer.timerSeconds));
    if (totalSeconds === lastTitleSecond) return;
    lastTitleSecond = totalSeconds;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const badge   = timer.mode === 'WORK' ? '🍅' : (timer.mode === 'LONG_BREAK' ? '🎉' : '☕');
    document.title = `${badge} ${timeStr} — Pomodoro World 2D`;
}

// Advance Pomodoro timer using real wall-clock delta so background tabs never freeze
export function updatePomodoroTimer(isMenuOpen, onSessionComplete = null) {
    const now         = Date.now();
    const wallDelta   = Math.max(0, Math.min(7200, (now - lastWallTimestamp) * 0.001));
    lastWallTimestamp = now;

    if (isMenuOpen) {
        updateDocumentTitle(true);
        return;
    }

    const timer = gameState.pomodoro;
    if (timer.isActive && wallDelta > 0) {
        timer.timerSeconds -= wallDelta;

        if (timer.timerSeconds <= 0) {
            if (timer.mode === 'WORK') {
                statsTracker.recordCompletedSession(currentConfig.focusTime);
                taskManager.incrementActiveTaskPomodoro();

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

            syncNpcBreakState(timer.mode);
            if (onSessionComplete) onSessionComplete();
        }
    }

    updateDocumentTitle(false);
}

export function drawPomodoroHUD(ctx, canvasWidth, isMenuOpen) {
    const timer        = gameState.pomodoro;
    const totalSeconds = Math.max(0, Math.floor(timer.timerSeconds));
    const minutes      = Math.floor(totalSeconds / 60);
    const seconds      = totalSeconds % 60;
    const timeStr      = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const hudW = Math.min(274, canvasWidth - 24);
    const hudH = 88;
    const hudX = Math.round((canvasWidth - hudW) * 0.5);
    const hudY = 12;

    // 1. Classic Windows 98 Raised Window Chrome
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(hudX, hudY, hudW, hudH);
    // Outer white highlight (top/left) & black shadow (bottom/right)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(hudX, hudY, hudW - 1, 2);
    ctx.fillRect(hudX, hudY, 2, hudH - 1);
    ctx.fillStyle = '#000000';
    ctx.fillRect(hudX, hudY + hudH - 2, hudW, 2);
    ctx.fillRect(hudX + hudW - 2, hudY, 2, hudH);
    // Inner dark gray shadow
    ctx.fillStyle = '#808080';
    ctx.fillRect(hudX + 2, hudY + hudH - 3, hudW - 4, 1);
    ctx.fillRect(hudX + hudW - 3, hudY + 2, 1, hudH - 4);

    // 2. Classic Win98 Gradient Titlebar
    const barX = hudX + 4;
    const barY = hudY + 4;
    const barW = hudW - 8;
    const barH = 19;
    const isPaused = !timer.isActive || isMenuOpen;

    const grad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
    if (isPaused) {
        grad.addColorStop(0, '#808080');
        grad.addColorStop(1, '#b5b5b5');
    } else if (timer.mode === 'WORK') {
        grad.addColorStop(0, '#000080');
        grad.addColorStop(1, '#1084d0');
    } else {
        grad.addColorStop(0, '#006666');
        grad.addColorStop(1, '#10a494');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(barX, barY, barW, barH);

    // Multilingual Scenario + Mode in Titlebar
    let scenarioName = i18n.t('mapCafeteria');
    if (currentConfig.map === 'library') scenarioName = i18n.t('mapLibrary');
    else if (currentConfig.map === 'garden') scenarioName = i18n.t('mapGarden');

    let modeText = i18n.t('hudFocusSession');
    if (isPaused) {
        modeText = i18n.t('hudPaused');
    } else if (timer.mode === 'BREAK') {
        modeText = i18n.t('hudShortBreak');
    } else if (timer.mode === 'LONG_BREAK') {
        modeText = i18n.t('hudLongBreak');
    }

    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 11px Tahoma, "MS Sans Serif", "MS PGothic", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${scenarioName} - ${modeText}`, barX + 6, barY + 13, barW - 12);

    // 3. Sunken LCD Clock Well
    const wellX = hudX + 8;
    const wellY = hudY + 28;
    const wellW = hudW - 16;
    const wellH = 34;

    ctx.fillStyle = '#000000';
    ctx.fillRect(wellX, wellY, wellW, wellH);
    ctx.fillStyle = '#808080';
    ctx.fillRect(wellX, wellY, wellW, 1);
    ctx.fillRect(wellX, wellY, 1, wellH);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(wellX, wellY + wellH - 1, wellW, 1);
    ctx.fillRect(wellX + wellW - 1, wellY, 1, wellH);

    // Crisp retro LCD digits
    ctx.fillStyle = isPaused ? '#ffff00' : (timer.mode === 'WORK' ? '#00ff66' : '#52e0ff');
    ctx.font      = 'bold 24px "Courier New", Courier, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(timeStr, hudX + Math.round(hudW * 0.5) - 18, wellY + 25);

    const cycleText = `${i18n.t('hudCycle')} ${timer.currentCycle}/${timer.totalCycles}`;
    ctx.fillStyle   = '#c0c0c0';
    ctx.font        = 'bold 10px Tahoma, "MS Sans Serif", sans-serif';
    ctx.textAlign   = 'right';
    ctx.fillText(cycleText, wellX + wellW - 8, wellY + 21);

    // 4. Classic Win98 Segmented Progress Bar
    let maxSeconds = currentConfig.focusTime * 60;
    if (timer.mode === 'BREAK') maxSeconds = currentConfig.breakTime * 60;
    if (timer.mode === 'LONG_BREAK') maxSeconds = currentConfig.breakTime * 60 * 2;

    const progress = Math.max(0, Math.min(1, timer.timerSeconds / Math.max(1, maxSeconds)));

    const pX = hudX + 8;
    const pY = hudY + 67;
    const pW = hudW - 16;
    const pH = 14;

    // Sunken white trough
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(pX, pY, pW, pH);
    ctx.fillStyle = '#808080';
    ctx.fillRect(pX, pY, pW, 1);
    ctx.fillRect(pX, pY, 1, pH);
    ctx.fillStyle = '#000000';
    ctx.fillRect(pX + 1, pY + 1, pW - 2, 1);
    ctx.fillRect(pX + 1, pY + 1, 1, pH - 2);

    // Segmented blue Win98 blocks
    const blockW    = 8;
    const blockGap  = 2;
    const innerW    = Math.floor((pW - 6) * progress);
    ctx.fillStyle   = isPaused ? '#808080' : '#000080';
    for (let bx = 0; bx + blockW <= innerW; bx += blockW + blockGap) {
        ctx.fillRect(pX + 3 + bx, pY + 3, blockW, pH - 6);
    }
}

