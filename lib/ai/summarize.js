import { getFileTree, getFileContent } from '../github/client';

const GROQ_URL  = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL     = 'llama-3.3-70b-versatile';
const TIMEOUT   = 30_000; 

const SOURCE_EXT = /\.(js|ts|jsx|tsx|py|java|go|rs|rb|php|cs|cpp|c|swift|kt|vue|svelte|json|yaml|yml|toml|md|txt|sh|env\.example|dockerfile|makefile|gradle|gemspec|cabal|elm|ex|exs|ml|mli|scala|clj|hs|lua|r|jl)$/i;

const HIGH_PRIORITY = [
  'package.json', 'pyproject.toml', 'Cargo.toml', 'go.mod', 'pom.xml',
  'build.gradle', 'requirements.txt', 'setup.py', 'setup.cfg', 'Gemfile',
  'composer.json', 'pubspec.yaml', 'mix.exs', 'Project.toml',
  'main.py', 'app.py', 'main.go', 'main.rs', 'main.js', 'main.ts',
  'index.js', 'index.ts', 'server.js', 'server.ts', 'app.js', 'app.ts',
  'src/main.py', 'src/app.py', 'src/main.go', 'src/main.rs',
  'src/index.js', 'src/index.ts', 'src/main.ts', 'src/App.tsx', 'src/app.jsx',
  'Dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
  '.github/workflows/main.yml', '.github/workflows/ci.yml',
];

const FILE_LIMIT       = 10;  
const FILE_CHAR_LIMIT  = 4000; 
const README_CHAR_LIMIT = 12000;

async function buildDeepFileContext(fullName, defaultBranch) {
  const tree = await getFileTree(fullName, defaultBranch ?? 'main');
  if (!tree?.tree?.length) return null;
  const allPaths = tree.tree
    .filter(f => f.type === 'blob' && SOURCE_EXT.test(f.path) && f.size < 100_000)
    .map(f => f.path);
  if (!allPaths.length) return null;
  const sorted = [
    ...HIGH_PRIORITY.filter(p => allPaths.some(ap => ap === p || ap.endsWith('/' + p))),
    ...allPaths.filter(p => !HIGH_PRIORITY.some(hp => p === hp || p.endsWith('/' + hp)))
      .sort((a, b) => {
        const depthDiff = (a.split('/').length - 1) - (b.split('/').length - 1);
        if (depthDiff !== 0) return depthDiff;
        return a.localeCompare(b);
      }),
  ].slice(0, FILE_LIMIT);

  const fileContents = await Promise.all(
    sorted.map(async fp => {
      try {
        const meta = await getFileContent(fullName, fp);
        if (!meta?.content || meta.size > 80_000) return null;
        const raw  = Buffer.from(meta.content, 'base64').toString('utf8');
        const text = raw.slice(0, FILE_CHAR_LIMIT);
        const truncated = raw.length > FILE_CHAR_LIMIT;
        return `### ${fp}${truncated ? ' (truncated)' : ''}\n\`\`\`\n${text}\n\`\`\``;
      } catch {
        return null;
      }
    })
  );

  const validContents = fileContents.filter(Boolean);
  if (!validContents.length) return null;
  const treePreview = allPaths.slice(0, 50).join('\n');
  const treeNote    = allPaths.length > 50 ? `\n... and ${allPaths.length - 50} more files` : '';

  return [
    `**Repository file tree** (${allPaths.length} source files total):`,
    '```',
    treePreview + treeNote,
    '```',
    '',
    `**Key source files** (${validContents.length} files read):`,
    '',
    ...validContents,
  ].join('\n');
}

const README_SYSTEM_PROMPT = `You are an expert technical analyst reviewing a GitHub project's README.

Write a clear, specific 4–6 sentence paragraph covering:
1. The project's core purpose and the problem it solves
2. The primary technologies, frameworks, and stack
3. Key features or capabilities that distinguish it
4. Who would use this project and in what context

Rules:
- Present tense only; no past or future tense
- Prose only — absolutely no bullet points, lists, or headings
- Do NOT repeat the repository name
- Be precise and technical — cite actual library/framework names
- Avoid vague filler phrases like "robust solution" or "powerful tool"
- If the README is sparse or uninformative, say so and summarise what you can`;

const FILES_SYSTEM_PROMPT = `You are an expert software engineer performing deep code analysis of a GitHub repository.

Analyse the provided file tree and source code, then write a clear, insightful 5–7 sentence paragraph covering:
1. What the project does — be specific about its function and purpose
2. The architectural approach (monolith, microservice, library, CLI, API, etc.)
3. The exact tech stack — framework names, languages, key dependencies from manifests
4. Notable implementation patterns, algorithms, or design decisions visible in the code
5. The likely audience or use-case this project targets

Rules:
- Present tense only
- Prose only — no bullet points, headers, or markdown formatting
- Do NOT repeat the repository name
- Ground all claims in what you actually see in the files
- If the codebase is small or experimental, say so honestly
- Be technically precise — someone reading this should be able to judge whether the project meets their needs`;

async function callGroq({ systemPrompt, userContent, repoLabel }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GROQ_API_KEY is not configured. Get a free key at https://console.groq.com and add it to .env.local as GROQ_API_KEY=gsk_...'
    );
  }
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), TIMEOUT);
  let res;
  try {
    res = await fetch(GROQ_URL, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:       MODEL,
        max_tokens:  500,
        temperature: 0.35,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: `Repository: **${repoLabel}**\n\n${userContent}` },
        ],
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('AI summarization timed out. Please try again.');
    throw err;
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    let errBody;
    try { errBody = await res.json(); } catch { errBody = {}; }

    if (res.status === 429) {
      throw new Error('Groq rate limit reached (30 req/min or 1000 req/day on free tier). Please wait and try again.');
    }
    if (res.status === 401) {
      throw new Error('GROQ_API_KEY is invalid or expired. Check your key at https://console.groq.com');
    }
    throw new Error(errBody?.error?.message || `Groq API error: ${res.status}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Groq returned an empty response. Please try again.');
  return text;
}

export async function summariseRepo({ readmeRaw, fullName, description, defaultBranch }) {
  const repoLabel = description ? `${fullName} — ${description}` : fullName;
  if (readmeRaw && readmeRaw.trim().length > 120) {
    const clipped  = readmeRaw.slice(0, README_CHAR_LIMIT);
    const truncMsg = readmeRaw.length > README_CHAR_LIMIT
      ? `\n\n[README truncated at ${README_CHAR_LIMIT} characters]`
      : '';
    const summary = await callGroq({
      systemPrompt: README_SYSTEM_PROMPT,
      userContent:  `**README.md**\n\n${clipped}${truncMsg}`,
      repoLabel,
    });
    return { summary, source: 'readme' };
  }
  const fileContext = await buildDeepFileContext(fullName, defaultBranch);
  if (!fileContext) {
    return {
      summary: 'This repository appears to be empty or contains no readable source files.',
      source:  'empty',
    };
  }
  const summary = await callGroq({
    systemPrompt: FILES_SYSTEM_PROMPT,
    userContent:  fileContext,
    repoLabel,
  });
  return { summary, source: 'files' };
}
