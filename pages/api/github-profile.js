/**
 * POST /api/github-profile
 * Accepts a GitHub username, returns profile + full repo list with commit stats.
 *
 * Body: { username: string }
 * Returns: { profile: ProfileShape, repos: RepoShape[] }
 */

import { buildProfilePayload } from '../../lib/github/profile';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { username } = req.body ?? {};
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: '"username" is required' });
  }

  const clean = username.trim().replace(/^@/, '');

  try {
    const payload = await buildProfilePayload(clean);

    if (!payload) {
      return res.status(404).json({ error: `GitHub user "${clean}" not found` });
    }

    return res.status(200).json(payload);

  } catch (err) {
    console.error('[api/github-profile]', err.message);
    const isRateLimit = err.message.includes('rate limit');
    return res.status(isRateLimit ? 429 : 500).json({ error: err.message });
  }
}
