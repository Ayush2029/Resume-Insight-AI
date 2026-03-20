export default function PageShell({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-950)' }}>
      {/* Dot grid background */}
      <div
        aria-hidden="true"
        style={{
          position:        'fixed',
          inset:           0,
          pointerEvents:   'none',
          zIndex:          0,
          backgroundImage: 'radial-gradient(circle, var(--c-600) 1px, transparent 1px)',
          backgroundSize:  '28px 28px',
          opacity:         0.25,
        }}
      />
      {/* Radial lime glow — top centre */}
      <div
        aria-hidden="true"
        style={{
          position:      'fixed',
          top:           '-20vh',
          left:          '50%',
          transform:     'translateX(-50%)',
          width:         '600px',
          height:        '400px',
          background:    'radial-gradient(ellipse, rgba(181,248,87,.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex:        0,
        }}
      />
      <main
        style={{
          position: 'relative',
          zIndex:   1,
          padding:  'var(--page-padding)',
        }}
      >
        <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
