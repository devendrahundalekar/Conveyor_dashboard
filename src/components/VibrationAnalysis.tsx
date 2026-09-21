import type { ReactNode } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, YAxis } from 'recharts';
import { evaluate, LIMITS, TONE } from '../lib/status';
import type { Telemetry } from '../types';
import StatusBadge from './StatusBadge';

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-2xl font-bold text-slate-800 mt-1 leading-tight">{children}</div>
    </div>
  );
}

export default function VibrationAnalysis({ telemetry }: { telemetry: Telemetry | null }) {
  const samples = telemetry?.vibration_waveform ?? [];
  const data = samples.map((v, i) => ({ i, v }));

  const rms = samples.length ? Math.sqrt(samples.reduce((s, v) => s + v * v, 0) / samples.length) : null;
  const peak = samples.length ? Math.max(...samples.map(Math.abs)) : null;
  const status = rms === null ? null : evaluate(rms, LIMITS.vibration);
  const color = status && status !== 'NORMAL' ? TONE[status].hex : '#0b4ea2';

  if (!samples.length) {
    return <p className="text-slate-500 py-3 text-sm">No waveform received. Waiting for vibration telemetry samples.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="h-40 bg-slate-50/70 p-2 rounded-lg border border-slate-100" aria-label="Vibration waveform" role="img">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: 6, bottom: 6, left: 0 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <YAxis
              width={38}
              stroke="#64748b"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => v.toFixed(1)}
              domain={data.every((d) => d.v === 0) ? [-0.5, 0.5] : ['auto', 'auto']}
            />
            <ReferenceLine y={0} stroke="#cbd5e1" />
            <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4 pt-1">
        <Stat label="RMS Vibration">
          {rms!.toFixed(2)}
          <span className="ml-1 text-xs font-semibold text-slate-500">g</span>
        </Stat>
        <Stat label="Peak Vibration">
          {peak!.toFixed(2)}
          <span className="ml-1 text-xs font-semibold text-slate-500">g</span>
        </Stat>
        <Stat label="Status">
          <div className="pt-1">{status && <StatusBadge status={status} />}</div>
        </Stat>
      </div>
    </div>
  );
}
