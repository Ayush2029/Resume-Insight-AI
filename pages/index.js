/**
 * pages/index.js — Resume Analyzer
 * Responsive: works on 320px mobile through wide desktop.
 */

import { motion, AnimatePresence } from 'framer-motion';
import PageShell        from '../components/layout/PageShell';
import DropZone         from '../components/resume/DropZone';
import StepIndicator    from '../components/resume/StepIndicator';
import ProfileHeader    from '../components/profile/ProfileHeader';
import ProfileSkeleton  from '../components/profile/ProfileSkeleton';
import RepoList         from '../components/repo/RepoList';
import ErrorBanner      from '../components/ui/ErrorBanner';
import useResumeAnalyzer from '../hooks/useResumeAnalyzer';

export default function AnalyzerPage() {
  const { status, step, error, data, submit, reset } = useResumeAnalyzer();

  const isLoading = status === 'extracting' || status === 'fetching';
  const isReady   = status === 'ready';

  const loadingMsg =
    status === 'extracting' ? 'Scanning PDF for GitHub links…' :
    status === 'fetching'   ? 'Fetching GitHub profile & repositories…' : '';

  return (
    <PageShell>

      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.4 }}
        style={{ textAlign: 'center', marginBottom: '32px' }}
      >
        {/* AI badge */}
        <div style={{
          display:      'inline-flex',
          alignItems:   'center',
          gap:          '6px',
          padding:      '5px 14px',
          borderRadius: '99px',
          background:   'var(--c-800)',
          border:       '1px solid var(--border)',
          fontSize:     '12px',
          fontFamily:   'var(--font-body)',
          fontWeight:   '500',
          color:        'var(--p-mid)',
          marginBottom: '16px',
        }}>
          <span style={{
            width:        '6px',
            height:       '6px',
            borderRadius: '50%',
            background:   'var(--lime)',
            display:      'inline-block',
            boxShadow:    '0 0 6px var(--lime)',
            flexShrink:   0,
          }} />
          AI-powered
        </div>

        <h1 style={{
          fontSize:     'clamp(22px, 5vw, 32px)',
          fontFamily:   'var(--font-display)',
          fontWeight:   '700',
          color:        'var(--p-high)',
          margin:       '0 0 10px',
          lineHeight:   1.2,
          letterSpacing: '-0.01em',
        }}>
          Resume<span style={{ color: 'var(--lime)' }}>Insight</span> AI
        </h1>

        <p style={{
          fontSize:   'clamp(13px, 3vw, 15px)',
          color:      'var(--p-mid)',
          fontFamily: 'var(--font-body)',
          margin:     0,
          lineHeight: 1.6,
          maxWidth:   '520px',
          marginLeft: 'auto',
          marginRight:'auto',
          padding:    '0 8px',
        }}>
          Upload a resume PDF. We extract your GitHub profile and analyze every repository with AI.
        </p>
      </motion.div>

      {/* ── Upload card ── */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card"
        style={{ padding: 'var(--card-padding)', marginBottom: '16px' }}
      >
        <div style={{ marginBottom: '20px' }}>
          <StepIndicator activeStep={step} />
        </div>

        <AnimatePresence>
          {isLoading && loadingMsg && (
            <motion.p
              key="lmsg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              aria-live="polite"
              style={{
                textAlign:  'center',
                fontSize:   '13px',
                fontFamily: 'var(--font-body)',
                color:      'var(--p-mid)',
                margin:     '0 0 14px',
              }}
            >
              {loadingMsg}
            </motion.p>
          )}
        </AnimatePresence>

        <DropZone onFile={submit} loading={isLoading} />

        {error && (
          <div style={{ marginTop: '14px' }}>
            <ErrorBanner message={error} />
          </div>
        )}

        {isReady && (
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <button
              onClick={reset}
              className="btn-ghost"
              style={{ fontSize: '13px', fontFamily: 'var(--font-body)' }}
            >
              Analyze another resume
            </button>
          </div>
        )}
      </motion.div>

      {/* ── Results ── */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="skel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
          >
            <ProfileSkeleton />
            <RepoList repos={null} loading />
          </motion.div>
        )}

        {isReady && data && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{    opacity: 0        }}
            transition={{ duration: 0.4 }}
          >
            <ProfileHeader profile={data.profile} />
            <RepoList repos={data.repos} />
          </motion.div>
        )}
      </AnimatePresence>

    </PageShell>
  );
}
