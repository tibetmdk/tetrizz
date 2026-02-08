// timerUtils.js

let startTime = 0;
let elapsedTime = 0;
let running = false;
let timerEl = null;

/* ======================
   INIT
====================== */
export function initTimer(elementId) {
    timerEl = document.getElementById(elementId);
    resetTimer();
}

/* ======================
   CONTROL
====================== */
export function startTimer() {
    if (running) return;
    startTime = performance.now();
    running = true;
}

export function pauseTimer() {
    if (!running) return;
    elapsedTime += performance.now() - startTime;
    running = false;
}

export function resetTimer() {
    startTime = 0;
    elapsedTime = 0;
    running = false;
    updateDisplay(0);
}

/* ======================
   UPDATE
====================== */
export function updateTimer() {
    if (!timerEl) return;

    const current = running
        ? elapsedTime + (performance.now() - startTime)
        : elapsedTime;

    updateDisplay(current);
}

/* ======================
   FORMAT
====================== */
function updateDisplay(ms) {
    if (!timerEl) return;

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    timerEl.textContent =
        `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
}
