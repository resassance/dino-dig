import { Game } from './core/Game.js';
import { Museum } from './core/Museum.js';
import { LevelMap } from './core/LevelMap.js';
import { setDinoLanguage } from './config.js';
import { t, getLang, setLang, onLangChange } from './i18n.js';

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
// Все статические подписи помечены атрибутами data-i18n / data-i18n-title —
// один общий проход по ним обновляет весь интерфейс сразу.
function applyStaticTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        el.title = t(el.dataset.i18nTitle);
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

onLangChange(() => refreshLanguage());

// Применяем язык сразу при загрузке (сохранённый выбор, либо язык окружения платформы,
// либо русский по умолчанию — см. src/i18n.js)
setDinoLanguage(getLang());
applyStaticTranslations();
updateLangButtons();

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
