import { HEALTH_PREDICTION_LABEL, HEALTH_PREDICTION_STATUS, healthStatus, TONE } from '../lib/status';
import type { Telemetry } from '../types';
import AndonTower from './AndonTower';

function Metric({ label, value, unit, tone }: { label: string; value: string; unit?: string; tone?: string }) {
  return (
    <div>
      <div className="text-sm text-mute">{label}</div>
      <div className={`font-display text-4xl font-semibold leading-tight ${tone ?? 'text-ink'}`}>
        {value}
        {unit && <span className="ml-1.5 text-lg font-medium text-mute">{unit}</span>}
      </div>
    </div>
  );
}

export default function StatusHero({ telemetry }: { telemetry: Telemetry | null }) {
  const status = telemetry?.overall_status ?? null;
  const tone = status ? TONE[status] : null;
  const hp = telemetry?.health_prediction;

  return (
    <section
      className={`rounded-md border bg-panel p-5 ${tone ? tone.border : 'border-line'}`}
      aria-live="polite"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <AndonTower status={status} />
          <div>
            <div className="text-sm text-mute">Conveyor status</div>
            <div className={`font-display text-5xl font-bold leading-none tracking-wide sm:text-7xl ${tone?.text ?? 'text-mute'}`}>
              {status ?? 'NO DATA'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 border-t border-line pt-4 md:border-l md:border-t-0 md:pl-8 md:pt-0">
          <Metric label="RPM" value={telemetry ? String(telemetry.rpm) : '—'} unit={telemetry ? 'rpm' : undefined} />
          <Metric
            label="Belt health"
            value={telemetry ? `${telemetry.belt_health}%` : '—'}
            tone={telemetry ? TONE[healthStatus(telemetry.belt_health)].text : undefined}
          />
          <Metric
            label="AI prediction"
            value={hp ? HEALTH_PREDICTION_LABEL[hp] : '—'}
            tone={hp ? TONE[HEALTH_PREDICTION_STATUS[hp]].text : undefined}
          />
        </div>
      </div>
    </section>
  );
}
