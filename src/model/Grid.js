import { CONFIG, COLOR_KEYS } from '../config.js';
import { rand } from '../utils/math.js';
import { Tile, BONUS_TYPE } from './Tile.js';
import { MatchFinder } from './MatchFinder.js';

export class Grid {
    constructor() {
        this.cols = CONFIG.COLS;
        this.rows = CONFIG.ROWS;
        this.tiles = [];
        this.finder = new MatchFinder(this);
        this.lastMovedPos = null;
    }

    applyPickaxe(c, r) {
        const t = this.get(c, r);
        if (!t || t.isFossil || t.isCrate) return false;
        t.isMatched = true;
        return true;
    }

    applyDynamite(c, r) {
        let applied = false;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const t = this.get(c + dc, r + dr);
                if (t && !t.isFossil && !t.isCrate) {
                    t.isMatched = true;
                    applied = true;
                }
            }
        }
        return applied;
    }

    init(levelType = 1, options = {}) {
        const crateCount = options.crateCount || 8;
        const fossilCount = Math.min(options.fossilCount || 3, this.cols);

        this.tiles.length = 0;
        this.tiles = [];
        this.lastMovedPos = null;

        const cratePositions = new Set();
        const fossilPositions = new Set();

        if (levelType === 2) {
            while (cratePositions.size < crateCount) {
                const r = 1 + rand(this.rows - 2);
                const c = 1 + rand(this.cols - 2);
                cratePositions.add(`${r},${c}`);
            }
        } else if (levelType === 3) {
            while (fossilPositions.size < fossilCount) {
                const c = rand(this.cols);
                fossilPositions.add(`0,${c}`);
            }
        }

        for (let r = 0; r < this.rows; r++) {
            this.tiles[r] = [];
            for (let c = 0; c < this.cols; c++) {
                const key = `${r},${c}`;
                const isCrate = cratePositions.has(key);
                const isFossil = fossilPositions.has(key);

                if (isCrate) {
                    this.tiles[r][c] = new Tile(c, r, -1, true);
                } else if (isFossil) {
                    this.tiles[r][c] = new Tile(c, r, -1, false, BONUS_TYPE.NONE, true);
                } else {
                    let type;
                    do {
                        type = rand(COLOR_KEYS.length);
                    } while (this.finder.hasMatchAt(c, r, type, this.tiles));
                    this.tiles[r][c] = new Tile(c, r, type, false);
                }
            }
        }
    }

    get(c, r) {
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return null;
        return this.tiles[r][c];
    }

    trySwap(c1, r1, c2, r2) {
        if (Math.abs(c1 - c2) + Math.abs(r1 - r2) !== 1) return false;

        const t1 = this.tiles[r1][c1];
        const t2 = this.tiles[r2][c2];

        if (!t1 || !t2 || t1.isCrate || t2.isCrate) return false;

        this.tiles[r1][c1] = t2;
        this.tiles[r2][c2] = t1;
        t1.setGridPos(c2, r2);
        t2.setGridPos(c1, r1);

        this.lastMovedPos = { col: c2, row: r2 };

        const t1HasBonus = t1.bonus && t1.bonus !== BONUS_TYPE.NONE;
        const t2HasBonus = t2.bonus && t2.bonus !== BONUS_TYPE.NONE;

        if (t1HasBonus || t2HasBonus) {
            if (t1.bonus === BONUS_TYPE.COLOR_BOMB || t2.bonus === BONUS_TYPE.COLOR_BOMB) {
                const colorBomb = t1.bonus === BONUS_TYPE.COLOR_BOMB ? t1 : t2;
                const otherTile = t1.bonus === BONUS_TYPE.COLOR_BOMB ? t2 : t1;

                colorBomb.isMatched = true;
                if (!otherTile.isCrate && !otherTile.isFossil) {
                    const targetType = otherTile.type;
                    for (let r = 0; r < this.rows; r++) {
                        for (let c = 0; c < this.cols; c++) {
                            const t = this.tiles[r][c];
                            if (t && !t.isCrate && !t.isFossil && t.type === targetType) {
                                t.isMatched = true;
                            }
                        }
                    }
                }
            } else {
                if (t1HasBonus) t1.isMatched = true;
                if (t2HasBonus) t2.isMatched = true;
            }
            return true;
        }

        const result = this.finder.find(this.lastMovedPos);

        if (result.matchedTiles.length === 0) {
            this.tiles[r1][c1] = t1;
            this.tiles[r2][c2] = t2;
            t1.setGridPos(c1, r1);
            t2.setGridPos(c2, r2);
            this.lastMovedPos = null;
            return false;
        }
        return true;
    }

    shakeTiles(c1, r1, c2, r2) {
        const now = performance.now();
        const axis = (r1 === r2) ? 'x' : 'y';
        [[c1, r1], [c2, r2]].forEach(([c, r]) => {
            const t = this.get(c, r);
            if (t) {
                t.shakeUntil = now + 260;
                t.shakeAxis = axis;
            }
        });
    }

    activateBonusAt(c, r) {
        const t = this.get(c, r);
        if (!t || t.isCrate || t.isFossil) return false;
        if (!t.bonus || t.bonus === BONUS_TYPE.NONE) return false;

        t.isMatched = true;
        const affected = this._getBonusAffectedTiles(t);
        affected.forEach(bt => { bt.isMatched = true; });
        return true;
    }

    findAndMarkMatches() {
        const result = this.finder.find(this.lastMovedPos);
        const matchedSet = new Set(result.matchedTiles);

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const t = this.tiles[r][c];
                if (t && t.isMatched) {
                    matchedSet.add(t);
                }
            }
        }

        if (matchedSet.size === 0) return { hasMatches: false, bonusesToSpawn: [], matchedTypes: [] };

        this._bonusExplodedTiles = new Set();
        this._bonusCratesToDamage = new Set();

        const queue = Array.from(matchedSet);
        while (queue.length > 0) {
            const tile = queue.pop();
            tile.isMatched = true;

            if (tile.bonus && tile.bonus !== BONUS_TYPE.NONE) {
                const affected = this._getBonusAffectedTiles(tile);
                affected.forEach(bt => {
                    if (!matchedSet.has(bt) && !bt.isMatched) {
                        bt.isMatched = true;
                        matchedSet.add(bt);
                        this._bonusExplodedTiles.add(bt);
                        queue.push(bt);
                    }
                });

                this._getBonusAffectedCrates(tile).forEach(ct => this._bonusCratesToDamage.add(ct));
            }
        }

        const matchedTypes = [];
        matchedSet.forEach(tile => {
            if (!tile.isCrate && !tile.isFossil && tile.type !== undefined) {
                if (!matchedTypes.includes(tile.type)) {
                    matchedTypes.push(tile.type);
                }
            }
        });

        return {
            hasMatches: true,
            bonusesToSpawn: result.bonusesToSpawn,
            matchedTypes
        };
    }

    _getBonusAffectedTiles(tile) {
        const affected = [];
        const { col: c, row: r, bonus, type } = tile;

        if (bonus === BONUS_TYPE.LINE_H) {
            for (let col = 0; col < this.cols; col++) {
                const t = this.get(col, r);
                if (t && !t.isCrate && !t.isFossil) affected.push(t);
            }
        } else if (bonus === BONUS_TYPE.LINE_V) {
            for (let row = 0; row < this.rows; row++) {
                const t = this.get(c, row);
                if (t && !t.isCrate && !t.isFossil) affected.push(t);
            }
        } else if (bonus === BONUS_TYPE.BOMB) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const t = this.get(c + dc, r + dr);
                    if (t && !t.isCrate && !t.isFossil) affected.push(t);
                }
            }
        } else if (bonus === BONUS_TYPE.COLOR_BOMB) {

            const targetType = (type !== null && type !== undefined) ? type : this._dominantType();
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const t = this.get(col, row);
                    if (t && !t.isCrate && !t.isFossil && (!t.bonus || t.bonus === BONUS_TYPE.NONE) && t.type === targetType) affected.push(t);
                }
            }
        }
        return affected;
    }

    _dominantType() {
        const counts = {};
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const t = this.tiles[r][c];
                if (t && !t.isCrate && !t.isFossil && (!t.bonus || t.bonus === BONUS_TYPE.NONE) && t.type !== null && t.type !== undefined) {
                    counts[t.type] = (counts[t.type] || 0) + 1;
                }
            }
        }
        let best = 0;
        let bestCount = -1;
        Object.keys(counts).forEach(k => {
            if (counts[k] > bestCount) {
                bestCount = counts[k];
                best = Number(k);
            }
        });
        return best;
    }

    _getBonusAffectedCrates(tile) {
        const crates = [];
        const { col: c, row: r, bonus } = tile;

        if (bonus === BONUS_TYPE.LINE_H) {
            for (let col = 0; col < this.cols; col++) {
                const t = this.get(col, r);
                if (t && t.isCrate) crates.push(t);
            }
        } else if (bonus === BONUS_TYPE.LINE_V) {
            for (let row = 0; row < this.rows; row++) {
                const t = this.get(c, row);
                if (t && t.isCrate) crates.push(t);
            }
        } else if (bonus === BONUS_TYPE.BOMB) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const t = this.get(c + dc, r + dr);
                    if (t && t.isCrate) crates.push(t);
                }
            }
        }
        return crates;
    }

    collectBottomFossils() {
        let collected = 0;
        const lastRow = this.rows - 1;
        for (let c = 0; c < this.cols; c++) {
            const t = this.tiles[lastRow][c];
            if (t && t.isFossil && !t.isMatched) {
                t.isMatched = true;
                this.tiles[lastRow][c] = null;
                collected++;
            }
        }
        return collected;
    }

    removeMatches(digLayer = null, bonusesToSpawn = []) {
        let destroyedCratesCount = 0;
        let unburiedFossilsCount = 0;

        const cratesToDamage = new Set(this._bonusCratesToDamage || []);
        const bonusExploded = this._bonusExplodedTiles || new Set();

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const t = this.tiles[r][c];
                if (t?.isMatched) {
                    if (t.isFossil) {
                        t.isMatched = false;
                        continue;
                    }

                    if (!t.isCrate) {
                        this.tiles[r][c] = null;

                        if (digLayer) {
                            const unburied = digLayer.dig(c, r);
                            if (unburied) unburiedFossilsCount++;
                        }

                        if (!bonusExploded.has(t)) {

                            const neighbors = [
                                {c: c+1, r: r}, {c: c-1, r: r},
                                {c: c, r: r+1}, {c: c, r: r-1}
                            ];
                            for (const n of neighbors) {
                                const nb = this.get(n.c, n.r);
                                if (nb && nb.isCrate && !nb.isMatched) {
                                    cratesToDamage.add(nb);
                                }
                            }
                        }
                    }
                }
            }
        }

        this._bonusExplodedTiles = null;
        this._bonusCratesToDamage = null;

        cratesToDamage.forEach(crate => {
            crate.crateHp--;
            if (crate.crateHp <= 0) {
                crate.isMatched = true;
                this.tiles[crate.row][crate.col] = null;
                destroyedCratesCount++;
            }
        });

        bonusesToSpawn.forEach(b => {

            const newBonusTile = new Tile(b.col, b.row, null, false, b.bonusType);
            this.tiles[b.row][b.col] = newBonusTile;
        });

        this.lastMovedPos = null;
        return { destroyedCratesCount, unburiedFossilsCount };
    }

    applyGravity() {
        let moved = false;
        for (let c = 0; c < this.cols; c++) {
            let writeRow = this.rows - 1;
            for (let r = this.rows - 1; r >= 0; r--) {
                if (this.tiles[r][c] !== null) {
                    if (r !== writeRow) {
                        this.tiles[writeRow][c] = this.tiles[r][c];
                        this.tiles[r][c] = null;
                        this.tiles[writeRow][c].setGridPos(c, writeRow);
                        moved = true;
                    }
                    writeRow--;
                }
            }
            for (let r = writeRow; r >= 0; r--) {
                const type = rand(COLOR_KEYS.length);
                const tile = new Tile(c, r, type);
                tile.y = CONFIG.OFFSET_Y - (CONFIG.TILE_SIZE + CONFIG.TILE_GAP) * (writeRow - r + 2);
                tile.isNew = true;
                this.tiles[r][c] = tile;
                moved = true;
            }
        }
        return moved;
    }

    isAnimating() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const t = this.tiles[r][c];
                if (!t) continue;
                if (Math.abs(t.x - t.targetX) > 1 || Math.abs(t.y - t.targetY) > 1) return true;
                if (t.isMatched && t.scale > 0.1) return true;
            }
        }
        return false;
    }
}
