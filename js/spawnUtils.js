import { COLS, TETROMINOS, COLORS } from "./config.js";

/* ======================
   7-BAG RANDOMIZER
====================== */

let bag = [];

/**
 * Fisher–Yates shuffle
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Refill and shuffle the bag
 */
function refillBag() {
    bag = TETROMINOS.map((_, i) => i);
    shuffle(bag);
}

/**
 * Spawn next piece using 7-bag system
 */
export function spawnPiece() {
    if (bag.length === 0) {
        refillBag();
    }

    const index = bag.pop();

    const shape = TETROMINOS[index];

    return {
        shape,
        color: COLORS[index],
        x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
        y: 0
    };
}
