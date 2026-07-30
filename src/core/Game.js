import { CONFIG } from '../config.js';
import { Grid } from '../model/Grid.js';
import { DigLayer } from '../model/DigLayer.js';
import { InputManager } from './InputManager.js';
import { BoardRenderer } from '../view/BoardRenderer.js';

export const STATE = {
    IDLE: 'IDLE',
    CHECKING: 'CHECKING',
    REMOVING: 'REMOVING',
    FALLING: 'FALLING',
    VICTORY: 'VICTORY',
    GAMEOVER: 'GAMEOVER'
};

export class Game {
    constructor(canvas, museum = null) {
        this.canvas = canvas;
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;

        this.ctx = canvas.getContext('2d');
        this.museum = museum;
        this.grid = new Grid();
        this.digLayer = new DigLayer();
        this.renderer = new BoardRenderer(this.ctx);
        
        this.input = new InputManager(
            canvas, 
            (c1, r1, c2, r2) => this.attemptSwap(c1, r1, c2, r2),
            (tool, c, r) => this.useTool(tool, c, r)
        );
        
        this.state = STATE.IDLE;
        this.currentLevel = 1;
        this.score = 0;
        this.moves = 20;
        this.tools = 3;
        this.goalProgress = 0;
        this.goalTarget = 0;
        this.museumBones = 0;
        this.combo = 0;
        this.pendingBonuses = [];
        this.activeTool = null;
        this.unlockedThisLevel = [];

        this.ui = {
            score: document.getElementById('score'),
            moves: document.getElementById('moves'),
            tools: document.getElementById('tools'),
            goalText: document.getElementById('goalText'),
            museumCount: document.getElementById('museumCount'),
            museumProgress: document.getElementById('museumProgress'),
            btnPickaxe: document.getElementById('btnPickaxe'),
            btnDynamite: document.getElementById('btnDynamite'),
            modalOverlay: document.getElementById('modalOverlay'),
            modalTitle: document.getElementById('modalTitle'),
            modalDesc: document.getElementById('modalDesc'),
            modalScore: document.getElementById('modalScore'),
            btnModalNext: document.getElementById('btnModalNext'),
            btnModalMuseum: document.getElementById('btnModalMuseum')
        };

        this._initMuseumButton();
        this._bindUI();

        const boneLevels = [1, 3];
        const initialLevel = boneLevels[Math.floor(Math.random() * boneLevels.length)];
        this.loadLevel(initialLevel);

        this.loop();
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
                    this.loadRandomLevel();
                } else {
                    this.loadLevel(this.currentLevel);
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

    loadRandomLevel() {
        const randomType = Math.floor(Math.random() * 3) + 1;
        this.loadLevel(randomType);
    }

    loadLevel(levelType = 1) {
        this.currentLevel = levelType;

        this.score = 0;
        this.moves = 20;
        this.tools = 3;
        this.goalProgress = 0;
        this.combo = 0;
        this.pendingBonuses = [];
        this.activeTool = null;
        this.unlockedThisLevel = [];
        this.input.setActiveTool(null);
        this.state = STATE.IDLE;

        if (levelType === 1) {
            this.goalTarget = 3;
            this.digLayer.init(2, 3);
            this.grid.init(1);
        } else if (levelType === 2) {
            this.goalTarget = 8;
            this.digLayer.init(0, []);
            this.grid.init(2, { crateCount: 8 });
        } else if (levelType === 3) {
            this.goalTarget = 3;
            this.digLayer.init(0, []);
            this.grid.init(3, { fossilCount: 3 });
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
        }
    }

    updateUI() {
        if (this.museum) {
            this.museumBones = this.museum.getTotalUnlocked();
        }
        if (this.ui.score) this.ui.score.textContent = this.score;
        if (this.ui.moves) this.ui.moves.textContent = this.moves;
        if (this.ui.tools) this.ui.tools.textContent = this.tools;
        if (this.ui.goalText) this.ui.goalText.textContent = `${this.goalProgress}/${this.goalTarget}`;
        if (this.ui.museumCount) this.ui.museumCount.textContent = this.museumBones;
        const totalBones = this.museum ? this.museum.getTotalBones() : 60;
        const museumTotalEl = document.getElementById('museumTotal');
        if (museumTotalEl) museumTotalEl.textContent = totalBones;
        if (this.ui.museumProgress) {
            const pct = Math.min(100, (this.museumBones / totalBones) * 100);
            this.ui.museumProgress.style.width = `${pct}%`;
        }
    }

    processMatches() {
        const result = this.grid.findAndMarkMatches();
        if (result.hasMatches) {
            this.pendingBonuses = result.bonusesToSpawn;
            this.combo++;
            this.score += 30 * this.combo;
            // Кости добавляются ТОЛЬКО при раскопках (уровень 1) в removeMatches через digLayer.dig()
            // ИЛИ при уровне 3 через collectBottomFossils() в состоянии FALLING
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
                            // Добавляем кости T-Rex (динозавр 0) при раскопках
                            const newBones = this.museum.addBones(unburiedFossilsCount, 0);
                            this.unlockedThisLevel.push(...newBones);
                        }
                        this.score += unburiedFossilsCount * 200;
                        if (this.currentLevel === 1) this.goalProgress += unburiedFossilsCount;
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
                                const newBones = this.museum.addBones(collected, 0);
                                this.unlockedThisLevel.push(...newBones);
                            }
                            this.goalProgress += collected;
                            this.score += collected * 200;
                            this.updateUI();
                            this.grid.applyGravity();
                        }
                    }

                    const result = this.grid.findAndMarkMatches();
                    if (result.hasMatches) {
                        this.state = STATE.CHECKING;
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
