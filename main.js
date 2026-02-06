const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const DEBUG_GRID = true;

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = canvas.width / COLS;

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
// GRID (0 = boş, color = dolu)
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
    const shape = TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    return {
        shape,
        color,
        x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
        y: 0
    };
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
    clearFullRows();
    active = spawnPiece();
}

// ======================
// CLEAR ROWS
// ======================
function clearFullRows() {
    for (let y = ROWS - 1; y >= 0; y--) {
        if (grid[y].every(cell => cell !== 0)) {
            grid.splice(y, 1);
            grid.unshift(Array(COLS).fill(0));
            y++;
        }
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

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (DEBUG_GRID) drawGrid();

    // fixed blocks
    grid.forEach((row, y) =>
        row.forEach((cell, x) => {
            if (cell) drawBlock(x, y, cell);
        })
    );

    // active piece
    active.shape.forEach((row, y) =>
        row.forEach((cell, x) => {
            if (cell) drawBlock(active.x + x, active.y + y, active.color);
        })
    );
}

// ======================
// LOOP
// ======================
let lastTime = 0;
const DROP_INTERVAL = 500;

function update(time = 0) {
    if (time - lastTime > DROP_INTERVAL) {
        if (!collides(active, 0, 1)) {
            active.y++;
        } else {
            fixPiece();
        }
        lastTime = time;
    }

    draw();
    requestAnimationFrame(update);
}

// ======================
// CONTROLS
// ======================
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" && !collides(active, -1, 0)) active.x--;
    if (e.key === "ArrowRight" && !collides(active, 1, 0)) active.x++;
    if (e.key === "ArrowDown" && !collides(active, 0, 1)) active.y++;
});

// ======================
update();
