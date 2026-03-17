import { motion }     from 'framer-motion';
import { FiGithub }   from 'react-icons/fi';
import RepoCard       from './RepoCard';
import SkeletonBlock  from '../ui/SkeletonBlock';

function RepoSkeleton() {
  return (
    <div className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <SkeletonBlock style={{ height: '16px', width: '140px' }} />
        <SkeletonBlock style={{ height: '14px', width: '60px'  }} />
      </div>
      <SkeletonBlock style={{ height: '13px', width: '80%'  }} />
      <SkeletonBlock style={{ height: '13px', width: '55%'  }} />
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <SkeletonBlock style={{ height: '18px', width: '60px', borderRadius: '99px' }} />
        <SkeletonBlock style={{ height: '18px', width: '60px', borderRadius: '99px' }} />
      </div>
    </div>
  );
}

export default function RepoList({ repos, loading = false }) {
  if (loading) {
    return (
      <section style={{ marginTop: '20px' }}>
        <SkeletonBlock style={{ height: '18px', width: '120px', marginBottom: '14px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[0, 1, 2].map(i => <RepoSkeleton key={i} />)}
        </div>
      </section>
    );
  }

  if (!repos?.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '10px',
          padding:        '60px 0',
          color:          'var(--p-low)',
        }}
      >
        <FiGithub size={36} opacity={0.3} />
        <p style={{ fontSize: '13px', fontFamily: 'var(--font-body)', margin: 0 }}>
          no public repositories found
        </p>
      </motion.div>
    );
  }

  return (
    <section style={{ marginTop: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight:  '700',
            fontSize:    '13px',
            color:       'var(--lime)',
            margin:      0,
            letterSpacing: '0.04em',
          }}
        >
          Repositories
          <span style={{ color: 'var(--p-low)', fontWeight: 400, marginLeft: '8px' }}>
            ({repos.length} found)
          </span>
        </h3>
      </div>
      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {repos.map((repo, i) => (
          <RepoCard key={repo.id ?? repo.name} repo={repo} index={i} />
        ))}
      </div>
    </section>
  );
}
