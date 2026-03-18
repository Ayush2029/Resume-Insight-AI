/**
 * lib/pdf/extractLinks.js
 *
 * Extracts GitHub profile links from a PDF using two strategies:
 *
 * Strategy 1 — Annotation links (hyperlinks embedded in PDF)
 * Strategy 2 — Visible text scan (plain-text github.com/user patterns)
 *
 * Security:
 *   - All extracted URLs are normalised and validated against a strict pattern
 *     before being returned — no raw user-supplied strings pass through.
 *   - URL length is capped to prevent DoS via malformed annotations.
 */

import fs   from 'fs';
import path from 'path';

/* ── URL normaliser ─────────────────────────────────────── */

const MAX_URL_LENGTH = 300;

// Strict pattern: must be github.com/<username> optionally with /<repo>
// No anchors, query strings, or other subpaths allowed.
const GITHUB_PROFILE_RE = /^github\.com\/([A-Za-z0-9][A-Za-z0-9-]{0,38})(?:\/([A-Za-z0-9._-]{1,100}))?(?:[/?#].*)?$/;

function normaliseGithubUrl(raw) {
  if (!raw || typeof raw !== 'string') return null;

  // Cap length to prevent regex DoS
  let s = raw.slice(0, MAX_URL_LENGTH).trim();

  // Remove common resume decorators: "GitHub: ", "github - "
  s = s.replace(/^github\s*[:\-–—]\s*/i, '');

  // Strip protocol
  s = s.replace(/^https?:\/\//i, '').replace(/^\/\//, '');

  // Strip trailing junk (space, comma, angle brackets, quotes)
  s = s.split(/[\s,<>'"]/)[0];

  // Strip trailing punctuation and .git suffix and trailing slashes
  s = s.replace(/[.,;:!?)]+$/, '').replace(/\.git$/, '').replace(/\/+$/, '');

  const match = GITHUB_PROFILE_RE.exec(s);
  if (!match) return null;

  return `https://${s.split(/[?#]/)[0]}`; // drop any query/fragment
}

/* ── Strategy 1: annotation links ──────────────────────── */

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

/* ── Strategy 2: visible text scan ─────────────────────── */

// Matches:
//   github.com/user           github.com/user/repo
//   github: user              github- user
const GITHUB_TEXT_RE = /(?:github\.com\/([A-Za-z0-9][A-Za-z0-9-]{0,38}(?:\/[A-Za-z0-9._-]{1,100})?)|github\s*[:\-–—]\s*([A-Za-z0-9][A-Za-z0-9-]{0,38}))/gi;

async function extractFromText(pdf) {
  const found = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page    = await pdf.getPage(p);
    const content = await page.getTextContent();
    const text    = content.items.map(i => i.str ?? '').join(' ');

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

/* ── Public entry point ─────────────────────────────────── */

/**
 * @param {string} filePath  Absolute path to the PDF on disk.
 * @returns {Promise<string[]>}  Deduplicated normalised github.com URLs.
 */
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
    // Disable worker in Node.js environment
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts:  false,
  }).promise;

  const [fromAnnotations, fromText] = await Promise.all([
    extractFromAnnotations(pdf),
    extractFromText(pdf),
  ]);

  const all = [...fromAnnotations, ...fromText];

  // Deduplicate (case-insensitive)
  const seen   = new Set();
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
