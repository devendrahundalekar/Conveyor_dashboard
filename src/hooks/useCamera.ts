import { useCallback, useEffect, useRef, useState } from 'react';
import type { Capture } from '../types';

/**
 * Webcam access + frame capture.
 * If the camera is off, grabFrame() captures the sample image instead,
 * so the whole flow can be tested without a camera.
 * Later you can replace the <video> source with an ESP32-CAM stream.
 */
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser cannot open a camera here. Use localhost or HTTPS.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
    } catch {
      setError('Camera access was blocked or no camera was found. The sample image is used instead.');
    }
  }, []);

  useEffect(() => stop, [stop]);

  const grabFrame = useCallback(
    async (sample: HTMLImageElement | null): Promise<Capture | null> => {
      const video = videoRef.current;
      const useVideo = active && video && video.videoWidth > 0;
      const source: HTMLVideoElement | HTMLImageElement | null = useVideo ? video : sample;
      if (!source) return null;

      const width = source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth;
      const height = source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight;
      if (!width || !height) return null;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')?.drawImage(source, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      if (!blob) return null;

      return {
        dataUrl: canvas.toDataURL('image/jpeg', 0.92),
        blob,
        width,
        height,
        source: useVideo ? 'camera' : 'sample',
        capturedAt: Date.now(),
      };
    },
    [active],
  );

  return { videoRef, active, error, start, stop, grabFrame };
}
