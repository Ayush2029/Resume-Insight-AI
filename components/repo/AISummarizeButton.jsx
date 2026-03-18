/**
 * components/repo/AISummarizeButton.jsx
 *
 * Calls /api/summarize on each click (no caching — fresh every time).
 * Shows source badge (README vs source files), handles all error cases,
 * and is fully responsive for mobile.
 */

import { useState }                from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import Spinner from '../ui/Spinner';

export default function AISummarizeButton({ repo }) {
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState(null);   // { summary, source }
  const [isError,   setIsError]   = useState(false);
  const [isKeyErr,  setIsKeyErr]  = useState(false);
  const [isRateErr, setIsRateErr] = useState(false);

  async function handleClick() {
    if (loading) return;

    setLoading(true);
    setResult(null);
    setIsError(false);
    setIsKeyErr(false);
    setIsRateErr(false);

    try {
      const res = await fetch('/api/summarize', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readmeRaw:     repo.readmeRaw      ?? '',
          fullName:      repo.full_name,
          description:   repo.description   ?? '',
          defaultBranch: repo.default_branch ?? 'main',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw Object.assign(new Error(data.error || 'Summarization failed'), { status: res.status });

      setResult(data);

    } catch (err) {
      const msg      = err.message ?? 'Summarization failed.';
      const isKey    = msg.includes('GROQ_API_KEY');
      const isRate   = msg.includes('rate limit') || msg.includes('Rate limit') || err.status === 429;
      setIsKeyErr(isKey);
      setIsRateErr(isRate && !isKey);
      setResult({ summary: msg, source: null });
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  const btnBg     = result && !isError ? 'var(--c-800)'    : 'var(--lime-soft)';
  const btnColor  = result && !isError ? 'var(--p-mid)'    : 'var(--lime)';
  const btnBorder = result && !isError ? 'var(--border)'   : 'rgba(181,248,87,.18)';

  const BtnIcon  = loading ? () => <Spinner size={12} color={btnColor} /> : result ? FiRefreshCw : FiZap;
  const btnLabel = loading ? 'Generating…' : result ? 'Regenerate' : 'Project Summary';

  const sourceBadge = result?.source === 'readme'
    ? { label: 'README', color: 'var(--lime)', bg: 'var(--lime-soft)' }
    : result?.source === 'files'
    ? { label: 'Source code', color: 'var(--sky)', bg: 'var(--sky-soft)' }
    : null;

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        aria-busy={loading}
        style={{
          display:      'inline-flex',
          alignItems:   'center',
          gap:          '6px',
          padding:      '6px 14px',
          borderRadius: '99px',
          border:       `1px solid ${loading ? 'var(--border)' : btnBorder}`,
          background:   loading ? 'var(--c-800)' : btnBg,
          color:        loading ? 'var(--p-mid)'  : btnColor,
          fontSize:     '12px',
          fontWeight:   '500',
          fontFamily:   'var(--font-body)',
          cursor:       loading ? 'not-allowed' : 'pointer',
          transition:   'all 0.15s',
          minHeight:    '32px',
          touchAction:  'manipulation',
          whiteSpace:   'nowrap',
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.8'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        <BtnIcon size={12} />
        {btnLabel}
      </button>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.summary}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{    opacity: 0       }}
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
              {/* GROQ key not configured */}
              {isKeyErr ? (
                <div style={{ fontSize: '13px', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
                  <p style={{ color: 'var(--red)', margin: '0 0 8px', fontWeight: 600 }}>
                    GROQ_API_KEY not configured
                  </p>
                  <p style={{ color: 'var(--p-mid)', margin: '0 0 8px', fontSize: '13px' }}>
                    Add your free Groq key to <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--lime)', background: 'var(--c-800)', padding: '1px 6px', borderRadius: '4px', fontSize: '12px' }}>.env.local</code>:
                  </p>
                  <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--p-high)', background: 'var(--c-800)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '8px 12px', margin: '0 0 10px', overflowX: 'auto' }}>
                    GROQ_API_KEY=gsk_your_key_here
                  </pre>
                  <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--sky)', textDecoration: 'none' }}>
                    <FiExternalLink size={11} />
                    Get a free key at console.groq.com
                  </a>
                </div>
              ) : isRateErr ? (
                /* Rate limit hit */
                <div style={{ fontSize: '13px', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
                  <p style={{ color: 'var(--amber)', margin: '0 0 4px', fontWeight: 600 }}>
                    Rate limit reached
                  </p>
                  <p style={{ color: 'var(--p-mid)', margin: 0 }}>
                    Groq free tier: 30 requests/min, 1000/day. Please wait a moment and try again.
                  </p>
                </div>
              ) : (
                /* Normal result or generic error */
                <>
                  <p style={{ fontSize: '13px', lineHeight: 1.7, color: isError ? 'var(--red)' : 'var(--p-mid)', fontFamily: 'var(--font-body)', margin: 0 }}>
                    {result.summary}
                  </p>
                  {sourceBadge && (
                    <div style={{ marginTop: '8px' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-body)', color: sourceBadge.color, background: sourceBadge.bg, padding: '2px 8px', borderRadius: '99px', display: 'inline-block' }}>
                        Analysed from: {sourceBadge.label}
                      </span>
                    </div>
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
