// Pomodoro World 2D - Standalone Bundle (Zero CORS, 100% Offline, Native file:// compatible)
// Auto-generated via: node src/build-bundle.js
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

    if (typeof window !== 'undefined') {
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
    }

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

        // Update camera to center target while keeping integer pixel alignment (zero sprite blur)
        update(targetX, targetY, targetWidth = 36, targetHeight = 39, worldWidth = 1200, worldHeight = 800) {
            if (this.viewportWidth >= worldWidth) {
                this.x = Math.round((worldWidth - this.viewportWidth) * 0.5);
            } else {
                const desiredX = targetX - (this.viewportWidth - targetWidth) * 0.5;
                this.x = Math.round(Math.max(0, Math.min(worldWidth - this.viewportWidth, desiredX)));
            }

            if (this.viewportHeight >= worldHeight) {
                this.y = Math.round((worldHeight - this.viewportHeight) * 0.5);
            } else {
                const desiredY = targetY - (this.viewportHeight - targetHeight) * 0.5;
                this.y = Math.round(Math.max(0, Math.min(worldHeight - this.viewportHeight, desiredY)));
            }
        }
    }

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
            ambientFire:       'Cozy Fireplace 🔥',
            ambientBinaural:   'Deep Focus Binaural 🎧',

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
            statTotalFocus:    'Total Focus',
            statWeeklyTitle:   '7-Day Focus History (min)',

            // Tasks
            focusTasks:        '📋 Focus Tasks',
            taskPlaceholder:   'What are you focusing on?',
            addTask:           '+ Add',
            taskTip:           'Click task to pin • Click 🍅 to adjust target • ✓ to complete',
            defaultTask:       'Deep work session',
            currentFocus:      'CURRENT FOCUS',
            tasksButton:       '📋 Tasks (T)',
            taskEstTitle:      'Target Pomodoros (click to cycle 1-8)',

            // HUD Controls
            hudPause:          '⏸ Pause',
            hudResume:         '▶ Resume',
            hudSkip:           '⏭ Skip',
            hudAudio:          '🔊 Audio',
            hudMuted:          '🔇 Muted',

            // Controls Legend Bar
            legendMove:        '[WASD / Click] Move',
            legendInteract:    '[E / Click] Sit & Interact',
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
            promptPet:         '[E] Pet',

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
            ],

            npcBreakDialogues: [
                '"Ahh, break time! Stretching my legs and grabbing a fresh espresso."',
                '"Great focus session! Make sure to rest your eyes for a few minutes."',
                '"Nothing beats a quick breather after a solid block of deep work!"'
            ],

            catDialogues: [
                'Purrr... The cafe cat leans softly into your hand and blinks slowly.',
                'Meow~ It curls up peacefully near the desks, keeping the cafe calm.',
                'Purrr... Soft whiskers twitch happily. Back to cozy focus!'
            ],

            dogDialogues: [
                'Woof~ The cafe pup wags its tail gently and settles quietly by your feet.',
                '*Gentle sniff* A warm, calm friend cheering on your study session.',
                'The cafe dog gives a quiet happy sigh and rests peacefully on the warm floor.'
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
            ambientFire:       'Chimenea Cálida 🔥',
            ambientBinaural:   'Enfoque Binaural 🎧',

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
            statTotalFocus:    'Enfoque Total',
            statWeeklyTitle:   'Historial de 7 Días (min)',

            // Tasks
            focusTasks:        '📋 Tareas de Enfoque',
            taskPlaceholder:   '¿En qué te vas a enfocar?',
            addTask:           '+ Añadir',
            taskTip:           'Clic en tarea para fijar • Clic en 🍅 para meta • ✓ completar',
            defaultTask:       'Sesión de trabajo profundo',
            currentFocus:      'ENFOQUE ACTUAL',
            tasksButton:       '📋 Tareas (T)',
            taskEstTitle:      'Pomodoros objetivo (clic para cambiar 1-8)',

            // HUD Controls
            hudPause:          '⏸ Pausar',
            hudResume:         '▶ Reanudar',
            hudSkip:           '⏭ Saltar',
            hudAudio:          '🔊 Audio',
            hudMuted:          '🔇 Silencio',

            // Controls Legend Bar
            legendMove:        '[WASD / Clic] Mover',
            legendInteract:    '[E / Clic] Sentarse / Interactuar',
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
            promptPet:         '[E] Acariciar a',

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
            ],

            npcBreakDialogues: [
                '"¡Hora de descansar! Estirando las piernas y tomando un café recién hecho."',
                '"¡Gran sesión de enfoque! Asegúrate de descansar la vista unos minutos."',
                '"¡Nada como un respiro después de un buen bloque de concentración!"'
            ],

            catDialogues: [
                'Mrrr... El gatito de la cafetería se acurruca suavemente y parpadea tranquilo.',
                'Miau~ Se queda descansando en paz cerca de los escritorios.',
                'Prrr... Un ronroneo suave te devuelve la calma para seguir enfocado.'
            ],

            dogDialogues: [
                'Guau~ El perrito mueve la cola despacio y se acomoda tranquilo a tu lado.',
                '*Olfateo suave* Un amigo tranquilo te acompaña mientras estudias.',
                'El perrito de la cafetería suspira feliz y descansa en el suelo cálido.'
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
            ambientFire:       '暖炉の焚き火 🔥',
            ambientBinaural:   '集中バイノーラル 🎧',

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
            statTotalFocus:    '累計集中時間',
            statWeeklyTitle:   '過去7日間の集中記録（分）',

            // Tasks
            focusTasks:        '📋 集中タスク',
            taskPlaceholder:   '何に集中しますか？',
            addTask:           '+ 追加',
            taskTip:           'クリックで固定 • 🍅で目標変更 • ✓で完了',
            defaultTask:       'ディープワークセッション',
            currentFocus:      '現在の集中タスク',
            tasksButton:       '📋 タスク (T)',
            taskEstTitle:      '目標ポモドーロ数（クリックで1〜8に変更）',

            // HUD Controls
            hudPause:          '⏸ 一時停止',
            hudResume:         '▶ 再開',
            hudSkip:           '⏭ スキップ',
            hudAudio:          '🔊 音声',
            hudMuted:          '🔇 ミュート',

            // Controls Legend Bar
            legendMove:        '[WASD / クリック] 移動',
            legendInteract:    '[E / クリック] 座る・調べる',
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
            promptPet:         '[E] なでる:',

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
            ],

            npcBreakDialogues: [
                '「休憩タイムだね！少し背伸びをしてコーヒーを飲んでくるよ。」',
                '「いい集中だったね！目を少し休めてリフレッシュしよう。」',
                '「集中した後の小休憩は最高だね！」'
            ],

            catDialogues: [
                'ごろごろ… カフェの猫がやさしく目を細めて喉を鳴らしています。',
                'にゃ〜 デスクの近くでのんびり丸くなっています。',
                'ごろごろ… 穏やかな癒やしで、また静かに集中できそう。'
            ],

            dogDialogues: [
                'わん〜 カフェの犬がゆっくりしっぽを振って足元でくつろいでいます。',
                '静かに寄り添って、あなたの集中タイムを見守ってくれています。',
                '安心したようにふぅと息をついて、床でのんびり休んでいます。'
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

        getRandomNpcDialogue(isBreak = false) {
            const key = isBreak ? 'npcBreakDialogues' : 'npcDialogues';
            const dialogues = this.t(key) || TRANSLATIONS.en[key];
            return dialogues[Math.floor(Math.random() * dialogues.length)];
        }

        getRandomPetDialogue(species = 'cat') {
            const key = species === 'dog' ? 'dogDialogues' : 'catDialogues';
            const dialogues = this.t(key) || TRANSLATIONS.en[key];
            return dialogues[Math.floor(Math.random() * dialogues.length)];
        }
    }
    const i18n = new I18nManager();

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
            this.ambientType   = 'off'; // 'off' | 'rain' | 'cafe' | 'fire' | 'binaural'

            // Active ambient audio nodes
            this.ambientSource = null;
            this.ambientGain   = null;
            this.ambientFilter = null;
            this.extraNodes    = [];

            this.loadSettings();
        }

        initContext() {
            if (!this.ctx && typeof window !== 'undefined') {
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
                    if (['off', 'rain', 'cafe', 'fire', 'binaural'].includes(cfg.ambientType)) {
                        this.ambientType = cfg.ambientType;
                    }
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
                this.ambientGain.gain.setValueAtTime(this.ambientVolume * this.masterVolume * 0.25, this.ctx.currentTime);
            }
        }

        setAmbientType(type) {
            if (!['off', 'rain', 'cafe', 'fire', 'binaural'].includes(type)) return;
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
                case 'pet_cat': {
                    // Soft gentle purr-chime
                    [520, 660].forEach((f, i) => {
                        const osc  = actx.createOscillator();
                        const gain = actx.createGain();
                        osc.type   = 'sine';
                        osc.frequency.setValueAtTime(f, now + i * 0.09);
                        osc.frequency.linearRampToValueAtTime(f * 1.08, now + i * 0.09 + 0.1);
                        gain.gain.setValueAtTime(vol * 0.08, now + i * 0.09);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.14);
                        osc.connect(gain);
                        gain.connect(actx.destination);
                        osc.start(now + i * 0.09);
                        osc.stop(now + i * 0.09 + 0.15);
                    });
                    break;
                }
                case 'pet_dog': {
                    // Soft warm friendly tail-wag tone
                    [280, 360].forEach((f, i) => {
                        const osc  = actx.createOscillator();
                        const gain = actx.createGain();
                        osc.type   = 'triangle';
                        osc.frequency.setValueAtTime(f, now + i * 0.08);
                        osc.frequency.exponentialRampToValueAtTime(f * 0.78, now + i * 0.08 + 0.09);
                        gain.gain.setValueAtTime(vol * 0.09, now + i * 0.08);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.1);
                        osc.connect(gain);
                        gain.connect(actx.destination);
                        osc.start(now + i * 0.08);
                        osc.stop(now + i * 0.08 + 0.11);
                    });
                    break;
                }
            }
        }

        // ------------------------------------------------------------------------
        // Procedural Ambient Soundscapes (Rain / Cafe / Fireplace / Binaural)
        // ------------------------------------------------------------------------
        startAmbient(type) {
            this.stopAmbient();
            if (this.isMuted || this.masterVolume <= 0) return;

            const actx = this.initContext();
            if (!actx) return;

            // Generate 3 seconds of noise buffer looped seamlessly
            const bufferSize  = actx.sampleRate * 3;
            const noiseBuffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
            const output      = noiseBuffer.getChannelData(0);

            let lastOut = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                if (type === 'rain') {
                    lastOut   = (lastOut * 0.95) + (white * 0.05);
                    output[i] = lastOut * 3.0;
                } else if (type === 'fire') {
                    // Warm hearth rumble with random wood crackle impulses
                    lastOut       = (lastOut * 0.985) + (white * 0.015);
                    const crackle = Math.random() > 0.9994 ? (Math.random() * 2 - 1) * 0.9 : 0;
                    output[i]     = (lastOut * 4.2) + crackle;
                } else {
                    // Warm cafe murmur / soft background pad
                    lastOut   = (lastOut * 0.98) + (white * 0.02);
                    output[i] = lastOut * (type === 'binaural' ? 1.8 : 4.0);
                }
            }

            const noise  = actx.createBufferSource();
            noise.buffer = noiseBuffer;
            noise.loop   = true;

            const filter = actx.createBiquadFilter();
            if (type === 'rain') {
                filter.type            = 'lowpass';
                filter.frequency.value = 850;
                filter.Q.value         = 1.2;
            } else if (type === 'fire') {
                filter.type            = 'lowpass';
                filter.frequency.value = 620;
                filter.Q.value         = 0.9;
            } else {
                filter.type            = 'bandpass';
                filter.frequency.value = type === 'binaural' ? 320 : 450;
                filter.Q.value         = 0.8;
            }

            const gainNode = actx.createGain();
            gainNode.gain.setValueAtTime(this.ambientVolume * this.masterVolume * 0.25, actx.currentTime);

            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(actx.destination);

            noise.start();

            // Add subtle 10Hz alpha-wave binaural carrier pair (200Hz & 210Hz) for deep focus
            if (type === 'binaural') {
                [200, 210].forEach(freq => {
                    const osc     = actx.createOscillator();
                    const oscGain = actx.createGain();
                    osc.type      = 'sine';
                    osc.frequency.setValueAtTime(freq, actx.currentTime);
                    oscGain.gain.setValueAtTime(0.18, actx.currentTime);
                    osc.connect(oscGain);
                    oscGain.connect(gainNode);
                    osc.start();
                    this.extraNodes.push(osc, oscGain);
                });
            }

            this.ambientSource = noise;
            this.ambientFilter = filter;
            this.ambientGain   = gainNode;
        }

        stopAmbient() {
            if (this.extraNodes && this.extraNodes.length) {
                this.extraNodes.forEach(node => {
                    try {
                        if (typeof node.stop === 'function') node.stop();
                        node.disconnect();
                    } catch (_) {}
                });
                this.extraNodes = [];
            }
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
    // Crisp Minimalist Pixel Art Engine (Uniform 3x Integer Pixel Grid)
    const PIXEL_SCALE = 3;
    const PALETTE = {
        '_': null,          // Transparent
        '0': '#181818',     // Crisp pixel ink outline
        '1': '#ffd1a9',     // Warm peach skin
        '2': '#3b82f6',     // Primary shirt / outfit (dynamically overridden)
        '3': '#263959',     // Dark navy pants
        '4': '#cc3333',     // Red shoes / accent
        '5': '#ffffff',     // Pure white (pages, mug, CRT highlight)
        '6': '#d93838',     // Cap / primary accent (dynamically overridden)
        '7': '#422818',     // Dark brown hair / trunk
        '8': '#e8b94f',     // Blonde hair / warm oak highlight / gold
        '9': '#9e6637',     // Clean oak wood
        'A': '#5e3618',     // Wood shadow / legs
        'B': '#2f8f4e',     // Clean leaf green
        'C': '#6bd482',     // Bright leaf highlight
        'D': '#4fc3f7',     // Retro CRT cyan screen
        'E': '#c8ccd0',     // Classic Win98 beige-gray / stone light
        'F': '#e874b0',     // Pink dress / ribbon
        'G': '#ffe259',     // Warm lamp / lantern yellow
        'H': '#c45b33',     // Terracotta pot / coffee
        'I': '#747c86'      // Metal / stone shadow
    };
    const SPRITES = {
        // ------------------------------------------------------------------------
        // 1. SIMPLE HERO SPRITES (12x13 -> 36x39 px at 3x scale)
        // ------------------------------------------------------------------------
        CHAR_DOWN_IDLE: [
            '___000000___',
            '__06666660__',
            '__06666660__',
            '__01111110__',
            '__01011010__',
            '__01111110__',
            '___000000___',
            '__02222220__',
            '_0102222010_',
            '__02222220__',
            '__03300330__',
            '__04400440__',
            '___00__00___'
        ],
        CHAR_DOWN_WALK_1: [
            '___000000___',
            '__06666660__',
            '__06666660__',
            '__01111110__',
            '__01011010__',
            '__01111110__',
            '___000000___',
            '__02222220__',
            '_010222200__',
            '__0222222010',
            '__03300330__',
            '__0440_00___',
            '___00_______'
        ],
        CHAR_DOWN_WALK_2: [
            '___000000___',
            '__06666660__',
            '__06666660__',
            '__01111110__',
            '__01011010__',
            '__01111110__',
            '___000000___',
            '__02222220__',
            '__002222010_',
            '0102222220__',
            '__03300330__',
            '___00_0440__',
            '_______00___'
        ],
        CHAR_UP_IDLE: [
            '___000000___',
            '__06666660__',
            '__06666660__',
            '__07777770__',
            '__07777770__',
            '__07777770__',
            '___000000___',
            '__02222220__',
            '_0102222010_',
            '__02222220__',
            '__03300330__',
            '__04400440__',
            '___00__00___'
        ],
        CHAR_UP_WALK_1: [
            '___000000___',
            '__06666660__',
            '__06666660__',
            '__07777770__',
            '__07777770__',
            '__07777770__',
            '___000000___',
            '__02222220__',
            '_010222200__',
            '__0222222010',
            '__03300330__',
            '__0440_00___',
            '___00_______'
        ],
        CHAR_UP_WALK_2: [
            '___000000___',
            '__06666660__',
            '__06666660__',
            '__07777770__',
            '__07777770__',
            '__07777770__',
            '___000000___',
            '__02222220__',
            '__002222010_',
            '0102222220__',
            '__03300330__',
            '___00_0440__',
            '_______00___'
        ],
        CHAR_SIDE_IDLE: [
            '___000000___',
            '__06666660__',
            '_066666660__',
            '__01111770__',
            '__01011770__',
            '__01111770__',
            '___000000___',
            '___022220___',
            '___021120___',
            '___022220___',
            '___033330___',
            '___044440___',
            '____0000____'
        ],
        CHAR_SIDE_WALK_1: [
            '___000000___',
            '__06666660__',
            '_066666660__',
            '__01111770__',
            '__01011770__',
            '__01111770__',
            '___000000___',
            '___022220___',
            '__0122220___',
            '___022220___',
            '__03300330__',
            '__04400440__',
            '___00__00___'
        ],
        CHAR_SIDE_WALK_2: [
            '___000000___',
            '__06666660__',
            '_066666660__',
            '__01111770__',
            '__01011770__',
            '__01111770__',
            '___000000___',
            '___022220___',
            '___022210___',
            '___022220___',
            '___033330___',
            '___044440___',
            '____0000____'
        ],

        // Seated studying pose (facing left; flipX=true faces right)
        CHAR_SIT: [
            '___000000___',
            '__06666660__',
            '_066666660__',
            '__01111770__',
            '__01011770__',
            '__01111770__',
            '___000000___',
            '___022220___',
            '__0122220___',
            '___022220___',
            '__0333330___',
            '__0440000___',
            '___00_______'
        ],

        // ------------------------------------------------------------------------
        // 2. SIMPLE NPC VARIANTS (12x13 -> 36x39 px at 3x scale)
        // ------------------------------------------------------------------------
        NPC_SCHOLAR: [
            '___000000___',
            '__08888880__',
            '__08888880__',
            '__01111110__',
            '__00500500__',
            '__01111110__',
            '___000000___',
            '__02222220__',
            '_0102222010_',
            '__02222220__',
            '__03300330__',
            '__07700770__',
            '___00__00___'
        ],
        NPC_GIRL: [
            '___000000___',
            '__07777770__',
            '_0777777770_',
            '_0711111170_',
            '_0710110170_',
            '_0711111170_',
            '___000000___',
            '__02222220__',
            '_0102222010_',
            '_0222222220_',
            '__01100110__',
            '__04400440__',
            '___00__00___'
        ],

        // ------------------------------------------------------------------------
        // 3. SIMPLE CRISP FURNITURE & PROPS (Native Aspect Ratios at 3x Scale!)
        // ------------------------------------------------------------------------
        // Wooden Chair (10x12 -> 30x36 px, facing right; flipX=true faces left)
        CHAIR: [
            '__0000____',
            '__0990____',
            '__0980____',
            '__0990____',
            '__0990000_',
            '__0999990_',
            '__0988890_',
            '__0AAAAA0_',
            '__0000000_',
            '__0A0_0A0_',
            '__0A0_0A0_',
            '__000_000_'
        ],

        // Clean Wooden Desk (32x18 -> 96x54 px)
        DESK_WOOD: [
            '00000000000000000000000000000000',
            '08888888888888888888888888888880',
            '09999999999999999999999999999990',
            '09999999999999999999999999999990',
            '09999999999999999999999999999990',
            '09999999999999999999999999999990',
            '09999999999999999999999999999990',
            '09999999999999999999999999999990',
            '09999999999999999999999999999990',
            '09999999999999999999999999999990',
            '0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0',
            '00000000000000000000000000000000',
            '0AA0________________________0AA0',
            '0990________________________0990',
            '0990________________________0990',
            '0990________________________0990',
            '0AA0________________________0AA0',
            '0000________________________0000'
        ],

        // Desk with Classic Retro CRT PC + Coffee Mug (32x18 -> 96x54 px)
        DESK_LAPTOP: [
            '00000000000000000000000000000000',
            '08888888800000000008888888888880',
            '099999990EEEEEEEEEE0999999999990',
            '099999990E00000000E0999900009990',
            '099999990E0DDDDDD0E099905HH50090',
            '099999990E0D5DDDD0E0999055550500',
            '099999990E0DDDDDD0E0999055550090',
            '099999990E00000000E0999900009990',
            '099999990000IIII0000999999999990',
            '09999990EEEEEEEEEEEE099999999990',
            '0AAAAAA00000000000000AAAAAAAAAA0',
            '00000000000000000000000000000000',
            '0AA0________________________0AA0',
            '0990________________________0990',
            '0990________________________0990',
            '0990________________________0990',
            '0AA0________________________0AA0',
            '0000________________________0000'
        ],

        // Desk with Open Book + Simple Golden Lamp (32x18 -> 96x54 px)
        DESK_BOOK: [
            '00000000000000000000000000000000',
            '08888888888888888888888888888880',
            '09900009999999999999999999999990',
            '090GGGG0999000000000000999999990',
            '090GGGG0990555550055555099999990',
            '099000099905III5005III5099999990',
            '09990I09990555550055555099999990',
            '0990III09905III5005III5099999990',
            '09900000990555550055555099999990',
            '09999999999000000000000999999990',
            '0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0',
            '00000000000000000000000000000000',
            '0AA0________________________0AA0',
            '0990________________________0990',
            '0990________________________0990',
            '0990________________________0990',
            '0AA0________________________0AA0',
            '0000________________________0000'
        ],

        // Simple Potted Plant (12x14 -> 36x42 px)
        PLANT: [
            '____0000____',
            '__00CCCC00__',
            '_0CCBBBBCC0_',
            '_0CBBBBBBC0_',
            '0CBBBBBBBB0_',
            '0BBBBBBBBB0_',
            '_0BBBBBBB0__',
            '__0007700___',
            '____0770____',
            '__00000000__',
            '__0HHHHHH0__',
            '___0HHHH0___',
            '___0HHHH0___',
            '____0000____'
        ],

        // Simple Zen Stone Lantern (12x16 -> 36x48 px)
        ZEN_LANTERN: [
            '____0000____',
            '__00EEEE00__',
            '_0EEEEEEEE0_',
            '_0000000000_',
            '___0GGGG0___',
            '___0G55G0___',
            '___0GGGG0___',
            '___000000___',
            '____0EE0____',
            '____0EI0____',
            '____0EI0____',
            '___00EE00___',
            '__0EEEEEE0__',
            '__0IIIIII0__',
            '__00000000__',
            '____________'
        ],

        // Simple Zen Stepping Stone (14x9 -> 42x27 px)
        ZEN_STONE: [
            '___00000000___',
            '_00EEEEEEEE00_',
            '0EEEEEEEEEEEE0',
            '0EE55EEEEEEEE0',
            '0EEEEEEEEEEEE0',
            '0EEEEEEEEEEEE0',
            '0IIIIIIIIIIII0',
            '_00IIIIIIII00_',
            '___00000000___'
        ],

        // Counter Props (native 3x scale!)
        PROP_ESPRESSO: [
            '_0000000000_',
            '_0EEEEEEEE0_',
            '_0E0DDDD0E0_',
            '_0E000000E0_',
            '_0E00HH00E0_',
            '_0E005500E0_',
            '_0IIIIIIII0_',
            '_0000000000_'
        ],
        PROP_MUG: [
            '_0000_',
            '05HH50',
            '055550',
            '055550',
            '_0000_'
        ],
        PROP_TEAPOT: [
            '___0000___',
            '__0BBBB0__',
            '00BBBBBB00',
            '0BBBBBBBB0',
            '_0BBBBBB0_',
            '__000000__'
        ],
        PROP_BOOKS: [
            '0000000000',
            '0666666660',
            '0000000000',
            '0222222220',
            '0000000000',
            '0888888880',
            '0000000000'
        ],

        // ------------------------------------------------------------------------
        // 4. CAFETERIA PETS: SIMPLE CATS & DOGS (10x9 -> 30x27 px at 3x scale)
        // ------------------------------------------------------------------------
        CAT_IDLE: [
            '_____0__0_',
            '____020020',
            '_00_022220',
            '020_022020',
            '0200022220',
            '_02222660_',
            '_02222220_',
            '_020__020_',
            '_000__000_'
        ],
        CAT_WALK_1: [
            '_____0__0_',
            '____020020',
            '00__022220',
            '020_022020',
            '_000022220',
            '_02222660_',
            '_02222220_',
            '020____020',
            '000____000'
        ],
        CAT_WALK_2: [
            '_____0__0_',
            '____020020',
            '_00_022220',
            '020_022020',
            '0200022220',
            '_02222660_',
            '_02222220_',
            '__020020__',
            '__000000__'
        ],
        CAT_SLEEP: [
            '__________',
            '__________',
            '__________',
            '____0__0__',
            '__0020020_',
            '_022222220',
            '0222222020',
            '0222222220',
            '_00000000_'
        ],
        DOG_IDLE: [
            '____0000__',
            '___027220_',
            '___0272020',
            '00_0272220',
            '0200222000',
            '_02222660_',
            '_02222220_',
            '_020__020_',
            '_000__000_'
        ],
        DOG_WALK_1: [
            '____0000__',
            '___027220_',
            '___0272020',
            '_000272220',
            '_020222000',
            '_02222660_',
            '_02222220_',
            '020____020',
            '000____000'
        ],
        DOG_WALK_2: [
            '____0000__',
            '___027220_',
            '___0272020',
            '00_0272220',
            '0200222000',
            '_02222660_',
            '_02222220_',
            '__020020__',
            '__000000__'
        ],
        DOG_SLEEP: [
            '__________',
            '__________',
            '__________',
            '___00000__',
            '_00227220_',
            '0222272020',
            '0222222220',
            '0222222220',
            '_00000000_'
        ]
    };

    // Offscreen Canvas Cache: O(1) crisp integer nearest-neighbor blitting
    const spriteCache = new WeakMap();
    function drawPixelSprite(ctx, spriteData, x, y, width, height, mainColor = null, accentColor = null, flipX = false) {
        if (!spriteData || !spriteData.length) return;

        const rows  = spriteData.length;
        const cols  = spriteData[0].length;
        const scale = width ? Math.max(1, Math.round(width / cols)) : PIXEL_SCALE;

        let variantMap = spriteCache.get(spriteData);
        if (!variantMap) {
            variantMap = new Map();
            spriteCache.set(spriteData, variantMap);
        }

        const cacheKey = `${scale}|${mainColor || ''}|${accentColor || ''}|${flipX ? 1 : 0}`;
        let offscreen  = variantMap.get(cacheKey);

        if (!offscreen && typeof document !== 'undefined') {
            offscreen        = document.createElement('canvas');
            offscreen.width  = cols * scale;
            offscreen.height = rows * scale;
            const octx       = offscreen.getContext('2d');
            octx.imageSmoothingEnabled = false;

            for (let r = 0; r < rows; r++) {
                const rowStr = spriteData[r];
                for (let c = 0; c < cols; c++) {
                    const colIdx = flipX ? (cols - 1 - c) : c;
                    const val    = rowStr[colIdx];
                    if (val === '_') continue;

                    let color = PALETTE[val];
                    if (!color) continue;

                    if (val === '2' && mainColor)   color = mainColor;
                    if (val === '6' && accentColor) color = accentColor;

                    octx.fillStyle = color;
                    octx.fillRect(c * scale, r * scale, scale, scale);
                }
            }
            variantMap.set(cacheKey, offscreen);
        }

        if (offscreen) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(offscreen, Math.round(x), Math.round(y));
        }
    }

    // Crisp modular pixel-art counter (no sprite stretching!)
    function drawPixelCounter(ctx, x, y, w, h, mapKey) {
        const p  = PIXEL_SCALE;
        const rx = Math.round(x);
        const ry = Math.round(y);
        const rw = Math.round(w);
        const rh = Math.round(h);

        // Outer black pixel outline
        ctx.fillStyle = PALETTE['0'];
        ctx.fillRect(rx, ry, rw, rh);

        // Countertop surface (top half)
        const topH = Math.floor(rh * 0.48);
        ctx.fillStyle = PALETTE['9'];
        ctx.fillRect(rx + p, ry + p, rw - p * 2, topH - p);
        // Top highlight strip
        ctx.fillStyle = PALETTE['8'];
        ctx.fillRect(rx + p, ry + p, rw - p * 2, p);
        // Countertop front lip
        ctx.fillStyle = PALETTE['A'];
        ctx.fillRect(rx + p, ry + topH - p, rw - p * 2, p);
        ctx.fillStyle = PALETTE['0'];
        ctx.fillRect(rx, ry + topH, rw, p);

        // Front wooden panel
        const frontY = ry + topH + p;
        const frontH = rh - topH - p * 2;
        ctx.fillStyle = PALETTE['9'];
        ctx.fillRect(rx + p, frontY, rw - p * 2, frontH);
        ctx.fillStyle = PALETTE['A'];
        ctx.fillRect(rx + p, ry + rh - p * 2, rw - p * 2, p);

        // Subtle vertical panel slats on uniform pixel grid
        for (let sx = rx + p * 8; sx < rx + rw - p * 6; sx += p * 12) {
            ctx.fillStyle = PALETTE['A'];
            ctx.fillRect(sx, frontY + p, p, Math.max(p, frontH - p * 2));
        }

        // Native 3x pixel props placed neatly on top of the counter
        if (mapKey === 'cafeteria') {
            drawPixelSprite(ctx, SPRITES.PROP_ESPRESSO, rx + 24, ry + 3, 36, 24);
            drawPixelSprite(ctx, SPRITES.PROP_MUG, rx + 78, ry + 9, 18, 15);
            drawPixelSprite(ctx, SPRITES.PROP_MUG, rx + rw - 66, ry + 9, 18, 15);
        } else if (mapKey === 'library') {
            drawPixelSprite(ctx, SPRITES.PROP_BOOKS, rx + 28, ry + 6, 30, 21);
            drawPixelSprite(ctx, SPRITES.PROP_BOOKS, rx + rw - 64, ry + 6, 30, 21);
        } else {
            drawPixelSprite(ctx, SPRITES.PROP_TEAPOT, rx + 28, ry + 6, 30, 18);
            drawPixelSprite(ctx, SPRITES.PROP_MUG, rx + rw - 54, ry + 9, 18, 15);
        }
    }

    // Crisp modular pixel-art bookshelf (tiling clean book blocks with zero stretching!)
    function drawPixelBookshelf(ctx, x, y, w, h) {
        const p  = PIXEL_SCALE;
        const rx = Math.round(x);
        const ry = Math.round(y);
        const rw = Math.round(w);
        const rh = Math.round(h);
        const bookColors = [PALETTE['6'], PALETTE['2'], PALETTE['B'], PALETTE['8'], PALETTE['F']];

        ctx.fillStyle = PALETTE['0'];
        ctx.fillRect(rx, ry, rw, rh);
        ctx.fillStyle = PALETTE['9'];
        ctx.fillRect(rx + p, ry + p, rw - p * 2, rh - p * 2);

        const isHorizontal = rw >= rh;
        if (isHorizontal) {
            const shelfH = p * 5;
            let idx = 0;
            for (let sy = ry + p * 2; sy + p * 3 <= ry + rh - p; sy += shelfH) {
                ctx.fillStyle = PALETTE['A'];
                ctx.fillRect(rx + p * 2, sy, rw - p * 4, p * 3);
                for (let bx = rx + p * 3; bx + p * 2 <= rx + rw - p * 3; bx += p * 3) {
                    ctx.fillStyle = bookColors[idx % bookColors.length];
                    ctx.fillRect(bx, sy, p * 2, p * 3);
                    idx++;
                }
                ctx.fillStyle = PALETTE['8'];
                ctx.fillRect(rx + p, sy + p * 3, rw - p * 2, p);
            }
        } else {
            const shelfH = p * 7;
            let idx = 0;
            for (let sy = ry + p * 2; sy + p * 5 <= ry + rh - p; sy += shelfH) {
                ctx.fillStyle = PALETTE['A'];
                ctx.fillRect(rx + p * 2, sy, rw - p * 4, p * 4);
                for (let bx = rx + p * 3; bx + p * 2 <= rx + rw - p * 3; bx += p * 3) {
                    ctx.fillStyle = bookColors[idx % bookColors.length];
                    ctx.fillRect(bx, sy + p, p * 2, p * 3);
                    idx++;
                }
                ctx.fillStyle = PALETTE['8'];
                ctx.fillRect(rx + p, sy + p * 4, rw - p * 2, p);
            }
        }
    }

    // ============================================================================
    // Module: src/engine/scenarios.js
    // ============================================================================
    // Map scenario definitions aligned to uniform 3x pixel grid (zero sprite stretching)
    const scenarioConfigs = {
        cafeteria: {
            name:        'Virtual Cafeteria',
            floorType:   'checker',
            floorColor:  '#3a261c',
            tileAccent:  '#473024',
            borderColor: '#b45309',
            wallColor:   '#2b1810',
            gridColor:   'rgba(0, 0, 0, 0.16)',
            themeColor:  '#000080',
            counter:     { x: 438, y: 42, w: 324, h: 54, label: '☕ Onett Espresso Bar' },
            desks: [
                { x: 144, y: 180, w: 96, h: 54, type: 'laptop', label: 'Coffee Desk A' },
                { x: 420, y: 201, w: 96, h: 54, type: 'book',   label: 'Central Table 1' },
                { x: 684, y: 201, w: 96, h: 54, type: 'laptop', label: 'Central Table 2' },
                { x: 960, y: 180, w: 96, h: 54, type: 'book',   label: 'Window Nook' },
                { x: 180, y: 462, w: 96, h: 54, type: 'book',   label: 'Quiet Corner' },
                { x: 480, y: 471, w: 96, h: 54, type: 'laptop', label: 'Study Station A' },
                { x: 780, y: 471, w: 96, h: 54, type: 'book',   label: 'Study Station B' },
                { x: 984, y: 462, w: 96, h: 54, type: 'laptop', label: 'South Window' }
            ],
            chairs: [
                { x: 108,  y: 186, w: 30, h: 36, facing: 'right' },
                { x: 246,  y: 186, w: 30, h: 36, facing: 'left' },
                { x: 384,  y: 207, w: 30, h: 36, facing: 'right' },
                { x: 522,  y: 207, w: 30, h: 36, facing: 'left' },
                { x: 648,  y: 207, w: 30, h: 36, facing: 'right' },
                { x: 786,  y: 207, w: 30, h: 36, facing: 'left' },
                { x: 924,  y: 186, w: 30, h: 36, facing: 'right' },
                { x: 1062, y: 186, w: 30, h: 36, facing: 'left' },
                { x: 144,  y: 468, w: 30, h: 36, facing: 'right' },
                { x: 282,  y: 468, w: 30, h: 36, facing: 'left' },
                { x: 444,  y: 477, w: 30, h: 36, facing: 'right' },
                { x: 582,  y: 477, w: 30, h: 36, facing: 'left' },
                { x: 744,  y: 477, w: 30, h: 36, facing: 'right' },
                { x: 882,  y: 477, w: 30, h: 36, facing: 'left' }
            ],
            plants: [
                { x: 60,   y: 60,  w: 36, h: 42 },
                { x: 1104, y: 60,  w: 36, h: 42 },
                { x: 60,   y: 702, w: 36, h: 42 },
                { x: 1104, y: 702, w: 36, h: 42 },
                { x: 360,  y: 330, w: 36, h: 42 },
                { x: 840,  y: 330, w: 36, h: 42 }
            ]
        },

        library: {
            name:        'Quiet Library',
            floorType:   'parquet',
            floorColor:  '#252a4a',
            tileAccent:  '#2f365e',
            borderColor: '#4f5d95',
            wallColor:   '#181c36',
            gridColor:   'rgba(0, 0, 0, 0.16)',
            themeColor:  '#000080',
            counter:     { x: 438, y: 45, w: 324, h: 54, label: '📚 Twoson Library Archives' },
            bookshelves: [
                { x: 96,   y: 42,  w: 276, h: 45 },
                { x: 828,  y: 42,  w: 276, h: 45 },
                { x: 42,   y: 222, w: 45,  h: 180 },
                { x: 42,   y: 462, w: 45,  h: 180 },
                { x: 1113, y: 222, w: 45,  h: 180 },
                { x: 1113, y: 462, w: 45,  h: 180 }
            ],
            desks: [
                { x: 180, y: 201, w: 96, h: 54, type: 'book',   label: 'Carrel 1' },
                { x: 450, y: 210, w: 96, h: 54, type: 'laptop', label: 'Research Table A' },
                { x: 738, y: 210, w: 96, h: 54, type: 'book',   label: 'Research Table B' },
                { x: 942, y: 201, w: 96, h: 54, type: 'laptop', label: 'Carrel 2' },
                { x: 222, y: 480, w: 96, h: 54, type: 'laptop', label: 'Silent Pod 1' },
                { x: 534, y: 489, w: 96, h: 54, type: 'book',   label: 'Silent Pod 2' },
                { x: 846, y: 480, w: 96, h: 54, type: 'laptop', label: 'Silent Pod 3' }
            ],
            chairs: [
                { x: 144,  y: 207, w: 30, h: 36, facing: 'right' },
                { x: 282,  y: 207, w: 30, h: 36, facing: 'left' },
                { x: 414,  y: 216, w: 30, h: 36, facing: 'right' },
                { x: 552,  y: 216, w: 30, h: 36, facing: 'left' },
                { x: 702,  y: 216, w: 30, h: 36, facing: 'right' },
                { x: 840,  y: 216, w: 30, h: 36, facing: 'left' },
                { x: 906,  y: 207, w: 30, h: 36, facing: 'right' },
                { x: 1044, y: 207, w: 30, h: 36, facing: 'left' },
                { x: 186,  y: 486, w: 30, h: 36, facing: 'right' },
                { x: 324,  y: 486, w: 30, h: 36, facing: 'left' },
                { x: 498,  y: 495, w: 30, h: 36, facing: 'right' },
                { x: 636,  y: 495, w: 30, h: 36, facing: 'left' },
                { x: 810,  y: 486, w: 30, h: 36, facing: 'right' },
                { x: 948,  y: 486, w: 30, h: 36, facing: 'left' }
            ],
            plants: [
                { x: 102,  y: 690, w: 36, h: 42 },
                { x: 1062, y: 690, w: 36, h: 42 },
                { x: 342,  y: 351, w: 36, h: 42 },
                { x: 822,  y: 351, w: 36, h: 42 }
            ]
        },

        garden: {
            name:        'Zen Garden',
            floorType:   'garden',
            floorColor:  '#1d543c',
            tileAccent:  '#246649',
            borderColor: '#2d8a4e',
            wallColor:   '#123828',
            gridColor:   'rgba(0, 0, 0, 0.12)',
            themeColor:  '#008080',
            counter:     { x: 438, y: 45, w: 324, h: 54, label: '🌸 Dalaam Tea Pavilion' },
            lanterns: [
                { x: 162, y: 102, w: 36, h: 48 },
                { x: 1002, y: 102, w: 36, h: 48 },
                { x: 180, y: 660, w: 36, h: 48 },
                { x: 984, y: 660, w: 36, h: 48 }
            ],
            steppingStones: [
                { x: 579, y: 132, w: 42, h: 27 },
                { x: 573, y: 201, w: 42, h: 27 },
                { x: 585, y: 270, w: 42, h: 27 },
                { x: 579, y: 339, w: 42, h: 27 },
                { x: 570, y: 408, w: 42, h: 27 },
                { x: 585, y: 477, w: 42, h: 27 },
                { x: 579, y: 546, w: 42, h: 27 },
                { x: 573, y: 615, w: 42, h: 27 },
                { x: 579, y: 684, w: 42, h: 27 }
            ],
            desks: [
                { x: 180, y: 210, w: 96, h: 54, type: 'laptop', label: 'Bonsai Bench 1' },
                { x: 780, y: 210, w: 96, h: 54, type: 'book',   label: 'Bonsai Bench 2' },
                { x: 222, y: 450, w: 96, h: 54, type: 'book',   label: 'Lantern Arbor A' },
                { x: 744, y: 450, w: 96, h: 54, type: 'laptop', label: 'Lantern Arbor B' },
                { x: 384, y: 621, w: 96, h: 54, type: 'book',   label: 'Stone Rest 1' },
                { x: 702, y: 621, w: 96, h: 54, type: 'laptop', label: 'Stone Rest 2' }
            ],
            chairs: [
                { x: 144, y: 216, w: 30, h: 36, facing: 'right' },
                { x: 282, y: 216, w: 30, h: 36, facing: 'left' },
                { x: 744, y: 216, w: 30, h: 36, facing: 'right' },
                { x: 882, y: 216, w: 30, h: 36, facing: 'left' },
                { x: 186, y: 456, w: 30, h: 36, facing: 'right' },
                { x: 324, y: 456, w: 30, h: 36, facing: 'left' },
                { x: 708, y: 456, w: 30, h: 36, facing: 'right' },
                { x: 846, y: 456, w: 30, h: 36, facing: 'left' },
                { x: 348, y: 627, w: 30, h: 36, facing: 'right' },
                { x: 486, y: 627, w: 30, h: 36, facing: 'left' },
                { x: 666, y: 627, w: 30, h: 36, facing: 'right' },
                { x: 804, y: 627, w: 30, h: 36, facing: 'left' }
            ],
            plants: [
                { x: 78,   y: 81,  w: 36, h: 42 },
                { x: 1086, y: 81,  w: 36, h: 42 },
                { x: 78,   y: 684, w: 36, h: 42 },
                { x: 1086, y: 684, w: 36, h: 42 },
                { x: 342,  y: 321, w: 36, h: 42 },
                { x: 822,  y: 321, w: 36, h: 42 }
            ]
        }
    };
    function getStudySeats(mapKey = 'cafeteria') {
        const config = scenarioConfigs[mapKey] || scenarioConfigs.cafeteria;
        return config.chairs || [];
    }

    const obstacleCache = new Map();
    const floorCache    = new Map();
    function getObstacles(mapKey, width, height) {
        const cacheKey = `${mapKey}|${width}|${height}`;
        const cached   = obstacleCache.get(cacheKey);
        if (cached) return cached;

        const config    = scenarioConfigs[mapKey] || scenarioConfigs.cafeteria;
        const obstacles = [];

        const wallThick = 21;
        obstacles.push({ x: 0, y: 0, w: width, h: wallThick });
        obstacles.push({ x: 0, y: height - wallThick, w: width, h: wallThick });
        obstacles.push({ x: 0, y: 0, w: wallThick, h: height });
        obstacles.push({ x: width - wallThick, y: 0, w: wallThick, h: height });

        if (config.counter) {
            obstacles.push({ x: config.counter.x, y: config.counter.y, w: config.counter.w, h: config.counter.h });
        }
        if (config.bookshelves) {
            config.bookshelves.forEach(b => obstacles.push({ x: b.x, y: b.y, w: b.w, h: b.h }));
        }
        if (config.desks) {
            config.desks.forEach(d => obstacles.push({ x: d.x, y: d.y, w: d.w, h: d.h }));
        }
        if (config.plants) {
            config.plants.forEach(p => obstacles.push({ x: p.x + 3, y: p.y + 6, w: p.w - 6, h: p.h - 9 }));
        }
        if (config.lanterns) {
            config.lanterns.forEach(l => obstacles.push({ x: l.x, y: l.y, w: l.w, h: l.h }));
        }

        obstacleCache.set(cacheKey, obstacles);
        return obstacles;
    }

    // Render crisp flat pixel tiles onto offscreen canvas cache
    function renderScenarioFloor(ctx, width, height, mapKey = 'cafeteria') {
        const cacheKey = `${mapKey}|${width}|${height}`;
        let offscreen  = floorCache.get(cacheKey);

        if (!offscreen && typeof document !== 'undefined') {
            offscreen        = document.createElement('canvas');
            offscreen.width  = width;
            offscreen.height = height;
            const octx       = offscreen.getContext('2d');
            octx.imageSmoothingEnabled = false;

            const config   = scenarioConfigs[mapKey] || scenarioConfigs.cafeteria;
            const tileSize = 48;

            octx.fillStyle = config.floorColor;
            octx.fillRect(0, 0, width, height);

            if (config.floorType === 'checker') {
                octx.fillStyle = config.tileAccent;
                for (let y = 0; y < height; y += tileSize) {
                    for (let x = 0; x < width; x += tileSize) {
                        if (((x / tileSize) + (y / tileSize)) % 2 === 0) {
                            octx.fillRect(x, y, tileSize, tileSize);
                        }
                    }
                }
            } else if (config.floorType === 'parquet') {
                octx.fillStyle = config.tileAccent;
                for (let y = 0; y < height; y += tileSize) {
                    for (let x = 0; x < width; x += tileSize) {
                        if (Math.floor(y / tileSize) % 2 === 0) {
                            octx.fillRect(x + 3, y + 3, tileSize - 6, (tileSize >> 1) - 6);
                        } else {
                            octx.fillRect(x + (tileSize >> 1) + 3, y + 3, (tileSize >> 1) - 6, tileSize - 6);
                        }
                    }
                }
            } else {
                octx.fillStyle = config.tileAccent;
                for (let y = 24; y < height; y += 72) {
                    for (let x = 24; x < width; x += 72) {
                        octx.fillRect(x, y, 12, 6);
                        octx.fillRect(x + 6, y + 6, 12, 6);
                    }
                }
            }

            // Crisp 1px floor tile lines
            octx.fillStyle = config.gridColor;
            for (let x = 0; x < width; x += tileSize) {
                octx.fillRect(x, 0, 1, height);
            }
            for (let y = 0; y < height; y += tileSize) {
                octx.fillRect(0, y, width, 1);
            }

            if (config.steppingStones) {
                config.steppingStones.forEach(s => {
                    drawPixelSprite(octx, SPRITES.ZEN_STONE, s.x, s.y, s.w, s.h);
                });
            }

            floorCache.set(cacheKey, offscreen);
        }

        if (offscreen) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(offscreen, 0, 0);
        }
    }
    function renderScenarioEnvironment(ctx, width, height, mapKey = 'cafeteria') {
        const config    = scenarioConfigs[mapKey] || scenarioConfigs.cafeteria;
        const wallThick = 21;

        ctx.imageSmoothingEnabled = false;

        // 1. Crisp Pixel Room Walls
        ctx.fillStyle = config.wallColor;
        ctx.fillRect(0, 0, width, wallThick);
        ctx.fillRect(0, height - wallThick, width, wallThick);
        ctx.fillRect(0, 0, wallThick, height);
        ctx.fillRect(width - wallThick, 0, wallThick, height);

        ctx.strokeStyle = config.borderColor;
        ctx.lineWidth   = 3;
        ctx.strokeRect(wallThick, wallThick, width - wallThick * 2, height - wallThick * 2);

        // 2. Bookshelves (tiled crisp pixel blocks)
        if (config.bookshelves) {
            config.bookshelves.forEach(b => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
                ctx.fillRect(b.x + 3, b.y + 6, b.w, b.h);
                drawPixelBookshelf(ctx, b.x, b.y, b.w, b.h);
            });
        }

        // 3. Main Reception / Espresso Counter (modular crisp pixel grid)
        if (config.counter) {
            const c = config.counter;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
            ctx.fillRect(c.x + 3, c.y + 6, c.w, c.h);
            drawPixelCounter(ctx, c.x, c.y, c.w, c.h, mapKey);

            // Win98-style crisp signboard plaque
            const badgeW = 240;
            const badgeH = 22;
            const badgeX = Math.round(c.x + (c.w - badgeW) * 0.5);
            const badgeY = Math.round(c.y - 16);

            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(badgeX, badgeY, badgeW - 1, 1);
            ctx.fillRect(badgeX, badgeY, 1, badgeH - 1);
            ctx.fillStyle = '#000000';
            ctx.fillRect(badgeX, badgeY + badgeH - 1, badgeW, 1);
            ctx.fillRect(badgeX + badgeW - 1, badgeY, 1, badgeH);
            ctx.fillStyle = '#000080';
            ctx.fillRect(badgeX + 2, badgeY + 2, badgeW - 4, badgeH - 4);

            let signLabel = c.label;
            if (mapKey === 'cafeteria') signLabel = i18n.t('signCafeteria');
            else if (mapKey === 'library') signLabel = i18n.t('signLibrary');
            else if (mapKey === 'garden') signLabel = i18n.t('signGarden');

            ctx.fillStyle = '#ffffff';
            ctx.font      = 'bold 11px Tahoma, "MS Sans Serif", "MS PGothic", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(signLabel, badgeX + Math.round(badgeW * 0.5), badgeY + 15);
        }

        // 4. Study Chairs
        if (config.chairs) {
            config.chairs.forEach(ch => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
                ctx.fillRect(ch.x + 3, ch.y + ch.h - 3, ch.w - 6, 6);
                drawPixelSprite(ctx, SPRITES.CHAIR, ch.x, ch.y, ch.w, ch.h, null, null, ch.facing === 'left');
            });
        }

        // 5. Study Desks
        if (config.desks) {
            config.desks.forEach(d => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(d.x + 3, d.y + 6, d.w, d.h);

                let deskSprite = SPRITES.DESK_WOOD;
                if (d.type === 'laptop') deskSprite = SPRITES.DESK_LAPTOP;
                if (d.type === 'book')   deskSprite = SPRITES.DESK_BOOK;

                drawPixelSprite(ctx, deskSprite, d.x, d.y, d.w, d.h);

                ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
                ctx.font      = '10px Tahoma, "MS Sans Serif", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(d.label, Math.round(d.x + d.w * 0.5), Math.round(d.y - 5));
            });
        }

        // 6. Zen Lanterns
        if (config.lanterns) {
            config.lanterns.forEach(l => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(l.x + 3, l.y + l.h - 6, l.w - 6, 6);
                drawPixelSprite(ctx, SPRITES.ZEN_LANTERN, l.x, l.y, l.w, l.h);
            });
        }

        // 7. Potted Plants
        if (config.plants) {
            config.plants.forEach(p => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(p.x + 6, p.y + p.h - 3, p.w - 12, 6);
                drawPixelSprite(ctx, SPRITES.PLANT, p.x, p.y, p.w, p.h);
            });
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
    const dialogSystem = new DialogSystem();

    // ============================================================================
    // Module: src/engine/tasks.js
    // ============================================================================
    // Task & To-Do Management System
    // Persistent local-first task tracking with active HUD focus & Pomodoro estimation


    class TaskManager {
        constructor() {
            this.tasks        = [];
            this.activeTaskId = null;
            this.load();
        }

        load() {
            try {
                if (typeof localStorage !== 'undefined') {
                    const saved = localStorage.getItem('pomodoroTasks');
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        if (Array.isArray(parsed.tasks)) {
                            this.tasks = parsed.tasks
                                .filter(t => t && typeof t.text === 'string')
                                .map(t => ({
                                    ...t,
                                    pomodorosCompleted: typeof t.pomodorosCompleted === 'number' ? t.pomodorosCompleted : 0,
                                    pomodorosTarget:    typeof t.pomodorosTarget === 'number' ? t.pomodorosTarget : 1
                                }));
                        }
                        if (typeof parsed.activeTaskId === 'string') {
                            this.activeTaskId = parsed.activeTaskId;
                        }
                    }
                }
            } catch (_) {}

            // If no tasks exist, provide a helpful default focus task
            if (this.tasks.length === 0) {
                const defaultTask = {
                    id:                 'task_' + Date.now(),
                    text:               i18n.t('defaultTask'),
                    completed:          false,
                    pomodorosCompleted: 0,
                    pomodorosTarget:    2,
                    createdAt:          Date.now()
                };
                this.tasks.push(defaultTask);
                this.activeTaskId = defaultTask.id;
                this.save();
            }
        }

        save() {
            try {
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('pomodoroTasks', JSON.stringify({
                        tasks:        this.tasks,
                        activeTaskId: this.activeTaskId
                    }));
                }
            } catch (_) {}
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

        addTask(text, target = 1) {
            const trimmed = (text || '').trim();
            if (!trimmed) return null;

            const est = Math.max(1, Math.min(8, parseInt(target, 10) || 1));
            const newTask = {
                id:                 'task_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                text:               trimmed.substring(0, 60),
                completed:          false,
                pomodorosCompleted: 0,
                pomodorosTarget:    est,
                createdAt:          Date.now()
            };

            this.tasks.unshift(newTask);
            if (!this.activeTaskId || this.getActiveTask()?.completed) {
                this.activeTaskId = newTask.id;
            }

            this.save();
            sound.play('click');
            return newTask;
        }

        cycleTaskTarget(id) {
            const task = this.tasks.find(t => t.id === id);
            if (!task) return;
            task.pomodorosTarget = (task.pomodorosTarget % 8) + 1;
            this.save();
            sound.play('click');
        }

        incrementActiveTaskPomodoro() {
            const active = this.getActiveTask();
            if (!active) return;
            active.pomodorosCompleted = (active.pomodorosCompleted || 0) + 1;
            this.save();
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
    // Module: src/engine/stats.js
    // ============================================================================
    // Productivity Analytics & Streak Tracker
    // Tracks completed focus sessions, focus minutes, daily streaks, and 7-day history

    class StatsTracker {
        constructor() {
            this.totalFocusMinutes = 0;
            this.completedSessions = 0;
            this.currentStreak     = 0;
            this.lastActiveDate    = '';
            this.todayFocusMinutes = 0;
            this.dailyHistory      = {};

            this.load();
        }

        formatDateString(d) {
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }

        getTodayString() {
            return this.formatDateString(new Date());
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
                    if (s.dailyHistory && typeof s.dailyHistory === 'object') {
                        this.dailyHistory = s.dailyHistory;
                    }

                    const today = this.getTodayString();
                    if (this.lastActiveDate && this.lastActiveDate !== today) {
                        this.todayFocusMinutes = 0;
                    }
                    if (this.todayFocusMinutes > 0 && !this.dailyHistory[today]) {
                        this.dailyHistory[today] = this.todayFocusMinutes;
                    }
                }
            } catch (_) {}
        }

        save() {
            try {
                // Prune history older than 14 days to keep storage minimal
                const keys = Object.keys(this.dailyHistory).sort();
                while (keys.length > 14) {
                    const oldest = keys.shift();
                    delete this.dailyHistory[oldest];
                }

                localStorage.setItem('pomodoroStats', JSON.stringify({
                    totalFocusMinutes: this.totalFocusMinutes,
                    completedSessions: this.completedSessions,
                    currentStreak:     this.currentStreak,
                    lastActiveDate:    this.lastActiveDate,
                    todayFocusMinutes: this.todayFocusMinutes,
                    dailyHistory:      this.dailyHistory
                }));
            } catch (_) {}
        }

        recordCompletedSession(focusMinutes) {
            const mins = Math.max(1, Number(focusMinutes) || 25);
            this.completedSessions++;
            this.totalFocusMinutes += mins;
            this.todayFocusMinutes += mins;

            const today     = this.getTodayString();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yestStr   = this.formatDateString(yesterday);

            if (!this.lastActiveDate) {
                this.currentStreak = 1;
            } else if (this.lastActiveDate === yestStr) {
                this.currentStreak++;
            } else if (this.lastActiveDate !== today) {
                this.currentStreak = 1;
            }

            this.lastActiveDate      = today;
            this.dailyHistory[today] = (this.dailyHistory[today] || 0) + mins;
            this.save();
        }

        getWeeklyHistory() {
            const result   = [];
            const todayStr = this.getTodayString();
            for (let i = 6; i >= 0; i--) {
                const d       = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = this.formatDateString(d);
                const dayLbl  = `${d.getMonth() + 1}/${d.getDate()}`;
                const minutes = dateStr === todayStr ? this.todayFocusMinutes : (this.dailyHistory[dateStr] || 0);
                result.push({
                    date:    dateStr,
                    label:   dayLbl,
                    minutes: minutes,
                    isToday: dateStr === todayStr
                });
            }
            return result;
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
    // Module: src/engine/interactions.js
    // ============================================================================
    // World Interactions & Seating System
    // Manages proximity triggers, desk study seating, and prop interactions with multilingual support




    class InteractionManager {
        constructor() {
            this.activePrompt = null;
            this.currentSeat  = null;
        }

        getNearbyInteraction(player, mapKey, npcs, pets = []) {
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

            // 7. Check Nearby Cafeteria Pets (Cats & Dogs)
            for (let i = 0; i < pets.length; i++) {
                const pet  = pets[i];
                const dist = Math.hypot(px - (pet.x + pet.width * 0.5), py - (pet.y + pet.height * 0.5));
                if (dist < 46) {
                    const icon = pet.species === 'dog' ? '🐶' : '🐱';
                    return {
                        type:  'pet',
                        label: `${i18n.t('promptPet')} ${pet.name} ${icon}`,
                        pet:   pet,
                        x:     pet.x + pet.width * 0.5,
                        y:     pet.y - 6
                    };
                }
            }

            return null;
        }

        handleInteraction(player, interaction) {
            if (!interaction) return;

            switch (interaction.type) {
                case 'sit': {
                    player.x           = interaction.chair.x - 3;
                    player.y           = interaction.chair.y - 3;
                    player.state       = 'STUDYING';
                    player.direction   = interaction.chair.facing === 'left' ? 'left' : 'right';
                    this.currentSeat   = interaction.chair;
                    sound.play('sit');
                    dialogSystem.show(i18n.t('dialogStudyTitle'), i18n.t('dialogStudyBody'));
                    break;
                }
                case 'stand': {
                    player.state     = 'IDLE';
                    player.y        += 18;
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
                    const isBreak = interaction.npc && interaction.npc.state === 'BREAK';
                    const line    = i18n.getRandomNpcDialogue(isBreak);
                    dialogSystem.show(interaction.npc.id, line);
                    break;
                }
                case 'pet': {
                    const pet = interaction.pet;
                    if (!pet) break;
                    pet.state      = 'IDLE';
                    pet.waitTimer  = 8;
                    pet.heartTimer = 1.6;
                    pet.facing     = player.x >= pet.x ? 'right' : 'left';
                    sound.play(pet.species === 'dog' ? 'pet_dog' : 'pet_cat');
                    const icon = pet.species === 'dog' ? '🐶' : '🐱';
                    dialogSystem.show(`${icon} ${pet.name}`, i18n.getRandomPetDialogue(pet.species));
                    break;
                }
            }
        }

        isPointInPrompt(wx, wy) {
            const b = this.lastPromptBounds;
            if (!b) return false;
            return wx >= b.x - 6 && wx <= b.x + b.w + 6 && wy >= b.y - 6 && wy <= b.y + b.h + 6;
        }

        drawPrompt(ctx, interaction) {
            if (!interaction || dialogSystem.isOpen) {
                this.lastPromptBounds = null;
                return;
            }

            ctx.font        = 'bold 11px Tahoma, "MS Sans Serif", "MS PGothic", sans-serif';
            const textWidth = ctx.measureText(interaction.label).width;
            const boxW      = Math.ceil(textWidth + 16);
            const boxH      = 22;
            const boxX      = Math.round(interaction.x - boxW * 0.5);
            const bounce    = Math.round(Math.sin(performance.now() * 0.008) * 2);
            const boxY      = Math.round(interaction.y - boxH - 12 + bounce);

            this.lastPromptBounds = { x: boxX, y: boxY, w: boxW, h: boxH };

            // Classic Windows 98 yellow tooltip with crisp 1px border and hard drop shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.fillRect(boxX + 2, boxY + 2, boxW, boxH);

            ctx.fillStyle = '#ffffe1';
            ctx.fillRect(boxX, boxY, boxW, boxH);

            ctx.strokeStyle = '#000000';
            ctx.lineWidth   = 1;
            ctx.strokeRect(boxX + 0.5, boxY + 0.5, boxW - 1, boxH - 1);

            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            ctx.fillText(interaction.label, boxX + Math.round(boxW * 0.5), boxY + 15);
        }
    }
    const interactionManager = new InteractionManager();

    // ============================================================================
    // Module: src/engine/world.js
    // ============================================================================
    // World State, Entity Physics, Click-to-Move Steering & Dynamic NPC Behavior
    const WORLD_WIDTH  = 1200;
    const WORLD_HEIGHT = 800;
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
        pets:    [],
        pomodoro: {
            mode:         'WORK', // 'WORK' | 'BREAK' | 'LONG_BREAK'
            timerSeconds: 1500,
            isActive:     true,
            currentCycle: 1,
            totalCycles:  4
        }
    };
    const pointerTarget = {
        active:       false,
        x:            0,
        y:            0,
        autoInteract: false
    };
    function setPointerDestination(worldX, worldY, autoInteract = false) {
        pointerTarget.active       = true;
        pointerTarget.x            = Math.max(24, Math.min(WORLD_WIDTH - 24, worldX));
        pointerTarget.y            = Math.max(24, Math.min(WORLD_HEIGHT - 24, worldY));
        pointerTarget.autoInteract = autoInteract;
    }
    function clearPointerDestination() {
        pointerTarget.active       = false;
        pointerTarget.autoInteract = false;
    }

    function buildCafeteriaPets() {
        if (currentConfig.map !== 'cafeteria') return [];

        // 2 cats & 2 dogs placed in open cafeteria walkways with staggered calm timers
        const presets = [
            { name: 'Mochi',   species: 'cat', x: 260, y: 342, color: '#e08b3e', accent: '#d93838', facing: 'right', state: 'SLEEP', wait: 7.5 },
            { name: 'Luna',    species: 'cat', x: 890, y: 342, color: '#606c7a', accent: '#e874b0', facing: 'left',  state: 'IDLE',  wait: 5.0 },
            { name: 'Biscuit', species: 'dog', x: 345, y: 615, color: '#e6b34d', accent: '#3b82f6', facing: 'right', state: 'IDLE',  wait: 4.0 },
            { name: 'Milo',    species: 'dog', x: 730, y: 615, color: '#9e6637', accent: '#2f8f4e', facing: 'left',  state: 'SLEEP', wait: 9.5 }
        ];

        return presets.map((p, idx) => ({
            id:         `pet_${idx + 1}`,
            name:       p.name,
            species:    p.species,
            x:          p.x,
            y:          p.y,
            width:      30,
            height:     27,
            color:      p.color,
            accent:     p.accent,
            facing:     p.facing,
            state:      p.state, // 'IDLE' | 'WALK' | 'SLEEP'
            targetX:    p.x,
            targetY:    p.y,
            waitTimer:  p.wait,
            heartTimer: 0,
            speed:      p.species === 'cat' ? 24 : 28
        }));
    }

    function buildNpcEntity(index, seats) {
        const archetypes = ['NPC_SCHOLAR', 'NPC_GIRL', 'CHAR_SIT'];
        const npcColors  = ['#10b981', '#ec4899', '#f59e0b', '#8b5cf6', '#06b6d4'];

        let x, y, facing;
        if (index - 1 < seats.length) {
            const seat = seats[index - 1];
            x      = seat.x;
            y      = seat.y;
            facing = seat.facing || 'down';
        } else {
            const col = (index - seats.length - 1) % 4;
            const row = Math.floor((index - seats.length - 1) / 4);
            x      = 280 + col * 180;
            y      = 600 + row * 60;
            facing = 'down';
        }

        return {
            id:         `${i18n.t('studyBuddyPrefix')} ${index}`,
            x:          x - 3,
            y:          y - 3,
            homeX:      x - 3,
            homeY:      y - 3,
            homeFacing: facing,
            targetX:    x - 3,
            targetY:    y - 3,
            width:      36,
            height:     39,
            color:      npcColors[(index - 1) % npcColors.length],
            direction:  facing,
            archetype:  archetypes[(index - 1) % archetypes.length],
            state:      'STUDYING'
        };
    }

    // Initialize or update map entities and study buddy NPCs
    function initGameWorld(preserveSession = false) {
        const pId   = (currentConfig.playerName && currentConfig.playerName.trim()) || 'Ness';
        const seats = getStudySeats(currentConfig.map);

        if (preserveSession && gameState.players['my_id']) {
            const me = gameState.players['my_id'];
            me.id    = pId;
            me.color = currentConfig.playerColor || '#3b82f6';

            // Rebuild NPC list to match updated npcCount
            const nextPlayers = { 'my_id': me };
            for (let i = 1; i <= currentConfig.npcCount; i++) {
                const key = `npc_${i}`;
                nextPlayers[key] = gameState.players[key] || buildNpcEntity(i, seats);
                nextPlayers[key].id = `${i18n.t('studyBuddyPrefix')} ${i}`;
            }
            gameState.players = nextPlayers;
            gameState.pomodoro.totalCycles = currentConfig.cycles || 4;
            if (currentConfig.map === 'cafeteria' && gameState.pets.length === 0) {
                gameState.pets = buildCafeteriaPets();
            } else if (currentConfig.map !== 'cafeteria') {
                gameState.pets = [];
            }
            syncNpcBreakState(gameState.pomodoro.mode);
            return;
        }

        gameState.players = {
            'my_id': {
                id:        pId,
                x:         600,
                y:         360,
                width:     36,
                height:    39,
                color:     currentConfig.playerColor || '#3b82f6',
                direction: 'down',
                state:     'IDLE'
            }
        };

        interactionManager.currentSeat = null;
        clearPointerDestination();

        for (let i = 1; i <= currentConfig.npcCount; i++) {
            gameState.players[`npc_${i}`] = buildNpcEntity(i, seats);
        }

        gameState.pets = buildCafeteriaPets();

        const timer        = gameState.pomodoro;
        timer.mode         = 'WORK';
        timer.timerSeconds = currentConfig.focusTime * 60;
        timer.isActive     = true;
        timer.currentCycle = 1;
        timer.totalCycles  = currentConfig.cycles || 4;
    }

    // Transition NPCs between study desks and break lounge areas
    function syncNpcBreakState(mode) {
        const isBreak = mode === 'BREAK' || mode === 'LONG_BREAK';
        let idx = 0;
        Object.keys(gameState.players).forEach(key => {
            if (key === 'my_id') return;
            const npc = gameState.players[key];
            idx++;
            if (isBreak && idx % 2 === 1) {
                npc.state   = 'BREAK';
                npc.targetX = 460 + ((idx * 65) % 280);
                npc.targetY = 120 + ((idx * 35) % 60);
            } else {
                npc.state   = 'STUDYING';
                npc.targetX = npc.homeX;
                npc.targetY = npc.homeY;
            }
        });
    }

    function checkAABB(x, y, w, h, box) {
        return (
            x < box.x + box.w &&
            x + w > box.x &&
            y < box.y + box.h &&
            y + h > box.y
        );
    }

    function isAreaClear(x, y, w, h, obstacles) {
        for (let i = 0; i < obstacles.length; i++) {
            if (checkAABB(x, y, w, h, obstacles[i])) return false;
        }
        return true;
    }

    // Gently wander or rest cafeteria cats & dogs without distracting the user
    function updatePets(deltaTime, obstacles) {
        if (!gameState.pets || gameState.pets.length === 0) return;

        for (let i = 0; i < gameState.pets.length; i++) {
            const pet = gameState.pets[i];

            if (pet.heartTimer > 0) {
                pet.heartTimer = Math.max(0, pet.heartTimer - deltaTime);
            }

            if (pet.state === 'WALK') {
                const dx   = pet.targetX - pet.x;
                const dy   = pet.targetY - pet.y;
                const dist = Math.hypot(dx, dy);

                if (dist <= 2) {
                    pet.x         = pet.targetX;
                    pet.y         = pet.targetY;
                    pet.state     = Math.random() < 0.55 ? 'SLEEP' : 'IDLE';
                    pet.waitTimer = pet.state === 'SLEEP'
                        ? 10 + Math.random() * 8
                        : 7 + Math.random() * 6;
                    continue;
                }

                const step  = Math.min(dist, pet.speed * deltaTime);
                const nextX = pet.x + (dx / dist) * step;
                const nextY = pet.y + (dy / dist) * step;

                if (Math.abs(dx) > 1) {
                    pet.facing = dx > 0 ? 'right' : 'left';
                }

                // Gentle obstacle check so pets never walk through desks or counters
                if (isAreaClear(nextX + 3, nextY + 9, pet.width - 6, pet.height - 9, obstacles)) {
                    pet.x = nextX;
                    pet.y = nextY;
                } else {
                    // Stop peacefully if path is blocked
                    pet.state     = 'IDLE';
                    pet.waitTimer = 6 + Math.random() * 6;
                }
            } else {
                pet.waitTimer -= deltaTime;
                if (pet.waitTimer <= 0) {
                    // Occasionally shift between sleeping and sitting without even moving
                    if (Math.random() < 0.35) {
                        pet.state     = pet.state === 'SLEEP' ? 'IDLE' : 'SLEEP';
                        pet.waitTimer = 8 + Math.random() * 8;
                        continue;
                    }

                    // Pick a nearby gentle destination within 50-130 px
                    let chosen = false;
                    for (let tries = 0; tries < 8; tries++) {
                        const angle  = Math.random() * Math.PI * 2;
                        const radius = 50 + Math.random() * 80;
                        const candX  = Math.max(60, Math.min(WORLD_WIDTH - 90, pet.x + Math.cos(angle) * radius));
                        const candY  = Math.max(120, Math.min(WORLD_HEIGHT - 70, pet.y + Math.sin(angle) * radius));

                        if (isAreaClear(candX - 4, candY - 4, pet.width + 8, pet.height + 8, obstacles)) {
                            pet.targetX = candX;
                            pet.targetY = candY;
                            pet.state   = 'WALK';
                            chosen      = true;
                            break;
                        }
                    }
                    if (!chosen) {
                        pet.waitTimer = 6 + Math.random() * 5;
                    }
                }
            }
        }
    }

    // Update player movement, click-to-move steering, NPC transitions, and gentle cafe pets
    function updateWorldEntities(deltaTime, isMenuOpen, nearbyInteract) {
        const player = gameState.players['my_id'];
        if (!player) return;

        const obstacles = getObstacles(currentConfig.map, WORLD_WIDTH, WORLD_HEIGHT);

        // Update NPC positions smoothly toward their target coordinates
        Object.keys(gameState.players).forEach(key => {
            if (key === 'my_id') return;
            const npc = gameState.players[key];
            if (typeof npc.targetX !== 'number' || typeof npc.targetY !== 'number') return;

            const ndx  = npc.targetX - npc.x;
            const ndy  = npc.targetY - npc.y;
            const dist = Math.hypot(ndx, ndy);
            if (dist > 2) {
                const step = Math.min(dist, 95 * deltaTime);
                npc.x += (ndx / dist) * step;
                npc.y += (ndy / dist) * step;
                npc.direction = Math.abs(ndx) >= Math.abs(ndy) ? (ndx > 0 ? 'right' : 'left') : (ndy > 0 ? 'down' : 'up');
            } else {
                npc.x = npc.targetX;
                npc.y = npc.targetY;
                if (npc.state === 'STUDYING' && npc.homeFacing) {
                    npc.direction = npc.homeFacing;
                } else if (npc.state === 'BREAK') {
                    npc.direction = 'down';
                }
            }
        });

        if (!isMenuOpen) {
            updatePets(deltaTime, obstacles);
        }

        if (isMenuOpen || dialogSystem.isOpen) return;

        const SPEED = 160.0;
        let rawDx   = (keys.d || keys.ArrowRight) - (keys.a || keys.ArrowLeft);
        let rawDy   = (keys.s || keys.ArrowDown) - (keys.w || keys.ArrowUp);

        // Keyboard input overrides click-to-move waypoint
        if (rawDx !== 0 || rawDy !== 0) {
            clearPointerDestination();
        } else if (pointerTarget.active) {
            const pcx  = player.x + player.width * 0.5;
            const pcy  = player.y + player.height * 0.5;
            const pdx  = pointerTarget.x - pcx;
            const pdy  = pointerTarget.y - pcy;
            const dist = Math.hypot(pdx, pdy);

            if (dist <= 10 || (pointerTarget.autoInteract && nearbyInteract && dist <= 44)) {
                const shouldInteract = pointerTarget.autoInteract;
                clearPointerDestination();
                player.state = interactionManager.currentSeat ? 'STUDYING' : 'IDLE';
                if (shouldInteract && nearbyInteract) {
                    interactionManager.handleInteraction(player, nearbyInteract);
                }
                return;
            }
            rawDx = pdx / dist;
            rawDy = pdy / dist;
        }

        if (interactionManager.currentSeat && (rawDx !== 0 || rawDy !== 0)) {
            interactionManager.handleInteraction(player, { type: 'stand' });
        }

        if (!interactionManager.currentSeat) {
            const len = Math.hypot(rawDx, rawDy);
            let dx = 0;
            let dy = 0;
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

            const hitboxMarginX = 6;
            const hitboxTopY    = 20;
            const hitboxW       = player.width - hitboxMarginX * 2;
            const hitboxH       = player.height - hitboxTopY;

            let movedX = false;
            let movedY = false;

            if (dx !== 0) {
                const nextX       = player.x + dx * deltaTime;
                const testHitboxX = nextX + hitboxMarginX;
                const testHitboxY = player.y + hitboxTopY;
                let blockedX      = false;
                for (let i = 0; i < obstacles.length; i++) {
                    if (checkAABB(testHitboxX, testHitboxY, hitboxW, hitboxH, obstacles[i])) {
                        blockedX = true;
                        break;
                    }
                }
                if (!blockedX) {
                    player.x = nextX;
                    movedX   = true;
                }
            }

            if (dy !== 0) {
                const nextY       = player.y + dy * deltaTime;
                const testHitboxX = player.x + hitboxMarginX;
                const testHitboxY = nextY + hitboxTopY;
                let blockedY      = false;
                for (let i = 0; i < obstacles.length; i++) {
                    if (checkAABB(testHitboxX, testHitboxY, hitboxW, hitboxH, obstacles[i])) {
                        blockedY = true;
                        break;
                    }
                }
                if (!blockedY) {
                    player.y = nextY;
                    movedY   = true;
                }
            }

            // Stop click-to-move if completely blocked by obstacle
            if (pointerTarget.active && len > 0 && !movedX && !movedY) {
                if (pointerTarget.autoInteract && nearbyInteract) {
                    interactionManager.handleInteraction(player, nearbyInteract);
                }
                clearPointerDestination();
                player.state = 'IDLE';
            }
        }

        player.x = Math.max(20, Math.min(WORLD_WIDTH - 20 - player.width, player.x));
        player.y = Math.max(20, Math.min(WORLD_HEIGHT - 20 - player.height, player.y));
    }
    function drawPointerTarget(ctx) {
        if (!pointerTarget.active) return;
        const x    = Math.round(pointerTarget.x);
        const y    = Math.round(pointerTarget.y);
        const size = Math.floor(performance.now() / 250) % 2 === 0 ? 6 : 9;

        ctx.fillStyle = '#ffff00';
        ctx.fillRect(x - size, y - 1, size * 2, 3);
        ctx.fillRect(x - 1, y - size, 3, size * 2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x - 1, y - 1, 3, 3);
    }
    function drawCharacterSprite(ctx, p) {
        const isPlayer = p === gameState.players['my_id'];
        const rx       = Math.round(p.x);
        const ry       = Math.round(p.y);

        // Crisp flat pixel drop shadow under character
        ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
        ctx.fillRect(rx + 6, ry + p.height - 3, p.width - 12, 6);

        const dir       = p.direction || 'down';
        const isMoving  = p.state === 'WALKING' || (!isPlayer && (Math.abs((p.targetX ?? p.x) - p.x) > 2 || Math.abs((p.targetY ?? p.y) - p.y) > 2));
        const isSitting = p.state === 'STUDYING' && isPlayer;
        const walkFrame = Math.floor(performance.now() / 200) % 2 === 0;

        let spriteData = SPRITES.CHAR_DOWN_IDLE;
        let flipX      = false;

        if (isPlayer) {
            if (isSitting) {
                spriteData = SPRITES.CHAR_SIT;
                flipX      = dir === 'right';
            } else if (dir === 'down') {
                spriteData = isMoving ? (walkFrame ? SPRITES.CHAR_DOWN_WALK_1 : SPRITES.CHAR_DOWN_WALK_2) : SPRITES.CHAR_DOWN_IDLE;
            } else if (dir === 'up') {
                spriteData = isMoving ? (walkFrame ? SPRITES.CHAR_UP_WALK_1 : SPRITES.CHAR_UP_WALK_2) : SPRITES.CHAR_UP_IDLE;
            } else if (dir === 'left' || dir === 'right') {
                spriteData = isMoving ? (walkFrame ? SPRITES.CHAR_SIDE_WALK_1 : SPRITES.CHAR_SIDE_WALK_2) : SPRITES.CHAR_SIDE_IDLE;
                flipX      = dir === 'right';
            }
        } else {
            if (isMoving) {
                spriteData = walkFrame ? SPRITES.CHAR_DOWN_WALK_1 : SPRITES.CHAR_DOWN_WALK_2;
            } else if (p.archetype === 'NPC_SCHOLAR') {
                spriteData = SPRITES.NPC_SCHOLAR;
            } else if (p.archetype === 'NPC_GIRL') {
                spriteData = SPRITES.NPC_GIRL;
            } else {
                spriteData = SPRITES.CHAR_SIT;
            }
            if (dir === 'right') flipX = true;
        }

        const mainColor   = isPlayer ? (currentConfig.playerColor || '#3b82f6') : (p.color || '#10b981');
        const accentColor = isPlayer ? '#d93838' : '#e8b94f';

        drawPixelSprite(ctx, spriteData, rx, ry, p.width, p.height, mainColor, accentColor, flipX);

        // Crisp Win98-style compact nameplate
        let statusIcon = '';
        if (!isPlayer) {
            statusIcon = p.state === 'BREAK' ? '☕ ' : '📖 ';
        } else if (isSitting) {
            statusIcon = '★ ';
        }
        const tagText   = `${statusIcon}${p.id}`;
        ctx.font        = 'bold 10px Tahoma, "MS Sans Serif", "MS PGothic", sans-serif';
        const textWidth = ctx.measureText(tagText).width;
        const badgeW    = Math.ceil(textWidth + 10);
        const badgeH    = 16;
        const badgeX    = Math.round(rx + p.width * 0.5 - badgeW * 0.5);
        const badgeY    = ry - 19;

        ctx.fillStyle = isPlayer ? '#000080' : (p.state === 'BREAK' ? '#ffffe1' : '#c0c0c0');
        ctx.fillRect(badgeX, badgeY, badgeW, badgeH);

        ctx.strokeStyle = '#000000';
        ctx.lineWidth   = 1;
        ctx.strokeRect(badgeX + 0.5, badgeY + 0.5, badgeW - 1, badgeH - 1);

        ctx.fillStyle = isPlayer ? '#ffffff' : '#000000';
        ctx.textAlign = 'center';
        ctx.fillText(tagText, badgeX + Math.round(badgeW * 0.5), badgeY + 11);
    }

    // Render calm cafeteria cats & dogs without distracting permanent text labels
    function drawPetSprite(ctx, pet) {
        const rx = Math.round(pet.x);
        const ry = Math.round(pet.y);

        // Crisp flat pixel shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.fillRect(rx + 4, ry + pet.height - 3, pet.width - 8, 5);

        const isDog     = pet.species === 'dog';
        const walkFrame = Math.floor(performance.now() / 520) % 2 === 0;
        let spriteData;

        if (pet.state === 'SLEEP') {
            spriteData = isDog ? SPRITES.DOG_SLEEP : SPRITES.CAT_SLEEP;
        } else if (pet.state === 'WALK') {
            spriteData = isDog
                ? (walkFrame ? SPRITES.DOG_WALK_1 : SPRITES.DOG_WALK_2)
                : (walkFrame ? SPRITES.CAT_WALK_1 : SPRITES.CAT_WALK_2);
        } else {
            spriteData = isDog ? SPRITES.DOG_IDLE : SPRITES.CAT_IDLE;
        }

        drawPixelSprite(ctx, spriteData, rx, ry, pet.width, pet.height, pet.color, pet.accent, pet.facing === 'left');

        // Brief gentle heart feedback when petted
        if (pet.heartTimer > 0) {
            const rise = Math.round((1.6 - pet.heartTimer) * 10);
            ctx.fillStyle = '#e03c3c';
            ctx.font      = 'bold 12px Tahoma, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('♥', rx + Math.round(pet.width * 0.5), ry - 2 - rise);
        }
    }

    // ============================================================================
    // Module: src/engine/timer.js
    // ============================================================================
    // Deterministic Wall-Clock Pomodoro Timer Engine & Canvas HUD Renderer
    // Preserves accurate countdown even when browser tab is backgrounded or minimized






    const DEFAULT_DOC_TITLE = 'Pomodoro World 2D — Virtual Focus Cafe';
    let lastWallTimestamp   = Date.now();
    let lastTitleSecond     = -1;
    function syncTimerWallClock() {
        lastWallTimestamp = Date.now();
    }
    function updateDocumentTitle(isMenuOpen) {
        if (typeof document === 'undefined') return;
        const timer = gameState.pomodoro;
        if (isMenuOpen || !timer.isActive) {
            if (document.title !== DEFAULT_DOC_TITLE) {
                document.title = DEFAULT_DOC_TITLE;
            }
            lastTitleSecond = -1;
            return;
        }

        const totalSeconds = Math.max(0, Math.floor(timer.timerSeconds));
        if (totalSeconds === lastTitleSecond) return;
        lastTitleSecond = totalSeconds;

        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        const badge   = timer.mode === 'WORK' ? '🍅' : (timer.mode === 'LONG_BREAK' ? '🎉' : '☕');
        document.title = `${badge} ${timeStr} — Pomodoro World 2D`;
    }

    // Advance Pomodoro timer using real wall-clock delta so background tabs never freeze
    function updatePomodoroTimer(isMenuOpen, onSessionComplete = null) {
        const now         = Date.now();
        const wallDelta   = Math.max(0, Math.min(7200, (now - lastWallTimestamp) * 0.001));
        lastWallTimestamp = now;

        if (isMenuOpen) {
            updateDocumentTitle(true);
            return;
        }

        const timer = gameState.pomodoro;
        if (timer.isActive && wallDelta > 0) {
            timer.timerSeconds -= wallDelta;

            if (timer.timerSeconds <= 0) {
                if (timer.mode === 'WORK') {
                    statsTracker.recordCompletedSession(currentConfig.focusTime);
                    taskManager.incrementActiveTaskPomodoro();

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

                syncNpcBreakState(timer.mode);
                if (onSessionComplete) onSessionComplete();
            }
        }

        updateDocumentTitle(false);
    }
    function drawPomodoroHUD(ctx, canvasWidth, isMenuOpen) {
        const timer        = gameState.pomodoro;
        const totalSeconds = Math.max(0, Math.floor(timer.timerSeconds));
        const minutes      = Math.floor(totalSeconds / 60);
        const seconds      = totalSeconds % 60;
        const timeStr      = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        const hudW = Math.min(274, canvasWidth - 24);
        const hudH = 88;
        const hudX = Math.round((canvasWidth - hudW) * 0.5);
        const hudY = 12;

        // 1. Classic Windows 98 Raised Window Chrome
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(hudX, hudY, hudW, hudH);
        // Outer white highlight (top/left) & black shadow (bottom/right)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(hudX, hudY, hudW - 1, 2);
        ctx.fillRect(hudX, hudY, 2, hudH - 1);
        ctx.fillStyle = '#000000';
        ctx.fillRect(hudX, hudY + hudH - 2, hudW, 2);
        ctx.fillRect(hudX + hudW - 2, hudY, 2, hudH);
        // Inner dark gray shadow
        ctx.fillStyle = '#808080';
        ctx.fillRect(hudX + 2, hudY + hudH - 3, hudW - 4, 1);
        ctx.fillRect(hudX + hudW - 3, hudY + 2, 1, hudH - 4);

        // 2. Classic Win98 Gradient Titlebar
        const barX = hudX + 4;
        const barY = hudY + 4;
        const barW = hudW - 8;
        const barH = 19;
        const isPaused = !timer.isActive || isMenuOpen;

        const grad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
        if (isPaused) {
            grad.addColorStop(0, '#808080');
            grad.addColorStop(1, '#b5b5b5');
        } else if (timer.mode === 'WORK') {
            grad.addColorStop(0, '#000080');
            grad.addColorStop(1, '#1084d0');
        } else {
            grad.addColorStop(0, '#006666');
            grad.addColorStop(1, '#10a494');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(barX, barY, barW, barH);

        // Multilingual Scenario + Mode in Titlebar
        let scenarioName = i18n.t('mapCafeteria');
        if (currentConfig.map === 'library') scenarioName = i18n.t('mapLibrary');
        else if (currentConfig.map === 'garden') scenarioName = i18n.t('mapGarden');

        let modeText = i18n.t('hudFocusSession');
        if (isPaused) {
            modeText = i18n.t('hudPaused');
        } else if (timer.mode === 'BREAK') {
            modeText = i18n.t('hudShortBreak');
        } else if (timer.mode === 'LONG_BREAK') {
            modeText = i18n.t('hudLongBreak');
        }

        ctx.fillStyle = '#ffffff';
        ctx.font      = 'bold 11px Tahoma, "MS Sans Serif", "MS PGothic", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${scenarioName} - ${modeText}`, barX + 6, barY + 13, barW - 12);

        // 3. Sunken LCD Clock Well
        const wellX = hudX + 8;
        const wellY = hudY + 28;
        const wellW = hudW - 16;
        const wellH = 34;

        ctx.fillStyle = '#000000';
        ctx.fillRect(wellX, wellY, wellW, wellH);
        ctx.fillStyle = '#808080';
        ctx.fillRect(wellX, wellY, wellW, 1);
        ctx.fillRect(wellX, wellY, 1, wellH);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(wellX, wellY + wellH - 1, wellW, 1);
        ctx.fillRect(wellX + wellW - 1, wellY, 1, wellH);

        // Crisp retro LCD digits
        ctx.fillStyle = isPaused ? '#ffff00' : (timer.mode === 'WORK' ? '#00ff66' : '#52e0ff');
        ctx.font      = 'bold 24px "Courier New", Courier, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(timeStr, hudX + Math.round(hudW * 0.5) - 18, wellY + 25);

        const cycleText = `${i18n.t('hudCycle')} ${timer.currentCycle}/${timer.totalCycles}`;
        ctx.fillStyle   = '#c0c0c0';
        ctx.font        = 'bold 10px Tahoma, "MS Sans Serif", sans-serif';
        ctx.textAlign   = 'right';
        ctx.fillText(cycleText, wellX + wellW - 8, wellY + 21);

        // 4. Classic Win98 Segmented Progress Bar
        let maxSeconds = currentConfig.focusTime * 60;
        if (timer.mode === 'BREAK') maxSeconds = currentConfig.breakTime * 60;
        if (timer.mode === 'LONG_BREAK') maxSeconds = currentConfig.breakTime * 60 * 2;

        const progress = Math.max(0, Math.min(1, timer.timerSeconds / Math.max(1, maxSeconds)));

        const pX = hudX + 8;
        const pY = hudY + 67;
        const pW = hudW - 16;
        const pH = 14;

        // Sunken white trough
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(pX, pY, pW, pH);
        ctx.fillStyle = '#808080';
        ctx.fillRect(pX, pY, pW, 1);
        ctx.fillRect(pX, pY, 1, pH);
        ctx.fillStyle = '#000000';
        ctx.fillRect(pX + 1, pY + 1, pW - 2, 1);
        ctx.fillRect(pX + 1, pY + 1, 1, pH - 2);

        // Segmented blue Win98 blocks
        const blockW    = 8;
        const blockGap  = 2;
        const innerW    = Math.floor((pW - 6) * progress);
        ctx.fillStyle   = isPaused ? '#808080' : '#000080';
        for (let bx = 0; bx + blockW <= innerW; bx += blockW + blockGap) {
            ctx.fillRect(pX + 3 + bx, pY + 3, blockW, pH - 6);
        }
    }

    // ============================================================================
    // Module: src/main.js
    // ============================================================================
    const canvas = document.getElementById('gameCanvas');
    const ctx    = canvas.getContext('2d');
    const camera = new Camera(window.innerWidth, window.innerHeight);

    function resizeCanvas() {
        if (canvas) {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx.imageSmoothingEnabled = false;
            camera.viewportWidth      = canvas.width;
            camera.viewportHeight     = canvas.height;
        }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let gameStarted    = false;
    let nearbyInteract = null;
    let lastMenuPanel  = 'main';

    // ----------------------------------------------------------------------------
    // DOM References
    // ----------------------------------------------------------------------------
    const el = id => document.getElementById(id);

    const uiLayer           = el('ui-layer');
    const mainMenuPanel     = el('main-menu');
    const modeMenuPanel     = el('mode-menu');
    const configMenuPanel   = el('solo-config-menu');
    const customMenuPanel   = el('custom-menu');
    const pauseMenuPanel    = el('pause-menu');
    const controlsLegend    = el('controls-legend');
    const hudOverlay        = el('hud-overlay');
    const taskDrawer        = el('task-drawer');

    const focusInput        = el('focus-time');
    const breakInput        = el('break-time');
    const cyclesInput       = el('cycles');
    const mapSelect         = el('map-select');
    const npcInput          = el('npc-count');
    const playerNameInput   = el('player-name');
    const playerColorSelect = el('player-color');
    const ambientSelect     = el('ambient-select');
    const volumeSlider      = el('volume-slider');
    const languageSelect    = el('language-select');
    const langButtons       = document.querySelectorAll('.lang-btn');

    const btnHudInteract    = el('btn-hud-interact');
    const btnHudPlay        = el('btn-hud-play');
    const btnHudSkip        = el('btn-hud-skip');
    const btnHudTasks       = el('btn-hud-tasks');
    const btnHudSound       = el('btn-hud-sound');
    const startGameBtn      = el('btn-start-game');
    const taskForm          = el('task-form');
    const taskInput         = el('task-input');
    const taskList          = el('task-list');

    // ----------------------------------------------------------------------------
    // Main Update & Rendering Loop
    // ----------------------------------------------------------------------------
    function isMenuVisible() {
        return Boolean(uiLayer && !uiLayer.classList.contains('hidden'));
    }

    function update(deltaTime) {
        dialogSystem.update(deltaTime);

        const player = gameState.players['my_id'];
        if (!player) return;

        const isMenuOpen = isMenuVisible();
        const npcs       = Object.values(gameState.players).filter(p => p !== player);

        nearbyInteract = !isMenuOpen
            ? interactionManager.getNearbyInteraction(player, currentConfig.map, npcs, gameState.pets)
            : null;

        if (btnHudInteract) {
            if (nearbyInteract && !dialogSystem.isOpen) {
                btnHudInteract.classList.remove('hidden');
                btnHudInteract.textContent = nearbyInteract.label;
            } else {
                btnHudInteract.classList.add('hidden');
            }
        }

        updateWorldEntities(deltaTime, isMenuOpen, nearbyInteract);
        camera.update(player.x, player.y, player.width, player.height, WORLD_WIDTH, WORLD_HEIGHT);

        updatePomodoroTimer(isMenuOpen, () => {
            renderTasks();
            updateStatsDisplay();
        });
    }

    function draw() {
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(-Math.round(camera.x), -Math.round(camera.y));

        renderScenarioFloor(ctx, WORLD_WIDTH, WORLD_HEIGHT, currentConfig.map);
        renderScenarioEnvironment(ctx, WORLD_WIDTH, WORLD_HEIGHT, currentConfig.map);
        drawPointerTarget(ctx);

        const renderables = [
            ...Object.values(gameState.players).map(p => ({ kind: 'char', entity: p, footY: p.y + p.height })),
            ...(gameState.pets || []).map(pet => ({ kind: 'pet', entity: pet, footY: pet.y + pet.height }))
        ].sort((a, b) => a.footY - b.footY);

        for (let i = 0; i < renderables.length; i++) {
            if (renderables[i].kind === 'pet') {
                drawPetSprite(ctx, renderables[i].entity);
            } else {
                drawCharacterSprite(ctx, renderables[i].entity);
            }
        }

        if (nearbyInteract) {
            interactionManager.drawPrompt(ctx, nearbyInteract);
        }

        ctx.restore();

        drawPomodoroHUD(ctx, canvas.width, isMenuVisible());
        dialogSystem.draw(ctx, canvas.width, canvas.height);
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

    // Background tab heartbeat ensures Pomodoro timer never freezes when tab is hidden
    setInterval(() => {
        if (document.hidden && gameStarted) {
            updatePomodoroTimer(isMenuVisible(), () => {
                renderTasks();
                updateStatsDisplay();
            });
        }
    }, 1000);

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && gameStarted) {
            lastTime = performance.now();
            updatePomodoroTimer(isMenuVisible(), () => {
                renderTasks();
                updateStatsDisplay();
            });
        }
    });

    // ----------------------------------------------------------------------------
    // Click / Tap-to-Move & World Interaction
    // ----------------------------------------------------------------------------
    function isInteractiveLocation(wx, wy) {
        const config = scenarioConfigs[currentConfig.map] || scenarioConfigs.cafeteria;
        if (config.chairs && config.chairs.some(c => Math.hypot(wx - (c.x + c.w * 0.5), wy - (c.y + c.h * 0.5)) < 40)) {
            return true;
        }
        if (config.counter) {
            const c = config.counter;
            if (wx >= c.x - 16 && wx <= c.x + c.w + 16 && wy >= c.y - 10 && wy <= c.y + c.h + 45) return true;
        }
        if (config.bookshelves && config.bookshelves.some(b => wx >= b.x - 12 && wx <= b.x + b.w + 12 && wy >= b.y - 12 && wy <= b.y + b.h + 36)) {
            return true;
        }
        if (config.lanterns && config.lanterns.some(l => Math.hypot(wx - (l.x + l.w * 0.5), wy - (l.y + l.h * 0.5)) < 42)) {
            return true;
        }
        if (gameState.pets && gameState.pets.some(p => Math.hypot(wx - (p.x + p.width * 0.5), wy - (p.y + p.height * 0.5)) < 36)) {
            return true;
        }
        const player = gameState.players['my_id'];
        const npcs   = Object.values(gameState.players).filter(p => p !== player);
        return npcs.some(n => Math.hypot(wx - (n.x + n.width * 0.5), wy - (n.y + n.height * 0.5)) < 42);
    }

    if (canvas) {
        canvas.addEventListener('pointerdown', (e) => {
            if (isMenuVisible()) return;
            if (taskDrawer && !taskDrawer.classList.contains('hidden')) {
                toggleTaskDrawer(false);
                return;
            }
            if (dialogSystem.isOpen) {
                dialogSystem.advance();
                return;
            }

            const rect = canvas.getBoundingClientRect();
            const wx   = (e.clientX - rect.left) + camera.x;
            const wy   = (e.clientY - rect.top) + camera.y;
            const player = gameState.players['my_id'];
            if (!player) return;

            if (nearbyInteract && interactionManager.isPointInPrompt(wx, wy)) {
                interactionManager.handleInteraction(player, nearbyInteract);
                return;
            }

            const autoInteract = isInteractiveLocation(wx, wy);
            setPointerDestination(wx, wy, autoInteract);
        });
    }

    // ----------------------------------------------------------------------------
    // UI & Multilingual Updates
    // ----------------------------------------------------------------------------
    const TEXT_BINDINGS = {
        'lbl-main-title':     'appTitle',
        'lbl-main-subtitle':  'appSubtitle',
        'btn-play':           'playGame',
        'btn-custom':         'userCustomization',
        'btn-settings':       'soloSettings',
        'link-about':         'aboutProject',
        'lbl-mode-title':     'selectMode',
        'btn-solo':           'soloStudySpace',
        'btn-multiplayer':    'multiplayerSoon',
        'btn-mode-back':      'back',
        'lbl-config-title':   'soloSettings',
        'lbl-cfg-focus':      'focusDuration',
        'lbl-cfg-break':      'breakDuration',
        'lbl-cfg-cycles':     'sessionCycles',
        'lbl-cfg-map':        'selectMap',
        'lbl-cfg-npc':        'npcStudyBuddies',
        'lbl-cfg-ambient':    'ambientSound',
        'lbl-cfg-volume':     'masterVolume',
        'lbl-cfg-language':   'language',
        'opt-map-cafeteria':  'mapCafeteria',
        'opt-map-library':    'mapLibrary',
        'opt-map-garden':     'mapGarden',
        'opt-ambient-off':    'ambientOff',
        'opt-ambient-rain':   'ambientRain',
        'opt-ambient-cafe':   'ambientCafe',
        'opt-ambient-fire':   'ambientFire',
        'opt-ambient-binaural': 'ambientBinaural',
        'btn-config-back':    'back',
        'lbl-custom-title':   'userCustomization',
        'lbl-custom-name':    'playerNameTag',
        'lbl-custom-color':   'avatarColor',
        'opt-color-ness':     'colorNess',
        'opt-color-paula':    'colorPaula',
        'opt-color-jeff':     'colorJeff',
        'opt-color-poo':      'colorPoo',
        'opt-color-purple':   'colorPurple',
        'opt-color-gold':     'colorGold',
        'btn-save-custom':    'saveAvatar',
        'btn-custom-back':    'back',
        'lbl-pause-title':    'gamePaused',
        'lbl-stat-today':     'statTodayMin',
        'lbl-stat-sessions':  'statCompleted',
        'lbl-stat-total':     'statTotalFocus',
        'lbl-stat-streak':    'statStreak',
        'lbl-weekly-title':   'statWeeklyTitle',
        'btn-resume':         'resume',
        'btn-pause-tasks':    'tasksButton',
        'btn-pause-settings': 'settings',
        'btn-exit-main':      'exitMainMenu',
        'hud-tag':            'currentFocus',
        'btn-hud-skip':       'hudSkip',
        'btn-hud-tasks':      'tasksButton',
        'lbl-drawer-title':   'focusTasks',
        'btn-add-task':       'addTask',
        'lbl-drawer-footer':  'taskTip',
        'legend-move':        'legendMove',
        'legend-interact':    'legendInteract',
        'legend-pause':       'legendPause',
        'legend-tasks':       'legendTasks',
        'legend-mute':        'legendMute',
        'legend-menu':        'legendMenu'
    };

    function applyLanguage(lang) {
        i18n.setLanguage(lang);
        currentConfig.language = lang;

        langButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        if (languageSelect) languageSelect.value = lang;

        Object.keys(TEXT_BINDINGS).forEach(id => {
            const node = el(id);
            if (node) node.textContent = i18n.t(TEXT_BINDINGS[id]);
        });

        if (startGameBtn) {
            startGameBtn.textContent = gameStarted && lastMenuPanel === 'pause' ? i18n.t('applyResume') : i18n.t('startGame');
        }
        if (btnHudPlay)  btnHudPlay.textContent  = gameState.pomodoro.isActive ? i18n.t('hudPause') : i18n.t('hudResume');
        if (btnHudSound) btnHudSound.textContent = sound.isMuted ? i18n.t('hudMuted') : i18n.t('hudAudio');
        if (taskInput)   taskInput.placeholder   = i18n.t('taskPlaceholder');

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
        const todayNode = el('stat-today-min');
        const sessNode  = el('stat-sessions');
        const totalNode = el('stat-total-focus');
        const strkNode  = el('stat-streak');

        if (todayNode) todayNode.textContent = stats.todayFocusMinutes;
        if (sessNode)  sessNode.textContent  = stats.completedSessions;
        if (strkNode)  strkNode.textContent  = stats.currentStreak;
        if (totalNode) {
            const hrs  = Math.floor(stats.totalFocusMinutes / 60);
            const mins = stats.totalFocusMinutes % 60;
            totalNode.textContent = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
        }

        const barsContainer = el('stats-weekly-bars');
        if (barsContainer) {
            barsContainer.innerHTML = '';
            const history = statsTracker.getWeeklyHistory();
            const maxMin  = Math.max(25, ...history.map(d => d.minutes));

            history.forEach(day => {
                const col = document.createElement('div');
                col.className = `weekly-bar-col ${day.isToday ? 'today' : ''}`;

                const val = document.createElement('span');
                val.className   = 'weekly-bar-val';
                val.textContent = day.minutes > 0 ? `${day.minutes}` : '';

                const fill = document.createElement('div');
                fill.className    = 'weekly-bar-fill';
                const heightPct   = Math.max(6, Math.round((day.minutes / maxMin) * 38));
                fill.style.height = `${heightPct}px`;

                const lbl = document.createElement('span');
                lbl.className   = 'weekly-bar-lbl';
                lbl.textContent = day.label;

                col.appendChild(val);
                col.appendChild(fill);
                col.appendChild(lbl);
                barsContainer.appendChild(col);
            });
        }
    }

    function updateHUDActiveTask() {
        const active   = taskManager.getActiveTask();
        const textNode = el('hud-task-text');
        const pomoNode = el('hud-task-pomo');
        if (textNode) {
            textNode.textContent = active ? active.text : i18n.t('defaultTask');
        }
        if (pomoNode) {
            const done   = active ? (active.pomodorosCompleted || 0) : 0;
            const target = active ? (active.pomodorosTarget || 1) : 1;
            pomoNode.textContent = `🍅 ${done}/${target}`;
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
            span.addEventListener('click', () => {
                taskManager.setActiveTask(t.id);
                renderTasks();
                updateHUDActiveTask();
            });

            const pomoBtn = document.createElement('button');
            pomoBtn.type        = 'button';
            pomoBtn.className   = 'task-pomo-btn';
            pomoBtn.title       = i18n.t('taskEstTitle');
            pomoBtn.textContent = `🍅 ${t.pomodorosCompleted || 0}/${t.pomodorosTarget || 1}`;
            pomoBtn.addEventListener('click', () => {
                taskManager.cycleTaskTarget(t.id);
                renderTasks();
                updateHUDActiveTask();
            });

            const del = document.createElement('button');
            del.type        = 'button';
            del.className   = 'task-del';
            del.textContent = '✕';
            del.addEventListener('click', () => {
                taskManager.deleteTask(t.id);
                renderTasks();
                updateHUDActiveTask();
            });

            item.appendChild(chk);
            item.appendChild(span);
            item.appendChild(pomoBtn);
            item.appendChild(del);
            taskList.appendChild(item);
        });

        updateHUDActiveTask();
    }

    function toggleTaskDrawer(show = null) {
        if (!taskDrawer) return;
        const isVisible  = !taskDrawer.classList.contains('hidden');
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
        const timer    = gameState.pomodoro;
        timer.isActive = !timer.isActive;
        syncTimerWallClock();
        if (btnHudPlay) {
            btnHudPlay.textContent = timer.isActive ? i18n.t('hudPause') : i18n.t('hudResume');
        }
        sound.play('click');
    }

    function skipPomodoroSession() {
        syncTimerWallClock();
        gameState.pomodoro.timerSeconds = 0.05;
        sound.play('click');
    }

    function showPanel(target) {
        const panels = {
            'main':   mainMenuPanel,
            'mode':   modeMenuPanel,
            'config': configMenuPanel,
            'custom': customMenuPanel,
            'pause':  pauseMenuPanel
        };

        syncTimerWallClock();

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
            if (panels[key]) panels[key].classList.toggle('hidden', key !== target);
        });

        if (target === 'pause') updateStatsDisplay();
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

                    if (!isNaN(focusVal) && focusVal >= 1 && focusVal <= 180)   currentConfig.focusTime   = focusVal;
                    if (!isNaN(breakVal) && breakVal >= 1 && breakVal <= 60)    currentConfig.breakTime   = breakVal;
                    if (!isNaN(cyclesVal) && cyclesVal >= 1 && cyclesVal <= 12) currentConfig.cycles      = cyclesVal;
                    if (!isNaN(npcVal) && npcVal >= 0 && npcVal <= 14)         currentConfig.npcCount    = npcVal;
                    if (['cafeteria', 'library', 'garden'].includes(config.map)) currentConfig.map        = config.map;
                    if (typeof config.playerName === 'string' && config.playerName.trim()) {
                        currentConfig.playerName = config.playerName.trim();
                    }
                    if (typeof config.playerColor === 'string' && config.playerColor.startsWith('#')) {
                        currentConfig.playerColor = config.playerColor;
                    }
                    if (['en', 'es', 'ja'].includes(config.language)) currentConfig.language = config.language;

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
    function bindClick(id, handler) {
        const node = el(id);
        if (node) node.addEventListener('click', handler);
    }

    bindClick('btn-play',           () => { sound.play('click'); showPanel('mode'); });
    bindClick('btn-mode-back',      () => { sound.play('click'); showPanel('main'); });
    bindClick('btn-mode-close',     () => { sound.play('click'); showPanel('main'); });
    bindClick('btn-solo',           () => { sound.play('click'); lastMenuPanel = 'mode'; showPanel('config'); });
    bindClick('btn-config-back',    () => { sound.play('click'); showPanel(lastMenuPanel); });
    bindClick('btn-config-close',   () => { sound.play('click'); showPanel(lastMenuPanel); });
    bindClick('btn-settings',       () => { sound.play('click'); lastMenuPanel = 'main'; showPanel('config'); });
    bindClick('btn-custom',         () => { sound.play('click'); showPanel('custom'); });
    bindClick('btn-custom-back',    () => { sound.play('click'); showPanel('main'); });
    bindClick('btn-custom-close',   () => { sound.play('click'); showPanel('main'); });
    bindClick('btn-resume',         () => { sound.play('click'); lastTime = performance.now(); showPanel('none'); });
    bindClick('btn-pause-close',    () => { sound.play('click'); lastTime = performance.now(); showPanel('none'); });
    bindClick('btn-pause-tasks',    () => { sound.play('click'); toggleTaskDrawer(true); });
    bindClick('btn-pause-settings', () => { sound.play('click'); lastMenuPanel = 'pause'; showPanel('config'); });
    bindClick('btn-exit-main',      () => { sound.play('click'); sound.stopAmbient(); showPanel('main'); });
    bindClick('btn-close-tasks',    () => toggleTaskDrawer(false));
    bindClick('legend-menu',        () => { sound.play('click'); showPanel('pause'); });
    bindClick('btn-hud-play',       toggleTimerPlayPause);
    bindClick('btn-hud-skip',       skipPomodoroSession);
    bindClick('btn-hud-tasks',      () => toggleTaskDrawer());

    bindClick('btn-hud-interact', () => {
        const player = gameState.players['my_id'];
        if (nearbyInteract && player) {
            interactionManager.handleInteraction(player, nearbyInteract);
        }
    });

    bindClick('btn-hud-sound', () => {
        const isMuted = sound.toggleMute();
        if (btnHudSound) btnHudSound.textContent = isMuted ? i18n.t('hudMuted') : i18n.t('hudAudio');
        sound.play('click');
    });

    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            applyLanguage(btn.dataset.lang);
            sound.play('click');
        });
    });

    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            applyLanguage(e.target.value);
            sound.play('click');
        });
    }

    bindClick('btn-save-custom', () => {
        if (playerNameInput && playerNameInput.value.trim()) {
            currentConfig.playerName = playerNameInput.value.trim();
        }
        if (playerColorSelect) {
            currentConfig.playerColor = playerColorSelect.value;
        }
        try {
            localStorage.setItem('pomodoroConfig', JSON.stringify(currentConfig));
        } catch (_) {}

        initGameWorld(gameStarted);
        showPanel('main');
    });

    bindClick('btn-start-game', () => {
        const prevMap       = currentConfig.map;
        const prevFocusTime = currentConfig.focusTime;
        const isResuming    = gameStarted && lastMenuPanel === 'pause';

        const focusVal  = focusInput ? parseInt(focusInput.value, 10) : 25;
        const breakVal  = breakInput ? parseInt(breakInput.value, 10) : 5;
        const cyclesVal = cyclesInput ? parseInt(cyclesInput.value, 10) : 4;
        const npcVal    = npcInput ? parseInt(npcInput.value, 10) : 5;
        const mapVal    = mapSelect ? mapSelect.value : 'cafeteria';
        const langVal   = languageSelect ? languageSelect.value : 'en';

        Object.assign(currentConfig, {
            focusTime: (!isNaN(focusVal) && focusVal >= 1 && focusVal <= 180) ? focusVal : 25,
            breakTime: (!isNaN(breakVal) && breakVal >= 1 && breakVal <= 60) ? breakVal : 5,
            cycles:    (!isNaN(cyclesVal) && cyclesVal >= 1 && cyclesVal <= 12) ? cyclesVal : 4,
            map:       ['cafeteria', 'library', 'garden'].includes(mapVal) ? mapVal : 'cafeteria',
            npcCount:  (!isNaN(npcVal) && npcVal >= 0 && npcVal <= 14) ? npcVal : 5,
            language:  ['en', 'es', 'ja'].includes(langVal) ? langVal : 'en'
        });

        try {
            localStorage.setItem('pomodoroConfig', JSON.stringify(currentConfig));
        } catch (_) {}

        if (ambientSelect) {
            sound.setAmbientType(ambientSelect.value);
        }

        applyLanguage(currentConfig.language);

        const preserveSession = isResuming && prevMap === currentConfig.map;
        initGameWorld(preserveSession);

        if (preserveSession && prevFocusTime !== currentConfig.focusTime && gameState.pomodoro.mode === 'WORK') {
            const diffSec = (currentConfig.focusTime - prevFocusTime) * 60;
            gameState.pomodoro.timerSeconds = Math.max(10, gameState.pomodoro.timerSeconds + diffSec);
        }

        updateHUDActiveTask();
        gameStarted = true;
        showPanel('none');
        lastTime = performance.now();
        syncTimerWallClock();
        sound.play(isResuming ? 'click' : 'focus_start');
    });

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

    // ----------------------------------------------------------------------------
    // Universal Keyboard Shortcuts
    // ----------------------------------------------------------------------------
    window.addEventListener('keydown', (e) => {
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(activeTag)) {
            if (e.key === 'Escape') {
                document.activeElement.blur();
                toggleTaskDrawer(false);
            }
            return;
        }

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
                } else if (pauseMenuPanel && !pauseMenuPanel.classList.contains('hidden')) {
                    lastTime = performance.now();
                    showPanel('none');
                } else if (configMenuPanel && !configMenuPanel.classList.contains('hidden')) {
                    showPanel(lastMenuPanel);
                } else if (
                    (customMenuPanel && !customMenuPanel.classList.contains('hidden')) ||
                    (modeMenuPanel && !modeMenuPanel.classList.contains('hidden'))
                ) {
                    showPanel('main');
                }
            }
            return;
        }

        if (isMenuVisible()) return;

        if (e.key === 'e' || e.key === 'E') {
            const player = gameState.players['my_id'];
            if (nearbyInteract && player) {
                interactionManager.handleInteraction(player, nearbyInteract);
            }
        } else if (e.key === ' ') {
            e.preventDefault();
            toggleTimerPlayPause();
        } else if (e.key === 't' || e.key === 'T') {
            e.preventDefault();
            toggleTaskDrawer();
        } else if (e.key === 'm' || e.key === 'M') {
            const isMuted = sound.toggleMute();
            if (btnHudSound) btnHudSound.textContent = isMuted ? i18n.t('hudMuted') : i18n.t('hudAudio');
        } else if (e.key === 'Tab') {
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
