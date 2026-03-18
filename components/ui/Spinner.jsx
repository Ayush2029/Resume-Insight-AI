/**
 * components/ui/Spinner.jsx
 */
export default function Spinner({ size = 20, color = 'var(--lime)' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      role="img"
      aria-label="Loading"
      style={{ flexShrink: 0 }}
    >
      <circle
        cx="12" cy="12" r="9"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="28"
        strokeDashoffset="21"
        opacity="0.9"
      />
    </svg>
  );
}
