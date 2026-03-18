import fs         from 'fs';
import formidable from 'formidable';
import { extractGithubLinks } from '../../lib/pdf/extractLinks';
export const config = { api: { bodyParser: false } };
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Only POST allowed' });
  }
  let filePath = null;
  try {
    const form = formidable({ multiples: false });
    const [, files] = await form.parse(req);
    const file = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;
    if (!file) {
      return res.status(400).json({ error: 'No PDF uploaded. Make sure the field name is "pdf".' });
    }
    if (file.mimetype && !file.mimetype.includes('pdf')) {
      return res.status(400).json({ error: `Invalid file type: ${file.mimetype}. Only PDF files are accepted.` });
    }
    filePath = file.filepath;
    const stat = fs.statSync(filePath);
    if (stat.size === 0) {
      return res.status(400).json({ error: 'The uploaded file is empty.' });
    }
    const links = await extractGithubLinks(filePath);
    return res.status(200).json({ links });
  } catch (err) {
    console.error('[api/extract] Error:', err);
    return res.status(500).json({
      error: err.message || 'PDF extraction failed',
      detail: err.stack?.split('\n')[1]?.trim() || null,
    });
  } finally {
    if (filePath) {
      try { fs.unlinkSync(filePath); } catch { /* ignore */ }
    }
  }
}
