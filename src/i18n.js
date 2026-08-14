const LANG_STORAGE_KEY = 'dino_dig_lang_v1';

const listeners = new Set();

function detectDefaultLang() {
    try {
        const bridge = window.Bridge;
        if (bridge) {
            const envLang = bridge.getEnvLanguage();
            if (envLang === 'ru' || envLang === 'en') return envLang;
        }
    } catch (e) { /* ignore */ }
    return 'ru';
}

function loadStoredLang() {
    try {
        const saved = localStorage.getItem(LANG_STORAGE_KEY);
        if (saved === 'ru' || saved === 'en') return saved;
    } catch (e) { /* ignore */ }
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
    try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch (e) { /* ignore */ }
    document.documentElement.lang = lang;
    listeners.forEach(cb => cb(lang));
}

export function onLangChange(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
}

const STRINGS = {
    ru: {
        navMap: '🗺️ Карта',
        navMuseum: '🏛️ Музей',
        navMapShort: 'Карта',
        navMuseumShort: 'Музей',
        settingsBtn: '⚙️',
        settingsTitle: 'Настройки',
        settingsLang: 'Язык',
        settingsClose: 'Закрыть',

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

        levelBadgeLabel: 'Уровень',
        movesTitle: 'Ходы',
        scoreTitle: 'Очки',
        toolsTitle: 'Инструменты',
        pickaxeLabel: '⛏️ Кирка (1)',
        dynamiteLabel: '🧨 Динамит (2)',

        goalLabelDig: 'Раскопай кости',
        goalLabelCrates: 'Разбей ящики',
        goalLabelDrop: 'Спусти кости',

        museumBarLabel: 'Кости',

        modalNextTitle: 'Следующий уровень',
        modalRetryTitle: 'Попробовать снова',
        modalMuseumTitle: 'В музей',
        modalHomeTitle: 'На карту',

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
        levelNodeTooltip: (label, n) => `${label} · уровень ${n}`,

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
        navMap: '🗺️ Map',
        navMuseum: '🏛️ Museum',
        navMapShort: 'Map',
        navMuseumShort: 'Museum',
        settingsBtn: '⚙️',
        settingsTitle: 'Settings',
        settingsLang: 'Language',
        settingsClose: 'Close',

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

        levelBadgeLabel: 'Level',
        movesTitle: 'Moves',
        scoreTitle: 'Score',
        toolsTitle: 'Tools',
        pickaxeLabel: '⛏️ Pickaxe (1)',
        dynamiteLabel: '🧨 Dynamite (2)',

        goalLabelDig: 'Dig up bones',
        goalLabelCrates: 'Break the crates',
        goalLabelDrop: 'Drop the bones down',

        museumBarLabel: 'Bones',

        modalNextTitle: 'Next level',
        modalRetryTitle: 'Try again',
        modalMuseumTitle: 'Go to museum',
        modalHomeTitle: 'Go to map',

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
        levelNodeTooltip: (label, n) => `${label} · level ${n}`,

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

/**
 * @param {string} key
 * @param {...any} args
 */
export function t(key, ...args) {
    const table = STRINGS[currentLang] || STRINGS.ru;
    const entry = table[key];
    if (typeof entry === 'function') return entry(...args);
    if (entry !== undefined) return entry;
    return key;
}

document.documentElement.lang = currentLang;