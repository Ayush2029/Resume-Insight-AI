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

## File Reference

### `pages/`

#### `pages/_app.js`
Root application wrapper. Loads **Fira Code** (display/mono font) and **DM Sans** (body font) from Google Fonts via `next/font`. Injects both as CSS variables (`--font-display`, `--font-body`, `--font-mono`) available globally.

#### `pages/index.js`
The single page of the application. Renders the hero section, upload card with step indicator, and results. Delegates all async logic to `useResumeAnalyzer`. Stateless from a business logic perspective — it only maps state to UI.

#### `pages/api/extract.js`
```
POST /api/extract
Content-Type: multipart/form-data
Field: pdf (file)

Response: { links: string[] }
```
Accepts a PDF file upload via `formidable`, passes the temp file path to `lib/pdf/extractLinks.js`, returns deduplicated GitHub URLs, and always cleans up the temp file in a `finally` block (even on error).

#### `pages/api/github-profile.js`
```
POST /api/github-profile
Content-Type: application/json
Body: { username: string }

Response: { profile: ProfileShape, repos: RepoShape[] }
```
Thin route that validates input, calls `lib/github/profile.buildProfilePayload()`, and handles rate-limit errors with a `429` status code.

#### `pages/api/summarize.js`
```
POST /api/summarize
Content-Type: application/json
Body: {
  readmeRaw?: string,
  fullName: string,
  description?: string,
  defaultBranch?: string
}

Response: { summary: string, source: 'readme' | 'files' | 'empty' }
```
Calls `lib/ai/summarize.summariseRepo()`. Returns a `501` status with a helpful message if `GROQ_API_KEY` is not configured.

---

### `lib/`

#### `lib/pdf/extractLinks.js` ⚠️ Server-only
Uses Node.js `fs` module — **cannot be imported in browser code**. Implements two extraction strategies:

- **Strategy 1 — Annotation links:** Reads PDF hyperlink annotations (`ann.url` and `ann.unsafeUrl`). Catches properly hyperlinked GitHub URLs.
- **Strategy 2 — Text scan:** Reads all visible text on every page using `getTextContent()` and applies a regex to find patterns like `github.com/username`, `GitHub: username`, `GitHub - username`.

Both strategies run in parallel via `Promise.all`. Results are deduplicated case-insensitively.

#### `lib/pdf/parseUrl.js` ✅ Browser-safe
Used by `useResumeAnalyzer.js` (runs in the browser). Parses any GitHub-ish URL string into `{ username, repo }`. Handles all common resume formats:
- `https://github.com/username`
- `github.com/username`
- `github.com/username/repo.git`

Filters out GitHub's reserved paths (`/features`, `/pricing`, `/login`, etc.).

#### `lib/github/client.js`
Single source of truth for all GitHub REST API calls. All functions share one authenticated `fetch` wrapper that:
- Returns `null` on 404
- Throws a descriptive error on 403/429 with the rate-limit reset time
- Logs and returns `null` on other errors

Exports typed helper functions: `getUser`, `getUserRepos`, `getSocials`, `getContributors`, `getCommits`, `getReadmeMeta`, `getFileTree`, `getFileContent`, `fetchReadmeRaw`.

#### `lib/github/profile.js`
Assembles the complete profile payload. Fetches user data and all repos in parallel. For each repo, runs `getContributors`, `getCommits`, and `fetchReadmeRaw` concurrently. Sorts repos by user commit count descending, then by stars.

#### `lib/ai/summarize.js`
Calls Groq API with `llama-3.3-70b-versatile`. Two-path logic:
1. If `readmeRaw` is present and longer than 80 characters → summarize from README
2. Otherwise → call `getFileTree()`, select up to 4 priority source files (`package.json`, entry points, etc.), fetch their content, and summarize from file context

Temperature is set to `0.4` for focused, technical responses. Max tokens: 350.

---

### `components/`

#### `components/layout/PageShell.jsx`
Wraps every page. Provides:
- Fixed dot-grid background texture
- Radial lime glow at top center
- Max-width content container (760px)
- No navigation bar (single page app)

#### `components/ui/ErrorBanner.jsx`
Smart error display with two behaviors:
- **"No GitHub links found" errors** → floating centered toast that auto-dismisses after 4 seconds
- **All other errors** → inline red banner below the dropzone

#### `components/resume/DropZone.jsx`
Self-contained drag-and-drop file uploader. Manages its own `dragging` and `fileName` state. Parent only receives `onFile(File)` callback. Shows a loading overlay with spinner while `loading={true}`.

#### `components/resume/StepIndicator.jsx`
Three-step progress indicator (Upload PDF → Extract Links → Fetch Profile). Each step can be in state: inactive, active (spinning loader icon), or done (checkmark). Connector lines animate from 0% to 100% width when a step completes.

#### `components/profile/ProfileHeader.jsx`
Displays avatar, name, bio, meta information (company, join date, Twitter, blog, social links), and three stat pills (repositories, followers, following). No terminal chrome — clean card layout.

#### `components/repo/RepoCard.jsx`
Displays: repo name (links to GitHub), description (2-line clamp), language tag, last commit date, and the AI summary button. Removed: stars, forks, commit count, external link icon, README badge.

#### `components/repo/AISummarizeButton.jsx`
Calls `/api/summarize` fresh on every click — no caching, no toggle. Shows:
- `Project Summary` when idle
- `Generating...` with spinner while loading
- `Regenerate Summary` after first result
- Result text fades in below the button
- Helpful setup instructions if `GROQ_API_KEY` is missing

---

### `hooks/`

#### `hooks/useResumeAnalyzer.js`
Custom React hook that owns the entire async pipeline. State machine with statuses: `idle → extracting → fetching → ready | error`. Exposes `{ status, step, error, data, submit, reset }` to the page component. Each `fetch()` call has its own try/catch to produce specific error messages at each failure point.

---

### `styles/`

#### `styles/globals.css`
All design tokens live here as CSS variables. Components reference variables, never hardcoded hex values. Defines utility classes: `.card`, `.card-inner`, `.btn-lime`, `.btn-ghost`, `.skeleton`. Also defines the shimmer animation keyframe and custom scrollbar styles.

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
