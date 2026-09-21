import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import AlertsTable from '../components/AlertsTable';
import Section from '../components/Section';
import { useMonitoring } from '../context/MonitoringContext';

export default function AlertsPage() {
  const { alerts } = useMonitoring();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  const [profileFilter, setProfileFilter] = useState('All');
  const [localSearch, setLocalSearch] = useState(urlSearch);

  // Sync state if URL changes
  const activeSearch = urlSearch || localSearch;

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    const newParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      newParams.set('search', value);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams, { replace: true });
  };

  const clearSearch = () => {
    setLocalSearch('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    setSearchParams(newParams, { replace: true });
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      // Profile filter
      if (profileFilter === 'Camera Vision AI' && !a.source.toLowerCase().includes('camera')) return false;
      if (profileFilter === 'Vibration Accelerometer' && !a.source.toLowerCase().includes('vibration')) return false;
      if (profileFilter === 'Temperature Sensor' && !a.source.toLowerCase().includes('temperature')) return false;

      // Text search
      if (activeSearch.trim()) {
        const q = activeSearch.toLowerCase().trim();
        const matchesDetection = a.detection.toLowerCase().includes(q);
        const matchesSource = a.source.toLowerCase().includes(q);
        const matchesSeverity = a.severity.toLowerCase().includes(q);
        if (!matchesDetection && !matchesSource && !matchesSeverity) {
          return false;
        }
      }

      return true;
    });
  }, [alerts, profileFilter, activeSearch]);

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
        <div className="flex flex-wrap items-center gap-3">
          <select className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
            <option>All Plants</option>
            <option>Plant-01 Main Conveyor Line</option>
          </select>
          <select
            value={profileFilter}
            onChange={(e) => setProfileFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0b4ea2]"
          >
            <option value="All">All Profiles</option>
            <option value="Camera Vision AI">Camera Vision AI</option>
            <option value="Vibration Accelerometer">Vibration Accelerometer</option>
            <option value="Temperature Sensor">Temperature Sensor</option>
          </select>

          {/* In-page search filter box */}
          <div className="relative">
            <input
              type="text"
              value={activeSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Filter alerts..."
              className="rounded-lg border border-slate-300 bg-slate-50 pl-7 pr-7 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0b4ea2]"
            />
            <svg
              className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {activeSearch && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {activeSearch && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600">
              Matching <span className="text-[#0b4ea2] font-bold">"{activeSearch}"</span>: {filteredAlerts.length} of {total}
            </span>
            <button
              onClick={clearSearch}
              className="font-bold text-[#0b4ea2] hover:underline"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Full Alerts Table */}
      <Section
        title="Historical Alerts & Maintenance Incidents"
        action={
          activeSearch || profileFilter !== 'All' ? (
            <span className="text-xs font-semibold text-slate-500">
              Filtered: {filteredAlerts.length} alerts
            </span>
          ) : undefined
        }
      >
        <AlertsTable alerts={filteredAlerts} />
      </Section>
    </div>
  );
}

