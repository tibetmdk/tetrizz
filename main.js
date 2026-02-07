const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ======================
// CONFIG
// ======================
const COLS = 10;
const ROWS = 20;
const DROP_INTERVAL = 500;

let BLOCK_SIZE = 0;

// ======================
// GAME STATE
// ======================
let gameOver = false;

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
// RESPONSIVE CANVAS (ASLA SATIR KAYBETMEZ)
// ======================
function resizeCanvas() {
    const container = document.querySelector(".game-container");
    const maxHeight = window.innerHeight - 40;

    let block = Math.floor(container.clientWidth / COLS);
    let totalHeight = block * ROWS;

    if (totalHeight > maxHeight) {
        block = Math.floor(maxHeight / ROWS);
        totalHeight = block * ROWS;
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
    return {
        shape: TETROMINOS[i],
        color: COLORS[i],
        x: Math.floor(COLS / 2) - 1,
        y: 0
    };
}

let active = spawnPiece();

// ======================
// COLLISION
// ======================
function collides(piece, dx, dy) {
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
    active = spawnPiece();
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

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    grid.forEach((row, y) =>
        row.forEach((cell, x) => {
            if (cell) drawBlock(x, y, cell);
        })
    );

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

function update(time = 0) {
    if (!gameOver && time - lastTime > DROP_INTERVAL) {
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

update();
