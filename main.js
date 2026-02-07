const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ======================
// CONFIG
// ======================
const COLS = 10;
const ROWS = 20;
const DROP_INTERVAL = 500;
const CLEAR_DELAY = 300;

let BLOCK_SIZE = 0;

// ======================
// GAME STATE
// ======================
let isPaused = false;
let gameOver = false;

// ======================
// ROW CLEAR STATE
// ======================
let clearingRows = [];
let clearStartTime = 0;

// ======================
// GRID
// ======================
const grid = Array.from({ length: ROWS }, () =>
    Array(COLS).fill(0)
);

// ======================
// COLORS
// ======================
const COLORS = [
    "#00ffff",
    "#ffff00",
    "#a000f0",
    "#00ff00",
    "#ff0000",
    "#0000ff",
    "#ff7f00"
];

// ======================
// TETROMINOS
// ======================
const TETROMINOS = [
    [[1,1,1,1]],
    [[1,1],[1,1]],
    [[0,1,0],[1,1,1]],
    [[1,1,0],[0,1,1]],
    [[0,1,1],[1,1,0]],
    [[1,0,0],[1,1,1]],
    [[0,0,1],[1,1,1]]
];

// ======================
// RESPONSIVE CANVAS
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
    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ======================
// SPAWN
// ======================
function spawnPiece() {
    const i = Math.floor(Math.random() * TETROMINOS.length);
    const shape = TETROMINOS[i];

    return {
        shape,
        color: COLORS[i],
        x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
        y: 0
    };
}

let active = spawnPiece();

// ======================
// COLLISION
// ======================
function collides(piece, dx = 0, dy = 0) {
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

// ======================
// ROTATION
// ======================
function rotateMatrix(m) {
    return m[0].map((_, i) => m.map(r => r[i]).reverse());
}

function rotatePiece() {
    const rotated = rotateMatrix(active.shape);
    const test = { ...active, shape: rotated };
    if (!collides(test)) active.shape = rotated;
}

// ======================
// FIX & DETECT ROWS
// ======================
function fixPiece() {
    active.shape.forEach((row, y) =>
        row.forEach((cell, x) => {
            if (cell) {
                grid[active.y + y][active.x + x] = active.color;
            }
        })
    );

    detectFullRows();

    if (clearingRows.length === 0) {
        active = spawnPiece();
        if (collides(active)) gameOver = true;
    }
}

function detectFullRows() {
    clearingRows = [];

    for (let y = 0; y < ROWS; y++) {
        if (grid[y].every(cell => cell !== 0)) {
            clearingRows.push(y);
        }
    }

    if (clearingRows.length > 0) {
        clearStartTime = performance.now();
    }
}

// ======================
// APPLY ROW CLEAR
// ======================
function applyRowClear(time) {
    if (clearingRows.length === 0) return;

    if (time - clearStartTime >= CLEAR_DELAY) {
        clearingRows.forEach(y => {
            grid.splice(y, 1);
            grid.unshift(Array(COLS).fill(0));
        });

        clearingRows = [];
        active = spawnPiece();
        if (collides(active)) gameOver = true;
    }
}

// ======================
// DRAW
// ======================
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(
        x * BLOCK_SIZE,
        y * BLOCK_SIZE,
        BLOCK_SIZE,
        BLOCK_SIZE
    );
}

function drawGrid() {
    ctx.strokeStyle = "#222";
    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_SIZE, 0);
        ctx.lineTo(x * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_SIZE);
        ctx.lineTo(canvas.width, y * BLOCK_SIZE);
        ctx.stroke();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    // sabit bloklar
    grid.forEach((row, y) =>
        row.forEach((cell, x) => {
            if (!cell) return;

            // animasyon: yanıp sönme
            if (clearingRows.includes(y)) {
                const blink = Math.floor(performance.now() / 80) % 2;
                if (blink === 0) return;
            }

            drawBlock(x, y, cell);
        })
    );

    // aktif parça
    if (!gameOver && clearingRows.length === 0) {
        active.shape.forEach((row, y) =>
            row.forEach((cell, x) => {
                if (cell) drawBlock(active.x + x, active.y + y, active.color);
            })
        );
    }

    if (isPaused) drawPause();
    if (gameOver) drawGameOver();
}

// ======================
// OVERLAYS
// ======================
function drawPause() {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
}

function drawGameOver() {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
}

// ======================
// LOOP
// ======================
let lastTime = 0;

function update(time = 0) {
    if (!isPaused && !gameOver) {
        applyRowClear(time);

        if (clearingRows.length === 0 && time - lastTime > DROP_INTERVAL) {
            if (!collides(active, 0, 1)) {
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

    if (e.key === "ArrowLeft" && !collides(active, -1, 0)) active.x--;
    if (e.key === "ArrowRight" && !collides(active, 1, 0)) active.x++;
    if (e.key === "ArrowDown" && !collides(active, 0, 1)) active.y++;
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
