/**
 * POST /api/github-profile
 * Accepts a GitHub username and returns profile + full repo list.
 *
 * Body:    { username: string }
 * Returns: { profile: ProfileShape, repos: RepoShape[] }
 */

import { buildProfilePayload } from '../../lib/github/profile';

// GitHub username rules: 1-39 chars, alphanumeric + hyphens, no leading hyphen
const USERNAME_RE = /^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/;

// Extend Next.js API route timeout to 60 s (default is 30 s)
export const config = {
  api: {
    responseLimit: false,
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { username } = req.body ?? {};

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: '"username" is required and must be a string.' });
  }

  const clean = username.trim().replace(/^@/, '');

  if (!USERNAME_RE.test(clean)) {
    return res.status(400).json({
      error: `Invalid GitHub username format: "${clean}". Usernames must be 1-39 characters and contain only letters, numbers, or hyphens.`,
    });
  }

  try {
    const payload = await buildProfilePayload(clean);

    if (!payload) {
      return res.status(404).json({ error: `GitHub user "${clean}" not found.` });
    }

    return res.status(200).json(payload);

  } catch (err) {
    console.error('[api/github-profile]', err.message);

    if (err.message.includes('rate limit')) {
      return res.status(429).json({ error: err.message });
    }
    if (err.message.includes('timed out')) {
      return res.status(504).json({ error: err.message });
    }
    if (err.message.includes('Invalid GitHub username')) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
}
