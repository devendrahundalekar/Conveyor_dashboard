export default function Logo({ className = 'h-8' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 font-sans font-bold tracking-tight text-white select-none ${className}`}>
      <span className="relative flex items-center justify-center text-2xl">
        <span className="font-extrabold text-white text-[26px]">O</span>
        <svg
          viewBox="0 0 32 32"
          className="absolute -top-1 -left-1 w-9 h-9 pointer-events-none stroke-white/80"
          fill="none"
          strokeWidth="2.2"
        >
          <ellipse cx="16" cy="16" rx="14.5" ry="6.5" transform="rotate(-30 16 16)" />
        </svg>
      </span>
      <span className="text-[21px] font-semibold tracking-tight ml-0.5 text-white">
        rbit
      </span>
    </div>
  );
}
