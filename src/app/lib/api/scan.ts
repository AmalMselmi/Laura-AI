import { ScanAnalyzeResponseApi, ScanQuotaResponseApi } from '../../types/api';
import { apiRequest } from './client';

export interface ScanAnalyzePayload {
  fileBase64: string;
  mimeType: string;
  fileName: string;
  userId?: string;
}

export async function analyzeScan(
  payload: ScanAnalyzePayload,
  options: { auth?: boolean } = {}
): Promise<ScanAnalyzeResponseApi> {
  const { auth = true } = options;
  return apiRequest<ScanAnalyzeResponseApi>('/api/scan/analyze', {
    method: 'POST',
    body: payload,
    auth,
  });
}

/** Multipart scan (production-friendly). When logged in as patient, persists `file_url` server-side. */
export async function analyzeScanMultipart(
  file: File,
  options: { auth?: boolean; userId?: string } = {}
): Promise<ScanAnalyzeResponseApi> {
  const { auth = true, userId } = options;
  const fd = new FormData();
  fd.append('file', file, file.name);
  if (userId) fd.append('user_id', userId);
  return apiRequest<ScanAnalyzeResponseApi>('/api/scan/analyze-multipart', {
    method: 'POST',
    body: fd,
    auth,
  });
}

export async function getScanQuota(): Promise<ScanQuotaResponseApi> {
  return apiRequest<ScanQuotaResponseApi>('/api/scan/quota');
}
