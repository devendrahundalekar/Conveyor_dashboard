import {
  evaluate,
  HEALTH_PREDICTION_LABEL,
  HEALTH_PREDICTION_STATUS,
  IMAGE_LABEL,
  IMAGE_SEVERITY,
  LIMITS,
  pct,
  SENSOR_PREDICTION_STATUS,
  SEVERITY_STATUS,
  TONE,
} from '../lib/status';
import type { Status, Telemetry } from '../types';
import StatusBadge from './StatusBadge';

function InputRow({ name, value, status }: { name: string; value: string; status: Status }) {
  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <span className="text-mute">{name}</span>
      <span className="flex items-center gap-3">
        <span className="font-medium">{value}</span>
        <StatusBadge status={status} />
      </span>
    </li>
  );
}

export default function PredictionPanel({ telemetry }: { telemetry: Telemetry | null }) {
  if (!telemetry) return <p className="text-mute">Waiting for sensor data…</p>;

  const hp = telemetry.health_prediction;
  const tone = hp ? TONE[HEALTH_PREDICTION_STATUS[hp]] : null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <div className="text-sm text-mute">Belt condition</div>
        {hp ? (
          <>
            <div className={`font-display text-5xl font-bold leading-tight tracking-wide ${tone?.text}`}>
              {HEALTH_PREDICTION_LABEL[hp]}
            </div>
            <dl className="mt-3 space-y-2">
              {telemetry.health_confidence !== undefined && (
                <div className="flex gap-2">
                  <dt className="text-mute">Confidence</dt>
                  <dd className="font-medium">{pct(telemetry.health_confidence, 0)}</dd>
                </div>
              )}
              {telemetry.recommendation && (
                <div>
                  <dt className="text-mute">Recommendation</dt>
                  <dd className="font-medium">{telemetry.recommendation}</dd>
                </div>
              )}
            </dl>
          </>
        ) : (
          <p className="mt-1 text-mute">The health model has not returned a prediction yet.</p>
        )}
      </div>

      <div>
        <div className="text-sm text-mute">Model inputs</div>
        <ul className="mt-1 divide-y divide-line">
          <InputRow
            name="Vibration"
            value={`${telemetry.vibration.toFixed(2)} g`}
            status={evaluate(telemetry.vibration, LIMITS.vibration)}
          />
          <InputRow
            name="Temperature"
            value={`${telemetry.temperature.toFixed(0)}°C`}
            status={evaluate(telemetry.temperature, LIMITS.temperature)}
          />
          <InputRow name="Load" value={`${telemetry.load.toFixed(1)} kg`} status={evaluate(telemetry.load, LIMITS.load)} />
          <InputRow name="RPM" value={String(telemetry.rpm)} status={evaluate(telemetry.rpm, LIMITS.rpm)} />
          <InputRow
            name="Image inspection"
            value={IMAGE_LABEL[telemetry.image_prediction]}
            status={SEVERITY_STATUS[IMAGE_SEVERITY[telemetry.image_prediction]]}
          />
        </ul>
        <p className="mt-2 text-xs text-mute">
          Sensor model output: {telemetry.sensor_prediction}{' '}
          <span className={TONE[SENSOR_PREDICTION_STATUS[telemetry.sensor_prediction]].text}>●</span>
        </p>
      </div>
    </div>
  );
}
