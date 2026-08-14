import { Game } from './core/Game.js';
import { Museum } from './core/Museum.js';
import { LevelMap } from './core/LevelMap.js';
import { setDinoLanguage, ASSETS } from './config.js';
import { t, getLang, setLang, onLangChange } from './i18n.js';
import { createImgOrEmoji, loadImage } from './utils/AssetLoader.js';

// ── Требования Yandex Games: без нативных контекстных меню, тултипов и
// блокирующих браузерных диалогов (alert/confirm/prompt) ────────────────────
// Тултипы по наведению (атрибут title) убраны из разметки — этого хватает,
// т.к. мы нигде не проставляем title через JS. Контекстное меню/drag-иллюзия
// картинок и блокирующие диалоги отключаем на уровне всего документа —
// раньше это было запрещено только на канвасе.
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dragstart', e => e.preventDefault());
window.alert = () => {};
window.confirm = () => false;
window.prompt = () => null;

const canvas = document.getElementById('gameCanvas');
const museum = new Museum();
const game = new Game(canvas, museum);
const levelMap = new LevelMap((levelNumber) => game.jumpToLevel(levelNumber));
game.setLevelMap(levelMap);

const btnNavMap = document.getElementById('btnNavMap');
const btnNavMuseum = document.getElementById('btnNavMuseum');
const gameScreen = document.getElementById('gameScreen');
const mapScreen = document.getElementById('mapScreen');
const museumScreen = document.getElementById('museumScreen');

function setNavLocked(locked) {
    if (btnNavMap) btnNavMap.disabled = locked;
    if (btnNavMuseum) btnNavMuseum.disabled = locked;
}

function openGame() {
    btnNavMap?.classList.remove('active');
    btnNavMuseum?.classList.remove('active');
    gameScreen?.classList.remove('hidden');
    mapScreen?.classList.add('hidden');
    museumScreen?.classList.add('hidden');
    setNavLocked(true);
}

function openMap() {
    btnNavMap?.classList.add('active');
    btnNavMuseum?.classList.remove('active');
    mapScreen?.classList.remove('hidden');
    gameScreen?.classList.add('hidden');
    museumScreen?.classList.add('hidden');
    setNavLocked(false);
    levelMap.render();
}

function openMuseum() {
    btnNavMuseum?.classList.add('active');
    btnNavMap?.classList.remove('active');
    museumScreen?.classList.remove('hidden');
    gameScreen?.classList.add('hidden');
    mapScreen?.classList.add('hidden');
    setNavLocked(false);
    museum.render();
}

btnNavMap?.addEventListener('click', openMap);
btnNavMuseum?.addEventListener('click', openMuseum);

window.addEventListener('switchTab', (e) => {
    if (e.detail === 'museum') {
        openMuseum();
    } else if (e.detail === 'game') {
        openGame();
    } else if (e.detail === 'map') {
        openMap();
    }
});

// ── Локализация ───────────────────────────────────────────────────────────
// Все статические подписи помечены атрибутом data-i18n — один общий проход
// по ним обновляет весь интерфейс сразу. Подписи по наведению (title) больше
// нигде не используются (требование Yandex Games — без нативных тултипов).
function applyStaticTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
}

function updateLangButtons() {
    const lang = getLang();
    btnLangRu?.classList.toggle('active', lang === 'ru');
    btnLangEn?.classList.toggle('active', lang === 'en');
}

function refreshLanguage() {
    const lang = getLang();
    setDinoLanguage(lang);
    applyStaticTranslations();
    updateLangButtons();
    museum.render();
    levelMap.render();
    game.updateUI();
}

const btnSettings = document.getElementById('btnSettings');
const settingsOverlay = document.getElementById('settingsOverlay');
const btnSettingsClose = document.getElementById('btnSettingsClose');
const btnLangRu = document.getElementById('btnLangRu');
const btnLangEn = document.getElementById('btnLangEn');

btnSettings?.addEventListener('click', () => {
    settingsOverlay?.classList.remove('hidden');
    game.pause();
});

function closeSettings() {
    settingsOverlay?.classList.add('hidden');
    game.resume();
}

btnSettingsClose?.addEventListener('click', closeSettings);
settingsOverlay?.addEventListener('click', (e) => {
    if (e.target === settingsOverlay) closeSettings();
});

btnLangRu?.addEventListener('click', () => setLang('ru'));
btnLangEn?.addEventListener('click', () => setLang('en'));

// ── Пауза во время уровня ────────────────────────────────────────────────
const btnPause = document.getElementById('btnPause');
const pauseOverlay = document.getElementById('pauseOverlay');
const btnPauseResume = document.getElementById('btnPauseResume');
const btnPauseMap = document.getElementById('btnPauseMap');
const btnPauseMuseum = document.getElementById('btnPauseMuseum');
const btnPauseRestart = document.getElementById('btnPauseRestart');
const btnPauseGiveUp = document.getElementById('btnPauseGiveUp');

function openPauseMenu() {
    pauseOverlay?.classList.remove('hidden');
    game.pause();
}

function closePauseMenu() {
    pauseOverlay?.classList.add('hidden');
    game.resume();
}

btnPause?.addEventListener('click', openPauseMenu);
btnPauseResume?.addEventListener('click', closePauseMenu);
pauseOverlay?.addEventListener('click', (e) => {
    if (e.target === pauseOverlay) closePauseMenu();
});

// Каждое действие меню паузы, кроме "Продолжить", необратимо (прогресс
// попытки уровня теряется) — поэтому сначала спрашиваем подтверждение своим
// модальным окном (нативный confirm() запрещён требованиями Yandex Games).
const pauseConfirmOverlay = document.getElementById('pauseConfirmOverlay');
const btnPauseConfirmOk = document.getElementById('btnPauseConfirmOk');
const btnPauseConfirmCancel = document.getElementById('btnPauseConfirmCancel');
let pendingPauseAction = null;

function askPauseConfirm(action) {
    pendingPauseAction = action;
    pauseOverlay?.classList.add('hidden');
    pauseConfirmOverlay?.classList.remove('hidden');
}

function cancelPauseConfirm() {
    pendingPauseAction = null;
    pauseConfirmOverlay?.classList.add('hidden');
    pauseOverlay?.classList.remove('hidden');
}

btnPauseConfirmCancel?.addEventListener('click', cancelPauseConfirm);
pauseConfirmOverlay?.addEventListener('click', (e) => {
    if (e.target === pauseConfirmOverlay) cancelPauseConfirm();
});

btnPauseConfirmOk?.addEventListener('click', () => {
    const action = pendingPauseAction;
    pendingPauseAction = null;
    pauseConfirmOverlay?.classList.add('hidden');
    game.resume();
    action?.();
});

btnPauseMap?.addEventListener('click', () => askPauseConfirm(() => game.pauseMenuGoToMap()));
btnPauseMuseum?.addEventListener('click', () => askPauseConfirm(() => game.pauseMenuGoToMuseum()));
btnPauseRestart?.addEventListener('click', () => askPauseConfirm(() => game.pauseMenuRestart()));
btnPauseGiveUp?.addEventListener('click', () => askPauseConfirm(() => game.pauseMenuGiveUp()));

onLangChange(() => refreshLanguage());

// Применяем язык сразу при загрузке (сохранённый выбор, либо язык окружения платформы,
// либо русский по умолчанию — см. src/i18n.js)
setDinoLanguage(getLang());
applyStaticTranslations();
updateLangButtons();

// ── Кастомные иконки интерфейса ──────────────────────────────────────────
// Настройки/карта/музей — по умолчанию эмодзи; если положить файл по пути
// из ASSETS.uiIcons, он подхватится автоматически (см. AssetLoader.js).
function mountIcon(slotId, path, fallbackEmoji, extraClass) {
    const slot = document.getElementById(slotId);
    if (!slot) return;
    const node = createImgOrEmoji(path, fallbackEmoji, extraClass || '');
    slot.replaceChildren(node);
}

// Пауза — особый случай: заглушка по умолчанию нарисована на CSS (две
// амбер-палочки), а не эмодзи ⏸️ (в большинстве шрифтов это цветной синий
// квадрат, выбивающийся из круглой кнопки и цветовой схемы — см. скрин бага).
// Поэтому здесь НЕ используем текстовый emoji-фолбэк: если своей картинки
// нет или она не загрузилась — просто оставляем CSS-заглушку как есть.
function mountCustomIcon(slotId, path) {
    const slot = document.getElementById(slotId);
    if (!slot || !path) return;
    const probe = new Image();
    probe.onload = () => {
        const img = document.createElement('img');
        img.src = path;
        img.alt = '';
        img.className = 'ui-icon-img pause-icon-img';
        slot.replaceChildren(img);
    };
    probe.src = path;
}

mountCustomIcon('pauseIconSlot', ASSETS.uiIcons.pause);
mountIcon('settingsIconSlot', ASSETS.uiIcons.settings, '⚙️', 'ui-icon-img settings-icon-img');
mountIcon('mapIconSlot', ASSETS.uiIcons.map, '🗺️', 'ui-icon-img bottom-nav-icon-img');
mountIcon('museumIconSlot', ASSETS.uiIcons.museum, '🏛️', 'ui-icon-img bottom-nav-icon-img');

// ── Кастомный фон игры (необязательно) ───────────────────────────────────
// Если ASSETS.background существует и грузится — показываем его поверх
// обычного тёмного градиента body, но с плавным затуханием в этот же
// градиент к низу экрана (там, где игровое поле и основной контент) — см.
// .custom-bg-layer в style.css. Нет файла — просто ничего не меняется.
(function initCustomBackground() {
    const layer = document.getElementById('customBgLayer');
    if (!layer || !ASSETS.background) return;
    const entry = loadImage(ASSETS.background);
    if (!entry) return;

    const apply = () => {
        layer.style.backgroundImage = `url('${ASSETS.background}')`;
        layer.classList.add('loaded');
    };

    if (entry.loaded) apply();
    else entry.img.addEventListener('load', apply, { once: true });
})();

// ── Yandex Games SDK (через platform-bridge.js, см. index.html) ──────────────
// Bridge сам определяет платформу (Yandex / CrazyGames / Telegram / standalone)
// и молча становится no-op вне известных площадок — безопасно вызывать всегда.
(async () => {
    const bridge = window.Bridge;
    if (!bridge) return;

    await bridge.init({
        onPause: () => game.pause(),
        onResume: () => game.resume()
    });

    // Сообщаем платформе, что игра прогружена и видна игроку — обязательный вызов
    // сразу после того, как интерфейс отрисован и с игрой уже можно взаимодействовать.
    requestAnimationFrame(() => bridge.notifyGameReady());
})();