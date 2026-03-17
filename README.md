<div align="center">

# Resume-Insight-AI

**Upload a resume PDF → automatically extract GitHub profile → analyze every repository with AI-powered summaries**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3-orange?style=flat-square)](https://console.groq.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

### [View Live Demo →](https://resume-insight-ai-ynl0.onrender.com)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Known Limitations](#known-limitations)
- [License](#license)

---

## Overview

Resume-Insight-AI is a full-stack Next.js web application that bridges the gap between a candidate's resume and their actual code. It accepts a PDF resume as input, automatically finds the GitHub profile URL embedded in it — whether as a clickable hyperlink or plain text — fetches the complete GitHub profile along with all public repositories, and presents the data in a clean interface with the option to generate an AI-powered project summary for any repository.

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
- **Toast Notifications** — Non-intrusive popup when no GitHub links are found in the PDF
- **Fully Responsive** — Works on mobile, tablet, and desktop

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14 | React framework, file-based routing, API routes |
| React | 18 | UI library |
| Framer Motion | 11 | Animations and page transitions |
| Tailwind CSS | 3 | Utility-first styling |
| React Icons | 5 | Icon library (Feather icons) |
| Fira Code | — | Monospace font for step indicators |
| DM Sans | — | Body font for all UI text |

### Backend (API Routes)

| Technology | Version | Purpose |
|-----------|---------|---------|
| pdfjs-dist | 5 | PDF parsing — annotation and text extraction |
| formidable | 3 | Multipart file upload handling |
| marked | 13 | Markdown to HTML conversion |
| isomorphic-dompurify | 2 | HTML sanitization to prevent XSS |

### AI and External APIs

| Service | Purpose | 
|---------|---------|
| Groq API (Llama 3.3 70B) | Repository summarization |
| GitHub REST API v3 | Profile and repository data |

---

## Project Directory Structure

```
resume-insight-ai/
│
├── .env.local
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
│
├── pages/
│   ├── _app.js
│   ├── index.js
│   └── api/
│       ├── extract.js
│       ├── github-profile.js
│       └── summarize.js
│
├── lib/
│   ├── pdf/
│   │   ├── extractLinks.js
│   │   └── parseUrl.js
│   ├── github/
│   │   ├── client.js
│   │   └── profile.js
│   └── ai/
│       └── summarize.js
│
├── components/
│   ├── layout/
│   │   └── PageShell.jsx
│   ├── ui/
│   │   ├── Spinner.jsx
│   │   ├── ErrorBanner.jsx
│   │   ├── SkeletonBlock.jsx
│   │   ├── Tag.jsx
│   │   └── StatPill.jsx
│   ├── resume/
│   │   ├── DropZone.jsx
│   │   └── StepIndicator.jsx
│   ├── profile/
│   │   ├── ProfileHeader.jsx
│   │   └── ProfileSkeleton.jsx
│   └── repo/
│       ├── RepoCard.jsx
│       ├── RepoList.jsx
│       └── AISummarizeButton.jsx
│
├── hooks/
│   └── useResumeAnalyzer.js
│
└── styles/
    └── globals.css
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** v9 or higher (included with Node.js)
- A **GitHub account** (for the personal access token)
- A **Google or email account** (for the Groq API key)

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

Create a `.env.local` file in the project root and add both keys:

```env
# GROQ API KEY 
# Steps: Sign up → API Keys → Create API Key (starts with gsk_)
GROQ_API_KEY=gsk_your_groq_api_key_here

# GITHUB TOKEN  
# Steps: Generate new token (classic) → no scopes needed → copy (starts with ghp_)
GITHUB_TOKEN=ghp_your_github_token_here
```

> `.env.local` is listed in `.gitignore` and will never be committed to Git.

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

1. Go to [render.com](https://render.com) and create a new **Web Service**
2. Connect your GitHub repository and set:

   | Field | Value |
   |-------|-------|
   | Language | Node |
   | Branch | main |
   | Region | Singapore (or nearest to you) |
   | Build Command | `npm install && npm run build` |
   | Start Command | `npm run start` |
   | Port | 10000 (default) |

3. Under the **Environment** tab add:
   ```
   GROQ_API_KEY= "OWN_API_KEY"
   GITHUB_TOKEN= "OWN_API_KEY"
   ```
4. Click **Create Web Service**

> Free tier spins down after 15 minutes of inactivity — first load after idle takes 30–60 seconds.

---

## Known Limitations

| Issue | Detail |
|-------|--------|
| Scanned PDFs | Image-based scanned resumes cannot be parsed — only text-based PDFs work |
| GitHub profile link required | PDF must contain `github.com/username` — repository-only links are not enough |
| GitHub rate limits | Without token: 60 req/hr. With token: 5000 req/hr |
| Groq rate limits | Free tier: 30 req/min, 1000 req/day |
| Private repositories | Only public repositories are fetched |

---
