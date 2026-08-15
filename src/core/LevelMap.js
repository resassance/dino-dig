import { ASSETS } from '../config.js';
import { createImgOrEmoji } from '../utils/AssetLoader.js';

const TYPE_ICON = { 1: '⛏️', 2: '📦', 3: '🦴' };
export const LEVEL_SEQUENCE = [1, 3, 2];

export class LevelMap {
    constructor(onSelectLevel) {
        this.onSelectLevel = onSelectLevel;
        this.containerEl = document.getElementById('levelMap');
        this.levelNumber = 1;
        this.highestLevelReached = 1;
    }

    update(levelNumber, highestLevelReached) {
        this.levelNumber = levelNumber;
        this.highestLevelReached = highestLevelReached;
        this.render();
    }

    render() {
        if (!this.containerEl) return;
        this.containerEl.innerHTML = '';

        const dnaLayer = document.createElement('div');
        dnaLayer.className = 'dna-layer';
        this.containerEl.appendChild(dnaLayer);

        const totalToShow = Math.max(this.highestLevelReached + 4, 14);

        for (let n = 1; n <= totalToShow; n++) {
            const type = LEVEL_SEQUENCE[(n - 1) % LEVEL_SEQUENCE.length];
            const isDone = n < this.highestLevelReached;
            const isCurrent = n === this.highestLevelReached;
            const isLocked = n > this.highestLevelReached;

            const node = document.createElement('button');
            node.className = `level-node${isDone ? ' done' : ''}${isCurrent ? ' current' : ''}${isLocked ? ' locked' : ''}`;
            node.style.setProperty('--offset', `${Math.sin(n * 0.85) * 72}px`);
            node.disabled = isLocked;

            node.innerHTML = `
                <span class="level-node-icon"></span>
                <span class="level-node-num">${n}</span>
            `;

            const iconSlot = node.querySelector('.level-node-icon');
            if (isDone) {
                iconSlot.textContent = '✅';
            } else if (isLocked) {
                iconSlot.textContent = '🔒';
            } else {
                iconSlot.appendChild(createImgOrEmoji(ASSETS.levelTypeIcon(type), TYPE_ICON[type], 'level-node-icon-img'));
            }

            if (!isLocked) {
                node.addEventListener('click', () => this.onSelectLevel(n));
            }

            this.containerEl.appendChild(node);
        }

        requestAnimationFrame(() => {
            const currentEl = this.containerEl.querySelector('.level-node.current');
            if (currentEl) currentEl.scrollIntoView({ block: 'center', behavior: 'auto' });

            const height = this.containerEl.scrollHeight;
            dnaLayer.innerHTML = this._buildDNASvg(Math.max(height, 200));
        });
    }

    _buildDNASvg(height) {
        const width = 160;
        const centerX = width / 2;
        const amplitude = 46;
        const wavelength = 150;
        const freq = (Math.PI * 2) / wavelength;
        const step = 8;

        let strandA = '';
        let strandB = '';
        for (let y = 0; y <= height; y += step) {
            const x1 = centerX + amplitude * Math.sin(y * freq);
            const x2 = centerX - amplitude * Math.sin(y * freq);
            strandA += `${y === 0 ? 'M' : 'L'}${x1.toFixed(1)},${y} `;
            strandB += `${y === 0 ? 'M' : 'L'}${x2.toFixed(1)},${y} `;
        }

        let rungs = '';
        const rungStep = 25;
        for (let y = 0; y <= height; y += rungStep) {
            const x1 = centerX + amplitude * Math.sin(y * freq);
            const x2 = centerX - amplitude * Math.sin(y * freq);
            if (Math.abs(x1 - x2) > 12) {
                rungs += `<line x1="${x1.toFixed(1)}" y1="${y}" x2="${x2.toFixed(1)}" y2="${y}" stroke="url(#dnaRungGrad)" stroke-width="3" stroke-linecap="round" opacity="0.55"/>`;
            }
        }

        return `
        <svg class="dna-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="dnaStrandGradA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#c084fc"/>
                    <stop offset="50%" stop-color="#8b5cf6"/>
                    <stop offset="100%" stop-color="#6d28d9"/>
                </linearGradient>
                <linearGradient id="dnaStrandGradB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#a78bfa"/>
                    <stop offset="50%" stop-color="#7c3aed"/>
                    <stop offset="100%" stop-color="#5b21b6"/>
                </linearGradient>
                <linearGradient id="dnaRungGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#c084fc"/>
                    <stop offset="100%" stop-color="#a78bfa"/>
                </linearGradient>
            </defs>
            ${rungs}
            <path d="${strandA}" fill="none" stroke="url(#dnaStrandGradA)" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
            <path d="${strandB}" fill="none" stroke="url(#dnaStrandGradB)" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
        </svg>`;
    }
}
