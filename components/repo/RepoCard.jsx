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

export default function RepoCard({ repo, index = 0 }) {
  const { name, url, description, language, lastCommitDate } = repo;
  const langVariant = LANG_VARIANT[language] ?? 'default';

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="card"
      style={{
        padding:    'clamp(14px, 4vw, 18px) clamp(14px, 4vw, 20px)',
        transition: 'border-color 0.18s',
        minWidth:   0,
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--c-500)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {/* Name */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily:     'var(--font-body)',
          fontWeight:     '600',
          fontSize:       'clamp(13px, 3.5vw, 14px)',
          color:          'var(--p-high)',
          textDecoration: 'none',
          transition:     'color 0.14s',
          display:        'block',
          wordBreak:      'break-word',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--lime)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--p-high)'}
      >
        {name}
      </a>

      {/* Description */}
      {description && (
        <p style={{
          fontFamily:      'var(--font-body)',
          fontSize:        'clamp(12px, 3vw, 13px)',
          color:           'var(--p-mid)',
          margin:          '6px 0 0',
          lineHeight:      1.55,
          display:         '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow:        'hidden',
          wordBreak:       'break-word',
        }}>
          {description}
        </p>
      )}

      {/* Language + last commit */}
      <div style={{
        display:    'flex',
        flexWrap:   'wrap',
        alignItems: 'center',
        gap:        '8px',
        marginTop:  '10px',
        paddingTop: '10px',
        borderTop:  '1px solid var(--border)',
      }}>
        {language && <Tag icon={FiCode} variant={langVariant}>{language}</Tag>}

        {lastCommitDate && (
          <span style={{
            display:    'flex',
            alignItems: 'center',
            flexWrap:   'wrap',
            gap:        '4px',
            fontFamily: 'var(--font-body)',
            fontSize:   'clamp(11px, 3vw, 12px)',
            color:      'var(--p-mid)',
          }}>
            <FiClock size={11} style={{ color: 'var(--p-low)', flexShrink: 0 }} />
            <span>Last commit:</span>
            <strong style={{ color: 'var(--p-high)', fontWeight: '500' }}>
              {timeAgo(lastCommitDate)}
            </strong>
            <span style={{ color: 'var(--p-low)' }}>
              ({shortDate(lastCommitDate)})
            </span>
          </span>
        )}
      </div>

      {/* Project Summary */}
      <div style={{ marginTop: '12px', minWidth: 0 }}>
        <AISummarizeButton repo={repo} />
      </div>
    </motion.article>
  );
}
