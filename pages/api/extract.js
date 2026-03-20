import fs         from 'fs';
import formidable from 'formidable';
import { extractGithubLinks } from '../../lib/pdf/extractLinks';
export const config = { api: { bodyParser: false } };
const MAX_FILE_SIZE = 5 * 1024 * 1024; 
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }
  let filePath = null;
  try {
    const form = formidable({
      multiples:   false,
      maxFileSize: MAX_FILE_SIZE,
      filter:      ({ mimetype }) => !!mimetype?.includes('pdf'),
    });
    let files;
    try {
      [, files] = await form.parse(req);
    } catch (parseErr) {
      if (parseErr.code === 1009 || parseErr.message?.includes('maxFileSize')) {
        return res.status(413).json({ error: 'File too large. Maximum size is 5 MB.' });
      }
      throw parseErr;
    }
    const file = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;
    if (!file) {
      return res.status(400).json({ error: 'No PDF uploaded. Make sure the field name is "pdf".' });
    }
    const mime = file.mimetype ?? '';
    if (!mime.includes('pdf')) {
      return res.status(400).json({
        error: `Invalid file type: ${mime || 'unknown'}. Only PDF files are accepted.`,
      });
    }
    filePath = file.filepath;
    const stat = fs.statSync(filePath);
    if (stat.size === 0) {
      return res.status(400).json({ error: 'The uploaded file is empty.' });
    }
    const fd  = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(4);
    fs.readSync(fd, buf, 0, 4, 0);
    fs.closeSync(fd);
    if (buf.toString('ascii') !== '%PDF') {
      return res.status(400).json({ error: 'File does not appear to be a valid PDF.' });
    }
    const links = await extractGithubLinks(filePath);
    return res.status(200).json({ links });
  } catch (err) {
    console.error('[api/extract]', err.message);
    return res.status(500).json({
      error: err.message || 'PDF extraction failed.',
    });
  } finally {
    if (filePath) {
      try { fs.unlinkSync(filePath); } catch { /* ignore */ }
    }
  }
}
