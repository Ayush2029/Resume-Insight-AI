/**
 * lib/ai/summarize.js
 *
 * Uses Groq (llama-3.3-70b-versatile) to summarise GitHub repos.
 * Free tier: 30 requests/min, 1000 requests/day, no credit card.
 * Get your key: https://console.groq.com
 *
 * Primary source : README.md  (if present and >80 chars)
 * Fallback source: key source files from the repo file tree
 */

import { getFileTree, getFileContent } from '../github/client';

/* ── Constants ──────────────────────────────────────────────── */

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL    = 'llama-3.3-70b-versatile'; // free tier model

const SOURCE_EXT = /\.(js|ts|jsx|tsx|py|java|go|rs|rb|php|cs|cpp|c|swift|kt|json|yaml|yml|toml|md|txt)$/i;

const PRIORITY = [
  'package.json', 'pyproject.toml', 'Cargo.toml', 'go.mod',
  'requirements.txt', 'setup.py', 'main.py', 'app.py',
  'index.js', 'src/index.js', 'src/main.ts', 'src/App.tsx', 'src/main.rs',
];

/* ── File-tree fallback ─────────────────────────────────────── */

async function buildFileContext(fullName, defaultBranch) {
  const tree = await getFileTree(fullName, defaultBranch ?? 'main');
  if (!tree?.tree?.length) return null;

  const paths = tree.tree
    .filter(f => f.type === 'blob' && SOURCE_EXT.test(f.path))
    .map(f => f.path);

  if (!paths.length) return null;

  const sorted = [
    ...paths.filter(p => PRIORITY.some(pf => p === pf || p.endsWith('/' + pf))),
    ...paths.filter(p => !PRIORITY.some(pf => p === pf || p.endsWith('/' + pf))),
  ].slice(0, 4);

  const contents = await Promise.all(
    sorted.map(async fp => {
      const meta = await getFileContent(fullName, fp);
      if (!meta?.content || meta.size > 15_000) return null;
      const text = Buffer.from(meta.content, 'base64').toString('utf8');
      return `### ${fp}\n\`\`\`\n${text.slice(0, 3000)}\n\`\`\``;
    })
  );

  const treeSection = `**File tree** (${paths.length} source files):\n${paths.slice(0, 30).join('\n')}`;
  const codeSection = contents.filter(Boolean).join('\n\n');

  return `${treeSection}\n\n${codeSection}`;
}

/* ── Groq call ──────────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are a concise technical writer analysing GitHub repositories.
Given context (README or source files), write a clear 3-5 sentence paragraph that covers:
1. What the project does (its purpose)
2. The main technologies or stack used
3. Any notable features or use-cases

Rules:
- Present tense only
- No bullet points — prose only
- Do NOT repeat the repository name
- Be specific and technical, not generic
- If the context is too sparse, say so briefly`;

async function callGroq(context, repoLabel) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GROQ_API_KEY is not set. Get a free key at https://console.groq.com and add it to .env.local'
    );
  }

  const res = await fetch(GROQ_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:       MODEL,
      max_tokens:  350,
      temperature: 0.4,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: `Repository: **${repoLabel}**\n\n${context}` },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Groq API error: ${res.status}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Groq returned an empty response.');
  return text;
}

/* ── Public entry point ─────────────────────────────────────── */

/**
 * @param {{
 *   readmeRaw?:     string,
 *   fullName:       string,
 *   description?:   string,
 *   defaultBranch?: string,
 * }} opts
 * @returns {Promise<{ summary: string, source: 'readme' | 'files' | 'empty' }>}
 */
export async function summariseRepo({ readmeRaw, fullName, description, defaultBranch }) {
  const repoLabel = description ? `${fullName} — ${description}` : fullName;

  /* 1 — README available and non-trivial */
  if (readmeRaw && readmeRaw.trim().length > 80) {
    const context = `**README.md**\n\n${readmeRaw.slice(0, 8000)}`;
    const summary = await callGroq(context, repoLabel);
    return { summary, source: 'readme' };
  }

  /* 2 — Fallback: scan source files */
  const fileContext = await buildFileContext(fullName, defaultBranch);
  if (!fileContext) {
    return {
      summary: 'This repository appears to be empty or contains no readable source files.',
      source:  'empty',
    };
  }

  const summary = await callGroq(fileContext, repoLabel);
  return { summary, source: 'files' };
}

