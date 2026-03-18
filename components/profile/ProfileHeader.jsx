/**
 * components/profile/ProfileHeader.jsx
 * Responsive: stacked avatar+name on mobile, side-by-side on desktop.
 * Stat pills collapse to 2-col grid on narrow screens.
 */

import { motion }  from 'framer-motion';
import {
  FiUsers, FiBookOpen, FiCalendar, FiTwitter,
  FiLink, FiMapPin, FiUserCheck,
} from 'react-icons/fi';
import StatPill from '../ui/StatPill';

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

function normBlog(b) {
  if (!b) return null;
  if (b.startsWith('http')) return b;
  if (b.startsWith('//'))   return `https:${b}`;
  return `https://${b}`;
}

function MetaItem({ icon: Icon, href, children }) {
  const base = {
    display:    'inline-flex',
    alignItems: 'center',
    gap:        '5px',
    fontSize:   '13px',
    fontFamily: 'var(--font-body)',
    color:      'var(--p-mid)',
    transition: 'color 0.14s',
    wordBreak:  'break-word',
  };

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...base, textDecoration: 'none' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--lime)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--p-mid)'}
      >
        <Icon size={12} style={{ flexShrink: 0 }} />
        {children}
      </a>
    );
  }
  return (
    <span style={base}>
      <Icon size={12} style={{ flexShrink: 0 }} />
      {children}
    </span>
  );
}

export default function ProfileHeader({ profile }) {
  const {
    name, username, bio, avatar_url, url,
    public_repos, followers, following,
    company, blog, twitter, socials = [], created_at,
  } = profile;

  const blogHref    = normBlog(blog);
  const blogDisplay = blog?.replace(/^https?:\/\/|^\/\//, '').split('/')[0]; // domain only

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.4 }}
      className="card"
      style={{ overflow: 'hidden', marginBottom: '16px' }}
    >
      {/* Lime top accent bar */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, var(--lime), var(--lime-dim), transparent)' }} />

      <div style={{ padding: 'var(--card-padding)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Avatar + name row */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <a href={url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
              <img
                src={avatar_url}
                alt={`${name} avatar`}
                width={68}
                height={68}
                loading="lazy"
                decoding="async"
                style={{
                  borderRadius: 'var(--r-md)',
                  border:       '2px solid var(--border)',
                  display:      'block',
                }}
              />
            </a>

            <div style={{ flex: 1, minWidth: '160px' }}>
              <h2 style={{
                fontFamily: 'var(--font-body)',
                fontWeight: '700',
                fontSize:   '20px',
                color:      'var(--p-high)',
                margin:     '0 0 4px',
                wordBreak:  'break-word',
              }}>
                {name}
              </h2>

              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily:     'var(--font-mono)',
                  fontSize:       '12px',
                  color:          'var(--p-mid)',
                  textDecoration: 'none',
                  display:        'block',
                  marginBottom:   bio ? '8px' : '10px',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--lime)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--p-mid)'}
              >
                @{username}
              </a>

              {bio && (
                <p style={{
                  fontSize:   '13px',
                  color:      'var(--p-mid)',
                  fontFamily: 'var(--font-body)',
                  margin:     '0 0 10px',
                  lineHeight: 1.55,
                  wordBreak:  'break-word',
                }}>
                  {bio}
                </p>
              )}

              {/* Meta items — wrap naturally on mobile */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px' }}>
                {company    && <MetaItem icon={FiMapPin}>{company}</MetaItem>}
                {created_at && <MetaItem icon={FiCalendar}>Joined {fmt(created_at)}</MetaItem>}
                {twitter    && (
                  <MetaItem icon={FiTwitter} href={`https://twitter.com/${twitter}`}>
                    @{twitter}
                  </MetaItem>
                )}
                {blogHref   && <MetaItem icon={FiLink} href={blogHref}>{blogDisplay || blog}</MetaItem>}
                {socials.map(s => (
                  <MetaItem key={`${s.provider}-${s.url}`} icon={FiLink} href={s.url}>
                    {s.provider}
                  </MetaItem>
                ))}
              </div>
            </div>
          </div>

          {/* Stat pills — 3 cols desktop, 2 cols mobile via inline media override */}
          <div
            style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap:                 '8px',
            }}
            /* We rely on the container being <530px to collapse */
            className="stat-grid"
          >
            <StatPill icon={FiBookOpen}  label="Repos"     value={(public_repos ?? 0).toLocaleString()} />
            <StatPill icon={FiUsers}     label="Followers"  value={(followers    ?? 0).toLocaleString()} />
            <StatPill icon={FiUserCheck} label="Following"  value={(following    ?? 0).toLocaleString()} />
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 420px) {
          .stat-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </motion.section>
  );
}
