import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CONFIG } from '../config';
import { evaluate, IMAGE_LABEL, LIMITS } from '../lib/status';
import { analyzeImage, fetchAlerts, fetchTelemetry } from '../services/api';
import {
  getActiveScenario,
  getCustomData,
  mockAlerts,
  mockTelemetry,
  zeroTelemetry,
  setActiveScenario,
  setCustomData as setMockCustomData,
  type CustomSensorData,
} from '../services/mock';
import type { Alert, Capture, HistoryPoint, InspectionState, Scenario, Status, Telemetry } from '../types';

interface MonitoringValue {
  telemetry: Telemetry | null;
  history: HistoryPoint[];
  error: string | null;
  alerts: Alert[];
  capture: Capture | null;
  setCapture: (c: Capture) => void;
  inspection: InspectionState;
  analyze: () => Promise<void>;
  scenario: Scenario;
  setScenario: (s: Scenario) => void;
  customData: CustomSensorData;
  updateCustomData: (data: Partial<CustomSensorData>) => void;
  refreshNow: () => Promise<void>;
  isDemoRunning: boolean;
  startDemo: () => void;
  stopDemo: () => void;
  toggleDemo: () => void;
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

function createZeroHistory(): HistoryPoint[] {
  const now = Date.now();
  const step = CONFIG.POLL_MS || 1000;
  return Array.from({ length: 25 }, (_, i) => ({
    t: now - (24 - i) * step,
    rpm: 0,
    temperature: 0,
    load: 0,
    vibration: 0,
  }));
}

function createInitialHistory(): HistoryPoint[] {
  if (!CONFIG.USE_MOCK) return [];
  const now = Date.now();
  const step = CONFIG.POLL_MS || 1000;
  return Array.from({ length: 25 }, (_, i) => {
    const t = now - (24 - i) * step;
    const m = mockTelemetry();
    return {
      t,
      rpm: m.rpm,
      temperature: m.temperature,
      load: m.load,
      vibration: m.vibration,
    };
  });
}

/**
 * Holds the live data for every page: telemetry, alerts and the latest image inspection.
 * Swap the data source in services/api.ts – components do not need to change.
 */
export function MonitoringProvider({ children }: { children: ReactNode }) {
  const [telemetry, setTelemetry] = useState<Telemetry | null>(() => (CONFIG.USE_MOCK ? zeroTelemetry() : null));
  const [history, setHistory] = useState<HistoryPoint[]>(() => (CONFIG.USE_MOCK ? createZeroHistory() : []));
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [capture, setCaptureState] = useState<Capture | null>(null);
  const [inspection, setInspection] = useState<InspectionState>({ status: 'idle' });
  const [scenario, setScenarioState] = useState<Scenario>(() => getActiveScenario());
  const [customData, setCustomDataState] = useState<CustomSensorData>(() => getCustomData());
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const lastStatus = useRef<Partial<Record<SensorKey, Status>>>({});

  const startDemo = useCallback(() => {
    setIsDemoRunning(true);
    if (CONFIG.USE_MOCK) {
      setTelemetry(mockTelemetry());
      setHistory(createInitialHistory());
      setAlerts(mockAlerts());
    }
  }, []);

  const stopDemo = useCallback(() => {
    setIsDemoRunning(false);
    if (CONFIG.USE_MOCK) {
      setTelemetry(zeroTelemetry());
      setHistory(createZeroHistory());
      setAlerts([]);
    }
  }, []);

  const toggleDemo = useCallback(() => {
    setIsDemoRunning((prev) => {
      const next = !prev;
      if (CONFIG.USE_MOCK) {
        if (next) {
          setTelemetry(mockTelemetry());
          setHistory(createInitialHistory());
          setAlerts(mockAlerts());
        } else {
          setTelemetry(zeroTelemetry());
          setHistory(createZeroHistory());
          setAlerts([]);
        }
      }
      return next;
    });
  }, []);

  const addAlert = useCallback((a: Omit<Alert, 'id' | 'time'>) => {
    setAlerts((prev) => [{ ...a, id: newId(), time: Date.now() }, ...prev].slice(0, 50));
  }, []);

  const tick = useCallback(async () => {
    try {
      const t = await fetchTelemetry();
      setTelemetry(t);
      setError(null);
      setHistory((h) =>
        [
          ...h,
          { t: t.timestamp ?? Date.now(), rpm: t.rpm, temperature: t.temperature, load: t.load, vibration: t.vibration },
        ].slice(-CONFIG.HISTORY_POINTS),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Telemetry unavailable');
    }
  }, []);

  const setScenario = useCallback(
    (nextScenario: Scenario) => {
      setActiveScenario(nextScenario);
      setScenarioState(nextScenario);
      if (CONFIG.USE_MOCK) {
        if (isDemoRunning) {
          setAlerts(mockAlerts());
          tick();
        }
      } else {
        tick();
      }
    },
    [isDemoRunning, tick],
  );

  const updateCustomData = useCallback(
    (partial: Partial<CustomSensorData>) => {
      setMockCustomData(partial);
      setCustomDataState(getCustomData());
      setScenarioState('custom');
      tick();
    },
    [tick],
  );

  // Fetch telemetry once on initial mount only if in real backend mode (mock mode stays zero until started)
  useEffect(() => {
    if (!CONFIG.USE_MOCK) {
      tick();
    }
  }, [tick]);

  // Telemetry polling: in mock/demo mode, only runs continuously when isDemoRunning is true
  useEffect(() => {
    if (CONFIG.USE_MOCK && !isDemoRunning) return;
    const id = setInterval(tick, CONFIG.POLL_MS);
    return () => clearInterval(id);
  }, [isDemoRunning, tick]);

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
    () => ({
      telemetry,
      history,
      error,
      alerts,
      capture,
      setCapture,
      inspection,
      analyze,
      scenario,
      setScenario,
      customData,
      updateCustomData,
      refreshNow: tick,
      isDemoRunning,
      startDemo,
      stopDemo,
      toggleDemo,
    }),
    [
      telemetry,
      history,
      error,
      alerts,
      capture,
      setCapture,
      inspection,
      analyze,
      scenario,
      setScenario,
      customData,
      updateCustomData,
      tick,
      isDemoRunning,
      startDemo,
      stopDemo,
      toggleDemo,
    ],
  );

  return <MonitoringContext.Provider value={value}>{children}</MonitoringContext.Provider>;
}

export function useMonitoring() {
  const ctx = useContext(MonitoringContext);
  if (!ctx) throw new Error('useMonitoring must be used inside MonitoringProvider');
  return ctx;
}
