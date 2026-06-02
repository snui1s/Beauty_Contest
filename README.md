# Beauty Contest

A real-time multiplayer number-guessing game inspired by the Beauty Contest game from *Alice in Borderland*. Players compete by selecting numbers between 0 and 100 each round; the player whose number is closest to 80% of the group average wins the round, while the others lose a point. Dynamic rules activate as the player count drops, increasing strategic depth.

---

## Table of Contents

- [Disclaimer](#disclaimer)
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Game Rules](#game-rules)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)

---

## Disclaimer

This project is an unofficial fan-made recreation of the "Beauty Contest" game featured in *Alice in Borderland*, originally a manga series by Haro Aso and adapted as a Netflix original drama series. All intellectual property, characters, and concepts related to *Alice in Borderland* belong to their respective rights holders.

This project was built purely for personal entertainment — to enjoy a faithful recreation of the game with friends. It is a non-commercial, open-source fan project with no intention of monetization or distribution for profit. No copyright infringement is intended.

---

## Overview

Players join a shared lobby via a room code. Each round, every active player submits a number between 0 and 100 within a time limit. The target value is 80% of the average of all submitted numbers. The player(s) closest to that target win the round; all others lose one point. A player is eliminated when their score reaches -10. The last player standing wins.

Special rules activate dynamically based on the number of surviving players, raising the stakes as the game progresses.

---

## Tech Stack

### Client

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14 | React framework and routing |
| React | 18 | UI component library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 3 | Utility-first styling |
| Socket.IO Client | 4 | Real-time WebSocket communication |
| Lucide React | 0.379 | Icon library |

### Server

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | LTS | Runtime environment |
| Express | 4 | HTTP server |
| Socket.IO | 4 | Real-time WebSocket server |
| CORS | 2 | Cross-origin resource sharing |

---

## Project Structure

```
beautycontest/
├── client/                     # Next.js frontend application
│   ├── src/
│   │   ├── app/                # Next.js App Router pages and layouts
│   │   └── components/         # Reusable React components
│   │       ├── LobbyScreen.tsx
│   │       ├── GameScreen.tsx
│   │       ├── SummaryScreen.tsx
│   │       ├── Leaderboard.tsx
│   │       ├── GameOverScreen.tsx
│   │       ├── RulesGuide.tsx
│   │       └── RuleIntroModal.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── server/                     # Express + Socket.IO backend
│   ├── server.js               # Main server entry point
│   ├── utils/
│   │   └── gameLogic.js        # Round evaluation and scoring logic
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Prerequisites

- [Bun](https://bun.sh/) v1.0 or higher (recommended)
- Alternatively, [Node.js](https://nodejs.org/) v18 or higher with npm, yarn, or pnpm

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/snui1s/Beauty_Contest.git
cd Beauty_Contest
```

### 2. Install server dependencies

```bash
cd server
bun install
```

### 3. Install client dependencies

```bash
cd ../client
bun install
```

### 4. Start the server

```bash
# From the server/ directory
bun run dev
# Server runs on http://localhost:4000
```

### 5. Start the client

```bash
# From the client/ directory
bun run dev
# Client runs on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Game Rules

### Core Rule

Each round, players submit a number between **0 and 100**. The winning target is calculated as:

```
Target = Average of all submitted numbers x 0.8
```

The player(s) whose number is closest to the target win the round. All other players lose **1 point**. A player is eliminated when their score reaches **-10**.

### Dynamic Rules (by surviving player count)

As the game progresses, additional rules activate cumulatively based on the number of active (non-eliminated) players:

| Trigger | Rule |
|---------|------|
| 5 or fewer players | If any player picks **exactly 0** and another picks **exactly 100**, the player who picked 100 wins the round immediately; all others lose 1 point. |
| 4 or fewer players | If two or more players submit the **same number**, those numbers are declared invalid and excluded from the average calculation. Players with invalid picks lose 1 point immediately. |
| 3 or fewer players | Duplicate picks result in **-2 points** instead of -1. |
| 2 or fewer players | All previously activated rules remain in effect. |

All rules activated at earlier thresholds remain active for the remainder of the game. A modal notification is shown to all players the first time each rule activates, and the round timer pauses until every player acknowledges the new rule.

---

## Environment Variables

No environment variables are required to run the project locally with default settings. If you need to change the server port or client URL for a production deployment, configure the following:

| Variable | Location | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | server/.env | `4000` | Port the Express server listens on |
| `NEXT_PUBLIC_SERVER_URL` | client/.env.local | `http://localhost:4000` | Socket.IO server URL used by the client |

---

## Scripts

### Server (`server/`)

| Command | Description |
|---------|-------------|
| `bun start` | Start the server using Bun |
| `bun run dev` | Start the server with nodemon (auto-restart on file changes) |

### Client (`client/`)

| Command | Description |
|---------|-------------|
| `bun run dev` | Start the Next.js development server |
| `bun run build` | Build the production bundle |
| `bun start` | Start the production server (requires build first) |
| `bun run lint` | Run ESLint on the codebase |
