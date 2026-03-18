/**
 * lib/pdf/parseUrl.js
 * Browser-safe GitHub URL parser — no Node.js dependencies.
 *
 * Handles all the short formats people write in resumes:
 *   https://github.com/user              ← full URL
 *   github.com/user                      ← no protocol
 *   github.com/user/my-repo              ← repo link
 *   https://github.com/user/repo.git     ← .git suffix
 */

// GitHub reserved paths that are not usernames
const RESERVED = new Set([
  'features', 'enterprise', 'topics', 'collections', 'trending',
  'marketplace', 'pricing', 'explore', 'login', 'join', 'about',
  'contact', 'orgs', 'sponsors', 'settings', 'notifications',
  'new', 'issues', 'pulls', 'gist', 'apps', 'blog',
]);

/**
 * @param {string} rawUrl
 * @returns {{ username: string, repo: string | null } | null}
 */
export function parseGithubUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  let s = rawUrl.trim().slice(0, 300); // cap length

  // Strip protocol
  s = s.replace(/^https?:\/\//i, '').replace(/^\/\//, '');

  // Strip .git suffix and trailing slashes
  s = s.replace(/\.git$/, '').replace(/\/+$/, '');

  const match = s.match(/github\.com\/([A-Za-z0-9][A-Za-z0-9-]{0,38})(?:\/([A-Za-z0-9._-]{1,100}))?/);
  if (!match) return null;

  const username = match[1];
  const repo     = match[2] ?? null;

  // Skip profile-readme repo (username/username)
  if (repo && repo.toLowerCase() === username.toLowerCase()) return null;

  if (RESERVED.has(username.toLowerCase())) return null;

  return { username, repo };
}
