import {
    COLS,
    ROWS,
    DROP_INTERVAL,
    CLEAR_DELAY
} from "./config.js";

import { spawnPiece } from "./spawnUtils.js";
import { collides } from "./collisionUtils.js";
import { rotateMatrix } from "./rotationUtils.js";
import { detectFullRows, applyRowClear } from "./rowUtils.js";
import {
    drawBlock,
    drawGrid,
    drawPause,
    drawGameOver
} from "./drawUtils.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let BLOCK_SIZE = 0;
let isPaused = false;
let gameOver = false;

let clearingRows = [];
let clearStartTime = 0;

const grid = Array.from({ length: ROWS }, () =>
    Array(COLS).fill(0)
);

// ======================
// RESIZE
// ======================
function resizeCanvas() {
    const container = document.querySelector(".game-container");
    const maxHeight = window.innerHeight - 40;

    let block = Math.floor(container.clientWidth / COLS);
    let totalHeight = block * ROWS;

    if (totalHeight > maxHeight) {
        block = Math.floor(maxHeight / ROWS);
    }

    BLOCK_SIZE = block;
    canvas.width = COLS * block;
    canvas.height = ROWS * block;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ======================
// GAME STATE
// ======================
let active = spawnPiece();

// ======================
// ROTATE
// ======================
function rotatePiece() {
    const rotated = rotateMatrix(active.shape);
    const test = { ...active, shape: rotated };
    if (!collides(test, grid)) active.shape = rotated;
}

// ======================
// FIX
// ======================
function fixPiece() {
    active.shape.forEach((row, y) =>
        row.forEach((cell, x) => {
            if (cell) {
                grid[active.y + y][active.x + x] = active.color;
            }
        })
    );

    clearingRows = detectFullRows(grid);

    if (clearingRows.length > 0) {
        clearStartTime = performance.now();
    } else {
        active = spawnPiece();
        if (collides(active, grid)) gameOver = true;
    }
}

// ======================
// CLEAR
// ======================
function handleRowClear(time) {
    if (clearingRows.length === 0) return;

    if (time - clearStartTime >= CLEAR_DELAY) {
        applyRowClear(grid, clearingRows);
        clearingRows = [];
        active = spawnPiece();
        if (collides(active, grid)) gameOver = true;
    }
}

// ======================
// DRAW
// ======================
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx, COLS, ROWS, BLOCK_SIZE, canvas.width, canvas.height);

    grid.forEach((row, y) =>
        row.forEach((cell, x) => {
            if (!cell) return;

            if (clearingRows.includes(y)) {
                const blink = Math.floor(performance.now() / 80) % 2;
                if (blink === 0) return;
            }

            drawBlock(ctx, x, y, BLOCK_SIZE, cell);
        })
    );

    if (!gameOver && clearingRows.length === 0) {
        active.shape.forEach((row, y) =>
            row.forEach((cell, x) => {
                if (cell) {
                    drawBlock(
                        ctx,
                        active.x + x,
                        active.y + y,
                        BLOCK_SIZE,
                        active.color
                    );
                }
            })
        );
    }

    if (isPaused) drawPause(ctx, canvas.width, canvas.height);
    if (gameOver) drawGameOver(ctx, canvas.width, canvas.height);
}

// ======================
// LOOP
// ======================
let lastTime = 0;

function update(time = 0) {
    if (!isPaused && !gameOver) {
        handleRowClear(time);

        if (clearingRows.length === 0 && time - lastTime > DROP_INTERVAL) {
            if (!collides(active, grid, 0, 1)) {
                active.y++;
            } else {
                fixPiece();
            }
            lastTime = time;
        }
    }

    draw();
    requestAnimationFrame(update);
}

// ======================
// INPUT
// ======================
document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        isPaused = !isPaused;
        return;
    }

    if (gameOver && e.key.toLowerCase() === "r") {
        resetGame();
        return;
    }

    if (isPaused || gameOver || clearingRows.length > 0) return;

    if (e.key === "ArrowLeft" && !collides(active, grid, -1, 0)) active.x--;
    if (e.key === "ArrowRight" && !collides(active, grid, 1, 0)) active.x++;
    if (e.key === "ArrowDown" && !collides(active, grid, 0, 1)) active.y++;
    if (e.key === "ArrowUp") rotatePiece();
});

// ======================
// RESET
// ======================
function resetGame() {
    for (let y = 0; y < ROWS; y++) grid[y].fill(0);
    clearingRows = [];
    isPaused = false;
    gameOver = false;
    active = spawnPiece();
}

// ======================
update();
