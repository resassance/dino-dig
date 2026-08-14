import { CONFIG, COLOR_KEYS } from '../config.js';
import { lerp } from '../utils/math.js';

export const BONUS_TYPE = {
    NONE: 'NONE',
    LINE_H: 'LINE_H',
    LINE_V: 'LINE_V',
    BOMB: 'BOMB',
    COLOR_BOMB: 'COLOR_BOMB'
};

export class Tile {
    constructor(col, row, type, isCrate = false, bonus = BONUS_TYPE.NONE, isFossil = false) {
        this.col = col;
        this.row = row;
        this.type = type;
        this.isCrate = isCrate;
        this.crateHp = isCrate ? 1 : 0;
        this.bonus = bonus;
        this.isFossil = isFossil;
        
        this.x = this._calcX(col);
        this.y = this._calcY(row);
        this.targetX = this.x;
        this.targetY = this.y;
        this.scale = 1;
        this.alpha = 1;
        this.isMatched = false;
        this.isNew = true;
        this.shakeUntil = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        this.shakeAxis = 'x';
    }

    get color() { 
        if (this.isCrate || this.isFossil || this.bonus !== BONUS_TYPE.NONE) return null;
        return CONFIG.COLORS[COLOR_KEYS[this.type]]; 
    }

    get colorKey() {
        if (this.isCrate || this.isFossil || this.bonus !== BONUS_TYPE.NONE) return null;
        return COLOR_KEYS[this.type];
    }

    _calcX(c) { return CONFIG.OFFSET_X + c * (CONFIG.TILE_SIZE + CONFIG.TILE_GAP); }
    _calcY(r) { return CONFIG.OFFSET_Y + r * (CONFIG.TILE_SIZE + CONFIG.TILE_GAP); }

    setGridPos(col, row) {
        this.col = col;
        this.row = row;
        this.targetX = this._calcX(col);
        this.targetY = this._calcY(row);
    }

    update() {
        this.x = lerp(this.x, this.targetX, CONFIG.ANIM_SPEED);
        this.y = lerp(this.y, this.targetY, CONFIG.ANIM_SPEED);

        if (this.isMatched) {
            this.scale = lerp(this.scale, 0, 0.18);
            this.alpha = lerp(this.alpha, 0, 0.18);
        }
        if (this.isNew && Math.abs(this.y - this.targetY) < 0.5) {
            this.isNew = false;
        }

        if (this.shakeUntil > performance.now()) {
            const remaining = this.shakeUntil - performance.now();
            const wobble = Math.sin(remaining * 0.09) * 5 * (remaining / 260);
            if (this.shakeAxis === 'y') {
                this.shakeOffsetX = 0;
                this.shakeOffsetY = wobble;
            } else {
                this.shakeOffsetX = wobble;
                this.shakeOffsetY = 0;
            }
        } else {
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
        }
    }
}