// drawUtils.js

export function drawBlock(ctx, x, y, size, color) {
    const px = x * size;
    const py = y * size;
    const s = size;

    // base
    ctx.fillStyle = color;
    ctx.fillRect(px, py, s, s);

    // highlight (üst + sol)
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillRect(px, py, s, s * 0.15);
    ctx.fillRect(px, py, s * 0.15, s);

    // shadow (alt + sağ)
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(px, py + s * 0.85, s, s * 0.15);
    ctx.fillRect(px + s * 0.85, py, s * 0.15, s);

    // outline
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.strokeRect(px + 0.5, py + 0.5, s - 1, s - 1);
}

export function drawGrid(ctx, cols, rows, size, width, height) {
    ctx.strokeStyle = "#222";

    for (let x = 0; x <= cols; x++) {
        ctx.beginPath();
        ctx.moveTo(x * size, 0);
        ctx.lineTo(x * size, height);
        ctx.stroke();
    }

    for (let y = 0; y <= rows; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * size);
        ctx.lineTo(width, y * size);
        ctx.stroke();
    }
}

export function drawPause(ctx, width, height) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "white";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", width / 2, height / 2);
}

export function drawGameOver(ctx, width, height) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "red";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", width / 2, height / 2);
}
