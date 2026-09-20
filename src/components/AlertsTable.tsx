import { clockTime } from '../lib/status';
import type { Alert } from '../types';
import StatusBadge from './StatusBadge';

export default function AlertsTable({ alerts }: { alerts: Alert[] }) {
  if (!alerts.length) return <p className="text-slate-500 py-3 text-sm">No active alerts. All conveyor parameters within limits.</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-[500px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
          <tr>
            <th className="py-3 px-4">Time</th>
            <th className="py-3 px-4">Source</th>
            <th className="py-3 px-4">Detection Reason</th>
            <th className="py-3 px-4">Severity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {alerts.map((a) => (
            <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="py-3 px-4 text-slate-500 font-mono text-xs">{clockTime(a.time)}</td>
              <td className="py-3 px-4 font-semibold text-slate-800">{a.source}</td>
              <td className="py-3 px-4 text-slate-700">{a.detection}</td>
              <td className="py-3 px-4">
                <StatusBadge status={a.severity === 'Critical' ? 'CRITICAL' : 'WARNING'} label={a.severity} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
