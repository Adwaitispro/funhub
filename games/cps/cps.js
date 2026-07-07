let duration = 5;
let clicks = 0;
let timer = null;
let running = false;
let endTime = 0;

const clickBox = document.getElementById("clickBox");
const resultBox = document.getElementById("resultBox");
const cpsResult = document.getElementById("cpsResult");
const animalResult = document.getElementById("animalResult");
const nameInput = document.getElementById("nameInput");
const submitBtn = document.getElementById("submitBtn");
const retryBtn = document.getElementById("retryBtn");
const submitStatus = document.getElementById("submitStatus");
const durLabel = document.getElementById("durLabel");

nameInput.value = Leaderboard.getStoredName();

document.getElementById("dur5").onclick = () => { duration = 5; durLabel.textContent = "Selected: 5s"; };
document.getElementById("dur10").onclick = () => { duration = 10; durLabel.textContent = "Selected: 10s"; };

function animalForCps(cps) {
  if (cps < 3) return ["🐢", "Sloth-tier. A garden snail called — it wants tips."];
  if (cps < 5) return ["🦥", "Sloth speed. Respectable nap potential, questionable clicking."];
  if (cps < 7) return ["🐇", "Rabbit energy. Decent hustle."];
  if (cps < 9) return ["🐆", "Cheetah mode. You're actually fast."];
  if (cps < 12) return ["🦅", "Falcon-diving speed. Impressive."];
  return ["👽", "Not human. We are contacting NASA."];
}

function startGame() {
  if (running) return;
  running = true;
  clicks = 1;
  resultBox.style.display = "none";
  clickBox.textContent = `Clicking... ${duration}s left`;
  endTime = Date.now() + duration * 1000;
  timer = setInterval(() => {
    const remaining = Math.max(0, endTime - Date.now());
    clickBox.textContent = `Clicking... ${(remaining / 1000).toFixed(1)}s left`;
    if (remaining <= 0) endGame();
  }, 50);
}

function endGame() {
  clearInterval(timer);
  running = false;
  const cps = (clicks / duration);
  clickBox.textContent = "Click here to start!";
  const [emoji, msg] = animalForCps(cps);
  cpsResult.textContent = `${cps.toFixed(2)} CPS`;
  animalResult.innerHTML = `${emoji} ${msg}`;
  resultBox.style.display = "block";
  resultBox.dataset.score = cps.toFixed(2);
}

clickBox.addEventListener("click", () => {
  if (!running) { startGame(); return; }
  clicks++;
});

retryBtn.addEventListener("click", () => { resultBox.style.display = "none"; });

submitBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim() || "Anonymous Clicker";
  Leaderboard.setStoredName(name);
  submitStatus.textContent = "Submitting...";
  const score = parseFloat(resultBox.dataset.score);
  const { ok, offline } = await Leaderboard.submitScore(`cps${duration}`, name, score);
  submitStatus.textContent = offline
    ? "⚠️ Leaderboard not connected yet (see README)."
    : ok ? "✅ Submitted!" : "❌ Something went wrong.";
  loadBoard();
});

async function loadBoard() {
  await Leaderboard.render(document.getElementById("leaderboard"), `cps${duration}`, { unit: " cps" });
}
loadBoard();
document.getElementById("dur5").addEventListener("click", loadBoard);
document.getElementById("dur10").addEventListener("click", loadBoard);
