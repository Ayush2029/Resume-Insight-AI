/**
 * components/profile/ProfileHeader.jsx
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
  const inner = (
    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
      <Icon size={12} style={{ flexShrink: 0 }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {children}
      </span>
    </span>
  );

  const base = {
    fontSize:   '13px',
    fontFamily: 'var(--font-body)',
    color:      'var(--p-mid)',
    transition: 'color 0.14s',
    minWidth:   0,
    maxWidth:   '100%',
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
        {inner}
      </a>
    );
  }
  return <span style={base}>{inner}</span>;
}

export default function ProfileHeader({ profile }) {
  const {
    name, username, bio, avatar_url, url,
    public_repos, followers, following,
    company, blog, twitter, socials = [], created_at,
  } = profile;

  const blogHref    = normBlog(blog);
  const blogDisplay = blog?.replace(/^https?:\/\/|^\/\//, '');

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card"
    >
      {/* Lime top bar */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, var(--lime), var(--lime-dim), transparent)' }} />

      <div style={{ padding: 'clamp(16px, 4vw, 24px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Avatar + name — stacks on very small screens */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <img
              src={avatar_url}
              alt={name}
              width={64}
              height={64}
              style={{
                borderRadius: 'var(--r-md)',
                border:       '2px solid var(--border)',
                flexShrink:   0,
                width:        'clamp(52px, 12vw, 72px)',
                height:       'clamp(52px, 12vw, 72px)',
                objectFit:    'cover',
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2
                style={{
                  fontFamily:   'var(--font-body)',
                  fontWeight:   '700',
                  fontSize:     'clamp(16px, 4vw, 20px)',
                  color:        'var(--p-high)',
                  margin:       '0 0 4px',
                  wordBreak:    'break-word',
                }}
              >
                {name}
              </h2>

              {bio && (
                <p style={{
                  fontSize:   'clamp(12px, 3vw, 13px)',
                  color:      'var(--p-mid)',
                  fontFamily: 'var(--font-body)',
                  margin:     '0 0 8px',
                  lineHeight: 1.55,
                  wordBreak:  'break-word',
                }}>
                  {bio}
                </p>
              )}

              {/* Meta row — wraps naturally on mobile */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', minWidth: 0 }}>
                {company    && <MetaItem icon={FiMapPin}>{company}</MetaItem>}
                {created_at && <MetaItem icon={FiCalendar}>Joined {fmt(created_at)}</MetaItem>}
                {twitter    && <MetaItem icon={FiTwitter} href={`https://twitter.com/${twitter}`}>@{twitter}</MetaItem>}
                {blogHref   && <MetaItem icon={FiLink} href={blogHref}>{blogDisplay}</MetaItem>}
                {socials.map(s => (
                  <MetaItem key={`${s.provider}-${s.url}`} icon={FiLink} href={s.url}>
                    {s.provider}
                  </MetaItem>
                ))}
              </div>
            </div>
          </div>

          {/* Stat pills — auto-fit so they wrap on narrow screens */}
          <div style={{
            display:               'grid',
            gridTemplateColumns:   'repeat(auto-fit, minmax(90px, 1fr))',
            gap:                   '8px',
          }}>
            <StatPill icon={FiBookOpen}  label="Repos"     value={(public_repos ?? 0).toLocaleString()} />
            <StatPill icon={FiUsers}     label="Followers" value={(followers    ?? 0).toLocaleString()} />
            <StatPill icon={FiUserCheck} label="Following" value={(following    ?? 0).toLocaleString()} />
          </div>

        </div>
      </div>
    </motion.section>
  );
}
