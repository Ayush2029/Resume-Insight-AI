const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GITHUB_BASE = 'https://api.github.com';

const SOURCE_EXT = /\.(js|ts|jsx|tsx|py|java|go|rs|rb|php|cs|cpp|c|swift|kt|json|yaml|yml|toml|md|txt)$/i;

const PRIORITY_FILES = [
  'package.json', 'pyproject.toml', 'Cargo.toml', 'go.mod',
  'requirements.txt', 'setup.py', 'main.py', 'app.py',
  'index.js', 'src/index.js', 'src/main.ts', 'src/App.tsx',
];

const SYSTEM_PROMPT = `You are a concise technical writer analysing GitHub repositories.
Given context about a repository, write a clear 3-5 sentence paragraph covering:
1. What the project does
2. The main technologies used
3. Any notable features

Rules: present tense, no bullet points, do not repeat the repo name, be specific.`;

/* ── GitHub helpers ─────────────────────────────────────────── */

function ghHeaders() {
  const h = { Accept: 'application/vnd.github.v3+json' };
  const token = process.env.GITHUB_TOKEN;
  if (token) h['Authorization'] = `token ${token}`;
  return h;
}

async function ghGet(path) {
  try {
    const res = await fetch(`${GITHUB_BASE}${path}`, { headers: ghHeaders() });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getFileTree(fullName, branch) {
  // Try the given branch first, then fallback to 'master' if 'main' fails
  const tree = await ghGet(`/repos/${fullName}/git/trees/${branch || 'main'}?recursive=1`);
  if (tree?.tree?.length) return tree;
  // Fallback branch
  const fallback = branch === 'main' ? 'master' : 'main';
  return ghGet(`/repos/${fullName}/git/trees/${fallback}?recursive=1`);
}

async function getFileContent(fullName, filePath) {
  return ghGet(`/repos/${fullName}/contents/${encodeURIComponent(filePath)}`);
}

/* ── Build context from source files ───────────────────────── */

async function buildFileContext(fullName, defaultBranch) {
  try {
    const tree = await getFileTree(fullName, defaultBranch || 'main');
    if (!tree?.tree?.length) return null;

    const paths = tree.tree
      .filter(f => f.type === 'blob' && SOURCE_EXT.test(f.path))
      .map(f => f.path);

    if (!paths.length) return null;

    const sorted = [
      ...paths.filter(p => PRIORITY_FILES.some(pf => p === pf || p.endsWith('/' + pf))),
      ...paths.filter(p => !PRIORITY_FILES.some(pf => p === pf || p.endsWith('/' + pf))),
    ].slice(0, 4);

    const contents = await Promise.all(
      sorted.map(async fp => {
        try {
          const meta = await getFileContent(fullName, fp);
          if (!meta?.content || meta.size > 15000) return null;
          const text = Buffer.from(meta.content, 'base64').toString('utf8');
          return `### ${fp}\n${text.slice(0, 2000)}`;
        } catch {
          return null;
        }
      })
    );

    const fileList   = `Files (${paths.length} total):\n${paths.slice(0, 20).join('\n')}`;
    const fileBlocks = contents.filter(Boolean).join('\n\n');
    return `${fileList}\n\n${fileBlocks}`;
  } catch {
    return null;
  }
}

/* ── Groq call ──────────────────────────────────────────────── */

async function callGroq(context, repoLabel) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set. Get a free key at https://console.groq.com');
  }

  const res = await fetch(GROQ_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:       GROQ_MODEL,
      max_tokens:  350,
      temperature: 0.4,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: `Repository: ${repoLabel}\n\n${context}` },
      ],
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    let msg = `Groq API error: ${res.status}`;
    try { msg = JSON.parse(errBody).error?.message || msg; } catch { /* keep default */ }
    throw new Error(msg);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Groq returned an empty response.');
  return text;
}

/* ── Handler ────────────────────────────────────────────────── */

export default async function handler(req, res) {
  // Always respond with JSON — never let Next.js return an HTML error page
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  // Manually parse body if Next.js didn't (e.g. wrong Content-Type header sent)
  let body = req.body;
  if (!body || typeof body !== 'object') {
    try {
      const raw = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end',  ()    => resolve(data));
        req.on('error', reject);
      });
      body = JSON.parse(raw);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const fullName      = (body.fullName      ?? '').trim();
  const readmeRaw     = body.readmeRaw      ?? '';
  const description   = body.description    ?? '';
  const defaultBranch = body.defaultBranch  ?? 'main';

  if (!fullName) {
    return res.status(400).json({ error: 'fullName is required' });
  }

  try {
    const repoLabel = description ? `${fullName} — ${description}` : fullName;

    /* Path 1 — README present */
    if (readmeRaw && readmeRaw.trim().length > 80) {
      const context = `README.md:\n\n${readmeRaw.slice(0, 8000)}`;
      const summary = await callGroq(context, repoLabel);
      return res.status(200).json({ summary, source: 'readme' });
    }

    /* Path 2 — scan source files */
    const fileContext = await buildFileContext(fullName, defaultBranch);
    if (!fileContext) {
      return res.status(200).json({
        summary: 'This repository appears to be empty or contains no readable source files.',
        source:  'empty',
      });
    }

    const summary = await callGroq(fileContext, repoLabel);
    return res.status(200).json({ summary, source: 'files' });

  } catch (err) {
    console.error('[api/summarize]', err.message);
    const isKeyError = err.message.includes('GROQ_API_KEY');
    return res.status(isKeyError ? 501 : 500).json({
      error: err.message || 'Summarization failed',
    });
  }
}
