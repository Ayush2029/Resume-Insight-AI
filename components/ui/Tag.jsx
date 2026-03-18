/**
 * components/ui/Tag.jsx
 */
const VARIANTS = {
  default: { bg: 'var(--c-700)',      color: 'var(--p-mid)',   border: 'var(--border)'        },
  lime:    { bg: 'var(--lime-soft)',  color: 'var(--lime)',    border: 'rgba(181,248,87,.18)' },
  amber:   { bg: 'var(--amber-soft)', color: 'var(--amber)',   border: 'rgba(240,165,0,.2)'   },
  sky:     { bg: 'var(--sky-soft)',   color: 'var(--sky)',     border: 'rgba(88,180,248,.2)'  },
  red:     { bg: 'var(--red-soft)',   color: 'var(--red)',     border: 'var(--red-border)'    },
  green:   { bg: 'var(--green-soft)', color: 'var(--green)',   border: 'rgba(63,185,80,.2)'   },
};

export default function Tag({ children, variant = 'default', icon: Icon }) {
  const v = VARIANTS[variant] ?? VARIANTS.default;
  return (
    <span
      style={{
        display:       'inline-flex',
        alignItems:    'center',
        gap:           '4px',
        padding:       '2px 8px',
        borderRadius:  '99px',
        fontSize:      '11px',
        fontWeight:    '600',
        fontFamily:    'var(--font-mono)',
        letterSpacing: '0.02em',
        background:    v.bg,
        color:         v.color,
        border:        `1px solid ${v.border}`,
        whiteSpace:    'nowrap',
        flexShrink:    0,
      }}
    >
      {Icon && <Icon size={10} />}
      {children}
    </span>
  );
}
