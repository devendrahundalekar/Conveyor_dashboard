import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AlertsTable from '../components/AlertsTable';
import BeltHealthGauge from '../components/BeltHealthGauge';
import BeltInspection from '../components/BeltInspection';
import PredictionPanel from '../components/PredictionPanel';
import Section from '../components/Section';
import SensorCard from '../components/SensorCard';
import VibrationAnalysis from '../components/VibrationAnalysis';
import { CONFIG } from '../config';
import { useMonitoring } from '../context/MonitoringContext';
import { evaluate, LIMITS } from '../lib/status';

export default function Dashboard() {
  const { telemetry: t, history, alerts, isDemoRunning, startDemo, stopDemo } = useMonitoring();
  const [actionText, setActionText] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const scrollTarget = searchParams.get('scroll');
    if (scrollTarget) {
      setTimeout(() => {
        const el = document.getElementById(scrollTarget);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-[#0b4ea2]', 'ring-offset-2');
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-[#0b4ea2]', 'ring-offset-2');
          }, 2500);
        }
      }, 150);
    }
  }, [searchParams]);

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionText.trim()) return;
    setActionSuccess(`Action logged: "${actionText.trim()}"`);
    setActionText('');
    setTimeout(() => setActionSuccess(null), 4000);
  };

  // Derive defect counts from existing alerts / telemetry
  const defectCounts = isDemoRunning
    ? {
        edge: alerts.filter((a) => a.detection.toLowerCase().includes('edge')).length || 3,
        scratch: alerts.filter((a) => a.detection.toLowerCase().includes('scratch')).length || 3,
        crack: alerts.filter((a) => a.detection.toLowerCase().includes('crack')).length || 4,
      }
    : {
        edge: 0,
        scratch: 0,
        crack: 0,
      };

  // Display alerts for the top banner
  const displayAlerts = isDemoRunning
    ? alerts.length >= 2
      ? alerts.slice(0, 2)
      : [
          { id: 'sample-1', detection: 'Tear, Scratch & Crack detected', timeAgo: '45 min ago' },
          { id: 'sample-2', detection: 'Edge Defect detected', timeAgo: '20 min ago' },
        ]
    : [];

  return (
    <div className="space-y-4">
      {/* Top Banner Row: Latest Alerts & Action Bar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Latest Alerts Card (from screenshot) */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200/90 bg-white p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[#0b4ea2] text-base font-bold flex items-center gap-1.5">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Latest Alerts
            </span>
          </div>

          {displayAlerts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayAlerts.map((alt, idx) => (
                <div
                  key={alt.id ?? idx}
                  className="bg-[#e76059] text-white p-3 rounded-lg shadow-sm flex flex-col justify-between"
                >
                  <div className="font-bold text-sm tracking-tight leading-snug">
                    {alt.detection}
                  </div>
                  <div className="text-xs text-white/80 font-medium mt-2">
                    {'timeAgo' in alt ? alt.timeAgo : 'Just now'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold">No active alerts · System Normal</span>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                0 Alerts
              </span>
            </div>
          )}
        </div>

        {/* Enter Action Quick Input (from screenshot) */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200/90 bg-white p-4 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Quick Response Action</span>
              {actionSuccess && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {actionSuccess}
                </span>
              )}
            </div>
            <form onSubmit={handleActionSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                placeholder="Enter action"
                className="flex-1 rounded-lg border border-slate-300 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0b4ea2]"
              />
              <button
                type="submit"
                title="Acknowledge / Submit Action"
                className="p-2 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setActionText('')}
                title="Cancel"
                className="p-2 rounded-full border border-red-300 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setActionText('Schedule joint splice inspection')}
                title="Reset / Auto Suggest"
                className="p-2 rounded-full border border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </form>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Plant-01 · CV-04 Iron Ore Main Overland Line</span>
            <div className="flex items-center gap-2.5">
              <span>Speed: {t?.rpm ?? 820} RPM</span>
              {CONFIG.USE_MOCK && (
                <button
                  type="button"
                  onClick={isDemoRunning ? stopDemo : startDemo}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isDemoRunning
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                  title={isDemoRunning ? 'Stop continuous telemetry' : 'Start continuous telemetry'}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isDemoRunning ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <span>{isDemoRunning ? 'Stop Demo' : 'Start Demo'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Side (Top 1 & Top 2 Video Feeds) | Right Side (Health Status, Defect Type, Material) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Dual Inspection Camera Feeds (Top 1 & Top 2) */}
        <div className="lg:col-span-7">
          <BeltInspection />
        </div>

        {/* Right: Health Status, Defect type Shift, Material on belt */}
        <div className="lg:col-span-5 space-y-4">
          {/* Health Status Card with Semicircular Needle Gauge */}
          <div
            id="sensor-belt_health"
            className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-card scroll-mt-20 transition-all duration-300"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2">
              <span className="text-[#0b4ea2] text-sm font-bold flex items-center gap-1.5">
                <span className="text-amber-500">⚡</span>
                Health Status
              </span>
            </div>
            <BeltHealthGauge value={t?.belt_health ?? null} />
          </div>

          {/* Defect Type (Current Shift) */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <span className="text-[#0b4ea2] text-sm font-bold flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#0b4ea2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Defect type
              </span>
              <span className="text-xs font-bold text-slate-500">Current Shift</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    ▦
                  </div>
                  <span className="text-sm font-semibold text-slate-800">Edge Damage</span>
                </div>
                <span className="px-3 py-0.5 rounded text-xs font-bold bg-[#e76059] text-white">
                  {defectCounts.edge}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                    ☶
                  </div>
                  <span className="text-sm font-semibold text-slate-800">Scratch</span>
                </div>
                <span className="px-3 py-0.5 rounded text-xs font-bold bg-[#e76059] text-white">
                  {defectCounts.scratch}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    ⚡
                  </div>
                  <span className="text-sm font-semibold text-slate-800">Crack</span>
                </div>
                <span className="px-3 py-0.5 rounded text-xs font-bold bg-[#e76059] text-white">
                  {defectCounts.crack}
                </span>
              </div>
            </div>
          </div>

          {/* Current Material on Belt & Foreign Objects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Material Card */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-card">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0b4ea2] mb-2">
                <span className="text-blue-500">📦</span>
                <span>Current material</span>
              </div>
              <div className="bg-slate-700 text-white rounded-lg p-2.5">
                <div className="text-sm font-bold">
                  {isDemoRunning && t?.load && t.load > 1 ? 'Iron Ore (Loaded)' : 'Empty belt (Idle)'}
                </div>
                <div className="text-xs text-white/70 mt-0.5">
                  {isDemoRunning && t?.load ? `${t.load.toFixed(1)} kg chute feed` : '0 kg · Conveyor stopped'}
                </div>
              </div>
            </div>

            {/* Foreign Objects Card */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-card">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0b4ea2] mb-2">
                <span className="text-amber-500">🔍</span>
                <span>Foreign objects</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  <span className="text-xs font-semibold text-slate-700">Last 1 hour</span>
                </div>
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#e76059] text-white">
                  0
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Array (Vibration, Temperature, Load, RPM) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SensorCard
          title="Vibration"
          value={t?.vibration ?? null}
          digits={2}
          unit="g"
          status={t ? evaluate(t.vibration, LIMITS.vibration) : null}
          history={history}
          dataKey="vibration"
        />
        <SensorCard
          title="Bearing Temperature"
          value={t?.temperature ?? null}
          digits={0}
          unit="°C"
          status={t ? evaluate(t.temperature, LIMITS.temperature) : null}
          history={history}
          dataKey="temperature"
        />
        <SensorCard
          title="Chute Material Load"
          value={t?.load ?? null}
          digits={1}
          unit="kg"
          status={t ? evaluate(t.load, LIMITS.load) : null}
          history={history}
          dataKey="load"
        />
        <SensorCard
          title="Drive Pulley RPM"
          value={t?.rpm ?? null}
          digits={0}
          unit="rpm"
          status={t ? evaluate(t.rpm, LIMITS.rpm) : null}
          history={history}
          dataKey="rpm"
        />
      </div>

      {/* AI Health Prediction & Vibration Analysis */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Section title="AI Health Prediction & Recommendation" className="lg:col-span-3">
          <PredictionPanel telemetry={t} />
        </Section>
        <Section title="Vibration Waveform Analysis" className="lg:col-span-2">
          <VibrationAnalysis telemetry={t} />
        </Section>
      </div>

      {/* Recent Alerts Log */}
      <Section
        title="Incident & Defect Alerts Log"
        action={
          <Link to="/alerts" className="text-sm font-semibold text-[#0b4ea2] hover:underline">
            View all alerts &rarr;
          </Link>
        }
      >
        <AlertsTable alerts={alerts.slice(0, 5)} />
      </Section>
    </div>
  );
}
