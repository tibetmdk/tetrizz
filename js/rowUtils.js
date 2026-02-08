// rowUtils.js
import { COLS } from "./config.js";

export function detectFullRows(grid) {
    const rows = [];

    for (let y = 0; y < grid.length; y++) {
        if (grid[y].every(cell => cell !== 0)) {
            rows.push(y);
        }
    }

    return rows;
}

export function applyRowClear(grid, rows) {
    rows.forEach(y => {
        grid.splice(y, 1);
        grid.unshift(Array(COLS).fill(0));
    });
}
