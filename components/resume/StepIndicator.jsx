import { motion } from 'framer-motion';
import { FiCheck, FiLoader } from 'react-icons/fi';
const STEPS = [
  { key: 'upload',  label: 'Upload PDF',      cmd: '01' },
  { key: 'extract', label: 'Extract Links',   cmd: '02' },
  { key: 'fetch',   label: 'Fetch Profile',   cmd: '03' },
];
export default function StepIndicator({ activeStep }) {
  const activeIdx = STEPS.findIndex(s => s.key === activeStep);
  const allDone   = activeStep === 'done';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, width: '100%' }}>
      {STEPS.map((step, i) => {
        const done   = allDone || i < activeIdx;
        const active = !allDone && i === activeIdx;
        return (
          <div
            key={step.key}
            style={{
              display:    'flex',
              alignItems: 'center',
              flex:       i < STEPS.length - 1 ? 1 : 'none',
            }}
          >
            {/* Step node */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              <motion.div
                animate={{
                  background:  done   ? 'var(--lime)'      : active ? 'var(--lime-soft)' : 'var(--c-800)',
                  borderColor: done || active ? 'var(--lime)' : 'var(--border)',
                  scale:       active ? 1.1 : 1,
                }}
                transition={{ duration: 0.25 }}
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  width:          '26px',
                  height:         '26px',
                  borderRadius:   '50%',
                  border:         '2px solid var(--border)',
                  fontFamily:     'var(--font-mono)',
                  fontSize:       '10px',
                  fontWeight:     '700',
                }}
              >
                {done ? (
                  <FiCheck size={12} color="var(--c-950)" strokeWidth={3} />
                ) : active ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'flex' }}
                  >
                    <FiLoader size={11} color="var(--lime)" />
                  </motion.div>
                ) : (
                  <span style={{ color: 'var(--p-low)' }}>{step.cmd}</span>
                )}
              </motion.div>
              <span
                style={{
                  fontSize:    '11px',
                  fontFamily:  'var(--font-body)',
                  color:       done || active ? 'var(--lime)' : 'var(--p-low)',
                  whiteSpace:  'nowrap',
                  transition:  'color 0.25s',
                }}
              >
                {step.label}
              </span>
            </div>
            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div
                style={{
                  flex:       1,
                  height:     '2px',
                  margin:     '0 6px',
                  marginBottom: '18px',
                  background: 'var(--c-700)',
                  position:   'relative',
                  overflow:   'hidden',
                }}
              >
                <motion.div
                  animate={{ width: done ? '100%' : '0%' }}
                  transition={{ duration: 0.4 }}
                  style={{
                    position:   'absolute',
                    top:        0,
                    left:       0,
                    height:     '100%',
                    background: 'var(--lime)',
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
