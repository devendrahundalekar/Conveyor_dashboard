import { useRef } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { useCamera } from '../hooks/useCamera';
import { IMAGE_LABEL, IMAGE_SEVERITY, pct, SEVERITY_STATUS, TONE } from '../lib/status';
import type { InspectionState } from '../types';
import DetectionOverlay from './DetectionOverlay';
import Section from './Section';
import StatusBadge from './StatusBadge';

const buttonBase =
  'rounded border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40';
const secondary = `${buttonBase} border-line bg-raised text-ink hover:bg-line`;
const primary = `${buttonBase} border-steel bg-steel text-black hover:bg-steel/85`;

function ResultPanel({ inspection, hasCapture }: { inspection: InspectionState; hasCapture: boolean }) {
  if (inspection.status === 'analyzing') return <p className="text-mute">Analyzing image…</p>;

  if (inspection.status === 'error') {
    return (
      <p role="alert" className="text-crit">
        {inspection.message}
      </p>
    );
  }

  if (inspection.status === 'idle') {
    return (
      <p className="text-mute">
        {hasCapture ? 'Image captured. Select Analyze Image to run the inspection.' : 'Capture an image to inspect the belt.'}
      </p>
    );
  }

  const { result } = inspection;
  const severity = IMAGE_SEVERITY[result.condition];
  const status = SEVERITY_STATUS[severity];
  const tone = TONE[status];

  return (
    <div className="space-y-4">
      {result.source === 'demo' && (
        <p className="rounded border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-warn">
          Demo result. No AI model is connected, so this is not a real detection.
        </p>
      )}
      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <div className="text-sm text-mute">Condition</div>
          <div className={`font-display text-3xl font-bold leading-tight tracking-wide ${tone.text}`}>
            {IMAGE_LABEL[result.condition].toUpperCase()}
          </div>
        </div>
        <div>
          <div className="text-sm text-mute">Confidence</div>
          <div className="font-display text-3xl font-semibold leading-tight">{pct(result.confidence)}</div>
        </div>
        <div>
          <div className="text-sm text-mute">Severity</div>
          <div className="pt-1.5">
            <StatusBadge status={status} label={severity === 'NONE' ? 'NONE' : severity} />
          </div>
        </div>
      </div>
      {result.detections.length > 1 && (
        <ul className="divide-y divide-line text-sm">
          {result.detections.map((d, i) => (
            <li key={i} className="flex justify-between py-1.5">
              <span>{IMAGE_LABEL[d.label]}</span>
              <span className="text-mute">{pct(d.confidence)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function BeltInspection() {
  const { capture, setCapture, inspection, analyze } = useMonitoring();
  const cam = useCamera();
  const sampleRef = useRef<HTMLImageElement>(null);

  const onCapture = async () => {
    const frame = await cam.grabFrame(sampleRef.current);
    if (frame) setCapture(frame);
  };

  const detections = inspection.status === 'done' ? inspection.result.detections : [];

  return (
    <Section title="AI Belt Inspection">
      <div className="grid gap-4 lg:grid-cols-2">
        <figure>
          <figcaption className="mb-2 flex items-center justify-between text-sm text-mute">
            <span>Camera view</span>
            <span>{cam.active ? 'Live camera' : 'Camera off · sample image'}</span>
          </figcaption>
          <div className="overflow-hidden rounded border border-line bg-black">
            <video ref={cam.videoRef} muted playsInline className={cam.active ? 'block h-auto w-full' : 'hidden'} />
            <img
              ref={sampleRef}
              src="/sample-belt.svg"
              alt="Sample conveyor belt with a fastened joint"
              className={cam.active ? 'hidden' : 'block h-auto w-full'}
            />
          </div>
        </figure>

        <figure>
          <figcaption className="mb-2 flex items-center justify-between text-sm text-mute">
            <span>Captured image</span>
            {capture && <span>{capture.source === 'camera' ? 'From camera' : 'From sample image'}</span>}
          </figcaption>
          {capture ? (
            <div className="relative overflow-hidden rounded border border-line bg-black">
              <img src={capture.dataUrl} alt="Captured conveyor belt" className="block h-auto w-full" />
              {detections.length > 0 && <DetectionOverlay detections={detections} />}
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded border border-dashed border-line px-6 text-center text-mute">
              No image yet. Select Capture Image.
            </div>
          )}
        </figure>
      </div>

      {cam.error && <p className="mt-3 text-sm text-warn">{cam.error}</p>}

      <div className="mt-4 flex flex-wrap gap-3">
        <button className={secondary} onClick={cam.active ? cam.stop : cam.start}>
          {cam.active ? 'Stop Camera' : 'Start Camera'}
        </button>
        <button className={secondary} onClick={onCapture}>
          Capture Image
        </button>
        <button className={primary} onClick={analyze} disabled={!capture || inspection.status === 'analyzing'}>
          {inspection.status === 'analyzing' ? 'Analyzing…' : 'Analyze Image'}
        </button>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <h3 className="mb-3 text-[15px] font-semibold">AI inspection result</h3>
        <ResultPanel inspection={inspection} hasCapture={!!capture} />
      </div>
    </Section>
  );
}
