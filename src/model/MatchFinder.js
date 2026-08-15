import { CONFIG } from '../config.js';
import { BONUS_TYPE } from './Tile.js';

export class MatchFinder {
    constructor(grid) {
        this.grid = grid;
    }

    find(lastMovedPos = null) {
        const tiles = this.grid.tiles;
        const hLines = [];
        const vLines = [];

        for (let r = 0; r < CONFIG.ROWS; r++) {
            let match = [];
            for (let c = 0; c < CONFIG.COLS; c++) {
                const t = tiles[r][c];

                if (t && !t.isCrate && !t.isFossil && !t.isMatched && t.bonus === BONUS_TYPE.NONE) {
                    if (match.length === 0 || match[0].type === t.type) {
                        match.push(t);
                    } else {
                        if (match.length >= 3) hLines.push([...match]);
                        match = [t];
                    }
                } else {
                    if (match.length >= 3) hLines.push([...match]);
                    match = [];
                }
            }
            if (match.length >= 3) hLines.push([...match]);
        }

        for (let c = 0; c < CONFIG.COLS; c++) {
            let match = [];
            for (let r = 0; r < CONFIG.ROWS; r++) {
                const t = tiles[r][c];
                if (t && !t.isCrate && !t.isFossil && !t.isMatched && t.bonus === BONUS_TYPE.NONE) {
                    if (match.length === 0 || match[0].type === t.type) {
                        match.push(t);
                    } else {
                        if (match.length >= 3) vLines.push([...match]);
                        match = [t];
                    }
                } else {
                    if (match.length >= 3) vLines.push([...match]);
                    match = [];
                }
            }
            if (match.length >= 3) vLines.push([...match]);
        }

        const allMatchedTiles = new Set();
        const bonusesToSpawn = [];
        const allLines = [...hLines, ...vLines];

        allLines.forEach(line => {
            line.forEach(t => allMatchedTiles.add(t));
        });

        const processedTiles = new Set();

        allLines.forEach(line => {
            const lineType = line[0].type;
            const isHoriz = hLines.includes(line);

            const intersecting = allLines.filter(other =>
                other !== line &&
                other[0].type === lineType &&
                other.some(t => line.includes(t))
            );

            let bonusType = BONUS_TYPE.NONE;

            if (intersecting.length > 0) {
                bonusType = BONUS_TYPE.BOMB;
            } else if (line.length >= 5) {
                bonusType = BONUS_TYPE.COLOR_BOMB;
            } else if (line.length === 4) {
                bonusType = isHoriz ? BONUS_TYPE.LINE_H : BONUS_TYPE.LINE_V;
            }

            if (bonusType !== BONUS_TYPE.NONE) {
                let targetTile = line.find(t =>
                    lastMovedPos && t.col === lastMovedPos.col && t.row === lastMovedPos.row
                );
                if (!targetTile) {
                    targetTile = line[Math.floor(line.length / 2)];
                }

                if (!processedTiles.has(targetTile)) {
                    processedTiles.add(targetTile);
                    bonusesToSpawn.push({
                        col: targetTile.col,
                        row: targetTile.row,
                        bonusType: bonusType,
                        colorType: lineType
                    });
                }
            }
        });

        return {
            matchedTiles: Array.from(allMatchedTiles),
            bonusesToSpawn
        };
    }

    hasMatchAt(c, r, type, tiles) {
        const h = (c >= 2 && !tiles[r][c-1]?.isCrate && !tiles[r][c-2]?.isCrate && !tiles[r][c-1]?.isFossil && !tiles[r][c-2]?.isFossil &&
                   tiles[r][c-1]?.type === type && tiles[r][c-2]?.type === type);
        const v = (r >= 2 && !tiles[r-1]?.[c]?.isCrate && !tiles[r-2]?.[c]?.isCrate && !tiles[r-1]?.[c]?.isFossil && !tiles[r-2]?.[c]?.isFossil &&
                   tiles[r-1]?.[c]?.type === type && tiles[r-2]?.[c]?.type === type);
        return h || v;
    }
}
