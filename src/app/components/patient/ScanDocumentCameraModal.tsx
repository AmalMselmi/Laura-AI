import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Video, VideoOff, RotateCcw } from 'lucide-react';

/** Webcam / mobile capture overlay — Figma Make `ScanDocument` parity */
export function ScanDocumentCameraModal({
  onCapture,
  onClose,
}: {
  onCapture: (file: File) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState(false);
  const [facing, setFacing] = useState<'environment' | 'user'>('environment');

  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          void videoRef.current?.play();
          setReady(true);
        };
      }
    } catch {
      setError("Impossible d'accéder à la caméra. Vérifiez les autorisations.");
    }
  }, []);

  useEffect(() => {
    void startCamera(facing);
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, [facing, startCamera]);

  const capture = () => {
    if (!videoRef.current || !ready) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 250);
    const c = document.createElement('canvas');
    c.width = videoRef.current.videoWidth || 1280;
    c.height = videoRef.current.videoHeight || 720;
    c.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    c.toBlob(
      (blob) => {
        if (!blob) return;
        streamRef.current?.getTracks().forEach((t) => t.stop());
        onCapture(new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.92
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {flash && <div className="pointer-events-none absolute inset-0 z-10 bg-white opacity-70" />}
      <div className="z-20 flex items-center justify-between bg-black/80 px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
          aria-label="Fermer"
        >
          <X className="h-5 w-5 text-white" />
        </button>
        <span className="text-sm font-semibold text-white">Photographier le document</span>
        <button
          type="button"
          onClick={() => setFacing((f) => (f === 'environment' ? 'user' : 'environment'))}
          className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
          aria-label="Changer de caméra"
        >
          <RotateCcw className="h-5 w-5 text-white" />
        </button>
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black">
        {error ? (
          <div className="px-6 text-center">
            <VideoOff className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p className="text-sm text-white">{error}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-xl bg-white/20 px-5 py-2.5 text-sm text-white"
            >
              Fermer
            </button>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            {ready && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative aspect-[4/3] w-3/4">
                  {[
                    'left-0 top-0 border-l-2 border-t-2',
                    'right-0 top-0 border-r-2 border-t-2',
                    'bottom-0 left-0 border-b-2 border-l-2',
                    'bottom-0 right-0 border-b-2 border-r-2',
                  ].map((c, i) => (
                    <div key={i} className={`absolute h-8 w-8 border-white/80 ${c}`} />
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="rounded-full bg-black/40 px-3 py-1 text-xs text-white/60">
                      Centrez le document
                    </p>
                  </div>
                </div>
              </div>
            )}
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <p className="flex animate-pulse items-center gap-2 text-sm text-white">
                  <Video className="h-5 w-5" />
                  Initialisation…
                </p>
              </div>
            )}
          </>
        )}
      </div>
      {!error && (
        <div className="flex items-center justify-center bg-black/80 py-6">
          <button
            type="button"
            onClick={capture}
            disabled={!ready}
            className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-gray-300 bg-white shadow-lg transition-transform active:scale-95 disabled:opacity-40"
            aria-label="Capturer"
          >
            <div className="h-12 w-12 rounded-full bg-white" />
          </button>
        </div>
      )}
    </div>
  );
}
