import { HEALTH_LABEL, healthStatus } from '../lib/status';

export default function BeltHealthGauge({ value }: { value: number | null }) {
  const pctValue = value === null ? 85 : Math.max(0, Math.min(100, value));
  const status = value === null ? 'NORMAL' : healthStatus(pctValue);

  // Status mapping
  const isWarning = status === 'WARNING';
  const isCritical = status === 'CRITICAL';

  // 100% health points left (green/normal), lower health points right (red/critical)
  // angle in degrees where 180 = far left, 0 = far right
  const angleDeg = 180 - ((100 - pctValue) / 100) * 180;
  const needleRad = (angleDeg * Math.PI) / 180;

  const cx = 120;
  const cy = 110;
  const r1 = 62;
  const r2 = 82;

  // Generate ticks from 180° down to 0°
  const tickCount = 33;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const fraction = i / (tickCount - 1);
    const deg = 180 - fraction * 180;
    const rad = (deg * Math.PI) / 180;
    const x1 = cx + r1 * Math.cos(rad);
    const y1 = cy - r1 * Math.sin(rad);
    const x2 = cx + r2 * Math.cos(rad);
    const y2 = cy - r2 * Math.sin(rad);

    let color = '#10b981'; // green
    if (fraction > 0.35 && fraction <= 0.65) color = '#f59e0b'; // orange/amber
    if (fraction > 0.65) color = '#ef4444'; // red

    return { x1, y1, x2, y2, color };
  });

  const needleLen = 72;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy - needleLen * Math.sin(needleRad);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-2">
      {/* Left Box: Square status indicator box with label */}
      <div className="flex items-center gap-3.5">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-sm border ${
            isCritical
              ? 'bg-red-500 border-red-700 shadow-red-200'
              : isWarning
              ? 'bg-amber-500 border-amber-600 shadow-amber-200'
              : 'bg-emerald-500 border-emerald-600 shadow-emerald-200'
          }`}
        >
          <div className="w-5 h-5 rounded border border-white/50 bg-white/20" />
        </div>
        <div>
          <span className="text-[17px] font-bold text-[#0b4ea2] tracking-tight block">
            {HEALTH_LABEL[status]}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Health: {pctValue}%
          </span>
        </div>
      </div>

      {/* Right Box: Semicircular Needle Gauge */}
      <div className="relative flex flex-col items-center">
        {/* Status text above needle */}
        <span
          className={`text-sm font-bold tracking-wide mb-1 ${
            isCritical ? 'text-red-500' : isWarning ? 'text-amber-600' : 'text-emerald-600'
          }`}
        >
          {status === 'WARNING' ? 'Needs Attention' : status === 'CRITICAL' ? 'Critical Failure' : 'Optimal Health'}
        </span>

        <svg viewBox="0 0 240 120" className="w-56 h-28 overflow-visible" role="img" aria-label={`Health gauge ${pctValue}%`}>
          {/* Radiating Ticks */}
          {ticks.map((t, idx) => (
            <line
              key={idx}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.color}
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          ))}

          {/* Pivot Base */}
          <circle cx={cx} cy={cy} r="6" fill="#0b4ea2" />

          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={nx}
            y2={ny}
            stroke="#0b4ea2"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
      </div>
    </div>
  );
}
