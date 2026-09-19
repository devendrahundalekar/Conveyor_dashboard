import { TONE } from '../lib/status';
import type { Status } from '../types';

export default function StatusBadge({ status, label }: { status: Status; label?: string }) {
  const tone = TONE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold tracking-wide ${tone.soft} ${tone.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.bg}`} aria-hidden />
      {label ?? status}
    </span>
  );
}
