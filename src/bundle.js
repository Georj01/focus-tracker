// Pomodoro World 2D - Standalone Bundle (Zero CORS, 100% Offline, Native file:// compatible)
(() => {
    'use strict';

    // ============================================================================
    // Module: src/engine/input.js
    // ============================================================================
    // Track active state of movement and action inputs
    const keys = {
        w          : false,
        a          : false,
        s          : false,
        d          : false,
        e          : false,
        ArrowUp    : false,
        ArrowLeft  : false,
        ArrowDown  : false,
        ArrowRight : false
    };
    
    window.addEventListener('keydown', (e) => {
        // Ignore gameplay controls if typing in a text field
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(activeTag)) {
            return;
        }
    
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

    // ============================================================================
    // Module: src/engine/camera.js
    // ============================================================================
    // Manage viewport camera transformations with boundary clamping & centering
    class Camera {
        constructor(viewportWidth, viewportHeight) {
            this.x              = 0;
            this.y              = 0;
            this.viewportWidth  = viewportWidth;
            this.viewportHeight = viewportHeight;
        }
    
        // Update camera to center target while strictly preventing viewport scroll into void
        update(targetX, targetY, targetWidth = 32, targetHeight = 40, worldWidth = 1200, worldHeight = 800) {
            // Horizontal camera calculation
            if (this.viewportWidth >= worldWidth) {
                // Screen is wider than the room: center the room on screen
                this.x = (worldWidth - this.viewportWidth) * 0.5;
            } else {
                // Screen is narrower: center on target and clamp between 0 and (worldWidth - viewportWidth)
                const desiredX = targetX - (this.viewportWidth - targetWidth) * 0.5;
                this.x = Math.max(0, Math.min(worldWidth - this.viewportWidth, desiredX));
            }
    
            // Vertical camera calculation
            if (this.viewportHeight >= worldHeight) {
                // Screen is taller than the room: center the room vertically
                this.y = (worldHeight - this.viewportHeight) * 0.5;
            } else {
                // Screen is shorter: center on target and clamp between 0 and (worldHeight - viewportHeight)
                const desiredY = targetY - (this.viewportHeight - targetHeight) * 0.5;
                this.y = Math.max(0, Math.min(worldHeight - this.viewportHeight, desiredY));
            }
        }
    }

    // ============================================================================
    // Module: src/engine/audio.js
    // ============================================================================
    // Procedural Web Audio Engine: Synthesized 16-Bit Sound FX & Ambient Noise
    // Zero external asset dependencies - runs completely offline
    
    class SoundEngine {
        constructor() {
            this.ctx           = null;
            this.masterVolume  = 0.7;
            this.sfxVolume     = 0.8;
            this.ambientVolume = 0.4;
            this.isMuted       = false;
            this.ambientType   = 'off'; // 'off' | 'rain' | 'cafe'
    
            // Active ambient audio nodes
            this.ambientSource = null;
            this.ambientGain   = null;
            this.ambientFilter = null;
    
            this.loadSettings();
        }
    
        initContext() {
            if (!this.ctx) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    this.ctx = new AudioContextClass();
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            return this.ctx;
        }
    
        loadSettings() {
            try {
                const saved = localStorage.getItem('pomodoroAudioConfig');
                if (saved) {
                    const cfg = JSON.parse(saved);
                    if (typeof cfg.masterVolume === 'number')  this.masterVolume  = cfg.masterVolume;
                    if (typeof cfg.ambientVolume === 'number') this.ambientVolume = cfg.ambientVolume;
                    if (typeof cfg.isMuted === 'boolean')      this.isMuted       = cfg.isMuted;
                    if (['off', 'rain', 'cafe'].includes(cfg.ambientType)) this.ambientType = cfg.ambientType;
                }
            } catch (_) {}
        }
    
        saveSettings() {
            try {
                localStorage.setItem('pomodoroAudioConfig', JSON.stringify({
                    masterVolume:  this.masterVolume,
                    ambientVolume: this.ambientVolume,
                    isMuted:       this.isMuted,
                    ambientType:   this.ambientType
                }));
            } catch (_) {}
        }
    
        toggleMute() {
            this.isMuted = !this.isMuted;
            this.saveSettings();
            if (this.isMuted) {
                this.stopAmbient();
            } else if (this.ambientType !== 'off') {
                this.startAmbient(this.ambientType);
            }
            return this.isMuted;
        }
    
        setMasterVolume(val) {
            this.masterVolume = Math.max(0, Math.min(1, val));
            this.saveSettings();
            if (this.ambientGain && this.ctx) {
                this.ambientGain.gain.setValueAtTime(this.ambientVolume * this.masterVolume, this.ctx.currentTime);
            }
        }
    
        setAmbientType(type) {
            if (!['off', 'rain', 'cafe'].includes(type)) return;
            this.ambientType = type;
            this.saveSettings();
            if (type === 'off' || this.isMuted) {
                this.stopAmbient();
            } else {
                this.startAmbient(type);
            }
        }
    
        // ------------------------------------------------------------------------
        // Synthesized Sound Effects
        // ------------------------------------------------------------------------
        play(type) {
            if (this.isMuted || this.masterVolume <= 0) return;
            const actx = this.initContext();
            if (!actx) return;
    
            const now = actx.currentTime;
            const vol = this.masterVolume * this.sfxVolume;
    
            switch (type) {
                case 'focus_start': {
                    // Cheerful 4-tone retro arpeggio (C5 -> E5 -> G5 -> C6)
                    const freqs = [523.25, 659.25, 783.99, 1046.50];
                    freqs.forEach((f, i) => {
                        const osc  = actx.createOscillator();
                        const gain = actx.createGain();
                        osc.type   = 'triangle';
                        osc.frequency.setValueAtTime(f, now + i * 0.08);
                        gain.gain.setValueAtTime(vol * 0.15, now + i * 0.08);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.22);
                        osc.connect(gain);
                        gain.connect(actx.destination);
                        osc.start(now + i * 0.08);
                        osc.stop(now + i * 0.08 + 0.24);
                    });
                    break;
                }
                case 'break_start': {
                    // Soothing gentle chord (E5 -> D5 -> B4 -> G4)
                    const freqs = [659.25, 587.33, 493.88, 392.00];
                    freqs.forEach((f, i) => {
                        const osc  = actx.createOscillator();
                        const gain = actx.createGain();
                        osc.type   = 'sine';
                        osc.frequency.setValueAtTime(f, now + i * 0.12);
                        gain.gain.setValueAtTime(vol * 0.15, now + i * 0.12);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);
                        osc.connect(gain);
                        gain.connect(actx.destination);
                        osc.start(now + i * 0.12);
                        osc.stop(now + i * 0.12 + 0.38);
                    });
                    break;
                }
                case 'cycle_complete': {
                    // Triumphant 16-bit fanfare
                    const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
                    freqs.forEach((f, i) => {
                        const osc  = actx.createOscillator();
                        const gain = actx.createGain();
                        osc.type   = 'square';
                        osc.frequency.setValueAtTime(f, now + i * 0.1);
                        gain.gain.setValueAtTime(vol * 0.1, now + i * 0.1);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
                        osc.connect(gain);
                        gain.connect(actx.destination);
                        osc.start(now + i * 0.1);
                        osc.stop(now + i * 0.1 + 0.32);
                    });
                    break;
                }
                case 'task_complete': {
                    // Crisp 2-tone task completion chime (G5 -> C6)
                    const freqs = [783.99, 1046.50];
                    freqs.forEach((f, i) => {
                        const osc  = actx.createOscillator();
                        const gain = actx.createGain();
                        osc.type   = 'triangle';
                        osc.frequency.setValueAtTime(f, now + i * 0.12);
                        gain.gain.setValueAtTime(vol * 0.18, now + i * 0.12);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.28);
                        osc.connect(gain);
                        gain.connect(actx.destination);
                        osc.start(now + i * 0.12);
                        osc.stop(now + i * 0.12 + 0.3);
                    });
                    break;
                }
                case 'click': {
                    // Subtle UI button pop
                    const osc  = actx.createOscillator();
                    const gain = actx.createGain();
                    osc.type   = 'sine';
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
                    gain.gain.setValueAtTime(vol * 0.1, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                    osc.connect(gain);
                    gain.connect(actx.destination);
                    osc.start(now);
                    osc.stop(now + 0.04);
                    break;
                }
                case 'dialog_blip': {
                    // EarthBound typewriter blip
                    const osc  = actx.createOscillator();
                    const gain = actx.createGain();
                    osc.type   = 'square';
                    osc.frequency.setValueAtTime(420, now);
                    gain.gain.setValueAtTime(vol * 0.06, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
                    osc.connect(gain);
                    gain.connect(actx.destination);
                    osc.start(now);
                    osc.stop(now + 0.035);
                    break;
                }
                case 'coffee': {
                    // Gentle bubbling coffee brew sound
                    [320, 480, 400, 560].forEach((f, i) => {
                        const osc  = actx.createOscillator();
                        const gain = actx.createGain();
                        osc.type   = 'sine';
                        osc.frequency.setValueAtTime(f, now + i * 0.06);
                        gain.gain.setValueAtTime(vol * 0.08, now + i * 0.06);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.08);
                        osc.connect(gain);
                        gain.connect(actx.destination);
                        osc.start(now + i * 0.06);
                        osc.stop(now + i * 0.06 + 0.09);
                    });
                    break;
                }
                case 'sit': {
                    // Wooden chair slide / rustle tone
                    const osc  = actx.createOscillator();
                    const gain = actx.createGain();
                    osc.type   = 'triangle';
                    osc.frequency.setValueAtTime(140, now);
                    osc.frequency.linearRampToValueAtTime(90, now + 0.12);
                    gain.gain.setValueAtTime(vol * 0.12, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
                    osc.connect(gain);
                    gain.connect(actx.destination);
                    osc.start(now);
                    osc.stop(now + 0.15);
                    break;
                }
            }
        }
    
        // ------------------------------------------------------------------------
        // Procedural Ambient White Noise (Rain / Cafe Atmosphere)
        // ------------------------------------------------------------------------
        startAmbient(type) {
            this.stopAmbient();
            if (this.isMuted || this.masterVolume <= 0) return;
    
            const actx = this.initContext();
            if (!actx) return;
    
            // Generate 3 seconds of white noise buffer looped seamlessly
            const bufferSize = actx.sampleRate * 3;
            const noiseBuffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
    
            let lastOut = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                if (type === 'rain') {
                    // Pink noise filter approximation for gentle rain
                    lastOut = (lastOut * 0.95) + (white * 0.05);
                    output[i] = lastOut * 3.0;
                } else {
                    // Warm cafe murmur rumble
                    lastOut = (lastOut * 0.98) + (white * 0.02);
                    output[i] = lastOut * 4.0;
                }
            }
    
            const noise = actx.createBufferSource();
            noise.buffer = noiseBuffer;
            noise.loop   = true;
    
            const filter = actx.createBiquadFilter();
            if (type === 'rain') {
                filter.type            = 'lowpass';
                filter.frequency.value = 850;
                filter.Q.value         = 1.2;
            } else {
                filter.type            = 'bandpass';
                filter.frequency.value = 450;
                filter.Q.value         = 0.8;
            }
    
            const gainNode = actx.createGain();
            gainNode.gain.setValueAtTime(this.ambientVolume * this.masterVolume * 0.25, actx.currentTime);
    
            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(actx.destination);
    
            noise.start();
    
            this.ambientSource = noise;
            this.ambientFilter = filter;
            this.ambientGain   = gainNode;
        }
    
        stopAmbient() {
            if (this.ambientSource) {
                try {
                    this.ambientSource.stop();
                    this.ambientSource.disconnect();
                } catch (_) {}
                this.ambientSource = null;
            }
            if (this.ambientFilter) {
                try { this.ambientFilter.disconnect(); } catch (_) {}
                this.ambientFilter = null;
            }
            if (this.ambientGain) {
                try { this.ambientGain.disconnect(); } catch (_) {}
                this.ambientGain = null;
            }
        }
    }
    
    const sound = new SoundEngine();

    // ============================================================================
    // Module: src/engine/sprites.js
    // ============================================================================
    // Procedural EarthBound SNES Pixel Art Engine
    
    const PALETTE = {
        '_': null,          // Transparent
        '0': '#181425',     // Ink outline / dark shadow
        '1': '#ffcd9c',     // Warm peach skin tone
        '2': '#3b82f6',     // Primary clothing (dynamically overridden)
        '3': '#1e3a8a',     // Dark denim navy pants / shorts
        '4': '#dc2626',     // Red sneakers / visor accent
        '5': '#ffffff',     // White (eyes, socks, pages, highlights)
        '6': '#ef4444',     // Baseball cap / main accent (dynamically overridden)
        '7': '#382216',     // Dark hair
        '8': '#f59e0b',     // Amber yellow stripes / backpack / blonde hair
        '9': '#854d0e',     // Warm oak wood
        'A': '#451a03',     // Dark wood shadow
        'B': '#15803d',     // Lush leaf green
        'C': '#4ade80',     // Bright leaf highlight
        'D': '#38bdf8',     // Laptop screen blue glow
        'E': '#94a3b8',     // Metallic silver
        'F': '#f472b6',     // Rosy blush / pink ribbon
        'G': '#fde047',     // Lamp golden glow / tea
        'H': '#ea580c'      // Terracotta planter / warm coffee
    };
    
    const SPRITES = {
        // ------------------------------------------------------------------------
        // 1. EARTHBOUND HERO SPRITES (4-Directional, 16x20)
        // ------------------------------------------------------------------------
        CHAR_DOWN_IDLE: [
            "_____000000_____",
            "____06666660____",
            "___066666660440_",
            "___071111117040_",
            "__0111111111110_",
            "__01F011110F110_",
            "__0111100111110_",
            "___01111111110__",
            "___0552222550___",
            "__022222222220__",
            "__088888888880__",
            "_01022222222010_",
            "_00_08888880_00_",
            "____00000000____",
            "____03333330____",
            "____03300330____",
            "____0110_0110___",
            "____0550_0550___",
            "___04440_04440__",
            "___00000_00000__"
        ],
        CHAR_DOWN_WALK_1: [
            "_____000000_____",
            "____06666660____",
            "___066666660440_",
            "___071111117040_",
            "__0111111111110_",
            "__01F011110F110_",
            "__0111100111110_",
            "___01111111110__",
            "___0552222550___",
            "__022222222220__",
            "__088888888880__",
            "_0102222222200__",
            "_00_08888880_010",
            "____00000000__00",
            "____03333330____",
            "____03330330____",
            "___01110_010____",
            "___05550_050____",
            "__044440_0440___",
            "__000000__000___"
        ],
        CHAR_DOWN_WALK_2: [
            "_____000000_____",
            "____06666660____",
            "___066666660440_",
            "___071111117040_",
            "__0111111111110_",
            "__01F011110F110_",
            "__0111100111110_",
            "___01111111110__",
            "___0552222550___",
            "__022222222220__",
            "__088888888880__",
            "__0022222222010_",
            "010_08888880_00_",
            "00__00000000____",
            "____03333330____",
            "____03303330____",
            "____010_01110___",
            "____050_05550___",
            "___0440_044440__",
            "___000__000000__"
        ],
        CHAR_UP_IDLE: [
            "_____000000_____",
            "____06666660____",
            "___0666666660___",
            "___0777777770___",
            "__077777777770__",
            "__077777777770__",
            "___0777777770___",
            "___0000000000___",
            "___0222222220___",
            "__020888888020__",
            "__020888888020__",
            "_01008888880010_",
            "_00_08888880_00_",
            "____00000000____",
            "____03333330____",
            "____03300330____",
            "____0110_0110___",
            "____0550_0550___",
            "___04440_04440__",
            "___00000_00000__"
        ],
        CHAR_UP_WALK_1: [
            "_____000000_____",
            "____06666660____",
            "___0666666660___",
            "___0777777770___",
            "__077777777770__",
            "__077777777770__",
            "___0777777770___",
            "___0000000000___",
            "___0222222220___",
            "__020888888020__",
            "__020888888020__",
            "_0100888888000__",
            "_00_08888880_010",
            "____00000000__00",
            "____03333330____",
            "____03330330____",
            "___01110_010____",
            "___05550_050____",
            "__044440_0440___",
            "__000000__000___"
        ],
        CHAR_UP_WALK_2: [
            "_____000000_____",
            "____06666660____",
            "___0666666660___",
            "___0777777770___",
            "__077777777770__",
            "__077777777770__",
            "___0777777770___",
            "___0000000000___",
            "___0222222220___",
            "__020888888020__",
            "__020888888020__",
            "__0008888880010_",
            "010_08888880_00_",
            "00__00000000____",
            "____03333330____",
            "____03303330____",
            "____010_01110___",
            "____050_05550___",
            "___0440_044440__",
            "___000__000000__"
        ],
        CHAR_SIDE_IDLE: [
            "_____000000_____",
            "____06666660____",
            "__04406666660___",
            "_044401111170___",
            "__000111111110__",
            "___01111F01110__",
            "___01111101110__",
            "____011110000___",
            "____022220880___",
            "___0222220880___",
            "___0888880880___",
            "___0222220880___",
            "___0100000000___",
            "___000333330____",
            "____03333330____",
            "____03300330____",
            "____0110_0110___",
            "____0550_0550___",
            "___04440_04440__",
            "___00000_00000__"
        ],
        CHAR_SIDE_WALK_1: [
            "_____000000_____",
            "____06666660____",
            "__04406666660___",
            "_044401111170___",
            "__000111111110__",
            "___01111F01110__",
            "___01111101110__",
            "____011110000___",
            "____022220880___",
            "___0222220880___",
            "___0888880880___",
            "___0222220880___",
            "___0100000000___",
            "___000333330____",
            "____03333330____",
            "___03330_0330___",
            "__01110___010___",
            "__05550___050___",
            "_044440___0440__",
            "_000000___0000__"
        ],
        CHAR_SIDE_WALK_2: [
            "_____000000_____",
            "____06666660____",
            "__04406666660___",
            "_044401111170___",
            "__000111111110__",
            "___01111F01110__",
            "___01111101110__",
            "____011110000___",
            "____022220880___",
            "___0222220880___",
            "___0888880880___",
            "___0222220880___",
            "___0100000000___",
            "___000333330____",
            "____03333330____",
            "____0330_03330__",
            "____010___01110_",
            "____050___05550_",
            "___0440___044440",
            "___0000___000000"
        ],
    
        // ------------------------------------------------------------------------
        // 2. STUDYING CHARACTER SPRITE (Sitting at Desk with Study Materials)
        // ------------------------------------------------------------------------
        CHAR_SIT: [
            "_____000000_____",
            "____06666660____",
            "___066666660440_",
            "___071111117040_",
            "__0111111111110_",
            "__01F011110F110_",
            "__0111100111110_",
            "___01111111110__",
            "___0552222550___",
            "__022222222220__",
            "__088888888880__",
            "_01102222220110_",
            "_00008888880000_",
            "____00000000____",
            "___0333333330___",
            "___0333333330___",
            "___0110000110___",
            "___0550__0550___",
            "___0440__0440___",
            "___0000__0000___"
        ],
    
        // ------------------------------------------------------------------------
        // 3. EARTHBOUND NPC VARIANTS
        // ------------------------------------------------------------------------
        // Scholar / Techie (Jeff-like with glasses, blonde hair, green sweater)
        NPC_SCHOLAR: [
            "_____000000_____",
            "____08888880____",
            "___0888888880___",
            "___0881111880___",
            "__011111111110__",
            "__010501105010__", // Glasses!
            "__011110011110__",
            "___0111111110___",
            "___055BBBB550___", // Green sweater
            "__0BBBBBBBBBB0__",
            "__0BBBBBBBBBB0__",
            "_010BBBBBBBB010_",
            "_00_0BBBBBB0_00_",
            "____00000000____",
            "____08888880____", // Khaki trousers
            "____08800880____",
            "____0110_0110___",
            "____0550_0550___",
            "___07770_07770__", // Brown shoes
            "___00000_00000__"
        ],
    
        // Bookworm / Girl (Paula-style with pink ribbon & dress)
        NPC_GIRL: [
            "____000____000__",
            "___0FFF0__0FFF0_", // Pink hair ribbon!
            "____0FF0000FF0__",
            "___0888888880___", // Blonde hair
            "__088111111880__",
            "__01F011110F10__", // Rosy cheeks
            "__011110011110__",
            "___0111111110___",
            "___055FFFF550___", // Pink dress
            "__0FFFFFFFFFF0__",
            "__0FFFFFFFFFF0__",
            "_010FFFFFFFF010_",
            "_00_0FFFFFF0_00_",
            "____0FFFFFF0____",
            "___0FFFFFFFF0___",
            "___0FFFFFFFF0___",
            "____0110_0110___",
            "____0550_0550___",
            "___04440_04440__",
            "___00000_00000__"
        ],
    
        // ------------------------------------------------------------------------
        // 4. EARTHBOUND SCENARIO FURNITURE & PROPS (16x16)
        // ------------------------------------------------------------------------
        // Wooden Study Desk with beveled edge and woodgrain
        DESK_WOOD: [
            "0000000000000000",
            "0999999999999990",
            "0988888888888890",
            "0989999999999890",
            "0999999999999990",
            "0999999999999990",
            "0999999999999990",
            "0AAAAAAAAAAAAAA0",
            "0000000000000000",
            "0AA0________0AA0",
            "0990________0990",
            "0990________0990",
            "0990________0990",
            "0990________0990",
            "0AA0________0AA0",
            "0000________0000"
        ],
    
        // Desk with Glowing Laptop and Coffee Mug
        DESK_LAPTOP: [
            "0000000000000000",
            "0999999999999990",
            "0990000009990090", // Laptop open + Coffee mug
            "0900DDDD0090HH00", // Screen blue glow + orange mug
            "0900DDDD0090HH00",
            "090EEEEEE0900000", // Keyboard
            "0999999999999990",
            "0AAAAAAAAAAAAAA0",
            "0000000000000000",
            "0AA0________0AA0",
            "0990________0990",
            "0990________0990",
            "0990________0990",
            "0990________0990",
            "0AA0________0AA0",
            "0000________0000"
        ],
    
        // Desk with Open Textbook and Golden Study Lamp
        DESK_BOOK: [
            "0000000000000000",
            "0999999999999990",
            "090GG09900000090", // Golden lamp head + Open book
            "090EE09055005500", // White pages
            "0990E09050005000", // Book text lines
            "090EE09055005500",
            "0999999999999990",
            "0AAAAAAAAAAAAAA0",
            "0000000000000000",
            "0AA0________0AA0",
            "0990________0990",
            "0990________0990",
            "0990________0990",
            "0990________0990",
            "0AA0________0AA0",
            "0000________0000"
        ],
    
        // Cozy Wooden Chair (top-down view)
        CHAIR: [
            "____00000000____",
            "___0999999990___",
            "___0988888890___",
            "___0999999990___",
            "___0AAAAAAAA0___",
            "___0000000000___",
            "__033333333330__", // Padded fabric cushion
            "__032222222230__",
            "__032222222230__",
            "__033333333330__",
            "__000000000000__",
            "__0A0______0A0__",
            "__090______090__",
            "__090______090__",
            "__0A0______0A0__",
            "__000______000__"
        ],
    
        // Potted Ficus Plant in Terracotta Pot
        PLANT: [
            "______0000______",
            "____00CBBBB00___",
            "___0CBBCCCBBB0__",
            "__0BBCCCCCCCCB0_",
            "__0BBBCCCCCCBB0_",
            "_0CBBBBBBBBBBBC0",
            "_0BBCCCCBBBBBBB0",
            "__0BBBBBBBBBBB0_",
            "___0000770000___", // Trunk
            "_____007700_____",
            "____00HHHH00____", // Terracotta Pot Rim
            "___0HHHHHHHH0___",
            "___0HHHHHHHH0___",
            "____0HHHHHH0____",
            "____0HHHHHH0____",
            "_____000000_____"
        ],
    
        // Tall Library Bookshelf with colorful book rows
        BOOKSHELF: [
            "0000000000000000",
            "0999999999999990",
            "0924685246852490", // Shelf 1 colorful books
            "0924685246852490",
            "09AAAAAAAAAAAA90",
            "0999999999999990",
            "0948526485264890", // Shelf 2 books
            "0948526485264890",
            "09AAAAAAAAAAAA90",
            "0999999999999990",
            "0985246852468590", // Shelf 3 books
            "0985246852468590",
            "09AAAAAAAAAAAA90",
            "0999999999999990",
            "0AAAAAAAAAAAAAA0",
            "0000000000000000"
        ],
    
        // Cafe Counter & Espresso Machine
        COUNTER: [
            "0000000000000000",
            "0999999999999990",
            "0900EE0990HH0990", // Chrome espresso machine + Coffee cup
            "00EDDE0990HH0990",
            "00EEEE0990000990",
            "0999999999999990",
            "0AAAAAAAAAAAAAA0",
            "0000000000000000",
            "0999999999999990",
            "0988888888888890",
            "0999999999999990",
            "0999999999999990",
            "0999999999999990",
            "0999999999999990",
            "0AAAAAAAAAAAAAA0",
            "0000000000000000"
        ],
    
        // Japanese Zen Stone Lantern (Toro)
        ZEN_LANTERN: [
            "______0000______",
            "_____0EEEE0_____",
            "___00EEEEEE00___", // Roof
            "__000000000000__",
            "____0GGGGGG0____", // Glowing paper light
            "____0G0GG0G0____",
            "____0GGGGGG0____",
            "____00000000____",
            "_____0EEEE0_____", // Stone pillar
            "_____0EEEE0_____",
            "_____0EEEE0_____",
            "____00EEEE00____",
            "___0EEEEEEEE0___", // Base
            "__00EEEEEEEE00__",
            "__000000000000__",
            "________________"
        ],
    
        // Zen Garden Stepping Stone
        ZEN_STONE: [
            "________________",
            "_____000000_____",
            "___00EEEEEE00___",
            "__0EEEEEEEEEE0__",
            "_0EEEEEEEEEEEE0_",
            "_0EEEEEEEEEEEE0_",
            "_0EEEE000EEEEE0_",
            "__0EEEEEEEEEE0__",
            "___00EEEEEE00___",
            "_____000000_____",
            "________________",
            "________________",
            "________________",
            "________________",
            "________________",
            "________________"
        ]
    };
    
    // Render a specific sprite data array to the canvas with optional horizontal flip
    function drawPixelSprite(ctx, spriteData, x, y, width, height, mainColor = null, accentColor = null, flipX = false) {
        if (!spriteData || !spriteData.length) return;
        const rows = spriteData.length;
        const cols = spriteData[0].length;
        const pixelWidth  = width / cols;
        const pixelHeight = height / rows;
    
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // Support horizontal flipping cleanly without canvas matrix transformations
                const colIdx = flipX ? (cols - 1 - c) : c;
                const val    = spriteData[r][colIdx];
                if (val === '_') continue;
    
                let color = PALETTE[val];
                if (!color) continue;
    
                // Dynamic color overrides
                if (val === '2' && mainColor)   color = mainColor;
                if (val === '6' && accentColor) color = accentColor;
    
                ctx.fillStyle = color;
                // Overlap slightly to prevent sub-pixel rendering gaps
                ctx.fillRect(
                    Math.floor(x + c * pixelWidth),
                    Math.floor(y + r * pixelHeight),
                    Math.ceil(pixelWidth + 0.4),
                    Math.ceil(pixelHeight + 0.4)
                );
            }
        }
    }

    // ============================================================================
    // Module: src/engine/dialog.js
    // ============================================================================
    // EarthBound Retro Dialogue Box System
    // Typewriter animated text with sound blips and multilingual word wrapping
    
    
    class DialogSystem {
        constructor() {
            this.isOpen       = false;
            this.speaker      = '';
            this.fullText     = '';
            this.displayedLen = 0;
            this.charTimer    = 0;
            this.charSpeed    = 0.025; // Seconds per character
            this.isTyping     = false;
            this.onCloseCb    = null;
        }
    
        show(speaker, text, onClose = null) {
            this.speaker      = speaker || '';
            this.fullText     = text || '';
            this.displayedLen = 0;
            this.charTimer    = 0;
            this.isTyping     = true;
            this.isOpen       = true;
            this.onCloseCb    = onClose;
            sound.play('click');
        }
    
        advance() {
            if (!this.isOpen) return;
    
            if (this.isTyping) {
                // Instantly reveal all text
                this.displayedLen = this.fullText.length;
                this.isTyping     = false;
            } else {
                // Close dialogue
                this.close();
            }
        }
    
        close() {
            this.isOpen   = false;
            this.isTyping = false;
            if (this.onCloseCb) {
                const cb = this.onCloseCb;
                this.onCloseCb = null;
                cb();
            }
            sound.play('click');
        }
    
        update(deltaTime) {
            if (!this.isOpen || !this.isTyping) return;
    
            this.charTimer += deltaTime;
            while (this.charTimer >= this.charSpeed && this.displayedLen < this.fullText.length) {
                this.charTimer -= this.charSpeed;
                this.displayedLen++;
    
                // Play retro sound blip every 2 characters for non-space
                if (this.displayedLen % 2 === 0 && this.fullText[this.displayedLen - 1] !== ' ') {
                    sound.play('dialog_blip');
                }
            }
    
            if (this.displayedLen >= this.fullText.length) {
                this.isTyping = false;
            }
        }
    
        draw(ctx, canvasWidth, canvasHeight) {
            if (!this.isOpen) return;
    
            const boxW = Math.min(640, canvasWidth - 40);
            const boxH = 110;
            const boxX = (canvasWidth - boxW) * 0.5;
            const boxY = canvasHeight - boxH - 24;
    
            // SNES Double-Border Frame
            ctx.fillStyle   = 'rgba(24, 20, 37, 0.96)';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth   = 3;
            ctx.fillRect(boxX, boxY, boxW, boxH);
            ctx.strokeRect(boxX, boxY, boxW, boxH);
    
            // Inner accent border
            ctx.strokeStyle = '#60a5fa';
            ctx.lineWidth   = 1.5;
            ctx.strokeRect(boxX + 4, boxY + 4, boxW - 8, boxH - 8);
    
            // Speaker Header Badge
            if (this.speaker) {
                ctx.fillStyle = '#facc15';
                ctx.font      = 'bold 12px Courier New, "MS Gothic", "Noto Sans JP", monospace, sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText(`[ ${this.speaker} ]`, boxX + 16, boxY + 24);
            }
    
            // Dialogue Body Text with Universal Multilingual Wrapping
            const currentText = this.fullText.substring(0, this.displayedLen);
            ctx.fillStyle     = '#f8fafc';
            ctx.font          = '14px Courier New, "MS Gothic", "Noto Sans JP", monospace, sans-serif';
            ctx.textAlign     = 'left';
    
            const startY       = this.speaker ? boxY + 46 : boxY + 34;
            const maxLineWidth = boxW - 36;
            let line           = '';
            let lineY          = startY;
    
            // Universal character/word wrap
            const isCjk = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uffef\u4e00-\u9faf]/.test(this.fullText);
    
            if (isCjk) {
                for (let i = 0; i < currentText.length; i++) {
                    const char = currentText[i];
                    const test = line + char;
                    if (ctx.measureText(test).width > maxLineWidth) {
                        ctx.fillText(line, boxX + 16, lineY);
                        line   = char;
                        lineY += 22;
                    } else {
                        line = test;
                    }
                }
                if (line) ctx.fillText(line, boxX + 16, lineY);
            } else {
                const words = currentText.split(' ');
                for (let i = 0; i < words.length; i++) {
                    const testLine  = line + words[i] + ' ';
                    const testWidth = ctx.measureText(testLine).width;
                    if (testWidth > maxLineWidth && i > 0) {
                        ctx.fillText(line, boxX + 16, lineY);
                        line   = words[i] + ' ';
                        lineY += 20;
                    } else {
                        line = testLine;
                    }
                }
                if (line) ctx.fillText(line, boxX + 16, lineY);
            }
    
            // Animated retro continuation prompt arrow
            if (!this.isTyping) {
                const arrowBounce = Math.sin(performance.now() * 0.008) * 3;
                ctx.fillStyle     = '#f43f5e';
                ctx.font          = 'bold 13px Courier New, "MS Gothic", "Noto Sans JP", monospace, sans-serif';
                ctx.textAlign     = 'right';
                ctx.fillText('▼ [E / Space]', boxX + boxW - 16, boxY + boxH - 12 + arrowBounce);
            }
        }
    }
    
    const dialogSystem = new DialogSystem();

    // ============================================================================
    // Module: src/engine/i18n.js
    // ============================================================================
    // Internationalization (i18n) Module
    // Supports English (Default), Spanish (Español), and Japanese (日本語)
    
    const TRANSLATIONS = {
        en: {
            // UI Menus & Forms
            appTitle:          'Pomodoro World',
            appSubtitle:       'Virtual Shared Study Space',
            playGame:          'Play Game',
            userCustomization: 'User Customization',
            soloSettings:      'Solo Settings',
            aboutProject:      'About the project',
            selectMode:        'Select Mode',
            soloStudySpace:    'Solo Study Space',
            multiplayerSoon:   'Multiplayer (Coming Soon)',
            back:              'Back',
            startGame:         'Start Game',
            applyResume:       'Apply & Resume',
            saveAvatar:        'Save Avatar',
            gamePaused:        'Game Paused',
            resume:            'Resume',
            settings:          'Settings',
            exitMainMenu:      'Exit to Main Menu',
    
            // Settings Labels
            focusDuration:     'Focus Duration (min):',
            breakDuration:     'Break Duration (min):',
            sessionCycles:     'Session Cycles:',
            selectMap:         'Select Map:',
            npcStudyBuddies:   'NPC Study Buddies:',
            ambientSound:      'Ambient Sound:',
            masterVolume:      'Master Volume:',
            language:          'Language / Idioma / 言語:',
    
            // Maps
            mapCafeteria:      'Virtual Cafeteria',
            mapLibrary:        'Quiet Library',
            mapGarden:         'Zen Garden',
    
            // Ambient Sound Options
            ambientOff:        'Off (Quiet)',
            ambientRain:       'Gentle Rain 🌧️',
            ambientCafe:       'Cafe Ambiance ☕',
    
            // Customization
            playerNameTag:     'Player Name Tag:',
            avatarColor:       'Avatar Shirt Color:',
            colorNess:         'Ness Blue',
            colorPaula:        'Paula Pink',
            colorJeff:         'Jeff Green',
            colorPoo:          'Martial Red',
            colorPurple:       'Vivid Purple',
            colorGold:         'Amber Gold',
    
            // Productivity Stats
            statTodayMin:      "Today's Min",
            statCompleted:     'Completed',
            statStreak:        'Day Streak 🔥',
    
            // Tasks
            focusTasks:        '📋 Focus Tasks',
            taskPlaceholder:   'What are you focusing on?',
            addTask:           '+ Add',
            taskTip:           'Click task to pin as active focus • ✓ to complete',
            defaultTask:       'Deep work session',
            currentFocus:      'CURRENT FOCUS',
            tasksButton:       '📋 Tasks (T)',
    
            // HUD Controls
            hudPause:          '⏸ Pause',
            hudResume:         '▶ Resume',
            hudSkip:           '⏭ Skip',
            hudAudio:          '🔊 Audio',
            hudMuted:          '🔇 Muted',
    
            // Controls Legend Bar
            legendMove:        '[WASD / Arrows] Move',
            legendInteract:    '[E] Sit / Interact',
            legendPause:       '[Space] Pause',
            legendTasks:       '[T] Tasks',
            legendMute:        '[M] Mute',
            legendMenu:        '[ESC] Menu',
    
            // Canvas HUD & Status
            hudFocusSession:   '● FOCUS SESSION',
            hudShortBreak:     '☕ SHORT BREAK',
            hudLongBreak:      '🎉 LONG BREAK',
            hudPaused:         '⏸ PAUSED',
            hudCycle:          'CYCLE',
    
            // Signs & Counter Headers
            signCafeteria:     '☕ Onett Espresso Bar',
            signLibrary:       '📚 Twoson Library Archives',
            signGarden:        '🌸 Dalaam Tea Pavilion',
            studyBuddyPrefix:  'Study Buddy',
    
            // Interaction Floating Prompts
            promptSit:         '[E] Sit & Study',
            promptStand:       '[E] Stand Up',
            promptCoffee:      '[E] Brew Fresh Coffee ☕',
            promptBooks:       '[E] Read Study Wisdom 📚',
            promptZen:         '[E] Mindful Meditation 🌸',
            promptTalk:        '[E] Talk to',
    
            // Dialogue System
            dialogStudyTitle:  'Study Desk',
            dialogStudyBody:   'You sat down at the desk. Study materials ready. Deep work mode active!',
            dialogCoffeeTitle: 'Espresso Bar',
            dialogCoffeeBody:  'You poured a hot cup of fresh espresso! Motivation and alertness refreshed.',
            dialogZenTitle:    'Zen Stone Lantern',
            dialogZenBody:     'You pause for a mindful breath amidst the tranquil garden. Serenity restored.',
            dialogCycleTitle:  'Cycle Finished!',
            dialogCycleBody:   '🎉 Outstanding work! You completed all scheduled cycles. Enjoy your well-earned Long Break!',
    
            quotes: [
                '"The secret of getting ahead is getting started." — Mark Twain',
                '"Focus is a muscle. The more you practice without distraction, the stronger it gets."',
                '"Do what you can, with what you have, where you are." — Theodore Roosevelt',
                '"Small disciplines repeated with consistency every day lead to great achievements."',
                '"You don’t have to see the whole staircase, just take the first step."'
            ],
    
            npcDialogues: [
                '"Hey! Let\'s stay locked in and finish this study cycle together!"',
                '"Remember to stay hydrated! That timer will be done before you know it."',
                '"I just checked off my third task. Steady progress wins the day!"',
                '"Deep focus is a superpower. Keep going, you\'re doing great!"',
                '"Taking short breaks keeps your brain fresh. Good luck with this session!"'
            ]
        },
    
        es: {
            // UI Menus & Forms
            appTitle:          'Pomodoro World',
            appSubtitle:       'Espacio Virtual de Estudio Compartido',
            playGame:          'Jugar',
            userCustomization: 'Personalizar Avatar',
            soloSettings:      'Ajustes Solitario',
            aboutProject:      'Sobre el proyecto',
            selectMode:        'Seleccionar Modo',
            soloStudySpace:    'Espacio de Estudio Solitario',
            multiplayerSoon:   'Multijugador (Próximamente)',
            back:              'Volver',
            startGame:         'Empezar Juego',
            applyResume:       'Aplicar y Reanudar',
            saveAvatar:        'Guardar Avatar',
            gamePaused:        'Juego Pausado',
            resume:            'Reanudar',
            settings:          'Ajustes',
            exitMainMenu:      'Salir al Menú Principal',
    
            // Settings Labels
            focusDuration:     'Duración de Enfoque (min):',
            breakDuration:     'Duración de Descanso (min):',
            sessionCycles:     'Ciclos de Sesión:',
            selectMap:         'Seleccionar Mapa:',
            npcStudyBuddies:   'Compañeros NPC:',
            ambientSound:      'Sonido Ambiental:',
            masterVolume:      'Volumen Principal:',
            language:          'Idioma / Language / 言語:',
    
            // Maps
            mapCafeteria:      'Cafetería Virtual',
            mapLibrary:        'Biblioteca Silenciosa',
            mapGarden:         'Jardín Zen',
    
            // Ambient Sound Options
            ambientOff:        'Apagado (Silencio)',
            ambientRain:       'Lluvia Suave 🌧️',
            ambientCafe:       'Ambiente de Café ☕',
    
            // Customization
            playerNameTag:     'Nombre del Jugador:',
            avatarColor:       'Color de Camiseta:',
            colorNess:         'Azul Ness',
            colorPaula:        'Rosa Paula',
            colorJeff:         'Verde Jeff',
            colorPoo:          'Rojo Marcial',
            colorPurple:       'Púrpura Vívido',
            colorGold:         'Oro Ámbar',
    
            // Productivity Stats
            statTodayMin:      'Minutos Hoy',
            statCompleted:     'Completadas',
            statStreak:        'Racha Días 🔥',
    
            // Tasks
            focusTasks:        '📋 Tareas de Enfoque',
            taskPlaceholder:   '¿En qué te vas a enfocar?',
            addTask:           '+ Añadir',
            taskTip:           'Haz clic en una tarea para fijarla • ✓ para completar',
            defaultTask:       'Sesión de trabajo profundo',
            currentFocus:      'ENFOQUE ACTUAL',
            tasksButton:       '📋 Tareas (T)',
    
            // HUD Controls
            hudPause:          '⏸ Pausar',
            hudResume:         '▶ Reanudar',
            hudSkip:           '⏭ Saltar',
            hudAudio:          '🔊 Audio',
            hudMuted:          '🔇 Silencio',
    
            // Controls Legend Bar
            legendMove:        '[WASD / Flechas] Mover',
            legendInteract:    '[E] Sentarse / Interactuar',
            legendPause:       '[Espacio] Pausa',
            legendTasks:       '[T] Tareas',
            legendMute:        '[M] Silenciar',
            legendMenu:        '[ESC] Menú',
    
            // Canvas HUD & Status
            hudFocusSession:   '● SESIÓN DE ENFOQUE',
            hudShortBreak:     '☕ DESCANSO CORTO',
            hudLongBreak:      '🎉 DESCANSO LARGO',
            hudPaused:         '⏸ PAUSADO',
            hudCycle:          'CICLO',
    
            // Signs & Counter Headers
            signCafeteria:     '☕ Bar Espresso de Onett',
            signLibrary:       '📚 Archivos de la Biblioteca de Twoson',
            signGarden:        '🌸 Pabellón de Té de Dalaam',
            studyBuddyPrefix:  'Compañero',
    
            // Interaction Floating Prompts
            promptSit:         '[E] Sentarse y Estudiar',
            promptStand:       '[E] Levantarse',
            promptCoffee:      '[E] Servir Café Fresco ☕',
            promptBooks:       '[E] Leer Sabiduría 📚',
            promptZen:         '[E] Meditación Consciente 🌸',
            promptTalk:        '[E] Hablar con',
    
            // Dialogue System
            dialogStudyTitle:  'Escritorio de Estudio',
            dialogStudyBody:   'Te sentaste en el escritorio. Materiales listos. ¡Modo de concentración activo!',
            dialogCoffeeTitle: 'Bar de Espresso',
            dialogCoffeeBody:  '¡Serviste una taza caliente de café recién hecho! Motivación y energía recargadas.',
            dialogZenTitle:    'Linterna de Piedra Zen',
            dialogZenBody:     'Haces una pausa para respirar hondo en el tranquilo jardín. Serenidad restaurada.',
            dialogCycleTitle:  '¡Ciclo Completado!',
            dialogCycleBody:   '🎉 ¡Excelente trabajo! Completaste todos los ciclos programados. ¡Disfruta tu merecido descanso largo!',
    
            quotes: [
                '"El secreto de salir adelante es comenzar." — Mark Twain',
                '"El enfoque es un músculo. Cuanto más practiques sin distracciones, más fuerte se vuelve."',
                '"Haz lo que puedas, con lo que tengas, donde estés." — Theodore Roosevelt',
                '"Pequeñas disciplinas repetidas con constancia cada día llevan a grandes logros."',
                '"No tienes que ver toda la escalera, solo da el primer paso."'
            ],
    
            npcDialogues: [
                '"¡Hola! ¡Mantengamos la concentración y terminemos este ciclo juntos!"',
                '"¡Recuerda beber agua! El temporizador terminará antes de que te des cuenta."',
                '"¡Acabo de marcar mi tercera tarea! El progreso constante siempre gana."',
                '"El enfoque profundo es un superpoder. ¡Sigue así, lo estás haciendo genial!"',
                '"Tomar descansos cortos mantiene tu cerebro fresco. ¡Mucho éxito con esta sesión!"'
            ]
        },
    
        ja: {
            // UI Menus & Forms
            appTitle:          'Pomodoro World',
            appSubtitle:       'バーチャル共有学習スペース',
            playGame:          'ゲームを始める',
            userCustomization: 'アバターカスタマイズ',
            soloSettings:      'ソロ設定',
            aboutProject:      'プロジェクトについて',
            selectMode:        'モード選択',
            soloStudySpace:    'ソロ学習スペース',
            multiplayerSoon:   'マルチプレイ（近日公開）',
            back:              'もどる',
            startGame:         'スタート',
            applyResume:       '適用して再開',
            saveAvatar:        'アバターを保存',
            gamePaused:        '一時停止中',
            resume:            '再開する',
            settings:          '設定',
            exitMainMenu:      'メインメニューへ',
    
            // Settings Labels
            focusDuration:     '集中時間（分）:',
            breakDuration:     '休憩時間（分）:',
            sessionCycles:     'セッションサイクル:',
            selectMap:         'マップ選択:',
            npcStudyBuddies:   '勉強仲間（NPC数）:',
            ambientSound:      '環境音:',
            masterVolume:      'マスター音量:',
            language:          '言語 / Language / Idioma:',
    
            // Maps
            mapCafeteria:      'バーチャル カフェ',
            mapLibrary:        '静かな図書館',
            mapGarden:         '禅ガーデン',
    
            // Ambient Sound Options
            ambientOff:        'オフ（静寂）',
            ambientRain:       'やさしい雨音 🌧️',
            ambientCafe:       'カフェのざわめき ☕',
    
            // Customization
            playerNameTag:     'プレイヤー名:',
            avatarColor:       'シャツの色:',
            colorNess:         'ネス・ブルー',
            colorPaula:        'ポーラ・ピンク',
            colorJeff:         'ジェフ・グリーン',
            colorPoo:          'プー・レッド',
            colorPurple:       'ビビッド・パープル',
            colorGold:         'アンバー・ゴールド',
    
            // Productivity Stats
            statTodayMin:      '今日の集中（分）',
            statCompleted:     '完了セッション',
            statStreak:        '継続日数 🔥',
    
            // Tasks
            focusTasks:        '📋 集中タスク',
            taskPlaceholder:   '何に集中しますか？',
            addTask:           '+ 追加',
            taskTip:           'タスクをクリックしてHUDに固定 • ✓で完了',
            defaultTask:       'ディープワークセッション',
            currentFocus:      '現在の集中タスク',
            tasksButton:       '📋 タスク (T)',
    
            // HUD Controls
            hudPause:          '⏸ 一時停止',
            hudResume:         '▶ 再開',
            hudSkip:           '⏭ スキップ',
            hudAudio:          '🔊 音声',
            hudMuted:          '🔇 ミュート',
    
            // Controls Legend Bar
            legendMove:        '[WASD / 矢印] 移動',
            legendInteract:    '[E] 座る / 調べる',
            legendPause:       '[スペース] 一時停止',
            legendTasks:       '[T] タスク',
            legendMute:        '[M] 消音',
            legendMenu:        '[ESC] メニュー',
    
            // Canvas HUD & Status
            hudFocusSession:   '● 集中セッション',
            hudShortBreak:     '☕ 小休憩',
            hudLongBreak:      '🎉 長い休憩',
            hudPaused:         '⏸ 一時停止',
            hudCycle:          'サイクル',
    
            // Signs & Counter Headers
            signCafeteria:     '☕ オネット エスプレッソ バー',
            signLibrary:       '📚 ツーソン図書館 アーカイブ',
            signGarden:        '🌸 ダラム ティー パビリオン',
            studyBuddyPrefix:  '勉強仲間',
    
            // Interaction Floating Prompts
            promptSit:         '[E] 席について勉強する',
            promptStand:       '[E] 立ち上がる',
            promptCoffee:      '[E] エスプレッソを淹れる ☕',
            promptBooks:       '[E] 本の言葉を読む 📚',
            promptZen:         '[E] 瞑想する 🌸',
            promptTalk:        '[E] 話しかける:',
    
            // Dialogue System
            dialogStudyTitle:  '学習デスク',
            dialogStudyBody:   '席に着きました。勉強道具の準備完了。集中モード開始！',
            dialogCoffeeTitle: 'エスプレッソバー',
            dialogCoffeeBody:  '淹れたての温かいコーヒーを注ぎました！やる気と集中力が満ちてきました。',
            dialogZenTitle:    '禅の石灯籠',
            dialogZenBody:     '静寂の庭園の中で深呼吸をしました。心がすっきりと落ち着きました。',
            dialogCycleTitle:  'サイクル達成！',
            dialogCycleBody:   '🎉 素晴らしい集中力です！すべてのサイクルを達成しました。長めの休憩をゆっくり楽しんでください！',
    
            quotes: [
                '「前へ進む秘訣は、まず始めることだ。」— マーク・トウェイン',
                '「集中力は筋肉のようなもの。雑音を遮断して鍛えるほど、強くなる。」',
                '「今あるもので、今いる場所で、できることをやろう。」— セオドア・ルーズベルト',
                '「毎日の小さな積み重ねこそが、大きな成果を生み出す。」',
                '「階段の全体を見る必要はない。ただ最初の1段を踏み出せばいい。」'
            ],
    
            npcDialogues: [
                '「やあ！集中して、このセッションを一緒に乗り切ろう！」',
                '「水分補給も忘れずにね！気づけばタイマーが終わってるよ。」',
                '「3つ目のタスクを完了したよ！一歩一歩が大切だね。」',
                '「ディープフォーカスは最強のスキルだよ。その調子！」',
                '「小休憩をしっかり挟むと頭が冴えるよ。頑張ろう！」'
            ]
        }
    };
    
    class I18nManager {
        constructor() {
            this.currentLang = 'en';
            this.load();
        }
    
        load() {
            try {
                const saved = localStorage.getItem('pomodoroLanguage');
                if (saved && ['en', 'es', 'ja'].includes(saved)) {
                    this.currentLang = saved;
                } else {
                    const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
                    if (browserLang.startsWith('es')) {
                        this.currentLang = 'es';
                    } else if (browserLang.startsWith('ja')) {
                        this.currentLang = 'ja';
                    } else {
                        this.currentLang = 'en';
                    }
                }
            } catch (_) {
                this.currentLang = 'en';
            }
        }
    
        save() {
            try {
                localStorage.setItem('pomodoroLanguage', this.currentLang);
            } catch (_) {}
        }
    
        setLanguage(lang) {
            if (!['en', 'es', 'ja'].includes(lang)) return;
            this.currentLang = lang;
            this.save();
        }
    
        getLanguage() {
            return this.currentLang;
        }
    
        t(key) {
            const langPack = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;
            if (langPack[key] !== undefined) {
                return langPack[key];
            }
            return TRANSLATIONS.en[key] !== undefined ? TRANSLATIONS.en[key] : key;
        }
    
        getRandomQuote() {
            const quotes = this.t('quotes') || TRANSLATIONS.en.quotes;
            return quotes[Math.floor(Math.random() * quotes.length)];
        }
    
        getRandomNpcDialogue() {
            const dialogues = this.t('npcDialogues') || TRANSLATIONS.en.npcDialogues;
            return dialogues[Math.floor(Math.random() * dialogues.length)];
        }
    }
    
    const i18n = new I18nManager();

    // ============================================================================
    // Module: src/engine/stats.js
    // ============================================================================
    // Productivity Analytics & Streak Tracker
    // Tracks completed focus sessions, focus minutes, and daily streaks
    
    class StatsTracker {
        constructor() {
            this.totalFocusMinutes = 0;
            this.completedSessions = 0;
            this.currentStreak     = 0;
            this.lastActiveDate    = '';
            this.todayFocusMinutes = 0;
    
            this.load();
        }
    
        getTodayString() {
            const d = new Date();
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
    
        load() {
            try {
                const saved = localStorage.getItem('pomodoroStats');
                if (saved) {
                    const s = JSON.parse(saved);
                    if (typeof s.totalFocusMinutes === 'number') this.totalFocusMinutes = s.totalFocusMinutes;
                    if (typeof s.completedSessions === 'number') this.completedSessions = s.completedSessions;
                    if (typeof s.currentStreak === 'number')     this.currentStreak     = s.currentStreak;
                    if (typeof s.lastActiveDate === 'string')    this.lastActiveDate    = s.lastActiveDate;
                    if (typeof s.todayFocusMinutes === 'number') this.todayFocusMinutes = s.todayFocusMinutes;
    
                    // Reset today's minutes if it's a new day
                    const today = this.getTodayString();
                    if (this.lastActiveDate && this.lastActiveDate !== today) {
                        this.todayFocusMinutes = 0;
                    }
                }
            } catch (_) {}
        }
    
        save() {
            try {
                localStorage.setItem('pomodoroStats', JSON.stringify({
                    totalFocusMinutes: this.totalFocusMinutes,
                    completedSessions: this.completedSessions,
                    currentStreak:     this.currentStreak,
                    lastActiveDate:    this.lastActiveDate,
                    todayFocusMinutes: this.todayFocusMinutes
                }));
            } catch (_) {}
        }
    
        recordCompletedSession(focusMinutes) {
            this.completedSessions++;
            this.totalFocusMinutes += focusMinutes;
            this.todayFocusMinutes += focusMinutes;
    
            const today     = this.getTodayString();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yestStr   = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
            if (!this.lastActiveDate) {
                this.currentStreak = 1;
            } else if (this.lastActiveDate === yestStr) {
                this.currentStreak++;
            } else if (this.lastActiveDate !== today) {
                this.currentStreak = 1;
            }
    
            this.lastActiveDate = today;
            this.save();
        }
    
        getStats() {
            return {
                totalFocusMinutes: this.totalFocusMinutes,
                todayFocusMinutes: this.todayFocusMinutes,
                completedSessions: this.completedSessions,
                currentStreak:     this.currentStreak
            };
        }
    }
    
    const statsTracker = new StatsTracker();

    // ============================================================================
    // Module: src/engine/tasks.js
    // ============================================================================
    // Task & To-Do Management System
    // Persistent local-first task tracking with active HUD focus integration
    
    
    class TaskManager {
        constructor() {
            this.tasks        = [];
            this.activeTaskId = null;
            this.load();
        }
    
        load() {
            try {
                const saved = localStorage.getItem('pomodoroTasks');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed.tasks)) {
                        this.tasks = parsed.tasks.filter(t => t && typeof t.text === 'string');
                    }
                    if (typeof parsed.activeTaskId === 'string') {
                        this.activeTaskId = parsed.activeTaskId;
                    }
                }
            } catch (err) {
                console.error('Failed to load tasks:', err);
            }
    
            // If no tasks exist, provide a helpful default focus task
            if (this.tasks.length === 0) {
                const defaultTask = {
                    id:        'task_' + Date.now(),
                    text:      i18n.t('defaultTask'),
                    completed: false,
                    createdAt: Date.now()
                };
                this.tasks.push(defaultTask);
                this.activeTaskId = defaultTask.id;
                this.save();
            }
        }
    
        save() {
            try {
                localStorage.setItem('pomodoroTasks', JSON.stringify({
                    tasks:        this.tasks,
                    activeTaskId: this.activeTaskId
                }));
            } catch (err) {
                console.error('Failed to save tasks:', err);
            }
        }
    
        getTasks() {
            return this.tasks;
        }
    
        getActiveTask() {
            if (!this.activeTaskId) {
                const firstUnfinished = this.tasks.find(t => !t.completed);
                return firstUnfinished || null;
            }
            return this.tasks.find(t => t.id === this.activeTaskId) || null;
        }
    
        setActiveTask(id) {
            this.activeTaskId = id;
            this.save();
        }
    
        addTask(text) {
            const trimmed = (text || '').trim();
            if (!trimmed) return null;
    
            const newTask = {
                id:        'task_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                text:      trimmed.substring(0, 60), // Prevent overly long entries
                completed: false,
                createdAt: Date.now()
            };
    
            this.tasks.unshift(newTask);
            if (!this.activeTaskId || this.getActiveTask()?.completed) {
                this.activeTaskId = newTask.id;
            }
    
            this.save();
            sound.play('click');
            return newTask;
        }
    
        toggleTask(id) {
            const task = this.tasks.find(t => t.id === id);
            if (!task) return;
    
            task.completed = !task.completed;
            if (task.completed) {
                sound.play('task_complete');
                // If completed active task, auto-advance to next unfinished task
                if (this.activeTaskId === id) {
                    const next = this.tasks.find(t => !t.completed && t.id !== id);
                    this.activeTaskId = next ? next.id : null;
                }
            } else {
                sound.play('click');
                if (!this.activeTaskId) {
                    this.activeTaskId = id;
                }
            }
    
            this.save();
        }
    
        deleteTask(id) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            if (this.activeTaskId === id) {
                const next = this.tasks.find(t => !t.completed);
                this.activeTaskId = next ? next.id : null;
            }
            this.save();
            sound.play('click');
        }
    }
    
    const taskManager = new TaskManager();

    // ============================================================================
    // Module: src/engine/scenarios.js
    // ============================================================================
    
    // Map scenario definitions and full EarthBound environments
    const scenarioConfigs = {
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
    function getStudySeats(mapKey = 'cafeteria') {
        const config = scenarioConfigs[mapKey] || scenarioConfigs.cafeteria;
        return config.chairs || [];
    }
    
    // Retrieve bounding boxes for solid collision checking
    function getObstacles(mapKey, width, height) {
        const config = scenarioConfigs[mapKey] || scenarioConfigs.cafeteria;
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
    
        return obstacles;
    }
    
    // Render scenario floor with authentic retro pixel tiles
    function renderScenarioFloor(ctx, width, height, mapKey = 'cafeteria') {
        const config = scenarioConfigs[mapKey] || scenarioConfigs.cafeteria;
        const tileSize = 48;
    
        ctx.fillStyle = config.floorColor;
        ctx.fillRect(0, 0, width, height);
    
        if (config.floorType === 'checker') {
            ctx.fillStyle = config.tileAccent;
            for (let y = 0; y < height; y += tileSize) {
                for (let x = 0; x < width; x += tileSize) {
                    if (((x / tileSize) + (y / tileSize)) % 2 === 0) {
                        ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
                    }
                }
            }
        } else if (config.floorType === 'parquet') {
            ctx.fillStyle = config.tileAccent;
            for (let y = 0; y < height; y += tileSize) {
                for (let x = 0; x < width; x += tileSize) {
                    // Alternating parquet planks
                    if (Math.floor(y / tileSize) % 2 === 0) {
                        ctx.fillRect(x + 2, y + 2, tileSize - 4, (tileSize / 2) - 4);
                    } else {
                        ctx.fillRect(x + (tileSize / 2) + 2, y + 2, (tileSize / 2) - 4, tileSize - 4);
                    }
                }
            }
        } else {
            // Zen garden: soft grass with subtle organic moss clumps
            ctx.fillStyle = config.tileAccent;
            for (let y = 24; y < height; y += 72) {
                for (let x = 24; x < width; x += 72) {
                    ctx.fillRect(x, y, 16, 16);
                    ctx.fillRect(x + 8, y + 8, 12, 12);
                }
            }
        }
    
        // Grid accent lines
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
    
        // Render zen stepping stones if present
        if (config.steppingStones) {
            config.steppingStones.forEach(s => {
                drawPixelSprite(ctx, SPRITES.ZEN_STONE, s.x, s.y, s.w, s.h);
            });
        }
    }
    
    // Render scenario perimeter walls, furniture, chairs, and atmospheric props
    function renderScenarioEnvironment(ctx, width, height, mapKey = 'cafeteria') {
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

    // ============================================================================
    // Module: src/engine/interactions.js
    // ============================================================================
    // World Interactions & Seating System
    // Manages proximity triggers, desk study seating, and prop interactions with multilingual support
    
    
    class InteractionManager {
        constructor() {
            this.activePrompt = null;
            this.currentSeat  = null;
        }
    
        getNearbyInteraction(player, mapKey, npcs) {
            if (!player) return null;
            const config = scenarioConfigs[mapKey] || scenarioConfigs.cafeteria;
    
            const px = player.x + player.width * 0.5;
            const py = player.y + player.height * 0.5;
    
            // 1. Check if currently sitting in a chair
            if (this.currentSeat) {
                return {
                    type:   'stand',
                    label:  i18n.t('promptStand'),
                    seat:   this.currentSeat,
                    x:      player.x + player.width * 0.5,
                    y:      player.y - 12
                };
            }
    
            // 2. Check nearby empty study chairs
            if (config.chairs) {
                for (let i = 0; i < config.chairs.length; i++) {
                    const chair = config.chairs[i];
                    // Check if chair occupied by NPC
                    const isOccupied = npcs.some(npc => Math.hypot(npc.x - chair.x, npc.y - chair.y) < 20);
                    if (isOccupied) continue;
    
                    const cx = chair.x + chair.w * 0.5;
                    const cy = chair.y + chair.h * 0.5;
                    const dist = Math.hypot(px - cx, py - cy);
    
                    if (dist < 42) {
                        return {
                            type:  'sit',
                            label: i18n.t('promptSit'),
                            chair: chair,
                            x:     cx,
                            y:     chair.y - 12
                        };
                    }
                }
            }
    
            // 3. Check Espresso Counter / Bar
            if (config.counter) {
                const c  = config.counter;
                const cx = c.x + c.w * 0.5;
                const cy = c.y + c.h * 0.5;
                if (px > c.x - 20 && px < c.x + c.w + 20 && py > c.y - 10 && py < c.y + c.h + 50) {
                    return {
                        type:  'coffee',
                        label: i18n.t('promptCoffee'),
                        x:     cx,
                        y:     c.y - 12
                    };
                }
            }
    
            // 4. Check Bookshelves (Library)
            if (config.bookshelves) {
                for (let i = 0; i < config.bookshelves.length; i++) {
                    const b = config.bookshelves[i];
                    if (px > b.x - 15 && px < b.x + b.w + 15 && py > b.y - 15 && py < b.y + b.h + 40) {
                        return {
                            type:  'bookshelf',
                            label: i18n.t('promptBooks'),
                            x:     b.x + b.w * 0.5,
                            y:     b.y - 10
                        };
                    }
                }
            }
    
            // 5. Check Zen Lanterns / Pavilions (Garden)
            if (config.lanterns) {
                for (let i = 0; i < config.lanterns.length; i++) {
                    const l = config.lanterns[i];
                    if (Math.hypot(px - (l.x + l.w * 0.5), py - (l.y + l.h * 0.5)) < 45) {
                        return {
                            type:  'zen',
                            label: i18n.t('promptZen'),
                            x:     l.x + l.w * 0.5,
                            y:     l.y - 12
                        };
                    }
                }
            }
    
            // 6. Check Nearby Study Buddy NPCs
            for (let i = 0; i < npcs.length; i++) {
                const npc  = npcs[i];
                const dist = Math.hypot(px - (npc.x + npc.width * 0.5), py - (npc.y + npc.height * 0.5));
                if (dist < 46) {
                    return {
                        type:  'npc',
                        label: `${i18n.t('promptTalk')} ${npc.id}`,
                        npc:   npc,
                        x:     npc.x + npc.width * 0.5,
                        y:     npc.y - 14
                    };
                }
            }
    
            return null;
        }
    
        handleInteraction(player, interaction) {
            if (!interaction) return;
    
            switch (interaction.type) {
                case 'sit': {
                    player.x           = interaction.chair.x;
                    player.y           = interaction.chair.y - 4;
                    player.state       = 'STUDYING';
                    player.direction   = interaction.chair.facing === 'left' ? 'left' : 'right';
                    this.currentSeat   = interaction.chair;
                    sound.play('sit');
                    dialogSystem.show(i18n.t('dialogStudyTitle'), i18n.t('dialogStudyBody'));
                    break;
                }
                case 'stand': {
                    player.state     = 'IDLE';
                    player.y        += 16;
                    this.currentSeat = null;
                    sound.play('sit');
                    break;
                }
                case 'coffee': {
                    sound.play('coffee');
                    dialogSystem.show(i18n.t('dialogCoffeeTitle'), i18n.t('dialogCoffeeBody'));
                    break;
                }
                case 'bookshelf': {
                    const quote = i18n.getRandomQuote();
                    dialogSystem.show(i18n.t('signLibrary'), quote);
                    break;
                }
                case 'zen': {
                    dialogSystem.show(i18n.t('dialogZenTitle'), i18n.t('dialogZenBody'));
                    break;
                }
                case 'npc': {
                    const line = i18n.getRandomNpcDialogue();
                    dialogSystem.show(interaction.npc.id, line);
                    break;
                }
            }
        }
    
        drawPrompt(ctx, interaction) {
            if (!interaction || dialogSystem.isOpen) return;
    
            ctx.font        = 'bold 11px Courier New, "MS Gothic", "Noto Sans JP", monospace, sans-serif';
            const textWidth = ctx.measureText(interaction.label).width;
            const boxW      = textWidth + 18;
            const boxH      = 22;
            const boxX      = interaction.x - boxW * 0.5;
            const boxY      = interaction.y - boxH - 10;
    
            // Bouncing animation
            const bounce = Math.sin(performance.now() * 0.008) * 3;
    
            ctx.fillStyle   = 'rgba(24, 20, 37, 0.95)';
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth   = 1.5;
            ctx.fillRect(boxX, boxY + bounce, boxW, boxH);
            ctx.strokeRect(boxX, boxY + bounce, boxW, boxH);
    
            ctx.fillStyle = '#fde047';
            ctx.textAlign = 'center';
            ctx.fillText(interaction.label, interaction.x, boxY + bounce + 15);
        }
    }
    
    const interactionManager = new InteractionManager();

    // ============================================================================
    // Main Application Engine & Controllers (src/main.js)
    // ============================================================================
        renderScenarioFloor,
        renderScenarioEnvironment,
        scenarioConfigs,
        getStudySeats,
        getObstacles
    } from './engine/scenarios.js';
    
    const canvas = document.getElementById('gameCanvas');
    const ctx    = canvas.getContext('2d');
    
    const WORLD_WIDTH  = 1200;
    const WORLD_HEIGHT = 800;
    
    const camera = new Camera(window.innerWidth, window.innerHeight);
    
    function resizeCanvas() {
        if (canvas) {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
            if (camera) {
                camera.viewportWidth  = canvas.width;
                camera.viewportHeight = canvas.height;
            }
        }
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // ----------------------------------------------------------------------------
    // Configurations & Global State
    // ----------------------------------------------------------------------------
    const DEFAULT_CONFIG = {
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
    
    const currentConfig = { ...DEFAULT_CONFIG };
    
    const gameState = {
        players: {},
        pomodoro: {
            mode:         'WORK', // 'WORK' | 'BREAK' | 'LONG_BREAK'
            timerSeconds: 1500,
            isActive:     true,
            currentCycle: 1,
            totalCycles:  4
        }
    };
    
    let gameStarted     = false;
    let nearbyInteract  = null;
    
    // Initialize map entities and study buddy NPCs
    function initGameWorld() {
        const pId = (currentConfig.playerName && currentConfig.playerName.trim()) || 'Ness';
    
        // Reset local player node
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
    
        // Retrieve study seats for current scenario
        const seats = getStudySeats(currentConfig.map);
    
        const archetypes = ['NPC_SCHOLAR', 'NPC_GIRL', 'CHAR_SIT'];
        const npcColors  = ['#10b981', '#ec4899', '#f59e0b', '#8b5cf6', '#06b6d4'];
    
        for (let i = 1; i <= currentConfig.npcCount; i++) {
            const id = `npc_${i}`;
            let x, y, facing;
    
            if (i - 1 < seats.length) {
                const seat = seats[i - 1];
                x      = seat.x;
                y      = seat.y;
                facing = seat.facing || 'down';
            } else {
                const col = (i - seats.length - 1) % 4;
                const row = Math.floor((i - seats.length - 1) / 4);
                x      = 280 + col * 180;
                y      = 600 + row * 60;
                facing = 'down';
            }
    
            const archetype = archetypes[(i - 1) % archetypes.length];
            const color     = npcColors[(i - 1) % npcColors.length];
    
            gameState.players[id] = {
                id:        `${i18n.t('studyBuddyPrefix')} ${i}`,
                x:         x,
                y:         y,
                width:     32,
                height:    40,
                color:     color,
                direction: facing,
                archetype: archetype,
                state:     'STUDYING'
            };
        }
    
        // Reset Pomodoro timer
        const timer        = gameState.pomodoro;
        timer.mode         = 'WORK';
        timer.timerSeconds = currentConfig.focusTime * 60;
        timer.isActive     = true;
        timer.currentCycle = 1;
        timer.totalCycles  = currentConfig.cycles || 4;
    
        updateHUDActiveTask();
    }
    
    function checkAABB(x, y, w, h, box) {
        return (
            x < box.x + box.w &&
            x + w > box.x &&
            y < box.y + box.h &&
            y + h > box.y
        );
    }
    
    // ----------------------------------------------------------------------------
    // Main Update & Physics Loop
    // ----------------------------------------------------------------------------
    function update(deltaTime) {
        dialogSystem.update(deltaTime);
    
        const player = gameState.players['my_id'];
        if (!player) return;
    
        const isMenuOpen = uiLayer && !uiLayer.classList.contains('hidden');
        const npcs = Object.values(gameState.players).filter(p => p.id !== player.id);
    
        // Track nearby interactive triggers (chairs, counter, books, NPCs)
        if (!isMenuOpen) {
            nearbyInteract = interactionManager.getNearbyInteraction(player, currentConfig.map, npcs);
        } else {
            nearbyInteract = null;
        }
    
        let dx = 0;
        let dy = 0;
    
        // Movement allowed only when menu & dialogs are closed
        if (!isMenuOpen && !dialogSystem.isOpen) {
            const SPEED = 160.0;
            const rawDx = (keys.d || keys.ArrowRight) - (keys.a || keys.ArrowLeft);
            const rawDy = (keys.s || keys.ArrowDown) - (keys.w || keys.ArrowUp);
    
            // If player is currently seated studying, any movement key stands up
            if (interactionManager.currentSeat && (rawDx !== 0 || rawDy !== 0)) {
                interactionManager.handleInteraction(player, { type: 'stand' });
            }
    
            if (!interactionManager.currentSeat) {
                const len = Math.hypot(rawDx, rawDy);
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
    
                const obstacles = getObstacles(currentConfig.map, WORLD_WIDTH, WORLD_HEIGHT);
    
                const hitboxMarginX = 6;
                const hitboxTopY    = 20;
                const hitboxW       = player.width - hitboxMarginX * 2;
                const hitboxH       = player.height - hitboxTopY;
    
                // X-Axis Movement with AABB Collision
                if (dx !== 0) {
                    const nextX = player.x + dx * deltaTime;
                    const testHitboxX = nextX + hitboxMarginX;
                    const testHitboxY = player.y + hitboxTopY;
    
                    let blockedX = false;
                    for (let i = 0; i < obstacles.length; i++) {
                        if (checkAABB(testHitboxX, testHitboxY, hitboxW, hitboxH, obstacles[i])) {
                            blockedX = true;
                            break;
                        }
                    }
                    if (!blockedX) player.x = nextX;
                }
    
                // Y-Axis Movement with AABB Collision
                if (dy !== 0) {
                    const nextY = player.y + dy * deltaTime;
                    const testHitboxX = player.x + hitboxMarginX;
                    const testHitboxY = nextY + hitboxTopY;
    
                    let blockedY = false;
                    for (let i = 0; i < obstacles.length; i++) {
                        if (checkAABB(testHitboxX, testHitboxY, hitboxW, hitboxH, obstacles[i])) {
                            blockedY = true;
                            break;
                        }
                    }
                    if (!blockedY) player.y = nextY;
                }
            }
        }
    
        // Contain inside perimeter
        player.x = Math.max(20, Math.min(WORLD_WIDTH - 20 - player.width, player.x));
        player.y = Math.max(20, Math.min(WORLD_HEIGHT - 20 - player.height, player.y));
    
        camera.update(player.x, player.y, player.width, player.height, WORLD_WIDTH, WORLD_HEIGHT);
    
        // Pomodoro Timer Logic & Productivity Tracking
        if (!isMenuOpen) {
            const timer = gameState.pomodoro;
            if (timer.isActive) {
                timer.timerSeconds -= deltaTime;
    
                if (timer.timerSeconds <= 0) {
                    if (timer.mode === 'WORK') {
                        // Record completed focus session in analytics
                        statsTracker.recordCompletedSession(currentConfig.focusTime);
                        updateStatsDisplay();
    
                        if (timer.currentCycle >= timer.totalCycles) {
                            timer.mode         = 'LONG_BREAK';
                            timer.timerSeconds = currentConfig.breakTime * 60 * 2;
                            sound.play('cycle_complete');
                            dialogSystem.show(i18n.t('dialogCycleTitle'), i18n.t('dialogCycleBody'));
                        } else {
                            timer.mode         = 'BREAK';
                            timer.timerSeconds = currentConfig.breakTime * 60;
                            sound.play('break_start');
                        }
                    } else {
                        if (timer.mode === 'BREAK') {
                            timer.currentCycle++;
                        } else {
                            timer.currentCycle = 1;
                        }
                        timer.mode         = 'WORK';
                        timer.timerSeconds = currentConfig.focusTime * 60;
                        sound.play('focus_start');
                    }
                }
            }
        }
    }
    
    // ----------------------------------------------------------------------------
    // Rendering Pipeline
    // ----------------------------------------------------------------------------
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        ctx.save();
        ctx.translate(-camera.x, -camera.y);
    
        // 1. Scenario Floor
        renderScenarioFloor(ctx, WORLD_WIDTH, WORLD_HEIGHT, currentConfig.map);
    
        // 2. Scenario Environment Furniture & Decor
        renderScenarioEnvironment(ctx, WORLD_WIDTH, WORLD_HEIGHT, currentConfig.map);
    
        // 3. Characters with Y-Depth Sorting
        const sortedChars = Object.values(gameState.players).sort((a, b) => (a.y + a.height) - (b.y + b.height));
        sortedChars.forEach(p => {
            drawCharacterSprite(ctx, p);
        });
    
        // 4. Interactive Proximity Prompt
        if (nearbyInteract) {
            interactionManager.drawPrompt(ctx, nearbyInteract);
        }
    
        ctx.restore();
    
        // 5. EarthBound Retro Pomodoro HUD
        drawPomodoro();
    
        // 6. Retro Dialogue Box
        dialogSystem.draw(ctx, canvas.width, canvas.height);
    }
    
    function drawCharacterSprite(ctx, p) {
        const isPlayer = p.id === currentConfig.playerName || p.id === 'Ness' || p.id === 'my_id';
    
        // Drop shadow under character
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(p.x + p.width * 0.5, p.y + p.height - 2, p.width * 0.45, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    
        const dir      = p.direction || 'down';
        const isMoving = p.state === 'WALKING';
        const isSitting = p.state === 'STUDYING' && isPlayer;
        const time     = performance.now();
        const walkFrame = Math.floor(time / 200) % 2 === 0;
    
        let spriteData = SPRITES.CHAR_DOWN_IDLE;
        let flipX      = false;
    
        if (isPlayer) {
            if (isSitting) {
                spriteData = SPRITES.CHAR_SIT;
                if (dir === 'left') flipX = false;
                if (dir === 'right') flipX = true;
            } else if (dir === 'down') {
                spriteData = isMoving ? (walkFrame ? SPRITES.CHAR_DOWN_WALK_1 : SPRITES.CHAR_DOWN_WALK_2) : SPRITES.CHAR_DOWN_IDLE;
            } else if (dir === 'up') {
                spriteData = isMoving ? (walkFrame ? SPRITES.CHAR_UP_WALK_1 : SPRITES.CHAR_UP_WALK_2) : SPRITES.CHAR_UP_IDLE;
            } else if (dir === 'left') {
                spriteData = isMoving ? (walkFrame ? SPRITES.CHAR_SIDE_WALK_1 : SPRITES.CHAR_SIDE_WALK_2) : SPRITES.CHAR_SIDE_IDLE;
                flipX = false;
            } else if (dir === 'right') {
                spriteData = isMoving ? (walkFrame ? SPRITES.CHAR_SIDE_WALK_1 : SPRITES.CHAR_SIDE_WALK_2) : SPRITES.CHAR_SIDE_IDLE;
                flipX = true;
            }
        } else {
            if (p.archetype === 'NPC_SCHOLAR') {
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
    
        // Badge / Name Tag
        const tagText   = isPlayer ? p.id : (p.state === 'STUDYING' ? `📖 ${p.id}` : p.id);
        ctx.font        = 'bold 11px Courier New, "MS Gothic", "Noto Sans JP", monospace, sans-serif';
        const textWidth = ctx.measureText(tagText).width;
        const badgeW    = textWidth + 14;
        const badgeH    = 18;
        const badgeX    = p.x + p.width * 0.5 - badgeW * 0.5;
        const badgeY    = p.y - 22;
    
        ctx.fillStyle   = 'rgba(24, 20, 37, 0.9)';
        ctx.strokeStyle = isPlayer ? (currentConfig.playerColor || '#60a5fa') : '#34d399';
        ctx.lineWidth   = 1.5;
        ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
        ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);
    
        ctx.fillStyle = isPlayer ? '#ffffff' : '#a7f3d0';
        ctx.textAlign = 'center';
        ctx.fillText(tagText, p.x + p.width * 0.5, badgeY + 13);
    }
    
    function drawPomodoro() {
        const timer        = gameState.pomodoro;
        const isMenuOpen   = uiLayer && !uiLayer.classList.contains('hidden');
        const totalSeconds = Math.max(0, Math.floor(timer.timerSeconds));
        const minutes      = Math.floor(totalSeconds / 60);
        const seconds      = totalSeconds % 60;
        const timeStr      = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
        const hudW = 280;
        const hudH = 78;
        const hudX = (canvas.width - hudW) * 0.5;
        const hudY = 16;
    
        // SNES Double-Border Frame
        ctx.fillStyle   = 'rgba(24, 20, 37, 0.96)';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth   = 2;
        ctx.fillRect(hudX, hudY, hudW, hudH);
        ctx.strokeRect(hudX, hudY, hudW, hudH);
    
        const themeColor = timer.mode === 'WORK' ? '#ef4444' : (timer.mode === 'LONG_BREAK' ? '#38bdf8' : '#10b981');
        ctx.strokeStyle  = themeColor;
        ctx.lineWidth    = 1;
        ctx.strokeRect(hudX + 3, hudY + 3, hudW - 6, hudH - 6);
    
        // Multilingual Scenario Title
        let scenarioName = i18n.t('mapCafeteria');
        if (currentConfig.map === 'library') scenarioName = i18n.t('mapLibrary');
        else if (currentConfig.map === 'garden') scenarioName = i18n.t('mapGarden');
    
        // Multilingual Mode Label
        let modeText = i18n.t('hudFocusSession');
        if (!timer.isActive || isMenuOpen) {
            modeText = i18n.t('hudPaused');
        } else if (timer.mode === 'BREAK') {
            modeText = i18n.t('hudShortBreak');
        } else if (timer.mode === 'LONG_BREAK') {
            modeText = i18n.t('hudLongBreak');
        }
    
        ctx.fillStyle = (!timer.isActive || isMenuOpen) ? '#facc15' : themeColor;
        ctx.font      = 'bold 11px Courier New, "MS Gothic", "Noto Sans JP", monospace, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${scenarioName} • ${modeText}`, canvas.width * 0.5, hudY + 20);
    
        // Digital Clock
        ctx.fillStyle = '#ffffff';
        ctx.font      = 'bold 26px Courier New, "MS Gothic", "Noto Sans JP", monospace, sans-serif';
        ctx.fillText(timeStr, canvas.width * 0.5, hudY + 48);
    
        // Cycle & Progress
        let maxSeconds = currentConfig.focusTime * 60;
        if (timer.mode === 'BREAK') maxSeconds = currentConfig.breakTime * 60;
        if (timer.mode === 'LONG_BREAK') maxSeconds = currentConfig.breakTime * 60 * 2;
    
        const progress = Math.max(0, Math.min(1, timer.timerSeconds / Math.max(1, maxSeconds)));
    
        ctx.fillStyle = '#334155';
        ctx.fillRect(hudX + 12, hudY + hudH - 12, hudW - 24, 6);
    
        ctx.fillStyle = themeColor;
        ctx.fillRect(hudX + 12, hudY + hudH - 12, (hudW - 24) * progress, 6);
    
        const cycleText = `${i18n.t('hudCycle')} ${timer.currentCycle}/${timer.totalCycles}`;
        ctx.fillStyle   = '#94a3b8';
        ctx.font        = 'bold 9px Courier New, "MS Gothic", "Noto Sans JP", monospace, sans-serif';
        ctx.textAlign   = 'right';
        ctx.fillText(cycleText, hudX + hudW - 12, hudY + 46);
    }
    
    let lastTime = 0;
    function gameLoop(currentTime) {
        if (!lastTime) lastTime = currentTime;
        let deltaTime = (currentTime - lastTime) * 0.001;
        lastTime = currentTime;
    
        if (deltaTime > 0.1) deltaTime = 0.1;
        update(deltaTime);
        draw();
        requestAnimationFrame(gameLoop);
    }
    
    // ----------------------------------------------------------------------------
    // DOM References & Event Handlers
    // ----------------------------------------------------------------------------
    const playBtn           = document.getElementById('btn-play');
    const customBtn         = document.getElementById('btn-custom');
    const settingsBtn       = document.getElementById('btn-settings');
    const soloBtn           = document.getElementById('btn-solo');
    const modeBackBtn       = document.getElementById('btn-mode-back');
    const startGameBtn      = document.getElementById('btn-start-game');
    const configBackBtn     = document.getElementById('btn-config-back');
    const saveCustomBtn     = document.getElementById('btn-save-custom');
    const customBackBtn     = document.getElementById('btn-custom-back');
    
    const uiLayer           = document.getElementById('ui-layer');
    const mainMenuPanel     = document.getElementById('main-menu');
    const modeMenuPanel     = document.getElementById('mode-menu');
    const configMenuPanel   = document.getElementById('solo-config-menu');
    const customMenuPanel   = document.getElementById('custom-menu');
    const pauseMenuPanel    = document.getElementById('pause-menu');
    const controlsLegend    = document.getElementById('controls-legend');
    
    const resumeBtn         = document.getElementById('btn-resume');
    const pauseTasksBtn     = document.getElementById('btn-pause-tasks');
    const pauseSettingsBtn  = document.getElementById('btn-pause-settings');
    const exitMainBtn       = document.getElementById('btn-exit-main');
    
    const focusInput        = document.getElementById('focus-time');
    const breakInput        = document.getElementById('break-time');
    const cyclesInput       = document.getElementById('cycles');
    const mapSelect         = document.getElementById('map-select');
    const npcInput          = document.getElementById('npc-count');
    const playerNameInput   = document.getElementById('player-name');
    const playerColorSelect = document.getElementById('player-color');
    const ambientSelect     = document.getElementById('ambient-select');
    const volumeSlider      = document.getElementById('volume-slider');
    const languageSelect    = document.getElementById('language-select');
    const langButtons       = document.querySelectorAll('.lang-btn');
    
    // Top HUD Elements
    const hudOverlay        = document.getElementById('hud-overlay');
    const hudTaskText       = document.getElementById('hud-task-text');
    const hudTag            = document.getElementById('hud-tag');
    const btnHudPlay        = document.getElementById('btn-hud-play');
    const btnHudSkip        = document.getElementById('btn-hud-skip');
    const btnHudTasks       = document.getElementById('btn-hud-tasks');
    const btnHudSound       = document.getElementById('btn-hud-sound');
    
    // Task Drawer Elements
    const taskDrawer        = document.getElementById('task-drawer');
    const taskForm          = document.getElementById('task-form');
    const taskInput         = document.getElementById('task-input');
    const taskList          = document.getElementById('task-list');
    const btnCloseTasks     = document.getElementById('btn-close-tasks');
    const lblDrawerTitle    = document.getElementById('lbl-drawer-title');
    const btnAddTask        = document.getElementById('btn-add-task');
    const lblDrawerFooter   = document.getElementById('lbl-drawer-footer');
    
    // Pause Stats Elements
    const statTodayMin      = document.getElementById('stat-today-min');
    const statSessions      = document.getElementById('stat-sessions');
    const statStreak        = document.getElementById('stat-streak');
    const lblStatToday      = document.getElementById('lbl-stat-today');
    const lblStatSessions   = document.getElementById('lbl-stat-sessions');
    const lblStatStreak     = document.getElementById('lbl-stat-streak');
    
    // Main Menu Text Labels
    const lblMainTitle      = document.getElementById('lbl-main-title');
    const lblMainSubtitle   = document.getElementById('lbl-main-subtitle');
    const linkAbout         = document.getElementById('link-about');
    
    // Mode Menu Labels
    const lblModeTitle      = document.getElementById('lbl-mode-title');
    const btnMultiplayer    = document.getElementById('btn-multiplayer');
    
    // Config Labels
    const lblConfigTitle    = document.getElementById('lbl-config-title');
    const lblCfgFocus       = document.getElementById('lbl-cfg-focus');
    const lblCfgBreak       = document.getElementById('lbl-cfg-break');
    const lblCfgCycles      = document.getElementById('lbl-cfg-cycles');
    const lblCfgMap         = document.getElementById('lbl-cfg-map');
    const lblCfgNpc         = document.getElementById('lbl-cfg-npc');
    const lblCfgAmbient     = document.getElementById('lbl-cfg-ambient');
    const lblCfgVolume      = document.getElementById('lbl-cfg-volume');
    const lblCfgLanguage    = document.getElementById('lbl-cfg-language');
    
    // Map Options
    const optMapCafeteria   = document.getElementById('opt-map-cafeteria');
    const optMapLibrary     = document.getElementById('opt-map-library');
    const optMapGarden      = document.getElementById('opt-map-garden');
    
    // Ambient Options
    const optAmbientOff     = document.getElementById('opt-ambient-off');
    const optAmbientRain    = document.getElementById('opt-ambient-rain');
    const optAmbientCafe    = document.getElementById('opt-ambient-cafe');
    
    // Customization Labels
    const lblCustomTitle    = document.getElementById('lbl-custom-title');
    const lblCustomName     = document.getElementById('lbl-custom-name');
    const lblCustomColor    = document.getElementById('lbl-custom-color');
    const optColorNess      = document.getElementById('opt-color-ness');
    const optColorPaula     = document.getElementById('opt-color-paula');
    const optColorJeff      = document.getElementById('opt-color-jeff');
    const optColorPoo       = document.getElementById('opt-color-poo');
    const optColorPurple    = document.getElementById('opt-color-purple');
    const optColorGold      = document.getElementById('opt-color-gold');
    
    // Pause Menu Labels
    const lblPauseTitle     = document.getElementById('lbl-pause-title');
    
    // Controls Legend Elements
    const legendMove        = document.getElementById('legend-move');
    const legendInteract    = document.getElementById('legend-interact');
    const legendPause       = document.getElementById('legend-pause');
    const legendTasks       = document.getElementById('legend-tasks');
    const legendMute        = document.getElementById('legend-mute');
    const legendMenu        = document.getElementById('legend-menu');
    
    let lastMenuPanel = 'main';
    
    // ----------------------------------------------------------------------------
    // Multilingual Translation Applicator
    // ----------------------------------------------------------------------------
    function applyLanguage(lang) {
        i18n.setLanguage(lang);
        currentConfig.language = lang;
    
        // Update active state on language pills
        langButtons.forEach(btn => {
            if (btn.dataset.lang === lang) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    
        if (languageSelect) languageSelect.value = lang;
    
        // Main Menu
        if (lblMainTitle)    lblMainTitle.textContent    = i18n.t('appTitle');
        if (lblMainSubtitle) lblMainSubtitle.textContent = i18n.t('appSubtitle');
        if (playBtn)         playBtn.textContent         = i18n.t('playGame');
        if (customBtn)       customBtn.textContent       = i18n.t('userCustomization');
        if (settingsBtn)     settingsBtn.textContent     = i18n.t('soloSettings');
        if (linkAbout)       linkAbout.textContent       = i18n.t('aboutProject');
    
        // Mode Menu
        if (lblModeTitle)    lblModeTitle.textContent    = i18n.t('selectMode');
        if (soloBtn)         soloBtn.textContent         = i18n.t('soloStudySpace');
        if (btnMultiplayer)  btnMultiplayer.textContent  = i18n.t('multiplayerSoon');
        if (modeBackBtn)     modeBackBtn.textContent     = i18n.t('back');
    
        // Solo Config Menu
        if (lblConfigTitle)  lblConfigTitle.textContent  = i18n.t('soloSettings');
        if (lblCfgFocus)     lblCfgFocus.textContent     = i18n.t('focusDuration');
        if (lblCfgBreak)     lblCfgBreak.textContent     = i18n.t('breakDuration');
        if (lblCfgCycles)    lblCfgCycles.textContent    = i18n.t('sessionCycles');
        if (lblCfgMap)       lblCfgMap.textContent       = i18n.t('selectMap');
        if (lblCfgNpc)       lblCfgNpc.textContent       = i18n.t('npcStudyBuddies');
        if (lblCfgAmbient)   lblCfgAmbient.textContent   = i18n.t('ambientSound');
        if (lblCfgVolume)    lblCfgVolume.textContent    = i18n.t('masterVolume');
        if (lblCfgLanguage)  lblCfgLanguage.textContent  = i18n.t('language');
    
        if (optMapCafeteria) optMapCafeteria.textContent = i18n.t('mapCafeteria');
        if (optMapLibrary)   optMapLibrary.textContent   = i18n.t('mapLibrary');
        if (optMapGarden)    optMapGarden.textContent    = i18n.t('mapGarden');
    
        if (optAmbientOff)   optAmbientOff.textContent   = i18n.t('ambientOff');
        if (optAmbientRain)  optAmbientRain.textContent  = i18n.t('ambientRain');
        if (optAmbientCafe)  optAmbientCafe.textContent  = i18n.t('ambientCafe');
    
        if (startGameBtn) {
            startGameBtn.textContent = gameStarted && lastMenuPanel === 'pause' ? i18n.t('applyResume') : i18n.t('startGame');
        }
        if (configBackBtn)   configBackBtn.textContent   = i18n.t('back');
    
        // Customization Menu
        if (lblCustomTitle)  lblCustomTitle.textContent  = i18n.t('userCustomization');
        if (lblCustomName)   lblCustomName.textContent   = i18n.t('playerNameTag');
        if (lblCustomColor)  lblCustomColor.textContent  = i18n.t('avatarColor');
        if (optColorNess)    optColorNess.textContent    = i18n.t('colorNess');
        if (optColorPaula)   optColorPaula.textContent   = i18n.t('colorPaula');
        if (optColorJeff)    optColorJeff.textContent    = i18n.t('colorJeff');
        if (optColorPoo)     optColorPoo.textContent     = i18n.t('colorPoo');
        if (optColorPurple)  optColorPurple.textContent  = i18n.t('colorPurple');
        if (optColorGold)    optColorGold.textContent    = i18n.t('colorGold');
        if (saveCustomBtn)   saveCustomBtn.textContent   = i18n.t('saveAvatar');
        if (customBackBtn)   customBackBtn.textContent   = i18n.t('back');
    
        // Pause Menu
        if (lblPauseTitle)    lblPauseTitle.textContent    = i18n.t('gamePaused');
        if (lblStatToday)     lblStatToday.textContent     = i18n.t('statTodayMin');
        if (lblStatSessions)  lblStatSessions.textContent  = i18n.t('statCompleted');
        if (lblStatStreak)    lblStatStreak.textContent    = i18n.t('statStreak');
        if (resumeBtn)        resumeBtn.textContent        = i18n.t('resume');
        if (pauseTasksBtn)    pauseTasksBtn.textContent    = i18n.t('tasksButton');
        if (pauseSettingsBtn) pauseSettingsBtn.textContent = i18n.t('settings');
        if (exitMainBtn)      exitMainBtn.textContent      = i18n.t('exitMainMenu');
    
        // HUD Elements
        if (hudTag)      hudTag.textContent      = i18n.t('currentFocus');
        if (btnHudPlay)  btnHudPlay.textContent  = gameState.pomodoro.isActive ? i18n.t('hudPause') : i18n.t('hudResume');
        if (btnHudSkip)  btnHudSkip.textContent  = i18n.t('hudSkip');
        if (btnHudTasks) btnHudTasks.textContent = i18n.t('tasksButton');
        if (btnHudSound) btnHudSound.textContent = sound.isMuted ? i18n.t('hudMuted') : i18n.t('hudAudio');
    
        // Task Drawer
        if (lblDrawerTitle)  lblDrawerTitle.textContent  = i18n.t('focusTasks');
        if (taskInput)       taskInput.placeholder       = i18n.t('taskPlaceholder');
        if (btnAddTask)      btnAddTask.textContent      = i18n.t('addTask');
        if (lblDrawerFooter) lblDrawerFooter.textContent = i18n.t('taskTip');
    
        // Bottom Legend
        if (legendMove)     legendMove.textContent     = i18n.t('legendMove');
        if (legendInteract) legendInteract.textContent = i18n.t('legendInteract');
        if (legendPause)    legendPause.textContent    = i18n.t('legendPause');
        if (legendTasks)    legendTasks.textContent    = i18n.t('legendTasks');
        if (legendMute)     legendMute.textContent     = i18n.t('legendMute');
        if (legendMenu)     legendMenu.textContent     = i18n.t('legendMenu');
    
        // Refresh Study Buddy names dynamically
        let buddyIdx = 1;
        Object.keys(gameState.players).forEach(k => {
            if (k !== 'my_id') {
                gameState.players[k].id = `${i18n.t('studyBuddyPrefix')} ${buddyIdx++}`;
            }
        });
    
        renderTasks();
        updateStatsDisplay();
    }
    
    function updateStatsDisplay() {
        const stats = statsTracker.getStats();
        if (statTodayMin) statTodayMin.textContent = stats.todayFocusMinutes;
        if (statSessions) statSessions.textContent = stats.completedSessions;
        if (statStreak)   statStreak.textContent   = stats.currentStreak;
    }
    
    function updateHUDActiveTask() {
        const active = taskManager.getActiveTask();
        if (hudTaskText) {
            hudTaskText.textContent = active ? active.text : i18n.t('defaultTask');
        }
    }
    
    function renderTasks() {
        if (!taskList) return;
        taskList.innerHTML = '';
        const tasks  = taskManager.getTasks();
        const active = taskManager.getActiveTask();
    
        tasks.forEach(t => {
            const item = document.createElement('div');
            item.className = `task-item ${t.completed ? 'completed' : ''} ${active && active.id === t.id ? 'active' : ''}`;
    
            const chk = document.createElement('input');
            chk.type      = 'checkbox';
            chk.className = 'task-check';
            chk.checked   = t.completed;
            chk.addEventListener('change', () => {
                taskManager.toggleTask(t.id);
                renderTasks();
                updateHUDActiveTask();
            });
    
            const span = document.createElement('span');
            span.className   = 'task-text';
            span.textContent = t.text;
            span.title       = 'Click to set as active focus task';
            span.addEventListener('click', () => {
                taskManager.setActiveTask(t.id);
                renderTasks();
                updateHUDActiveTask();
            });
    
            const del = document.createElement('button');
            del.className   = 'task-del';
            del.textContent = '✕';
            del.title       = 'Delete task';
            del.addEventListener('click', () => {
                taskManager.deleteTask(t.id);
                renderTasks();
                updateHUDActiveTask();
            });
    
            item.appendChild(chk);
            item.appendChild(span);
            item.appendChild(del);
            taskList.appendChild(item);
        });
    
        updateHUDActiveTask();
    }
    
    function toggleTaskDrawer(show = null) {
        if (!taskDrawer) return;
        const isVisible = !taskDrawer.classList.contains('hidden');
        const shouldShow = show !== null ? show : !isVisible;
    
        if (shouldShow) {
            taskDrawer.classList.remove('hidden');
            renderTasks();
            if (taskInput) taskInput.focus();
        } else {
            taskDrawer.classList.add('hidden');
        }
        sound.play('click');
    }
    
    function toggleTimerPlayPause() {
        const timer = gameState.pomodoro;
        timer.isActive = !timer.isActive;
        if (btnHudPlay) {
            btnHudPlay.textContent = timer.isActive ? i18n.t('hudPause') : i18n.t('hudResume');
        }
        sound.play('click');
    }
    
    function skipPomodoroSession() {
        const timer = gameState.pomodoro;
        timer.timerSeconds = 0.5; // Force immediate transition in next frame
        sound.play('click');
    }
    
    // Router for Menu Panels
    function showPanel(target) {
        const panels = {
            'main':   mainMenuPanel,
            'mode':   modeMenuPanel,
            'config': configMenuPanel,
            'custom': customMenuPanel,
            'pause':  pauseMenuPanel
        };
    
        if (target === 'none') {
            if (uiLayer)        uiLayer.classList.add('hidden');
            if (hudOverlay)     hudOverlay.classList.remove('hidden');
            if (controlsLegend) controlsLegend.classList.remove('hidden');
            return;
        }
    
        if (uiLayer)        uiLayer.classList.remove('hidden');
        if (hudOverlay)     hudOverlay.classList.add('hidden');
        if (controlsLegend) controlsLegend.classList.add('hidden');
    
        Object.keys(panels).forEach(key => {
            const p = panels[key];
            if (p) {
                if (key === target) p.classList.remove('hidden');
                else p.classList.add('hidden');
            }
        });
    
        if (target === 'pause') {
            updateStatsDisplay();
        }
    
        if (target === 'config' && startGameBtn) {
            startGameBtn.textContent = gameStarted && lastMenuPanel === 'pause' ? i18n.t('applyResume') : i18n.t('startGame');
        }
    }
    
    function loadSavedSettings() {
        try {
            const saved = localStorage.getItem('pomodoroConfig');
            if (saved) {
                const config = JSON.parse(saved);
                if (config) {
                    const focusVal  = parseInt(config.focusTime, 10);
                    const breakVal  = parseInt(config.breakTime, 10);
                    const cyclesVal = parseInt(config.cycles, 10);
                    const npcVal    = parseInt(config.npcCount, 10);
                    const mapVal    = config.map;
                    const pName     = config.playerName;
                    const pColor    = config.playerColor;
                    const lang      = config.language;
    
                    if (!isNaN(focusVal) && focusVal >= 1 && focusVal <= 180)    currentConfig.focusTime   = focusVal;
                    if (!isNaN(breakVal) && breakVal >= 1 && breakVal <= 60)     currentConfig.breakTime   = breakVal;
                    if (!isNaN(cyclesVal) && cyclesVal >= 1 && cyclesVal <= 12)  currentConfig.cycles      = cyclesVal;
                    if (!isNaN(npcVal) && npcVal >= 0 && npcVal <= 14)          currentConfig.npcCount    = npcVal;
                    if (['cafeteria', 'library', 'garden'].includes(mapVal))     currentConfig.map         = mapVal;
                    if (typeof pName === 'string' && pName.trim())               currentConfig.playerName  = pName.trim();
                    if (typeof pColor === 'string' && pColor.startsWith('#'))    currentConfig.playerColor = pColor;
                    if (['en', 'es', 'ja'].includes(lang))                       currentConfig.language    = lang;
    
                    if (focusInput)        focusInput.value        = currentConfig.focusTime;
                    if (breakInput)        breakInput.value        = currentConfig.breakTime;
                    if (cyclesInput)       cyclesInput.value       = currentConfig.cycles;
                    if (mapSelect)         mapSelect.value         = currentConfig.map;
                    if (npcInput)          npcInput.value          = currentConfig.npcCount;
                    if (playerNameInput)   playerNameInput.value   = currentConfig.playerName;
                    if (playerColorSelect) playerColorSelect.value = currentConfig.playerColor;
                }
            }
        } catch (_) {}
    
        if (ambientSelect) ambientSelect.value = sound.ambientType;
        if (volumeSlider)  volumeSlider.value  = Math.round(sound.masterVolume * 100);
    
        applyLanguage(currentConfig.language || i18n.getLanguage());
    }
    
    // ----------------------------------------------------------------------------
    // Event Listeners
    // ----------------------------------------------------------------------------
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            sound.play('click');
            showPanel('mode');
        });
    }
    if (modeBackBtn) {
        modeBackBtn.addEventListener('click', () => {
            sound.play('click');
            showPanel('main');
        });
    }
    if (soloBtn) {
        soloBtn.addEventListener('click', () => {
            sound.play('click');
            lastMenuPanel = 'mode';
            showPanel('config');
        });
    }
    if (configBackBtn) {
        configBackBtn.addEventListener('click', () => {
            sound.play('click');
            showPanel(lastMenuPanel);
        });
    }
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            sound.play('click');
            lastMenuPanel = 'main';
            showPanel('config');
        });
    }
    if (customBtn) {
        customBtn.addEventListener('click', () => {
            sound.play('click');
            showPanel('custom');
        });
    }
    if (customBackBtn) {
        customBackBtn.addEventListener('click', () => {
            sound.play('click');
            showPanel('main');
        });
    }
    
    // Language Switchers
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            applyLanguage(lang);
            sound.play('click');
        });
    });
    
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            applyLanguage(e.target.value);
            sound.play('click');
        });
    }
    
    if (saveCustomBtn) {
        saveCustomBtn.addEventListener('click', () => {
            if (playerNameInput && playerNameInput.value.trim()) {
                currentConfig.playerName = playerNameInput.value.trim();
            }
            if (playerColorSelect) {
                currentConfig.playerColor = playerColorSelect.value;
            }
            try {
                localStorage.setItem('pomodoroConfig', JSON.stringify(currentConfig));
            } catch (_) {}
    
            initGameWorld();
            showPanel('main');
        });
    }
    
    if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
            const focusVal  = focusInput ? parseInt(focusInput.value, 10) : 25;
            const breakVal  = breakInput ? parseInt(breakInput.value, 10) : 5;
            const cyclesVal = cyclesInput ? parseInt(cyclesInput.value, 10) : 4;
            const npcVal    = npcInput ? parseInt(npcInput.value, 10) : 5;
            const mapVal    = mapSelect ? mapSelect.value : 'cafeteria';
            const langVal   = languageSelect ? languageSelect.value : 'en';
    
            const gameConfig = {
                ...currentConfig,
                focusTime: (!isNaN(focusVal) && focusVal >= 1 && focusVal <= 180) ? focusVal : 25,
                breakTime: (!isNaN(breakVal) && breakVal >= 1 && breakVal <= 60) ? breakVal : 5,
                cycles:    (!isNaN(cyclesVal) && cyclesVal >= 1 && cyclesVal <= 12) ? cyclesVal : 4,
                map:       ['cafeteria', 'library', 'garden'].includes(mapVal) ? mapVal : 'cafeteria',
                npcCount:  (!isNaN(npcVal) && npcVal >= 0 && npcVal <= 14) ? npcVal : 5,
                language:  ['en', 'es', 'ja'].includes(langVal) ? langVal : 'en'
            };
    
            Object.assign(currentConfig, gameConfig);
    
            try {
                localStorage.setItem('pomodoroConfig', JSON.stringify(gameConfig));
            } catch (_) {}
    
            if (ambientSelect) {
                sound.setAmbientType(ambientSelect.value);
            }
    
            applyLanguage(currentConfig.language);
    
            gameStarted = true;
            initGameWorld();
            showPanel('none');
            lastTime = performance.now();
            sound.play('focus_start');
        });
    }
    
    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
            sound.play('click');
            lastTime = performance.now();
            showPanel('none');
        });
    }
    
    if (pauseTasksBtn) {
        pauseTasksBtn.addEventListener('click', () => {
            sound.play('click');
            toggleTaskDrawer(true);
        });
    }
    
    if (pauseSettingsBtn) {
        pauseSettingsBtn.addEventListener('click', () => {
            sound.play('click');
            lastMenuPanel = 'pause';
            showPanel('config');
        });
    }
    
    if (exitMainBtn) {
        exitMainBtn.addEventListener('click', () => {
            sound.play('click');
            sound.stopAmbient();
            showPanel('main');
        });
    }
    
    // Volume & Ambient Sound Listeners
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            sound.setMasterVolume(e.target.value / 100);
        });
    }
    
    if (ambientSelect) {
        ambientSelect.addEventListener('change', (e) => {
            sound.setAmbientType(e.target.value);
        });
    }
    
    // Top HUD Buttons
    if (btnHudPlay)  btnHudPlay.addEventListener('click',  toggleTimerPlayPause);
    if (btnHudSkip)  btnHudSkip.addEventListener('click',  skipPomodoroSession);
    if (btnHudTasks) btnHudTasks.addEventListener('click', () => toggleTaskDrawer());
    if (btnHudSound) {
        btnHudSound.addEventListener('click', () => {
            const isMuted = sound.toggleMute();
            btnHudSound.textContent = isMuted ? i18n.t('hudMuted') : i18n.t('hudAudio');
            sound.play('click');
        });
    }
    
    // Task Form Submit
    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (taskInput && taskInput.value.trim()) {
                taskManager.addTask(taskInput.value.trim());
                taskInput.value = '';
                renderTasks();
                updateHUDActiveTask();
            }
        });
    }
    
    if (btnCloseTasks) {
        btnCloseTasks.addEventListener('click', () => toggleTaskDrawer(false));
    }
    
    // ----------------------------------------------------------------------------
    // Universal Keyboard Shortcuts
    // ----------------------------------------------------------------------------
    window.addEventListener('keydown', (e) => {
        // Ignore gameplay shortcuts if typing in an input
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(activeTag)) {
            if (e.key === 'Escape') {
                document.activeElement.blur();
                toggleTaskDrawer(false);
            }
            return;
        }
    
        // Dialogue advances on Space, Enter, or E
        if (dialogSystem.isOpen && [' ', 'Enter', 'e', 'E'].includes(e.key)) {
            e.preventDefault();
            dialogSystem.advance();
            return;
        }
    
        if (e.key === 'Escape') {
            if (taskDrawer && !taskDrawer.classList.contains('hidden')) {
                toggleTaskDrawer(false);
                return;
            }
    
            if (uiLayer) {
                if (uiLayer.classList.contains('hidden')) {
                    showPanel('pause');
                } else {
                    if (pauseMenuPanel && !pauseMenuPanel.classList.contains('hidden')) {
                        lastTime = performance.now();
                        showPanel('none');
                    } else if (configMenuPanel && !configMenuPanel.classList.contains('hidden')) {
                        showPanel(lastMenuPanel);
                    } else if (customMenuPanel && !customMenuPanel.classList.contains('hidden')) {
                        showPanel('main');
                    } else if (modeMenuPanel && !modeMenuPanel.classList.contains('hidden')) {
                        showPanel('main');
                    }
                }
            }
            return;
        }
    
        // In-game hotkeys
        const isGameActive = uiLayer && uiLayer.classList.contains('hidden');
        if (!isGameActive) return;
    
        // [E] Trigger Nearby Interaction
        if (e.key === 'e' || e.key === 'E') {
            const player = gameState.players['my_id'];
            if (nearbyInteract && player) {
                interactionManager.handleInteraction(player, nearbyInteract);
            }
        }
    
        // [Space] Toggle Timer Play/Pause
        if (e.key === ' ') {
            e.preventDefault();
            toggleTimerPlayPause();
        }
    
        // [T] Toggle Task Drawer
        if (e.key === 't' || e.key === 'T') {
            e.preventDefault();
            toggleTaskDrawer();
        }
    
        // [M] Toggle Audio Mute
        if (e.key === 'm' || e.key === 'M') {
            const isMuted = sound.toggleMute();
            if (btnHudSound) btnHudSound.textContent = isMuted ? i18n.t('hudMuted') : i18n.t('hudAudio');
        }
    
        // [Tab] Skip Session
        if (e.key === 'Tab') {
            e.preventDefault();
            skipPomodoroSession();
        }
    });
    
    // ----------------------------------------------------------------------------
    // Startup Initialization
    // ----------------------------------------------------------------------------
    function startApp() {
        resizeCanvas();
        loadSavedSettings();
        initGameWorld();
        renderTasks();
        updateStatsDisplay();
        showPanel('main');
        requestAnimationFrame(gameLoop);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startApp);
    } else {
        startApp();
    }
})();
