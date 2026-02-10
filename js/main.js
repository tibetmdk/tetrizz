import {
    COLS,
    ROWS,
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

import {
    initNext,
    getNextPiece,
    setNextPiece,
    drawNext
} from "./nextUtils.js";

import {
    initTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    updateTimer
} from "./timerUtils.js";

import {
    initHold,
    holdCurrentPiece,
    enableHold,
    drawHold
} from "./holdUtils.js";

import {
    initScore,
    addScore,
    addDropScore,
    getLevel,
    resetScore,
    saveScore
} from "./scoreUtils.js";

/* ======================
   CANVAS
====================== */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const nextCanvas = document.getElementById("next-piece");
const nextCtx = nextCanvas.getContext("2d");

const holdCanvas = document.getElementById("hold-piece");
const holdCtx = holdCanvas.getContext("2d");

/* ======================
   STATE
====================== */
let BLOCK_SIZE = 0;
let isPaused = false;
let gameOver = false;

let clearingRows = [];
let clearStartTime = 0;

let lastTime = 0;
let dropInterval = 800;

let softDrop = false;
const SOFT_DROP_INTERVAL = 50;

/* ======================
   GRID
====================== */
const grid = Array.from({ length: ROWS }, () =>
    Array(COLS).fill(0)
);

/* ======================
   SPEED TABLE
====================== */
function updateSpeed() {
    const level = getLevel();
    const table = [800, 720, 630, 550, 470, 380, 300, 220, 130, 100];
    dropInterval = table[Math.min(level - 1, table.length - 1)];
}

/* ======================
   RESIZE
====================== */
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

    nextCanvas.width = nextCanvas.clientWidth;
    nextCanvas.height = nextCanvas.clientWidth;

    holdCanvas.width = holdCanvas.clientWidth;
    holdCanvas.height = holdCanvas.clientWidth;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* ======================
   INIT
====================== */
let active = spawnPiece();

initNext(spawnPiece());
initHold();
initTimer("timer");
initScore("score", "level");

startTimer();

/* ======================
   ROTATE
====================== */
function rotatePiece() {
    const rotated = rotateMatrix(active.shape);
    const test = { ...active, shape: rotated };
    if (!collides(test, grid)) active.shape = rotated;
}

/* ======================
   FIX PIECE
====================== */
function fixPiece() {
    active.shape.forEach((row, y) =>
        row.forEach((cell, x) => {
            if (cell) grid[active.y + y][active.x + x] = active.color;
        })
    );

    clearingRows = detectFullRows(grid);
    enableHold();

    if (clearingRows.length > 0) {
        clearStartTime = performance.now();
    } else {
        active = getNextPiece();
        setNextPiece(spawnPiece());

        if (collides(active, grid)) {
            gameOver = true;
            pauseTimer();
            saveScore();
        }
    }
}

/* ======================
   CLEAR ROWS
====================== */
function handleRowClear(time) {
    if (clearingRows.length === 0) return;

    if (time - clearStartTime >= CLEAR_DELAY) {
        const cleared = clearingRows.length;

        applyRowClear(grid, clearingRows);
        clearingRows = [];

        addScore(cleared);
        updateSpeed();

        active = getNextPiece();
        setNextPiece(spawnPiece());

        if (collides(active, grid)) {
            gameOver = true;
            pauseTimer();
            saveScore();
        }
    }
}

/* ======================
   DRAW (🔴 EKSİK OLAN BUYDU)
====================== */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx, COLS, ROWS, BLOCK_SIZE, canvas.width, canvas.height);

    grid.forEach((row, y) =>
        row.forEach((cell, x) => {
            if (!cell) return;

            if (clearingRows.includes(y)) {
                const blink = Math.floor(performance.now() / 80) % 2;
                if (blink === 0) {
                    drawBlock(ctx, x, y, BLOCK_SIZE, "white");
                }
                return;
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

    drawNext(
        nextCtx,
        getNextPiece(),
        Math.floor(nextCanvas.width / 4),
        nextCanvas.width
    );

    drawHold(holdCtx, holdCanvas);
}

/* ======================
   LOOP
====================== */
function update(time = 0) {
    if (!isPaused && !gameOver) {
        handleRowClear(time);

        const interval = softDrop ? SOFT_DROP_INTERVAL : dropInterval;

        if (time - lastTime > interval) {
            if (!collides(active, grid, 0, 1)) {
                active.y++;
                addDropScore();
            } else {
                fixPiece();
            }
            lastTime = time;
        }
    }

    draw();
    updateTimer();
    requestAnimationFrame(update);
}

/* ======================
   INPUT
====================== */
document.addEventListener("keydown", e => {

    // PAUSE
    if (e.key === "Escape") {
        isPaused = !isPaused;
        isPaused ? pauseTimer() : startTimer();
        return;
    }

    // GAME OVER RESET
    if (gameOver && e.key.toLowerCase() === "r") {
        resetGame();
        return;
    }

    if (isPaused || gameOver) return;

    // 🔴 HOLD (C)
    if (e.key.toLowerCase() === "c") {
        const result = holdCurrentPiece(
            active,
            getNextPiece,
            setNextPiece,
            spawnPiece
        );

        if (result.changed) {
            active = result.active;
        }
        return;
    }

    // SOFT DROP
    if (e.key === "ArrowDown") {
        softDrop = true;

        if (!collides(active, grid, 0, 1)) {
            active.y++;
            addDropScore();
            lastTime = performance.now();
        }
        return;
    }

    // MOVE
    if (e.key === "ArrowLeft" && !collides(active, grid, -1, 0)) active.x--;
    if (e.key === "ArrowRight" && !collides(active, grid, 1, 0)) active.x++;
    if (e.key === "ArrowUp") rotatePiece();
});

document.addEventListener("keyup", e => {
    if (e.key === "ArrowDown") softDrop = false;
});


/* ======================
   RESET
====================== */
function resetGame() {
    for (let y = 0; y < ROWS; y++) grid[y].fill(0);

    gameOver = false;
    isPaused = false;

    active = spawnPiece();
    initNext(spawnPiece());
    initHold();

    resetScore();
    resetTimer();
    startTimer();

    updateSpeed();
}

/* ======================
   START
====================== */
update();
