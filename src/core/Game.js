import { CONFIG, DINO_DATA } from '../config.js';
import { t } from '../i18n.js';
import { Grid } from '../model/Grid.js';
import { DigLayer } from '../model/DigLayer.js';
import { InputManager } from './InputManager.js';
import { BoardRenderer } from '../view/BoardRenderer.js';
import { spawnBoneFly } from '../view/BoneFlyEffect.js';
import { openOverlay, closeOverlay } from '../utils/overlay.js';

export const STATE = {
    IDLE: 'IDLE',
    CHECKING: 'CHECKING',
    REMOVING: 'REMOVING',
    FALLING: 'FALLING',
    VICTORY: 'VICTORY',
    GAMEOVER: 'GAMEOVER'
};

const MAX_DIFFICULTY_TIER = 6;
const PROGRESS_STORAGE_KEY = 'dino_dig_progress_v1';
const MOVES_AD_REWARD = 5;
const TOOLS_AD_REWARD = 2;

export class Game {
    constructor(canvas, museum = null) {
        this.canvas = canvas;

        const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
        this.canvas.width = CONFIG.CANVAS_WIDTH * dpr;
        this.canvas.height = CONFIG.CANVAS_HEIGHT * dpr;

        this.ctx = canvas.getContext('2d');
        this.ctx.scale(dpr, dpr);
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'medium';
        this.museum = museum;
        this.levelMap = null;
        this.gameScreenEl = document.getElementById('gameScreen');
        this.grid = new Grid();
        this.digLayer = new DigLayer();
        this.renderer = new BoardRenderer(this.ctx, dpr);

        this.input = new InputManager(
            canvas,
            (c1, r1, c2, r2) => this.attemptSwap(c1, r1, c2, r2),
            (tool, c, r) => this.useTool(tool, c, r),
            (c, r) => this.activateBonus(c, r)
        );

        this.state = STATE.IDLE;
        this.currentLevel = 1;
        this.score = 0;
        this.moves = 20;
        this.tools = 3;
        this.goalProgress = 0;
        this.goalTarget = 0;
        this.combo = 0;
        this.pendingBonuses = [];
        this.activeTool = null;
        this.unlockedThisLevel = [];
        this.paused = false;

        this.currentDinoId = null;

        this.levelSequence = [1, 3, 2];

        this._loadProgress();

        this.ui = {
            score: document.getElementById('score'),
            moves: document.getElementById('moves'),
            tools: document.getElementById('tools'),
            goalText: document.getElementById('goalText'),
            goalIcon: document.getElementById('goalIcon'),
            goalLabel: document.getElementById('goalLabel'),
            goalBarFill: document.getElementById('goalBarFill'),
            levelNumber: document.getElementById('levelNumber'),
            levelTypeIcon: document.getElementById('levelTypeIcon'),
            museumCount: document.getElementById('museumCount'),
            museumProgress: document.getElementById('museumProgress'),
            currentDinoEmoji: document.getElementById('currentDinoEmoji'),
            currentDinoName: document.getElementById('currentDinoName'),
            btnPickaxe: document.getElementById('btnPickaxe'),
            btnDynamite: document.getElementById('btnDynamite'),
            modalOverlay: document.getElementById('modalOverlay'),
            modalIconBadge: document.getElementById('modalIconBadge'),
            modalTitle: document.getElementById('modalTitle'),
            modalDesc: document.getElementById('modalDesc'),
            modalScore: document.getElementById('modalScore'),
            btnModalNext: document.getElementById('btnModalNext'),
            modalNextIconSlot: document.getElementById('modalNextIconSlot'),
            btnModalMuseum: document.getElementById('btnModalMuseum'),
            btnModalHome: document.getElementById('btnModalHome'),
            btnModalWatchAd: document.getElementById('btnModalWatchAd'),
            boneFlyLayer: document.getElementById('boneFlyLayer'),
            btnNavMuseum: document.getElementById('btnNavMuseum')
        };

        this._bindUI();

        this.loadLevelByNumber(this.levelNumber);

        this.loop();
    }

    setLevelMap(levelMap) {
        this.levelMap = levelMap;
        this._syncLevelMap();
    }

    _loadProgress() {
        try {
            const saved = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY));
            if (saved && saved.levelNumber && saved.highestLevelReached) {
                this.levelNumber = saved.levelNumber;
                this.highestLevelReached = saved.highestLevelReached;
                return;
            }
        } catch (e) {  }
        this.levelNumber = 1;
        this.highestLevelReached = 1;
    }

    _saveProgress() {
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({
            levelNumber: this.levelNumber,
            highestLevelReached: this.highestLevelReached
        }));
        this._syncLevelMap();
    }

    _syncLevelMap() {
        if (this.levelMap) this.levelMap.update(this.levelNumber, this.highestLevelReached);
    }

    _typeForLevel(n) {
        return this.levelSequence[(n - 1) % this.levelSequence.length];
    }

    _tierForLevel(n) {
        return Math.min(Math.floor((n - 1) / 2), MAX_DIFFICULTY_TIER);
    }

    _getLevelParams(levelType, tier) {
        const t = Math.max(0, tier);

        if (levelType === 1) {
            const fossilCount = Math.min(2 + Math.floor(t / 2), 5);
            return {
                digDepth: t < 2 ? 1 : 2,
                fossilCount,
                goalTarget: fossilCount,
                moves: Math.max(16, 24 - t)
            };
        }

        if (levelType === 2) {
            const crateCount = Math.min(5 + t, 12);
            return {
                crateCount,
                goalTarget: crateCount,
                moves: Math.max(15, 20 - t)
            };
        }

        const fossilCount = Math.min(2 + Math.floor(t / 2), Math.min(5, CONFIG.COLS));
        return {
            fossilCount,
            goalTarget: fossilCount,
            moves: Math.max(13, 17 - t)
        };
    }

    loadLevelByNumber(n) {
        const type = this._typeForLevel(n);
        const tier = this._tierForLevel(n);
        this.loadLevel(type, tier);
    }

    _advanceLevelProgress() {
        this.levelNumber++;
        if (this.levelNumber > this.highestLevelReached) {
            this.highestLevelReached = this.levelNumber;
        }
        this._saveProgress();
    }

    loadNextLevel() {
        this._advanceLevelProgress();
        this.loadLevelByNumber(this.levelNumber);
    }

    jumpToLevel(n) {
        if (n > this.highestLevelReached) return;
        this.levelNumber = n;
        this._saveProgress();
        this.loadLevelByNumber(n);
        window.dispatchEvent(new CustomEvent('switchTab', { detail: 'game' }));
    }

    _bindUI() {
        const toolCosts = { pickaxe: 1, dynamite: 2 };
        const bindBooster = (btn, toolName) => {
            if (!btn) return;
            btn.addEventListener('click', () => {
                if (this.tools < toolCosts[toolName]) {
                    if (this.onInsufficientTool) this.onInsufficientTool(toolName, btn);
                    return;
                }
                this.activeTool = (this.activeTool === toolName) ? null : toolName;
                this.input.setActiveTool(this.activeTool);
                this._updateBoosterUI();
            });
            btn.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', toolName);
            });
        };

        bindBooster(this.ui.btnPickaxe, 'pickaxe');
        bindBooster(this.ui.btnDynamite, 'dynamite');

        if (this.ui.btnModalNext) {
            this.ui.btnModalNext.addEventListener('click', () => {
                closeOverlay(this.ui.modalOverlay);
                const wasVictory = this.state === STATE.VICTORY;
                this.showAdThenRun(() => {
                    if (wasVictory) this.loadNextLevel();
                    else this.loadLevelByNumber(this.levelNumber);
                });
            });
        }

        if (this.ui.btnModalMuseum) {
            this.ui.btnModalMuseum.addEventListener('click', () => {
                closeOverlay(this.ui.modalOverlay);
                const wasVictory = this.state === STATE.VICTORY;
                this.showAdThenRun(() => {
                    if (wasVictory) this._advanceLevelProgress();
                    window.dispatchEvent(new CustomEvent('switchTab', { detail: 'museum' }));
                });
            });
        }

        if (this.ui.btnModalHome) {
            this.ui.btnModalHome.addEventListener('click', () => {
                closeOverlay(this.ui.modalOverlay);
                const wasVictory = this.state === STATE.VICTORY;
                this.showAdThenRun(() => {
                    if (wasVictory) this._advanceLevelProgress();
                    window.dispatchEvent(new CustomEvent('switchTab', { detail: 'map' }));
                });
            });
        }

        if (this.ui.btnModalWatchAd) {
            this.ui.btnModalWatchAd.addEventListener('click', () => {
                this.continueAfterLossWithAd(MOVES_AD_REWARD);
            });
        }
    }

    showAdThenRun(callback) {
        const bridge = window.Bridge;
        if (!bridge) {
            callback();
            return;
        }
        const proceed = () => callback();
        const requested = bridge.showInterstitial({
            onClose: proceed,
            onError: proceed,
            onOffline: proceed
        });
        if (!requested) proceed();
    }

    addMovesViaAd(extraMoves = MOVES_AD_REWARD) {
        const bridge = window.Bridge;
        if (!bridge) return;
        bridge.showRewarded({
            onRewarded: () => {
                this.moves += extraMoves;
                this.updateUI();
            }
        });
    }

    addToolsViaAd(extraTools = TOOLS_AD_REWARD) {
        const bridge = window.Bridge;
        if (!bridge) return;
        bridge.showRewarded({
            onRewarded: () => {
                this.tools += extraTools;
                this.updateUI();
            }
        });
    }

    continueAfterLossWithAd(extraMoves = MOVES_AD_REWARD) {
        const bridge = window.Bridge;
        if (!bridge) return;
        bridge.showRewarded({
            onRewarded: () => {
                if (this.museum && this.unlockedThisLevel.length > 0) {
                    this.museum.restoreBones(this.unlockedThisLevel);
                }
                this.moves += extraMoves;
                this.state = STATE.IDLE;
                if (this.ui.modalOverlay) closeOverlay(this.ui.modalOverlay);
                this.updateUI();
                if (window.Bridge) window.Bridge.gameplayStart();
            }
        });
    }

    _updateBoosterUI() {
        if (this.ui.btnPickaxe) this.ui.btnPickaxe.classList.toggle('active', this.activeTool === 'pickaxe');
        if (this.ui.btnDynamite) this.ui.btnDynamite.classList.toggle('active', this.activeTool === 'dynamite');
    }

    _ensureTargetDino() {

        if (this.currentDinoId !== null && this.museum && !this.museum.isDinoComplete(this.currentDinoId)) {
            return;
        }
        if (!this.museum) {
            this.currentDinoId = 0;
            return;
        }
        const ids = Object.keys(DINO_DATA).map(Number);
        const incomplete = ids.filter(id => !this.museum.isDinoComplete(id));
        const pool = incomplete.length > 0 ? incomplete : ids;
        this.currentDinoId = pool[Math.floor(Math.random() * pool.length)];
    }

    loadLevel(levelType = 1, tier = 0) {

        this.state = STATE.IDLE;
        this.currentLevel = levelType;
        this._ensureTargetDino();

        const params = this._getLevelParams(levelType, tier);

        this.score = 0;
        this.moves = params.moves;
        this.tools = 3;
        this.goalProgress = 0;
        this.goalTarget = params.goalTarget;
        this.combo = 0;
        this.pendingBonuses = [];
        this.activeTool = null;
        this.unlockedThisLevel = [];

        if (this.input) {
            this.input.setActiveTool(null);
            this.input.selected = null;
        }

        if (this.ui && this.ui.modalOverlay) closeOverlay(this.ui.modalOverlay);
        this._updateBoosterUI();
        this.updateUI();

        this.grid = new Grid();
        this.digLayer = new DigLayer();

        if (levelType === 1) {
            this.digLayer.init(params.digDepth, params.fossilCount);
            this.grid.init(1);
        } else if (levelType === 2) {
            this.digLayer.init(0, []);
            this.grid.init(2, { crateCount: params.crateCount });
        } else if (levelType === 3) {
            this.digLayer.init(0, []);
            this.grid.init(3, { fossilCount: params.fossilCount });
        }

        if (this.renderer && this.grid && this.digLayer) {
            this.renderer.draw(this.grid, this.input.selected, this.digLayer);
        }

        if (window.Bridge) window.Bridge.gameplayStart();
    }

    useTool(toolType, c, r) {
        if (this.state !== STATE.IDLE) return;

        const costs = { pickaxe: 1, dynamite: 2 };
        const cost = costs[toolType] || 1;

        if (this.tools < cost) return;

        let applied = false;
        if (toolType === 'pickaxe') {
            applied = this.grid.applyPickaxe(c, r);
        } else if (toolType === 'dynamite') {
            applied = this.grid.applyDynamite(c, r);
        }

        if (applied) {
            this.tools -= cost;
            this.activeTool = null;
            this.input.setActiveTool(null);
            this._updateBoosterUI();
            this.updateUI();
            this.state = STATE.REMOVING;
        }
    }

    attemptSwap(c1, r1, c2, r2) {
        if (this.state !== STATE.IDLE || this.moves <= 0) return;

        const success = this.grid.trySwap(c1, r1, c2, r2);
        if (success) {
            this.moves--;
            this.combo = 0;
            this.updateUI();
            this.state = STATE.CHECKING;
        } else {
            this.grid.shakeTiles(c1, r1, c2, r2);
        }
    }

    activateBonus(c, r) {
        if (this.state !== STATE.IDLE) return;
        const activated = this.grid.activateBonusAt(c, r);
        if (activated) {
            this.combo = 0;
            this.updateUI();
            this.state = STATE.CHECKING;
        }
    }

    _flyBonesEffect(count) {
        spawnBoneFly(this.ui.boneFlyLayer, this.ui.btnNavMuseum, count);
    }

    _forfeitCurrentAttempt() {
        if (this.museum && this.unlockedThisLevel.length > 0) {
            this.museum.removeBones(this.unlockedThisLevel);
            this.unlockedThisLevel = [];
        }
        this.loadLevelByNumber(this.levelNumber);
    }

    pauseMenuRestart() {
        this._forfeitCurrentAttempt();
    }

    pauseMenuGiveUp() {
        this._forfeitCurrentAttempt();
        window.dispatchEvent(new CustomEvent('switchTab', { detail: 'map' }));
    }

    pauseMenuGoToMap() {
        this._forfeitCurrentAttempt();
        window.dispatchEvent(new CustomEvent('switchTab', { detail: 'map' }));
    }

    pauseMenuGoToMuseum() {
        this._forfeitCurrentAttempt();
        window.dispatchEvent(new CustomEvent('switchTab', { detail: 'museum' }));
    }

    updateUI() {
        if (this.ui.score) this.ui.score.textContent = this.score;
        if (this.ui.moves) this.ui.moves.textContent = this.moves;
        if (this.ui.tools) this.ui.tools.textContent = this.tools;
        if (this.ui.goalText) this.ui.goalText.textContent = `${this.goalProgress}/${this.goalTarget}`;
        if (this.ui.levelNumber) this.ui.levelNumber.textContent = this.levelNumber;

        const typeMeta = {
            1: { icon: '⛏️', label: t('goalLabelDig') },
            2: { icon: '📦', label: t('goalLabelCrates') },
            3: { icon: '🦴', label: t('goalLabelDrop') }
        };
        const meta = typeMeta[this.currentLevel] || typeMeta[1];
        if (this.ui.levelTypeIcon) this.ui.levelTypeIcon.textContent = meta.icon;
        if (this.ui.goalIcon) this.ui.goalIcon.textContent = meta.icon;
        if (this.ui.goalLabel) this.ui.goalLabel.textContent = meta.label;
        if (this.ui.goalBarFill) {
            const goalPct = this.goalTarget > 0 ? Math.min(100, (this.goalProgress / this.goalTarget) * 100) : 0;
            this.ui.goalBarFill.style.width = `${goalPct}%`;
        }

        const dino = this.currentDinoId !== null ? DINO_DATA[this.currentDinoId] : null;
        const progress = (this.museum && dino) ? this.museum.getDinoProgress(dino.id) : { unlocked: 0, total: 0 };

        if (this.ui.currentDinoEmoji) this.ui.currentDinoEmoji.textContent = dino ? dino.emoji : '🦴';
        if (this.ui.currentDinoName) this.ui.currentDinoName.textContent = dino ? dino.name.split(' ')[0] : '—';
        if (this.ui.museumCount) this.ui.museumCount.textContent = progress.unlocked;

        const museumTotalEl = document.getElementById('museumTotal');
        if (museumTotalEl) museumTotalEl.textContent = progress.total;
        if (this.ui.museumProgress) {
            const pct = progress.total > 0 ? Math.min(100, (progress.unlocked / progress.total) * 100) : 0;
            this.ui.museumProgress.style.width = `${pct}%`;
        }
    }

    processMatches() {
        const result = this.grid.findAndMarkMatches();
        if (result.hasMatches) {
            this.pendingBonuses = result.bonusesToSpawn;
            this.combo++;
            this.score += 30 * this.combo;
            this.updateUI();
            this.state = STATE.REMOVING;
        } else {
            this.combo = 0;
            this.updateUI();
            this.state = STATE.IDLE;
        }
    }

    showEndModal(isWin) {
        if (isWin) {
            this.state = STATE.VICTORY;
            if (this.ui.modalIconBadge) this.ui.modalIconBadge.textContent = '🎉';
            this.ui.modalTitle.textContent = t('modalWinTitle');

            let desc = t('modalWinDesc');

            if (this.unlockedThisLevel.length > 0) {
                const boneInfo = {};
                this.unlockedThisLevel.forEach(b => {
                    if (!boneInfo[b.dinoId]) boneInfo[b.dinoId] = [];
                    boneInfo[b.dinoId].push(`${b.icon || '🦴'} ${b.name}`);
                });

                let bonesHtml = '';
                for (const dinoId in boneInfo) {
                    bonesHtml += `<br>🦕 ${boneInfo[dinoId].join(', ')}`;
                }
                desc += `<br><br><b>${t('modalBonesCollected', this.unlockedThisLevel.length)}</b>${bonesHtml}`;
            }

            this.ui.modalDesc.innerHTML = desc;
            if (this.ui.modalNextIconSlot) {
                this.ui.modalNextIconSlot.dataset.icon = 'modalNext';
                this.ui.modalNextIconSlot.textContent = '▶️';
                if (window.__mountIconSlot) window.__mountIconSlot(this.ui.modalNextIconSlot);
            }
            if (this.ui.btnModalMuseum) {
                this.ui.btnModalMuseum.style.display = 'inline-flex';
            }
            if (this.ui.btnModalWatchAd) {
                this.ui.btnModalWatchAd.classList.add('hidden');
            }
        } else {
            this.state = STATE.GAMEOVER;

            if (this.museum && this.unlockedThisLevel.length > 0) {
                this.museum.removeBones(this.unlockedThisLevel);
                this.updateUI();
            }

            if (this.ui.modalIconBadge) this.ui.modalIconBadge.textContent = '⛔';
            this.ui.modalTitle.textContent = t('modalLoseTitle');
            this.ui.modalDesc.textContent = t('modalLoseDesc');
            if (this.ui.modalNextIconSlot) {
                this.ui.modalNextIconSlot.dataset.icon = 'modalRetry';
                this.ui.modalNextIconSlot.textContent = '🔄';
                if (window.__mountIconSlot) window.__mountIconSlot(this.ui.modalNextIconSlot);
            }
            if (this.ui.btnModalMuseum) {
                this.ui.btnModalMuseum.style.display = 'none';
            }
            if (this.ui.btnModalWatchAd) {
                this.ui.btnModalWatchAd.classList.remove('hidden');
            }
        }

        if (this.museum && this.museum.getTotalUnlocked() >= this.museum.getTotalBones()) {
            if (this.ui.modalIconBadge) this.ui.modalIconBadge.textContent = '🏆';
            this.ui.modalTitle.textContent = t('modalAllDoneTitle');
            this.ui.modalDesc.innerHTML += `<br><br>${t('modalAllDoneDesc')}`;
        }

        this.ui.modalScore.textContent = this.score;
        openOverlay(this.ui.modalOverlay);

        if (window.Bridge) window.Bridge.gameplayStop();
    }

    update() {
        switch (this.state) {
            case STATE.CHECKING:
                if (!this.grid.isAnimating()) this.processMatches();
                break;

            case STATE.REMOVING:
                if (!this.grid.isAnimating()) {
                    const dig = (this.currentLevel === 1) ? this.digLayer : null;
                    const { destroyedCratesCount, unburiedFossilsCount } = this.grid.removeMatches(dig, this.pendingBonuses);
                    this.pendingBonuses = [];

                    if (destroyedCratesCount > 0) {
                        this.tools += destroyedCratesCount;
                        this.score += destroyedCratesCount * 50;
                        if (this.currentLevel === 2) this.goalProgress += destroyedCratesCount;
                    }

                    if (unburiedFossilsCount > 0) {
                        if (this.museum) {
                            const newBones = this.museum.addBones(unburiedFossilsCount, this.currentDinoId);
                            this.unlockedThisLevel.push(...newBones);
                        }
                        this.score += unburiedFossilsCount * 200;
                        if (this.currentLevel === 1) this.goalProgress += unburiedFossilsCount;
                        this._flyBonesEffect(unburiedFossilsCount);
                    }

                    this.grid.applyGravity();
                    this.updateUI();
                    this.state = STATE.FALLING;
                }
                break;

            case STATE.FALLING:
                if (!this.grid.isAnimating()) {
                    if (this.currentLevel === 3) {
                        const collected = this.grid.collectBottomFossils();
                        if (collected > 0) {
                            if (this.museum) {
                                const newBones = this.museum.addBones(collected, this.currentDinoId);
                                this.unlockedThisLevel.push(...newBones);
                            }
                            this.goalProgress += collected;
                            this.score += collected * 200;
                            this._flyBonesEffect(collected);
                            this.updateUI();
                        }

                        this.grid.applyGravity();
                    }

                    const result = this.grid.findAndMarkMatches();
                    if (result.hasMatches) {
                        this.pendingBonuses = result.bonusesToSpawn;
                        this.combo++;
                        this.score += 30 * this.combo;
                        this.updateUI();
                        this.state = STATE.REMOVING;
                    } else {
                        if (this.goalProgress >= this.goalTarget) {
                            this.showEndModal(true);
                        } else if (this.moves <= 0) {
                            this.showEndModal(false);
                        } else {
                            this.state = STATE.IDLE;
                        }
                    }
                }
                break;
        }
    }

    loop() {
        const isVisible = this.gameScreenEl && !this.gameScreenEl.classList.contains('hidden');
        if (!this.paused && isVisible) {
            this.update();
            if (this.renderer && this.grid) {
                this.renderer.draw(this.grid, this.input.selected, this.digLayer);
            }
        }
        requestAnimationFrame(() => this.loop());
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }
}
