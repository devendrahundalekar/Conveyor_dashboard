import { TONE } from '../lib/status';
import type { Status } from '../types';

const LAMPS: { status: Status; cy: number }[] = [
  { status: 'CRITICAL', cy: 20 },
  { status: 'WARNING', cy: 52 },
  { status: 'NORMAL', cy: 84 },
];

/** Stack light (andon tower) as used on factory and mining equipment. The active state is lit. */
export default function AndonTower({ status }: { status: Status | null }) {
  return (
    <svg viewBox="0 0 56 130" className="h-28 w-auto shrink-0" role="img" aria-label={`Status light: ${status ?? 'no data'}`}>
      <rect x="8" y="4" width="40" height="104" rx="8" fill="#12161a" stroke="#2b333b" />
      {LAMPS.map((l) => {
        const lit = status === l.status;
        const hex = TONE[l.status].hex;
        return (
          <g key={l.status}>
            {lit && <circle cx="28" cy={l.cy} r="17" fill={hex} opacity="0.22" />}
            <circle cx="28" cy={l.cy} r="12" fill={lit ? hex : '#242b32'} stroke={lit ? hex : '#2b333b'} />
          </g>
        );
      })}
      <rect x="22" y="108" width="12" height="16" fill="#2b333b" />
      <rect x="14" y="122" width="28" height="6" rx="1" fill="#2b333b" />
    </svg>
  );
}
