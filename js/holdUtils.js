// holdUtils.js
import { drawNext } from "./nextUtils.js";
import { COLS } from "./config.js";

let holdPiece = null;
let canHold = true;

/* ======================
   INIT
====================== */
export function initHold() {
    holdPiece = null;
    canHold = true;
}

/* ======================
   HOLD ACTION
====================== */
export function holdCurrentPiece(active, getNextPiece, setNextPiece, spawnPiece) {
    if (!canHold) return { active, changed: false };

    let newActive;

    if (!holdPiece) {
        holdPiece = active;
        newActive = getNextPiece();
        setNextPiece(spawnPiece());
    } else {
        newActive = holdPiece;
        holdPiece = active;
    }

    // yeni aktif parçayı resetle
    newActive.x = Math.floor(COLS / 2) - Math.floor(newActive.shape[0].length / 2);
    newActive.y = 0;

    canHold = false;

    return {
        active: newActive,
        changed: true
    };
}

/* ======================
   RESET HOLD PER TURN
====================== */
export function enableHold() {
    canHold = true;
}

/* ======================
   DRAW
====================== */
export function drawHold(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!holdPiece) return;

    drawNext(
        ctx,
        holdPiece,
        Math.floor(canvas.width / 4),
        canvas.width
    );
}
