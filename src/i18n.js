const LANG_STORAGE_KEY = 'dino_dig_lang_v1';

const listeners = new Set();

function detectDefaultLang() {
    try {
        const bridge = window.Bridge;
        if (bridge) {
            const envLang = bridge.getEnvLanguage();
            if (envLang === 'ru' || envLang === 'en') return envLang;
        }
    } catch (e) {  }
    return 'ru';
}

function loadStoredLang() {
    try {
        const saved = localStorage.getItem(LANG_STORAGE_KEY);
        if (saved === 'ru' || saved === 'en') return saved;
    } catch (e) {  }
    return null;
}

let currentLang = loadStoredLang() || detectDefaultLang();

export function getLang() {
    return currentLang;
}

export function setLang(lang) {
    if (lang !== 'ru' && lang !== 'en') return;
    if (lang === currentLang) return;
    currentLang = lang;
    try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch (e) {  }
    document.documentElement.lang = lang;
    listeners.forEach(cb => cb(lang));
}

export function onLangChange(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
}

const STRINGS = {
    ru: {
        navMapShort: 'Карта',
        navMuseumShort: 'Музей',
        settingsTitle: 'Настройки',
        settingsLang: 'Язык',

        pauseTitle: 'Пауза',
        pauseResume: 'Продолжить',
        pauseGoMap: 'На карту',
        pauseGoMuseum: 'В музей',
        pauseRestart: 'Начать заново',
        pauseGiveUp: 'Сдаться',
        pauseConfirmTitle: 'Точно?',
        pauseConfirmDesc: 'Прогресс этой попытки уровня будет потерян.',
        pauseConfirmCancel: 'Отмена',
        pauseConfirmOk: 'Да',

        tooltipMovesInfo: 'Ходы — каждый свап тайлов тратит один ход. Закончатся ходы — уровень придётся начать заново.',
        tooltipScoreInfo: 'Очки начисляются за каждое совпадение и активацию баффа. Чем длиннее цепочка — тем больше очков.',
        tooltipToolsInfo: 'Инструменты тратятся на кирку и динамит: кирка убирает один камушек, динамит — область 3×3.',
        tooltipAddMovesDesc: 'Закончились ходы раньше времени? Посмотри рекламу и получи ещё немного ходов на этот уровень.',
        tooltipAddMovesBtn: '▶️ Смотреть рекламу: +5 ходов',
        tooltipAddToolsDesc: 'Инструменты закончились. Посмотри рекламу и получи ещё немного инструментов.',
        tooltipAddToolsBtn: '▶️ Смотреть рекламу: +2 инструмента',

        modalWatchAdBtn: 'Смотреть рекламу: +5 ходов',

        levelBadgeLabel: 'Уровень',
        pickaxeLabel: '⛏️ Кирка (1)',
        dynamiteLabel: '🧨 Динамит (2)',

        goalLabelDig: 'Раскопай кости',
        goalLabelCrates: 'Разбей ящики',
        goalLabelDrop: 'Спусти кости',

        museumBarLabel: 'Кости',

        modalWinTitle: 'Уровень пройден!',
        modalWinDesc: 'Отличная работа! Уровень успешно пройден.',
        modalLoseTitle: 'Закончились ходы!',
        modalLoseDesc: 'Не удалось выполнить цель уровня.',
        modalAllDoneTitle: 'Все динозавры собраны!',
        modalAllDoneDesc: 'Поздравляем! Ты собрал все 60 костей 6 динозавров!',
        modalBonesCollected: (n) => `🦴 Собрано деталей (${n}):`,

        mapTitle: '🗺️ Карта уровней',
        mapSubtitle: 'Проходи уровни по порядку и открывай новые!',
        levelTypeDig: 'Раскопки',
        levelTypeCrates: 'Ящики со снаряжением',
        levelTypeDrop: 'Кости вниз',

        museumHeaderTitle: '🏛️ Главная Экспозиция',
        boneNamePlaceholder: 'Название кости',
        boneDescPlaceholder: 'Описание и факт о кости появятся здесь при клике на открытый фрагмент.',
        bonesCountLabel: (unlocked, total) => `${unlocked} / ${total} костей`,
        assembledBadge: '✅ Собран',
        assembleCtaText: 'Все фрагменты найдены! Собери скелет, чтобы увидеть экспонат.',
        assembleBtn: '✨ Собрать скелет',

        dinoAssembledTitle: 'Все кости собраны!',
        dinoAssembledDesc: (count, name) => `Поздравляем! Ты нашёл все ${count} фрагментов скелета<br><b>${name}</b>!`,
        goToMuseumBtn: '🏛️ Перейти в музей',

        toggleSkeleton: '🦴 Скелет',
        toggleAlive: (emoji) => `${emoji} Живой`,
        badgeSkeleton: 'Реконструированный скелет',
        badgeAlive: 'Живой организм',
        exhibitSkeletonTitle: (latinName) => `Скелет ${latinName}`,
        exhibitAliveTitle: (name) => `${name} в среде обитания`,
        exhibitSkeletonBioSuffix: (count) => ` Полный скелет содержит ${count} фрагментов.`,
        statLength: '📏 Длина:',
        statWeight: '⚖️ Вес:',
        statPeriod: '⏳ Период:'
    },
    en: {
        navMapShort: 'Map',
        navMuseumShort: 'Museum',
        settingsTitle: 'Settings',
        settingsLang: 'Language',

        pauseTitle: 'Paused',
        pauseResume: 'Resume',
        pauseGoMap: 'Go to map',
        pauseGoMuseum: 'Go to museum',
        pauseRestart: 'Restart level',
        pauseGiveUp: 'Give up',
        pauseConfirmTitle: 'Are you sure?',
        pauseConfirmDesc: 'Progress from this level attempt will be lost.',
        pauseConfirmCancel: 'Cancel',
        pauseConfirmOk: 'Yes',

        tooltipMovesInfo: 'Moves — every tile swap costs one move. Run out of moves and the level restarts.',
        tooltipScoreInfo: 'Score is earned for every match and bonus activation. Longer chains are worth more.',
        tooltipToolsInfo: 'Tools power the pickaxe and dynamite: the pickaxe clears one tile, dynamite clears a 3x3 area.',
        tooltipAddMovesDesc: "Ran out of moves early? Watch an ad to get a few more moves for this level.",
        tooltipAddMovesBtn: '▶️ Watch ad: +5 moves',
        tooltipAddToolsDesc: 'Out of tools. Watch an ad to get a few more.',
        tooltipAddToolsBtn: '▶️ Watch ad: +2 tools',

        modalWatchAdBtn: 'Watch ad: +5 moves',

        levelBadgeLabel: 'Level',
        pickaxeLabel: '⛏️ Pickaxe (1)',
        dynamiteLabel: '🧨 Dynamite (2)',

        goalLabelDig: 'Dig up bones',
        goalLabelCrates: 'Break the crates',
        goalLabelDrop: 'Drop the bones down',

        museumBarLabel: 'Bones',

        modalWinTitle: 'Level complete!',
        modalWinDesc: 'Great job! You cleared the level.',
        modalLoseTitle: 'Out of moves!',
        modalLoseDesc: "You didn't reach the level goal in time.",
        modalAllDoneTitle: 'All dinosaurs assembled!',
        modalAllDoneDesc: "Congratulations! You've collected all 60 bones of all 6 dinosaurs!",
        modalBonesCollected: (n) => `🦴 Bones found (${n}):`,

        mapTitle: '🗺️ Level Map',
        mapSubtitle: 'Complete levels in order to unlock new ones!',
        levelTypeDig: 'Digging',
        levelTypeCrates: 'Supply crates',
        levelTypeDrop: 'Falling bones',

        museumHeaderTitle: '🏛️ Main Exhibition',
        boneNamePlaceholder: 'Bone name',
        boneDescPlaceholder: 'Tap an unlocked fragment to see its description and fun fact here.',
        bonesCountLabel: (unlocked, total) => `${unlocked} / ${total} bones`,
        assembledBadge: '✅ Assembled',
        assembleCtaText: 'All fragments found! Assemble the skeleton to see the exhibit.',
        assembleBtn: '✨ Assemble skeleton',

        dinoAssembledTitle: 'All bones found!',
        dinoAssembledDesc: (count, name) => `Congratulations! You found all ${count} skeleton fragments of<br><b>${name}</b>!`,
        goToMuseumBtn: '🏛️ Go to museum',

        toggleSkeleton: '🦴 Skeleton',
        toggleAlive: (emoji) => `${emoji} Alive`,
        badgeSkeleton: 'Reconstructed skeleton',
        badgeAlive: 'Living organism',
        exhibitSkeletonTitle: (latinName) => `${latinName} skeleton`,
        exhibitAliveTitle: (name) => `${name} in its habitat`,
        exhibitSkeletonBioSuffix: (count) => ` The full skeleton has ${count} fragments.`,
        statLength: '📏 Length:',
        statWeight: '⚖️ Weight:',
        statPeriod: '⏳ Period:'
    }
};

export function t(key, ...args) {
    const table = STRINGS[currentLang] || STRINGS.ru;
    const entry = table[key];
    if (typeof entry === 'function') return entry(...args);
    if (entry !== undefined) return entry;
    return key;
}

document.documentElement.lang = currentLang;
