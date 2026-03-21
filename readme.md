```markdown
# HireMe Pro

A full-stack technical hiring platform that lets recruiters create coding challenges, evaluate candidates in real-time, and make data-driven hiring decisions powered by AI.

![Dashboard Preview](./screenshots/dashboard.png)

## Overview

HireMe Pro streamlines the technical hiring process end-to-end. Recruiters create frontend coding challenges, schedule timed sessions, and let candidates attempt them directly in the browser — no setup required. Once submitted, an AI model automatically evaluates each submission and scores it against the challenge requirements, giving recruiters instant, objective feedback on every candidate.

**Why HireMe Pro?**
- **No manual review bottleneck** — AI scores submissions the moment they're submitted, so recruiters see results instantly instead of waiting hours to review code manually.
- **Real hiring signal** — candidates write real code in a real editor with a live preview, not just multiple choice or toy problems.
- **Full context for decisions** — recruiters get a score, breakdown, strengths, missing features, and can open the actual code in a read-only review page.

## Key Features

**For Recruiters**
- Create challenges with task descriptions, required features, design references, and tech constraints
- Schedule timed sessions — platform auto-transitions SCHEDULED → LIVE → ENDED via cron
- Watch a live leaderboard update in real-time as candidates submit (Socket.io)
- Every submission is auto-evaluated by Gemini AI — score, breakdown, strengths, improvements
- Open any candidate's code in a read-only Sandpack editor with live preview

**For Candidates**
- Clean challenge instructions page with session countdown and registration
- Full in-browser IDE — file explorer, Monaco editor, live preview, tab management
- Timer auto-submits code when session ends so no work is lost
- Results page shows AI score, summary, and detailed feedback after submission

## Screenshots

| Challenges | Attempt Page |
|---|---|
| ![Challenges](./screenshots/challenges.png) | ![Attempt](./screenshots/attempt.png) |

| Leaderboard | Code Review |
|---|---|
| ![Leaderboard](./screenshots/leaderboard.png) | ![Code Review](./screenshots/code-review.png) |

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS, Sandpack |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL, Drizzle ORM |
| Auth | JWT + Refresh Tokens |
| AI Evaluation | Gemini 1.5 Flash |
| Real-time | Socket.io |
| File Upload | Cloudinary |
| Cron Jobs | node-cron (session lifecycle) |

## Getting Started

```bash
# Backend
cd server
npm install
cp .env.example .env
npm run dev

# Frontend
cd client
npm install
cp .env.example .env.local
npm run dev
```

## Environment Variables

```env
# Backend
DATABASE_URL=
JWT_SECRET=
GEMINI_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLIENT_URL=

# Frontend
NEXT_PUBLIC_API_URL=
```

## License
MIT
```