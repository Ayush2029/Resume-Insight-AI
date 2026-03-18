/**
 * POST /api/summarize
 *
 * Summarises a GitHub repository using Groq (llama-3.3-70b-versatile).
 * Primary source: README.md (if present and >120 chars).
 * Fallback:       Deep source-file analysis (up to 10 key files).
 *
 * Body:    { readmeRaw?: string, fullName: string, description?: string, defaultBranch?: string }
 * Returns: { summary: string, source: 'readme' | 'files' | 'empty' }
 *
 * Required env var: GROQ_API_KEY
 * Free key:         https://console.groq.com
 */

import { summariseRepo } from '../../lib/ai/summarize';

// fullName must match owner/repo pattern
const FULLNAME_RE = /^[A-Za-z0-9._-]{1,100}\/[A-Za-z0-9._-]{1,100}$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { readmeRaw, fullName, description, defaultBranch } = req.body ?? {};

  if (!fullName || typeof fullName !== 'string') {
    return res.status(400).json({ error: '"fullName" (owner/repo) is required.' });
  }

  if (!FULLNAME_RE.test(fullName.trim())) {
    return res.status(400).json({ error: `Invalid fullName format: "${fullName}". Expected "owner/repo".` });
  }

  // Sanitise optional string inputs
  const safeReadme  = typeof readmeRaw   === 'string' ? readmeRaw.slice(0, 50_000) : undefined;
  const safeDesc    = typeof description === 'string' ? description.slice(0, 500)  : undefined;
  const safeBranch  = typeof defaultBranch === 'string'
    ? defaultBranch.replace(/[^A-Za-z0-9._\-/]/g, '').slice(0, 200)
    : 'main';

  try {
    const result = await summariseRepo({
      readmeRaw:     safeReadme,
      fullName:      fullName.trim(),
      description:   safeDesc,
      defaultBranch: safeBranch,
    });
    return res.status(200).json(result);

  } catch (err) {
    console.error('[api/summarize]', err.message);

    // Surface specific errors with appropriate HTTP codes
    if (err.message.includes('GROQ_API_KEY')) {
      return res.status(501).json({ error: err.message });
    }
    if (err.message.includes('rate limit') || err.message.includes('Rate limit')) {
      return res.status(429).json({ error: err.message });
    }
    if (err.message.includes('invalid') || err.message.includes('Invalid')) {
      return res.status(401).json({ error: err.message });
    }
    if (err.message.includes('timed out')) {
      return res.status(504).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
}
