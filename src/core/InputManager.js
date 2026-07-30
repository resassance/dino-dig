import { CONFIG } from '../config.js';

export class InputManager {
    constructor(canvas, onSwapAttempt, onUseTool) {
        this.canvas = canvas;
        this.onSwap = onSwapAttempt;
        this.onUseTool = onUseTool;
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
        
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

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

        this.canvas.addEventListener('mousedown', onStart);
        this.canvas.addEventListener('mouseup', onEnd);
        this.canvas.addEventListener('touchstart', onStart, { passive: false });
        this.canvas.addEventListener('touchend', onEnd, { passive: false });
        this.canvas.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    }
}