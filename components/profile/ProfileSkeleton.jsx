import SkeletonBlock from '../ui/SkeletonBlock';

export default function ProfileSkeleton() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ height: '3px', background: 'var(--c-700)' }} />
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--c-900)', display: 'flex', gap: '6px' }}>
        {[0,1,2].map(i => <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--c-700)' }} />)}
      </div>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', gap: '18px', marginBottom: '20px' }}>
          <SkeletonBlock style={{ width: '72px', height: '72px', borderRadius: 'var(--r-md)', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SkeletonBlock style={{ height: '22px', width: '160px' }} />
            <SkeletonBlock style={{ height: '14px', width: '100px' }} />
            <SkeletonBlock style={{ height: '14px', width: '260px', marginTop: '4px' }} />
            <SkeletonBlock style={{ height: '14px', width: '200px' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
          {[0,1,2].map(i => <SkeletonBlock key={i} style={{ height: '58px', borderRadius: 'var(--r-md)' }} />)}
        </div>
      </div>
    </div>
  );
}
