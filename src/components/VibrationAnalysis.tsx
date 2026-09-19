import type { ReactNode } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, YAxis } from 'recharts';
import { evaluate, LIMITS, TONE } from '../lib/status';
import type { Telemetry } from '../types';
import StatusBadge from './StatusBadge';

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-sm text-mute">{label}</div>
      <div className="font-display text-3xl font-semibold leading-tight">{children}</div>
    </div>
  );
}

export default function VibrationAnalysis({ telemetry }: { telemetry: Telemetry | null }) {
  const samples = telemetry?.vibration_waveform ?? [];
  const data = samples.map((v, i) => ({ i, v }));

  const rms = samples.length ? Math.sqrt(samples.reduce((s, v) => s + v * v, 0) / samples.length) : null;
  const peak = samples.length ? Math.max(...samples.map(Math.abs)) : null;
  const status = rms === null ? null : evaluate(rms, LIMITS.vibration);
  const color = status && status !== 'NORMAL' ? TONE[status].hex : '#5aa9e6';

  if (!samples.length) {
    return <p className="text-mute">No waveform received. Send "vibration_waveform" (array of g values) in the telemetry.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="h-40" aria-label="Vibration waveform" role="img">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: 6, bottom: 6, left: 0 }}>
            <CartesianGrid stroke="#2b333b" strokeDasharray="3 3" vertical={false} />
            <YAxis
              width={40}
              stroke="#8b96a1"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => v.toFixed(1)}
              domain={['auto', 'auto']}
            />
            <ReferenceLine y={0} stroke="#3a444d" />
            <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Stat label="RMS">
          {rms!.toFixed(2)}
          <span className="ml-1 text-base font-medium text-mute">g</span>
        </Stat>
        <Stat label="Peak">
          {peak!.toFixed(2)}
          <span className="ml-1 text-base font-medium text-mute">g</span>
        </Stat>
        <Stat label="Status">
          <div className="pt-1.5">{status && <StatusBadge status={status} />}</div>
        </Stat>
      </div>
    </div>
  );
}
