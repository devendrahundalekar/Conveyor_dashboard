import AlertsTable from '../components/AlertsTable';
import Section from '../components/Section';
import { useMonitoring } from '../context/MonitoringContext';

export default function AlertsPage() {
  const { alerts } = useMonitoring();

  const total = alerts.length;
  const highSev = alerts.filter((a) => a.severity === 'Critical').length;
  const medSev = alerts.filter((a) => a.severity === 'Warning').length;

  return (
    <div className="space-y-4">
      {/* KPI Cards from Reference Photo 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Alerts & Time to Action */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase text-slate-500">Total Alerts</span>
            <span className="text-2xl font-black text-[#0b4ea2]">{total}</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold uppercase text-slate-500">Time To Action</span>
            <span className="text-sm font-bold text-slate-700">{total > 0 ? '< 5 min' : 'N/A'}</span>
          </div>
        </div>

        {/* Last Alert & Preventable */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase text-slate-500">Last Alert</span>
            <span className="text-sm font-bold text-slate-700">{total > 0 ? 'Active' : 'No Alerts'}</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold uppercase text-slate-500">Preventable</span>
            <span className="text-sm font-bold text-slate-700">{total > 0 ? total : 0}</span>
          </div>
        </div>

        {/* Resolution Status Badges */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-card grid grid-cols-3 gap-2 text-center">
          <div className="bg-emerald-500 text-white rounded-lg p-2">
            <div className="text-[11px] font-semibold">Resolved</div>
            <div className="text-lg font-bold">0</div>
          </div>
          <div className="bg-amber-500 text-white rounded-lg p-2">
            <div className="text-[11px] font-semibold">Unresolved</div>
            <div className="text-lg font-bold">{total}</div>
          </div>
          <div className="bg-[#e76059] text-white rounded-lg p-2">
            <div className="text-[11px] font-semibold">Overdue</div>
            <div className="text-lg font-bold">0</div>
          </div>
        </div>

        {/* Severity Count Badges */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-card grid grid-cols-3 gap-2 text-center">
          <div className="bg-red-200 text-red-900 rounded-lg p-2">
            <div className="text-[11px] font-semibold">Low</div>
            <div className="text-lg font-bold">0</div>
          </div>
          <div className="bg-red-400 text-white rounded-lg p-2">
            <div className="text-[11px] font-semibold">Medium</div>
            <div className="text-lg font-bold">{medSev}</div>
          </div>
          <div className="bg-red-600 text-white rounded-lg p-2">
            <div className="text-[11px] font-semibold">High</div>
            <div className="text-lg font-bold">{highSev}</div>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-3 shadow-card flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
            <option>All Plants</option>
            <option>Plant-01 Main Conveyor Line</option>
          </select>
          <select className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
            <option>All Profiles</option>
            <option>Camera Vision AI</option>
            <option>Vibration Accelerometer</option>
            <option>Temperature Sensor</option>
          </select>
        </div>
        <button className="rounded-lg bg-[#0b4ea2] px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#083c7d] transition-colors">
          SHOW ALERTS
        </button>
      </div>

      {/* Full Alerts Table */}
      <Section title="Historical Alerts & Maintenance Incidents">
        <AlertsTable alerts={alerts} />
      </Section>
    </div>
  );
}
