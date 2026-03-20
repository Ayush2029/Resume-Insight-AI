export default function StatPill({ icon: Icon, label, value }) {
  return (
    <div
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '10px',
        padding:      '10px 12px',
        borderRadius: 'var(--r-md)',
        background:   'var(--c-900)',
        border:       '1px solid var(--border)',
        minWidth:     0,
      }}
    >
      {Icon && (
        <span
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:          '28px',
            height:         '28px',
            minWidth:       '28px',
            borderRadius:   'var(--r-sm)',
            background:     'var(--lime-soft)',
            color:          'var(--lime)',
          }}
        >
          <Icon size={13} />
        </span>
      )}
      <div style={{ overflow: 'hidden' }}>
        <p style={{
          fontSize:   '11px',
          color:      'var(--p-mid)',
          fontFamily: 'var(--font-body)',
          margin:     0,
          whiteSpace: 'nowrap',
          overflow:   'hidden',
          textOverflow: 'ellipsis',
        }}>
          {label}
        </p>
        <p style={{
          fontSize:   'clamp(14px, 3.5vw, 17px)',
          fontWeight: '700',               
          color:      'var(--p-high)',
          fontFamily: 'var(--font-body)',
          margin:     0,
          lineHeight: 1.2,
        }}>
          {value}
        </p>
      </div>
    </div>
  );
}
