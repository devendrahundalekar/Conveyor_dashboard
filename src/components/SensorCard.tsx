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
  // Graph is steel blue while normal, and takes the status colour otherwise.
  const color = status && status !== 'NORMAL' ? TONE[status].hex : '#5aa9e6';

  return (
    <div className="rounded-md border border-line bg-panel p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-medium text-mute">{title}</h3>
        {status && <StatusBadge status={status} />}
      </div>
      <div className="mt-2 font-display text-5xl font-semibold leading-none">
        {value === null ? '—' : value.toFixed(digits)}
        <span className="ml-1.5 text-xl font-medium text-mute">{unit}</span>
      </div>
      <div className="mt-3">
        <Sparkline data={history} dataKey={dataKey} color={color} />
      </div>
    </div>
  );
}
