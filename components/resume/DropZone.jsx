import { useRef, useState } from 'react';
import { motion }           from 'framer-motion';
import { FiUploadCloud, FiFileText, FiX } from 'react-icons/fi';
import Spinner from '../ui/Spinner';
export default function DropZone({ onFile, loading = false }) {
  const [dragging,  setDragging]  = useState(false);
  const [fileName,  setFileName]  = useState(null);
  const inputRef                  = useRef(null);
  function accept(file) {
    if (!file) return;
    setFileName(file.type === 'application/pdf' ? file.name : null);
    onFile(file);
  }
  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    accept(e.dataTransfer.files[0]);
  }
  function handleDrag(e, active) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(active);
  }
  function clear(e) {
    e.stopPropagation();
    setFileName(null);
    if (inputRef.current) inputRef.current.value = '';
  }
  const active = dragging && !loading;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* ── Drop area ── */}
      <motion.div
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={e  => handleDrag(e, true)}
        onDragLeave={e => handleDrag(e, false)}
        onDrop={handleDrop}
        animate={{ scale: active ? 1.012 : 1 }}
        transition={{ duration: 0.14 }}
        style={{
          position:       'relative',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '16px',
          padding:        '48px 32px',
          borderRadius:   'var(--r-lg)',
          border:         `2px dashed ${active ? 'var(--lime)' : 'var(--border)'}`,
          background:     active ? 'var(--lime-soft)' : 'var(--c-900)',
          cursor:         loading ? 'not-allowed' : 'pointer',
          opacity:        loading ? 0.7 : 1,
          transition:     'border-color 0.18s, background 0.18s',
          userSelect:     'none',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
          disabled={loading}
          onChange={e => accept(e.target.files[0])}
        />
        {/* Loading overlay */}
        {loading && (
          <div
            style={{
              position:       'absolute',
              inset:          0,
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '12px',
              borderRadius:   'var(--r-lg)',
              background:     'rgba(13,17,23,0.85)',
              backdropFilter: 'blur(4px)',
              zIndex:         2,
            }}
          >
            <Spinner size={28} />
            <p style={{ fontSize: '13px', color: 'var(--p-mid)', fontFamily: 'var(--font-body)', margin: 0 }}>
              Processing…
            </p>
          </div>
        )}
        {/* Icon */}
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:          '52px',
            height:         '52px',
            borderRadius:   'var(--r-lg)',
            background:     active ? 'rgba(181,248,87,.15)' : 'var(--c-800)',
            border:         `1px solid ${active ? 'rgba(181,248,87,.3)' : 'var(--border)'}`,
            color:          active ? 'var(--lime)' : 'var(--p-low)',
            transition:     'all 0.18s',
          }}
        >
          <FiUploadCloud size={22} />
        </div>
        {/* Text */}
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: '600',
              fontSize:   '15px',
              color:      active ? 'var(--lime)' : 'var(--p-high)',
              margin:     '0 0 6px',
              transition: 'color 0.15s',
            }}
          >
            {active ? 'Drop your resume' : 'Upload your resume'}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--p-low)', fontFamily: 'var(--font-body)', margin: 0 }}>
            Drag & drop or click to browse — PDF only
          </p>
        </div>
      </motion.div>
      {/* ── File pill (after selection) ── */}
      {fileName && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            gap:            '10px',
            padding:        '10px 14px',
            borderRadius:   'var(--r-md)',
            background:     'var(--c-800)',
            border:         '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <FiFileText size={13} style={{ color: 'var(--lime)', flexShrink: 0 }} />
            <span
              style={{
                fontSize:     '13px',
                fontFamily:   'var(--font-body)',
                color:        'var(--p-mid)',
                overflow:     'hidden',
                textOverflow: 'ellipsis',
                whiteSpace:   'nowrap',
              }}
            >
              {fileName}
            </span>
          </div>
          <button
            onClick={clear}
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              padding:        '4px',
              borderRadius:   'var(--r-sm)',
              border:         'none',
              background:     'transparent',
              color:          'var(--p-low)',
              cursor:         'pointer',
              transition:     'color 0.12s',
              flexShrink:     0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--p-low)'}
            title="Clear"
          >
            <FiX size={13} />
          </button>
        </motion.div>
      )}
    </div>
  );
}
