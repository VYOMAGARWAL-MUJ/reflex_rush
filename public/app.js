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
      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(500, now);
      oscillator.frequency.exponentialRampToValueAtTime(
        850,
        now + 0.12
      );

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      oscillator.start(now);
      oscillator.stop(now + 0.17);

    } else if (type === "hit") {
      oscillator.type = "triangle";

      oscillator.frequency.setValueAtTime(750, now);
      oscillator.frequency.exponentialRampToValueAtTime(
        350,
        now + 0.07
      );

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      oscillator.start(now);
      oscillator.stop(now + 0.1);

    } else if (type === "end") {
      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(520, now);
      oscillator.frequency.exponentialRampToValueAtTime(
        220,
        now + 0.45
      );

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.15, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      oscillator.start(now);
      oscillator.stop(now + 0.52);
    }
  } catch (error) {
    console.warn("Sound could not be played:", error);
  }
}

// ==================== PLAYER DATA ====================

// Player name resets whenever the page refreshes.
let playerName = "";
localStorage.removeItem("reflexRushName");

// Keep device ID persistent so scores can be associated
// with the same browser/device.
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

  if (playerName) {
    localStorage.setItem("reflexRushName", playerName);
  } else {
    localStorage.removeItem("reflexRushName");
  }

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

  if (countdownId !== null) {
    clearInterval(countdownId);
    countdownId = null;
  }

  score = 0;
  timeLeft = ROUND_SECONDS;

  roundDeadline = Date.now() + ROUND_SECONDS * 1000;

  active = true;
  roundEnded = false;

  playSound("start");

  updateStats();

  arenaMessage.classList.add("hidden");
  target.classList.remove("hidden");

  $("roundStatus").textContent = "ROUND IN PROGRESS";
  $("startBtn").textContent = "Playing…";

  placeTarget();

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

  score += POINTS_PER_HIT;

  playSound("hit");

  updateStats();
  placeTarget();

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

  $("playAgainBtn").addEventListener("click", () => {
    if (scoreSaveFinished) {
      window.location.reload();
    }
  });

  // Save personal best locally.
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
    console.error("Score saving failed:", error);

    showToast("Could not save score. Please try again.");

  } finally {
    scoreSaveFinished = true;

    playAgainButton.disabled = false;

    playAgainButton.innerHTML =
      'Play again <span>→</span>';
  }
}

// ==================== HTML SAFETY ====================

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
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
  const podium = $("leaderboardPodium");

  // Display either the top three or the complete list.
  const scores = allScoresVisible
    ? leaderboardScores
    : leaderboardScores.slice(0, 3);

  $("leaderboardCount").textContent = allScoresVisible
    ? `ALL ${leaderboardScores.length}`
    : "TOP 3";

  $("viewAllBtn").hidden = leaderboardScores.length <= 3;

  $("viewAllBtn").textContent = allScoresVisible
    ? "Show top 3 ↑"
    : `View all ${leaderboardScores.length} scores ↓`;

  $("viewAllBtn").setAttribute(
    "aria-expanded",
    String(allScoresVisible)
  );

  // Empty state.
  if (!leaderboardScores.length) {
    podium.innerHTML = `
      <div class="podium-empty">
        No scores yet. Be the first to take the podium!
      </div>
    `;

    list.innerHTML = `
      <div class="empty-leader">
        No scores yet.<br>
        Play a round to appear here!
      </div>
    `;

    return;
  }

  function formatScore(value) {
    return Number(value).toLocaleString();
  }

  // Arrange second, first, third for a podium layout.
  const podiumEntries = [
    {
      entry: leaderboardScores[1],
      rank: 2,
      position: "second",
      medal: "♛"
    },
    {
      entry: leaderboardScores[0],
      rank: 1,
      position: "first",
      medal: "♛"
    },
    {
      entry: leaderboardScores[2],
      rank: 3,
      position: "third",
      medal: "♛"
    }
  ];

  podium.innerHTML = podiumEntries
    .filter(({ entry }) => Boolean(entry))
    .map(({ entry, rank, position, medal }) => {
      const name = String(entry.name || "Player");

      const initial = escapeHtml(
        name.trim().charAt(0).toUpperCase() || "?"
      );

      return `
        <div class="podium-person ${position}">
          <div class="podium-avatar-wrap">
            <div class="podium-avatar">${initial}</div>
            <span class="podium-medal">${medal}</span>
          </div>

          <div
            class="podium-name"
            title="${escapeHtml(name)}"
          >
            ${escapeHtml(name)}
          </div>

          <div class="podium-score">
            ${formatScore(entry.score)}
          </div>

          <div class="podium-bar">${rank}</div>
        </div>
      `;
    })
    .join("");

  // Render the rankings list.
  list.innerHTML = scores
    .map((entry, index) => {
      const name = String(entry.name || "Player");

      const initial = escapeHtml(
        name.trim().charAt(0).toUpperCase() || "?"
      );

      const rankClass = [
        "gold",
        "silver",
        "bronze"
      ][index] || "";

      const isCurrent =
        Boolean(playerName) &&
        name.toLowerCase() === playerName.toLowerCase();

      return `
        <div class="leader-row ${isCurrent ? "current" : ""}">
          <span class="rank ${rankClass}">
            ${index + 1}
          </span>

          <span class="leader-row-avatar">
            ${initial}
          </span>

          <span
            class="leader-name"
            title="${escapeHtml(name)}"
          >
            ${escapeHtml(name)}
          </span>

          <span class="leader-score">
            ${formatScore(entry.score)}
          </span>
        </div>
      `;
    })
    .join("");
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

  } catch (error) {
    console.error("Leaderboard loading failed:", error);

    list.innerHTML = `
      <div class="empty-leader">
        Leaderboard unavailable.<br>
        Please refresh and try again.
      </div>
    `;

    const podium = $("leaderboardPodium");

    if (podium) {
      podium.innerHTML = `
        <div class="podium-empty">
          Unable to load rankings.
        </div>
      `;
    }
  }
}

// ==================== EVENT LISTENERS ====================

// Start game / Play Again.
$("startBtn").addEventListener("click", () => {
  if (roundEnded) {
    if (scoreSaveFinished) {
      window.location.reload();
    }

    return;
  }

  startGame();
});

// Target click.
target.addEventListener("click", hitTarget);

// Refresh leaderboard.
$("refreshBtn").addEventListener(
  "click",
  loadLeaderboard
);

// Toggle Top 3 / View All.
$("viewAllBtn").addEventListener("click", () => {
  allScoresVisible = !allScoresVisible;

  renderLeaderboard();
});

// Change player name.
$("changeNameBtn").addEventListener("click", () => {
  $("playerName").value = playerName;

  $("nameDialog").showModal();
});

// Cancel changing name.
$("cancelName").addEventListener("click", () => {
  $("nameDialog").close();
});

// Save player name and start the game.
$("nameForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = $("playerName").value.trim();

  if (!name) return;

  setPlayerName(name);

  $("nameDialog").close();

  if (!active && !roundEnded) {
    showToast(`Welcome, ${playerName}!`);
    startGame();
  }

  loadLeaderboard();
});

// ==================== INITIALIZE GAME ====================

setPlayerName(playerName);

updateStats();

loadLeaderboard();
