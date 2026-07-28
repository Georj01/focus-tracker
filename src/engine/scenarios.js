import { SPRITES, drawPixelSprite } from './sprites.js';

// Map scenario definitions
export const scenarioConfigs = {
    cafeteria: {
        name:            'Virtual Cafeteria',
        floorColor:      '#291d18',
        tileAccent:      '#3d2b24',
        borderColor:     '#78350f',
        wallColor:       '#451a03',
        gridColor:       'rgba(217, 119, 6, 0.12)',
        themeColor:      '#f59e0b',
        desks: [
            { x: 220, y: 180, w: 90, h: 50, label: 'Coffee Desk A' },
            { x: 500, y: 180, w: 90, h: 50, label: 'Coffee Desk B' },
            { x: 220, y: 380, w: 90, h: 50, label: 'Window Table' },
            { x: 500, y: 380, w: 90, h: 50, label: 'Quiet Corner' }
        ],
        plants: [
            { x: 80,  y: 80,  r: 16 },
            { x: 720, y: 80,  r: 16 },
            { x: 80,  y: 520, r: 16 },
            { x: 720, y: 520, r: 16 }
        ],
        counter: { x: 320, y: 50, w: 160, h: 40, label: '☕ Espresso Bar' }
    },
    library: {
        name:            'Quiet Library',
        floorColor:      '#1e1b4b',
        tileAccent:      '#312e81',
        borderColor:     '#4338ca',
        wallColor:       '#312e81',
        gridColor:       'rgba(99, 102, 241, 0.12)',
        themeColor:      '#6366f1',
        desks: [
            { x: 200, y: 160, w: 110, h: 55, label: 'Study Carrel 1' },
            { x: 500, y: 160, w: 110, h: 55, label: 'Study Carrel 2' },
            { x: 200, y: 360, w: 110, h: 55, label: 'Research Table' },
            { x: 500, y: 360, w: 110, h: 55, label: 'Silent Pod' }
        ],
        plants: [
            { x: 90,  y: 90,  r: 14 },
            { x: 710, y: 90,  r: 14 }
        ],
        counter: { x: 300, y: 50, w: 200, h: 40, label: '📚 Book Collection' }
    },
    garden: {
        name:            'Zen Garden',
        floorColor:      '#064e3b',
        tileAccent:      '#047857',
        borderColor:     '#059669',
        wallColor:       '#022c22',
        gridColor:       'rgba(16, 185, 129, 0.12)',
        themeColor:      '#10b981',
        desks: [
            { x: 220, y: 200, w: 80, h: 45, label: 'Garden Bench A' },
            { x: 500, y: 200, w: 80, h: 45, label: 'Garden Bench B' },
            { x: 360, y: 380, w: 80, h: 45, label: 'Gazebo Table' }
        ],
        plants: [
            { x: 100, y: 100, r: 20 },
            { x: 700, y: 100, r: 20 },
            { x: 100, y: 500, r: 20 },
            { x: 700, y: 500, r: 20 },
            { x: 400, y: 150, r: 18 }
        ],
        counter: { x: 330, y: 60, w: 140, h: 35, label: '🌸 Tea Pavilion' }
    }
};

// Render floor texture tiles or custom pixel art tiles
export function renderScenarioFloor(ctx, width, height, mapKey = 'cafeteria') {
    const config = scenarioConfigs[mapKey] || scenarioConfigs.cafeteria;
    const tileSize = 60;
    // Procedural pixel art floor tiles fallback
    ctx.fillStyle = config.floorColor;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = config.tileAccent;
    for (let y = 0; y < height; y += tileSize) {
        for (let x = 0; x < width; x += tileSize) {
            if ((x / tileSize + y / tileSize) % 2 === 0) {
                ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
            }
        }
    }

    // Grid lines for tile feel
    ctx.strokeStyle = config.gridColor;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    for (let x = 0; x < width; x += tileSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += tileSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }
    ctx.stroke();
}

// Render scenario perimeter walls and decor
export function renderScenarioEnvironment(ctx, width, height, mapKey = 'cafeteria') {
    const config = scenarioConfigs[mapKey] || scenarioConfigs.cafeteria;

    // 1. Room Border Walls
    const wallThick = 16;
    ctx.fillStyle   = config.wallColor;
    ctx.fillRect(0, 0, width, wallThick);
    ctx.fillRect(0, height - wallThick, width, wallThick);
    ctx.fillRect(0, 0, wallThick, height);
    ctx.fillRect(width - wallThick, 0, wallThick, height);

    ctx.strokeStyle = config.borderColor;
    ctx.lineWidth   = 3;
    ctx.strokeRect(wallThick, wallThick, width - wallThick * 2, height - wallThick * 2);

    // 2. Main Station / Counter
    if (config.counter) {
        const c = config.counter;
        ctx.fillStyle   = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(c.x, c.y, c.w, c.h);
        ctx.strokeStyle = config.themeColor;
        ctx.lineWidth   = 2;
        ctx.strokeRect(c.x, c.y, c.w, c.h);

        ctx.fillStyle = '#ffffff';
        ctx.font      = 'bold 11px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h / 2 + 4);
    }

    // 3. Study Desks & Props
    config.desks.forEach(d => {
        // Drop shadow under desk
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(d.x + 4, d.y + 4, d.w, d.h);

        // Desk body
        drawPixelSprite(ctx, SPRITES.DESK, d.x, d.y, d.w, d.h, config.themeColor);

        // Desk Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font      = '9px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(d.label, d.x + d.w / 2, d.y - 4);
    });

    // 4. Indoor Plants / Decor
    config.plants.forEach(p => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(p.x + 3, p.y + 3, p.r, 0, Math.PI * 2);
        ctx.fill();

        drawPixelSprite(ctx, SPRITES.PLANT, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    });
}
