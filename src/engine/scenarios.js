import {
    SPRITES,
    drawPixelSprite,
    drawPixelCounter,
    drawPixelBookshelf,
    drawSnowWindow
} from './sprites.js';
import { i18n } from './i18n.js';

// Map scenario definitions aligned to uniform 3x pixel grid (zero sprite stretching)
export const scenarioConfigs = {
    cafeteria: {
        name:        'Virtual Cafeteria',
        floorType:   'checker',
        floorColor:  '#3a261c',
        tileAccent:  '#473024',
        borderColor: '#b45309',
        wallColor:   '#2b1810',
        wallTrim:    '#5c3518',
        wallTop:     78,
        gridColor:   'rgba(0, 0, 0, 0.16)',
        themeColor:  '#000080',
        snowWindows: [
            { x: 120, y: 9, w: 276, h: 60 },
            { x: 804, y: 9, w: 276, h: 60 }
        ],
        heaters: [
            { id: 'cafe_h1', x: 162,  y: 84,  w: 36, h: 36, isOn: true },
            { id: 'cafe_h2', x: 1002, y: 84,  w: 36, h: 36, isOn: true },
            { id: 'cafe_h3', x: 582,  y: 690, w: 36, h: 36, isOn: true }
        ],
        counter:     { x: 438, y: 78, w: 324, h: 54, label: '☕ Onett Espresso Bar' },
        desks: [
            { x: 144, y: 180, w: 96, h: 54, type: 'laptop', label: 'Coffee Desk A' },
            { x: 420, y: 201, w: 96, h: 54, type: 'book',   label: 'Central Table 1' },
            { x: 684, y: 201, w: 96, h: 54, type: 'laptop', label: 'Central Table 2' },
            { x: 960, y: 180, w: 96, h: 54, type: 'book',   label: 'Window Nook' },
            { x: 180, y: 462, w: 96, h: 54, type: 'book',   label: 'Quiet Corner' },
            { x: 480, y: 471, w: 96, h: 54, type: 'laptop', label: 'Study Station A' },
            { x: 780, y: 471, w: 96, h: 54, type: 'book',   label: 'Study Station B' },
            { x: 984, y: 462, w: 96, h: 54, type: 'laptop', label: 'South Window' }
        ],
        chairs: [
            { x: 108,  y: 186, w: 30, h: 36, facing: 'right' },
            { x: 246,  y: 186, w: 30, h: 36, facing: 'left' },
            { x: 384,  y: 207, w: 30, h: 36, facing: 'right' },
            { x: 522,  y: 207, w: 30, h: 36, facing: 'left' },
            { x: 648,  y: 207, w: 30, h: 36, facing: 'right' },
            { x: 786,  y: 207, w: 30, h: 36, facing: 'left' },
            { x: 924,  y: 186, w: 30, h: 36, facing: 'right' },
            { x: 1062, y: 186, w: 30, h: 36, facing: 'left' },
            { x: 144,  y: 468, w: 30, h: 36, facing: 'right' },
            { x: 282,  y: 468, w: 30, h: 36, facing: 'left' },
            { x: 444,  y: 477, w: 30, h: 36, facing: 'right' },
            { x: 582,  y: 477, w: 30, h: 36, facing: 'left' },
            { x: 744,  y: 477, w: 30, h: 36, facing: 'right' },
            { x: 882,  y: 477, w: 30, h: 36, facing: 'left' }
        ],
        plants: [
            { x: 54,   y: 87,  w: 36, h: 42 },
            { x: 1110, y: 87,  w: 36, h: 42 },
            { x: 60,   y: 702, w: 36, h: 42 },
            { x: 1104, y: 702, w: 36, h: 42 },
            { x: 360,  y: 330, w: 36, h: 42 },
            { x: 840,  y: 330, w: 36, h: 42 }
        ]
    },

    library: {
        name:        'Quiet Library',
        floorType:   'parquet',
        floorColor:  '#252a4a',
        tileAccent:  '#2f365e',
        borderColor: '#4f5d95',
        wallColor:   '#181c36',
        wallTrim:    '#313a66',
        wallTop:     78,
        gridColor:   'rgba(0, 0, 0, 0.16)',
        themeColor:  '#000080',
        snowWindows: [
            { x: 114, y: 9, w: 240, h: 60 },
            { x: 846, y: 9, w: 240, h: 60 }
        ],
        heaters: [
            { id: 'lib_h1', x: 390, y: 84, w: 36, h: 36, isOn: true },
            { id: 'lib_h2', x: 774, y: 84, w: 36, h: 36, isOn: true }
        ],
        counter:     { x: 438, y: 78, w: 324, h: 54, label: '📚 Twoson Library Archives' },
        bookshelves: [
            { x: 96,   y: 81,  w: 276, h: 45 },
            { x: 828,  y: 81,  w: 276, h: 45 },
            { x: 42,   y: 222, w: 45,  h: 180 },
            { x: 42,   y: 462, w: 45,  h: 180 },
            { x: 1113, y: 222, w: 45,  h: 180 },
            { x: 1113, y: 462, w: 45,  h: 180 }
        ],
        desks: [
            { x: 180, y: 201, w: 96, h: 54, type: 'book',   label: 'Carrel 1' },
            { x: 450, y: 210, w: 96, h: 54, type: 'laptop', label: 'Research Table A' },
            { x: 738, y: 210, w: 96, h: 54, type: 'book',   label: 'Research Table B' },
            { x: 942, y: 201, w: 96, h: 54, type: 'laptop', label: 'Carrel 2' },
            { x: 222, y: 480, w: 96, h: 54, type: 'laptop', label: 'Silent Pod 1' },
            { x: 534, y: 489, w: 96, h: 54, type: 'book',   label: 'Silent Pod 2' },
            { x: 846, y: 480, w: 96, h: 54, type: 'laptop', label: 'Silent Pod 3' }
        ],
        chairs: [
            { x: 144,  y: 207, w: 30, h: 36, facing: 'right' },
            { x: 282,  y: 207, w: 30, h: 36, facing: 'left' },
            { x: 414,  y: 216, w: 30, h: 36, facing: 'right' },
            { x: 552,  y: 216, w: 30, h: 36, facing: 'left' },
            { x: 702,  y: 216, w: 30, h: 36, facing: 'right' },
            { x: 840,  y: 216, w: 30, h: 36, facing: 'left' },
            { x: 906,  y: 207, w: 30, h: 36, facing: 'right' },
            { x: 1044, y: 207, w: 30, h: 36, facing: 'left' },
            { x: 186,  y: 486, w: 30, h: 36, facing: 'right' },
            { x: 324,  y: 486, w: 30, h: 36, facing: 'left' },
            { x: 498,  y: 495, w: 30, h: 36, facing: 'right' },
            { x: 636,  y: 495, w: 30, h: 36, facing: 'left' },
            { x: 810,  y: 486, w: 30, h: 36, facing: 'right' },
            { x: 948,  y: 486, w: 30, h: 36, facing: 'left' }
        ],
        plants: [
            { x: 102,  y: 690, w: 36, h: 42 },
            { x: 1062, y: 690, w: 36, h: 42 },
            { x: 342,  y: 351, w: 36, h: 42 },
            { x: 822,  y: 351, w: 36, h: 42 }
        ]
    },

    garden: {
        name:        'Zen Garden',
        floorType:   'garden',
        floorColor:  '#1d543c',
        tileAccent:  '#246649',
        borderColor: '#2d8a4e',
        wallColor:   '#123828',
        wallTop:     21,
        gridColor:   'rgba(0, 0, 0, 0.12)',
        themeColor:  '#008080',
        counter:     { x: 438, y: 45, w: 324, h: 54, label: '🌸 Dalaam Tea Pavilion' },
        lanterns: [
            { x: 162,  y: 102, w: 36, h: 48 },
            { x: 1002, y: 102, w: 36, h: 48 },
            { x: 180,  y: 660, w: 36, h: 48 },
            { x: 984,  y: 660, w: 36, h: 48 }
        ],
        steppingStones: [
            { x: 579, y: 132, w: 42, h: 27 },
            { x: 573, y: 201, w: 42, h: 27 },
            { x: 585, y: 270, w: 42, h: 27 },
            { x: 579, y: 339, w: 42, h: 27 },
            { x: 570, y: 408, w: 42, h: 27 },
            { x: 585, y: 477, w: 42, h: 27 },
            { x: 579, y: 546, w: 42, h: 27 },
            { x: 573, y: 615, w: 42, h: 27 },
            { x: 579, y: 684, w: 42, h: 27 }
        ],
        desks: [
            { x: 180, y: 210, w: 96, h: 54, type: 'laptop', label: 'Bonsai Bench 1' },
            { x: 780, y: 210, w: 96, h: 54, type: 'book',   label: 'Bonsai Bench 2' },
            { x: 222, y: 450, w: 96, h: 54, type: 'book',   label: 'Lantern Arbor A' },
            { x: 744, y: 450, w: 96, h: 54, type: 'laptop', label: 'Lantern Arbor B' },
            { x: 384, y: 621, w: 96, h: 54, type: 'book',   label: 'Stone Rest 1' },
            { x: 702, y: 621, w: 96, h: 54, type: 'laptop', label: 'Stone Rest 2' }
        ],
        chairs: [
            { x: 144, y: 216, w: 30, h: 36, facing: 'right' },
            { x: 282, y: 216, w: 30, h: 36, facing: 'left' },
            { x: 744, y: 216, w: 30, h: 36, facing: 'right' },
            { x: 882, y: 216, w: 30, h: 36, facing: 'left' },
            { x: 186, y: 456, w: 30, h: 36, facing: 'right' },
            { x: 324, y: 456, w: 30, h: 36, facing: 'left' },
            { x: 708, y: 456, w: 30, h: 36, facing: 'right' },
            { x: 846, y: 456, w: 30, h: 36, facing: 'left' },
            { x: 348, y: 627, w: 30, h: 36, facing: 'right' },
            { x: 486, y: 627, w: 30, h: 36, facing: 'left' },
            { x: 666, y: 627, w: 30, h: 36, facing: 'right' },
            { x: 804, y: 627, w: 30, h: 36, facing: 'left' }
        ],
        plants: [
            { x: 78,   y: 81,  w: 36, h: 42 },
            { x: 1086, y: 81,  w: 36, h: 42 },
            { x: 78,   y: 684, w: 36, h: 42 },
            { x: 1086, y: 684, w: 36, h: 42 },
            { x: 342,  y: 321, w: 36, h: 42 },
            { x: 822,  y: 321, w: 36, h: 42 }
        ]
    }
};

export function getStudySeats(mapKey = 'cafeteria') {
    const config = scenarioConfigs[mapKey] || scenarioConfigs.cafeteria;
    return config.chairs || [];
}

const obstacleCache = new Map();
const floorCache    = new Map();

export function getObstacles(mapKey, width, height) {
    const cacheKey = `${mapKey}|${width}|${height}`;
    const cached   = obstacleCache.get(cacheKey);
    if (cached) return cached;

    const config    = scenarioConfigs[mapKey] || scenarioConfigs.cafeteria;
    const obstacles = [];

    const wallThick = 21;
    const wallTop   = config.wallTop || wallThick;
    obstacles.push({ x: 0, y: 0, w: width, h: wallTop });
    obstacles.push({ x: 0, y: height - wallThick, w: width, h: wallThick });
    obstacles.push({ x: 0, y: 0, w: wallThick, h: height });
    obstacles.push({ x: width - wallThick, y: 0, w: wallThick, h: height });

    if (config.counter) {
        obstacles.push({ x: config.counter.x, y: config.counter.y, w: config.counter.w, h: config.counter.h });
    }
    if (config.heaters) {
        config.heaters.forEach(h => obstacles.push({ x: h.x + 3, y: h.y + 6, w: h.w - 6, h: h.h - 6 }));
    }
    if (config.bookshelves) {
        config.bookshelves.forEach(b => obstacles.push({ x: b.x, y: b.y, w: b.w, h: b.h }));
    }
    if (config.desks) {
        config.desks.forEach(d => obstacles.push({ x: d.x, y: d.y, w: d.w, h: d.h }));
    }
    if (config.plants) {
        config.plants.forEach(p => obstacles.push({ x: p.x + 3, y: p.y + 6, w: p.w - 6, h: p.h - 9 }));
    }
    if (config.lanterns) {
        config.lanterns.forEach(l => obstacles.push({ x: l.x, y: l.y, w: l.w, h: l.h }));
    }

    obstacleCache.set(cacheKey, obstacles);
    return obstacles;
}

// Render crisp flat pixel tiles onto offscreen canvas cache
export function renderScenarioFloor(ctx, width, height, mapKey = 'cafeteria') {
    const cacheKey = `${mapKey}|${width}|${height}`;
    let offscreen  = floorCache.get(cacheKey);

    if (!offscreen && typeof document !== 'undefined') {
        offscreen        = document.createElement('canvas');
        offscreen.width  = width;
        offscreen.height = height;
        const octx       = offscreen.getContext('2d');
        octx.imageSmoothingEnabled = false;

        const config   = scenarioConfigs[mapKey] || scenarioConfigs.cafeteria;
        const tileSize = 48;

        octx.fillStyle = config.floorColor;
        octx.fillRect(0, 0, width, height);

        if (config.floorType === 'checker') {
            octx.fillStyle = config.tileAccent;
            for (let y = 0; y < height; y += tileSize) {
                for (let x = 0; x < width; x += tileSize) {
                    if (((x / tileSize) + (y / tileSize)) % 2 === 0) {
                        octx.fillRect(x, y, tileSize, tileSize);
                    }
                }
            }
        } else if (config.floorType === 'parquet') {
            octx.fillStyle = config.tileAccent;
            for (let y = 0; y < height; y += tileSize) {
                for (let x = 0; x < width; x += tileSize) {
                    if (Math.floor(y / tileSize) % 2 === 0) {
                        octx.fillRect(x + 3, y + 3, tileSize - 6, (tileSize >> 1) - 6);
                    } else {
                        octx.fillRect(x + (tileSize >> 1) + 3, y + 3, (tileSize >> 1) - 6, tileSize - 6);
                    }
                }
            }
        } else {
            octx.fillStyle = config.tileAccent;
            for (let y = 24; y < height; y += 72) {
                for (let x = 24; x < width; x += 72) {
                    octx.fillRect(x, y, 12, 6);
                    octx.fillRect(x + 6, y + 6, 12, 6);
                }
            }
        }

        // Crisp 1px floor tile lines
        octx.fillStyle = config.gridColor;
        for (let x = 0; x < width; x += tileSize) {
            octx.fillRect(x, 0, 1, height);
        }
        for (let y = 0; y < height; y += tileSize) {
            octx.fillRect(0, y, width, 1);
        }

        if (config.steppingStones) {
            config.steppingStones.forEach(s => {
                drawPixelSprite(octx, SPRITES.ZEN_STONE, s.x, s.y, s.w, s.h);
            });
        }

        floorCache.set(cacheKey, offscreen);
    }

    if (offscreen) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(offscreen, 0, 0);
    }
}

export function renderScenarioEnvironment(ctx, width, height, mapKey = 'cafeteria') {
    const config    = scenarioConfigs[mapKey] || scenarioConfigs.cafeteria;
    const wallThick = 21;
    const wallTop   = config.wallTop || wallThick;

    ctx.imageSmoothingEnabled = false;

    // 1. Crisp Pixel Room Walls & Interior North Wall Trim
    ctx.fillStyle = config.wallColor;
    ctx.fillRect(0, 0, width, wallTop);
    ctx.fillRect(0, height - wallThick, width, wallThick);
    ctx.fillRect(0, 0, wallThick, height);
    ctx.fillRect(width - wallThick, 0, wallThick, height);

    if (wallTop > wallThick && config.wallTrim) {
        ctx.fillStyle = config.wallTrim;
        ctx.fillRect(wallThick, wallTop - 12, width - wallThick * 2, 9);
        ctx.fillStyle = '#181818';
        ctx.fillRect(wallThick, wallTop - 3, width - wallThick * 2, 3);
    }

    ctx.strokeStyle = config.borderColor;
    ctx.lineWidth   = 3;
    ctx.strokeRect(wallThick, wallTop, width - wallThick * 2, height - wallTop - wallThick);

    // 1b. Panoramic Snow Windows looking out on the Snowy Pixel Town
    if (config.snowWindows) {
        config.snowWindows.forEach(win => {
            drawSnowWindow(ctx, win.x, win.y, win.w, win.h);
        });
    }

    // 2. Bookshelves (tiled crisp pixel blocks)
    if (config.bookshelves) {
        config.bookshelves.forEach(b => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
            ctx.fillRect(b.x + 3, b.y + 6, b.w, b.h);
            drawPixelBookshelf(ctx, b.x, b.y, b.w, b.h);
        });
    }

    // 3. Main Reception / Espresso Counter (modular crisp pixel grid)
    if (config.counter) {
        const c = config.counter;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
        ctx.fillRect(c.x + 3, c.y + 6, c.w, c.h);
        drawPixelCounter(ctx, c.x, c.y, c.w, c.h, mapKey);

        // Win98-style crisp signboard plaque
        const badgeW = 240;
        const badgeH = 22;
        const badgeX = Math.round(c.x + (c.w - badgeW) * 0.5);
        const badgeY = Math.round(c.y - 24);

        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(badgeX, badgeY, badgeW - 1, 1);
        ctx.fillRect(badgeX, badgeY, 1, badgeH - 1);
        ctx.fillStyle = '#000000';
        ctx.fillRect(badgeX, badgeY + badgeH - 1, badgeW, 1);
        ctx.fillRect(badgeX + badgeW - 1, badgeY, 1, badgeH);
        ctx.fillStyle = '#000080';
        ctx.fillRect(badgeX + 2, badgeY + 2, badgeW - 4, badgeH - 4);

        let signLabel = c.label;
        if (mapKey === 'cafeteria') signLabel = i18n.t('signCafeteria');
        else if (mapKey === 'library') signLabel = i18n.t('signLibrary');
        else if (mapKey === 'garden') signLabel = i18n.t('signGarden');

        ctx.fillStyle = '#ffffff';
        ctx.font      = 'bold 11px Tahoma, "MS Sans Serif", "MS PGothic", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(signLabel, badgeX + Math.round(badgeW * 0.5), badgeY + 15);
    }

    // 3b. Cozy Retro Fan Heaters with Gentle Warm Floor Glow
    if (config.heaters) {
        const heatFrame = Math.floor(performance.now() / 800) % 2 === 0;
        const tSec      = performance.now() * 0.001;
        config.heaters.forEach((h, idx) => {
            if (h.isOn) {
                ctx.fillStyle = 'rgba(255, 165, 64, 0.14)';
                ctx.fillRect(h.x - 12, h.y + h.h - 3, h.w + 24, 30);
                ctx.fillStyle = 'rgba(255, 195, 96, 0.12)';
                ctx.fillRect(h.x - 3, h.y + h.h - 3, h.w + 6, 18);
            }

            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(h.x + 3, h.y + h.h - 3, h.w - 6, 6);

            const sprite = h.isOn
                ? (heatFrame ? SPRITES.FAN_HEATER_ON_1 : SPRITES.FAN_HEATER_ON_2)
                : SPRITES.FAN_HEATER_OFF;
            drawPixelSprite(ctx, sprite, h.x, h.y, h.w, h.h);

            // Subtle warm-air pixel wisps drifting gently outward when ON
            if (h.isOn) {
                ctx.fillStyle = 'rgba(255, 224, 130, 0.35)';
                for (let wIdx = 0; wIdx < 2; wIdx++) {
                    const phase = (tSec * 0.65 + idx * 0.4 + wIdx * 0.5) % 1;
                    const wx    = Math.round((h.x + 9 + wIdx * 15) / 3) * 3;
                    const wy    = Math.round((h.y + h.h + phase * 18) / 3) * 3;
                    ctx.fillRect(wx, wy, 3, 3);
                }
            }
        });
    }

    // 4. Study Chairs
    if (config.chairs) {
        config.chairs.forEach(ch => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.fillRect(ch.x + 3, ch.y + ch.h - 3, ch.w - 6, 6);
            drawPixelSprite(ctx, SPRITES.CHAIR, ch.x, ch.y, ch.w, ch.h, null, null, ch.facing === 'left');
        });
    }

    // 5. Study Desks
    if (config.desks) {
        config.desks.forEach(d => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(d.x + 3, d.y + 6, d.w, d.h);

            let deskSprite = SPRITES.DESK_WOOD;
            if (d.type === 'laptop') deskSprite = SPRITES.DESK_LAPTOP;
            if (d.type === 'book')   deskSprite = SPRITES.DESK_BOOK;

            drawPixelSprite(ctx, deskSprite, d.x, d.y, d.w, d.h);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
            ctx.font      = '10px Tahoma, "MS Sans Serif", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(d.label, Math.round(d.x + d.w * 0.5), Math.round(d.y - 5));
        });
    }

    // 6. Zen Lanterns
    if (config.lanterns) {
        config.lanterns.forEach(l => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(l.x + 3, l.y + l.h - 6, l.w - 6, 6);
            drawPixelSprite(ctx, SPRITES.ZEN_LANTERN, l.x, l.y, l.w, l.h);
        });
    }

    // 7. Potted Plants
    if (config.plants) {
        config.plants.forEach(p => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(p.x + 6, p.y + p.h - 3, p.w - 12, 6);
            drawPixelSprite(ctx, SPRITES.PLANT, p.x, p.y, p.w, p.h);
        });
    }
}
