// spawnUtils.js
import { COLS, TETROMINOS, COLORS } from "./config.js";

export function spawnPiece() {
    const i = Math.floor(Math.random() * TETROMINOS.length);
    const shape = TETROMINOS[i];

    return {
        shape,
        color: COLORS[i],
        x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
        y: 0
    };
}
