import { clockTime } from '../lib/status';
import type { Alert } from '../types';
import StatusBadge from './StatusBadge';

export default function AlertsTable({ alerts }: { alerts: Alert[] }) {
  if (!alerts.length) return <p className="text-mute">No alerts. Everything is within limits.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead className="text-mute">
          <tr className="border-b border-line">
            <th className="py-2 pr-4 font-medium">Time</th>
            <th className="py-2 pr-4 font-medium">Source</th>
            <th className="py-2 pr-4 font-medium">Detection</th>
            <th className="py-2 font-medium">Severity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {alerts.map((a) => (
            <tr key={a.id}>
              <td className="py-2.5 pr-4 text-mute">{clockTime(a.time)}</td>
              <td className="py-2.5 pr-4">{a.source}</td>
              <td className="py-2.5 pr-4">{a.detection}</td>
              <td className="py-2.5">
                <StatusBadge status={a.severity === 'Critical' ? 'CRITICAL' : 'WARNING'} label={a.severity} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
