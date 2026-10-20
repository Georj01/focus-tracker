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

export const sound = new SoundEngine();
