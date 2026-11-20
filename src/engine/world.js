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
    pets:    [],
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

function buildCafeteriaPets() {
    if (currentConfig.map !== 'cafeteria') return [];

    // 2 cats & 2 dogs placed in open cafeteria walkways with staggered calm timers
    const presets = [
        { name: 'Mochi',   species: 'cat', x: 260, y: 342, color: '#e08b3e', accent: '#d93838', facing: 'right', state: 'SLEEP', wait: 7.5 },
        { name: 'Luna',    species: 'cat', x: 890, y: 342, color: '#606c7a', accent: '#e874b0', facing: 'left',  state: 'IDLE',  wait: 5.0 },
        { name: 'Biscuit', species: 'dog', x: 345, y: 615, color: '#e6b34d', accent: '#3b82f6', facing: 'right', state: 'IDLE',  wait: 4.0 },
        { name: 'Milo',    species: 'dog', x: 730, y: 615, color: '#9e6637', accent: '#2f8f4e', facing: 'left',  state: 'SLEEP', wait: 9.5 }
    ];

    return presets.map((p, idx) => ({
        id:         `pet_${idx + 1}`,
        name:       p.name,
        species:    p.species,
        x:          p.x,
        y:          p.y,
        width:      30,
        height:     27,
        color:      p.color,
        accent:     p.accent,
        facing:     p.facing,
        state:      p.state, // 'IDLE' | 'WALK' | 'SLEEP'
        targetX:    p.x,
        targetY:    p.y,
        waitTimer:  p.wait,
        heartTimer: 0,
        speed:      p.species === 'cat' ? 24 : 28
    }));
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
        x:          x - 3,
        y:          y - 3,
        homeX:      x - 3,
        homeY:      y - 3,
        homeFacing: facing,
        targetX:    x - 3,
        targetY:    y - 3,
        width:      36,
        height:     39,
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
        if (currentConfig.map === 'cafeteria' && gameState.pets.length === 0) {
            gameState.pets = buildCafeteriaPets();
        } else if (currentConfig.map !== 'cafeteria') {
            gameState.pets = [];
        }
        syncNpcBreakState(gameState.pomodoro.mode);
        return;
    }

    gameState.players = {
        'my_id': {
            id:        pId,
            x:         600,
            y:         360,
            width:     36,
            height:    39,
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

    gameState.pets = buildCafeteriaPets();

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

function isAreaClear(x, y, w, h, obstacles) {
    for (let i = 0; i < obstacles.length; i++) {
        if (checkAABB(x, y, w, h, obstacles[i])) return false;
    }
    return true;
}

// Gently wander or rest cafeteria cats & dogs without distracting the user
function updatePets(deltaTime, obstacles) {
    if (!gameState.pets || gameState.pets.length === 0) return;

    for (let i = 0; i < gameState.pets.length; i++) {
        const pet = gameState.pets[i];

        if (pet.heartTimer > 0) {
            pet.heartTimer = Math.max(0, pet.heartTimer - deltaTime);
        }

        if (pet.state === 'WALK') {
            const dx   = pet.targetX - pet.x;
            const dy   = pet.targetY - pet.y;
            const dist = Math.hypot(dx, dy);

            if (dist <= 2) {
                pet.x         = pet.targetX;
                pet.y         = pet.targetY;
                pet.state     = Math.random() < 0.55 ? 'SLEEP' : 'IDLE';
                pet.waitTimer = pet.state === 'SLEEP'
                    ? 10 + Math.random() * 8
                    : 7 + Math.random() * 6;
                continue;
            }

            const step  = Math.min(dist, pet.speed * deltaTime);
            const nextX = pet.x + (dx / dist) * step;
            const nextY = pet.y + (dy / dist) * step;

            if (Math.abs(dx) > 1) {
                pet.facing = dx > 0 ? 'right' : 'left';
            }

            // Gentle obstacle check so pets never walk through desks or counters
            if (isAreaClear(nextX + 3, nextY + 9, pet.width - 6, pet.height - 9, obstacles)) {
                pet.x = nextX;
                pet.y = nextY;
            } else {
                // Stop peacefully if path is blocked
                pet.state     = 'IDLE';
                pet.waitTimer = 6 + Math.random() * 6;
            }
        } else {
            pet.waitTimer -= deltaTime;
            if (pet.waitTimer <= 0) {
                // Occasionally shift between sleeping and sitting without even moving
                if (Math.random() < 0.35) {
                    pet.state     = pet.state === 'SLEEP' ? 'IDLE' : 'SLEEP';
                    pet.waitTimer = 8 + Math.random() * 8;
                    continue;
                }

                // Pick a nearby gentle destination within 50-130 px
                let chosen = false;
                for (let tries = 0; tries < 8; tries++) {
                    const angle  = Math.random() * Math.PI * 2;
                    const radius = 50 + Math.random() * 80;
                    const candX  = Math.max(60, Math.min(WORLD_WIDTH - 90, pet.x + Math.cos(angle) * radius));
                    const candY  = Math.max(120, Math.min(WORLD_HEIGHT - 70, pet.y + Math.sin(angle) * radius));

                    if (isAreaClear(candX - 4, candY - 4, pet.width + 8, pet.height + 8, obstacles)) {
                        pet.targetX = candX;
                        pet.targetY = candY;
                        pet.state   = 'WALK';
                        chosen      = true;
                        break;
                    }
                }
                if (!chosen) {
                    pet.waitTimer = 6 + Math.random() * 5;
                }
            }
        }
    }
}

// Update player movement, click-to-move steering, NPC transitions, and gentle cafe pets
export function updateWorldEntities(deltaTime, isMenuOpen, nearbyInteract) {
    const player = gameState.players['my_id'];
    if (!player) return;

    const obstacles = getObstacles(currentConfig.map, WORLD_WIDTH, WORLD_HEIGHT);

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

    if (!isMenuOpen) {
        updatePets(deltaTime, obstacles);
    }

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
    const x    = Math.round(pointerTarget.x);
    const y    = Math.round(pointerTarget.y);
    const size = Math.floor(performance.now() / 250) % 2 === 0 ? 6 : 9;

    ctx.fillStyle = '#ffff00';
    ctx.fillRect(x - size, y - 1, size * 2, 3);
    ctx.fillRect(x - 1, y - size, 3, size * 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 1, y - 1, 3, 3);
}

export function drawCharacterSprite(ctx, p) {
    const isPlayer = p === gameState.players['my_id'];
    const rx       = Math.round(p.x);
    const ry       = Math.round(p.y);

    // Crisp flat pixel drop shadow under character
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.fillRect(rx + 6, ry + p.height - 3, p.width - 12, 6);

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
    const accentColor = isPlayer ? '#d93838' : '#e8b94f';

    drawPixelSprite(ctx, spriteData, rx, ry, p.width, p.height, mainColor, accentColor, flipX);

    // Crisp Win98-style compact nameplate
    let statusIcon = '';
    if (!isPlayer) {
        statusIcon = p.state === 'BREAK' ? '☕ ' : '📖 ';
    } else if (isSitting) {
        statusIcon = '★ ';
    }
    const tagText   = `${statusIcon}${p.id}`;
    ctx.font        = 'bold 10px Tahoma, "MS Sans Serif", "MS PGothic", sans-serif';
    const textWidth = ctx.measureText(tagText).width;
    const badgeW    = Math.ceil(textWidth + 10);
    const badgeH    = 16;
    const badgeX    = Math.round(rx + p.width * 0.5 - badgeW * 0.5);
    const badgeY    = ry - 19;

    ctx.fillStyle = isPlayer ? '#000080' : (p.state === 'BREAK' ? '#ffffe1' : '#c0c0c0');
    ctx.fillRect(badgeX, badgeY, badgeW, badgeH);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth   = 1;
    ctx.strokeRect(badgeX + 0.5, badgeY + 0.5, badgeW - 1, badgeH - 1);

    ctx.fillStyle = isPlayer ? '#ffffff' : '#000000';
    ctx.textAlign = 'center';
    ctx.fillText(tagText, badgeX + Math.round(badgeW * 0.5), badgeY + 11);
}

// Render calm cafeteria cats & dogs without distracting permanent text labels
export function drawPetSprite(ctx, pet) {
    const rx = Math.round(pet.x);
    const ry = Math.round(pet.y);

    // Crisp flat pixel shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.fillRect(rx + 4, ry + pet.height - 3, pet.width - 8, 5);

    const isDog     = pet.species === 'dog';
    const walkFrame = Math.floor(performance.now() / 520) % 2 === 0;
    let spriteData;

    if (pet.state === 'SLEEP') {
        spriteData = isDog ? SPRITES.DOG_SLEEP : SPRITES.CAT_SLEEP;
    } else if (pet.state === 'WALK') {
        spriteData = isDog
            ? (walkFrame ? SPRITES.DOG_WALK_1 : SPRITES.DOG_WALK_2)
            : (walkFrame ? SPRITES.CAT_WALK_1 : SPRITES.CAT_WALK_2);
    } else {
        spriteData = isDog ? SPRITES.DOG_IDLE : SPRITES.CAT_IDLE;
    }

    drawPixelSprite(ctx, spriteData, rx, ry, pet.width, pet.height, pet.color, pet.accent, pet.facing === 'left');

    // Brief gentle heart feedback when petted
    if (pet.heartTimer > 0) {
        const rise = Math.round((1.6 - pet.heartTimer) * 10);
        ctx.fillStyle = '#e03c3c';
        ctx.font      = 'bold 12px Tahoma, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('♥', rx + Math.round(pet.width * 0.5), ry - 2 - rise);
    }
}


