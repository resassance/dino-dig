import { MUSEUM_DATA } from '../config.js';

export class Museum {
    constructor() {
        this.gridEl = document.getElementById('bonesGrid');
        this.infoCard = document.getElementById('boneInfoCard');
        this.boneNameEl = document.getElementById('boneName');
        this.boneDescEl = document.getElementById('boneDesc');
        this.countEl = document.getElementById('museumCount');
        this.progressEl = document.getElementById('museumProgress');

        this.unlockedBones = this.loadState();
        this.isAssembled = this.loadAssemblyState();
        this.currentDinoMode = 'skeleton';

        this.init();
    }

    loadState() {
        const saved = localStorage.getItem('dino_museum_bones');
        return saved ? JSON.parse(saved) : [];
    }

    saveState() {
        localStorage.setItem('dino_museum_bones', JSON.stringify(this.unlockedBones));
    }

    loadAssemblyState() {
        return localStorage.getItem('dino_museum_assembled') === 'true';
    }

    saveAssemblyState(val) {
        localStorage.setItem('dino_museum_assembled', val ? 'true' : 'false');
    }

    addBones(count = 1) {
        let newlyUnlocked = [];
        for (let i = 0; i < count; i++) {
            const nextBone = MUSEUM_DATA.bones.find(b => !this.unlockedBones.includes(b.id));
            if (nextBone) {
                this.unlockedBones.push(nextBone.id);
                newlyUnlocked.push(nextBone);
            }
        }
        if (newlyUnlocked.length > 0) {
            this.saveState();
            this.render();
        }
        return newlyUnlocked;
    }

    init() {
        this.render();
    }

    render() {
        if (!this.gridEl) return;

        const totalBones = MUSEUM_DATA.totalBones || 10;
        const isAllCollected = this.unlockedBones.length >= totalBones;

        const unlockedCount = this.unlockedBones.length;
        if (this.countEl) this.countEl.textContent = unlockedCount;
        if (this.progressEl) {
            const percent = (unlockedCount / totalBones) * 100;
            this.progressEl.style.width = `${percent}%`;
        }

        if (this.isAssembled) {
            this.renderAssembledExhibit();
            return;
        }

        this.gridEl.innerHTML = '';
        if (this.infoCard) this.infoCard.classList.remove('hidden-exhibit');

        MUSEUM_DATA.bones.forEach((bone) => {
            const isUnlocked = this.unlockedBones.includes(bone.id);
            const slot = document.createElement('div');
            slot.className = `bone-slot ${isUnlocked ? 'unlocked' : 'locked'}`;
            slot.innerHTML = `
                <span>${isUnlocked ? bone.icon : '❓'}</span>
                <span class="bone-num">#${bone.id}</span>
            `;

            if (isUnlocked) {
                slot.addEventListener('click', () => this.showBoneInfo(bone));
            }

            this.gridEl.appendChild(slot);
        });

        if (isAllCollected && !this.isAssembled) {
            this.showAssemblePromptModal();
        }
    }

    showBoneInfo(bone) {
        if (!this.infoCard) return;
        this.infoCard.classList.remove('hidden');
        if (this.boneNameEl) this.boneNameEl.textContent = `${bone.icon} ${bone.name}`;
        if (this.boneDescEl) this.boneDescEl.textContent = bone.fact;
    }

    showAssemblePromptModal() {
        if (document.getElementById('assembleModalOverlay')) return;

        const modal = document.createElement('div');
        modal.id = 'assembleModalOverlay';
        modal.className = 'dino-modal-overlay';
        modal.innerHTML = `
            <div class="dino-modal-card">
                <div class="dino-modal-icon">🦖✨</div>
                <h2>Все кости собраны!</h2>
                <p>Поздравляем! Ты нашел все 10 фрагментов скелета Тираннозавра Рекса.<br>Готов сопоставить кости и воссоздать экспонат?</p>
                <button id="btnStartAssemble" class="btn-assemble-gold">✨ Собрать скелет T-Rex</button>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('btnStartAssemble').addEventListener('click', () => {
            modal.remove();
            this.playAssemblyAnimation();
        });
    }

    playAssemblyAnimation() {
        const animOverlay = document.createElement('div');
        animOverlay.className = 'assembly-anim-overlay';
        animOverlay.innerHTML = `
            <div class="assembly-content">
                <div class="assembly-particles">✨ 🦴 ⚡ 🦴 ✨</div>
                <div class="assembling-dino">🦖</div>
                <h2 class="glow-text">Идет сборка скелета...</h2>
            </div>
        `;
        document.body.appendChild(animOverlay);

        setTimeout(() => {
            this.isAssembled = true;
            this.saveAssemblyState(true);
            animOverlay.classList.add('fade-out');

            setTimeout(() => {
                animOverlay.remove();
                this.render();
            }, 600);
        }, 2200);
    }

    renderAssembledExhibit() {
        if (!this.gridEl) return;

        this.gridEl.innerHTML = `
            <div class="assembled-exhibit-container">
                <div class="exhibit-header">
                    <h2>🏛️ Экспонат №1: Тираннозавр Рекс (T-Rex)</h2>
                    <p>Экспонат полностью восстановлен и готов к осмотру!</p>
                </div>

                <div class="mode-toggle-bar">
                    <button id="btnModeSkeleton" class="toggle-btn ${this.currentDinoMode === 'skeleton' ? 'active' : ''}">🦴 Скелет</button>
                    <button id="btnModeAlive" class="toggle-btn ${this.currentDinoMode === 'alive' ? 'active' : ''}">🦖 Живой динозавр</button>
                </div>

                <div class="dino-display-card">
                    <div class="dino-visual-box">
                        <div class="dino-avatar">
                            ${this.currentDinoMode === 'skeleton' ? '🦴🦖' : '🦖🌿'}
                        </div>
                        <div class="dino-badge">${this.currentDinoMode === 'skeleton' ? 'Реконструкционный скелет' : 'Живой организм (меловой период)'}</div>
                    </div>

                    <div class="dino-details-box">
                        <h3>${this.currentDinoMode === 'skeleton' ? 'Скелет Tyrannosaurus Rex' : 'Тираннозавр Рекс в среде обитания'}</h3>
                        <p class="dino-bio">
                            ${this.currentDinoMode === 'skeleton' 
                                ? 'Скелет состоит из 10 ключевых окаменелостей: от мощного черепа с 60 зубами до длинного балансировочного хвоста. Рост экспоната — 4 метра, длина — 12 метров!'
                                : 'Один из крупнейших сухопутных хищников в истории Земли. Обладал мощным бинокулярным зрением, чешуйчатой кожей и силой укуса более 3.5 тонн!'}
                        </p>
                        <div class="dino-stats">
                            <span>📏 <b>Длина:</b> 12 м</span>
                            <span>⚖️ <b>Вес:</b> 8 тонн</span>
                            <span>⏳ <b>Период:</b> Поздний меловой</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (this.infoCard) this.infoCard.classList.add('hidden-exhibit');

        document.getElementById('btnModeSkeleton')?.addEventListener('click', () => {
            this.currentDinoMode = 'skeleton';
            this.renderAssembledExhibit();
        });

        document.getElementById('btnModeAlive')?.addEventListener('click', () => {
            this.currentDinoMode = 'alive';
            this.renderAssembledExhibit();
        });
    }
}