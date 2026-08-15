import { CONFIG } from '../config.js';

export class InputManager {
    constructor(canvas, onSwapAttempt, onUseTool, onActivateBonus) {
        this.canvas = canvas;
        this.onSwap = onSwapAttempt;
        this.onUseTool = onUseTool;
        this.onActivateBonus = onActivateBonus;
        this.selected = null;
        this.activeTool = null;
        this._bind();
    }

    setActiveTool(tool) {
        this.activeTool = tool;
    }

    _getPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.changedTouches ? e.changedTouches[0] : (e.touches ? e.touches[0] : null);
        const clientX = touch ? touch.clientX : e.clientX;
        const clientY = touch ? touch.clientY : e.clientY;

        const scaleX = CONFIG.CANVAS_WIDTH / rect.width;
        const scaleY = CONFIG.CANVAS_HEIGHT / rect.height;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    _getCell(x, y) {
        const c = Math.floor((x - CONFIG.OFFSET_X) / (CONFIG.TILE_SIZE + CONFIG.TILE_GAP));
        const r = Math.floor((y - CONFIG.OFFSET_Y) / (CONFIG.TILE_SIZE + CONFIG.TILE_GAP));
        if (c >= 0 && c < CONFIG.COLS && r >= 0 && r < CONFIG.ROWS) return { c, r };
        return null;
    }

    _bind() {
        let start = null;
        let startCell = null;
        let isDragging = false;
        let lastTapCell = null;
        let lastTapTime = 0;

        const onStart = (e) => {
            const pos = this._getPos(e);
            const cell = this._getCell(pos.x, pos.y);
            if (!cell) return;
            start = pos;
            startCell = cell;
            isDragging = true;
        };

        const onEnd = (e) => {
            if (!isDragging || !startCell) return;
            isDragging = false;

            const pos = this._getPos(e);
            const dx = pos.x - start.x;
            const dy = pos.y - start.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 10) {
                const now = Date.now();
                const isDoubleTap = lastTapCell &&
                    lastTapCell.c === startCell.c && lastTapCell.r === startCell.r &&
                    (now - lastTapTime) < 300;
                lastTapCell = startCell;
                lastTapTime = now;

                if (isDoubleTap) {
                    lastTapCell = null;
                    if (this.onActivateBonus) this.onActivateBonus(startCell.c, startCell.r);
                    this.selected = null;
                    return;
                }

                if (this.activeTool && this.onUseTool) {
                    this.onUseTool(this.activeTool, startCell.c, startCell.r);
                    this.selected = null;
                    return;
                }

                if (this.selected && (this.selected.c !== startCell.c || this.selected.r !== startCell.r)) {
                    const dc = Math.abs(this.selected.c - startCell.c);
                    const dr = Math.abs(this.selected.r - startCell.r);
                    if (dc + dr === 1) {
                        this.onSwap(this.selected.c, this.selected.r, startCell.c, startCell.r);
                        this.selected = null;
                        return;
                    }
                }
                this.selected = startCell;
                return;
            }

            lastTapCell = null;
            let tc = startCell.c, tr = startCell.r;
            if (Math.abs(dx) > Math.abs(dy)) {
                tc += dx > 0 ? 1 : -1;
            } else {
                tr += dy > 0 ? 1 : -1;
            }

            if (tc >= 0 && tc < CONFIG.COLS && tr >= 0 && tr < CONFIG.ROWS) {
                this.onSwap(startCell.c, startCell.r, tc, tr);
                this.selected = null;
            }
        };

        this.canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            onStart(e);
        });

        window.addEventListener('mouseup', onEnd);
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            onStart(e);
        }, { passive: false });
        this.canvas.addEventListener('touchend', onEnd, { passive: false });
        this.canvas.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        this.canvas.addEventListener('selectstart', e => e.preventDefault());
        this.canvas.addEventListener('dragstart', e => e.preventDefault());
    }
}
