const box = document.getElementById("box");
const resultBox = document.getElementById("resultBox");
const timeResult = document.getElementById("timeResult");
const compareResult = document.getElementById("compareResult");
const nameInput = document.getElementById("nameInput");
const submitBtn = document.getElementById("submitBtn");
const retryBtn = document.getElementById("retryBtn");
const submitStatus = document.getElementById("submitStatus");

nameInput.value = Leaderboard.getStoredName();

let state = "idle";
let timeoutId = null;
let startTime = 0;

function setBox(bg, text) {
  box.style.background = bg;
  box.textContent = text;
}

function compareMs(ms) {
  if (ms < 180) return ["👽", "Not humanly possible. We are contacting NASA about you specifically."];
  if (ms < 220) return ["🏎️", "F1 driver reaction time. Absurd."];
  if (ms < 280) return ["🦅", "Falcon-tier reflexes."];
  if (ms < 350) return ["🐇", "Solid, quick rabbit energy."];
  if (ms < 450) return ["🙂", "Perfectly average human."];
  if (ms < 600) return ["🦥", "Sloth is currently outpacing you."];
  return ["🪨", "A rock has faster reflexes. We checked."];
}

box.addEventListener("click", () => {
  if (state === "idle" || state === "done") {
    state = "waiting";
    resultBox.style.display = "none";
    setBox("var(--pink)", "Wait for green...");
    const delay = 1200 + Math.random() * 2500;
    timeoutId = setTimeout(() => {
      state = "ready";
      startTime = Date.now();
      setBox("var(--mint)", "CLICK NOW!");
    }, delay);
  } else if (state === "waiting") {
    clearTimeout(timeoutId);
    state = "idle";
    setBox("var(--ink-3)", "Too soon! Clicked before green. Click to try again.");
  } else if (state === "ready") {
    const reaction = Date.now() - startTime;
    state = "done";
    setBox("var(--ink-3)", "Click to try again");
    const [emoji, msg] = compareMs(reaction);
    timeResult.textContent = `${reaction} ms`;
    compareResult.innerHTML = `${emoji} ${msg}`;
    resultBox.style.display = "block";
    resultBox.dataset.score = reaction;
  }
});

retryBtn.addEventListener("click", () => { resultBox.style.display = "none"; });

submitBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim() || "Anonymous Reflex";
  Leaderboard.setStoredName(name);
  submitStatus.textContent = "Submitting...";
  const score = parseInt(resultBox.dataset.score, 10);
  const { ok, offline } = await Leaderboard.submitScore("reaction", name, score);
  submitStatus.textContent = offline
    ? "⚠️ Leaderboard not connected yet (see README)."
    : ok ? "✅ Submitted!" : "❌ Something went wrong.";
  loadBoard();
});

async function loadBoard() {
  await Leaderboard.render(document.getElementById("leaderboard"), "reaction", { unit: " ms", ascending: true });
}
loadBoard();
