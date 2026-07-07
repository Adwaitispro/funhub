const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const loadingLines = [
  "📡 Collecting live CODES from NASA...",
  "🍎 Consulting Newton's Third Law of Weekdays...",
  "🧦 Washing socks for accuracy purposes...",
  "🍝 Pausing briefly to eat dinner...",
  "🔮 Cross-referencing the ancient calendar scrolls...",
  "🧠 Asking a very confident goldfish...",
];

const calcBtn = document.getElementById("calcBtn");
const todaySelect = document.getElementById("todaySelect");
const loadingBox = document.getElementById("loadingBox");
const loadingLine = document.getElementById("loadingLine");
const resultBox = document.getElementById("resultBox");
const tomorrowResult = document.getElementById("tomorrowResult");
const againBtn = document.getElementById("againBtn");

calcBtn.addEventListener("click", () => {
  calcBtn.disabled = true;
  resultBox.style.display = "none";
  loadingBox.style.display = "block";

  const shuffled = [...loadingLines].sort(() => Math.random() - 0.5);
  let step = 0;
  loadingLine.textContent = shuffled[0];
  const interval = setInterval(() => {
    step++;
    if (step < shuffled.length) {
      loadingLine.textContent = shuffled[step];
    }
  }, 800);

  setTimeout(() => {
    clearInterval(interval);
    loadingBox.style.display = "none";
    const todayIndex = parseInt(todaySelect.value, 10);
    const tomorrowIndex = (todayIndex + 1) % 7;
    tomorrowResult.textContent = `Tomorrow is ${days[tomorrowIndex]}! 🎉`;
    resultBox.style.display = "block";
    calcBtn.disabled = false;
  }, 5000);
});

againBtn.addEventListener("click", () => {
  resultBox.style.display = "none";
});
