# Conveyor Health Monitoring – Dashboard

React + TypeScript + Tailwind CSS + Recharts frontend for the
**Intelligent Conveyor Belt Health Monitoring and Predictive Maintenance System**.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
```

Prototype login: `admin` / `conveyor123` (change in `src/config.ts`).

The app starts with **dummy data** (the header shows a "Demo data" tag and the image
result is labelled as a demo). Try other conditions with `?scenario=warning`
or `?scenario=critical` in the URL.

## Project structure

```
src/
  config.ts                 URLs, poll interval, demo scenario, prototype login
  types/index.ts            Telemetry, detection and alert types (the API contract)
  lib/status.ts             Alarm limits, status colours, AI label mappings
  services/api.ts           ALL network calls (telemetry, alerts, image analysis)
  services/mock.ts          Dummy data – delete when the real APIs are ready
  context/                  AuthContext, MonitoringContext (polling, alerts, inspection state)
  hooks/useCamera.ts        Webcam start/stop/capture
  components/               StatusHero, SensorCard, BeltInspection, DetectionOverlay, ...
  pages/                    Login, Dashboard, InspectionPage, AlertsPage
```

## Connecting real data

1. Copy `.env.example` to `.env`, set `VITE_USE_MOCK=false` and the three URLs.
2. **Telemetry** – `GET VITE_TELEMETRY_URL` returns JSON like:

```json
{
  "rpm": 820,
  "temperature": 38,
  "load": 2.4,
  "vibration": 0.32,
  "belt_health": 94,
  "sensor_prediction": "HEALTHY",
  "image_prediction": "JOINT_DAMAGE",
  "confidence": 0.946,
  "overall_status": "WARNING",

  "health_prediction": "EARLY_DAMAGE",
  "health_confidence": 0.91,
  "recommendation": "Inspect belt joint",
  "vibration_waveform": [0.02, 0.31, 0.44, 0.12]
}
```

   The last four fields are optional. Until they are sent, the panels show
   "waiting" messages instead of made-up values.
   `sensor_prediction`: HEALTHY | WARNING | DAMAGE | CRITICAL.
   `image_prediction`: HEALTHY | CRACK | TEAR | JOINT_DAMAGE | EDGE_DAMAGE | SEVERE_DAMAGE.
   `health_prediction`: HEALTHY | EARLY_DAMAGE | WARNING | CRITICAL_DAMAGE.
   `overall_status`: NORMAL | WARNING | CRITICAL.

3. **Image analysis** – the dashboard sends `POST VITE_VISION_URL` (multipart, field `image`, JPEG)
   and expects:

```json
{
  "detections": [
    { "label": "JOINT_DAMAGE", "confidence": 0.946,
      "bbox": { "x": 0.42, "y": 0.30, "width": 0.20, "height": 0.40 } }
  ]
}
```

   `bbox` is normalised 0–1 from the top-left corner. An empty `detections` list means a
   healthy belt. If your YOLO service returns centre-based boxes, convert them in
   `parseVisionResponse()` in `src/services/api.ts`.

4. **Alerts** – `GET VITE_ALERTS_URL` returns
   `[{ "id": "1", "time": 1760000000000, "source": "Camera AI", "detection": "Joint damage detected", "severity": "Critical" }]`.

5. **Alarm limits** – edit `LIMITS` in `src/lib/status.ts` to match your conveyor.

## Notes

- The camera works on `localhost` or HTTPS. With the camera off, "Capture Image" uses the
  bundled sample image so the flow can be tested without hardware.
- The prototype login is checked in the browser only. Replace `login()` in
  `src/context/AuthContext.tsx` with a backend call before real use.
