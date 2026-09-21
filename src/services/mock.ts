/**
 * DUMMY DATA — generated in browser for demo/testing mode.
 * Supports presets ('normal', 'warning', 'critical') and custom interactive simulation.
 */
import { CONFIG } from '../config';
import { evaluate, healthStatus, IMAGE_SEVERITY, LIMITS, SEVERITY_STATUS } from '../lib/status';
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

export interface CustomSensorData {
  rpm: number;
  temperature: number;
  load: number;
  vibration: number;
  health: number;
  image: ImageClass;
}

const BASE: Record<Exclude<Scenario, 'custom'>, Base> = {
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

let activeScenario: Scenario = (CONFIG.MOCK_SCENARIO as Scenario) || 'normal';

let customData: CustomSensorData = {
  rpm: 820,
  temperature: 38,
  load: 2.4,
  vibration: 0.32,
  health: 94,
  image: 'HEALTHY',
};

export function getActiveScenario(): Scenario {
  return activeScenario;
}

export function setActiveScenario(s: Scenario) {
  activeScenario = s;
}

export function getCustomData(): CustomSensorData {
  return { ...customData };
}

export function setCustomData(data: Partial<CustomSensorData>) {
  customData = { ...customData, ...data };
  activeScenario = 'custom';
}

function resolveCustomBase(): Base {
  const vibStatus = evaluate(customData.vibration, LIMITS.vibration);
  const tempStatus = evaluate(customData.temperature, LIMITS.temperature);
  const loadStatus = evaluate(customData.load, LIMITS.load);
  const rpmStatus = evaluate(customData.rpm, LIMITS.rpm);
  const healthStat = healthStatus(customData.health);
  const imgStatus = SEVERITY_STATUS[IMAGE_SEVERITY[customData.image]];

  const statuses: Status[] = [vibStatus, tempStatus, loadStatus, rpmStatus, healthStat, imgStatus];
  const rank: Record<Status, number> = { NORMAL: 0, WARNING: 1, CRITICAL: 2 };
  const worst = statuses.reduce((prev, curr) => (rank[curr] > rank[prev] ? curr : prev), 'NORMAL');

  const sensorPrediction: SensorPrediction =
    worst === 'CRITICAL' ? 'CRITICAL' : worst === 'WARNING' ? 'WARNING' : 'HEALTHY';

  const healthPrediction: HealthPrediction =
    worst === 'CRITICAL' ? 'CRITICAL_DAMAGE' : worst === 'WARNING' ? 'EARLY_DAMAGE' : 'HEALTHY';

  let recommendation = 'Optimal condition - No action needed';
  if (worst === 'CRITICAL') {
    recommendation = 'Stop the conveyor immediately and perform inspection';
  } else if (worst === 'WARNING') {
    recommendation = 'Schedule maintenance inspection for flagged sensors';
  }

  return {
    rpm: customData.rpm,
    temperature: customData.temperature,
    load: customData.load,
    vibration: customData.vibration,
    health: customData.health,
    sensor: sensorPrediction,
    image: customData.image,
    imageConf: 0.95,
    overall: worst,
    health_prediction: healthPrediction,
    health_confidence: 0.94,
    recommendation,
  };
}

function getBase(): Base {
  if (activeScenario === 'custom') {
    return resolveCustomBase();
  }
  return BASE[activeScenario];
}

const jitter = (amount: number) => (Math.random() - 0.5) * 2 * amount;
let phase = 0;

export function mockTelemetry(): Telemetry {
  const b = getBase();
  const vibration = Math.max(0.05, b.vibration + jitter(b.vibration * 0.08));

  // Sine wave whose RMS matches the vibration value, plus noise.
  const vibration_waveform = Array.from({ length: 96 }, (_, i) =>
    Number((vibration * Math.SQRT2 * Math.sin((i + phase) / 3.2) + jitter(vibration * 0.12)).toFixed(3)),
  );
  phase += 5;

  return {
    rpm: Math.round(b.rpm + jitter(4)),
    temperature: Number((b.temperature + jitter(0.4)).toFixed(1)),
    load: Number((b.load + jitter(0.08)).toFixed(2)),
    vibration: Number(vibration.toFixed(2)),
    belt_health: Math.round(b.health + jitter(0.5)),
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

export function zeroTelemetry(): Telemetry {
  return {
    rpm: 0,
    temperature: 0,
    load: 0,
    vibration: 0,
    belt_health: 0,
    sensor_prediction: 'HEALTHY',
    image_prediction: 'HEALTHY',
    confidence: 1.0,
    overall_status: 'NORMAL',
    health_prediction: 'HEALTHY',
    health_confidence: 1.0,
    recommendation: 'Conveyor idle. Start demo to begin operation.',
    vibration_waveform: Array.from({ length: 96 }, () => 0),
    timestamp: Date.now(),
  };
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function mockAnalyze(): Promise<InspectionResult> {
  await delay(900);
  const b = getBase();
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
  if (activeScenario === 'normal') {
    return [];
  }
  if (activeScenario === 'warning') {
    return [
      { id: 'seed-1', time: now - 3 * min, source: 'Vibration', detection: 'Abnormal vibration approaching warn threshold', severity: 'Warning' },
      { id: 'seed-2', time: now - 7 * min, source: 'Temperature', detection: 'Conveyor roller operating temp high (66°C)', severity: 'Warning' },
      { id: 'seed-3', time: now - 12 * min, source: 'Camera AI', detection: 'Joint damage detected on belt frame', severity: 'Warning' },
    ];
  }
  return [
    { id: 'seed-1', time: now - 2 * min, source: 'Vibration', detection: 'Critical vibration spike (1.70 mm/s)', severity: 'Critical' },
    { id: 'seed-2', time: now - 5 * min, source: 'Temperature', detection: 'Severe overheating detected (86°C)', severity: 'Critical' },
    { id: 'seed-3', time: now - 10 * min, source: 'Camera AI', detection: 'Severe tear detected on main belt', severity: 'Critical' },
    { id: 'seed-4', time: now - 18 * min, source: 'Load', detection: 'Conveyor overloaded (5.40 T)', severity: 'Critical' },
  ];
}
