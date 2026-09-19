import { IMAGE_LABEL, IMAGE_SEVERITY, pct, SEVERITY_STATUS, TONE } from '../lib/status';
import type { Detection } from '../types';

/**
 * Draws bounding boxes over an image. Place inside a `relative` wrapper that is exactly
 * the size of the image. Boxes use normalised (0–1) coordinates, so any YOLO-style
 * detector output can be drawn without knowing the pixel size.
 */
export default function DetectionOverlay({ detections }: { detections: Detection[] }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {detections.map((d, i) => {
        const tone = TONE[SEVERITY_STATUS[IMAGE_SEVERITY[d.label]]];
        return (
          <div
            key={i}
            className="absolute border-2"
            style={{
              left: `${d.bbox.x * 100}%`,
              top: `${d.bbox.y * 100}%`,
              width: `${d.bbox.width * 100}%`,
              height: `${d.bbox.height * 100}%`,
              borderColor: tone.hex,
            }}
          >
            <span
              className="absolute left-0 top-0 whitespace-nowrap px-1.5 py-0.5 text-xs font-semibold text-black"
              style={{ backgroundColor: tone.hex }}
            >
              {IMAGE_LABEL[d.label]} {pct(d.confidence)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
