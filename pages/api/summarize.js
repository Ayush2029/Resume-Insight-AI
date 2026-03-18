import { summariseRepo } from '../../lib/ai/summarize';
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Only POST allowed' });
  }
  const { readmeRaw, fullName, description, defaultBranch } = req.body ?? {};
  if (!fullName || typeof fullName !== 'string') {
    return res.status(400).json({ error: '"fullName" (owner/repo) is required' });
  }
  try {
    const result = await summariseRepo({ readmeRaw, fullName, description, defaultBranch });
    return res.status(200).json(result);
  } catch (err) {
    console.error('[api/summarize]', err.message);
    const isKeyError = err.message.includes('GEMINI_API_KEY');
    return res.status(isKeyError ? 501 : 500).json({ error: err.message });
  }
}
