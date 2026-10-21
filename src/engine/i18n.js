// Internationalization (i18n) Module
// Supports English (Default), Spanish (Español), and Japanese (日本語)

export const TRANSLATIONS = {
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

export const i18n = new I18nManager();
