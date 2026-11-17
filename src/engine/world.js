// World State, Entity Physics, Click-to-Move Steering & Dynamic NPC Behavior

import { keys } from './input.js';
import { SPRITES, drawPixelSprite } from './sprites.js';
import { getStudySeats, getObstacles } from './scenarios.js';
import { dialogSystem } from './dialog.js';
import { interactionManager } from './interactions.js';
import { i18n } from './i18n.js';

export const WORLD_WIDTH  = 1200;
export const WORLD_HEIGHT = 800;

export const DEFAULT_CONFIG = {
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

export const currentConfig = { ...DEFAULT_CONFIG };

export const gameState = {
    players: {},
    pomodoro: {
        mode:         'WORK', // 'WORK' | 'BREAK' | 'LONG_BREAK'
        timerSeconds: 1500,
        isActive:     true,
        currentCycle: 1,
        totalCycles:  4
    }
};

export const pointerTarget = {
    active:       false,
    x:            0,
    y:            0,
    autoInteract: false
};

export function setPointerDestination(worldX, worldY, autoInteract = false) {
    pointerTarget.active       = true;
    pointerTarget.x            = Math.max(24, Math.min(WORLD_WIDTH - 24, worldX));
    pointerTarget.y            = Math.max(24, Math.min(WORLD_HEIGHT - 24, worldY));
    pointerTarget.autoInteract = autoInteract;
}

export function clearPointerDestination() {
    pointerTarget.active       = false;
    pointerTarget.autoInteract = false;
}

function buildNpcEntity(index, seats) {
    const archetypes = ['NPC_SCHOLAR', 'NPC_GIRL', 'CHAR_SIT'];
    const npcColors  = ['#10b981', '#ec4899', '#f59e0b', '#8b5cf6', '#06b6d4'];

    let x, y, facing;
    if (index - 1 < seats.length) {
        const seat = seats[index - 1];
        x      = seat.x;
        y      = seat.y;
        facing = seat.facing || 'down';
    } else {
        const col = (index - seats.length - 1) % 4;
        const row = Math.floor((index - seats.length - 1) / 4);
        x      = 280 + col * 180;
        y      = 600 + row * 60;
        facing = 'down';
    }

    return {
        id:         `${i18n.t('studyBuddyPrefix')} ${index}`,
        x:          x,
        y:          y,
        homeX:      x,
        homeY:      y,
        homeFacing: facing,
        targetX:    x,
        targetY:    y,
        width:      32,
        height:     40,
        color:      npcColors[(index - 1) % npcColors.length],
        direction:  facing,
        archetype:  archetypes[(index - 1) % archetypes.length],
        state:      'STUDYING'
    };
}

// Initialize or update map entities and study buddy NPCs
export function initGameWorld(preserveSession = false) {
    const pId   = (currentConfig.playerName && currentConfig.playerName.trim()) || 'Ness';
    const seats = getStudySeats(currentConfig.map);

    if (preserveSession && gameState.players['my_id']) {
        const me = gameState.players['my_id'];
        me.id    = pId;
        me.color = currentConfig.playerColor || '#3b82f6';

        // Rebuild NPC list to match updated npcCount
        const nextPlayers = { 'my_id': me };
        for (let i = 1; i <= currentConfig.npcCount; i++) {
            const key = `npc_${i}`;
            nextPlayers[key] = gameState.players[key] || buildNpcEntity(i, seats);
            nextPlayers[key].id = `${i18n.t('studyBuddyPrefix')} ${i}`;
        }
        gameState.players = nextPlayers;
        gameState.pomodoro.totalCycles = currentConfig.cycles || 4;
        syncNpcBreakState(gameState.pomodoro.mode);
        return;
    }

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
    clearPointerDestination();

    for (let i = 1; i <= currentConfig.npcCount; i++) {
        gameState.players[`npc_${i}`] = buildNpcEntity(i, seats);
    }

    const timer        = gameState.pomodoro;
    timer.mode         = 'WORK';
    timer.timerSeconds = currentConfig.focusTime * 60;
    timer.isActive     = true;
    timer.currentCycle = 1;
    timer.totalCycles  = currentConfig.cycles || 4;
}

// Transition NPCs between study desks and break lounge areas
export function syncNpcBreakState(mode) {
    const isBreak = mode === 'BREAK' || mode === 'LONG_BREAK';
    let idx = 0;
    Object.keys(gameState.players).forEach(key => {
        if (key === 'my_id') return;
        const npc = gameState.players[key];
        idx++;
        if (isBreak && idx % 2 === 1) {
            npc.state   = 'BREAK';
            npc.targetX = 460 + ((idx * 65) % 280);
            npc.targetY = 120 + ((idx * 35) % 60);
        } else {
            npc.state   = 'STUDYING';
            npc.targetX = npc.homeX;
            npc.targetY = npc.homeY;
        }
    });
}

function checkAABB(x, y, w, h, box) {
    return (
        x < box.x + box.w &&
        x + w > box.x &&
        y < box.y + box.h &&
        y + h > box.y
    );
}

// Update player movement, click-to-move steering, and NPC lounge transitions
export function updateWorldEntities(deltaTime, isMenuOpen, nearbyInteract) {
    const player = gameState.players['my_id'];
    if (!player) return;

    // Update NPC positions smoothly toward their target coordinates
    Object.keys(gameState.players).forEach(key => {
        if (key === 'my_id') return;
        const npc = gameState.players[key];
        if (typeof npc.targetX !== 'number' || typeof npc.targetY !== 'number') return;

        const ndx  = npc.targetX - npc.x;
        const ndy  = npc.targetY - npc.y;
        const dist = Math.hypot(ndx, ndy);
        if (dist > 2) {
            const step = Math.min(dist, 95 * deltaTime);
            npc.x += (ndx / dist) * step;
            npc.y += (ndy / dist) * step;
            npc.direction = Math.abs(ndx) >= Math.abs(ndy) ? (ndx > 0 ? 'right' : 'left') : (ndy > 0 ? 'down' : 'up');
        } else {
            npc.x = npc.targetX;
            npc.y = npc.targetY;
            if (npc.state === 'STUDYING' && npc.homeFacing) {
                npc.direction = npc.homeFacing;
            } else if (npc.state === 'BREAK') {
                npc.direction = 'down';
            }
        }
    });

    if (isMenuOpen || dialogSystem.isOpen) return;

    const SPEED = 160.0;
    let rawDx   = (keys.d || keys.ArrowRight) - (keys.a || keys.ArrowLeft);
    let rawDy   = (keys.s || keys.ArrowDown) - (keys.w || keys.ArrowUp);

    // Keyboard input overrides click-to-move waypoint
    if (rawDx !== 0 || rawDy !== 0) {
        clearPointerDestination();
    } else if (pointerTarget.active) {
        const pcx  = player.x + player.width * 0.5;
        const pcy  = player.y + player.height * 0.5;
        const pdx  = pointerTarget.x - pcx;
        const pdy  = pointerTarget.y - pcy;
        const dist = Math.hypot(pdx, pdy);

        if (dist <= 10 || (pointerTarget.autoInteract && nearbyInteract && dist <= 44)) {
            const shouldInteract = pointerTarget.autoInteract;
            clearPointerDestination();
            player.state = interactionManager.currentSeat ? 'STUDYING' : 'IDLE';
            if (shouldInteract && nearbyInteract) {
                interactionManager.handleInteraction(player, nearbyInteract);
            }
            return;
        }
        rawDx = pdx / dist;
        rawDy = pdy / dist;
    }

    if (interactionManager.currentSeat && (rawDx !== 0 || rawDy !== 0)) {
        interactionManager.handleInteraction(player, { type: 'stand' });
    }

    if (!interactionManager.currentSeat) {
        const len = Math.hypot(rawDx, rawDy);
        let dx = 0;
        let dy = 0;
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

        const obstacles     = getObstacles(currentConfig.map, WORLD_WIDTH, WORLD_HEIGHT);
        const hitboxMarginX = 6;
        const hitboxTopY    = 20;
        const hitboxW       = player.width - hitboxMarginX * 2;
        const hitboxH       = player.height - hitboxTopY;

        let movedX = false;
        let movedY = false;

        if (dx !== 0) {
            const nextX       = player.x + dx * deltaTime;
            const testHitboxX = nextX + hitboxMarginX;
            const testHitboxY = player.y + hitboxTopY;
            let blockedX      = false;
            for (let i = 0; i < obstacles.length; i++) {
                if (checkAABB(testHitboxX, testHitboxY, hitboxW, hitboxH, obstacles[i])) {
                    blockedX = true;
                    break;
                }
            }
            if (!blockedX) {
                player.x = nextX;
                movedX   = true;
            }
        }

        if (dy !== 0) {
            const nextY       = player.y + dy * deltaTime;
            const testHitboxX = player.x + hitboxMarginX;
            const testHitboxY = nextY + hitboxTopY;
            let blockedY      = false;
            for (let i = 0; i < obstacles.length; i++) {
                if (checkAABB(testHitboxX, testHitboxY, hitboxW, hitboxH, obstacles[i])) {
                    blockedY = true;
                    break;
                }
            }
            if (!blockedY) {
                player.y = nextY;
                movedY   = true;
            }
        }

        // Stop click-to-move if completely blocked by obstacle
        if (pointerTarget.active && len > 0 && !movedX && !movedY) {
            if (pointerTarget.autoInteract && nearbyInteract) {
                interactionManager.handleInteraction(player, nearbyInteract);
            }
            clearPointerDestination();
            player.state = 'IDLE';
        }
    }

    player.x = Math.max(20, Math.min(WORLD_WIDTH - 20 - player.width, player.x));
    player.y = Math.max(20, Math.min(WORLD_HEIGHT - 20 - player.height, player.y));
}

export function drawPointerTarget(ctx) {
    if (!pointerTarget.active) return;
    const pulse = 6 + Math.sin(performance.now() * 0.01) * 2.5;
    ctx.save();
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.ellipse(pointerTarget.x, pointerTarget.y, pulse * 1.4, pulse * 0.8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

export function drawCharacterSprite(ctx, p) {
    const isPlayer = p === gameState.players['my_id'];

    // Drop shadow under character
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(p.x + p.width * 0.5, p.y + p.height - 2, p.width * 0.45, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const dir       = p.direction || 'down';
    const isMoving  = p.state === 'WALKING' || (!isPlayer && (Math.abs((p.targetX ?? p.x) - p.x) > 2 || Math.abs((p.targetY ?? p.y) - p.y) > 2));
    const isSitting = p.state === 'STUDYING' && isPlayer;
    const walkFrame = Math.floor(performance.now() / 200) % 2 === 0;

    let spriteData = SPRITES.CHAR_DOWN_IDLE;
    let flipX      = false;

    if (isPlayer) {
        if (isSitting) {
            spriteData = SPRITES.CHAR_SIT;
            flipX      = dir === 'right';
        } else if (dir === 'down') {
            spriteData = isMoving ? (walkFrame ? SPRITES.CHAR_DOWN_WALK_1 : SPRITES.CHAR_DOWN_WALK_2) : SPRITES.CHAR_DOWN_IDLE;
        } else if (dir === 'up') {
            spriteData = isMoving ? (walkFrame ? SPRITES.CHAR_UP_WALK_1 : SPRITES.CHAR_UP_WALK_2) : SPRITES.CHAR_UP_IDLE;
        } else if (dir === 'left' || dir === 'right') {
            spriteData = isMoving ? (walkFrame ? SPRITES.CHAR_SIDE_WALK_1 : SPRITES.CHAR_SIDE_WALK_2) : SPRITES.CHAR_SIDE_IDLE;
            flipX      = dir === 'right';
        }
    } else {
        if (isMoving) {
            spriteData = walkFrame ? SPRITES.CHAR_DOWN_WALK_1 : SPRITES.CHAR_DOWN_WALK_2;
        } else if (p.archetype === 'NPC_SCHOLAR') {
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

    // Badge / Name Tag with dynamic activity icon
    let statusIcon = '';
    if (!isPlayer) {
        statusIcon = p.state === 'BREAK' ? '☕ ' : '📖 ';
    } else if (isSitting) {
        statusIcon = '🎯 ';
    }
    const tagText   = `${statusIcon}${p.id}`;
    ctx.font        = 'bold 11px Courier New, "MS Gothic", "Noto Sans JP", monospace, sans-serif';
    const textWidth = ctx.measureText(tagText).width;
    const badgeW    = textWidth + 14;
    const badgeH    = 18;
    const badgeX    = p.x + p.width * 0.5 - badgeW * 0.5;
    const badgeY    = p.y - 22;

    ctx.fillStyle   = 'rgba(24, 20, 37, 0.9)';
    ctx.strokeStyle = isPlayer ? (currentConfig.playerColor || '#60a5fa') : (p.state === 'BREAK' ? '#facc15' : '#34d399');
    ctx.lineWidth   = 1.5;
    ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
    ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);

    ctx.fillStyle = isPlayer ? '#ffffff' : (p.state === 'BREAK' ? '#fef08a' : '#a7f3d0');
    ctx.textAlign = 'center';
    ctx.fillText(tagText, p.x + p.width * 0.5, badgeY + 13);
}
