// scoreUtils.js

let score = 0;
let level = 1;
let lines = 0;

let scoreEl = null;
let levelEl = null;

export function initScore(scoreId, levelId) {
    scoreEl = document.getElementById(scoreId);
    levelEl = document.getElementById(levelId);
    updateUI();
}

export function addScore(clearedLines) {
    if (clearedLines <= 0) return;

    const table = [0, 40, 100, 300, 1200];
    score += table[clearedLines] * level;

    lines += clearedLines;

    const newLevel = Math.floor(lines / 10) + 1;
    if (newLevel !== level) {
        level = newLevel;
    }

    updateUI();
}

export function getLevel() {
    return level;
}

export function resetScore() {
    score = 0;
    level = 1;
    lines = 0;
    updateUI();
}

function updateUI() {
    if (scoreEl) scoreEl.textContent = `score: ${score}`;
    if (levelEl) levelEl.textContent = `level: ${level}`;
}
