/**
 * DUMMY DATA — everything in this file is generated in the browser.
 * It is used only while CONFIG.USE_MOCK is true and is never a real AI result.
 */
import { CONFIG } from '../config';
import type { Alert, HealthPrediction, ImageClass, InspectionResult, Scenario, SensorPrediction, Status, Telemetry } from '../types';

interface Base {
  rpm: number;
  temperature: number;
  load: number;
  vibration: number;
  health: number;
  sensor: SensorPrediction;
  image: ImageClass;
  imageConf: number;
  overall: Status;
  health_prediction: HealthPrediction;
  health_confidence: number;
  recommendation: string;
}

const BASE: Record<Scenario, Base> = {
  normal: {
    rpm: 820,
    temperature: 38,
    load: 2.4,
    vibration: 0.32,
    health: 94,
    sensor: 'HEALTHY',
    image: 'HEALTHY',
    imageConf: 0.962,
    overall: 'NORMAL',
    health_prediction: 'HEALTHY',
    health_confidence: 0.96,
    recommendation: 'No action needed',
  },
  warning: {
    rpm: 820,
    temperature: 66,
    load: 4.3,
    vibration: 0.95,
    health: 71,
    sensor: 'WARNING',
    image: 'JOINT_DAMAGE',
    imageConf: 0.946,
    overall: 'WARNING',
    health_prediction: 'EARLY_DAMAGE',
    health_confidence: 0.91,
    recommendation: 'Inspect belt joint',
  },
  critical: {
    rpm: 480,
    temperature: 86,
    load: 5.4,
    vibration: 1.7,
    health: 38,
    sensor: 'CRITICAL',
    image: 'SEVERE_DAMAGE',
    imageConf: 0.973,
    overall: 'CRITICAL',
    health_prediction: 'CRITICAL_DAMAGE',
    health_confidence: 0.95,
    recommendation: 'Stop the conveyor and inspect the belt',
  },
};

const jitter = (amount: number) => (Math.random() - 0.5) * 2 * amount;
let phase = 0;

export function mockTelemetry(): Telemetry {
  const b = BASE[CONFIG.MOCK_SCENARIO];
  const vibration = Math.max(0.05, b.vibration + jitter(b.vibration * 0.08));

  // Sine wave whose RMS matches the vibration value, plus noise.
  const vibration_waveform = Array.from({ length: 96 }, (_, i) =>
    Number((vibration * Math.SQRT2 * Math.sin((i + phase) / 3.2) + jitter(vibration * 0.12)).toFixed(3)),
  );
  phase += 5;

  return {
    rpm: Math.round(b.rpm + jitter(6)),
    temperature: Number((b.temperature + jitter(0.6)).toFixed(1)),
    load: Number((b.load + jitter(0.12)).toFixed(2)),
    vibration: Number(vibration.toFixed(2)),
    belt_health: Math.round(b.health + jitter(0.6)),
    sensor_prediction: b.sensor,
    image_prediction: b.image,
    confidence: b.imageConf,
    overall_status: b.overall,
    health_prediction: b.health_prediction,
    health_confidence: b.health_confidence,
    recommendation: b.recommendation,
    vibration_waveform,
    timestamp: Date.now(),
  };
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function mockAnalyze(): Promise<InspectionResult> {
  await delay(900);
  const b = BASE[CONFIG.MOCK_SCENARIO];
  const analyzedAt = Date.now();

  if (b.image === 'HEALTHY') {
    return { condition: 'HEALTHY', confidence: b.imageConf, detections: [], source: 'demo', analyzedAt };
  }

  const bbox =
    b.image === 'SEVERE_DAMAGE'
      ? { x: 0.3, y: 0.15, width: 0.4, height: 0.7 }
      : { x: 0.4, y: 0.2, width: 0.2, height: 0.6 };

  return {
    condition: b.image,
    confidence: b.imageConf,
    detections: [{ label: b.image, confidence: b.imageConf, bbox }],
    source: 'demo',
    analyzedAt,
  };
}

export function mockAlerts(): Alert[] {
  const now = Date.now();
  const min = 60_000;
  return [
    { id: 'seed-1', time: now - 4 * min, source: 'Vibration', detection: 'Abnormal vibration', severity: 'Warning' },
    { id: 'seed-2', time: now - 8 * min, source: 'Camera AI', detection: 'Joint damage detected', severity: 'Critical' },
    { id: 'seed-3', time: now - 15 * min, source: 'Load', detection: 'Overload detected', severity: 'Warning' },
  ];
}
