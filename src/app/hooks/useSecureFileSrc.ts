import { useEffect, useState } from 'react';
import { getAccessToken } from '../lib/api/client';
import { resolveMedicalFileUrl } from '../utils/medicalMediaUrl';

/**
 * Resolves patient-only /file URLs via authenticated fetch to a blob URL
 * (browser does not send Bearer on <img>/<iframe> src).
 */
export function useSecureFileSrc(src: string | undefined): string | undefined {
  const [url, setUrl] = useState<string | undefined>(() =>
    src && src.startsWith('data:') ? src : undefined,
  );

  useEffect(() => {
    if (!src) {
      setUrl(undefined);
      return;
    }
    if (src.startsWith('data:')) {
      setUrl(src);
      return;
    }

    const resolved = resolveMedicalFileUrl(src) ?? src;
    const needsAuth =
      resolved.includes('/api/patient/documents/') && resolved.endsWith('/file');

    if (!needsAuth) {
      setUrl(resolved);
      return;
    }

    let blobObjectUrl: string | null = null;
    const ac = new AbortController();
    void (async () => {
      const token = getAccessToken();
      if (!token) {
        setUrl(undefined);
        return;
      }
      try {
        const res = await fetch(resolved, {
          signal: ac.signal,
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        if (!res.ok) return;
        const blob = await res.blob();
        blobObjectUrl = URL.createObjectURL(blob);
        setUrl(blobObjectUrl);
      } catch {
        setUrl(undefined);
      }
    })();

    return () => {
      ac.abort();
      if (blobObjectUrl) URL.revokeObjectURL(blobObjectUrl);
    };
  }, [src]);

  return url;
}
