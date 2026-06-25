import type { AsyncJobApi, PacsServerApi, PacsStudyApi } from '../../types/api';
import { apiRequest } from './client';

export async function listPacsServers(): Promise<PacsServerApi[]> {
  return apiRequest<PacsServerApi[]>('/api/radiologist/pacs');
}

export async function createPacsServer(payload: {
  name: string;
  host: string;
  port: number;
  aeTitle: string;
  callingAeTitle?: string;
  protocol?: 'DICOM' | 'DICOMweb';
  webUrl?: string;
  tls?: boolean;
  active?: boolean;
}): Promise<PacsServerApi> {
  return apiRequest<PacsServerApi>('/api/radiologist/pacs', { method: 'POST', body: payload });
}

export async function updatePacsServer(
  id: string,
  payload: Partial<{
    name: string;
    host: string;
    port: number;
    aeTitle: string;
    callingAeTitle: string;
    protocol: 'DICOM' | 'DICOMweb';
    webUrl: string;
    tls: boolean;
    active: boolean;
  }>
): Promise<PacsServerApi> {
  return apiRequest<PacsServerApi>(`/api/radiologist/pacs/${id}`, { method: 'PUT', body: payload });
}

export async function deletePacsServer(id: string): Promise<void> {
  await apiRequest<unknown>(`/api/radiologist/pacs/${id}`, { method: 'DELETE' });
}

export async function testPacsServer(id: string): Promise<PacsServerApi> {
  return apiRequest<PacsServerApi>(`/api/radiologist/pacs/${id}/test`, { method: 'POST' });
}

export async function queryPacsStudies(
  serverId: string,
  criteria: {
    patientName?: string;
    patientId?: string;
    studyDateFrom?: string;
    studyDateTo?: string;
    modality?: string;
  }
): Promise<PacsStudyApi[]> {
  return apiRequest<PacsStudyApi[]>(`/api/radiologist/pacs/${serverId}/query`, {
    method: 'POST',
    body: criteria,
  });
}

export async function retrievePacsStudies(serverId: string, studyUIDs: string[]): Promise<{ jobId: string }> {
  return apiRequest<{ jobId: string }>(`/api/radiologist/pacs/${serverId}/retrieve`, {
    method: 'POST',
    body: { studyUIDs },
  });
}

export async function getAsyncJob(jobId: string): Promise<AsyncJobApi> {
  return apiRequest<AsyncJobApi>(`/api/jobs/${jobId}`);
}
