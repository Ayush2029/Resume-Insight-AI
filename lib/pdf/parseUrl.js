const RESERVED = new Set([
  'features', 'enterprise', 'topics', 'collections', 'trending',
  'marketplace', 'pricing', 'explore', 'login', 'join', 'about',
  'contact', 'orgs', 'sponsors', 'settings', 'notifications',
  'new', 'issues', 'pulls', 'gist', 'apps', 'blog',
]);

export function parseGithubUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  let s = rawUrl.trim().slice(0, 300); 
  s = s.replace(/^https?:\/\//i, '').replace(/^\/\//, '');
  s = s.replace(/\.git$/, '').replace(/\/+$/, '');
  const match = s.match(/github\.com\/([A-Za-z0-9][A-Za-z0-9-]{0,38})(?:\/([A-Za-z0-9._-]{1,100}))?/);
  if (!match) return null;
  const username = match[1];
  const repo     = match[2] ?? null;
  if (repo && repo.toLowerCase() === username.toLowerCase()) return null;
  if (RESERVED.has(username.toLowerCase())) return null;
  return { username, repo };
}
