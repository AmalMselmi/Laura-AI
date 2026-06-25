const API_BASE =
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? '' : 'http://127.0.0.1:8000');

/** Absolute URL for <img>/<iframe>, or data URL / public http(s) unchanged. */
export function resolveMedicalFileUrl(href: string | undefined): string | undefined {
  if (!href) return undefined;
  if (href.startsWith('data:') || href.startsWith('http://') || href.startsWith('https://')) return href;
  if (href.startsWith('/')) return `${API_BASE}${href}`;
  return `${API_BASE}/${href}`;
}

export function isPdfLikeUrl(url?: string): boolean {
  if (!url) return false;
  if (url.startsWith('data:application/pdf')) return true;
  const u = url.toLowerCase();
  return u.includes('.pdf') || u.includes('-file.pdf');
}
