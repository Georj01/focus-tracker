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

        const boxW = Math.min(540, canvasWidth - 36);
        const boxH = 128;
        const boxX = Math.round((canvasWidth - boxW) * 0.5);
        const boxY = Math.round(canvasHeight - boxH - 42);

        // Hard drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
        ctx.fillRect(boxX + 4, boxY + 4, boxW, boxH);

        // Classic Win98 Window Chrome
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(boxX, boxY, boxW - 1, 2);
        ctx.fillRect(boxX, boxY, 2, boxH - 1);
        ctx.fillStyle = '#000000';
        ctx.fillRect(boxX, boxY + boxH - 2, boxW, 2);
        ctx.fillRect(boxX + boxW - 2, boxY, 2, boxH);
        ctx.fillStyle = '#808080';
        ctx.fillRect(boxX + 2, boxY + boxH - 3, boxW - 4, 1);
        ctx.fillRect(boxX + boxW - 3, boxY + 2, 1, boxH - 4);

        // Win98 Navy Gradient Titlebar
        const barX = boxX + 4;
        const barY = boxY + 4;
        const barW = boxW - 8;
        const barH = 22;
        const grad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
        grad.addColorStop(0, '#000080');
        grad.addColorStop(1, '#1084d0');
        ctx.fillStyle = grad;
        ctx.fillRect(barX, barY, barW, barH);

        // Speaker in Titlebar
        ctx.fillStyle = '#ffffff';
        ctx.font      = 'bold 12px Tahoma, "MS Sans Serif", "MS PGothic", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(this.speaker || 'Message', barX + 8, barY + 15);

        // Tiny Win98 [X] button on titlebar right
        const closeX = barX + barW - 18;
        const closeY = barY + 3;
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(closeX, closeY, 15, 15);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(closeX, closeY, 14, 1);
        ctx.fillRect(closeX, closeY, 1, 14);
        ctx.fillStyle = '#000000';
        ctx.fillRect(closeX, closeY + 14, 15, 1);
        ctx.fillRect(closeX + 14, closeY, 1, 15);
        ctx.font      = 'bold 11px Tahoma, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('×', closeX + 7, closeY + 11);

        // Classic Win98 Info Icon Box (left side)
        const iconX = boxX + 16;
        const iconY = boxY + 38;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(iconX, iconY, 26, 26);
        ctx.strokeStyle = '#000080';
        ctx.lineWidth   = 2;
        ctx.strokeRect(iconX + 1, iconY + 1, 24, 24);
        ctx.fillStyle = '#000080';
        ctx.font      = 'bold 18px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('i', iconX + 13, iconY + 19);

        // Dialogue Body Text with Universal Multilingual Wrapping
        const currentText  = this.fullText.substring(0, this.displayedLen);
        ctx.fillStyle      = '#000000';
        ctx.font           = '13px Tahoma, "MS Sans Serif", "MS PGothic", "Noto Sans JP", sans-serif';
        ctx.textAlign      = 'left';

        const textStartX   = boxX + 54;
        const maxLineWidth = boxW - 72;
        let line           = '';
        let lineY          = boxY + 50;

        const isCjk = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uffef\u4e00-\u9faf]/.test(this.fullText);

        if (isCjk) {
            for (let i = 0; i < currentText.length; i++) {
                const char = currentText[i];
                const test = line + char;
                if (ctx.measureText(test).width > maxLineWidth) {
                    ctx.fillText(line, textStartX, lineY);
                    line   = char;
                    lineY += 20;
                } else {
                    line = test;
                }
            }
            if (line) ctx.fillText(line, textStartX, lineY);
        } else {
            const words = currentText.split(' ');
            for (let i = 0; i < words.length; i++) {
                const testLine  = line + words[i] + ' ';
                const testWidth = ctx.measureText(testLine).width;
                if (testWidth > maxLineWidth && i > 0) {
                    ctx.fillText(line, textStartX, lineY);
                    line   = words[i] + ' ';
                    lineY += 18;
                } else {
                    line = testLine;
                }
            }
            if (line) ctx.fillText(line, textStartX, lineY);
        }

        // Raised Win98 [ OK ] Button at Bottom Right
        const btnW = 92;
        const btnH = 24;
        const btnX = boxX + boxW - btnW - 14;
        const btnY = boxY + boxH - btnH - 10;

        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(btnX, btnY, btnW, btnH);
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth   = 1;
        ctx.strokeRect(btnX + 0.5, btnY + 0.5, btnW - 1, btnH - 1);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(btnX + 1, btnY + 1, btnW - 3, 1);
        ctx.fillRect(btnX + 1, btnY + 1, 1, btnH - 3);
        ctx.fillStyle = '#808080';
        ctx.fillRect(btnX + 1, btnY + btnH - 2, btnW - 2, 1);
        ctx.fillRect(btnX + btnW - 2, btnY + 1, 1, btnH - 2);

        ctx.fillStyle = '#000000';
        ctx.font      = 'bold 11px Tahoma, "MS Sans Serif", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.isTyping ? '...' : 'OK [E / Space]', btnX + Math.round(btnW * 0.5), btnY + 16);
    }
}

export const dialogSystem = new DialogSystem();

