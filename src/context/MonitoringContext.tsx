import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CONFIG } from '../config';
import { evaluate, IMAGE_LABEL, LIMITS } from '../lib/status';
import { analyzeImage, fetchAlerts, fetchTelemetry } from '../services/api';
import { mockAlerts } from '../services/mock';
import type { Alert, Capture, HistoryPoint, InspectionState, Status, Telemetry } from '../types';

interface MonitoringValue {
  telemetry: Telemetry | null;
  history: HistoryPoint[];
  error: string | null;
  alerts: Alert[];
  capture: Capture | null;
  setCapture: (c: Capture) => void;
  inspection: InspectionState;
  analyze: () => Promise<void>;
}

const MonitoringContext = createContext<MonitoringValue | null>(null);

const SENSOR_ALERT_TEXT = {
  vibration: { source: 'Vibration', text: 'Abnormal vibration' },
  temperature: { source: 'Temperature', text: 'Overheating detected' },
  load: { source: 'Load', text: 'Overload detected' },
  rpm: { source: 'RPM', text: 'Abnormal belt speed' },
} as const;

type SensorKey = keyof typeof SENSOR_ALERT_TEXT;
let alertCounter = 0;
const newId = () => `local-${Date.now()}-${alertCounter++}`;

/**
 * Holds the live data for every page: telemetry, alerts and the latest image inspection.
 * Swap the data source in services/api.ts – components do not need to change.
 */
export function MonitoringProvider({ children }: { children: ReactNode }) {
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>(() => (CONFIG.USE_MOCK ? mockAlerts() : []));
  const [capture, setCaptureState] = useState<Capture | null>(null);
  const [inspection, setInspection] = useState<InspectionState>({ status: 'idle' });
  const lastStatus = useRef<Partial<Record<SensorKey, Status>>>({});

  const addAlert = useCallback((a: Omit<Alert, 'id' | 'time'>) => {
    setAlerts((prev) => [{ ...a, id: newId(), time: Date.now() }, ...prev].slice(0, 50));
  }, []);

  // Telemetry polling
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const t = await fetchTelemetry();
        if (!alive) return;
        setTelemetry(t);
        setError(null);
        setHistory((h) =>
          [
            ...h,
            { t: t.timestamp ?? Date.now(), rpm: t.rpm, temperature: t.temperature, load: t.load, vibration: t.vibration },
          ].slice(-CONFIG.HISTORY_POINTS),
        );
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Telemetry unavailable');
      }
    };
    tick();
    const id = setInterval(tick, CONFIG.POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  // Alerts: real mode polls the backend; demo mode raises alerts when a sensor leaves NORMAL.
  useEffect(() => {
    if (CONFIG.USE_MOCK) return;
    let alive = true;
    const load = () =>
      fetchAlerts()
        .then((a) => alive && setAlerts(a.slice(0, 50)))
        .catch(() => undefined);
    load();
    const id = setInterval(load, CONFIG.ALERT_POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!CONFIG.USE_MOCK || !telemetry) return;
    (Object.keys(SENSOR_ALERT_TEXT) as SensorKey[]).forEach((key) => {
      const status = evaluate(telemetry[key], LIMITS[key]);
      const before = lastStatus.current[key] ?? 'NORMAL';
      if (status !== 'NORMAL' && status !== before) {
        addAlert({
          source: SENSOR_ALERT_TEXT[key].source,
          detection: SENSOR_ALERT_TEXT[key].text,
          severity: status === 'CRITICAL' ? 'Critical' : 'Warning',
        });
      }
      lastStatus.current[key] = status;
    });
  }, [telemetry, addAlert]);

  const setCapture = useCallback((c: Capture) => {
    setCaptureState(c);
    setInspection({ status: 'idle' });
  }, []);

  const analyze = useCallback(async () => {
    if (!capture) return;
    setInspection({ status: 'analyzing' });
    try {
      const result = await analyzeImage(capture.blob);
      setInspection({ status: 'done', result });
      if (CONFIG.USE_MOCK && result.condition !== 'HEALTHY') {
        addAlert({
          source: 'Camera AI',
          detection: `${IMAGE_LABEL[result.condition]} detected`,
          severity: 'Critical',
        });
      }
    } catch (e) {
      setInspection({ status: 'error', message: e instanceof Error ? e.message : 'Image analysis failed' });
    }
  }, [capture, addAlert]);

  const value = useMemo(
    () => ({ telemetry, history, error, alerts, capture, setCapture, inspection, analyze }),
    [telemetry, history, error, alerts, capture, setCapture, inspection, analyze],
  );

  return <MonitoringContext.Provider value={value}>{children}</MonitoringContext.Provider>;
}

export function useMonitoring() {
  const ctx = useContext(MonitoringContext);
  if (!ctx) throw new Error('useMonitoring must be used inside MonitoringProvider');
  return ctx;
}
