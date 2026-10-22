# ⚡ Reflex Rush

### Test Your Reflexes. Beat the Clock. Dominate the Leaderboard.

**Reflex Rush** is a fast-paced browser-based reaction game where every millisecond matters. Players must quickly identify and click a moving target before time runs out, earn points for successful hits, and compete for the highest position on a shared leaderboard.

Built with a clean, modern interface and a real-time scoring experience, Reflex Rush combines simple gameplay with competitive rankings to create an engaging reflex-testing challenge.

> **Our Goal:** Create a fun, lightweight, and competitive browser game that challenges reaction speed and rewards precision.

---

## 📌 Table of Contents

* [Overview](#-overview)
* [Core Features](#-core-features)
* [How to Play](#-how-to-play)
* [Scoring System](#-scoring-system)
* [Leaderboard](#-leaderboard)
* [Technology Stack](#-technology-stack)
* [System Architecture](#-system-architecture)
* [Project Structure](#-project-structure)
* [Getting Started](#-getting-started)
* [Environment Variables](#-environment-variables)
* [Deployment](#-deployment)
* [Future Scope](#-future-scope)

---

## 🚀 Overview

Reflex Rush is designed around one simple question:

**How fast are your reflexes?**

Players enter the game, choose their display name, and attempt to hit the target as many times as possible within a 30-second round.

Every successful hit increases the score. When the round ends, the score is submitted to the backend and reflected on the shared leaderboard.

The application combines browser-based gameplay with persistent score storage, allowing players to compete across different sessions and devices.

### Key Objectives

* Deliver a responsive and engaging reaction-time game.
* Provide simple, intuitive gameplay with minimal setup.
* Track scores during each round.
* Maintain a persistent player identity on the same browser.
* Save and update leaderboard entries through a backend API.
* Display the Top 3 players by default, with an option to view all entries.
* Provide a consistent experience across supported browsers and screen sizes.

---

## ✨ Core Features

### 1. 🎯 Interactive Reflex Gameplay

Reflex Rush challenges players to click a target as quickly and accurately as possible.

**Key features:**

* Interactive target-based gameplay.
* Dynamic target positioning.
* Immediate score updates.
* A focused play area designed to minimize distractions.
* A straightforward interface suitable for quick gaming sessions.

Each successful target hit rewards the player with points.

### 2. ⏱️ Timed Game Rounds

Every round runs for **30 seconds**.

The timer provides a clear indication of the time remaining, creating urgency and encouraging players to react quickly.

**Gameplay behavior:**

* A round starts with a 30-second countdown.
* The score increases with successful hits.
* The round ends when the timer reaches zero.
* Players can start another round using the Play Again option.

The game is designed to reset the round state between games so players can attempt to beat their previous performance.

### 3. 🏆 Live Scoring System

The scoring system rewards successful target hits.

| Action                |    Points |
| --------------------- | --------: |
| Successful target hit |       +10 |
| Missed click          | No points |

The current score updates during gameplay, allowing players to track their performance in real time.

### 4. 📊 Persistent Leaderboard

Reflex Rush includes a shared leaderboard powered by Supabase.

Unlike a purely local leaderboard, saved entries can be retrieved across sessions and devices.

**Leaderboard capabilities:**

* Displays the highest-scoring entries first.
* Shows the Top 3 players by default.
* Allows users to expand the leaderboard to view all entries.
* Supports manual leaderboard refresh.
* Retains saved scores between page reloads and deployments.
* Updates an existing entry when the same browser/device completes another round.

The leaderboard is designed to keep the interface compact while still allowing players to explore the full rankings.

### 5. 👤 Player Identity

Players can choose a display name that appears on the leaderboard.

The application uses browser local storage to retain the player's identity between visits.

A persistent browser/device identifier is used to associate subsequent rounds with the same leaderboard entry.

**Benefits:**

* Players do not need to enter their name for every round.
* Returning players can update their existing leaderboard entry.
* Different devices can maintain separate entries, even when the display names match.

Clearing browser storage or switching browsers may create a new player identity.

### 6. 🔄 Score Persistence and Updates

The game communicates with a server-side API to save and retrieve leaderboard data.

When a round finishes, the score is submitted to the backend, which stores or updates the corresponding entry in Supabase.

This separates the game interface from the persistent leaderboard database.

### 7. 🎨 Modern User Interface

Reflex Rush uses a dark interface with contrasting colors, clear score indicators, and an interactive game area.

**Interface highlights:**

* Dark-themed visual design.
* Prominent score and timer displays.
* Distinct target zone.
* Compact leaderboard panel.
* Expandable rankings.
* Responsive layout for different screen sizes.

The design prioritizes readability and quick interaction during gameplay.

---

## 🎮 How to Play

Getting started with Reflex Rush is simple.

### Step 1: Open the Game

Visit the deployed website using a supported browser.

### Step 2: Choose Your Name

Set your display name so your score can appear on the leaderboard.

### Step 3: Start Playing

Click the target whenever it appears in the play area.

### Step 4: Earn Points

Each successful hit adds 10 points to your score.

### Step 5: Beat the Clock

Try to achieve the highest possible score before the 30-second timer expires.

### Step 6: Check the Leaderboard

After the round, your score is submitted to the leaderboard.

View the Top 3 players or expand the leaderboard to see all saved entries.

### Step 7: Play Again

Start another round and try to improve your performance.

---

## 🧮 Scoring System

Reflex Rush uses a simple point-based scoring model.

The score is calculated as:

**Final Score = Successful Hits × 10**

For example:

| Successful Hits | Final Score |
| --------------: | ----------: |
|               5 |          50 |
|              10 |         100 |
|              20 |         200 |
|              30 |         300 |
|              50 |         500 |

The leaderboard sorts saved entries by score in descending order.

The system is intended for casual competition and entertainment rather than security-sensitive or prize-based tournaments.

---

## 🏅 Leaderboard Design

The leaderboard is designed to balance visibility and usability.

### Default View

The leaderboard initially displays the three highest-scoring entries.

### Expanded View

Players can select **View All Scores** to display the full list of saved entries.

The control can then be used to collapse the list back to the Top 3.

### Score Updates

Each browser/device has a persistent identifier stored in local storage.

When the same device submits another completed round, the backend updates its existing leaderboard entry instead of creating another entry for every game.

Different devices can still have separate entries with identical display names.

**Note:** Historical entries created before device identifiers were introduced may remain as separate records.

---

## 🛠️ Technology Stack

### Frontend

| Technology            | Purpose                                    |
| --------------------- | ------------------------------------------ |
| HTML5                 | Game structure and interface               |
| CSS3                  | Styling, layout, and animations            |
| JavaScript            | Gameplay, timer, scoring, and interactions |
| Browser Local Storage | Persistent player name and device identity |
| Responsive CSS        | Adaptation to different screen sizes       |

### Backend

| Technology                 | Purpose                                   |
| -------------------------- | ----------------------------------------- |
| Node.js                    | Server-side JavaScript runtime            |
| Vercel Functions           | Serverless API for leaderboard operations |
| Supabase JavaScript Client | Communication with the database           |

### Database and Infrastructure

| Technology                  | Purpose                                           |
| --------------------------- | ------------------------------------------------- |
| Supabase PostgreSQL         | Persistent leaderboard storage                    |
| Supabase Row Level Security | Database access-control support                   |
| Vercel                      | Hosting and deployment                            |
| GitHub                      | Source-code management and deployment integration |

---

## 🏗️ System Architecture

Reflex Rush uses a lightweight client-server architecture.

```text
           Player
             |
             v
      Reflex Rush UI
      HTML / CSS / JS
             |
       Gameplay Logic
       Timer and Score
             |
             v
       Vercel API
       /api/scores
             |
             v
     Supabase Client
             |
             v
      PostgreSQL DB
      Shared Leaderboard
```

### Request Flow

**1. Gameplay**

The browser manages the timer, target interaction, and current-round score.

**2. API Request**

The frontend sends requests to the `/api/scores` endpoint to retrieve leaderboard entries or submit completed scores.

**3. Server Processing**

The Vercel Function validates the request and communicates with Supabase using server-side credentials.

**4. Database Operations**

Supabase stores the scores and associates returning browser/device identities with their existing entries.

**5. Leaderboard Rendering**

The frontend retrieves the saved entries, sorts them by score, and renders the Top 3 or expanded leaderboard.

---

## 📁 Project Structure

```text
reflex-rush-vercel/
│
├── api/
│   └── scores.js
│
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
├── package.json
├── vercel.json
└── README.md
```

### File Responsibilities

| File                | Description                                                                   |
| ------------------- | ----------------------------------------------------------------------------- |
| `public/index.html` | Main game interface and page structure                                        |
| `public/styles.css` | Visual design, layout, and responsive styling                                 |
| `public/app.js`     | Gameplay logic, timer, scoring, player identity, and leaderboard interactions |
| `api/scores.js`     | Server-side endpoint for reading and saving leaderboard entries               |
| `package.json`      | Project metadata and dependencies                                             |
| `vercel.json`       | Vercel deployment configuration                                               |
| `README.md`         | Project documentation and setup instructions                                  |

---

## ⚙️ Getting Started

You can run Reflex Rush locally or deploy it using Vercel.

### Prerequisites

Ensure you have:

* Node.js 20 or later.
* npm.
* A GitHub account if you want to use GitHub-based deployment.
* A Supabase account and project.
* A Vercel account.

### 1. Clone the Repository

```bash
git clone https://github.com/VYOMAGARWAL-MUJ/reflex_rush.git
cd reflex_rush
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Supabase

Create a Supabase project and open its SQL Editor.

Run the following SQL to create the leaderboard table:

```sql
CREATE TABLE IF NOT EXISTS public.scores (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL
        CHECK (char_length(name) BETWEEN 1 AND 18),
    device_id TEXT UNIQUE,
    score INTEGER NOT NULL
        CHECK (score >= 0 AND score <= 100000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS scores_leaderboard_idx
ON public.scores (score DESC, created_at ASC);

ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
```

If your table already exists, do not recreate it unnecessarily. Apply only the required schema migrations.

### 4. Configure Environment Variables

In Vercel, open:

**Project → Settings → Environment Variables**

Add these variables:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_server_side_supabase_key
```

Use the actual values from your Supabase project.

The service-role key must remain private and must only be used by the server-side API.

Never place it in `public/app.js` or commit it to GitHub.

### 5. Run Locally

This project uses static frontend files and a Vercel serverless API.

For the complete local experience, use the Vercel CLI to run the application in a Vercel-compatible development environment.

Install the CLI if required:

```bash
npm install -g vercel
```

Then run:

```bash
vercel dev
```

Configure the required environment variables in your local development environment before testing score persistence.

Open the local URL shown by the CLI.

---

## 🚀 Deployment

Reflex Rush can be deployed through GitHub and Vercel.

### Step 1: Push to GitHub

Commit and push the project files to your GitHub repository.

### Step 2: Import into Vercel

1. Open the Vercel dashboard.
2. Select **Add New → Project**.
3. Import the Reflex Rush repository.
4. Use the appropriate configuration for a static frontend with Vercel Functions.
5. Deploy the project.

### Step 3: Add Environment Variables

Configure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your Vercel project settings.

Make sure the variables are enabled for the environments in which the API will run.

### Step 4: Redeploy

After changing environment variables, redeploy the project so the serverless function receives the updated configuration.

### Step 5: Verify the Deployment

Test the following:

* The game loads successfully.
* The countdown runs correctly.
* Successful target hits increase the score.
* Completed scores save to Supabase.
* The leaderboard retrieves saved entries.
* Playing again updates the appropriate entry.
* The Top 3 and View All controls work correctly.

---

## 🔒 Security and Limitations

Reflex Rush is designed as a casual browser game.

### Server-Side Credentials

The Supabase service-role key is used by the server-side API and must never be exposed to the browser.

### Database Access

The database should be configured with appropriate access controls. Public users should not receive unrestricted write access to the leaderboard table.

### Score Validation

The current architecture is suitable for a prototype and casual competition, but client-side gameplay can potentially be manipulated.

For a production competition, additional protections may be required, including:

* Server-side gameplay validation.
* Rate limiting.
* Abuse detection.
* Request validation.
* Stronger verification of score submissions.

### Device Identity

The browser/device identifier is stored in local storage. Clearing browser data or switching browsers may create a new identity.

The identifier associates scores with a browser; it does not prove a player's real-world identity.

---

## 🔮 Future Scope

Potential enhancements for Reflex Rush include:

* Global player rankings and seasonal leaderboards.
* Personal-best tracking across multiple rounds.
* Daily and weekly challenges.
* Difficulty levels with different target speeds.
* Accuracy and reaction-time statistics.
* Player profiles and match history.
* Multiplayer competitions.
* Improved server-side score validation.
* Mobile-specific interaction improvements.
* Sound effects and additional visual feedback.

These are possible future improvements and are not necessarily part of the current implementation.

---

## 🎯 Project Information

| Field        | Details                                                                       |
| ------------ | ----------------------------------------------------------------------------- |
| Project Name | Reflex Rush                                                                   |
| Category     | Browser-Based Reaction Game                                                   |
| Frontend     | HTML, CSS, JavaScript                                                         |
| Backend      | Vercel Serverless Functions                                                   |
| Database     | Supabase PostgreSQL                                                           |
| Hosting      | Vercel                                                                        |
| Repository   | [VYOMAGARWAL-MUJ/reflex_rush](https://github.com/VYOMAGARWAL-MUJ/reflex_rush) |

---

## ⚡ Reflex Rush

**Fast reactions. Higher scores. One leaderboard.**

Challenge your reflexes, beat your personal best, and compete for the top spot.
