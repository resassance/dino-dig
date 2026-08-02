const TYPE_ICON = { 1: '⛏️', 2: '📦', 3: '🦴' };
const TYPE_LABEL = { 1: 'Раскопки', 2: 'Ящики со снаряжением', 3: 'Кости вниз' };
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

        // Показываем весь пройденный путь + немного будущих (запертых) уровней
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
            node.title = `${TYPE_LABEL[type]} · уровень ${n}`;

            node.innerHTML = `
                <span class="level-node-icon">${isDone ? '✅' : (isLocked ? '🔒' : TYPE_ICON[type])}</span>
                <span class="level-node-num">${n}</span>
            `;

            if (!isLocked) {
                node.addEventListener('click', () => this.onSelectLevel(n));
            }

            this.containerEl.appendChild(node);
        }

        requestAnimationFrame(() => {
            const currentEl = this.containerEl.querySelector('.level-node.current');
            if (currentEl) currentEl.scrollIntoView({ block: 'center', behavior: 'auto' });
        });
    }
}
