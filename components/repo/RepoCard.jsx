/**
 * components/repo/RepoCard.jsx
 */

import { motion }        from 'framer-motion';
import { FiClock, FiCode } from 'react-icons/fi';
import Tag               from '../ui/Tag';
import AISummarizeButton from './AISummarizeButton';

function timeAgo(iso) {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso)) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30)  return `${days} days ago`;
  const m = Math.floor(days / 30);
  if (m < 12) return `${m} months ago`;
  return `${Math.floor(m / 12)} years ago`;
}

function shortDate(iso) {
  if (!iso) return 'Unknown';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const LANG_VARIANT = {
  JavaScript: 'amber', TypeScript: 'sky', Python: 'sky',
  Rust: 'amber', Go: 'sky', Ruby: 'red', Java: 'amber',
  'C++': 'sky', C: 'sky', Swift: 'amber', Kotlin: 'amber',
};

const TEXT = {
  fontFamily: 'var(--font-body)',
  fontSize:   '13px',
  color:      'var(--p-mid)',
};

export default function RepoCard({ repo, index = 0 }) {
  const { name, url, description, language, lastCommitDate } = repo;

  const langVariant = LANG_VARIANT[language] ?? 'default';

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="card"
      style={{ padding: '18px 20px', transition: 'border-color 0.18s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--c-500)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {/* ── Row 1: name ── */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily:     'var(--font-body)',
          fontWeight:     '600',
          fontSize:       '14px',
          color:          'var(--p-high)',
          textDecoration: 'none',
          transition:     'color 0.14s',
          display:        'block',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--lime)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--p-high)'}
      >
        {name}
      </a>

      {/* ── Row 2: description ── */}
      {description && (
        <p style={{
          ...TEXT,
          margin:          '8px 0 0',
          lineHeight:      1.55,
          display:         '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow:        'hidden',
        }}>
          {description}
        </p>
      )}

      {/* ── Row 3: language tag + last commit ── */}
      <div style={{
        display:    'flex',
        flexWrap:   'wrap',
        alignItems: 'center',
        gap:        '12px',
        marginTop:  '10px',
        paddingTop: '10px',
        borderTop:  '1px solid var(--border)',
      }}>
        {language && <Tag icon={FiCode} variant={langVariant}>{language}</Tag>}

        {lastCommitDate && (
          <span style={{ ...TEXT, display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
            <FiClock size={12} style={{ color: 'var(--p-low)' }} />
            Last commit:&nbsp;
            <strong style={{ color: 'var(--p-high)', fontWeight: '500' }}>
              {timeAgo(lastCommitDate)}
            </strong>
            &nbsp;
            <span style={{ color: 'var(--p-low)' }}>
              ({shortDate(lastCommitDate)})
            </span>
          </span>
        )}
      </div>

      {/* ── Row 4: Project Summary button ── */}
      <div style={{ marginTop: '14px' }}>
        <AISummarizeButton repo={repo} />
      </div>
    </motion.article>
  );
}

