export const keys = {                                        // Key tracking dictionary representing active keyboard input mapping
    w          : false,                                      // Boolean status tracking 'w' key (motion vector UP component)
    a          : false,                                      // Boolean status tracking 'a' key (motion vector LEFT component)
    s          : false,                                      // Boolean status tracking 's' key (motion vector DOWN component)
    d          : false,                                      // Boolean status tracking 'd' key (motion vector RIGHT component)
    ArrowUp    : false,                                      // Boolean status tracking 'ArrowUp' key (motion vector UP component)
    ArrowLeft  : false,                                      // Boolean status tracking 'ArrowLeft' key (motion vector LEFT component)
    ArrowDown  : false,                                      // Boolean status tracking 'ArrowDown' key (motion vector DOWN component)
    ArrowRight : false                                       // Boolean status tracking 'ArrowRight' key (motion vector RIGHT component)
};                                                           // End of keys state tracking mapping
//                                                           // Space separator to organize execution blocks
window.addEventListener('keydown', (e) => {                  // Bind listener for key down events to toggle active input flags
    const key     = e.key.toLowerCase();                     // Store lowercase representation of keyboard character key
    const isArrow = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key); // Predicate checking for browser scrolling keys
    if (isArrow) e.preventDefault();                         // Block default browser scrolling actions to maintain game view focus
    const hasKey  = Object.prototype.hasOwnProperty.call(keys, e.key); // Check if raw key maps to defined tracking state key safely
    const hasLKey = Object.prototype.hasOwnProperty.call(keys, key);   // Check if lowercase key maps to defined tracking state key safely
    if (hasKey)  keys[e.key] = true;                          // Enable raw input flag state in active registry
    if (hasLKey) keys[key]   = true;                          // Enable lowercase input flag state in active registry
});                                                          // End of keydown event listener registration
//                                                           // Space separator to organize execution blocks
window.addEventListener('keyup', (e) => {                    // Bind listener for key release events to clear active input flags
    const key     = e.key.toLowerCase();                     // Store lowercase representation of keyboard character key
    const hasKey  = Object.prototype.hasOwnProperty.call(keys, e.key); // Check if raw key maps to defined tracking state key safely
    const hasLKey = Object.prototype.hasOwnProperty.call(keys, key);   // Check if lowercase key maps to defined tracking state key safely
    if (hasKey)  keys[e.key] = false;                         // Reset raw input flag state to false in registry
    if (hasLKey) keys[key]   = false;                         // Reset lowercase input flag state to false in registry
});                                                          // End of keyup event listener registration
