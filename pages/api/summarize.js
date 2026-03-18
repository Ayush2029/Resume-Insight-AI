/**
 * POST /api/summarize
 * Summarises a GitHub repo using Groq (llama-3.3-70b-versatile).
 *
 * Body:    { readmeRaw?: string, fullName: string, description?: string, defaultBranch?: string }
 * Returns: { summary: string, source: 'readme' | 'files' | 'empty' }
 */

import { summariseRepo } from '../../lib/ai/summarize';

export default async function handler(req, res) {
  // Always respond with JSON — never let Next.js return an HTML error page
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  // Safely parse body — req.body can be undefined if Content-Type is wrong
  const body = req.body ?? {};
  const { readmeRaw, fullName, description, defaultBranch } = body;

  if (!fullName || typeof fullName !== 'string') {
    return res.status(400).json({ error: '"fullName" (owner/repo) is required' });
  }

  try {
    const result = await summariseRepo({
      readmeRaw:     readmeRaw     ?? '',
      fullName,
      description:   description  ?? '',
      defaultBranch: defaultBranch ?? 'main',
    });
    return res.status(200).json(result);

  } catch (err) {
    console.error('[api/summarize]', err.message);

    const isKeyError = err.message.includes('GROQ_API_KEY');
    return res.status(isKeyError ? 501 : 500).json({
      error: err.message || 'Summarization failed',
    });
  }
}
