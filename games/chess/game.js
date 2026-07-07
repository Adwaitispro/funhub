const game = new Chess();
const boardEl = document.getElementById("board");
const statusLine = document.getElementById("statusLine");
const modeLabel = document.getElementById("modeLabel");
const aiSpeech = document.getElementById("aiSpeech");
const aiSpeechText = document.getElementById("aiSpeechText");
const ruleBanner = document.getElementById("ruleBanner");
const endPanel = document.getElementById("endPanel");
const endResult = document.getElementById("endResult");
const nameInput = document.getElementById("nameInput");
const submitBtn = document.getElementById("submitBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const submitStatus = document.getElementById("submitStatus");

nameInput.value = Leaderboard.getStoredName();

const PLAYER = "w";
const AI = "b";
const PIECE_UNICODE = {
  w: { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕", k: "♔" },
  b: { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" },
};
const VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

const TAUNTS = [
  "oh you moved a piece? groundbreaking. 🥱",
  "MY GAME MY RULE, remember that. 😤",
  "I'm not losing, I'm exploring the board. 🗺️",
  "checkmate in 10 moves. maybe. we'll see. 👀",
  "is that... a strategy? cute. 🥲",
  "I put my rook there on purpose. probably. 🤔",
  "you should see the other 63 squares I considered. 😎",
  "this is chess, not checkers, but nice try. ♟️",
  "I'm playing 4D chess. you're playing 2D worry. 🧠",
  "relax, I know exactly what I'm doing. (I don't) 🤪",
];

let mode = null;
let selectedSquare = null;
let legalTargets = [];
let gameOver = false;
let aiMoveCount = 0;
let playerMoveCount = 0;

document.querySelectorAll("[data-mode]").forEach((btn) => {
  btn.addEventListener("click", () => startGame(btn.dataset.mode));
});
document.getElementById("resetBtn").addEventListener("click", () => startGame(mode || "easy"));

function startGame(m) {
  mode = m;
  game.reset();
  selectedSquare = null;
  legalTargets = [];
  gameOver = false;
  aiMoveCount = 0;
  playerMoveCount = 0;
  endPanel.style.display = "none";
  ruleBanner.style.display = "none";
  aiSpeech.style.display = mode === "dumb" ? "block" : "none";
  aiSpeechText.textContent = mode === "dumb" ? "let's go. I'm not scared of you. 😏" : "";
  const labels = { easy: "😌 Easy", medium: "🙂 Medium", hard: "😬 Hard", dumb: "🤪 DUMB AH MODE" };
  modeLabel.textContent = `Mode: ${labels[m]} — you're playing White. Good luck.`;
  statusLine.textContent = "Your move.";
  render();
}

function render() {
  boardEl.innerHTML = "";
  const boardArr = game.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const file = String.fromCharCode(97 + col);
      const rank = 8 - row;
      const square = `${file}${rank}`;
      const div = document.createElement("div");
      div.className = `sq ${(row + col) % 2 === 0 ? "light" : "dark"}`;
      div.dataset.square = square;

      const piece = boardArr[row][col];
      if (piece) {
        div.textContent = PIECE_UNICODE[piece.color][piece.type];
        div.classList.add(piece.color === "w" ? "piece-white" : "piece-black");
      }
      if (square === selectedSquare) div.classList.add("selected");
      const legal = legalTargets.find((t) => t.to === square);
      if (legal) {
        div.classList.add("legal");
        if (legal.captured) div.classList.add("capture");
      }
      div.addEventListener("click", () => onSquareClick(square));
      boardEl.appendChild(div);
    }
  }
}

function onSquareClick(square) {
  if (!mode || gameOver || game.turn() !== PLAYER) return;

  if (selectedSquare === square) {
    selectedSquare = null;
    legalTargets = [];
    render();
    return;
  }

  const isLegalTarget = legalTargets.some((t) => t.to === square);
  if (selectedSquare && isLegalTarget) {
    game.move({ from: selectedSquare, to: square, promotion: "q" });
    playerMoveCount++;
    selectedSquare = null;
    legalTargets = [];
    render();
    handleAfterPlayerMove();
    return;
  }

  const piece = game.get(square);
  if (piece && piece.color === PLAYER) {
    selectedSquare = square;
    legalTargets = game.moves({ square, verbose: true });
    render();
  } else {
    selectedSquare = null;
    legalTargets = [];
    render();
  }
}

function handleAfterPlayerMove() {
  if (mode === "dumb") {
    if (game.in_check() && game.turn() === AI) {
      const checkers = findCheckers();
      if (checkers.length > 0) {
        checkers.forEach((c) => game.remove(c.square));
        ruleBanner.style.display = "block";
        setTimeout(() => { ruleBanner.style.display = "none"; }, 2200);
        render();
      }
    }
  }

  if (checkGameOver()) return;

  statusLine.textContent = "AI is thinking...";
  setTimeout(aiMove, 500);
}

function findCheckers() {
  const checkers = [];
  const boardArr = game.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = boardArr[row][col];
      if (piece && piece.color === PLAYER) {
        const file = String.fromCharCode(97 + col);
        const rank = 8 - row;
        const square = `${file}${rank}`;
        const removed = game.remove(square);
        const stillInCheck = game.in_check();
        game.put(removed, square);
        if (!stillInCheck) checkers.push({ square, piece: removed });
      }
    }
  }
  return checkers;
}

function evaluateBoard(g) {
  let total = 0;
  const boardArr = g.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = boardArr[row][col];
      if (piece) total += piece.color === "w" ? VALUES[piece.type] : -VALUES[piece.type];
    }
  }
  return total;
}

function minimax(g, depth, alpha, beta, maximizing) {
  if (depth === 0 || g.game_over()) return evaluateBoard(g);
  const moves = g.moves();
  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      g.move(m);
      best = Math.max(best, minimax(g, depth - 1, alpha, beta, false));
      g.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      g.move(m);
      best = Math.min(best, minimax(g, depth - 1, alpha, beta, true));
      g.undo();
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function aiMove() {
  if (gameOver) return;
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) { checkGameOver(); return; }

  let chosen;

  if (mode === "easy") {
    chosen = moves[Math.floor(Math.random() * moves.length)];
  } else if (mode === "medium") {
    const scored = moves.map((m) => {
      game.move(m);
      const val = evaluateBoard(game);
      game.undo();
      return { m, val };
    });
    scored.sort((a, b) => a.val - b.val);
    const poolSize = Math.min(3, scored.length);
    chosen = scored[Math.floor(Math.random() * poolSize)].m;
  } else if (mode === "hard") {
    let bestVal = Infinity;
    let bestMoves = [];
    for (const m of moves) {
      game.move(m);
      const val = minimax(game, 2, -Infinity, Infinity, true);
      game.undo();
      if (val < bestVal) { bestVal = val; bestMoves = [m]; }
      else if (val === bestVal) bestMoves.push(m);
    }
    chosen = bestMoves[Math.floor(Math.random() * bestMoves.length)];
  } else if (mode === "dumb") {
    const checkMoves = moves.filter((m) => {
      game.move(m);
      const gives = game.in_check() && game.turn() === PLAYER;
      game.undo();
      return gives;
    });
    const pool = checkMoves.length > 0 ? checkMoves : moves;
    chosen = pool[Math.floor(Math.random() * pool.length)];
  }

  game.move(chosen);
  aiMoveCount++;

  if (mode === "dumb") {
    aiSpeech.style.display = "block";
    aiSpeechText.textContent = TAUNTS[Math.floor(Math.random() * TAUNTS.length)];
  }

  render();
  checkGameOver();
  if (!gameOver) statusLine.textContent = "Your move.";
}

function checkGameOver() {
  if (game.in_checkmate()) {
    gameOver = true;
    const playerWon = game.turn() === AI;
    endResult.textContent = playerWon ? "🎉 You won! Checkmate!" : "💀 AI wins. Checkmate.";
    endPanel.style.display = "block";
    submitBtn.style.display = playerWon ? "inline-block" : "none";
    statusLine.textContent = "Game over.";
    return true;
  }
  if (game.in_draw() || game.in_stalemate() || game.insufficient_material() || game.in_threefold_repetition()) {
    gameOver = true;
    endResult.textContent = "🤝 It's a draw.";
    endPanel.style.display = "block";
    submitBtn.style.display = "none";
    statusLine.textContent = "Game over.";
    return true;
  }
  return false;
}

submitBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim() || "Anonymous Grandmaster";
  Leaderboard.setStoredName(name);
  submitStatus.textContent = "Submitting...";
  const { ok, offline } = await Leaderboard.submitScore(`chess_${mode}`, name, playerMoveCount);
  submitStatus.textContent = offline
    ? "⚠️ Leaderboard not connected yet (see README)."
    : ok ? "✅ Win submitted!" : "❌ Something went wrong.";
  loadBoard(mode);
});

playAgainBtn.addEventListener("click", () => startGame(mode));

document.querySelectorAll("[data-board]").forEach((btn) => {
  btn.addEventListener("click", () => loadBoard(btn.dataset.board));
});

async function loadBoard(m) {
  await Leaderboard.render(document.getElementById("leaderboard"), `chess_${m || "easy"}`, {
    unit: " moves",
    ascending: true,
  });
}
loadBoard("easy");
