// Procedural Pixel Art Sprite Engine

const palette = {
    '_': null, // Transparent
    '0': '#0f172a', // Outline / Shadows
    '1': '#ffcc99', // Skin
    '2': '#3b82f6', // Main Body Color (dynamically overriden)
    '3': '#1e3a8a', // Pants
    '4': '#4b5563', // Shoes
    '5': '#ffffff', // Eyes / Highlights
    '6': '#f43f5e', // Headphones / Accessory (dynamically overriden)
    '7': '#fbbf24', // Hair
    '8': '#8b5cf6', // Accents
    '9': '#64748b'  // Grey/Metal
};

export const SPRITES = {
    CHAR_IDLE: [
        "____00000000____",
        "___0666666660___",
        "___0677777760___",
        "___0671111760___",
        "___0115115110___",
        "___0110110110___",
        "___0611111160___",
        "____06111160____",
        "_____022220_____",
        "____02222220____",
        "____02222220____",
        "____00333300____",
        "_____033330_____",
        "_____03__30_____",
        "____044__440____",
        "____000__000____"
    ],
    CHAR_WALK_1: [
        "____00000000____",
        "___0666666660___",
        "___0677777760___",
        "___0671111760___",
        "___0115115110___",
        "___0110110110___",
        "___0611111160___",
        "____06111160____",
        "_____022220_____",
        "____02222220____",
        "____02222220____",
        "____00333300____",
        "_____033330_____",
        "____033__30_____",
        "___044___440____",
        "___000___000____"
    ],
    CHAR_WALK_2: [
        "____00000000____",
        "___0666666660___",
        "___0677777760___",
        "___0671111760___",
        "___0115115110___",
        "___0110110110___",
        "___0611111160___",
        "____06111160____",
        "_____022220_____",
        "____02222220____",
        "____02222220____",
        "____00333300____",
        "_____033330_____",
        "_____03__330____",
        "____044___440___",
        "____000___000___"
    ],
    DESK: [
        "___0000000000___",
        "__088888888880__",
        "_08888888888880_",
        "0888888888888880",
        "0888888888888880",
        "0888855588888880",
        "0888555558888880",
        "0888855588888880",
        "0888888888888880",
        "_08888888888880_",
        "__088888888880__",
        "___0000000000___",
        "___0990__0990___",
        "___0990__0990___",
        "___0990__0990___",
        "___0000__0000___"
    ],
    PLANT: [
        "_______00_______",
        "______0220______",
        "_____022220_____",
        "____02252220____",
        "_____022220_____",
        "___00_0220_00___",
        "__0220_00_0220__",
        "_02222000022220_",
        "__022009900220__",
        "___0009999000___",
        "____09999990____",
        "____09999990____",
        "____09959990____",
        "____09999990____",
        "____09999990____",
        "____00000000____"
    ]
};

// Render a specific sprite data array to the canvas
export function drawPixelSprite(ctx, spriteData, x, y, width, height, mainColor = null, accentColor = null) {
    const rows = spriteData.length;
    const cols = spriteData[0].length;
    const pixelWidth = width / cols;
    const pixelHeight = height / rows;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const val = spriteData[r][c];
            if (val === '_') continue;

            let color = palette[val];
            
            // Dynamic color overrides
            if (val === '2' && mainColor) color = mainColor;
            if (val === '6' && accentColor) color = accentColor;
            if (val === '8' && mainColor) color = mainColor; // For desks

            ctx.fillStyle = color;
            // Add a tiny overlap (+0.5) to prevent anti-aliasing gaps between pixels
            ctx.fillRect(Math.floor(x + c * pixelWidth), Math.floor(y + r * pixelHeight), Math.ceil(pixelWidth + 0.5), Math.ceil(pixelHeight + 0.5));
        }
    }
}
