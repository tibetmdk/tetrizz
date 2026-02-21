import { drawBlock } from "./drawUtils.js";

let nextPiece = null;

export function initNext(initialPiece) {
    nextPiece = initialPiece;
}

export function getNextPiece() {
    return nextPiece;
}

export function setNextPiece(piece) {
    nextPiece = piece;
}

export function drawNext(ctx, piece, blockSize, canvasSize) {
    if (!piece) return;

    ctx.clearRect(0, 0, canvasSize, canvasSize);
    const shape = piece.shape;
    const rows = shape.length;
    const cols = shape[0].length;

    const offsetX = Math.floor((4 - cols) / 2);
    const offsetY = Math.floor((4 - rows) / 2);

    shape.forEach((row, y) =>
        row.forEach((cell, x) => {
            if (cell) {
                drawBlock(
                    ctx,
                    x + offsetX,
                    y + offsetY,
                    blockSize,
                    piece.color
                );
            }
        })
    );
}
