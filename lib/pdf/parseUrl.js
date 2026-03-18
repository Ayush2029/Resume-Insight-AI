export function parseGithubUrl(rawUrl) {
  if (!rawUrl) return null;
  let s = rawUrl.trim();
  s = s.replace(/^https?:\/\//i, '');
  s = s.replace(/^\/\//, '');
  s = s.replace(/\.git$/, '').replace(/\/+$/, '');
  const match = s.match(/github\.com\/([A-Za-z0-9_.-]+)(?:\/([A-Za-z0-9_.-]+))?/);
  if (!match) return null;
  const username = match[1];
  const repo     = match[2] ?? null;
  if (repo && repo.toLowerCase() === username.toLowerCase()) return null;
  const RESERVED = ['features', 'enterprise', 'topics', 'collections',
                    'trending', 'marketplace', 'pricing', 'explore',
                    'login', 'join', 'about', 'contact', 'orgs'];
  if (RESERVED.includes(username.toLowerCase())) return null;
  return { username, repo };
}
