const paragraphs = [
  "A raccoon once broke into a bakery and left with more dignity than most people leave the gym with. Scientists remain unsure how it unlocked the door, but they suspect bribery involving day old croissants.",
  "The moon does not actually glow on its own, it simply reflects sunlight like a very committed mirror. Despite this, poets have written about it for centuries as if it invented the entire concept of night.",
  "Somewhere in the world right now, someone is arguing about whether a hot dog counts as a sandwich. This argument has never once been resolved and probably never will be, and that is somehow fine.",
  "Octopuses have three hearts and blue blood, which honestly explains why they always seem slightly better at life than the rest of us. They can also taste with their arms, which is deeply unfair.",
  "A group of flamingos is called a flamboyance, which might be the single most accurate animal group name in existence. Nobody asked for this fact but everyone deserves to know it anyway.",
  "The average cloud weighs over a million pounds yet floats effortlessly above your head every single day. Meanwhile some people struggle to get off the couch, which really puts things into perspective.",
  "Bananas are naturally slightly radioactive due to their potassium content, though you would need to eat an unreasonable number of them before it mattered even slightly. Please do not test this at home.",
  "There is a species of jellyfish that is technically immortal, cycling back to its youngest form instead of dying. Somewhere, that jellyfish is not paying rent, not aging, and honestly living its best life.",
  "In ancient Rome, spilled wine was considered an offering to the gods rather than a clumsy mistake. Modern humans have sadly lost this excuse and must now simply apologize to the carpet.",
  "A single bolt of lightning contains enough energy to toast about one hundred thousand slices of bread, assuming you could somehow aim it at a toaster, which nobody has legally attempted yet.",
];

let currentText = "";
let startTime = null;
let finished = false;

const promptText = document.getElementById("promptText");
const typeArea = document.getElementById("typeArea");
const liveStats = document.getElementById("liveStats");
const resultBox = document.getElementById("resultBox");
const wpmResult = document.getElementById("wpmResult");
const accResult = document.getElementById("accResult");
const nameInput = document.getElementById("nameInput");
const submitBtn = document.getElementById("submitBtn");
const retryBtn = document.getElementById("retryBtn");
const submitStatus = document.getElementById("submitStatus");

nameInput.value = Leaderboard.getStoredName();

function pickParagraph() {
  currentText = paragraphs[Math.floor(Math.random() * paragraphs.length)];
  promptText.textContent = currentText;
  typeArea.value = "";
  startTime = null;
  finished = false;
  resultBox.style.display = "none";
  liveStats.textContent = "0 WPM · 100% accuracy";
  typeArea.disabled = false;
  typeArea.focus();
}

function accuracy(typed, target) {
  let correct = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === target[i]) correct++;
  }
  return typed.length === 0 ? 100 : Math.round((correct / typed.length) * 100);
}

typeArea.addEventListener("input", () => {
  if (finished) return;
  if (!startTime) startTime = Date.now();

  const typed = typeArea.value;
  const acc = accuracy(typed, currentText);
  const elapsedMin = Math.max((Date.now() - startTime) / 60000, 1 / 60000);
  const wordsTyped = typed.trim().split(/\s+/).length;
  const wpm = Math.round(wordsTyped / elapsedMin);
  liveStats.textContent = `${wpm} WPM · ${acc}% accuracy`;

  if (typed.length >= currentText.length) {
    finished = true;
    typeArea.disabled = true;
    const finalElapsedMin = (Date.now() - startTime) / 60000;
    const finalWpm = Math.round((currentText.split(/\s+/).length) / finalElapsedMin);
    const finalAcc = accuracy(typed, currentText);
    wpmResult.textContent = `${finalWpm} WPM`;
    accResult.textContent = `${finalAcc}% accuracy — ${finalAcc === 100 ? "flawless. suspicious, even." : finalAcc > 90 ? "pretty clean." : "chaotic, but you finished."}`;
    resultBox.style.display = "block";
    resultBox.dataset.score = finalWpm;
  }
});

document.getElementById("newPara").addEventListener("click", pickParagraph);
retryBtn.addEventListener("click", pickParagraph);

submitBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim() || "Anonymous Typist";
  Leaderboard.setStoredName(name);
  submitStatus.textContent = "Submitting...";
  const score = parseInt(resultBox.dataset.score, 10);
  const { ok, offline } = await Leaderboard.submitScore("typing", name, score);
  submitStatus.textContent = offline
    ? "⚠️ Leaderboard not connected yet (see README)."
    : ok ? "✅ Submitted!" : "❌ Something went wrong.";
  loadBoard();
});

async function loadBoard() {
  await Leaderboard.render(document.getElementById("leaderboard"), "typing", { unit: " wpm" });
}

pickParagraph();
loadBoard();
