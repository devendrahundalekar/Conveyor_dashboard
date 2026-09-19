import { HEALTH_LABEL, healthStatus, TONE } from '../lib/status';

export default function BeltHealthGauge({ value }: { value: number | null }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pctValue = value === null ? 0 : Math.max(0, Math.min(100, value));
  const status = value === null ? null : healthStatus(pctValue);
  const tone = status ? TONE[status] : null;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 140 140" className="h-44 w-44" role="img" aria-label={`Belt health ${value ?? 'unknown'} percent`}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="#2b333b" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={tone?.hex ?? '#2b333b'}
          strokeWidth="12"
          strokeDasharray={`${(c * pctValue) / 100} ${c}`}
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
        <text x="70" y="80" textAnchor="middle" className="fill-ink font-display text-[34px] font-bold">
          {value === null ? '—' : `${pctValue}%`}
        </text>
      </svg>
      <div className={`font-display text-2xl font-semibold tracking-wide ${tone?.text ?? 'text-mute'}`}>
        {status ? HEALTH_LABEL[status] : 'NO DATA'}
      </div>
    </div>
  );
}
