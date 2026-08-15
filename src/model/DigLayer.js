import { CONFIG } from '../config.js';
import { rand } from '../utils/math.js';

export class DigLayer {
    constructor() {
        this.cols = CONFIG.COLS;
        this.rows = CONFIG.ROWS;
        this.layer = [];
        this.buriedFossils = [];
    }

    init(defaultDepth = 2, fossilParam = 4) {
        this.layer = [];
        this.buriedFossils = [];

        for (let r = 0; r < this.rows; r++) {
            this.layer[r] = [];
            this.buriedFossils[r] = [];
            for (let c = 0; c < this.cols; c++) {
                this.layer[r][c] = defaultDepth;
                this.buriedFossils[r][c] = false;
            }
        }

        if (Array.isArray(fossilParam)) {
            fossilParam.forEach(p => {
                if (this.buriedFossils[p.r] && this.buriedFossils[p.r][p.c] !== undefined) {
                    this.buriedFossils[p.r][p.c] = true;
                }
            });
        } else if (typeof fossilParam === 'number') {
            let placed = 0;
            const targetCount = Math.min(fossilParam, this.cols * this.rows);
            while (placed < targetCount) {
                const r = rand(this.rows);
                const c = rand(this.cols);
                if (!this.buriedFossils[r][c]) {
                    this.buriedFossils[r][c] = true;
                    placed++;
                }
            }
        }
    }

    get(c, r) {
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return 0;
        return this.layer[r][c];
    }

    dig(c, r) {
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return false;
        if (this.layer[r][c] > 0) {
            this.layer[r][c]--;
            if (this.layer[r][c] === 0 && this.buriedFossils[r][c]) {
                this.buriedFossils[r][c] = false;
                return true;
            }
        }
        return false;
    }

    hasBuriedFossil(c, r) {
        return !!this.buriedFossils[r]?.[c];
    }
}
