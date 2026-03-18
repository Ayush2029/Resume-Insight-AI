import { useState, useCallback } from 'react';
import { parseGithubUrl }        from '../lib/pdf/parseUrl'; 
export default function useResumeAnalyzer() {
  const [status, setStatus] = useState('idle');   
  const [error,  setError]  = useState('');
  const [data,   setData]   = useState(null);     
  const reset = useCallback(() => {
    setStatus('idle');
    setError('');
    setData(null);
  }, []);
  const submit = useCallback(async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are accepted.');
      setStatus('error');
      return;
    }
    setStatus('extracting');
    setError('');
    setData(null);
    try {
      const form = new FormData();
      form.append('pdf', file);
      let extRes;
      try {
        extRes = await fetch('/api/extract', { method: 'POST', body: form });
      } catch (networkErr) {
        throw new Error(
          'Could not reach the server. Make sure the dev server is running (npm run dev).'
        );
      }
      let extData;
      try {
        extData = await extRes.json();
      } catch {
        throw new Error('Server returned an invalid response during PDF extraction.');
      }
      if (!extRes.ok) throw new Error(extData.error || 'PDF extraction failed');
      if (!extData.links?.length) throw new Error(
        'No GitHub links found in this PDF. ' +
        'Make sure your resume contains your GitHub URL (e.g. github.com/your-username).'
      );
      let username = null;
      for (const url of extData.links) {
        const parsed = parseGithubUrl(url);
        if (parsed && !parsed.repo) { username = parsed.username; break; }
      }
      if (!username) throw new Error(
        'No GitHub profile link found. Only repository links were detected. ' +
        'Make sure your resume links to github.com/your-username directly.'
      );
      setStatus('fetching');
      let profRes;
      try {
        profRes = await fetch('/api/github-profile', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ username }),
        });
      } catch (networkErr) {
        throw new Error('Could not reach the GitHub profile API. Check your internet connection.');
      }
      let profData;
      try {
        profData = await profRes.json();
      } catch {
        throw new Error('Server returned an invalid response while fetching GitHub profile.');
      }
      if (!profRes.ok) throw new Error(profData.error || 'Could not fetch GitHub profile');
      setData(profData);
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
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
