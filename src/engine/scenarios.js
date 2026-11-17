import { SPRITES, drawPixelSprite } from './sprites.js';
import { i18n } from './i18n.js';

// Map scenario definitions and full EarthBound environments
export const scenarioConfigs = {
    cafeteria: {
        name:        'Virtual Cafeteria',
        floorType:   'checker',
        floorColor:  '#2a1810',
        tileAccent:  '#3d251a',
        borderColor: '#b45309',
        wallColor:   '#451a03',
        gridColor:   'rgba(217, 119, 6, 0.15)',
        themeColor:  '#f59e0b',
        counter:     { x: 440, y: 40, w: 320, h: 56, label: '☕ Onett Espresso Bar' },
        desks: [
            { x: 140, y: 180, w: 96, h: 52, type: 'laptop', label: 'Coffee Desk A' },
            { x: 420, y: 200, w: 96, h: 52, type: 'book',   label: 'Central Table 1' },
            { x: 680, y: 200, w: 96, h: 52, type: 'laptop', label: 'Central Table 2' },
            { x: 960, y: 180, w: 96, h: 52, type: 'book',   label: 'Window Nook' },
            { x: 180, y: 460, w: 104, h: 54, type: 'book',   label: 'Quiet Corner' },
            { x: 480, y: 470, w: 104, h: 54, type: 'laptop', label: 'Study Station A' },
            { x: 780, y: 470, w: 104, h: 54, type: 'book',   label: 'Study Station B' },
            { x: 980, y: 460, w: 96,  h: 54, type: 'laptop', label: 'South Window' }
        ],
        chairs: [
            // Desk 1
            { x: 100, y: 186, w: 30, h: 36, facing: 'right' },
            { x: 244, y: 186, w: 30, h: 36, facing: 'left' },
            // Desk 2
            { x: 380, y: 206, w: 30, h: 36, facing: 'right' },
            { x: 524, y: 206, w: 30, h: 36, facing: 'left' },
            // Desk 3
            { x: 640, y: 206, w: 30, h: 36, facing: 'right' },
            { x: 784, y: 206, w: 30, h: 36, facing: 'left' },
            // Desk 4
            { x: 920, y: 186, w: 30, h: 36, facing: 'right' },
            { x: 1064, y: 186, w: 30, h: 36, facing: 'left' },
            // Desk 5
            { x: 140, y: 468, w: 30, h: 36, facing: 'right' },
            { x: 292, y: 468, w: 30, h: 36, facing: 'left' },
            // Desk 6
            { x: 440, y: 478, w: 30, h: 36, facing: 'right' },
            { x: 592, y: 478, w: 30, h: 36, facing: 'left' },
            // Desk 7
            { x: 740, y: 478, w: 30, h: 36, facing: 'right' },
            { x: 892, y: 478, w: 30, h: 36, facing: 'left' }
        ],
        plants: [
            { x: 60,   y: 60,  w: 40, h: 44 },
            { x: 1100, y: 60,  w: 40, h: 44 },
            { x: 60,   y: 700, w: 40, h: 44 },
            { x: 1100, y: 700, w: 40, h: 44 },
            { x: 360,  y: 330, w: 36, h: 40 },
            { x: 840,  y: 330, w: 36, h: 40 }
        ]
    },

    library: {
        name:        'Quiet Library',
        floorType:   'parquet',
        floorColor:  '#1e1b4b',
        tileAccent:  '#312e81',
        borderColor: '#6366f1',
        wallColor:   '#17153b',
        gridColor:   'rgba(99, 102, 241, 0.14)',
        themeColor:  '#818cf8',
        counter:     { x: 440, y: 44, w: 320, h: 54, label: '📚 Twoson Library Archives' },
        bookshelves: [
            { x: 90,   y: 40, w: 280, h: 44 },
            { x: 830,  y: 40, w: 280, h: 44 },
            { x: 40,   y: 220, w: 44,  h: 180 },
            { x: 40,   y: 460, w: 44,  h: 180 },
            { x: 1116, y: 220, w: 44,  h: 180 },
            { x: 1116, y: 460, w: 44,  h: 180 }
        ],
        desks: [
            { x: 180, y: 200, w: 104, h: 54, type: 'book',   label: 'Carrel 1' },
            { x: 450, y: 210, w: 104, h: 54, type: 'laptop', label: 'Research Table A' },
            { x: 740, y: 210, w: 104, h: 54, type: 'book',   label: 'Research Table B' },
            { x: 940, y: 200, w: 104, h: 54, type: 'laptop', label: 'Carrel 2' },
            { x: 220, y: 480, w: 110, h: 56, type: 'laptop', label: 'Silent Pod 1' },
            { x: 530, y: 490, w: 110, h: 56, type: 'book',   label: 'Silent Pod 2' },
            { x: 840, y: 480, w: 110, h: 56, type: 'laptop', label: 'Silent Pod 3' }
        ],
        chairs: [
            // Desk 1
            { x: 140, y: 208, w: 30, h: 36, facing: 'right' },
            { x: 292, y: 208, w: 30, h: 36, facing: 'left' },
            // Desk 2
            { x: 410, y: 218, w: 30, h: 36, facing: 'right' },
            { x: 562, y: 218, w: 30, h: 36, facing: 'left' },
            // Desk 3
            { x: 700, y: 218, w: 30, h: 36, facing: 'right' },
            { x: 852, y: 218, w: 30, h: 36, facing: 'left' },
            // Desk 4
            { x: 900, y: 208, w: 30, h: 36, facing: 'right' },
            { x: 1052, y: 208, w: 30, h: 36, facing: 'left' },
            // Desk 5
            { x: 180, y: 490, w: 30, h: 36, facing: 'right' },
            { x: 338, y: 490, w: 30, h: 36, facing: 'left' },
            // Desk 6
            { x: 490, y: 500, w: 30, h: 36, facing: 'right' },
            { x: 648, y: 500, w: 30, h: 36, facing: 'left' },
            // Desk 7
            { x: 800, y: 490, w: 30, h: 36, facing: 'right' },
            { x: 958, y: 490, w: 30, h: 36, facing: 'left' }
        ],
        plants: [
            { x: 100,  y: 690, w: 38, h: 42 },
            { x: 1060, y: 690, w: 38, h: 42 },
            { x: 340,  y: 350, w: 34, h: 38 },
            { x: 820,  y: 350, w: 34, h: 38 }
        ]
    },

    garden: {
        name:        'Zen Garden',
        floorType:   'garden',
        floorColor:  '#064e3b',
        tileAccent:  '#047857',
        borderColor: '#10b981',
        wallColor:   '#022c22',
        gridColor:   'rgba(16, 185, 129, 0.12)',
        themeColor:  '#34d399',
        counter:     { x: 440, y: 44, w: 320, h: 56, label: '🌸 Dalaam Tea Pavilion' },
        lanterns: [
            { x: 160, y: 100, w: 36, h: 48 },
            { x: 1000, y: 100, w: 36, h: 48 },
            { x: 180, y: 660, w: 36, h: 48 },
            { x: 980, y: 660, w: 36, h: 48 }
        ],
        steppingStones: [
            { x: 580, y: 130, w: 40, h: 28 },
            { x: 570, y: 200, w: 42, h: 28 },
            { x: 590, y: 270, w: 38, h: 28 },
            { x: 580, y: 340, w: 40, h: 28 },
            { x: 560, y: 410, w: 44, h: 28 },
            { x: 590, y: 480, w: 40, h: 28 },
            { x: 580, y: 550, w: 42, h: 28 },
            { x: 570, y: 620, w: 40, h: 28 },
            { x: 580, y: 690, w: 44, h: 28 }
        ],
        desks: [
            { x: 180, y: 210, w: 100, h: 54, type: 'laptop', label: 'Bonsai Bench 1' },
            { x: 780, y: 210, w: 100, h: 54, type: 'book',   label: 'Bonsai Bench 2' },
            { x: 220, y: 450, w: 104, h: 54, type: 'book',   label: 'Lantern Arbor A' },
            { x: 740, y: 450, w: 104, h: 54, type: 'laptop', label: 'Lantern Arbor B' },
            { x: 380, y: 620, w: 96,  h: 52, type: 'book',   label: 'Stone Rest 1' },
            { x: 700, y: 620, w: 96,  h: 52, type: 'laptop', label: 'Stone Rest 2' }
        ],
        chairs: [
            // Desk 1
            { x: 140, y: 218, w: 30, h: 36, facing: 'right' },
            { x: 288, y: 218, w: 30, h: 36, facing: 'left' },
            // Desk 2
            { x: 740, y: 218, w: 30, h: 36, facing: 'right' },
            { x: 888, y: 218, w: 30, h: 36, facing: 'left' },
            // Desk 3
            { x: 180, y: 458, w: 30, h: 36, facing: 'right' },
            { x: 332, y: 458, w: 30, h: 36, facing: 'left' },
            // Desk 4
            { x: 700, y: 458, w: 30, h: 36, facing: 'right' },
            { x: 852, y: 458, w: 30, h: 36, facing: 'left' },
            // Desk 5
            { x: 340, y: 628, w: 30, h: 36, facing: 'right' },
            { x: 484, y: 628, w: 30, h: 36, facing: 'left' },
            // Desk 6
            { x: 660, y: 628, w: 30, h: 36, facing: 'right' },
            { x: 804, y: 628, w: 30, h: 36, facing: 'left' }
        ],
        plants: [
            { x: 80,   y: 80,  w: 48, h: 52 },
            { x: 1080, y: 80,  w: 48, h: 52 },
            { x: 80,   y: 680, w: 48, h: 52 },
            { x: 1080, y: 680, w: 48, h: 52 },
            { x: 340,  y: 320, w: 42, h: 46 },
            { x: 820,  y: 320, w: 42, h: 46 }
        ]
    }
};

// Retrieve study seats list for dynamic NPC placement
export function getStudySeats(mapKey = 'cafeteria') {
    const config = scenarioConfigs[mapKey] || scenarioConfigs.cafeteria;
    return config.chairs || [];
}

const obstacleCache = new Map();
const floorCache    = new Map();

// Retrieve bounding boxes for solid collision checking (memoized per scenario & world dimensions)
export function getObstacles(mapKey, width, height) {
    const cacheKey = `${mapKey}|${width}|${height}`;
    const cached   = obstacleCache.get(cacheKey);
    if (cached) return cached;

    const config    = scenarioConfigs[mapKey] || scenarioConfigs.cafeteria;
    const obstacles = [];

    // Outer boundary walls (thickness 20px)
    const wallThick = 20;
    obstacles.push({ x: 0, y: 0, w: width, h: wallThick });
    obstacles.push({ x: 0, y: height - wallThick, w: width, h: wallThick });
    obstacles.push({ x: 0, y: 0, w: wallThick, h: height });
    obstacles.push({ x: width - wallThick, y: 0, w: wallThick, h: height });

    // Counter / Espresso Bar
    if (config.counter) {
        obstacles.push({
            x: config.counter.x,
            y: config.counter.y,
            w: config.counter.w,
            h: config.counter.h
        });
    }

    // Bookshelves
    if (config.bookshelves) {
        config.bookshelves.forEach(b => {
            obstacles.push({ x: b.x, y: b.y, w: b.w, h: b.h });
        });
    }

    // Desks
    if (config.desks) {
        config.desks.forEach(d => {
            obstacles.push({ x: d.x, y: d.y, w: d.w, h: d.h });
        });
    }

    // Heavy Plants / Lanterns
    if (config.plants) {
        config.plants.forEach(p => {
            obstacles.push({ x: p.x + 4, y: p.y + 4, w: p.w - 8, h: p.h - 8 });
        });
    }

    if (config.lanterns) {
        config.lanterns.forEach(l => {
            obstacles.push({ x: l.x, y: l.y, w: l.w, h: l.h });
        });
    }

    obstacleCache.set(cacheKey, obstacles);
    return obstacles;
}

// Render scenario floor with authentic retro pixel tiles (cached to offscreen canvas)
export function renderScenarioFloor(ctx, width, height, mapKey = 'cafeteria') {
    const cacheKey = `${mapKey}|${width}|${height}`;
    let offscreen  = floorCache.get(cacheKey);

    if (!offscreen && typeof document !== 'undefined') {
        offscreen        = document.createElement('canvas');
        offscreen.width  = width;
        offscreen.height = height;
        const octx       = offscreen.getContext('2d');

        const config   = scenarioConfigs[mapKey] || scenarioConfigs.cafeteria;
        const tileSize = 48;

        octx.fillStyle = config.floorColor;
        octx.fillRect(0, 0, width, height);

        if (config.floorType === 'checker') {
            octx.fillStyle = config.tileAccent;
            for (let y = 0; y < height; y += tileSize) {
                for (let x = 0; x < width; x += tileSize) {
                    if (((x / tileSize) + (y / tileSize)) % 2 === 0) {
                        octx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
                    }
                }
            }
        } else if (config.floorType === 'parquet') {
            octx.fillStyle = config.tileAccent;
            for (let y = 0; y < height; y += tileSize) {
                for (let x = 0; x < width; x += tileSize) {
                    if (Math.floor(y / tileSize) % 2 === 0) {
                        octx.fillRect(x + 2, y + 2, tileSize - 4, (tileSize >> 1) - 4);
                    } else {
                        octx.fillRect(x + (tileSize >> 1) + 2, y + 2, (tileSize >> 1) - 4, tileSize - 4);
                    }
                }
            }
        } else {
            octx.fillStyle = config.tileAccent;
            for (let y = 24; y < height; y += 72) {
                for (let x = 24; x < width; x += 72) {
                    octx.fillRect(x, y, 16, 16);
                    octx.fillRect(x + 8, y + 8, 12, 12);
                }
            }
        }

        // Grid accent lines
        octx.strokeStyle = config.gridColor;
        octx.lineWidth   = 1;
        octx.beginPath();
        for (let x = 0; x < width; x += tileSize) {
            octx.moveTo(x, 0);
            octx.lineTo(x, height);
        }
        for (let y = 0; y < height; y += tileSize) {
            octx.moveTo(0, y);
            octx.lineTo(width, y);
        }
        octx.stroke();

        // Render zen stepping stones if present
        if (config.steppingStones) {
            config.steppingStones.forEach(s => {
                drawPixelSprite(octx, SPRITES.ZEN_STONE, s.x, s.y, s.w, s.h);
            });
        }

        floorCache.set(cacheKey, offscreen);
    }

    if (offscreen) {
        ctx.drawImage(offscreen, 0, 0);
    }
}


// Render scenario perimeter walls, furniture, chairs, and atmospheric props
export function renderScenarioEnvironment(ctx, width, height, mapKey = 'cafeteria') {
    const config = scenarioConfigs[mapKey] || scenarioConfigs.cafeteria;

    // 1. Room Border Walls
    const wallThick = 20;
    ctx.fillStyle   = config.wallColor;
    ctx.fillRect(0, 0, width, wallThick);
    ctx.fillRect(0, height - wallThick, width, wallThick);
    ctx.fillRect(0, 0, wallThick, height);
    ctx.fillRect(width - wallThick, 0, wallThick, height);

    ctx.strokeStyle = config.borderColor;
    ctx.lineWidth   = 3;
    ctx.strokeRect(wallThick, wallThick, width - wallThick * 2, height - wallThick * 2);

    // 2. Bookshelves (Library)
    if (config.bookshelves) {
        config.bookshelves.forEach(b => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(b.x + 4, b.y + 4, b.w, b.h);
            drawPixelSprite(ctx, SPRITES.BOOKSHELF, b.x, b.y, b.w, b.h);
        });
    }

    // 3. Main Reception / Espresso Counter
    if (config.counter) {
        const c = config.counter;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(c.x + 6, c.y + 6, c.w, c.h);
        drawPixelSprite(ctx, SPRITES.COUNTER, c.x, c.y, c.w, c.h);

        // Counter Signboard Badge
        ctx.fillStyle   = 'rgba(24, 20, 37, 0.9)';
        ctx.strokeStyle = config.themeColor;
        ctx.lineWidth   = 2;
        const badgeW    = 240;
        const badgeH    = 26;
        const badgeX    = c.x + (c.w - badgeW) * 0.5;
        const badgeY    = c.y - 14;
        ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
        ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);

        let signLabel = c.label;
        if (mapKey === 'cafeteria') signLabel = i18n.t('signCafeteria');
        else if (mapKey === 'library') signLabel = i18n.t('signLibrary');
        else if (mapKey === 'garden') signLabel = i18n.t('signGarden');

        ctx.fillStyle = '#f8fafc';
        ctx.font      = 'bold 12px Courier New, "MS Gothic", "Noto Sans JP", monospace, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(signLabel, c.x + c.w * 0.5, badgeY + 17);
    }

    // 4. Study Chairs (Rendered beneath character layers)
    if (config.chairs) {
        config.chairs.forEach(ch => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(ch.x + 2, ch.y + 2, ch.w, ch.h);
            drawPixelSprite(ctx, SPRITES.CHAIR, ch.x, ch.y, ch.w, ch.h, null, null, ch.facing === 'left');
        });
    }

    // 5. Study Desks with Props (Laptops / Textbooks / Lamps)
    if (config.desks) {
        config.desks.forEach(d => {
            // Drop shadow under desk
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.fillRect(d.x + 4, d.y + 4, d.w, d.h);

            // Select sprite variant
            let deskSprite = SPRITES.DESK_WOOD;
            if (d.type === 'laptop') deskSprite = SPRITES.DESK_LAPTOP;
            if (d.type === 'book')   deskSprite = SPRITES.DESK_BOOK;

            drawPixelSprite(ctx, deskSprite, d.x, d.y, d.w, d.h);

            // Subtle desk name tag
            ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
            ctx.font      = '9px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(d.label, d.x + d.w * 0.5, d.y - 5);
        });
    }

    // 6. Zen Lanterns (Garden)
    if (config.lanterns) {
        config.lanterns.forEach(l => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.fillRect(l.x + 3, l.y + 3, l.w, l.h);
            drawPixelSprite(ctx, SPRITES.ZEN_LANTERN, l.x, l.y, l.w, l.h);
        });
    }

    // 7. Potted Plants / Bonsai Trees
    if (config.plants) {
        config.plants.forEach(p => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.beginPath();
            ctx.ellipse(p.x + p.w * 0.5, p.y + p.h - 4, p.w * 0.45, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            drawPixelSprite(ctx, SPRITES.PLANT, p.x, p.y, p.w, p.h);
        });
    }
}
