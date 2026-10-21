// World Interactions & Seating System
// Manages proximity triggers, desk study seating, and prop interactions with multilingual support

import { sound } from './audio.js';
import { dialogSystem } from './dialog.js';
import { scenarioConfigs } from './scenarios.js';
import { i18n } from './i18n.js';

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

export const interactionManager = new InteractionManager();
