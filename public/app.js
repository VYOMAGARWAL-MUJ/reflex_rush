const ROUND_SECONDS = 30;
const POINTS_PER_HIT = 10;
const $ = (id) => document.getElementById(id);

let playerName = localStorage.getItem("reflexRushName") || "";
// Persistent browser/device identifier lets the API update this device's existing leaderboard row.
let deviceId = localStorage.getItem("reflexRushDeviceId");
if (!deviceId) {
  deviceId = (crypto.randomUUID ? crypto.randomUUID() : `rr-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  localStorage.setItem("reflexRushDeviceId", deviceId);
}
let score = 0;
let timeLeft = ROUND_SECONDS;
let active = false;
let roundEnded = false;
let countdownId = null;
let roundDeadline = 0;
let bestScore = Number(localStorage.getItem("reflexRushBest") || 0);
let toastId = null;
let allScoresVisible = false;
let leaderboardScores = [];

const target = $("target");
const arena = $("arena");
const arenaMessage = $("arenaMessage");

function updateStats() {
  $("score").textContent = String(score).padStart(3, "0");
  $("timer").innerHTML = `${timeLeft}<span>s</span>`;
  $("bestScore").textContent = String(bestScore).padStart(3, "0");
}

function setPlayerName(name) {
  playerName = name.trim().slice(0, 18);
  localStorage.setItem("reflexRushName", playerName);
  $("playerDisplay").textContent = playerName || "Guest player";
}

function showToast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(toastId);
  toastId = setTimeout(() => $("toast").classList.remove("show"), 2400);
}

function placeTarget() {
  const padding = 12;
  const size = 48;
  const maxX = Math.max(padding, arena.clientWidth - size - padding);
  const maxY = Math.max(padding, arena.clientHeight - size - padding);
  target.style.left = `${padding + Math.random() * (maxX - padding)}px`;
  target.style.top = `${padding + Math.random() * (maxY - padding)}px`;
  target.style.transform = `rotate(${Math.floor(Math.random() * 360)}deg)`;
}

function startGame() {
  if (active) return;
  if (!playerName) {
    $("nameDialog").showModal();
    $("playerName").focus();
    return;
  }

  // Always clear the previous round's timer before starting a new round.
  if (countdownId !== null) {
    clearInterval(countdownId);
    countdownId = null;
  }

  score = 0;
  timeLeft = ROUND_SECONDS;
  roundDeadline = Date.now() + ROUND_SECONDS * 1000;
  active = true;
  roundEnded = false;
  updateStats();
  arenaMessage.classList.add("hidden");
  target.classList.remove("hidden");
  $("roundStatus").textContent = "ROUND IN PROGRESS";
  $("startBtn").textContent = "Playing…";
  placeTarget();

  // Calculate from a deadline so the timer stays accurate and reliably restarts.
  countdownId = setInterval(() => {
    if (!active) return;
    timeLeft = Math.max(0, Math.ceil((roundDeadline - Date.now()) / 1000));
    updateStats();
    if (timeLeft <= 0) endGame();
  }, 100);
}

function hitTarget() {
  if (!active) return;
  score += POINTS_PER_HIT;
  updateStats();
  placeTarget();
  target.animate(
    [{ transform: "scale(.75)", opacity: .7 }, { transform: "scale(1)", opacity: 1 }],
    { duration: 110, easing: "ease-out" }
  );
}

async function endGame() {
  if (roundEnded) return;
  active = false;
  roundEnded = true;
  if (countdownId !== null) {
    clearInterval(countdownId);
    countdownId = null;
  }
  timeLeft = 0;
  updateStats();
  $("startBtn").textContent = "Play again";
  target.classList.add("hidden");
  arenaMessage.classList.remove("hidden");
  $("roundStatus").textContent = "ROUND COMPLETE";
  arenaMessage.innerHTML = `
    <div class="target-preview">✓</div>
    <h2>Nice run, ${escapeHtml(playerName)}!</h2>
    <p>You scored <strong style="color:#67e8f9">${score} points</strong>. Ready to beat it?</p>
    <button class="primary-button" id="playAgainBtn" type="button">Play again <span>→</span></button>
  `;
  $("playAgainBtn").addEventListener("click", startGame);
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("reflexRushBest", String(bestScore));
    updateStats();
  }
  showToast("Round over! Saving your score…");
  try {
    const response = await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: playerName, score, deviceId })
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || "Could not save score.");
    }
    showToast("Score saved to the leaderboard!");
    await loadLeaderboard();
  } catch (error) {
    showToast("Could not save score. Is the server running?");
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function renderLeaderboard() {
  const list = $("leaderboard");
  const scores = allScoresVisible ? leaderboardScores : leaderboardScores.slice(0, 3);
  $("leaderboardCount").textContent = allScoresVisible ? `ALL ${leaderboardScores.length}` : "TOP 3";
  $("viewAllBtn").hidden = leaderboardScores.length <= 3;
  $("viewAllBtn").textContent = allScoresVisible ? "Show top 3 ↑" : `View all ${leaderboardScores.length} scores ↓`;
  $("viewAllBtn").setAttribute("aria-expanded", String(allScoresVisible));

  if (!leaderboardScores.length) {
    list.innerHTML = '<div class="empty-leader">No scores yet.<br>Be the first to claim the top spot!</div>';
    return;
  }
  list.innerHTML = scores.map((entry, index) => {
    const rankClass = ["gold", "silver", "bronze"][index] || "";
    const isCurrent = entry.name === playerName;
    return `<div class="leader-row ${isCurrent ? "current" : ""}">
      <span class="rank ${rankClass}">${String(index + 1).padStart(2, "0")}</span>
      <span class="leader-name" title="${escapeHtml(entry.name)}">${escapeHtml(entry.name)}</span>
      <span class="leader-score">${entry.score}</span>
    </div>`;
  }).join("");
}

async function loadLeaderboard() {
  const list = $("leaderboard");
  try {
    const response = await fetch("/api/scores");
    if (!response.ok) throw new Error("Request failed");
    leaderboardScores = await response.json();
    renderLeaderboard();
  } catch (_error) {
    list.innerHTML = '<div class="empty-leader">Leaderboard unavailable.<br>Start the Node.js server to load scores.</div>';
  }
}

$("startBtn").addEventListener("click", startGame);
target.addEventListener("click", hitTarget);
$("refreshBtn").addEventListener("click", loadLeaderboard);
$("viewAllBtn").addEventListener("click", () => {
  allScoresVisible = !allScoresVisible;
  renderLeaderboard();
});
$("changeNameBtn").addEventListener("click", () => {
  $("playerName").value = playerName;
  $("nameDialog").showModal();
});
$("cancelName").addEventListener("click", () => $("nameDialog").close());
$("nameForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("playerName").value.trim();
  if (!name) return;
  setPlayerName(name);
  $("nameDialog").close();
  if (!active && !roundEnded) showToast(`Welcome, ${playerName}!`);
  if (!active && !roundEnded) startGame();
  loadLeaderboard();
});

setPlayerName(playerName);
updateStats();
loadLeaderboard();
