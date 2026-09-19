import type { HealthPrediction, ImageClass, SensorPrediction, Severity, Status } from '../types';

/**
 * Alarm limits per sensor. Adjust these to match your conveyor.
 * Beyond a warn limit = WARNING, beyond a crit limit = CRITICAL.
 */
export interface Limits {
  lowCrit?: number;
  lowWarn?: number;
  highWarn?: number;
  highCrit?: number;
}

export const LIMITS = {
  vibration: { highWarn: 0.8, highCrit: 1.5 }, // g
  temperature: { highWarn: 60, highCrit: 80 }, // °C
  load: { highWarn: 4, highCrit: 5 }, // kg
  rpm: { lowCrit: 500, lowWarn: 650, highWarn: 950, highCrit: 1050 },
} satisfies Record<string, Limits>;

export function evaluate(value: number, l: Limits): Status {
  if ((l.highCrit !== undefined && value >= l.highCrit) || (l.lowCrit !== undefined && value <= l.lowCrit)) {
    return 'CRITICAL';
  }
  if ((l.highWarn !== undefined && value >= l.highWarn) || (l.lowWarn !== undefined && value <= l.lowWarn)) {
    return 'WARNING';
  }
  return 'NORMAL';
}

/** Full class names so Tailwind can see them. */
export const TONE: Record<Status, { text: string; bg: string; border: string; soft: string; hex: string }> = {
  NORMAL: { text: 'text-ok', bg: 'bg-ok', border: 'border-ok', soft: 'bg-ok/10', hex: '#3fb96a' },
  WARNING: { text: 'text-warn', bg: 'bg-warn', border: 'border-warn', soft: 'bg-warn/10', hex: '#f0a21b' },
  CRITICAL: { text: 'text-crit', bg: 'bg-crit', border: 'border-crit', soft: 'bg-crit/10', hex: '#ef4444' },
};

export function healthStatus(percent: number): Status {
  if (percent >= 80) return 'NORMAL';
  if (percent >= 50) return 'WARNING';
  return 'CRITICAL';
}

export const HEALTH_LABEL: Record<Status, string> = {
  NORMAL: 'HEALTHY',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
};

// ---- AI output labels -------------------------------------------------------

export const IMAGE_LABEL: Record<ImageClass, string> = {
  HEALTHY: 'Healthy Belt',
  CRACK: 'Belt Crack',
  TEAR: 'Belt Tear',
  JOINT_DAMAGE: 'Belt Joint Damage',
  EDGE_DAMAGE: 'Edge Damage',
  SEVERE_DAMAGE: 'Severe Damage',
};

export const IMAGE_SEVERITY: Record<ImageClass, Severity> = {
  HEALTHY: 'NONE',
  EDGE_DAMAGE: 'LOW',
  CRACK: 'MEDIUM',
  TEAR: 'HIGH',
  JOINT_DAMAGE: 'HIGH',
  SEVERE_DAMAGE: 'CRITICAL',
};

export const SEVERITY_RANK: Record<Severity, number> = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

export const SEVERITY_STATUS: Record<Severity, Status> = {
  NONE: 'NORMAL',
  LOW: 'WARNING',
  MEDIUM: 'WARNING',
  HIGH: 'CRITICAL',
  CRITICAL: 'CRITICAL',
};

export const HEALTH_PREDICTION_LABEL: Record<HealthPrediction, string> = {
  HEALTHY: 'HEALTHY',
  EARLY_DAMAGE: 'EARLY DAMAGE',
  WARNING: 'WARNING',
  CRITICAL_DAMAGE: 'CRITICAL DAMAGE',
};

export const HEALTH_PREDICTION_STATUS: Record<HealthPrediction, Status> = {
  HEALTHY: 'NORMAL',
  EARLY_DAMAGE: 'WARNING',
  WARNING: 'WARNING',
  CRITICAL_DAMAGE: 'CRITICAL',
};

export const SENSOR_PREDICTION_STATUS: Record<SensorPrediction, Status> = {
  HEALTHY: 'NORMAL',
  WARNING: 'WARNING',
  DAMAGE: 'CRITICAL',
  CRITICAL: 'CRITICAL',
};

export const pct = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}%`;

export const clockTime = (epochMs: number) =>
  new Date(epochMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
