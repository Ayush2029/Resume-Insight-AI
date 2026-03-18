<div align="center">

# Resume-Insight-AI

**Upload a resume PDF → automatically extract GitHub profile → analyze every repository with AI-powered summaries**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-orange?style=flat-square)](https://console.groq.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Deployment](#deployment)
  - [Render](#render)
  - [Keeping the App Awake](#keeping-the-app-awake)

---

## Overview

Resume-Insight-AI is a full-stack Next.js web application that bridges the gap between a candidate's resume and their actual code. It accepts a PDF resume as input, automatically finds the GitHub profile URL embedded in it — whether as a clickable hyperlink or plain text — fetches the complete GitHub profile along with all public repositories, and presents the data in a clean responsive interface with the option to generate an AI-powered project summary for any repository.

The AI summarization is powered by **Groq's free tier API** running the **Llama 3.3 70B** model — no credit card required, no paid subscription needed.

---

## Features

- **PDF Resume Parsing** — Extracts GitHub links from both hyperlink annotations and plain visible text in the PDF
- **Magic-bytes validation** — Rejects non-PDF files even if renamed with a `.pdf` extension
- **File size limit** — Enforces a 5 MB cap on uploads server-side and client-side
- **Automatic GitHub Profile Detection** — Identifies the first GitHub profile URL and fetches complete user data
- **Repository Listing** — Displays all public repositories sorted by your commit count, with name, description, language, and last commit date
- **Deep AI Project Summaries** — One-click AI summary for each repository using Groq (Llama 3.3 70B)
  - Uses README.md as the primary source when present and substantial (>120 chars)
  - Falls back to deep source-file analysis — reads up to 10 key files (manifest, entry points, source) when no README exists
  - Two purpose-built system prompts tuned for README analysis vs code analysis
  - Generates a fresh summary every time you click — no caching
  - Shows source badge (README vs Source code) on every summary
- **3-Step Progress Indicator** — Visual feedback during PDF upload, link extraction, and profile fetching
- **Skeleton Loading States** — Shimmer placeholders while data loads
- **Toast Notifications** — Centered non-intrusive popup when no GitHub links are found in the PDF
- **Fully Responsive** — Works on 320px mobile through wide desktop with fluid typography and adaptive layouts
- **Security hardened** — Input sanitisation, request timeouts, strict MIME validation, HTTP security headers

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 15 | React framework, file-based routing, API routes |
| React | 18 | UI library |
| Framer Motion | 11 | Animations and page transitions |
| Tailwind CSS | 3 | Utility-first styling |
| React Icons | 5 | Icon library (Feather icons) |
| Fira Code | — | Monospace font for step indicators and code |
| DM Sans | — | Body font for all UI text |

### Backend (API Routes)

| Technology | Version | Purpose |
|-----------|---------|---------|
| pdfjs-dist | 5 | PDF parsing — annotation and text extraction |
| formidable | 3 | Multipart file upload handling with size limits |
| marked | 13 | Markdown to HTML conversion |
| isomorphic-dompurify | 2 | HTML sanitization to prevent XSS |

### AI and External APIs

| Service | Purpose | Cost |
|---------|---------|------|
| Groq API (Llama 3.3 70B) | Repository summarization | Free — 30 req/min, 1000 req/day |
| GitHub REST API v3 | Profile and repository data | Free — 5000 req/hr with token |

---

## Project Directory Structure

```
resume-insight-ai/
│
├── .env.local                  ← your secret keys (never committed)
├── .env.local.example          ← template for .env.local
├── .gitignore
├── next.config.js              ← security headers, webpack config
├── tailwind.config.js
├── postcss.config.js
├── package.json
│
├── pages/
│   ├── _app.js                 ← fonts, viewport meta, global styles
│   ├── index.js                ← main analyzer page
│   └── api/
│       ├── extract.js          ← POST: PDF → GitHub links
│       ├── github-profile.js   ← POST: username → profile + repos
│       └── summarize.js        ← POST: repo → AI summary
│
├── lib/
│   ├── pdf/
│   │   ├── extractLinks.js     ← pdfjs annotation + text extraction
│   │   └── parseUrl.js         ← browser-safe GitHub URL parser
│   ├── github/
│   │   ├── client.js           ← GitHub REST API client (sanitised, timeout)
│   │   └── profile.js          ← builds full profile payload (batched)
│   └── ai/
│       └── summarize.js        ← Groq summarization (README + deep file analysis)
│
├── components/
│   ├── layout/
│   │   └── PageShell.jsx       ← responsive page wrapper
│   ├── ui/
│   │   ├── Spinner.jsx
│   │   ├── ErrorBanner.jsx     ← inline errors + centered toast
│   │   ├── SkeletonBlock.jsx
│   │   ├── Tag.jsx
│   │   └── StatPill.jsx
│   ├── resume/
│   │   ├── DropZone.jsx        ← drag-and-drop + touch-friendly upload
│   │   └── StepIndicator.jsx   ← 3-step animated progress
│   ├── profile/
│   │   ├── ProfileHeader.jsx   ← responsive avatar, bio, stat pills
│   │   └── ProfileSkeleton.jsx
│   └── repo/
│       ├── RepoCard.jsx        ← individual repo card
│       ├── RepoList.jsx        ← repo grid with skeleton loading
│       └── AISummarizeButton.jsx ← Groq summary button with all error states
│
├── hooks/
│   └── useResumeAnalyzer.js    ← state machine: idle→extract→fetch→ready
│
└── styles/
    └── globals.css             ← design tokens, responsive CSS variables
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** v9 or higher (included with Node.js)
- A **GitHub account** (for the personal access token)
- A **Groq account** (for the AI summarization key)

```bash
node -v   # must be v18.0.0 or higher
npm -v    # must be 9.0.0 or higher
```

---

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/resume-insight-ai.git

# Navigate into the project folder
cd resume-insight-ai

# Install all dependencies
npm install
```

---

### Environment Variables

Copy the example file and fill in your keys:

```bash
cp .env.local.example .env.local
```

Then open `.env.local` and add:

```env
# GROQ API KEY  (required — for AI Project Summary feature)
# Get your free key at: https://console.groq.com
# Steps: Sign up → API Keys → Create API Key (starts with gsk_)
GROQ_API_KEY=gsk_your_groq_api_key_here

# GITHUB TOKEN  (optional but strongly recommended)
# Without token: 60 requests/hour. With token: 5000 requests/hour.
# Get it at: https://github.com/settings/tokens
# Steps: Generate new token (classic) → no scopes needed → copy (starts with ghp_)
GITHUB_TOKEN=ghp_your_github_token_here
```

> `.env.local` is listed in `.gitignore` and will **never** be committed to Git.

---

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run start` | Start production server (run build first) |

---

## Deployment

### Render

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/resume-insight-ai.git
git branch -M main
git push -u origin main
```

2. Go to [render.com](https://render.com) → **New +** → **Web Service**
3. Connect your GitHub repository and configure:

| Field | Value |
|-------|-------|
| Name | `resume-insight-ai` |
| Region | Singapore (closest to India) |
| Branch | `main` |
| Runtime | `Node` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm run start` |
| Instance Type | Free |

4. Under **Environment Variables** add:

| Key | Value |
|-----|-------|
| `GROQ_API_KEY` | `gsk_your_key_here` |
| `GITHUB_TOKEN` | `ghp_your_token_here` |
| `NODE_ENV` | `production` |
| `PORT` | `10000` |

5. Click **Create Web Service** — live in ~5 minutes at `https://resume-insight-ai.onrender.com`

> Every `git push` to `main` triggers an automatic redeploy.

---

### Keeping the App Awake

Render's free tier sleeps after 15 minutes of inactivity (first load after idle takes 30–60 seconds). Use [UptimeRobot](https://uptimerobot.com) to keep it awake for free:

1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. **Add New Monitor** with these settings:

| Field | Value |
|-------|-------|
| Monitor Type | `HTTP(s)` |
| Friendly Name | `Resume Insight AI` |
| URL | `https://resume-insight-ai.onrender.com` |
| Monitoring Interval | `5 minutes` |

3. Click **Create Monitor**

UptimeRobot pings your app every 5 minutes — Render never sleeps.

---
