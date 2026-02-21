let hoverButton = null; // "resume" | "retry" | null

export function setHoverButton(name) {
    hoverButton = name;
}

export function drawBlock(ctx, x, y, size, color) {
    const px = x * size;
    const py = y * size;
    const s = size;

    ctx.fillStyle = color;
    ctx.fillRect(px, py, s, s);

    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillRect(px, py, s, s * 0.15);
    ctx.fillRect(px, py, s * 0.15, s);

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(px, py + s * 0.85, s, s * 0.15);
    ctx.fillRect(px + s * 0.85, py, s * 0.15, s);

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

function drawButton(ctx, text, x, y, w, h, isHover) {

    ctx.save(); 

    ctx.fillStyle = isHover ? "#ffffff" : "transparent";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;

    ctx.strokeRect(x, y, w, h);
    if (isHover) ctx.fillRect(x, y, w, h);

    ctx.fillStyle = isHover ? "#000000" : "#ffffff";
    ctx.font = "20px Tetrizz";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w / 2, y + h / 2);

    ctx.restore();
}


export function drawPause(ctx, width, height) {

    ctx.save();

    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "white";
    ctx.font = "36px Tetrizz";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("PAUSED", width / 2, height / 3);

    ctx.restore();

    const btnWidth = 200;
    const btnHeight = 55;

    const resumeX = width / 2 - btnWidth / 2;
    const resumeY = height / 2 - 20;

    const retryX = resumeX;
    const retryY = resumeY + 80;

    drawButton(ctx, "RESUME", resumeX, resumeY, btnWidth, btnHeight, hoverButton === "resume");
    drawButton(ctx, "RETRY", retryX, retryY, btnWidth, btnHeight, hoverButton === "retry");
}



export function drawGameOver(ctx, width, height) {

    ctx.save();

    ctx.fillStyle = "rgba(0,0,0,0.9)";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "red";
    ctx.font = "40px Tetrizz";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GAME OVER", width / 2, height / 3);

    ctx.restore();

    const btnWidth = 200;
    const btnHeight = 55;

    const retryX = width / 2 - btnWidth / 2;
    const retryY = height / 2;

    drawButton(ctx, "RETRY", retryX, retryY, btnWidth, btnHeight, hoverButton === "retry");
}

