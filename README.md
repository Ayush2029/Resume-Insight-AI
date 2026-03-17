<div align="center">

# Resume-Insight-AI

**Upload a resume PDF → automatically extract GitHub profile → analyze every repository with AI-powered summaries**

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Live Demo](#live-demo)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
- [Project Directory Structure](#project-directory-structure)
- [File Reference](#file-reference)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [API Reference](#api-reference)
- [Design System](#design-system)
- [Deployment](#deployment)
  - [Vercel](#vercel)
  - [Railway](#railway)
  - [Render](#render)
- [Known Limitations](#known-limitations)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Resume GitHub Analyzer is a full-stack Next.js web application that bridges the gap between a candidate's resume and their actual code. It accepts a PDF resume as input, automatically finds the GitHub profile URL embedded in it (whether as a hyperlink or plain text), fetches the complete GitHub profile along with all public repositories, and presents the data in a clean interface with the option to generate an AI-powered project summary for any repository.

The AI summarization is powered by **Groq's free tier API** running the **Llama 3.3 70B** model — no credit card required, no paid subscription needed.

---

## Features

- **PDF Resume Parsing** — Extracts GitHub links from both hyperlink annotations and plain visible text in the PDF
- **Automatic GitHub Profile Detection** — Identifies the first GitHub profile URL and fetches complete user data
- **Repository Listing** — Displays all public repositories with name, description, language, and last commit date
- **AI Project Summaries** — One-click AI summary for each repository using Groq (Llama 3.3 70B)
  - Uses README.md as the primary source for summarization
  - Falls back to scanning actual source files if no README exists
  - Generates a fresh summary every time you click — no caching
- **3-Step Progress Indicator** — Visual feedback during PDF upload, link extraction, and profile fetching
- **Skeleton Loading States** — Shimmer placeholders while data loads
- **Toast Notifications** — Non-intrusive popup for "No GitHub links found" errors
- **Dark Terminal Aesthetic** — Dot-grid background, lime green accents, clean typography
- **Fully Responsive** — Works on mobile, tablet, and desktop

---

## Live Demo

> Deploy your own instance following the [Deployment](#deployment) section below.

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14 | React framework, file-based routing, API routes |
| React | 18 | UI library |
| Framer Motion | 11 | Animations and transitions |
| Tailwind CSS | 3 | Utility-first styling |
| React Icons | 5 | Icon library (Feather icons) |
| Fira Code | — | Display / monospace font |
| DM Sans | — | Body text font |

### Backend (API Routes)
| Technology | Version | Purpose |
|-----------|---------|---------|
| pdfjs-dist | 5 | PDF parsing and text/annotation extraction |
| formidable | 3 | Multipart file upload handling |
| marked | 13 | Markdown to HTML conversion |
| isomorphic-dompurify | 2 | HTML sanitization (XSS prevention) |

### AI & External APIs
| Service | Purpose | Cost |
|---------|---------|------|
| Groq API (Llama 3.3 70B) | Repository summarization | Free — 30 req/min, 1000 req/day |
| GitHub REST API v3 | Profile and repository data | Free — 5000 req/hr with token |

---

## How It Works

```
User uploads PDF resume
         │
         ▼
┌─────────────────────────────────────────┐
│  POST /api/extract                       │
│                                          │
│  formidable parses multipart upload      │
│  pdfjs-dist reads PDF annotations        │
│    → Strategy 1: hyperlink annotations   │
│    → Strategy 2: visible text scan       │
│  Returns: deduplicated github.com URLs   │
└─────────────────────┬───────────────────┘
                      │
                      ▼
         parseGithubUrl() on each link
         Find first user profile URL
         Extract username
                      │
                      ▼
┌─────────────────────────────────────────┐
│  POST /api/github-profile                │
│                                          │
│  GitHub API calls (all parallel):        │
│    getUser()          → profile fields   │
│    getUserRepos()     → repo list        │
│    per repo:                             │
│      getContributors() → commit count   │
│      getCommits()      → last commit    │
│      fetchReadmeRaw()  → readme text    │
│                                          │
│  Returns: { profile, repos[] }           │
└─────────────────────┬───────────────────┘
                      │
                      ▼
         ProfileHeader + RepoList rendered
                      │
                      ▼
         User clicks "Project Summary"
                      │
                      ▼
┌─────────────────────────────────────────┐
│  POST /api/summarize                     │
│                                          │
│  If README present (>80 chars):          │
│    → Send README to Groq                 │
│  Else:                                   │
│    → getFileTree() from GitHub           │
│    → getFileContent() for top 4 files   │
│    → Send file context to Groq           │
│                                          │
│  Groq (Llama 3.3 70B) generates summary  │
│  Returns: { summary, source }            │
└─────────────────────────────────────────┘
```

---

## Project Directory Structure

```
resume-github-analyzer/
│
├── .env.example                        ← Environment variable template
├── .env.local                          ← Your actual keys (never commit this)
├── .gitignore
├── next.config.js                      ← Next.js config + webpack canvas alias fix
├── tailwind.config.js                  ← Custom colors, fonts, animations
├── postcss.config.js
├── package.json
│
├── pages/                              ← Next.js Pages Router
│   ├── _app.js                         ← Root: font setup (Fira Code + DM Sans)
│   ├── index.js                        ← Main page: Resume Analyzer
│   └── api/                            ← Server-side API routes
│       ├── extract.js                  ← POST /api/extract
│       ├── github-profile.js           ← POST /api/github-profile
│       └── summarize.js                ← POST /api/summarize
│
├── lib/                                ← Pure logic — no React, no HTTP handlers
│   ├── pdf/
│   │   ├── extractLinks.js             ← PDF parsing (server-side, uses fs)
│   │   └── parseUrl.js                 ← URL parsing (browser-safe, no fs)
│   ├── github/
│   │   ├── client.js                   ← GitHub API fetch wrapper
│   │   └── profile.js                  ← Profile + repo data assembly
│   └── ai/
│       └── summarize.js                ← Groq API call + file-tree fallback
│
├── components/
│   ├── layout/
│   │   └── PageShell.jsx               ← Page wrapper: dot-grid bg + content area
│   ├── ui/                             ← Stateless reusable primitives
│   │   ├── Spinner.jsx                 ← Animated SVG loading ring
│   │   ├── ErrorBanner.jsx             ← Inline error + toast popup
│   │   ├── SkeletonBlock.jsx           ← Shimmer placeholder block
│   │   ├── Tag.jsx                     ← Pill badge (language, etc.)
│   │   └── StatPill.jsx                ← Icon + label + value stat tile
│   ├── resume/
│   │   ├── DropZone.jsx                ← Drag-and-drop PDF upload area
│   │   └── StepIndicator.jsx           ← 3-step animated progress bar
│   ├── profile/
│   │   ├── ProfileHeader.jsx           ← Avatar, name, bio, meta, stats
│   │   └── ProfileSkeleton.jsx         ← Shimmer placeholder for profile
│   └── repo/
│       ├── RepoCard.jsx                ← Single repo: name, desc, language, date
│       ├── RepoList.jsx                ← Section header + list of RepoCards
│       └── AISummarizeButton.jsx       ← Per-repo Groq summary button
│
├── hooks/
│   └── useResumeAnalyzer.js            ← State machine for the full pipeline
│
└── styles/
    └── globals.css                     ← CSS variables, base styles, utilities
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)
- A **GitHub account** (for the token)
- A **Google account** (for the Groq key)

Verify your Node version:
```bash
node -v   # should print v18.x.x or higher
npm -v    # should print 9.x.x or higher
```

---

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/resume-github-analyzer.git

# Navigate into the project
cd resume-github-analyzer

# Install all dependencies
npm install
```

---

### Environment Variables

Create a `.env.local` file in the project root. Then open `.env.local` and fill in your keys:

```env
# ─────────────────────────────────────────────────────────────────
# GROQ API KEY  
# Steps to get your key:
#   1. Go to https://console.groq.com
#   2. Sign up with Google or email
#   3. Navigate to API Keys → Create API Key
#   4. Copy the key (starts with gsk_)
# ─────────────────────────────────────────────────────────────────
GROQ_API_KEY=gsk_your_groq_api_key_here
# ─────────────────────────────────────────────────────────────────
# GITHUB TOKEN  
# Steps to get your token:
#   1. Go to https://github.com/settings/tokens
#   2. Click "Generate new token (classic)"
#   3. Give it any name e.g. "resume-analyzer"
#   4. DO NOT check any scopes (public data only)
#   5. Click "Generate token" and copy it 
# ─────────────────────────────────────────────────────────────────
GITHUB_TOKEN=ghp_your_github_token_here
```

> **Important:** Never commit `.env.local` to Git. It is already included in `.gitignore`.

---

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server (requires build first) |

---

## Deployment

### Render

1. Go to [render.com](https://render.com) and create a new **Web Service**
2. Connect your GitHub repository
3. Configure:
   ```
   Language:      Node
   Branch:        main
   Region:        Singapore (or closest to you)
   Build Command: npm install && npm run build
   Start Command: npm run start
   ```
4. Add environment variables under the **Environment** tab:
   ```
   GROQ_API_KEY=gsk_...
   GITHUB_TOKEN=ghp_...
   ```
5. Leave PORT as the default `10000`

> **Note:** Render's free tier spins down after 15 minutes of inactivity, causing a 30–60 second cold start for the next visitor.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with Next.js, Groq, and the GitHub API

</div>
