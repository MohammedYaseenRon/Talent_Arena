# HireMe Pro

> A full-stack technical hiring platform — create coding challenges, evaluate candidates with AI, and make data-driven hiring decisions.

![Dashboard Preview](./screenshots/dashboard.png)

---

## Overview

**HireMe Pro** streamlines the entire technical hiring workflow — from challenge creation to AI-powered evaluation.

Recruiters can create real-world frontend challenges, schedule live sessions, and allow candidates to code directly in the browser (no setup required). Once submitted, **AI evaluates the code instantly**, providing structured feedback and scoring.

---

## Why HireMe Pro?

* **No manual review bottleneck**
  AI evaluates submissions instantly — no waiting hours for code reviews

* **Real hiring signal**
  Candidates write real code in a live environment (not MCQs)

* **Data-driven decisions**
  Get scores, breakdowns, strengths, and improvement areas

* **Real-time updates**
  Leaderboards update live using WebSockets

---

## Key Features

### For Recruiters

* **Challenge Builder**
  Create tasks with requirements, constraints, design refs & starter code

* **Session Lifecycle Automation**
  Auto transitions: `SCHEDULED → LIVE → ENDED` via cron jobs

* **Live Leaderboard**
  Real-time ranking updates using Socket.io

* **AI Evaluation (Gemini)**

  * Overall score
  * Multi-dimensional breakdown
  * Strengths & improvements
  * Feature completion tracking

* **Code Review System**
  Read-only Sandpack editor with live preview of candidate code

---

### For Candidates

* **Instructions Page**
  Session rules, countdown timer, and quick start

* **In-Browser IDE**

  * File explorer
  * Code editor
  * Live preview
  * Auto-submit timer

* **Results & Feedback**
  AI-generated score, summary, and detailed feedback

---

## Screenshots

### Recruiter Dashboard

<p align="center">
  <img src="./screenshots/challenges.png" alt="Challenges" width="45%" />
  <img src="./screenshots/live.png" alt="Live Sessions" width="45%" />
</p>

---

### Review & Analysis

<table>
  <tr>
    <td><img src="./screenshots/leaderboard.png" width="100%" /></td>
    <td><img src="./screenshots/review.png" width="100%" /></td>
  </tr>
  <tr>
    <td><img src="./screenshots/ai.png" width="100%" /></td>
    <td><img src="./screenshots/submission.png" width="100%" /></td>
  </tr>
</table>
 
---

### Candidate Flow

<table>
  <tr>
    <img src="./screenshots/Instruction.png" alt="Instructions" width="100%" />
    <img src="./screenshots/cLive.png" alt="Attempt Page" width="100%" >
  </tr>
  <tr>
    <td><img src="./screenshots/attempt.png" width="100%" /></td>
    <td><img src="./screenshots/submit.png" width="100%" /></td>
  </tr>
</table>

---

## 🛠 Tech Stack

### Frontend

| Tech             | Usage             |
| ---------------- | ----------------- |
| Next.js 14       | App Router, SSR   |
| TypeScript       | Type safety       |
| Tailwind CSS     | Styling           |
| Sandpack         | In-browser IDE    |
| Socket.io Client | Real-time updates |
| shadcn/ui        | UI components     |

---

### ⚙️ Backend

| Tech              | Usage              |
| ----------------- | ------------------ |
| Node.js + Express | REST API           |
| TypeScript        | Type safety        |
| PostgreSQL        | Database           |
| Drizzle ORM       | Type-safe queries  |
| Socket.io         | Real-time events   |
| node-cron         | Session automation |
| Cloudinary        | File uploads       |
| Gemini 1.5 Flash  | AI evaluation      |
| JWT               | Authentication     |

---

## Getting Started

### Prerequisites

* Node.js 18+
* PostgreSQL
* Gemini API Key → https://aistudio.google.com
* Cloudinary Account

---

### Installation

#### Clone Repository

```bash
git clone https://github.com/yourusername/hireme-pro.git
cd hireme-pro
```

---

#### Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Fill environment variables, then:

```bash
npx drizzle-kit migrate
npm run dev
```

---

#### Frontend Setup

```bash
cd client
npm install
cp .env.example .env.local
npm run dev
```

---

## Environment Variables

### Backend `.env`

```env
DATABASE_URL=postgresql://user:password@localhost:5432/hireme
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000
PORT=4000
```

---

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Project Structure

```
hireme-pro/
├── client/                 # Next.js frontend
│   ├── app/
│   │   ├── recruiter/      # Recruiter dashboard
│   │   └── challenges/     # Candidate flow
│   └── components/
│
└── server/                 # Express backend
    ├── controllers/
    ├── routes/
    ├── services/
    │   ├── evaluateSubmission.ts
    │   └── cron.service.ts
    ├── lib/
    │   └── socket.ts
    └── db/
        └── schema.ts
```
---

## 📄 License

MIT

---

## Contributing

Contributions are welcome! Feel free to open issues or submit PRs.

---

## Support

If you like this project, consider giving it a on GitHub!
