/**
 * lib/pdf/parseUrl.js
 * Browser-safe GitHub URL parser — no Node.js dependencies.
 * Handles all the short formats people write in resumes:
 *
 *   https://github.com/ayush2004          ← full URL
 *   github.com/ayush2004                  ← no protocol
 *   github.com/ayush2004/my-repo          ← repo link
 *   https://github.com/ayush2004/repo.git ← .git suffix
 */

/**
 * Given any github-ish URL string, returns { username, repo } or null.
 * repo is null when the URL points to a user profile.
 */
export function parseGithubUrl(rawUrl) {
  if (!rawUrl) return null;

  let s = rawUrl.trim();

  // Strip protocol
  s = s.replace(/^https?:\/\//i, '');
  s = s.replace(/^\/\//, '');

  // Strip .git suffix and trailing slashes
  s = s.replace(/\.git$/, '').replace(/\/+$/, '');

  // Must contain github.com
  const match = s.match(/github\.com\/([A-Za-z0-9_.-]+)(?:\/([A-Za-z0-9_.-]+))?/);
  if (!match) return null;

  const username = match[1];
  const repo     = match[2] ?? null;

  // Skip the special profile-readme repo (username/username)
  if (repo && repo.toLowerCase() === username.toLowerCase()) return null;

  // Skip GitHub's own internal pages mistaken for usernames
  const RESERVED = ['features', 'enterprise', 'topics', 'collections',
                    'trending', 'marketplace', 'pricing', 'explore',
                    'login', 'join', 'about', 'contact', 'orgs'];
  if (RESERVED.includes(username.toLowerCase())) return null;

  return { username, repo };
}
