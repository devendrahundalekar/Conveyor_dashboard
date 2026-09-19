/**
 * All network access lives here. Connect your ESP32 gateway, backend and
 * AI models by changing the URLs in .env (or config.ts) and setting VITE_USE_MOCK=false.
 */
import { CONFIG } from '../config';
import { IMAGE_LABEL, IMAGE_SEVERITY, SEVERITY_RANK } from '../lib/status';
import type { Alert, Detection, ImageClass, InspectionResult, Telemetry } from '../types';
import { mockAlerts, mockAnalyze, mockTelemetry } from './mock';

async function getJson<T>(url: string, what: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${what} request failed (HTTP ${res.status})`);
  return (await res.json()) as T;
}

/** GET CONFIG.TELEMETRY_URL → Telemetry (see types/index.ts for the shape). */
export async function fetchTelemetry(): Promise<Telemetry> {
  if (CONFIG.USE_MOCK) return mockTelemetry();
  const data = await getJson<Telemetry>(CONFIG.TELEMETRY_URL, 'Telemetry');
  return { ...data, timestamp: data.timestamp ?? Date.now() };
}

/** GET CONFIG.ALERTS_URL → Alert[] (newest first). */
export async function fetchAlerts(): Promise<Alert[]> {
  if (CONFIG.USE_MOCK) return mockAlerts();
  return getJson<Alert[]>(CONFIG.ALERTS_URL, 'Alerts');
}

/**
 * POST CONFIG.VISION_URL with multipart field "image" (JPEG).
 *
 * Expected response (works with any object-detection model behind an API):
 * {
 *   "condition": "JOINT_DAMAGE",          // optional – derived from detections if missing
 *   "confidence": 0.946,                  // optional – highest detection confidence if missing
 *   "detections": [
 *     { "label": "JOINT_DAMAGE", "confidence": 0.946,
 *       "bbox": { "x": 0.42, "y": 0.30, "width": 0.20, "height": 0.40 } }
 *   ]
 * }
 * bbox is normalised (0–1) from the TOP-LEFT corner. If your YOLO service returns
 * centre-based boxes (x_center, y_center, w, h), convert them in parseVisionResponse().
 * An empty "detections" array means a healthy belt.
 */
export async function analyzeImage(image: Blob): Promise<InspectionResult> {
  if (CONFIG.USE_MOCK) return mockAnalyze();

  const form = new FormData();
  form.append('image', image, 'belt.jpg');

  let res: Response;
  try {
    res = await fetch(CONFIG.VISION_URL, { method: 'POST', body: form });
  } catch {
    throw new Error('Could not reach the vision API. Check VITE_VISION_URL and that the server is running.');
  }
  if (!res.ok) throw new Error(`Vision API returned HTTP ${res.status}.`);
  return parseVisionResponse(await res.json());
}

function toClass(raw: unknown): ImageClass {
  const key = String(raw).trim().toUpperCase().replace(/[\s-]+/g, '_') as ImageClass;
  if (!(key in IMAGE_LABEL)) throw new Error(`Vision API returned an unknown class: "${String(raw)}"`);
  return key;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseVisionResponse(json: any): InspectionResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const detections: Detection[] = (json.detections ?? []).map((d: any) => ({
    label: toClass(d.label),
    confidence: Number(d.confidence),
    bbox: { x: Number(d.bbox.x), y: Number(d.bbox.y), width: Number(d.bbox.width), height: Number(d.bbox.height) },
  }));

  const worst = [...detections].sort(
    (a, b) => SEVERITY_RANK[IMAGE_SEVERITY[b.label]] - SEVERITY_RANK[IMAGE_SEVERITY[a.label]],
  )[0];

  return {
    condition: json.condition ? toClass(json.condition) : (worst?.label ?? 'HEALTHY'),
    confidence: Number(json.confidence ?? worst?.confidence ?? 0),
    detections,
    source: 'model',
    analyzedAt: Date.now(),
  };
}
