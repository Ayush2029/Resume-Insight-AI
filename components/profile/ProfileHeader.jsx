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
    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <Icon size={12} style={{ flexShrink: 0 }} />
      {children}
    </span>
  );
  const base = {
    fontSize:   '13px',
    fontFamily: 'var(--font-body)',
    color:      'var(--p-mid)',
    transition: 'color 0.14s',
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
      style={{ overflow: 'hidden' }}
    >
      {/* Lime top bar */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, var(--lime), var(--lime-dim), transparent)' }} />
      {/* Body */}
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Avatar + name row */}
          <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <img
              src={avatar_url}
              alt={name}
              width={72}
              height={72}
              style={{
                borderRadius: 'var(--r-md)',
                border:       '2px solid var(--border)',
                flexShrink:   0,
              }}
            />
            <div style={{ flex: 1, minWidth: '180px' }}>
              <h2
                style={{
                  fontFamily:  'var(--font-body)',
                  fontWeight:  '700',
                  fontSize:    '20px',
                  color:       'var(--p-high)',
                  margin:      '0 0 6px',
                }}
              >
                {name}
              </h2>
              {bio && (
                <p style={{
                  fontSize:   '13px',
                  color:      'var(--p-mid)',
                  fontFamily: 'var(--font-body)',
                  margin:     '0 0 10px',
                  lineHeight: 1.55,
                }}>
                  {bio}
                </p>
              )}
              {/* Meta row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
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
          {/* Stat pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <StatPill icon={FiBookOpen}  label="Repositories" value={(public_repos ?? 0).toLocaleString()} />
            <StatPill icon={FiUsers}     label="Followers"    value={(followers    ?? 0).toLocaleString()} />
            <StatPill icon={FiUserCheck} label="Following"    value={(following    ?? 0).toLocaleString()} />
          </div>

        </div>
      </div>
    </motion.section>
  );
}
