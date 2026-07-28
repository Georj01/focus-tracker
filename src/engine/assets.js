// Asset loader module managing game textures and fallback rendering
export const assets = {
    player:    null,
    npc:       null,
    floorCafe: null,
    desk:      null,
    loaded:    false
};

// Asynchronously pre-loads sprite textures
export function loadAssets() {
    const assetSources = {
        player:    './assets/player.jpg',
        npc:       './assets/npc.jpg',
        floorCafe: './assets/floor_cafe.jpg',
        desk:      './assets/desk.jpg'
    };

    const keys = Object.keys(assetSources);
    let loadedCount = 0;

    keys.forEach(key => {
        const img = new Image();
        img.src = assetSources[key];
        img.onload = () => {
            assets[key] = img;
            loadedCount++;
            if (loadedCount === keys.length) {
                assets.loaded = true;
            }
        };
        img.onerror = () => {
            console.warn(`Asset ${key} failed to load, falling back to procedural graphics.`);
        };
    });
}

// Kick off asset loading on module import
loadAssets();
