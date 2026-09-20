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
    <li className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-slate-600 text-sm font-medium">{name}</span>
      <span className="flex items-center gap-3">
        <span className="font-semibold text-slate-800 text-sm">{value}</span>
        <StatusBadge status={status} />
      </span>
    </li>
  );
}

export default function PredictionPanel({ telemetry }: { telemetry: Telemetry | null }) {
  if (!telemetry) return <p className="text-slate-500 py-2">Waiting for telemetry data…</p>;

  const hp = telemetry.health_prediction;
  const tone = hp ? TONE[HEALTH_PREDICTION_STATUS[hp]] : null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Predicted Belt Condition</div>
          {hp ? (
            <>
              <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-1.5 ${tone?.text}`}>
                {HEALTH_PREDICTION_LABEL[hp]}
              </div>
              <div className="mt-4 space-y-2.5 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                {telemetry.health_confidence !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Model Confidence:</span>
                    <span className="font-bold text-slate-800">{pct(telemetry.health_confidence, 0)}</span>
                  </div>
                )}
                {telemetry.recommendation && (
                  <div className="text-sm">
                    <span className="text-slate-500 font-medium block mb-0.5">Recommendation:</span>
                    <span className="font-semibold text-slate-800 leading-snug block">{telemetry.recommendation}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-500">The health model has not returned a prediction yet.</p>
          )}
        </div>
      </div>

      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Fused Model Telemetry Inputs</div>
        <ul className="divide-y divide-slate-100 bg-slate-50/70 rounded-lg p-2.5 border border-slate-100">
          <InputRow
            name="Vibration (RMS)"
            value={`${telemetry.vibration.toFixed(2)} g`}
            status={evaluate(telemetry.vibration, LIMITS.vibration)}
          />
          <InputRow
            name="Bearing Temperature"
            value={`${telemetry.temperature.toFixed(0)}°C`}
            status={evaluate(telemetry.temperature, LIMITS.temperature)}
          />
          <InputRow name="Chute Load" value={`${telemetry.load.toFixed(1)} kg`} status={evaluate(telemetry.load, LIMITS.load)} />
          <InputRow name="Pulley RPM" value={String(telemetry.rpm)} status={evaluate(telemetry.rpm, LIMITS.rpm)} />
          <InputRow
            name="Computer Vision"
            value={IMAGE_LABEL[telemetry.image_prediction]}
            status={SEVERITY_STATUS[IMAGE_SEVERITY[telemetry.image_prediction]]}
          />
        </ul>
        <p className="mt-2 text-xs text-slate-500 font-medium flex items-center justify-between">
          <span>Sensor model output: <strong className="text-slate-700">{telemetry.sensor_prediction}</strong></span>
          <span className={`h-2.5 w-2.5 rounded-full ${TONE[SENSOR_PREDICTION_STATUS[telemetry.sensor_prediction]].bg}`} />
        </p>
      </div>
    </div>
  );
}
