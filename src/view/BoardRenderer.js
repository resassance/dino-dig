import { CONFIG, ASSETS } from '../config.js';
import { BONUS_TYPE } from '../model/Tile.js';
import { getReadyImage } from '../utils/AssetLoader.js';

export class BoardRenderer {
    constructor(ctx) {
        this.ctx = ctx;
    }

    _roundRect(x, y, w, h, r) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    drawBackground(digLayer) {
        const ctx = this.ctx;
        ctx.fillStyle = '#140d07';
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        for (let r = 0; r < CONFIG.ROWS; r++) {
            for (let c = 0; c < CONFIG.COLS; c++) {
                const x = CONFIG.OFFSET_X + c * (CONFIG.TILE_SIZE + CONFIG.TILE_GAP);
                const y = CONFIG.OFFSET_Y + r * (CONFIG.TILE_SIZE + CONFIG.TILE_GAP);
                const layer = digLayer ? digLayer.get(c, r) : 0;
                const ts = CONFIG.TILE_SIZE;

                if (layer === 2) {
                    ctx.fillStyle = '#544131';
                    this._roundRect(x, y, ts, ts, 8);
                    ctx.fill();
                    ctx.strokeStyle = '#7c624c';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    ctx.strokeStyle = '#382a1e';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(x + 12, y + 15); ctx.lineTo(x + 28, y + 38);
                    ctx.moveTo(x + 42, y + 12); ctx.lineTo(x + 32, y + 26);
                    ctx.stroke();

                } else if (layer === 1) {
                    ctx.fillStyle = '#8b5a2b';
                    this._roundRect(x, y, ts, ts, 8);
                    ctx.fill();
                    ctx.strokeStyle = '#b87d43';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    ctx.fillStyle = '#5c3a1b';
                    ctx.beginPath();
                    ctx.arc(x + 14, y + 14, 3, 0, Math.PI * 2);
                    ctx.arc(x + 42, y + 18, 2.5, 0, Math.PI * 2);
                    ctx.arc(x + 22, y + 42, 3, 0, Math.PI * 2);
                    ctx.arc(x + 45, y + 44, 2, 0, Math.PI * 2);
                    ctx.fill();

                } else {
                    ctx.fillStyle = '#0f0904';
                    this._roundRect(x, y, ts, ts, 8);
                    ctx.fill();
                    ctx.strokeStyle = '#2b190d';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();

                    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
                    this._roundRect(x + 2, y + 2, ts - 4, ts - 4, 6);
                    ctx.fill();
                }

                if (digLayer && digLayer.hasBuriedFossil(c, r) && layer <= 1) {
                    ctx.save();
                    ctx.globalAlpha = layer === 1 ? 0.35 : 0.9;
                    const sprite = getReadyImage(ASSETS.fossilTileSprite);
                    if (sprite) {
                        const pad3 = ts * 0.22;
                        ctx.drawImage(sprite, x + pad3, y + pad3, ts - pad3 * 2, ts - pad3 * 2);
                    } else {
                        ctx.fillStyle = '#f5e6d3';
                        ctx.font = '22px serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('🦴', x + ts / 2, y + ts / 2);
                    }
                    ctx.restore();
                }
            }
        }
    }

    drawSelection(selected) {
        if (!selected) return;
        const ctx = this.ctx;
        const x = CONFIG.OFFSET_X + selected.c * (CONFIG.TILE_SIZE + CONFIG.TILE_GAP) - 2;
        const y = CONFIG.OFFSET_Y + selected.r * (CONFIG.TILE_SIZE + CONFIG.TILE_GAP) - 2;
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        this._roundRect(x, y, CONFIG.TILE_SIZE + 4, CONFIG.TILE_SIZE + 4, 10);
        ctx.stroke();
    }

    drawTile(tile) {
        if (!tile || tile.alpha <= 0.01) return;
        const ctx = this.ctx;
        const ts = CONFIG.TILE_SIZE;

        const pad = 6;
        const drawSize = ts - pad * 2;
        const tx = tile.x + pad;
        const ty = tile.y + pad;

        ctx.save();
        ctx.globalAlpha = tile.alpha;
        ctx.translate(tile.shakeOffsetX || 0, tile.shakeOffsetY || 0);

        const cx = tile.x + ts / 2;
        const cy = tile.y + ts / 2;
        ctx.translate(cx, cy);
        ctx.scale(tile.scale, tile.scale);
        ctx.translate(-cx, -cy);

        if (tile.isFossil) {
            const sprite = getReadyImage(ASSETS.fossilTileSprite);
            if (sprite) {

                const pad2 = drawSize * 0.18;
                ctx.drawImage(sprite, tx + pad2, ty + pad2, drawSize - pad2 * 2, drawSize - pad2 * 2);
            } else {
                ctx.fillStyle = '#d9c8b0';
                this._roundRect(tx, ty, drawSize, drawSize, 10);
                ctx.fill();

                ctx.strokeStyle = '#8c775a';
                ctx.lineWidth = 2;
                this._roundRect(tx, ty, drawSize, drawSize, 10);
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.font = '22px serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🦴', cx, cy);
            }

        } else if (tile.isCrate) {
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            this._roundRect(tx + 2, ty + 3, drawSize, drawSize, 6);
            ctx.fill();

            ctx.fillStyle = '#7a4b21';
            this._roundRect(tx, ty, drawSize, drawSize, 6);
            ctx.fill();

            ctx.strokeStyle = '#4a2d11';
            ctx.lineWidth = 2;
            this._roundRect(tx, ty, drawSize, drawSize, 6);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx + drawSize, ty + drawSize);
            ctx.moveTo(tx + drawSize, ty);
            ctx.lineTo(tx, ty + drawSize);
            ctx.stroke();

            ctx.fillStyle = '#ffd700';
            ctx.font = '14px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('📦', cx, cy);

        } else if (tile.bonus && tile.bonus !== BONUS_TYPE.NONE) {

            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            this._roundRect(tx + 2, ty + 3, drawSize, drawSize, 6);
            ctx.fill();

            const grad = ctx.createLinearGradient(tx, ty, tx, ty + drawSize);
            grad.addColorStop(0, '#3a3560');
            grad.addColorStop(1, '#1c1a33');
            ctx.fillStyle = grad;
            this._roundRect(tx, ty, drawSize, drawSize, 6);
            ctx.fill();

            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            this._roundRect(tx, ty, drawSize, drawSize, 6);
            ctx.stroke();

            const sprite = getReadyImage(ASSETS.bonusSprites[tile.bonus]);
            if (sprite) {
                const bp = drawSize * 0.2;
                ctx.drawImage(sprite, tx + bp, ty + bp, drawSize - bp * 2, drawSize - bp * 2);
            } else {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 18px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                if (tile.bonus === BONUS_TYPE.LINE_H) {
                    ctx.fillText('↔', cx, cy);
                } else if (tile.bonus === BONUS_TYPE.LINE_V) {
                    ctx.fillText('↕', cx, cy);
                } else if (tile.bonus === BONUS_TYPE.BOMB) {
                    ctx.fillText('🧨', cx, cy);
                } else if (tile.bonus === BONUS_TYPE.COLOR_BOMB) {
                    ctx.fillText('⛏️', cx, cy);
                }
            }
        } else {
            const c = tile.color;
            if (!c) { ctx.restore(); return; }

            const sprite = getReadyImage(ASSETS.tileSprite(tile.colorKey));
            if (sprite) {

                ctx.save();
                this._roundRect(tx, ty, drawSize, drawSize, 6);
                ctx.clip();
                ctx.drawImage(sprite, tx, ty, drawSize, drawSize);
                ctx.restore();
            } else {
                ctx.fillStyle = 'rgba(0,0,0,0.35)';
                this._roundRect(tx + 2, ty + 3, drawSize, drawSize, 6);
                ctx.fill();

                ctx.fillStyle = c.main;
                this._roundRect(tx, ty, drawSize, drawSize, 6);
                ctx.fill();

                ctx.fillStyle = c.light;
                ctx.beginPath();
                ctx.ellipse(tx + drawSize/2, ty + drawSize/3, drawSize/3, drawSize/5, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = c.dark;
                ctx.lineWidth = 2;
                this._roundRect(tx, ty, drawSize, drawSize, 6);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    draw(grid, selected, digLayer) {
        this.drawBackground(digLayer);
        this.drawSelection(selected);

        for (let r = 0; r < CONFIG.ROWS; r++) {
            for (let c = 0; c < CONFIG.COLS; c++) {
                const t = grid.tiles[r][c];
                if (t) {
                    t.update();
                    this.drawTile(t);
                }
            }
        }
    }
}
