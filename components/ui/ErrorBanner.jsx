/**
 * components/ui/ErrorBanner.jsx
 *
 * "No GitHub links found" — centered toast that appears and auto-dismisses.
 * All other errors — inline banner below the dropzone.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle } from 'react-icons/fi';
import { useState, useEffect } from 'react';

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,   scale: 1    }}
      exit={{    opacity: 0, y: -12, scale: 0.97 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{
        position:       'fixed',
        top:            '28px',
        left:           0,
        right:          0,
        margin:         '0 auto',
        width:          'fit-content',
        maxWidth:       '360px',
        zIndex:         9999,
        display:        'flex',
        alignItems:     'center',
        gap:            '10px',
        padding:        '12px 20px',
        borderRadius:   'var(--r-lg)',
        background:     'var(--c-800)',
        border:         '1px solid var(--border)',
        boxShadow:      '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      <FiAlertCircle size={15} style={{ color: 'var(--amber)', flexShrink: 0 }} />
      <span style={{
        fontSize:   '13px',
        fontFamily: 'var(--font-body)',
        color:      'var(--p-high)',
        whiteSpace: 'nowrap',
      }}>
        {message}
      </span>
    </motion.div>
  );
}

export default function ErrorBanner({ message }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) setVisible(true);
    else setVisible(false);
  }, [message]);

  if (!message) return null;

  const isNoLinks = message.startsWith('No GitHub links found');

  if (isNoLinks) {
    return (
      <AnimatePresence>
        {visible && (
          <Toast
            message="No GitHub links found in this PDF."
            onClose={() => setVisible(false)}
          />
        )}
      </AnimatePresence>
    );
  }

  // All other errors — inline banner
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{    opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            overflow:     'hidden',
            display:      'flex',
            alignItems:   'flex-start',
            gap:          '10px',
            padding:      '12px 16px',
            borderRadius: 'var(--r-md)',
            background:   'var(--red-soft)',
            border:       '1px solid var(--red-border)',
            color:        'var(--red)',
            fontSize:     '13px',
            lineHeight:   '1.5',
            fontFamily:   'var(--font-body)',
          }}
        >
          <FiAlertCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
