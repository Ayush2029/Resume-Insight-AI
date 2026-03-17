/**
 * lib/github/client.js
 * Single source of truth for all GitHub REST API calls.
 * All functions return null on 404, throw on 403/429, return null on other errors.
 */

const BASE = 'https://api.github.com';
const TOKEN = process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.warn('[github/client] GITHUB_TOKEN not set — unauthenticated (60 req/hr limit)');
}

function headers() {
  const h = { Accept: 'application/vnd.github.v3+json' };
  if (TOKEN) h['Authorization'] = `token ${TOKEN}`;
  return h;
}

export async function ghFetch(endpoint) {
  const res = await fetch(`${BASE}${endpoint}`, { headers: headers() });

  if (res.status === 404) return null;

  if (res.status === 403 || res.status === 429) {
    const reset = res.headers.get('X-RateLimit-Reset');
    const at = reset ? new Date(+reset * 1000).toLocaleTimeString() : 'soon';
    throw new Error(`GitHub rate limit exceeded — resets at ${at}.`);
  }

  if (!res.ok) {
    console.error(`[ghFetch] ${res.status} ${endpoint}`);
    return null;
  }

  return res.json();
}

/* ── Typed helpers ────────────────────────────────────────── */

export const getUser        = (username)      => ghFetch(`/users/${username}`);
export const getUserRepos   = (username)      => ghFetch(`/users/${username}/repos?type=all&sort=updated&per_page=100`);
export const getSocials     = (username)      => ghFetch(`/users/${username}/social_accounts`);
export const getContributors= (fullName)      => ghFetch(`/repos/${fullName}/contributors?per_page=100`);
export const getCommits     = (fullName)      => ghFetch(`/repos/${fullName}/commits?per_page=1`);
export const getReadmeMeta  = (fullName)      => ghFetch(`/repos/${fullName}/readme`);
export const getRepo        = (owner, repo)   => ghFetch(`/repos/${owner}/${repo}`);
export const getFileTree    = (fullName, branch) =>
  ghFetch(`/repos/${fullName}/git/trees/${branch}?recursive=1`);
export const getFileContent = (fullName, path) =>
  ghFetch(`/repos/${fullName}/contents/${encodeURIComponent(path)}`);

/* ── README helper ────────────────────────────────────────── */

export async function fetchReadmeRaw(fullName) {
  const meta = await getReadmeMeta(fullName);
  if (!meta?.content) return null;
  try {
    return Buffer.from(meta.content, 'base64').toString('utf8');
  } catch {
    return null;
  }
}
