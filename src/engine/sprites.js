// Crisp Minimalist Pixel Art Engine (Uniform 3x Integer Pixel Grid)

export const PIXEL_SCALE = 3;

export const PALETTE = {
    '_': null,          // Transparent
    '0': '#181818',     // Crisp pixel ink outline
    '1': '#ffd1a9',     // Warm peach skin
    '2': '#3b82f6',     // Primary shirt / outfit (dynamically overridden)
    '3': '#263959',     // Dark navy pants
    '4': '#cc3333',     // Red shoes / accent
    '5': '#ffffff',     // Pure white (pages, mug, CRT highlight)
    '6': '#d93838',     // Cap / primary accent (dynamically overridden)
    '7': '#422818',     // Dark brown hair / trunk
    '8': '#e8b94f',     // Blonde hair / warm oak highlight / gold
    '9': '#9e6637',     // Clean oak wood
    'A': '#5e3618',     // Wood shadow / legs
    'B': '#2f8f4e',     // Clean leaf green
    'C': '#6bd482',     // Bright leaf highlight
    'D': '#4fc3f7',     // Retro CRT cyan screen
    'E': '#c8ccd0',     // Classic Win98 beige-gray / stone light
    'F': '#e874b0',     // Pink dress / ribbon
    'G': '#ffe259',     // Warm lamp / lantern yellow
    'H': '#c45b33',     // Terracotta pot / coffee
    'I': '#747c86'      // Metal / stone shadow
};

export const SPRITES = {
    // ------------------------------------------------------------------------
    // 1. SIMPLE HERO SPRITES (12x13 -> 36x39 px at 3x scale)
    // ------------------------------------------------------------------------
    CHAR_DOWN_IDLE: [
        '___000000___',
        '__06666660__',
        '__06666660__',
        '__01111110__',
        '__01011010__',
        '__01111110__',
        '___000000___',
        '__02222220__',
        '_0102222010_',
        '__02222220__',
        '__03300330__',
        '__04400440__',
        '___00__00___'
    ],
    CHAR_DOWN_WALK_1: [
        '___000000___',
        '__06666660__',
        '__06666660__',
        '__01111110__',
        '__01011010__',
        '__01111110__',
        '___000000___',
        '__02222220__',
        '_010222200__',
        '__0222222010',
        '__03300330__',
        '__0440_00___',
        '___00_______'
    ],
    CHAR_DOWN_WALK_2: [
        '___000000___',
        '__06666660__',
        '__06666660__',
        '__01111110__',
        '__01011010__',
        '__01111110__',
        '___000000___',
        '__02222220__',
        '__002222010_',
        '0102222220__',
        '__03300330__',
        '___00_0440__',
        '_______00___'
    ],
    CHAR_UP_IDLE: [
        '___000000___',
        '__06666660__',
        '__06666660__',
        '__07777770__',
        '__07777770__',
        '__07777770__',
        '___000000___',
        '__02222220__',
        '_0102222010_',
        '__02222220__',
        '__03300330__',
        '__04400440__',
        '___00__00___'
    ],
    CHAR_UP_WALK_1: [
        '___000000___',
        '__06666660__',
        '__06666660__',
        '__07777770__',
        '__07777770__',
        '__07777770__',
        '___000000___',
        '__02222220__',
        '_010222200__',
        '__0222222010',
        '__03300330__',
        '__0440_00___',
        '___00_______'
    ],
    CHAR_UP_WALK_2: [
        '___000000___',
        '__06666660__',
        '__06666660__',
        '__07777770__',
        '__07777770__',
        '__07777770__',
        '___000000___',
        '__02222220__',
        '__002222010_',
        '0102222220__',
        '__03300330__',
        '___00_0440__',
        '_______00___'
    ],
    CHAR_SIDE_IDLE: [
        '___000000___',
        '__06666660__',
        '_066666660__',
        '__01111770__',
        '__01011770__',
        '__01111770__',
        '___000000___',
        '___022220___',
        '___021120___',
        '___022220___',
        '___033330___',
        '___044440___',
        '____0000____'
    ],
    CHAR_SIDE_WALK_1: [
        '___000000___',
        '__06666660__',
        '_066666660__',
        '__01111770__',
        '__01011770__',
        '__01111770__',
        '___000000___',
        '___022220___',
        '__0122220___',
        '___022220___',
        '__03300330__',
        '__04400440__',
        '___00__00___'
    ],
    CHAR_SIDE_WALK_2: [
        '___000000___',
        '__06666660__',
        '_066666660__',
        '__01111770__',
        '__01011770__',
        '__01111770__',
        '___000000___',
        '___022220___',
        '___022210___',
        '___022220___',
        '___033330___',
        '___044440___',
        '____0000____'
    ],

    // Seated studying pose (facing left; flipX=true faces right)
    CHAR_SIT: [
        '___000000___',
        '__06666660__',
        '_066666660__',
        '__01111770__',
        '__01011770__',
        '__01111770__',
        '___000000___',
        '___022220___',
        '__0122220___',
        '___022220___',
        '__0333330___',
        '__0440000___',
        '___00_______'
    ],

    // ------------------------------------------------------------------------
    // 2. SIMPLE NPC VARIANTS (12x13 -> 36x39 px at 3x scale)
    // ------------------------------------------------------------------------
    NPC_SCHOLAR: [
        '___000000___',
        '__08888880__',
        '__08888880__',
        '__01111110__',
        '__00500500__',
        '__01111110__',
        '___000000___',
        '__02222220__',
        '_0102222010_',
        '__02222220__',
        '__03300330__',
        '__07700770__',
        '___00__00___'
    ],
    NPC_GIRL: [
        '___000000___',
        '__07777770__',
        '_0777777770_',
        '_0711111170_',
        '_0710110170_',
        '_0711111170_',
        '___000000___',
        '__02222220__',
        '_0102222010_',
        '_0222222220_',
        '__01100110__',
        '__04400440__',
        '___00__00___'
    ],

    // ------------------------------------------------------------------------
    // 3. SIMPLE CRISP FURNITURE & PROPS (Native Aspect Ratios at 3x Scale!)
    // ------------------------------------------------------------------------
    // Wooden Chair (10x12 -> 30x36 px, facing right; flipX=true faces left)
    CHAIR: [
        '__0000____',
        '__0990____',
        '__0980____',
        '__0990____',
        '__0990000_',
        '__0999990_',
        '__0988890_',
        '__0AAAAA0_',
        '__0000000_',
        '__0A0_0A0_',
        '__0A0_0A0_',
        '__000_000_'
    ],

    // Clean Wooden Desk (32x18 -> 96x54 px)
    DESK_WOOD: [
        '00000000000000000000000000000000',
        '08888888888888888888888888888880',
        '09999999999999999999999999999990',
        '09999999999999999999999999999990',
        '09999999999999999999999999999990',
        '09999999999999999999999999999990',
        '09999999999999999999999999999990',
        '09999999999999999999999999999990',
        '09999999999999999999999999999990',
        '09999999999999999999999999999990',
        '0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0',
        '00000000000000000000000000000000',
        '0AA0________________________0AA0',
        '0990________________________0990',
        '0990________________________0990',
        '0990________________________0990',
        '0AA0________________________0AA0',
        '0000________________________0000'
    ],

    // Desk with Classic Retro CRT PC + Coffee Mug (32x18 -> 96x54 px)
    DESK_LAPTOP: [
        '00000000000000000000000000000000',
        '08888888800000000008888888888880',
        '099999990EEEEEEEEEE0999999999990',
        '099999990E00000000E0999900009990',
        '099999990E0DDDDDD0E099905HH50090',
        '099999990E0D5DDDD0E0999055550500',
        '099999990E0DDDDDD0E0999055550090',
        '099999990E00000000E0999900009990',
        '099999990000IIII0000999999999990',
        '09999990EEEEEEEEEEEE099999999990',
        '0AAAAAA00000000000000AAAAAAAAAA0',
        '00000000000000000000000000000000',
        '0AA0________________________0AA0',
        '0990________________________0990',
        '0990________________________0990',
        '0990________________________0990',
        '0AA0________________________0AA0',
        '0000________________________0000'
    ],

    // Desk with Open Book + Simple Golden Lamp (32x18 -> 96x54 px)
    DESK_BOOK: [
        '00000000000000000000000000000000',
        '08888888888888888888888888888880',
        '09900009999999999999999999999990',
        '090GGGG0999000000000000999999990',
        '090GGGG0990555550055555099999990',
        '099000099905III5005III5099999990',
        '09990I09990555550055555099999990',
        '0990III09905III5005III5099999990',
        '09900000990555550055555099999990',
        '09999999999000000000000999999990',
        '0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0',
        '00000000000000000000000000000000',
        '0AA0________________________0AA0',
        '0990________________________0990',
        '0990________________________0990',
        '0990________________________0990',
        '0AA0________________________0AA0',
        '0000________________________0000'
    ],

    // Simple Potted Plant (12x14 -> 36x42 px)
    PLANT: [
        '____0000____',
        '__00CCCC00__',
        '_0CCBBBBCC0_',
        '_0CBBBBBBC0_',
        '0CBBBBBBBB0_',
        '0BBBBBBBBB0_',
        '_0BBBBBBB0__',
        '__0007700___',
        '____0770____',
        '__00000000__',
        '__0HHHHHH0__',
        '___0HHHH0___',
        '___0HHHH0___',
        '____0000____'
    ],

    // Simple Zen Stone Lantern (12x16 -> 36x48 px)
    ZEN_LANTERN: [
        '____0000____',
        '__00EEEE00__',
        '_0EEEEEEEE0_',
        '_0000000000_',
        '___0GGGG0___',
        '___0G55G0___',
        '___0GGGG0___',
        '___000000___',
        '____0EE0____',
        '____0EI0____',
        '____0EI0____',
        '___00EE00___',
        '__0EEEEEE0__',
        '__0IIIIII0__',
        '__00000000__',
        '____________'
    ],

    // Simple Zen Stepping Stone (14x9 -> 42x27 px)
    ZEN_STONE: [
        '___00000000___',
        '_00EEEEEEEE00_',
        '0EEEEEEEEEEEE0',
        '0EE55EEEEEEEE0',
        '0EEEEEEEEEEEE0',
        '0EEEEEEEEEEEE0',
        '0IIIIIIIIIIII0',
        '_00IIIIIIII00_',
        '___00000000___'
    ],

    // Counter Props (native 3x scale!)
    PROP_ESPRESSO: [
        '_0000000000_',
        '_0EEEEEEEE0_',
        '_0E0DDDD0E0_',
        '_0E000000E0_',
        '_0E00HH00E0_',
        '_0E005500E0_',
        '_0IIIIIIII0_',
        '_0000000000_'
    ],
    PROP_MUG: [
        '_0000_',
        '05HH50',
        '055550',
        '055550',
        '_0000_'
    ],
    PROP_TEAPOT: [
        '___0000___',
        '__0BBBB0__',
        '00BBBBBB00',
        '0BBBBBBBB0',
        '_0BBBBBB0_',
        '__000000__'
    ],
    PROP_BOOKS: [
        '0000000000',
        '0666666660',
        '0000000000',
        '0222222220',
        '0000000000',
        '0888888880',
        '0000000000'
    ],

    // ------------------------------------------------------------------------
    // 4. CAFETERIA PETS: SIMPLE CATS & DOGS (10x9 -> 30x27 px at 3x scale)
    // ------------------------------------------------------------------------
    CAT_IDLE: [
        '_____0__0_',
        '____020020',
        '_00_022220',
        '020_022020',
        '0200022220',
        '_02222660_',
        '_02222220_',
        '_020__020_',
        '_000__000_'
    ],
    CAT_WALK_1: [
        '_____0__0_',
        '____020020',
        '00__022220',
        '020_022020',
        '_000022220',
        '_02222660_',
        '_02222220_',
        '020____020',
        '000____000'
    ],
    CAT_WALK_2: [
        '_____0__0_',
        '____020020',
        '_00_022220',
        '020_022020',
        '0200022220',
        '_02222660_',
        '_02222220_',
        '__020020__',
        '__000000__'
    ],
    CAT_SLEEP: [
        '__________',
        '__________',
        '__________',
        '____0__0__',
        '__0020020_',
        '_022222220',
        '0222222020',
        '0222222220',
        '_00000000_'
    ],
    DOG_IDLE: [
        '____0000__',
        '___027220_',
        '___0272020',
        '00_0272220',
        '0200222000',
        '_02222660_',
        '_02222220_',
        '_020__020_',
        '_000__000_'
    ],
    DOG_WALK_1: [
        '____0000__',
        '___027220_',
        '___0272020',
        '_000272220',
        '_020222000',
        '_02222660_',
        '_02222220_',
        '020____020',
        '000____000'
    ],
    DOG_WALK_2: [
        '____0000__',
        '___027220_',
        '___0272020',
        '00_0272220',
        '0200222000',
        '_02222660_',
        '_02222220_',
        '__020020__',
        '__000000__'
    ],
    DOG_SLEEP: [
        '__________',
        '__________',
        '__________',
        '___00000__',
        '_00227220_',
        '0222272020',
        '0222222220',
        '0222222220',
        '_00000000_'
    ]
};

// Offscreen Canvas Cache: O(1) crisp integer nearest-neighbor blitting
const spriteCache = new WeakMap();

export function drawPixelSprite(ctx, spriteData, x, y, width, height, mainColor = null, accentColor = null, flipX = false) {
    if (!spriteData || !spriteData.length) return;

    const rows  = spriteData.length;
    const cols  = spriteData[0].length;
    const scale = width ? Math.max(1, Math.round(width / cols)) : PIXEL_SCALE;

    let variantMap = spriteCache.get(spriteData);
    if (!variantMap) {
        variantMap = new Map();
        spriteCache.set(spriteData, variantMap);
    }

    const cacheKey = `${scale}|${mainColor || ''}|${accentColor || ''}|${flipX ? 1 : 0}`;
    let offscreen  = variantMap.get(cacheKey);

    if (!offscreen && typeof document !== 'undefined') {
        offscreen        = document.createElement('canvas');
        offscreen.width  = cols * scale;
        offscreen.height = rows * scale;
        const octx       = offscreen.getContext('2d');
        octx.imageSmoothingEnabled = false;

        for (let r = 0; r < rows; r++) {
            const rowStr = spriteData[r];
            for (let c = 0; c < cols; c++) {
                const colIdx = flipX ? (cols - 1 - c) : c;
                const val    = rowStr[colIdx];
                if (val === '_') continue;

                let color = PALETTE[val];
                if (!color) continue;

                if (val === '2' && mainColor)   color = mainColor;
                if (val === '6' && accentColor) color = accentColor;

                octx.fillStyle = color;
                octx.fillRect(c * scale, r * scale, scale, scale);
            }
        }
        variantMap.set(cacheKey, offscreen);
    }

    if (offscreen) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(offscreen, Math.round(x), Math.round(y));
    }
}

// Crisp modular pixel-art counter (no sprite stretching!)
export function drawPixelCounter(ctx, x, y, w, h, mapKey) {
    const p  = PIXEL_SCALE;
    const rx = Math.round(x);
    const ry = Math.round(y);
    const rw = Math.round(w);
    const rh = Math.round(h);

    // Outer black pixel outline
    ctx.fillStyle = PALETTE['0'];
    ctx.fillRect(rx, ry, rw, rh);

    // Countertop surface (top half)
    const topH = Math.floor(rh * 0.48);
    ctx.fillStyle = PALETTE['9'];
    ctx.fillRect(rx + p, ry + p, rw - p * 2, topH - p);
    // Top highlight strip
    ctx.fillStyle = PALETTE['8'];
    ctx.fillRect(rx + p, ry + p, rw - p * 2, p);
    // Countertop front lip
    ctx.fillStyle = PALETTE['A'];
    ctx.fillRect(rx + p, ry + topH - p, rw - p * 2, p);
    ctx.fillStyle = PALETTE['0'];
    ctx.fillRect(rx, ry + topH, rw, p);

    // Front wooden panel
    const frontY = ry + topH + p;
    const frontH = rh - topH - p * 2;
    ctx.fillStyle = PALETTE['9'];
    ctx.fillRect(rx + p, frontY, rw - p * 2, frontH);
    ctx.fillStyle = PALETTE['A'];
    ctx.fillRect(rx + p, ry + rh - p * 2, rw - p * 2, p);

    // Subtle vertical panel slats on uniform pixel grid
    for (let sx = rx + p * 8; sx < rx + rw - p * 6; sx += p * 12) {
        ctx.fillStyle = PALETTE['A'];
        ctx.fillRect(sx, frontY + p, p, Math.max(p, frontH - p * 2));
    }

    // Native 3x pixel props placed neatly on top of the counter
    if (mapKey === 'cafeteria') {
        drawPixelSprite(ctx, SPRITES.PROP_ESPRESSO, rx + 24, ry + 3, 36, 24);
        drawPixelSprite(ctx, SPRITES.PROP_MUG, rx + 78, ry + 9, 18, 15);
        drawPixelSprite(ctx, SPRITES.PROP_MUG, rx + rw - 66, ry + 9, 18, 15);
    } else if (mapKey === 'library') {
        drawPixelSprite(ctx, SPRITES.PROP_BOOKS, rx + 28, ry + 6, 30, 21);
        drawPixelSprite(ctx, SPRITES.PROP_BOOKS, rx + rw - 64, ry + 6, 30, 21);
    } else {
        drawPixelSprite(ctx, SPRITES.PROP_TEAPOT, rx + 28, ry + 6, 30, 18);
        drawPixelSprite(ctx, SPRITES.PROP_MUG, rx + rw - 54, ry + 9, 18, 15);
    }
}

// Crisp modular pixel-art bookshelf (tiling clean book blocks with zero stretching!)
export function drawPixelBookshelf(ctx, x, y, w, h) {
    const p  = PIXEL_SCALE;
    const rx = Math.round(x);
    const ry = Math.round(y);
    const rw = Math.round(w);
    const rh = Math.round(h);
    const bookColors = [PALETTE['6'], PALETTE['2'], PALETTE['B'], PALETTE['8'], PALETTE['F']];

    ctx.fillStyle = PALETTE['0'];
    ctx.fillRect(rx, ry, rw, rh);
    ctx.fillStyle = PALETTE['9'];
    ctx.fillRect(rx + p, ry + p, rw - p * 2, rh - p * 2);

    const isHorizontal = rw >= rh;
    if (isHorizontal) {
        const shelfH = p * 5;
        let idx = 0;
        for (let sy = ry + p * 2; sy + p * 3 <= ry + rh - p; sy += shelfH) {
            ctx.fillStyle = PALETTE['A'];
            ctx.fillRect(rx + p * 2, sy, rw - p * 4, p * 3);
            for (let bx = rx + p * 3; bx + p * 2 <= rx + rw - p * 3; bx += p * 3) {
                ctx.fillStyle = bookColors[idx % bookColors.length];
                ctx.fillRect(bx, sy, p * 2, p * 3);
                idx++;
            }
            ctx.fillStyle = PALETTE['8'];
            ctx.fillRect(rx + p, sy + p * 3, rw - p * 2, p);
        }
    } else {
        const shelfH = p * 7;
        let idx = 0;
        for (let sy = ry + p * 2; sy + p * 5 <= ry + rh - p; sy += shelfH) {
            ctx.fillStyle = PALETTE['A'];
            ctx.fillRect(rx + p * 2, sy, rw - p * 4, p * 4);
            for (let bx = rx + p * 3; bx + p * 2 <= rx + rw - p * 3; bx += p * 3) {
                ctx.fillStyle = bookColors[idx % bookColors.length];
                ctx.fillRect(bx, sy + p, p * 2, p * 3);
                idx++;
            }
            ctx.fillStyle = PALETTE['8'];
            ctx.fillRect(rx + p, sy + p * 4, rw - p * 2, p);
        }
    }
}
