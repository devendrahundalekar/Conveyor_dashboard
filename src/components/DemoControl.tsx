import { useState, useEffect, type FormEvent } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { LIMITS, evaluate, healthStatus, IMAGE_SEVERITY, SEVERITY_STATUS } from '../lib/status';
import type { ImageClass, Scenario, Status } from '../types';

const DEFECT_OPTIONS: { label: string; value: ImageClass }[] = [
  { label: 'Healthy Belt (No Defect)', value: 'HEALTHY' },
  { label: 'Belt Joint Damage (Warning)', value: 'JOINT_DAMAGE' },
  { label: 'Belt Crack (Warning)', value: 'CRACK' },
  { label: 'Belt Tear (Critical)', value: 'TEAR' },
  { label: 'Edge Damage (Warning)', value: 'EDGE_DAMAGE' },
  { label: 'Severe Damage (Critical)', value: 'SEVERE_DAMAGE' },
];

export default function DemoControl() {
  const { scenario, setScenario, customData, updateCustomData } = useMonitoring();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  // Form state for custom data input
  const [rpm, setRpm] = useState(customData.rpm);
  const [temperature, setTemperature] = useState(customData.temperature);
  const [load, setLoad] = useState(customData.load);
  const [vibration, setVibration] = useState(customData.vibration);
  const [health, setHealth] = useState(customData.health);
  const [image, setImage] = useState<ImageClass>(customData.image);
  const [appliedNotice, setAppliedNotice] = useState(false);

  // Sync state if customData changes
  useEffect(() => {
    setRpm(customData.rpm);
    setTemperature(customData.temperature);
    setLoad(customData.load);
    setVibration(customData.vibration);
    setHealth(customData.health);
    setImage(customData.image);
  }, [customData]);

  // Handle escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKey);
    }
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const handleApplyCustom = (e?: FormEvent) => {
    if (e) e.preventDefault();
    updateCustomData({
      rpm: Number(rpm),
      temperature: Number(temperature),
      load: Number(load),
      vibration: Number(vibration),
      health: Number(health),
      image,
    });
    setAppliedNotice(true);
    setTimeout(() => {
      setAppliedNotice(false);
      setIsOpen(false);
    }, 700);
  };

  const handleSelectScenario = (s: Exclude<Scenario, 'custom'>) => {
    setScenario(s);
    if (s === 'normal') {
      setRpm(820);
      setTemperature(38);
      setLoad(2.4);
      setVibration(0.32);
      setHealth(94);
      setImage('HEALTHY');
    } else if (s === 'warning') {
      setRpm(820);
      setTemperature(66);
      setLoad(4.3);
      setVibration(0.95);
      setHealth(71);
      setImage('JOINT_DAMAGE');
    } else if (s === 'critical') {
      setRpm(480);
      setTemperature(86);
      setLoad(5.4);
      setVibration(1.7);
      setHealth(38);
      setImage('SEVERE_DAMAGE');
    }
    setIsOpen(false);
  };

  // Preview status calculation for custom inputs
  const vibStat = evaluate(vibration, LIMITS.vibration);
  const tempStat = evaluate(temperature, LIMITS.temperature);
  const loadStat = evaluate(load, LIMITS.load);
  const rpmStat = evaluate(rpm, LIMITS.rpm);
  const hltStat = healthStatus(health);
  const imgStat = SEVERITY_STATUS[IMAGE_SEVERITY[image]];
  const allStats: Status[] = [vibStat, tempStat, loadStat, rpmStat, hltStat, imgStat];
  const rank: Record<Status, number> = { NORMAL: 0, WARNING: 1, CRITICAL: 2 };
  const overallStat = allStats.reduce((prev, curr) => (rank[curr] > rank[prev] ? curr : prev), 'NORMAL');

  // Trigger button styling
  const pillStyle = {
    normal: 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
    warning: 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100',
    critical: 'border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100',
    custom: 'border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100',
  }[scenario];

  const dotStyle = {
    normal: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-rose-500 animate-pulse',
    custom: 'bg-blue-500',
  }[scenario];

  const scenarioLabel = {
    normal: 'Normal',
    warning: 'Warning',
    critical: 'Critical',
    custom: 'Custom Input',
  }[scenario];

  return (
    <>
      {/* Interactive Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#0b4ea2] cursor-pointer ${pillStyle}`}
        title="Click to change demo scenario or input custom sensor data"
      >
        <span className={`w-2 h-2 rounded-full ${dotStyle}`} />
        <span>Demo: <strong className="font-bold">{scenarioLabel}</strong></span>
        <svg
          className="w-3.5 h-3.5 ml-0.5 text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Centered Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-amber-500 text-lg">⚡</span>
                  <span>Demo Data Simulator</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulate conditions or supply custom conveyor sensor inputs
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg text-sm hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                  activeTab === 'presets'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Quick Presets
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'custom'
                    ? 'bg-white text-[#0b4ea2] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Custom Data</span>
                <span className="bg-[#0b4ea2] text-white text-[10px] px-1.5 py-0.2 rounded font-extrabold">
                  BY YOU
                </span>
              </button>
            </div>

            {/* Presets View */}
            {activeTab === 'presets' && (
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectScenario('normal')}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between cursor-pointer ${
                    scenario === 'normal'
                      ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-400'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-sm font-bold text-slate-800">Normal (Healthy Condition)</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 ml-4.5">
                      820 RPM • 38°C • 2.4T • 0.32 mm/s • 94% Health
                    </p>
                  </div>
                  {scenario === 'normal' && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Active ✓
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectScenario('warning')}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between cursor-pointer ${
                    scenario === 'warning'
                      ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-400'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-sm font-bold text-slate-800">Warning (Joint Damage)</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 ml-4.5">
                      820 RPM • 66°C • 4.3T • 0.95 mm/s • 71% Health
                    </p>
                  </div>
                  {scenario === 'warning' && (
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      Active ✓
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectScenario('critical')}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between cursor-pointer ${
                    scenario === 'critical'
                      ? 'border-rose-500 bg-rose-50/70 ring-2 ring-rose-400'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="text-sm font-bold text-slate-800">Critical (Severe Breakdown)</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 ml-4.5">
                      480 RPM • 86°C • 5.4T • 1.70 mm/s • 38% Health
                    </p>
                  </div>
                  {scenario === 'critical' && (
                    <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                      Active ✓
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Custom Data Input View (Take Data By You) */}
            {activeTab === 'custom' && (
              <form onSubmit={handleApplyCustom} className="space-y-3.5">
                {/* Temperature */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Bearing Temperature</span>
                    <span className="font-mono font-bold text-[#0b4ea2]">{temperature} °C</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="20"
                      max="100"
                      step="0.5"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-[#0b4ea2] cursor-pointer"
                    />
                    <input
                      type="number"
                      min="20"
                      max="100"
                      step="0.5"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
                      className="w-18 rounded border border-slate-300 px-2 py-1 text-xs text-right font-mono"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Normal &lt;60°C</span>
                    <span className="text-amber-600 font-medium">Warn ≥60°C</span>
                    <span className="text-rose-600 font-medium">Crit ≥80°C</span>
                  </div>
                </div>

                {/* Vibration */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Vibration (RMS)</span>
                    <span className="font-mono font-bold text-[#0b4ea2]">{vibration} mm/s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.05"
                      max="2.5"
                      step="0.05"
                      value={vibration}
                      onChange={(e) => setVibration(parseFloat(e.target.value))}
                      className="w-full accent-[#0b4ea2] cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0.05"
                      max="2.5"
                      step="0.05"
                      value={vibration}
                      onChange={(e) => setVibration(parseFloat(e.target.value) || 0)}
                      className="w-18 rounded border border-slate-300 px-2 py-1 text-xs text-right font-mono"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Normal &lt;0.80</span>
                    <span className="text-amber-600 font-medium">Warn ≥0.80</span>
                    <span className="text-rose-600 font-medium">Crit ≥1.50</span>
                  </div>
                </div>

                {/* Belt Speed (RPM) */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Belt Drive Speed</span>
                    <span className="font-mono font-bold text-[#0b4ea2]">{rpm} RPM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="350"
                      max="1150"
                      step="10"
                      value={rpm}
                      onChange={(e) => setRpm(parseInt(e.target.value, 10))}
                      className="w-full accent-[#0b4ea2] cursor-pointer"
                    />
                    <input
                      type="number"
                      min="350"
                      max="1150"
                      step="10"
                      value={rpm}
                      onChange={(e) => setRpm(parseInt(e.target.value, 10) || 0)}
                      className="w-18 rounded border border-slate-300 px-2 py-1 text-xs text-right font-mono"
                    />
                  </div>
                </div>

                {/* Load & Belt Health Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Chute Load (T)</span>
                      <span className="font-mono font-bold text-[#0b4ea2]">{load}T</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={load}
                      onChange={(e) => setLoad(parseFloat(e.target.value) || 0)}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Health Score (%)</span>
                      <span className="font-mono font-bold text-[#0b4ea2]">{health}%</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={health}
                      onChange={(e) => setHealth(parseInt(e.target.value, 10) || 0)}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* AI Camera Vision Defect */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Simulated AI Vision Defect
                  </label>
                  <select
                    value={image}
                    onChange={(e) => setImage(e.target.value as ImageClass)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b4ea2]"
                  >
                    {DEFECT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Calculated Status Preview */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Resulting Status:</span>
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded text-xs ${
                      overallStat === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : overallStat === 'WARNING'
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {overallStat}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-[#0b4ea2] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#083c7d] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>{appliedNotice ? '✓ Applied Live!' : 'Apply Custom Data'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectScenario('normal')}
                    className="px-4 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
