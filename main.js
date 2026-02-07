const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ======================
// CONFIG
// ======================
const DEBUG_GRID = true;
const COLS = 10;
const ROWS = 20;

let BLOCK_SIZE = 0;

const DROP_INTERVAL = 500;
const CLEAR_DELAY = 300;

// ======================
// GAME STATE
// ======================
let gameOver = false;
let isPaused = false;

// ======================
// ROW CLEAR STATE
// ======================
let clearingRows = [];
let clearStartTime = 0;

// ======================
// BUTTONS (RESPONSIVE)
// ======================
const pauseButtons = {
    resume: {},
    retry: {}
};

const gameOverButtons = {
    retry: {}
};

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
// GRID
// ======================
const grid = Array.from({ length: ROWS }, () =>
    Array(COLS).fill(0)
);

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
    const maxHeight = window.innerHeight - 160;

    let width = container.clientWidth;
    let height = width * 2;

    if (height > maxHeight) {
        height = maxHeight;
        width = height / 2;
    }

    canvas.width = Math.floor(width);
    canvas.height = Math.floor(height);

    BLOCK_SIZE = canvas.width / COLS;

    // Button positions (relative)
    const cx = canvas.width / 2;

    pauseButtons.resume = {
        x: cx - 60,
        y: canvas.height / 2 + 10,
        width: 120,
        height: 40,
        text: "RESUME"
    };

    pauseButtons.retry = {
        x: cx - 60,
        y: canvas.height / 2 + 60,
        width: 120,
        height: 40,
        text: "RETRY"
    };

    gameOverButtons.retry = {
        x: cx - 60,
        y: canvas.height / 2 + 40,
        width: 120,
        height: 40,
        text: "RETRY"
    };
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ======================
// SPAWN PIECE
// ======================
function spawnPiece() {
    const i = Math.floor(Math.random() * TETROMINOS.length);
    const piece = {
        shape: TETROMINOS[i],
        color: COLORS[i],
        x: Math.floor(COLS / 2) - Math.floor(TETROMINOS[i][0].length / 2),
        y: 0
    };

    if (collides(piece, 0, 0)) {
        gameOver = true;
    }

    return piece;
}

let active = spawnPiece();

// ======================
// COLLISION
// ======================
function isCellOccupied(x, y) {
    if (x < 0 || x >= COLS || y >= ROWS) return true;
    return grid[y][x] !== 0;
}

function collides(piece, dx = 0, dy = 0) {
    return piece.shape.some((row, y) =>
        row.some((cell, x) => {
            if (!cell) return false;
            return isCellOccupied(
                piece.x + x + dx,
                piece.y + y + dy
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
    if (!collides(test, 0, 0)) {
        active.shape = rotated;
    }
}

// ======================
// FIX & CLEAR
// ======================
function fixPiece() {
    active.shape.forEach((row, y) =>
        row.forEach((cell, x) => {
            if (cell) grid[active.y + y][active.x + x] = active.color;
        })
    );

    detectFullRows();
    if (clearingRows.length === 0) active = spawnPiece();
}

function detectFullRows() {
    clearingRows = [];

    for (let y = 0; y < ROWS; y++) {
        if (grid[y].every(c => c !== 0)) clearingRows.push(y);
    }

    if (clearingRows.length > 0) {
        clearStartTime = performance.now();
    }
}

function applyRowClear(time) {
    if (clearingRows.length === 0) return;

    if (time - clearStartTime >= CLEAR_DELAY) {
        clearingRows.forEach(y => {
            grid.splice(y, 1);
            grid.unshift(Array(COLS).fill(0));
        });
        clearingRows = [];
        active = spawnPiece();
    }
}

// ======================
// DRAW
// ======================
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawGrid() {
    ctx.strokeStyle = "#333";
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

function drawButton(btn, color) {
    ctx.fillStyle = color;
    ctx.fillRect(btn.x, btn.y, btn.width, btn.height);

    ctx.fillStyle = "black";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2);
}

function drawPause() {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2 - 40);

    drawButton(pauseButtons.resume, "#00ff00");
    drawButton(pauseButtons.retry, "#ffcc00");
}

function drawGameOver() {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";
    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);

    drawButton(gameOverButtons.retry, "#ffcc00");
}

function draw(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (DEBUG_GRID) drawGrid();

    grid.forEach((row, y) =>
        row.forEach((cell, x) => {
            if (cell) drawBlock(x, y, cell);
        })
    );

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
// LOOP
// ======================
let lastTime = 0;

function update(time = 0) {
    if (!gameOver && !isPaused) {
        applyRowClear(time);

        if (clearingRows.length === 0 && time - lastTime > DROP_INTERVAL) {
            if (!collides(active, 0, 1)) active.y++;
            else fixPiece();
            lastTime = time;
        }
    }

    draw(time);
    requestAnimationFrame(update);
}

// ======================
// INPUT
// ======================
document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !gameOver) {
        isPaused = !isPaused;
        return;
    }

    if (isPaused || gameOver) return;

    if (e.key === "ArrowLeft" && !collides(active, -1, 0)) active.x--;
    if (e.key === "ArrowRight" && !collides(active, 1, 0)) active.x++;
    if (e.key === "ArrowDown" && !collides(active, 0, 1)) active.y++;
    if (e.key === "ArrowUp") rotatePiece();
});

canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    if (isPaused) {
        if (isInside(mx, my, pauseButtons.resume)) isPaused = false;
        if (isInside(mx, my, pauseButtons.retry)) resetGame();
    }

    if (gameOver) {
        if (isInside(mx, my, gameOverButtons.retry)) resetGame();
    }
});

function isInside(x, y, btn) {
    return (
        x >= btn.x &&
        x <= btn.x + btn.width &&
        y >= btn.y &&
        y <= btn.y + btn.height
    );
}

function resetGame() {
    for (let y = 0; y < ROWS; y++) grid[y].fill(0);
    gameOver = false;
    isPaused = false;
    clearingRows = [];
    lastTime = 0;
    active = spawnPiece();
}

update();
