import { TONE } from '../lib/status';
import type { HistoryPoint, Status } from '../types';
import Sparkline from './Sparkline';
import StatusBadge from './StatusBadge';

interface Props {
  title: string;
  value: number | null;
  digits: number;
  unit: string;
  status: Status | null;
  history: HistoryPoint[];
  dataKey: 'rpm' | 'temperature' | 'load' | 'vibration';
}

export default function SensorCard({ title, value, digits, unit, status, history, dataKey }: Props) {
  // Graph is Orbit blue while normal, and takes the status colour otherwise.
  const color = status && status !== 'NORMAL' ? TONE[status].hex : '#0b4ea2';

  return (
    <div
      id={`sensor-${dataKey}`}
      className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-card flex flex-col justify-between transition-all duration-300 scroll-mt-20"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h3>
        {status && <StatusBadge status={status} />}
      </div>
      <div className="my-2.5 flex items-baseline">
        <span className="text-3xl font-extrabold tracking-tight text-slate-800">
          {value === null ? '—' : value.toFixed(digits)}
        </span>
        <span className="ml-1.5 text-xs font-semibold text-slate-500">{unit}</span>
      </div>
      <div className="mt-1">
        <Sparkline data={history} dataKey={dataKey} color={color} />
      </div>
    </div>
  );
}
