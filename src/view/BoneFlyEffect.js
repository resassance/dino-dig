import { ASSETS } from '../config.js';
import { getReadyImage } from '../utils/AssetLoader.js';

export function spawnBoneFly(layerEl, targetEl, count = 1) {
    if (!layerEl || !targetEl || count <= 0) return;

    const layerRect = layerEl.getBoundingClientRect();
    if (layerRect.width === 0 || layerRect.height === 0) return;

    for (let i = 0; i < count; i++) {
        setTimeout(() => spawnOne(layerEl, targetEl), i * 220);
    }
}

function spawnOne(layerEl, targetEl) {
    const layerRect = layerEl.getBoundingClientRect();

    const el = document.createElement('div');
    el.className = 'bone-fly';

    const spritePath = ASSETS.fossilTileSprite;
    const sprite = getReadyImage(spritePath);
    if (sprite) {
        const img = document.createElement('img');
        img.src = spritePath;
        img.className = 'bone-fly-img';
        el.appendChild(img);
    } else {
        el.textContent = '🦴';
    }

    const startX = layerRect.width / 2 + (Math.random() * 50 - 25);
    const startY = layerRect.height / 2 + (Math.random() * 50 - 25);
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;

    layerEl.appendChild(el);
    void el.offsetWidth;
    el.classList.add('appear');

    setTimeout(() => {
        const targetRect = targetEl.getBoundingClientRect();
        const targetX = targetRect.left + targetRect.width / 2 - layerRect.left;
        const targetY = targetRect.top + targetRect.height / 2 - layerRect.top;

        el.classList.remove('appear');
        el.classList.add('flying');
        el.style.left = `${targetX}px`;
        el.style.top = `${targetY}px`;
        el.style.transform = 'translate(-50%, -50%) scale(0.25)';
        el.style.opacity = '0';

        setTimeout(() => el.remove(), 1150);
    }, 900);
}
