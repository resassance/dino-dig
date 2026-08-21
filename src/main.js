import { Game } from './core/Game.js';
import { Museum } from './core/Museum.js';
import { LevelMap } from './core/LevelMap.js';
import { setDinoLanguage, ASSETS, COLOR_KEYS, DINO_DATA } from './config.js';
import { t, getLang, setLang, onLangChange, applyEnvLanguage } from './i18n.js';
import { loadImage } from './utils/AssetLoader.js';
import { openOverlay, closeOverlay } from './utils/overlay.js';

document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dragstart', e => e.preventDefault());
window.alert = () => {};
window.confirm = () => false;
window.prompt = () => null;

// Preload the sprites the board draws for every level (colors, bonuses,
// fossils) so the canvas never has to fall back to placeholder shapes
// while an image is still in flight.
COLOR_KEYS.forEach(key => loadImage(ASSETS.tileSprite(key)));
Object.values(ASSETS.bonusSprites).forEach(path => loadImage(path));
loadImage(ASSETS.fossilTileSprite);

// Preload every museum asset (bone icons + skeleton/alive artwork for each
// dino) up front too, so opening the museum never shows fossils popping in
// top-to-bottom while their images are still downloading.
Object.values(DINO_DATA).forEach(dino => {
    loadImage(ASSETS.dinoSkeleton(dino.id));
    loadImage(ASSETS.dinoAlive(dino.id));
    dino.bones.forEach(bone => loadImage(ASSETS.boneIcon(bone.id)));
});

// Localize dino text (names, latinName, description, etc.) BEFORE anything
// renders. Museum's constructor renders immediately, so if this ran later
// (as it used to, further down this file) that very first paint would show
// the raw, unlocalized config.js literal — e.g. the Latin name instead of
// the Russian display name — for a frame until the language was applied.
setDinoLanguage(getLang());

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
const gameScaleWrap = document.getElementById('gameScaleWrap');
const mainNav = document.querySelector('.main-nav');

function fitGameScreen() {
    if (!gameScaleWrap || !gameScreen || gameScreen.classList.contains('hidden')) return;
    const availableWidth = gameScreen.clientWidth;
    const availableHeight = gameScreen.clientHeight;
    gameScaleWrap.style.transform = 'none';
    const naturalWidth = gameScaleWrap.offsetWidth;
    const naturalHeight = gameScaleWrap.offsetHeight;
    if (!naturalWidth || !naturalHeight || !availableWidth || !availableHeight) return;
    const scale = Math.min(availableWidth / naturalWidth, availableHeight / naturalHeight, 1);
    gameScaleWrap.style.transform = `scale(${scale})`;
}

if (window.ResizeObserver) {
    const gameFitObserver = new ResizeObserver(() => fitGameScreen());
    if (gameScreen) gameFitObserver.observe(gameScreen);
    if (gameScaleWrap) gameFitObserver.observe(gameScaleWrap);
} else {
    window.addEventListener('resize', fitGameScreen);
    window.addEventListener('orientationchange', () => requestAnimationFrame(fitGameScreen));
}

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
    mainNav?.classList.add('hidden');
    setNavLocked(true);
    fitGameScreen();
}

function openMap() {
    btnNavMap?.classList.add('active');
    btnNavMuseum?.classList.remove('active');
    mapScreen?.classList.remove('hidden');
    gameScreen?.classList.add('hidden');
    museumScreen?.classList.add('hidden');
    mainNav?.classList.remove('hidden');
    setNavLocked(false);
    levelMap.render();
}

function openMuseum() {
    btnNavMuseum?.classList.add('active');
    btnNavMap?.classList.remove('active');
    museumScreen?.classList.remove('hidden');
    gameScreen?.classList.add('hidden');
    mapScreen?.classList.add('hidden');
    mainNav?.classList.remove('hidden');
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

function applyStaticTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
}

function updateLangButtons() {
    const lang = getLang();
    if (btnLangToggle) {
        btnLangToggle.textContent = lang === 'ru' ? 'Русский' : 'English';
    }
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
const btnSettingsGame = document.getElementById('btnSettingsGame');
const settingsOverlay = document.getElementById('settingsOverlay');
const btnSettingsClose = document.getElementById('btnSettingsClose');
const btnLangToggle = document.getElementById('btnLangToggle');

function openSettings() {
    openOverlay(settingsOverlay);
    game.pause();
}

btnSettings?.addEventListener('click', openSettings);
btnSettingsGame?.addEventListener('click', openSettings);

function closeSettings() {
    closeOverlay(settingsOverlay);
    game.resume();
}

btnSettingsClose?.addEventListener('click', closeSettings);
settingsOverlay?.addEventListener('click', (e) => {
    if (e.target === settingsOverlay) closeSettings();
});

btnLangToggle?.addEventListener('click', () => {
    setLang(getLang() === 'ru' ? 'en' : 'ru');
});

const btnPause = document.getElementById('btnPause');
const pauseOverlay = document.getElementById('pauseOverlay');
const btnPauseResume = document.getElementById('btnPauseResume');
const btnPauseMap = document.getElementById('btnPauseMap');
const btnPauseMuseum = document.getElementById('btnPauseMuseum');
const btnPauseRestart = document.getElementById('btnPauseRestart');
const btnPauseGiveUp = document.getElementById('btnPauseGiveUp');

function openPauseMenu() {
    openOverlay(pauseOverlay);
    game.pause();
}

function closePauseMenu() {
    closeOverlay(pauseOverlay);
    game.resume();
}

btnPause?.addEventListener('click', openPauseMenu);
btnPauseResume?.addEventListener('click', closePauseMenu);
pauseOverlay?.addEventListener('click', (e) => {
    if (e.target === pauseOverlay) closePauseMenu();
});

const pauseConfirmOverlay = document.getElementById('pauseConfirmOverlay');
const btnPauseConfirmOk = document.getElementById('btnPauseConfirmOk');
const btnPauseConfirmCancel = document.getElementById('btnPauseConfirmCancel');
let pendingPauseAction = null;

function askPauseConfirm(action) {
    pendingPauseAction = action;
    closeOverlay(pauseOverlay);
    openOverlay(pauseConfirmOverlay);
}

function cancelPauseConfirm() {
    pendingPauseAction = null;
    closeOverlay(pauseConfirmOverlay);
    openOverlay(pauseOverlay);
}

btnPauseConfirmCancel?.addEventListener('click', cancelPauseConfirm);
pauseConfirmOverlay?.addEventListener('click', (e) => {
    if (e.target === pauseConfirmOverlay) cancelPauseConfirm();
});

btnPauseConfirmOk?.addEventListener('click', () => {
    const action = pendingPauseAction;
    pendingPauseAction = null;
    closeOverlay(pauseConfirmOverlay);
    game.resume();
    if (action) game.showAdThenRun(action);
});

btnPauseMap?.addEventListener('click', () => askPauseConfirm(() => game.pauseMenuGoToMap()));
btnPauseMuseum?.addEventListener('click', () => askPauseConfirm(() => game.pauseMenuGoToMuseum()));
btnPauseRestart?.addEventListener('click', () => askPauseConfirm(() => game.pauseMenuRestart()));
btnPauseGiveUp?.addEventListener('click', () => askPauseConfirm(() => game.pauseMenuGiveUp()));

onLangChange(() => refreshLanguage());

applyStaticTranslations();
updateLangButtons();

function mountIconSlot(slot) {
    const key = slot.dataset.icon;
    const path = key && ASSETS.uiIcons[key];
    if (!path) return;
    const probe = new Image();
    probe.onload = () => {
        const img = document.createElement('img');
        img.src = path;
        img.alt = '';
        img.className = 'ui-icon-img';
        slot.replaceChildren(img);
    };
    probe.src = path;
}

function mountAllIcons() {
    document.querySelectorAll('[data-icon]').forEach(mountIconSlot);
}

mountAllIcons();
window.__mountIconSlot = mountIconSlot;

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

const customTooltip = document.getElementById('customTooltip');
const customTooltipArrow = customTooltip?.querySelector('.custom-tooltip-arrow');
const customTooltipText = document.getElementById('customTooltipText');
const customTooltipAction = document.getElementById('customTooltipAction');
let tooltipActionHandler = null;

function positionTooltip(anchor) {
    if (!customTooltip) return;
    const rect = anchor.getBoundingClientRect();
    const tw = customTooltip.offsetWidth;
    let left = rect.left + rect.width / 2 - tw / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - tw - 10));
    const top = rect.bottom + 10;
    customTooltip.style.left = `${left}px`;
    customTooltip.style.top = `${top}px`;
    if (customTooltipArrow) {
        customTooltipArrow.style.left = `${rect.left + rect.width / 2 - left}px`;
    }
}

function showTooltip(anchor, text, actionLabel, onAction) {
    if (!customTooltip || !customTooltipText || !customTooltipAction) return;
    customTooltipText.textContent = text;
    if (actionLabel) {
        customTooltipAction.textContent = actionLabel;
        customTooltipAction.classList.remove('hidden');
    } else {
        customTooltipAction.classList.add('hidden');
    }
    tooltipActionHandler = onAction || null;
    customTooltip.classList.remove('hidden');
    positionTooltip(anchor);
    openOverlay(customTooltip);
}

function hideTooltip() {
    if (!customTooltip) return;
    closeOverlay(customTooltip, 180);
}

customTooltipAction?.addEventListener('click', () => {
    const handler = tooltipActionHandler;
    hideTooltip();
    if (handler) handler();
});

document.addEventListener('click', (e) => {
    if (!customTooltip || customTooltip.classList.contains('hidden')) return;
    if (customTooltip.contains(e.target)) return;
    if (e.target.closest && e.target.closest('[data-tooltip-trigger]')) return;
    hideTooltip();
});

const chipMoves = document.getElementById('chipMoves');
const chipScore = document.getElementById('chipScore');
const chipTools = document.getElementById('chipTools');
const btnAddMoves = document.getElementById('btnAddMoves');

chipMoves?.addEventListener('click', () => showTooltip(chipMoves, t('tooltipMovesInfo')));
chipScore?.addEventListener('click', () => showTooltip(chipScore, t('tooltipScoreInfo')));
chipTools?.addEventListener('click', () => showTooltip(chipTools, t('tooltipToolsInfo')));

btnAddMoves?.addEventListener('click', () => {
    showTooltip(btnAddMoves, t('tooltipAddMovesDesc'), t('tooltipAddMovesBtn'), () => {
        game.addMovesViaAd();
    });
});

game.onInsufficientTool = (toolName, btn) => {
    showTooltip(btn, t('tooltipAddToolsDesc'), t('tooltipAddToolsBtn'), () => {
        game.addToolsViaAd();
    });
};

(async () => {
    const bridge = window.Bridge;
    if (!bridge) return;

    await bridge.init({
        onPause: () => game.pause(),
        onResume: () => game.resume()
    });

    applyEnvLanguage();

    requestAnimationFrame(() => bridge.notifyGameReady());
})();
