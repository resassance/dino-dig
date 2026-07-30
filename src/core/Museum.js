import { DINO_DATA } from '../config.js';

export class Museum {
    constructor() {
        this.gridEl = document.getElementById('bonesGrid');
        this.infoCard = document.getElementById('boneInfoCard');
        this.boneNameEl = document.getElementById('boneName');
        this.boneDescEl = document.getElementById('boneDesc');
        this.countEl = document.getElementById('museumCount');
        this.progressEl = document.getElementById('museumProgress');

        // unlockedBones: Set строковых id вида '0-1', '1-3', ...
        this.unlockedBones = this.loadState();
        // какой динозавр сейчас открыт в музее
        this.activeDinoId = 0;
        // режим отображения для каждого собранного динозавра
        this.dinoModes = {};

        this.init();
    }

    // ─── Хранилище ────────────────────────────────────────────────────

    loadState() {
        const saved = localStorage.getItem('dino_museum_bones_v2');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    }

    saveState() {
        localStorage.setItem('dino_museum_bones_v2', JSON.stringify([...this.unlockedBones]));
    }

    // ─── Добавление костей ────────────────────────────────────────────

    /**
     * Добавить следующую незапечатанную кость конкретному динозавру.
     * Возвращает массив новых костей (0 или 1).
     */
    addBoneForDino(dinoId) {
        const dino = DINO_DATA[dinoId];
        if (!dino) return [];

        const nextBone = dino.bones.find(b => !this.unlockedBones.has(b.id));
        if (!nextBone) return [];

        this.unlockedBones.add(nextBone.id);
        this.saveState();
        this.render();

        // Проверяем, собран ли весь скелет
        const assembled = dino.bones.every(b => this.unlockedBones.has(b.id));
        if (assembled) {
            this._onDinoAssembled(dinoId);
        }

        return [{ ...nextBone, dinoId }];
    }

    /**
     * Совместимость со старым кодом Game.js:
     * добавляет count костей активному динозавру (dinoId 0 = T-Rex).
     */
    addBones(count = 1, dinoId = 0) {
        const newBones = [];
        for (let i = 0; i < count; i++) {
            const added = this.addBoneForDino(dinoId);
            newBones.push(...added);
        }
        return newBones;
    }

    // ─── Прогресс ────────────────────────────────────────────────────

    getTotalUnlocked() {
        return this.unlockedBones.size;
    }

    getTotalBones() {
        return Object.values(DINO_DATA).reduce((s, d) => s + d.bones.length, 0);
    }

    getDinoProgress(dinoId) {
        const dino = DINO_DATA[dinoId];
        if (!dino) return { unlocked: 0, total: 0 };
        const unlocked = dino.bones.filter(b => this.unlockedBones.has(b.id)).length;
        return { unlocked, total: dino.bones.length };
    }

    isDinoComplete(dinoId) {
        const dino = DINO_DATA[dinoId];
        return dino ? dino.bones.every(b => this.unlockedBones.has(b.id)) : false;
    }

    // ─── Инициализация ────────────────────────────────────────────────

    init() {
        this.render();
    }

    // ─── Рендер ──────────────────────────────────────────────────────

    render() {
        if (!this.gridEl) return;

        const total = this.getTotalBones();
        const unlocked = this.getTotalUnlocked();
        if (this.countEl) this.countEl.textContent = unlocked;
        if (this.progressEl) {
            this.progressEl.style.width = `${(unlocked / total) * 100}%`;
        }

        this.gridEl.innerHTML = '';
        if (this.infoCard) this.infoCard.classList.remove('hidden-exhibit');

        this._renderDinoTabs();
        this._renderActiveDino();
    }

    _renderDinoTabs() {
        const tabBar = document.createElement('div');
        tabBar.className = 'museum-dino-tabs';

        Object.values(DINO_DATA).forEach(dino => {
            const { unlocked, total } = this.getDinoProgress(dino.id);
            const complete = unlocked >= total;
            const btn = document.createElement('button');
            btn.className = `dino-tab-btn ${dino.id === this.activeDinoId ? 'active' : ''} ${complete ? 'complete' : ''}`;
            btn.title = dino.name;
            btn.innerHTML = `
                <span class="dino-tab-emoji">${dino.emoji}</span>
                <span class="dino-tab-name">${dino.name.split(' ')[0]}</span>
                <span class="dino-tab-count">${unlocked}/${total}</span>
            `;
            btn.addEventListener('click', () => {
                this.activeDinoId = dino.id;
                this.render();
            });
            tabBar.appendChild(btn);
        });

        this.gridEl.appendChild(tabBar);
    }

    _renderActiveDino() {
        const dino = DINO_DATA[this.activeDinoId];
        if (!dino) return;

        const { unlocked, total } = this.getDinoProgress(dino.id);
        const isComplete = unlocked >= total;

        // Заголовок динозавра
        const header = document.createElement('div');
        header.className = 'museum-dino-header';
        header.innerHTML = `
            <div class="dino-header-main">
                <span class="dino-header-emoji">${dino.emoji}</span>
                <div>
                    <h3>${dino.name}</h3>
                    <small>${dino.latinName} · ${dino.period}</small>
                </div>
                ${isComplete ? '<span class="dino-complete-badge">✅ Собран</span>' : ''}
            </div>
            <div class="dino-header-progress">
                <div class="dino-prog-bar-wrap">
                    <div class="dino-prog-bar" style="width:${(unlocked/total)*100}%"></div>
                </div>
                <span>${unlocked} / ${total} костей</span>
            </div>
        `;
        this.gridEl.appendChild(header);

        if (isComplete) {
            this._renderAssembledDino(dino);
            return;
        }

        // Сетка костей
        const bonesGrid = document.createElement('div');
        bonesGrid.className = 'bones-slots-grid';

        dino.bones.forEach(bone => {
            const isUnlocked = this.unlockedBones.has(bone.id);
            const slot = document.createElement('div');
            slot.className = `bone-slot ${isUnlocked ? 'unlocked' : 'locked'}`;
            slot.innerHTML = `
                <span class="bone-icon">${isUnlocked ? bone.icon : '❓'}</span>
                <span class="bone-num">#${bone.id.split('-')[1]}</span>
            `;
            if (isUnlocked) {
                slot.addEventListener('click', () => this._showBoneInfo(bone));
            }
            bonesGrid.appendChild(slot);
        });

        this.gridEl.appendChild(bonesGrid);

        // Инфо-карточка (скрытая по умолчанию)
        if (this.infoCard) this.infoCard.classList.add('hidden');
    }

    _showBoneInfo(bone) {
        if (!this.infoCard) return;
        this.infoCard.classList.remove('hidden');
        if (this.boneNameEl) this.boneNameEl.textContent = `${bone.icon} ${bone.name}`;
        if (this.boneDescEl) this.boneDescEl.textContent = bone.fact;
    }

    // ─── Собранный экспонат ────────────────────────────────────────────

    _onDinoAssembled(dinoId) {
        const dino = DINO_DATA[dinoId];
        if (!dino) return;
        if (document.getElementById('assembleModalOverlay')) return;

        const modal = document.createElement('div');
        modal.id = 'assembleModalOverlay';
        modal.className = 'dino-modal-overlay';
        modal.innerHTML = `
            <div class="dino-modal-card">
                <div class="dino-modal-icon">${dino.emoji}✨</div>
                <h2>Все кости собраны!</h2>
                <p>Поздравляем! Ты нашёл все ${dino.bones.length} фрагментов скелета<br><b>${dino.name}</b>!</p>
                <button id="btnStartAssemble" class="btn-assemble-gold">✨ Посмотреть экспонат</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('btnStartAssemble').addEventListener('click', () => {
            modal.remove();
            this.activeDinoId = dinoId;
            this.render();
        });
    }

    _renderAssembledDino(dino) {
        const mode = this.dinoModes[dino.id] || 'skeleton';

        const exhibit = document.createElement('div');
        exhibit.className = 'assembled-exhibit-container';
        exhibit.innerHTML = `
            <div class="mode-toggle-bar">
                <button class="toggle-btn ${mode === 'skeleton' ? 'active' : ''}" data-mode="skeleton">🦴 Скелет</button>
                <button class="toggle-btn ${mode === 'alive' ? 'active' : ''}" data-mode="alive">${dino.emoji} Живой</button>
            </div>

            <div class="dino-display-card">
                <div class="dino-visual-box">
                    <div class="dino-avatar">${mode === 'skeleton' ? '🦴' + dino.emoji : dino.emoji + '🌿'}</div>
                    <div class="dino-badge">${mode === 'skeleton' ? 'Реконструированный скелет' : 'Живой организм'}</div>
                </div>
                <div class="dino-details-box">
                    <h3>${mode === 'skeleton' ? 'Скелет ' + dino.latinName : dino.name + ' в среде обитания'}</h3>
                    <p class="dino-bio">${mode === 'skeleton' ? dino.description + ' Полный скелет содержит ' + dino.bones.length + ' фрагментов.' : dino.description}</p>
                    <div class="dino-stats">
                        <span>📏 <b>Длина:</b> ${dino.length}</span>
                        <span>⚖️ <b>Вес:</b> ${dino.weight}</span>
                        <span>⏳ <b>Период:</b> ${dino.period}</span>
                    </div>
                </div>
            </div>
        `;

        exhibit.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.dinoModes[dino.id] = btn.dataset.mode;
                this.render();
            });
        });

        this.gridEl.appendChild(exhibit);
        if (this.infoCard) this.infoCard.classList.add('hidden-exhibit');
    }
}
