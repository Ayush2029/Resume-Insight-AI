/**
 * components/repo/AISummarizeButton.jsx
 */

import { useState }               from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import Spinner from '../ui/Spinner';

export default function AISummarizeButton({ repo }) {
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [isError,  setIsError]  = useState(false);
  const [isKeyErr, setIsKeyErr] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    setResult(null);
    setIsError(false);
    setIsKeyErr(false);

    try {
      const res = await fetch('/api/summarize', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readmeRaw:     repo.readmeRaw     ?? '',
          fullName:      repo.full_name,
          description:   repo.description  ?? '',
          defaultBranch: repo.default_branch ?? 'main',
        }),
      });

      // Read as text first — guards against HTML crash pages being returned
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); }
      catch { throw new Error('Server error — please try again in a moment.'); }

      if (!res.ok) throw new Error(data.error || 'Summarization failed');
      setResult(data);
    } catch (err) {
      const keyErr = err.message.includes('GROQ_API_KEY');
      setIsKeyErr(keyErr);
      setResult({ summary: err.message, source: null });
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  const btnBg     = loading || (result && !isError) ? 'var(--c-800)'        : 'var(--lime-soft)';
  const btnColor  = loading || (result && !isError) ? 'var(--p-mid)'        : 'var(--lime)';
  const btnBorder = loading || (result && !isError) ? 'var(--border)'       : 'rgba(181,248,87,.18)';

  const BtnIcon   = loading ? () => <Spinner size={12} color={btnColor} />
                 : result   ? FiRefreshCw
                 : FiZap;

  const btnLabel  = loading ? 'Generating...'
                 : result   ? 'Regenerate Summary'
                 : 'Project Summary';

  return (
    <div style={{ minWidth: 0 }}>
      {/* Button */}
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          display:      'inline-flex',
          alignItems:   'center',
          gap:          '6px',
          padding:      '6px 14px',
          borderRadius: '99px',
          border:       `1px solid ${btnBorder}`,
          background:   btnBg,
          color:        btnColor,
          fontSize:     '12px',
          fontWeight:   '500',
          fontFamily:   'var(--font-body)',
          cursor:       loading ? 'not-allowed' : 'pointer',
          transition:   'all 0.15s',
          minHeight:    '32px',
          whiteSpace:   'nowrap',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <BtnIcon size={12} />
        {btnLabel}
      </button>

      {/* Result panel */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.summary}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{    opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            style={{ marginTop: '10px', minWidth: 0 }}
          >
            <div style={{
              padding:      '12px',
              borderRadius: 'var(--r-md)',
              background:   isError ? 'var(--red-soft)' : 'var(--c-900)',
              border:       `1px solid ${isError ? 'var(--red-border)' : 'var(--border)'}`,
              minWidth:     0,
              overflow:     'hidden',
            }}>
              {isKeyErr ? (
                <div style={{ fontSize: '13px', fontFamily: 'var(--font-body)', lineHeight: 1.6, minWidth: 0 }}>
                  <p style={{ color: 'var(--red)', margin: '0 0 8px', fontWeight: 600 }}>
                    GROQ_API_KEY not configured
                  </p>
                  <p style={{ color: 'var(--p-mid)', margin: '0 0 8px', lineHeight: 1.5 }}>
                    Add a free Groq API key to{' '}
                    <code style={{
                      fontFamily:   'var(--font-mono)',
                      color:        'var(--lime)',
                      background:   'var(--c-800)',
                      padding:      '1px 5px',
                      borderRadius: '4px',
                      fontSize:     '12px',
                    }}>
                      .env.local
                    </code>
                  </p>
                  {/* Key block — scrollable on mobile instead of overflowing */}
                  <div style={{
                    fontFamily:   'var(--font-mono)',
                    fontSize:     '11px',
                    color:        'var(--p-high)',
                    background:   'var(--c-800)',
                    border:       '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)',
                    padding:      '8px 10px',
                    marginBottom: '10px',
                    overflowX:    'auto',
                    whiteSpace:   'nowrap',
                  }}>
                    GROQ_API_KEY=your_key_here
                  </div>
                  <a
                    href="https://console.groq.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display:        'inline-flex',
                      alignItems:     'center',
                      gap:            '4px',
                      fontSize:       '12px',
                      color:          'var(--sky)',
                      textDecoration: 'none',
                      wordBreak:      'break-word',
                    }}
                  >
                    <FiExternalLink size={11} style={{ flexShrink: 0 }} />
                    Get a free key at console.groq.com
                  </a>
                </div>
              ) : (
                <>
                  <p style={{
                    fontSize:   'clamp(12px, 3vw, 13px)',
                    lineHeight: 1.65,
                    color:      isError ? 'var(--red)' : 'var(--p-mid)',
                    fontFamily: 'var(--font-body)',
                    margin:     0,
                    wordBreak:  'break-word',
                  }}>
                    {result.summary}
                  </p>
                  {result.source && result.source !== 'empty' && (
                    <p style={{
                      fontSize:   '11px',
                      fontFamily: 'var(--font-body)',
                      color:      'var(--p-low)',
                      margin:     '8px 0 0',
                    }}>
                      Source: {result.source === 'readme' ? 'README.md' : 'source files'}
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
