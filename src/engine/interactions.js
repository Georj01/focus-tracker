// World Interactions & Seating System
// Manages proximity triggers, desk study seating, and prop interactions

import { sound } from './audio.js';
import { dialogSystem } from './dialog.js';
import { scenarioConfigs } from './scenarios.js';

const INSPIRATIONAL_QUOTES = [
    '"The secret of getting ahead is getting started." — Mark Twain',
    '"Focus is a muscle. The more you practice without distraction, the stronger it gets."',
    '"Do what you can, with what you have, where you are." — Theodore Roosevelt',
    '"Small disciplines repeated with consistency every day lead to great achievements."',
    '"You don’t have to see the whole staircase, just take the first step."'
];

const NPC_DIALOGUES = [
    '"Hey! Let\'s stay locked in and finish this study cycle together!"',
    '"Remember to stay hydrated! That timer will be done before you know it."',
    '"I just checked off my third task. Steady progress wins the day!"',
    '"Deep focus is a superpower. Keep going, you\'re doing great!"',
    '"Taking short breaks keeps your brain fresh. Good luck with this session!"'
];

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
                label:  '[E] Stand Up',
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
                        label: '[E] Sit & Study',
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
                    label: '[E] Brew Fresh Coffee ☕',
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
                        label: '[E] Read Study Wisdom 📚',
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
                        label: '[E] Mindful Meditation 🌸',
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
                    label: `[E] Talk to ${npc.id}`,
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
                dialogSystem.show('Study Desk', 'You sat down at the desk. Study materials ready. Deep work mode active!');
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
                dialogSystem.show('Espresso Bar', 'You poured a hot cup of fresh espresso! Motivation and alertness refreshed.');
                break;
            }
            case 'bookshelf': {
                const quote = INSPIRATIONAL_QUOTES[Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)];
                dialogSystem.show('Library Archives', quote);
                break;
            }
            case 'zen': {
                dialogSystem.show('Zen Stone Lantern', 'You pause for a mindful breath amidst the tranquil garden. Serenity restored.');
                break;
            }
            case 'npc': {
                const line = NPC_DIALOGUES[Math.floor(Math.random() * NPC_DIALOGUES.length)];
                dialogSystem.show(interaction.npc.id, line);
                break;
            }
        }
    }

    drawPrompt(ctx, interaction) {
        if (!interaction || dialogSystem.isOpen) return;

        ctx.font        = 'bold 11px Courier New';
        const textWidth = ctx.measureText(interaction.label).width;
        const boxW      = textWidth + 16;
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
