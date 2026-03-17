import { useState }               from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiAlertTriangle, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
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
      const data = await res.json();
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
  const btnBg     = loading  ? 'var(--c-800)'      : result && !isError ? 'var(--c-800)'     : 'var(--lime-soft)';
  const btnColor  = loading  ? 'var(--p-mid)'      : result && !isError ? 'var(--p-mid)'     : 'var(--lime)';
  const btnBorder = loading  ? 'var(--border)'     : result && !isError ? 'var(--border)'    : 'rgba(181,248,87,.18)';
  const BtnIcon = loading
    ? () => <Spinner size={12} color={btnColor} />
    : result
    ? FiRefreshCw
    : FiZap;
  const btnLabel = loading
    ? 'Generating...'
    : result
    ? 'Regenerate Summary'
    : 'Project Summary';
  return (
    <div>
      {/* ── Button ── */}
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          display:      'inline-flex',
          alignItems:   'center',
          gap:          '6px',
          padding:      '5px 14px',
          borderRadius: '99px',
          border:       `1px solid ${btnBorder}`,
          background:   btnBg,
          color:        btnColor,
          fontSize:     '12px',
          fontWeight:   '500',
          fontFamily:   'var(--font-body)',
          cursor:       loading ? 'not-allowed' : 'pointer',
          transition:   'all 0.15s',
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.8'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        <BtnIcon size={12} />
        {btnLabel}
      </button>
      {/* ── Result — always visible once fetched, replaced on next click ── */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.summary}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{    opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            style={{ marginTop: '10px' }}
          >
            <div
              style={{
                padding:      '12px 14px',
                borderRadius: 'var(--r-md)',
                background:   isError ? 'var(--red-soft)' : 'var(--c-900)',
                border:       `1px solid ${isError ? 'var(--red-border)' : 'var(--border)'}`,
              }}
            >
              {/* API key setup message */}
              {isKeyErr ? (
                <div style={{ fontSize: '13px', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
                  <p style={{ color: 'var(--red)', margin: '0 0 8px', fontWeight: 600 }}>
                    GROQ_API_KEY not configured
                  </p>
                  <p style={{ color: 'var(--p-mid)', margin: '0 0 8px' }}>
                    Add a free Groq API key to{' '}
                    <code style={{
                      fontFamily:   'var(--font-mono)',
                      color:        'var(--lime)',
                      background:   'var(--c-800)',
                      padding:      '1px 6px',
                      borderRadius: '4px',
                      fontSize:     '12px',
                    }}>
                      .env.local
                    </code>:
                  </p>
                  <div style={{
                    fontFamily:   'var(--font-mono)',
                    fontSize:     '12px',
                    color:        'var(--p-high)',
                    background:   'var(--c-800)',
                    border:       '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)',
                    padding:      '8px 12px',
                    marginBottom: '10px',
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
                    }}
                  >
                    <FiExternalLink size={11} />
                    Get a free key at console.groq.com
                  </a>
                </div>
              ) : (
                <>
                  <p style={{
                    fontSize:   '13px',
                    lineHeight: 1.65,
                    color:      isError ? 'var(--red)' : 'var(--p-mid)',
                    fontFamily: 'var(--font-body)',
                    margin:     0,
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
