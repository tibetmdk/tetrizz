// ======================
// CANVAS
// ======================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ======================
// CONFIG
// ======================
const DEBUG_GRID = true;

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = canvas.width / COLS;

// ======================
// GAME GRID (GERÇEK OYUN DURUMU)
// ======================
const grid = Array.from({ length: ROWS }, () =>
    Array(COLS).fill(0)
);

// ======================
// ACTIVE BLOCK (GRID COORDINATES)
// ======================
let active = {
    x: Math.floor(COLS / 2),
    y: 0
};

// ======================
// TIME
// ======================
let lastTime = 0;
const DROP_INTERVAL = 500;

// ======================
// COLLISION — OYUNUN KALBİ
// ======================
function isCellOccupied(x, y) {
    // Sınırlar = DOLU kabul edilir
    if (x < 0 || x >= COLS || y >= ROWS) {
        return true;
    }

    // Grid içi
    return grid[y][x] === 1;
}

// ======================
// DRAW GRID (DEBUG)
// ======================
function drawDebugGrid() {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;

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

// ======================
// DRAW BLOCK
// ======================
function drawBlock(x, y, color = "red") {
    ctx.fillStyle = color;
    ctx.fillRect(
        x * BLOCK_SIZE,
        y * BLOCK_SIZE,
        BLOCK_SIZE,
        BLOCK_SIZE
    );
}

// ======================
// DRAW FIXED BLOCKS
// ======================
function drawFixedBlocks() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (grid[y][x]) {
                drawBlock(x, y, "white");
            }
        }
    }
}

// ======================
// SPAWN NEW BLOCK
// ======================
function spawnBlock() {
    active.x = Math.floor(COLS / 2);
    active.y = 0;
}

// ======================
// FIX ACTIVE BLOCK
// ======================
function fixBlock() {
    grid[active.y][active.x] = 1;
    spawnBlock();
}

// ======================
// UPDATE LOOP
// ======================
function update(time = 0) {
    const delta = time - lastTime;

    if (delta > DROP_INTERVAL) {
        // AŞAĞI İNME DENEMESİ
        if (!isCellOccupied(active.x, active.y + 1)) {
            active.y++;
        } else {
            // ALT DOLU → SABİTLE
            fixBlock();
        }
        lastTime = time;
    }

    // ======================
    // DRAW
    // ======================
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (DEBUG_GRID) {
        drawDebugGrid();
    }

    drawFixedBlocks();
    drawBlock(active.x, active.y);

    requestAnimationFrame(update);
}

// ======================
// CONTROLS
// ======================
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
        if (!isCellOccupied(active.x - 1, active.y)) {
            active.x--;
        }
    }

    if (e.key === "ArrowRight") {
        if (!isCellOccupied(active.x + 1, active.y)) {
            active.x++;
        }
    }

    if (e.key === "ArrowDown") {
        if (!isCellOccupied(active.x, active.y + 1)) {
            active.y++;
        }
    }
});

// ======================
// START
// ======================
update();
