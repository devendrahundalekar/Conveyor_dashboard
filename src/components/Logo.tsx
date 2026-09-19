/** Project logo placeholder – replace this SVG (or use an <img>) with your own logo. */
export default function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Project logo placeholder">
      <rect x="1" y="1" width="46" height="46" rx="6" fill="#20272e" stroke="#2b333b" />
      <path d="M13 17h22M13 31h22" stroke="#5aa9e6" strokeWidth="2.5" strokeLinecap="square" />
      <circle cx="13" cy="24" r="7" fill="#12161a" stroke="#5aa9e6" strokeWidth="2.5" />
      <circle cx="35" cy="24" r="7" fill="#12161a" stroke="#5aa9e6" strokeWidth="2.5" />
      <circle cx="13" cy="24" r="1.8" fill="#f0a21b" />
      <circle cx="35" cy="24" r="1.8" fill="#f0a21b" />
    </svg>
  );
}
