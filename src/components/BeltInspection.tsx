import { useEffect, useRef, useState } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { useCamera } from '../hooks/useCamera';
import { IMAGE_LABEL, IMAGE_SEVERITY, pct, SEVERITY_STATUS, TONE } from '../lib/status';
import type { InspectionState } from '../types';
import DetectionOverlay from './DetectionOverlay';
import StatusBadge from './StatusBadge';

const buttonBase =
  'rounded-md border px-4 py-2 text-sm font-semibold transition-all shadow-sm disabled:cursor-not-allowed disabled:opacity-40';
const secondary = `${buttonBase} border-slate-200 bg-white text-slate-700 hover:bg-slate-50`;
const primary = `${buttonBase} border-[#0b4ea2] bg-[#0b4ea2] text-white hover:bg-[#083c7d]`;

function ResultPanel({ inspection, hasCapture }: { inspection: InspectionState; hasCapture: boolean }) {
  if (inspection.status === 'analyzing') return <p className="text-slate-500 font-medium py-2">Analyzing conveyor belt frame with AI...</p>;

  if (inspection.status === 'error') {
    return (
      <p role="alert" className="text-crit font-medium py-2">
        {inspection.message}
      </p>
    );
  }

  if (inspection.status === 'idle') {
    return (
      <p className="text-slate-500 text-sm py-2">
        {hasCapture ? 'Frame ready. Select Analyze Image to run defect detection.' : 'Capture an image from Top 1 feed to inspect the belt for defects.'}
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
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          Demo result. Simulated inspection analysis based on current defect profile.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-3 bg-slate-50/80 p-4 rounded-lg border border-slate-100">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Condition</div>
          <div className={`text-2xl font-bold tracking-tight mt-1 ${tone.text}`}>
            {IMAGE_LABEL[result.condition]}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confidence</div>
          <div className="text-2xl font-bold tracking-tight text-slate-800 mt-1">{pct(result.confidence)}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Severity</div>
          <div className="pt-1.5">
            <StatusBadge status={status} label={severity === 'NONE' ? 'NONE' : severity} />
          </div>
        </div>
      </div>
      {result.detections.length > 1 && (
        <ul className="divide-y divide-slate-100 text-sm bg-white rounded-lg border border-slate-100">
          {result.detections.map((d, i) => (
            <li key={i} className="flex justify-between py-2 px-3">
              <span className="font-medium text-slate-700">{IMAGE_LABEL[d.label]}</span>
              <span className="text-slate-500 font-mono text-xs">{pct(d.confidence)} confidence</span>
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const insertedVideoRef = useRef<HTMLVideoElement>(null);
  const insertedImageRef = useRef<HTMLImageElement>(null);

  const [insertedMedia, setInsertedMedia] = useState<{
    type: 'image' | 'video';
    url: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    return () => {
      if (insertedMedia?.url) {
        URL.revokeObjectURL(insertedMedia.url);
      }
    };
  }, [insertedMedia]);

  const handleToggleCamera = () => {
    if (cam.active) {
      cam.stop();
    } else {
      if (insertedMedia?.url) {
        URL.revokeObjectURL(insertedMedia.url);
        setInsertedMedia(null);
      }
      cam.start();
    }
  };

  const handleInsertClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (cam.active) {
      cam.stop();
    }

    if (insertedMedia?.url) {
      URL.revokeObjectURL(insertedMedia.url);
    }

    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');

    if (isVideo) {
      setInsertedMedia({ type: 'video', url, name: file.name });
    } else {
      setInsertedMedia({ type: 'image', url, name: file.name });

      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth || 640;
        const height = img.naturalHeight || 360;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              setCapture({
                dataUrl: canvas.toDataURL('image/jpeg', 0.92),
                blob,
                width,
                height,
                source: 'sample',
                capturedAt: Date.now(),
              });
            }
          }, 'image/jpeg', 0.92);
        }
      };
      img.src = url;
    }

    e.target.value = '';
  };

  const onCapture = async () => {
    if (insertedMedia?.type === 'video' && insertedVideoRef.current) {
      const video = insertedVideoRef.current;
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 360;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            setCapture({
              dataUrl: canvas.toDataURL('image/jpeg', 0.92),
              blob,
              width,
              height,
              source: 'camera',
              capturedAt: Date.now(),
            });
          }
        }, 'image/jpeg', 0.92);
      }
      return;
    }

    if (insertedMedia?.type === 'image' && insertedImageRef.current) {
      const img = insertedImageRef.current;
      const width = img.naturalWidth || 640;
      const height = img.naturalHeight || 360;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            setCapture({
              dataUrl: canvas.toDataURL('image/jpeg', 0.92),
              blob,
              width,
              height,
              source: 'sample',
              capturedAt: Date.now(),
            });
          }
        }, 'image/jpeg', 0.92);
      }
      return;
    }

    const frame = await cam.grabFrame(sampleRef.current);
    if (frame) setCapture(frame);
  };

  const detections = inspection.status === 'done' ? inspection.result.detections : [];

  return (
    <div className="space-y-4">
      {/* Video / Image Feed Card */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0b4ea2]">
            <span className="flex items-center justify-center w-5 h-5 rounded border border-[#0b4ea2] text-[11px]">
              ▶
            </span>
            <span>Top 1</span>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {cam.active
              ? '● Live Camera'
              : insertedMedia
              ? `● Inserted ${insertedMedia.type === 'video' ? 'Video' : 'Image'}`
              : 'Sample Feed'}
          </span>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center">
          {insertedMedia?.type === 'video' ? (
            <div className="relative w-full h-full">
              <video
                ref={insertedVideoRef}
                src={insertedMedia.url}
                autoPlay
                loop
                muted
                playsInline
                controls
                className="block h-full w-full object-cover"
              />
              {detections.length > 0 && <DetectionOverlay detections={detections} />}
            </div>
          ) : insertedMedia?.type === 'image' ? (
            <div className="relative w-full h-full">
              <img
                ref={insertedImageRef}
                src={insertedMedia.url}
                alt="Inserted feed"
                className="block h-full w-full object-cover"
              />
              {detections.length > 0 && <DetectionOverlay detections={detections} />}
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <video ref={cam.videoRef} muted playsInline className={cam.active ? 'block h-full w-full object-cover' : 'hidden'} />
              <img
                ref={sampleRef}
                src="/sample-belt.svg"
                alt="Live conveyor belt feed"
                className={cam.active ? 'hidden' : 'block h-full w-full object-cover'}
              />
              {detections.length > 0 && <DetectionOverlay detections={detections} />}
            </div>
          )}

          {!insertedMedia && (
            <button
              onClick={handleToggleCamera}
              className="absolute bottom-2.5 right-2.5 p-1.5 rounded bg-black/60 text-white/90 hover:text-white hover:bg-black/80 transition-colors"
              title="Toggle Camera Feed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Control Buttons & AI Analysis Panel */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-card">
        {cam.error && (
          <p className="mb-3 text-xs font-medium text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200">
            {cam.error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2.5">
            <button className={secondary} onClick={handleToggleCamera}>
              {cam.active ? 'Stop Camera' : 'Start Camera'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button className={secondary} onClick={handleInsertClick}>
              Insert
            </button>
            <button className={secondary} onClick={onCapture}>
              Capture Image
            </button>
            <button className={primary} onClick={analyze} disabled={!capture || inspection.status === 'analyzing'}>
              {inspection.status === 'analyzing' ? 'Analyzing…' : 'Analyze Image'}
            </button>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <h3 className="mb-2 text-sm font-bold text-slate-800">AI Inspection Diagnosis</h3>
          <ResultPanel inspection={inspection} hasCapture={!!capture} />
        </div>
      </div>
    </div>
  );
}
