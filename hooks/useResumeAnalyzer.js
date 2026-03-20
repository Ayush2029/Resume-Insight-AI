import { useState, useCallback, useRef, useEffect } from 'react';
import { parseGithubUrl } from '../lib/pdf/parseUrl';
const MAX_FILE_SIZE = 5 * 1024 * 1024; 
export default function useResumeAnalyzer() {
  const [status, setStatus] = useState('idle');   
  const [error,  setError]  = useState('');
  const [data,   setData]   = useState(null);     
  const abortRef = useRef(null);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus('idle');
    setError('');
    setData(null);
  }, []);
  const submit = useCallback(async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are accepted. Please upload a .pdf resume.');
      setStatus('error');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 5 MB.');
      setStatus('error');
      return;
    }
    if (file.size === 0) {
      setError('The uploaded file is empty.');
      setStatus('error');
      return;
    }
    abortRef.current?.abort();
    const controller   = new AbortController();
    abortRef.current   = controller;
    setStatus('extracting');
    setError('');
    setData(null);
    try {
      const form = new FormData();
      form.append('pdf', file);
      let extRes;
      try {
        extRes = await fetch('/api/extract', {
          method: 'POST',
          body:   form,
          signal: controller.signal,
        });
      } catch (err) {
        if (err.name === 'AbortError') return;
        throw new Error('Could not reach the server. Make sure the dev server is running.');
      }
      let extData;
      try {
        extData = await extRes.json();
      } catch {
        throw new Error('Server returned an unexpected response during PDF extraction.');
      }
      if (extRes.status === 413) throw new Error('PDF is too large (max 5 MB).');
      if (!extRes.ok) throw new Error(extData.error || 'PDF extraction failed.');
      if (!extData.links?.length) {
        throw new Error(
          'No GitHub links found in this PDF. ' +
          'Make sure your resume contains your GitHub URL (e.g. github.com/your-username).'
        );
      }
      let username = null;
      for (const url of extData.links) {
        const parsed = parseGithubUrl(url);
        if (parsed && !parsed.repo) { username = parsed.username; break; }
      }
      if (!username) {
        throw new Error(
          'Found GitHub links, but none point to a user profile. ' +
          'Make sure your resume includes github.com/your-username (not just repo links).'
        );
      }
      setStatus('fetching');
      let profRes;
      try {
        profRes = await fetch('/api/github-profile', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ username }),
          signal:  controller.signal,
        });
      } catch (err) {
        if (err.name === 'AbortError') return;
        throw new Error('Could not reach the GitHub profile API. Check your internet connection.');
      }
      let profData;
      try {
        profData = await profRes.json();
      } catch {
        throw new Error('Server returned an unexpected response while fetching GitHub profile.');
      }
      if (profRes.status === 404) throw new Error(`GitHub user "${username}" not found.`);
      if (profRes.status === 429) throw new Error(profData.error || 'GitHub rate limit exceeded. Please wait and try again.');
      if (profRes.status === 504) throw new Error('Request timed out while fetching GitHub data. Please try again.');
      if (!profRes.ok) throw new Error(profData.error || 'Could not fetch GitHub profile.');
      setData(profData);
      setStatus('ready');
    } catch (err) {
      if (err.name === 'AbortError') return; 
      setError(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }, []);
  const step =
    status === 'extracting' ? 'extract' :
    status === 'fetching'   ? 'fetch'   :
    status === 'ready'      ? 'done'    :
    'upload';
  return { status, step, error, data, submit, reset };
}
