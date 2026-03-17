/**
 * lib/pdf/extractLinks.js
 *
 * Extracts GitHub profile links from a PDF using TWO strategies:
 *
 * Strategy 1 — Annotation links (hyperlinks embedded in PDF)
 *   Catches:  https://github.com/user  and  github.com/user (as clickable links)
 *
 * Strategy 2 — Visible text scan (fallback)
 *   Catches:  plain text like "github.com/user" or "github: ayush2004"
 *   that was never made into a hyperlink in the PDF editor.
 *
 * Runs server-side only (Node.js).
 */

import fs   from 'fs';
import path from 'path';

/* ── Normalise any github-ish string into a full URL ────────── */

/**
 * Takes a raw string found in a PDF (annotation URL or text snippet)
 * and normalises it to a full https://github.com/... URL.
 * Returns null if it cannot be reliably identified as a GitHub URL.
 */
function normaliseGithubUrl(raw) {
  if (!raw) return null;

  let s = raw.trim();

  // Remove common resume decorators people write around URLs
  // e.g.  "GitHub: github.com/user"  or  "github - ayush2004"
  s = s.replace(/^github\s*[:\-–—]\s*/i, '');

  // Strip leading protocol noise
  s = s.replace(/^https?:\/\//i, '');
  s = s.replace(/^\/\//, '');

  // Must contain github.com at this point
  if (!s.toLowerCase().includes('github.com')) return null;

  // Strip everything after a space, comma, or angle-bracket (end of token)
  s = s.split(/[\s,<>'"]/)[0];

  // Strip trailing punctuation that might come from sentence context
  s = s.replace(/[.,;:!?)]+$/, '');

  // Strip .git suffix and trailing slashes
  s = s.replace(/\.git$/, '').replace(/\/+$/, '');

  // Must now match github.com/<username> at minimum
  if (!/github\.com\/[A-Za-z0-9_.-]+/.test(s)) return null;

  return `https://${s}`;
}

/* ── Strategy 1: annotation links ──────────────────────────── */

async function extractFromAnnotations(pdf) {
  const found = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page        = await pdf.getPage(p);
    const annotations = await page.getAnnotations();
    for (const ann of annotations) {
      if (ann.subtype !== 'Link') continue;
      // Check both ann.url (resolved) and ann.unsafeUrl (raw as typed)
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

/* ── Strategy 2: visible text scan ─────────────────────────── */

// Matches patterns like:
//   github.com/ayush2004
//   github.com/ayush2004/repo
//   GitHub: ayush2004          ← bare username after "github:"
const GITHUB_TEXT_RE = /(?:github\.com\/([A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)?)|github\s*[:\-–—]\s*([A-Za-z0-9_.-]+))/gi;

async function extractFromText(pdf) {
  const found = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page    = await pdf.getPage(p);
    const content = await page.getTextContent();

    // Join all text items on the page into one string
    const text = content.items.map(i => i.str ?? '').join(' ');

    let match;
    GITHUB_TEXT_RE.lastIndex = 0;
    while ((match = GITHUB_TEXT_RE.exec(text)) !== null) {
      if (match[1]) {
        // Matched github.com/user or github.com/user/repo
        const norm = normaliseGithubUrl(`github.com/${match[1]}`);
        if (norm) found.push(norm);
      } else if (match[2]) {
        // Matched "github: username" — treat as profile link
        const username = match[2].trim();
        if (username.length >= 1 && username.length <= 39) {
          found.push(`https://github.com/${username}`);
        }
      }
    }
  }
  return found;
}

/* ── Public entry point ─────────────────────────────────────── */

/**
 * @param {string} filePath  Absolute path to the PDF on disk.
 * @returns {Promise<string[]>}  Deduplicated array of normalised github.com URLs.
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
  }).promise;

  // Run both strategies
  const [fromAnnotations, fromText] = await Promise.all([
    extractFromAnnotations(pdf),
    extractFromText(pdf),
  ]);

  const all = [...fromAnnotations, ...fromText];

  // Deduplicate (case-insensitive on the path part)
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