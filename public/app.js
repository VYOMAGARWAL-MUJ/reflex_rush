const ROUND_SECONDS = 30;
const POINTS_PER_HIT = 10;

const $ = (id) => document.getElementById(id);

// ==================== SOUND EFFECTS ====================

let audioContext = null;

function playSound(type) {
  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    const now = audioContext.currentTime;

    if (type === "start") {
      // Upbeat sound when the round starts
      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(500, now);
      oscillator.frequency.exponentialRampToValueAtTime(
        850,
        now + 0.12
      );

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(
        0.15,
        now + 0.02
      );
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + 0.16
      );

      oscillator.start(now);
      oscillator.stop(now + 0.17);

    } else if (type === "hit") {
      // Quick pop when a target is successfully hit
      oscillator.type = "triangle";

      oscillator.frequency.setValueAtTime(750, now);
      oscillator.frequency.exponentialRampToValueAtTime(
        350,
        now + 0.07
      );

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(
        0.12,
        now + 0.008
      );
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + 0.09
      );

      oscillator.start(now);
      oscillator.stop(now + 0.1);

    } else if (type === "end") {
      // Descending tone when the round ends
      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(520, now);
      oscillator.frequency.exponentialRampToValueAtTime(
        220,
        now + 0.45
      );

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(
        0.15,
        now + 0.03
      );
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + 0.5
      );

      oscillator.start(now);
      oscillator.stop(now + 0.52);
    }
  } catch (error) {
    console.warn("Sound could not be played:", error);
  }
}

// ==================== PLAYER DATA ====================

let playerName = localStorage.getItem("reflexRushName") || "";

// Persistent browser/device identifier for leaderboard updates
let deviceId = localStorage.getItem("reflexRushDeviceId");

if (!deviceId) {
  deviceId = (
    crypto.randomUUID
      ? crypto.randomUUID()
      : `rr-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  localStorage.setItem("reflexRushDeviceId", deviceId);
}

let score = 0;
let timeLeft = ROUND_SECONDS;
let active = false;
let roundEnded = false;
let countdownId = null;
let roundDeadline = 0;

let bestScore = Number(
  localStorage.getItem("reflexRushBest") || 0
);

let toastId = null;
let allScoresVisible = false;
let leaderboardScores = [];
let scoreSaveFinished = true;

const target = $("target");
const arena = $("arena");
const arenaMessage = $("arenaMessage");

// ==================== GAME STATS ====================

function updateStats() {
  $("score").textContent = String(score).padStart(3, "0");

  $("timer").innerHTML = `${timeLeft}<span>s</span>`;

  $("bestScore").textContent = String(bestScore).padStart(3, "0");
}

// ==================== PLAYER NAME ====================

function setPlayerName(name) {
  playerName = name.trim().slice(0, 18);

  localStorage.setItem("reflexRushName", playerName);

  $("playerDisplay").textContent = playerName || "Guest player";
}

// ==================== NOTIFICATIONS ====================

function showToast(message) {
  $("toast").textContent = message;

  $("toast").classList.add("show");

  clearTimeout(toastId);

  toastId = setTimeout(() => {
    $("toast").classList.remove("show");
  }, 2400);
}

// ==================== TARGET POSITION ====================

function placeTarget() {
  const padding = 12;
  const size = 48;

  const maxX = Math.max(
    padding,
    arena.clientWidth - size - padding
  );

  const maxY = Math.max(
    padding,
    arena.clientHeight - size - padding
  );

  target.style.left =
    `${padding + Math.random() * (maxX - padding)}px`;

  target.style.top =
    `${padding + Math.random() * (maxY - padding)}px`;

  target.style.transform =
    `rotate(${Math.floor(Math.random() * 360)}deg)`;
}

// ==================== START GAME ====================

function startGame() {
  if (active) return;

  if (roundEnded) {
    if (scoreSaveFinished) {
      window.location.reload();
    }

    return;
  }

  if (!playerName) {
    $("nameDialog").showModal();
    $("playerName").focus();

    return;
  }

  // Clear any previous countdown
  if (countdownId !== null) {
    clearInterval(countdownId);
    countdownId = null;
  }

  score = 0;
  timeLeft = ROUND_SECONDS;

  roundDeadline = Date.now() + ROUND_SECONDS * 1000;

  active = true;
  roundEnded = false;

  // Play the game-start sound
  playSound("start");

  updateStats();

  arenaMessage.classList.add("hidden");
  target.classList.remove("hidden");

  $("roundStatus").textContent = "ROUND IN PROGRESS";
  $("startBtn").textContent = "Playing…";

  placeTarget();

  // Accurate countdown based on the deadline
  countdownId = setInterval(() => {
    if (!active) return;

    timeLeft = Math.max(
      0,
      Math.ceil((roundDeadline - Date.now()) / 1000)
    );

    updateStats();

    if (timeLeft <= 0) {
      endGame();
    }
  }, 100);
}

// ==================== HIT TARGET ====================

function hitTarget() {
  if (!active) return;

  // Increase score
  score += POINTS_PER_HIT;

  // Play the target-hit sound
  playSound("hit");

  updateStats();

  // Move the target
  placeTarget();

  // Hit animation
  target.animate(
    [
      {
        transform: "scale(.75)",
        opacity: 0.7
      },
      {
        transform: "scale(1)",
        opacity: 1
      }
    ],
    {
      duration: 110,
      easing: "ease-out"
    }
  );
}

// ==================== END GAME ====================

async function endGame() {
  if (roundEnded) return;

  active = false;
  roundEnded = true;

  // Play the game-over sound
  playSound("end");

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

    <p>
      You scored
      <strong style="color:#67e8f9">${score} points</strong>.
      Ready to beat it?
    </p>

    <button
      class="primary-button"
      id="playAgainBtn"
      type="button"
    >
      Play again <span>→</span>
    </button>
  `;

  // Play Again refreshes the page after saving
  $("playAgainBtn").addEventListener("click", () => {
    if (scoreSaveFinished) {
      window.location.reload();
    }
  });

  // Update personal best
  if (score > bestScore) {
    bestScore = score;

    localStorage.setItem(
      "reflexRushBest",
      String(bestScore)
    );

    updateStats();
  }

  showToast("Round over! Saving your score…");

  scoreSaveFinished = false;

  const playAgainButton = $("playAgainBtn");

  playAgainButton.disabled = true;
  playAgainButton.textContent = "Saving score…";

  try {
    // Save score to the existing API
    const response = await fetch("/api/scores", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        name: playerName,
        score,
        deviceId
      })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));

      throw new Error(
        body.error || "Could not save score."
      );
    }

    showToast("Score saved to the leaderboard!");

    await loadLeaderboard();

  } catch (error) {
    showToast("Could not save score. Is the server running?");

  } finally {
    scoreSaveFinished = true;

    playAgainButton.disabled = false;

    playAgainButton.innerHTML =
      'Play again <span>→</span>';
  }
}

// ==================== HTML SAFETY ====================

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

// ==================== LEADERBOARD ====================

function renderLeaderboard() {
  const list = $("leaderboard");

  const scores = allScoresVisible
    ? leaderboardScores
    : leaderboardScores.slice(0, 3);

  $("leaderboardCount").textContent = allScoresVisible
    ? `ALL ${leaderboardScores.length}`
    : "TOP 3";

  $("viewAllBtn").hidden =
    leaderboardScores.length <= 3;

  $("viewAllBtn").textContent = allScoresVisible
    ? "Show top 3 ↑"
    : `View all ${leaderboardScores.length} scores ↓`;

  $("viewAllBtn").setAttribute(
    "aria-expanded",
    String(allScoresVisible)
  );

  if (!leaderboardScores.length) {
    list.innerHTML = `
      <div class="empty-leader">
        No scores yet.<br>
        Be the first to claim the top spot!
      </div>
    `;

    return;
  }

  list.innerHTML = scores.map((entry, index) => {
    const rankClass = ["gold", "silver", "bronze"][index] || "";

    const isCurrent = entry.name === playerName;

    return `
      <div class="leader-row ${isCurrent ? "current" : ""}">
        <span class="rank ${rankClass}">
          ${String(index + 1).padStart(2, "0")}
        </span>

        <span
          class="leader-name"
          title="${escapeHtml(entry.name)}"
        >
          ${escapeHtml(entry.name)}
        </span>

        <span class="leader-score">
          ${entry.score}
        </span>
      </div>
    `;
  }).join("");
}

// ==================== LOAD LEADERBOARD ====================

async function loadLeaderboard() {
  const list = $("leaderboard");

  try {
    const response = await fetch("/api/scores");

    if (!response.ok) {
      throw new Error("Request failed");
    }

    leaderboardScores = await response.json();

    renderLeaderboard();

  } catch (_error) {
    list.innerHTML = `
      <div class="empty-leader">
        Leaderboard unavailable.<br>
        Start the Node.js server to load scores.
      </div>
    `;
  }
}

// ==================== EVENT LISTENERS ====================

// Start game / Play Again button
$("startBtn").addEventListener("click", () => {
  if (roundEnded) {
    if (scoreSaveFinished) {
      window.location.reload();
    }

    return;
  }

  startGame();
});

// Target click
target.addEventListener("click", hitTarget);

// Refresh leaderboard
$("refreshBtn").addEventListener(
  "click",
  loadLeaderboard
);

// Show all scores / Top 3
$("viewAllBtn").addEventListener("click", () => {
  allScoresVisible = !allScoresVisible;

  renderLeaderboard();
});

// Change player name
$("changeNameBtn").addEventListener("click", () => {
  $("playerName").value = playerName;

  $("nameDialog").showModal();
});

// Cancel changing name
$("cancelName").addEventListener("click", () => {
  $("nameDialog").close();
});

// Save player name and start the first round
$("nameForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = $("playerName").value.trim();

  if (!name) return;

  setPlayerName(name);

  $("nameDialog").close();

  if (!active && !roundEnded) {
    showToast(`Welcome, ${playerName}!`);
  }

  if (!active && !roundEnded) {
    startGame();
  }

  loadLeaderboard();
});

// ==================== INITIALIZE GAME ====================

setPlayerName(playerName);

updateStats();

loadLeaderboard();
