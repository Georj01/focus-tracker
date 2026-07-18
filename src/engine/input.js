// Track active state of movements inputs
export const keys = {
    w          : false,
    a          : false,
    s          : false,
    d          : false,
    ArrowUp    : false,
    ArrowLeft  : false,
    ArrowDown  : false,
    ArrowRight : false
};

window.addEventListener('keydown', (e) => {
    const key     = e.key.toLowerCase();
    const isArrow = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key);
    if (isArrow) e.preventDefault(); // Stop window scroll actions
    
    // Mitigate Prototype Pollution vulnerabilities
    const hasKey  = Object.prototype.hasOwnProperty.call(keys, e.key);
    const hasLKey = Object.prototype.hasOwnProperty.call(keys, key);
    if (hasKey)  keys[e.key] = true;
    if (hasLKey) keys[key]   = true;
});

window.addEventListener('keyup', (e) => {
    const key     = e.key.toLowerCase();
    const hasKey  = Object.prototype.hasOwnProperty.call(keys, e.key);
    const hasLKey = Object.prototype.hasOwnProperty.call(keys, key);
    if (hasKey)  keys[e.key] = false;
    if (hasLKey) keys[key]   = false;
});
