import { DINO_DATA, ASSETS } from '../config.js';
import { createImgOrEmoji } from '../utils/AssetLoader.js';
import { t } from '../i18n.js';

export class Museum {
    constructor() {
        this.gridEl = document.getElementById('bonesGrid');
        this.infoCard = document.getElementById('boneInfoCard');
        this.boneNameEl = document.getElementById('boneName');
        this.boneDescEl = document.getElementById('boneDesc');
        this.countEl = document.getElementById('museumCount');
        this.progressEl = document.getElementById('museumProgress');

        this.unlockedBones = this.loadState();

        this.assembledDinos = this.loadAssembledState();

        this.activeDinoId = 0;

        this.dinoModes = {};

        this.init();
    }

    loadState() {
        const saved = localStorage.getItem('dino_museum_bones_v2');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    }

    saveState() {
        localStorage.setItem('dino_museum_bones_v2', JSON.stringify([...this.unlockedBones]));
    }

    loadAssembledState() {
        const saved = localStorage.getItem('dino_museum_assembled_v1');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    }

    saveAssembledState() {
        localStorage.setItem('dino_museum_assembled_v1', JSON.stringify([...this.assembledDinos]));
    }

    addBoneForDino(dinoId, { render = true } = {}) {
        const dino = DINO_DATA[dinoId];
        if (!dino) return [];

        const nextBone = dino.bones.find(b => !this.unlockedBones.has(b.id));
        if (!nextBone) return [];

        this.unlockedBones.add(nextBone.id);
        this.saveState();
        if (render) this.render();

        const assembled = dino.bones.every(b => this.unlockedBones.has(b.id));
        if (assembled) {
            this._onDinoAssembled(dinoId);
        }

        return [{ ...nextBone, dinoId }];
    }

    addBones(count = 1, dinoId = 0) {
        const newBones = [];
        for (let i = 0; i < count; i++) {
            // Only re-render the DOM once for the whole batch instead of
            // once per bone — collecting several fossils in one match used
            // to rebuild the museum grid N times in a single frame.
            const added = this.addBoneForDino(dinoId, { render: false });
            newBones.push(...added);
        }
        if (newBones.length > 0) this.render();
        return newBones;
    }

    removeBones(bones = []) {
        if (!bones || bones.length === 0) return;
        let changed = false;
        bones.forEach(b => {
            if (b && this.unlockedBones.has(b.id)) {
                this.unlockedBones.delete(b.id);
                changed = true;
            }
        });
        if (changed) {
            this.saveState();
            this.render();
        }
    }

    restoreBones(bones = []) {
        if (!bones || bones.length === 0) return;
        let changed = false;
        bones.forEach(b => {
            if (b && !this.unlockedBones.has(b.id)) {
                this.unlockedBones.add(b.id);
                changed = true;
            }
        });
        if (changed) {
            this.saveState();
            this.render();
        }
    }

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

    isDinoAssembled(dinoId) {
        return this.assembledDinos.has(dinoId);
    }
    assembleDino(dinoId) {
        const dino = DINO_DATA[dinoId];
        if (!dino) return;

        if (this.assembledDinos.has(dinoId)) return;

        this.assembledDinos.add(dinoId);
        this.saveAssembledState();

        const bridge = window.Bridge;
        if (bridge) {
            bridge.gameplayStop();
            const finish = () => { bridge.gameplayStart(); this.render(); };
            const requested = bridge.showInterstitial({
                onClose: finish,
                onError: finish,
                onOffline: finish
            });

            if (!requested) finish();
        } else {
            this.render();
        }
    }

    init() {
        this.render();
    }

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
            const complete = this.isDinoAssembled(dino.id);
            const btn = document.createElement('button');
            btn.className = `dino-tab-btn ${dino.id === this.activeDinoId ? 'active' : ''} ${complete ? 'complete' : ''}`;
            btn.innerHTML = `
                <span class="dino-tab-emoji"></span>
                <span class="dino-tab-name">${dino.name.split(' ')[0]}</span>
                <span class="dino-tab-count">${unlocked}/${total}</span>
            `;

            // Show the dino's "alive" artwork in the selector even before
            // every bone has been found, instead of the static emoji.
            const emojiSlot = btn.querySelector('.dino-tab-emoji');
            emojiSlot.appendChild(createImgOrEmoji(ASSETS.dinoAlive(dino.id), dino.emoji, 'dino-tab-icon-img'));

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
        const isAssembled = this.isDinoAssembled(dino.id);

        const header = document.createElement('div');
        header.className = 'museum-dino-header';
        header.innerHTML = `
            <div class="dino-header-main">
                <span class="dino-header-emoji">${dino.emoji}</span>
                <div>
                    <h3>${dino.name}</h3>
                    <small>${dino.latinName} · ${dino.period}</small>
                </div>
                ${isAssembled ? `<span class="dino-complete-badge">${t('assembledBadge')}</span>` : ''}
            </div>
            <div class="dino-header-progress">
                <div class="dino-prog-bar-wrap">
                    <div class="dino-prog-bar" style="width:${(unlocked/total)*100}%"></div>
                </div>
                <span>${t('bonesCountLabel', unlocked, total)}</span>
            </div>
        `;
        this.gridEl.appendChild(header);

        if (isComplete && isAssembled) {
            this._renderAssembledDino(dino);
            return;
        }

        const bonesGrid = document.createElement('div');
        bonesGrid.className = 'bones-slots-grid';

        dino.bones.forEach(bone => {
            const isUnlocked = this.unlockedBones.has(bone.id);
            const slot = document.createElement('div');
            slot.className = `bone-slot ${isUnlocked ? 'unlocked' : 'locked'}`;

            const numSpan = document.createElement('span');
            numSpan.className = 'bone-num';
            numSpan.textContent = `#${bone.id.split('-')[1]}`;

            if (isUnlocked) {
                const icon = createImgOrEmoji(ASSETS.boneIcon(bone.id), bone.icon, 'bone-icon');
                slot.appendChild(icon);
                slot.addEventListener('click', () => this._showBoneInfo(bone));
            } else {
                const icon = document.createElement('span');
                icon.className = 'bone-icon';
                icon.textContent = '❓';
                slot.appendChild(icon);
            }
            slot.appendChild(numSpan);
            bonesGrid.appendChild(slot);
        });

        this.gridEl.appendChild(bonesGrid);

        if (isComplete && !isAssembled) {
            const assembleBar = document.createElement('div');
            assembleBar.className = 'assemble-cta';
            assembleBar.innerHTML = `
                <p>${t('assembleCtaText')}</p>
                <button class="btn-assemble-gold" id="btnAssembleNow">${t('assembleBtn')}</button>
            `;
            assembleBar.querySelector('#btnAssembleNow').addEventListener('click', () => {
                this.assembleDino(dino.id);
            });
            this.gridEl.appendChild(assembleBar);
        }

        if (this.infoCard) this.infoCard.classList.add('hidden');
    }

    _showBoneInfo(bone) {
        if (!this.infoCard) return;
        this.infoCard.classList.remove('hidden');
        if (this.boneNameEl) this.boneNameEl.textContent = `${bone.icon} ${bone.name}`;
        if (this.boneDescEl) this.boneDescEl.textContent = bone.fact;
        this.infoCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

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
                <h2>${t('dinoAssembledTitle')}</h2>
                <p>${t('dinoAssembledDesc', dino.bones.length, dino.name)}</p>
                <button id="btnStartAssemble" class="btn-assemble-gold">${t('goToMuseumBtn')}</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('btnStartAssemble').addEventListener('click', () => {
            modal.style.animation = 'fadeIn 0.2s ease reverse';
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 200);
            this.activeDinoId = dinoId;
            this.render();
            window.dispatchEvent(new CustomEvent('switchTab', { detail: 'museum' }));
        });
    }

    _renderAssembledDino(dino) {
        const mode = this.dinoModes[dino.id] || 'skeleton';

        const exhibit = document.createElement('div');
        exhibit.className = 'assembled-exhibit-container';
        exhibit.innerHTML = `
            <div class="mode-toggle-bar">
                <button class="toggle-btn ${mode === 'skeleton' ? 'active' : ''}" data-mode="skeleton">${t('toggleSkeleton')}</button>
                <button class="toggle-btn ${mode === 'alive' ? 'active' : ''}" data-mode="alive">${t('toggleAlive', dino.emoji)}</button>
            </div>

            <div class="dino-display-card">
                <div class="dino-visual-box">
                    <div class="dino-avatar" id="dinoAvatarSlot"></div>
                    <div class="dino-badge">${mode === 'skeleton' ? t('badgeSkeleton') : t('badgeAlive')}</div>
                </div>
                <div class="dino-details-box">
                    <h3>${mode === 'skeleton' ? t('exhibitSkeletonTitle', dino.latinName) : t('exhibitAliveTitle', dino.name)}</h3>
                    <p class="dino-bio">${mode === 'skeleton' ? dino.description + t('exhibitSkeletonBioSuffix', dino.bones.length) : dino.description}</p>
                    <div class="dino-stats">
                        <span>${t('statLength')} <b>${dino.length}</b></span>
                        <span>${t('statWeight')} <b>${dino.weight}</b></span>
                        <span>${t('statPeriod')} <b>${dino.period}</b></span>
                    </div>
                </div>
            </div>
        `;

        const avatarSlot = exhibit.querySelector('#dinoAvatarSlot');
        const avatarPath = mode === 'skeleton' ? ASSETS.dinoSkeleton(dino.id) : ASSETS.dinoAlive(dino.id);
        const avatarFallback = mode === 'skeleton' ? ('🦴' + dino.emoji) : (dino.emoji + '🌿');
        avatarSlot.appendChild(createImgOrEmoji(avatarPath, avatarFallback, 'dino-avatar-media'));

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
