export default function SkeletonBlock({ style = {}, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      aria-hidden="true"
      style={style}
    />
  );
}
