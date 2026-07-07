const questions = [
  {
    text: "What is 2 + 2?",
    options: ["3", "4", "5", "22"],
    correctIndex: 1,
    rigged: true,
  },
  {
    text: "What is 17 × 23?",
    options: ["391", "412", "377", "403"],
    correctIndex: 0,
  },
  {
    text: "What is the square root of 5,041?",
    options: ["69", "71", "73", "75"],
    correctIndex: 1,
  },
  {
    text: "A train travels at 84 mph for 3.5 hours. How far does it travel?",
    options: ["252 miles", "294 miles", "266 miles", "308 miles"],
    correctIndex: 1,
  },
  {
    text: "What is 7 raised to the power of 4?",
    options: ["2,301", "2,401", "2,197", "2,741"],
    correctIndex: 1,
  },
];

let current = 0;
let score = 0;
let locked = false;

const qCounter = document.getElementById("qCounter");
const qText = document.getElementById("qText");
const options = document.getElementById("options");
const feedback = document.getElementById("feedback");
const quizPanel = document.getElementById("quizPanel");
const resultPanel = document.getElementById("resultPanel");
const finalScore = document.getElementById("finalScore");
const finalMsg = document.getElementById("finalMsg");
const nameInput = document.getElementById("nameInput");
const submitBtn = document.getElementById("submitBtn");
const retryBtn = document.getElementById("retryBtn");
const submitStatus = document.getElementById("submitStatus");

nameInput.value = Leaderboard.getStoredName();

function renderQuestion() {
  locked = false;
  const q = questions[current];
  qCounter.textContent = `Question ${current + 1} of ${questions.length}${current === 0 ? " (looks easy 👀)" : current === 1 ? " (uh oh, it escalates now)" : ""}`;
  qText.textContent = q.text;
  feedback.textContent = "";
  options.innerHTML = q.options
    .map((opt, i) => `<button class="btn btn-purple" data-i="${i}">${opt}</button>`)
    .join("");
  [...options.children].forEach((btn) => {
    btn.addEventListener("click", () => selectAnswer(parseInt(btn.dataset.i, 10)));
  });
}

function selectAnswer(i) {
  if (locked) return;
  locked = true;
  const q = questions[current];
  const isCorrect = i === q.correctIndex;

  if (q.rigged) {
    feedback.innerHTML = `❌ Incorrect! (Yes, even though that was 2+2. The developer failed math class. This is not a bug, it's a personality trait.)`;
  } else if (isCorrect) {
    score++;
    feedback.innerHTML = `✅ Correct! Somehow.`;
  } else {
    feedback.innerHTML = `❌ Wrong. The correct answer was ${q.options[q.correctIndex]}.`;
  }

  setTimeout(() => {
    current++;
    if (current < questions.length) {
      renderQuestion();
    } else {
      showResults();
    }
  }, 1400);
}

function showResults() {
  quizPanel.style.display = "none";
  resultPanel.style.display = "block";
  finalScore.textContent = `${score} / ${questions.length - 1} (real points)`;
  const msgs = [
    "Question 1 doesn't count. It never did. We told you.",
    score === questions.length - 1
      ? "Perfect on the actually-hard questions?! Either you're a genius or you Googled it. We respect both."
      : score >= (questions.length - 1) / 2
      ? "Solid effort against questions that were deliberately unfair."
      : "Rough. But so was question 1, and that wasn't even your fault.",
  ];
  finalMsg.innerHTML = msgs.join("<br>");
}

submitBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim() || "Anonymous Mathlete";
  Leaderboard.setStoredName(name);
  submitStatus.textContent = "Submitting...";
  const { ok, offline } = await Leaderboard.submitScore("mathquiz", name, score);
  submitStatus.textContent = offline
    ? "⚠️ Leaderboard not connected yet (see README)."
    : ok ? "✅ Submitted!" : "❌ Something went wrong.";
  loadBoard();
});

retryBtn.addEventListener("click", () => {
  current = 0;
  score = 0;
  quizPanel.style.display = "block";
  resultPanel.style.display = "none";
  renderQuestion();
});

async function loadBoard() {
  await Leaderboard.render(document.getElementById("leaderboard"), "mathquiz", { unit: " pts" });
}

renderQuestion();
loadBoard();
