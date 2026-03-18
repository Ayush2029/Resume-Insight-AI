/**
 * components/repo/RepoCard.jsx
 * Fully responsive — stacks meta on narrow screens.
 */

import { motion }           from 'framer-motion';
import { FiClock, FiCode }  from 'react-icons/fi';
import Tag                  from '../ui/Tag';
import AISummarizeButton    from './AISummarizeButton';

function timeAgo(iso) {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso)) / 86_400_000);
  if (days === 0)  return 'Today';
  if (days === 1)  return 'Yesterday';
  if (days < 30)   return `${days}d ago`;
  const m = Math.floor(days / 30);
  if (m < 12)      return `${m}mo ago`;
  return `${Math.floor(m / 12)}yr ago`;
}

function shortDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const LANG_VARIANT = {
  JavaScript: 'amber', TypeScript: 'sky', Python: 'sky',
  Rust: 'amber', Go: 'sky', Ruby: 'red', Java: 'amber',
  'C++': 'sky', C: 'sky', Swift: 'amber', Kotlin: 'amber',
  CSS: 'sky', HTML: 'amber', Shell: 'green', Dart: 'sky',
};

export default function RepoCard({ repo, index = 0 }) {
  const { name, url, description, language, lastCommitDate } = repo;
  const langVariant = LANG_VARIANT[language] ?? 'default';
  const ago  = timeAgo(lastCommitDate);
  const date = shortDate(lastCommitDate);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
      className="card"
      style={{ padding: 'var(--repo-padding)', transition: 'border-color 0.18s' }}
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
          fontSize:       '14px',
          color:          'var(--p-high)',
          textDecoration: 'none',
          transition:     'color 0.14s',
          display:        'inline-block',
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
          fontSize:        '13px',
          fontFamily:      'var(--font-body)',
          color:           'var(--p-mid)',
          margin:          '8px 0 0',
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

      {/* Meta row — wraps gracefully on mobile */}
      <div style={{
        display:    'flex',
        flexWrap:   'wrap',
        alignItems: 'center',
        gap:        '8px 12px',
        marginTop:  '10px',
        paddingTop: '10px',
        borderTop:  '1px solid var(--border)',
      }}>
        {language && <Tag icon={FiCode} variant={langVariant}>{language}</Tag>}

        {ago && (
          <span style={{
            display:    'flex',
            alignItems: 'center',
            gap:        '5px',
            fontSize:   '12px',
            fontFamily: 'var(--font-body)',
            color:      'var(--p-mid)',
          }}>
            <FiClock size={11} style={{ color: 'var(--p-low)', flexShrink: 0 }} />
            <span style={{ color: 'var(--p-high)', fontWeight: '500' }}>{ago}</span>
            {date && <span style={{ color: 'var(--p-low)' }}>({date})</span>}
          </span>
        )}
      </div>

      {/* AI Summary button */}
      <div style={{ marginTop: '14px' }}>
        <AISummarizeButton repo={repo} />
      </div>
    </motion.article>
  );
}
