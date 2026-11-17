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

    const hudW = Math.min(280, canvasWidth - 24);
    const hudH = 78;
    const hudX = (canvasWidth - hudW) * 0.5;
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
    ctx.fillText(`${scenarioName} • ${modeText}`, canvasWidth * 0.5, hudY + 20);

    // Digital Clock
    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 26px Courier New, "MS Gothic", "Noto Sans JP", monospace, sans-serif';
    ctx.fillText(timeStr, canvasWidth * 0.5, hudY + 48);

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
