// scoreUtils.js

let score = 0;
let level = 1;
let lines = 0;

let scoreEl = null;
let levelEl = null;

const STORAGE_KEY = "tetrizz_scores";
const MAX_SCORES = 6;

/* ======================
   INIT
====================== */
export function initScore(scoreId, levelId) {
    scoreEl = document.getElementById(scoreId);
    levelEl = document.getElementById(levelId);

    renderScoreBoard();
    updateUI();
}

/* ======================
   SCORE ADD
====================== */
export function addScore(clearedLines = 0) {
    // SATIR PATLAMA PUANI
    if (clearedLines > 0) {
        const table = [0, 40, 100, 300, 1200];
        score += table[clearedLines] * level;
        lines += clearedLines;
    }

    // LEVEL HESABI
    const newLevel = Math.floor(lines / 10) + 1;
    if (newLevel !== level) level = newLevel;

    updateUI();
}

/* ======================
   DROP SCORE (+1)
====================== */
export function addDropScore() {
    score += 1;
    updateUI();
}

/* ======================
   LEVEL
====================== */
export function getLevel() {
    return level;
}

/* ======================
   GAME OVER → SAVE
====================== */
export function saveScore() {
    const scores = loadScores();
    scores.push(score);

    scores.sort((a, b) => b - a);
    const trimmed = scores.slice(0, MAX_SCORES);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    renderScoreBoard();
}

/* ======================
   RESET
====================== */
export function resetScore() {
    score = 0;
    level = 1;
    lines = 0;
    updateUI();
}

/* ======================
   STORAGE
====================== */
function loadScores() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return Array(MAX_SCORES).fill(0);

    try {
        const parsed = JSON.parse(raw);
        return parsed.length ? parsed : Array(MAX_SCORES).fill(0);
    } catch {
        return Array(MAX_SCORES).fill(0);
    }
}

/* ======================
   UI
====================== */
function updateUI() {
    if (scoreEl) scoreEl.textContent = `score: ${score}`;
    if (levelEl) levelEl.textContent = `level: ${level}`;
}

function renderScoreBoard() {
    const scores = loadScores();

    const boxes = document.querySelectorAll(".score_box");
    const best = document.querySelector(".best_score");

    best.textContent = `Best Score : ${String(scores[0]).padStart(5, "0")}`;

    boxes.forEach((box, i) => {
        const value = scores[i + 1] ?? 0;
        box.textContent = `${i + 2}. ${String(value).padStart(5, "0")}`;
    });
}
