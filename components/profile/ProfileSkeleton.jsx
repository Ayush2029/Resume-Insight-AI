/**
 * components/profile/ProfileSkeleton.jsx
 */
import SkeletonBlock from '../ui/SkeletonBlock';

export default function ProfileSkeleton() {
  return (
    <div className="card" style={{ overflow: 'hidden', marginBottom: '16px' }}>
      <div style={{ height: '3px', background: 'var(--c-700)' }} />
      <div style={{ padding: 'var(--card-padding)' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <SkeletonBlock style={{ width: '68px', height: '68px', borderRadius: 'var(--r-md)', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: '140px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SkeletonBlock style={{ height: '22px', width: 'min(160px, 60%)' }} />
            <SkeletonBlock style={{ height: '12px', width: 'min(100px, 40%)' }} />
            <SkeletonBlock style={{ height: '13px', width: 'min(260px, 90%)', marginTop: '4px' }} />
            <SkeletonBlock style={{ height: '13px', width: 'min(200px, 75%)' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
          {[0,1,2].map(i => <SkeletonBlock key={i} style={{ height: '58px', borderRadius: 'var(--r-md)' }} />)}
        </div>
      </div>
    </div>
  );
}
