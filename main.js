const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ======================
// CONFIG
// ======================
const DEBUG_GRID = true;
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = canvas.width / COLS;

const DROP_INTERVAL = 500;
const CLEAR_DELAY = 300; // satır silme animasyon süresi (ms)

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
// FIX PIECE
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
    }
}

// ======================
// DETECT FULL ROWS (ANIMATION START)
// ======================
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
// APPLY ROW CLEAR (AFTER ANIMATION)
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

function drawFixedBlocks(time) {
    grid.forEach((row, y) =>
        row.forEach((cell, x) => {
            if (!cell) return;

            if (clearingRows.includes(y)) {
                const blink = Math.floor(time / 80) % 2;
                if (blink === 0) return;
            }

            drawBlock(x, y, cell);
        })
    );
}

function drawActivePiece() {
    active.shape.forEach((row, y) =>
        row.forEach((cell, x) => {
            if (cell) {
                drawBlock(active.x + x, active.y + y, active.color);
            }
        })
    );
}

function draw(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (DEBUG_GRID) drawGrid();

    drawFixedBlocks(time);

    if (!gameOver && clearingRows.length === 0) {
        drawActivePiece();
    }
}

// ======================
// LOOP
// ======================
let lastTime = 0;

function update(time = 0) {
    if (!gameOver && !isPaused) {
        applyRowClear(time);

        if (
            clearingRows.length === 0 &&
            time - lastTime > DROP_INTERVAL
        ) {
            if (!collides(active, 0, 1)) {
                active.y++;
            } else {
                fixPiece();
            }
            lastTime = time;
        }
    }

    draw(time);
    requestAnimationFrame(update);
}

// ======================
// CONTROLS
// ======================
document.addEventListener("keydown", e => {
    if (isPaused || gameOver || clearingRows.length > 0) return;

    if (e.key === "ArrowLeft" && !collides(active, -1, 0)) active.x--;
    if (e.key === "ArrowRight" && !collides(active, 1, 0)) active.x++;
    if (e.key === "ArrowDown" && !collides(active, 0, 1)) active.y++;
    if (e.key === "ArrowUp") rotatePiece();
});

// ======================
update();
