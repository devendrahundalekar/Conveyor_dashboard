import type { Scenario } from './types';

const env = import.meta.env;
const params = new URLSearchParams(window.location.search);

/**
 * Central place to switch between dummy data and real APIs.
 * See .env.example for the matching environment variables.
 */
export const CONFIG = {
  /** true = dummy data generated in the browser. Set VITE_USE_MOCK=false for real APIs. */
  USE_MOCK: env.VITE_USE_MOCK !== 'false',

  /** GET → Telemetry JSON (see types/index.ts). Your ESP32 gateway / backend serves this. */
  TELEMETRY_URL: (env.VITE_TELEMETRY_URL as string | undefined) ?? '/api/telemetry',

  /** GET → Alert[] JSON. */
  ALERTS_URL: (env.VITE_ALERTS_URL as string | undefined) ?? '/api/alerts',

  /** POST multipart/form-data with field "image" → detection JSON (see services/api.ts). */
  VISION_URL: (env.VITE_VISION_URL as string | undefined) ?? '/api/inspect',

  POLL_MS: Number(env.VITE_POLL_MS ?? 1000),
  ALERT_POLL_MS: 5000,
  HISTORY_POINTS: 60,

  /** Which dummy condition to simulate. Try http://localhost:5173/?scenario=warning */
  MOCK_SCENARIO: (params.get('scenario') ?? env.VITE_MOCK_SCENARIO ?? 'normal') as Scenario,

  /** Prototype-only login. Replace with a real auth call later. */
  AUTH: { username: 'admin', password: 'conveyor123' },
};
