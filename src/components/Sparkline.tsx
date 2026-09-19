import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';
import type { HistoryPoint } from '../types';

interface Props {
  data: HistoryPoint[];
  dataKey: 'rpm' | 'temperature' | 'load' | 'vibration';
  color: string;
}

/** Small real-time trend line for the last N readings. */
export default function Sparkline({ data, dataKey, color }: Props) {
  return (
    <div className="h-14" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
          <YAxis hide domain={['auto', 'auto']} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.75} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
