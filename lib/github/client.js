const BASE    = 'https://api.github.com';
const TOKEN   = process.env.GITHUB_TOKEN;
const TIMEOUT = 20_000; 

if (typeof window === 'undefined' && !TOKEN) {
  console.warn('[github/client] GITHUB_TOKEN not set — unauthenticated (60 req/hr limit)');
}

function sanitiseUsername(raw) {
  if (typeof raw !== 'string') throw new TypeError('Username must be a string');
  const clean = raw.trim().replace(/^@/, '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 39);
  if (!clean || /^-/.test(clean)) throw new RangeError(`Invalid GitHub username: "${raw}"`);
  return clean;
}

function sanitiseFullName(raw) {
  if (typeof raw !== 'string') throw new TypeError('fullName must be a string');
  const parts = raw.trim().split('/');
  if (parts.length !== 2) throw new RangeError(`Invalid fullName (expected owner/repo): "${raw}"`);
  const [owner, repo] = parts;
  const cleanOwner = owner.replace(/[^A-Za-z0-9_.-]/g, '').slice(0, 100);
  const cleanRepo  = repo.replace(/[^A-Za-z0-9_.-]/g, '').slice(0, 100);
  if (!cleanOwner || !cleanRepo) throw new RangeError(`Invalid fullName: "${raw}"`);
  return `${cleanOwner}/${cleanRepo}`;
}

function sanitisePath(raw) {
  if (typeof raw !== 'string') throw new TypeError('Path must be a string');
  return raw.replace(/\0/g, '').replace(/^\/+/, '').slice(0, 500);
}

function buildHeaders() {
  const h = { Accept: 'application/vnd.github.v3+json' };
  if (TOKEN) h['Authorization'] = `token ${TOKEN}`;
  return h;
}

export async function ghFetch(endpoint) {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), TIMEOUT);
  let res;
  try {
    res = await fetch(`${BASE}${endpoint}`, {
      headers: buildHeaders(),
      signal:  controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('GitHub API request timed out.');
    throw err;
  } finally {
    clearTimeout(timer);
  }
  if (res.status === 404) return null;
  if (res.status === 403 || res.status === 429) {
    const reset = res.headers.get('X-RateLimit-Reset');
    const at    = reset ? new Date(+reset * 1000).toLocaleTimeString() : 'soon';
    throw new Error(`GitHub rate limit exceeded — resets at ${at}.`);
  }
  if (res.status >= 500) {
    throw new Error(`GitHub server error (${res.status}). Please try again.`);
  }
  if (!res.ok) {
    console.error(`[ghFetch] ${res.status} ${endpoint}`);
    return null;
  }
  return res.json();
}

export const getUser = (username) =>
  ghFetch(`/users/${encodeURIComponent(sanitiseUsername(username))}`);
export const getUserRepos = (username) =>
  ghFetch(`/users/${encodeURIComponent(sanitiseUsername(username))}/repos?type=all&sort=updated&per_page=100`);
export const getSocials = (username) =>
  ghFetch(`/users/${encodeURIComponent(sanitiseUsername(username))}/social_accounts`);
export const getContributors = (fullName) =>
  ghFetch(`/repos/${sanitiseFullName(fullName)}/contributors?per_page=100`);
export const getCommits = (fullName) =>
  ghFetch(`/repos/${sanitiseFullName(fullName)}/commits?per_page=1`);
export const getReadmeMeta = (fullName) =>
  ghFetch(`/repos/${sanitiseFullName(fullName)}/readme`);
export const getFileTree = (fullName, branch) =>
  ghFetch(`/repos/${sanitiseFullName(fullName)}/git/trees/${encodeURIComponent(branch)}?recursive=1`);
export const getFileContent = (fullName, path) =>
  ghFetch(`/repos/${sanitiseFullName(fullName)}/contents/${encodeURIComponent(sanitisePath(path))}`);

export async function fetchReadmeRaw(fullName) {
  const meta = await getReadmeMeta(fullName);
  if (!meta?.content) return null;
  try {
    return Buffer.from(meta.content, 'base64').toString('utf8');
  } catch {
    return null;
  }
}
