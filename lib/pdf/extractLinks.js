import fs   from 'fs';
import path from 'path';
function normaliseGithubUrl(raw) {
  if (!raw) return null;
  let s = raw.trim();
  s = s.replace(/^github\s*[:\-–—]\s*/i, '');
  s = s.replace(/^https?:\/\//i, '');
  s = s.replace(/^\/\//, '');
  if (!s.toLowerCase().includes('github.com')) return null;
  s = s.split(/[\s,<>'"]/)[0];
  s = s.replace(/[.,;:!?)]+$/, '');
  s = s.replace(/\.git$/, '').replace(/\/+$/, '');
  if (!/github\.com\/[A-Za-z0-9_.-]+/.test(s)) return null;
  return `https://${s}`;
}

async function extractFromAnnotations(pdf) {
  const found = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page        = await pdf.getPage(p);
    const annotations = await page.getAnnotations();
    for (const ann of annotations) {
      if (ann.subtype !== 'Link') continue;
      const candidates = [ann.url, ann.unsafeUrl].filter(Boolean);
      for (const c of candidates) {
        if (c.toLowerCase().includes('github')) {
          const norm = normaliseGithubUrl(c);
          if (norm) found.push(norm);
        }
      }
    }
  }
  return found;
}

const GITHUB_TEXT_RE = /(?:github\.com\/([A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)?)|github\s*[:\-–—]\s*([A-Za-z0-9_.-]+))/gi;

async function extractFromText(pdf) {
  const found = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page    = await pdf.getPage(p);
    const content = await page.getTextContent();
    const text = content.items.map(i => i.str ?? '').join(' ');
    let match;
    GITHUB_TEXT_RE.lastIndex = 0;
    while ((match = GITHUB_TEXT_RE.exec(text)) !== null) {
      if (match[1]) {
        const norm = normaliseGithubUrl(`github.com/${match[1]}`);
        if (norm) found.push(norm);
      } else if (match[2]) {
        const username = match[2].trim();
        if (username.length >= 1 && username.length <= 39) {
          found.push(`https://github.com/${username}`);
        }
      }
    }
  }
  return found;
}

export async function extractGithubLinks(filePath) {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const standardFontsPath = path.join(
    process.cwd(),
    'node_modules/pdfjs-dist/standard_fonts/'
  );
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf  = await pdfjsLib.getDocument({
    data,
    standardFontDataUrl: standardFontsPath,
  }).promise;
  const [fromAnnotations, fromText] = await Promise.all([
    extractFromAnnotations(pdf),
    extractFromText(pdf),
  ]);
  const all = [...fromAnnotations, ...fromText];
  const seen = new Set();
  const deduped = [];
  for (const url of all) {
    const key = url.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(url);
    }
  }
  return deduped;
}
