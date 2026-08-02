import { CONFIG, DINO_DATA } from '../config.js';
import { Grid } from '../model/Grid.js';
import { DigLayer } from '../model/DigLayer.js';
import { InputManager } from './InputManager.js';
import { BoardRenderer } from '../view/BoardRenderer.js';
import { spawnBoneFly } from '../view/BoneFlyEffect.js';

export const STATE = {
    IDLE: 'IDLE',
    CHECKING: 'CHECKING',
    REMOVING: 'REMOVING',
    FALLING: 'FALLING',
    VICTORY: 'VICTORY',
    GAMEOVER: 'GAMEOVER'
};

// Сложность растёт постепенно и упирается в потолок — игра рассчитана на детей,
// поэтому даже на "поздних" уровнях не должно становиться мучительно сложно.
const MAX_DIFFICULTY_TIER = 6;
const PROGRESS_STORAGE_KEY = 'dino_dig_progress_v1';

export class Game {
    constructor(canvas, museum = null) {
        this.canvas = canvas;
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;

        this.ctx = canvas.getContext('2d');
        this.museum = museum;
        this.levelMap = null;
        this.grid = new Grid();
        this.digLayer = new DigLayer();
        this.renderer = new BoardRenderer(this.ctx);

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

        // Раскопки идут строго по одному динозавру за раз: пока не соберём его целиком,
        // новые кости не начинают "размазываться" по другим динозаврам.
        this.currentDinoId = null;

        // Уровни чередуются по кругу: раскопки -> кости вниз -> ящики -> сначала.
        this.levelSequence = [1, 3, 2];

        // levelNumber — сквозной счётчик уровней для игрока (не сбрасывается циклом типов).
        // highestLevelReached — до какого уровня дошёл игрок (это и есть "открытая" граница на карте).
        this._loadProgress();

        this.ui = {
            score: document.getElementById('score'),
            moves: document.getElementById('moves'),
            tools: document.getElementById('tools'),
            goalText: document.getElementById('goalText'),
            levelNumber: document.getElementById('levelNumber'),
            museumCount: document.getElementById('museumCount'),
            museumProgress: document.getElementById('museumProgress'),
            currentDinoEmoji: document.getElementById('currentDinoEmoji'),
            currentDinoName: document.getElementById('currentDinoName'),
            btnPickaxe: document.getElementById('btnPickaxe'),
            btnDynamite: document.getElementById('btnDynamite'),
            modalOverlay: document.getElementById('modalOverlay'),
            modalTitle: document.getElementById('modalTitle'),
            modalDesc: document.getElementById('modalDesc'),
            modalScore: document.getElementById('modalScore'),
            btnModalNext: document.getElementById('btnModalNext'),
            btnModalMuseum: document.getElementById('btnModalMuseum'),
            boneFlyLayer: document.getElementById('boneFlyLayer'),
            btnNavMuseum: document.getElementById('btnNavMuseum')
        };

        this._initMuseumButton();
        this._bindUI();

        this.loadLevelByNumber(this.levelNumber);

        this.loop();
    }

    setLevelMap(levelMap) {
        this.levelMap = levelMap;
        this._syncLevelMap();
    }

    // ─── Прогресс по уровням (сквозной счётчик + разблокировка карты) ──

    _loadProgress() {
        try {
            const saved = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY));
            if (saved && saved.levelNumber && saved.highestLevelReached) {
                this.levelNumber = saved.levelNumber;
                this.highestLevelReached = saved.highestLevelReached;
                return;
            }
        } catch (e) { /* ignore corrupt data */ }
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

    // Параметры уровня по сложности: на первых уровнях мало земли/костей и много ходов,
    // дальше плавно растёт, но не выходит за разумный потолок (игра для детей).
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

        // levelType === 3 (кости вниз)
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

    loadNextLevel() {
        this.levelNumber++;
        if (this.levelNumber > this.highestLevelReached) {
            this.highestLevelReached = this.levelNumber;
        }
        this._saveProgress();
        this.loadLevelByNumber(this.levelNumber);
    }

    jumpToLevel(n) {
        if (n > this.highestLevelReached) return;
        this.levelNumber = n;
        this._saveProgress();
        this.loadLevelByNumber(n);
        window.dispatchEvent(new CustomEvent('switchTab', { detail: 'game' }));
    }

    _initMuseumButton() {
        const nextBtn = this.ui.btnModalNext;
        if (!nextBtn || !nextBtn.parentNode) return;

        const parent = nextBtn.parentNode;

        parent.style.display = 'flex';
        parent.style.justifyContent = 'center';
        parent.style.alignItems = 'center';
        parent.style.gap = '12px';
        parent.style.marginTop = '16px';
        parent.style.flexWrap = 'wrap';

        if (!this.ui.btnModalMuseum) {
            const btn = document.createElement('button');
            btn.id = 'btnModalMuseum';
            btn.className = nextBtn.className || 'btn';
            btn.textContent = '🏛️ В музей';
            parent.appendChild(btn);
            this.ui.btnModalMuseum = btn;
        }
    }

    _bindUI() {
        const bindBooster = (btn, toolName) => {
            if (!btn) return;
            btn.addEventListener('click', () => {
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
                this.ui.modalOverlay.classList.add('hidden');
                if (this.state === STATE.VICTORY) {
                    this.loadNextLevel();
                } else {
                    this.loadLevelByNumber(this.levelNumber);
                }
            });
        }

        if (this.ui.btnModalMuseum) {
            this.ui.btnModalMuseum.addEventListener('click', () => {
                this.ui.modalOverlay.classList.add('hidden');
                window.dispatchEvent(new CustomEvent('switchTab', { detail: 'museum' }));
            });
        }
    }

    _updateBoosterUI() {
        if (this.ui.btnPickaxe) this.ui.btnPickaxe.classList.toggle('active', this.activeTool === 'pickaxe');
        if (this.ui.btnDynamite) this.ui.btnDynamite.classList.toggle('active', this.activeTool === 'dynamite');
    }

    _ensureTargetDino() {
        // Если ещё нет цели, либо предыдущий динозавр уже полностью собран —
        // выбираем нового из тех, что ещё не завершены.
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
        this.input.setActiveTool(null);
        this.state = STATE.IDLE;

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

        this.ui.modalOverlay.classList.add('hidden');
        this._updateBoosterUI();
        this.updateUI();
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

    updateUI() {
        if (this.ui.score) this.ui.score.textContent = this.score;
        if (this.ui.moves) this.ui.moves.textContent = this.moves;
        if (this.ui.tools) this.ui.tools.textContent = this.tools;
        if (this.ui.goalText) this.ui.goalText.textContent = `${this.goalProgress}/${this.goalTarget}`;
        if (this.ui.levelNumber) this.ui.levelNumber.textContent = this.levelNumber;

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
            this.ui.modalTitle.textContent = '🎉 Победа!';

            let desc = 'Отличная работа! Уровень успешно пройден.';

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
                desc += `<br><br><b>🦴 Собрано деталей (${this.unlockedThisLevel.length}):</b>${bonesHtml}`;
            }

            this.ui.modalDesc.innerHTML = desc;
            this.ui.btnModalNext.textContent = '🎮 Продолжить';
            if (this.ui.btnModalMuseum) {
                this.ui.btnModalMuseum.style.display = 'inline-block';
            }
        } else {
            this.state = STATE.GAMEOVER;
            this.ui.modalTitle.textContent = '❌ Закончились ходы!';
            this.ui.modalDesc.textContent = 'Не удалось выполнить цель уровня.';
            this.ui.btnModalNext.textContent = '🔄 Попробовать снова';
            if (this.ui.btnModalMuseum) {
                this.ui.btnModalMuseum.style.display = 'none';
            }
        }

        // Проверяем, собраны ли все динозавры
        if (this.museum && this.museum.getTotalUnlocked() >= this.museum.getTotalBones()) {
            this.ui.modalTitle.textContent = '🏆 ВСЕ ДИНОЗАВРЫ СОБРАНЫ!';
            this.ui.modalDesc.innerHTML += '<br><br>Поздравляем! Ты собрал все 60 костей 6 динозавров!';
        }

        this.ui.modalScore.textContent = this.score;
        this.ui.modalOverlay.classList.remove('hidden');
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
                            this.grid.applyGravity();
                        }
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
        this.update();
        this.renderer.draw(this.grid, this.input.selected, this.digLayer);
        requestAnimationFrame(() => this.loop());
    }
}
