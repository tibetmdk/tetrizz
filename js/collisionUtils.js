import { COLS, ROWS } from "./config.js";

export function collides(piece, grid, dx = 0, dy = 0) {
    return piece.shape.some((row, y) =>
        row.some((cell, x) => {
            if (!cell) return false;

            const nx = piece.x + x + dx;
            const ny = piece.y + y + dy;

            return (
                nx < 0 ||
                nx >= COLS ||
                ny >= ROWS ||
                (ny >= 0 && grid[ny][nx])
            );
        })
    );
}
