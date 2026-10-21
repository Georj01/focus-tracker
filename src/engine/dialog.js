// EarthBound Retro Dialogue Box System
// Typewriter animated text with sound blips and multilingual word wrapping

import { sound } from './audio.js';

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

export const dialogSystem = new DialogSystem();
