import {
  ScopeStatusResponse,
  ShareCreateResponseApi,
  SharedReportApi,
  SharedLabInfoApi,
  DicomFolderApi,
  DicomFolderCreatePayloadApi,
  DicomReportGenerateResponseApi,
  RadiologistLabContextApi,
  RadiologistStorageQuotaApi,
} from '../../types/api';
import { apiRequest } from './client';

export async function getRadiologistDashboard(): Promise<ScopeStatusResponse> {
  return apiRequest<ScopeStatusResponse>('/api/radiologist/dashboard');
}

export async function getRadiologistStorageQuota(): Promise<RadiologistStorageQuotaApi> {
  return apiRequest<RadiologistStorageQuotaApi>('/api/radiologist/storage-quota');
}

export async function getRadiologistLabContext(): Promise<RadiologistLabContextApi> {
  return apiRequest<RadiologistLabContextApi>('/api/radiologist/lab');
}

export interface RadiologistLabUpdatePayload {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  rpps: string;
  siret: string;
  clearLogo?: boolean;
  logoDataUrl?: string | null;
}

export async function updateRadiologistLab(
  payload: RadiologistLabUpdatePayload,
  logoFile?: File | null
): Promise<RadiologistLabContextApi> {
  if (logoFile) {
    const fd = new FormData();
    fd.append('data', JSON.stringify({ ...payload, clearLogo: payload.clearLogo ?? false }));
    fd.append('logo', logoFile);
    return apiRequest<RadiologistLabContextApi>('/api/radiologist/lab', { method: 'PUT', body: fd });
  }
  return apiRequest<RadiologistLabContextApi>('/api/radiologist/lab', {
    method: 'PUT',
    body: payload,
  });
}

export interface RadiologistProfileUpdatePayload {
  name: string;
  title: string;
  specialty: string;
}

export async function updateRadiologistProfile(
  payload: RadiologistProfileUpdatePayload
): Promise<RadiologistLabContextApi['profile']> {
  return apiRequest<RadiologistLabContextApi['profile']>('/api/radiologist/profile', {
    method: 'PUT',
    body: payload,
  });
}

export async function listRadiologistDicomFolders(): Promise<DicomFolderApi[]> {
  return apiRequest<DicomFolderApi[]>('/api/radiologist/folders');
}

export async function createRadiologistDicomFolder(
  payload: DicomFolderCreatePayloadApi
): Promise<DicomFolderApi> {
  return apiRequest<DicomFolderApi>('/api/radiologist/folders', {
    method: 'POST',
    body: payload,
  });
}

export async function uploadRadiologistDicomFiles(
  folderId: string,
  files: File[]
): Promise<DicomFolderApi> {
  const fd = new FormData();
  files.forEach(f => fd.append('files', f));
  return apiRequest<DicomFolderApi>(`/api/radiologist/folders/${folderId}/files`, {
    method: 'POST',
    body: fd,
  });
}

export async function generateRadiologistDicomReport(
  folderId: string
): Promise<DicomReportGenerateResponseApi> {
  return apiRequest<DicomReportGenerateResponseApi>(
    `/api/radiologist/folders/${folderId}/report/generate`,
    { method: 'POST' }
  );
}

export async function updateRadiologistDicomReport(
  folderId: string,
  payload: { reportContent: string; finalize: boolean }
): Promise<DicomFolderApi> {
  return apiRequest<DicomFolderApi>(`/api/radiologist/folders/${folderId}/report`, {
    method: 'PUT',
    body: payload,
  });
}

export async function shareRadiologistDicomFolder(
  folderId: string,
  payload: {
    label?: string;
    lab: SharedLabInfoApi;
    radiologistTitle: string;
    radiologistSpecialty: string;
  }
): Promise<ShareCreateResponseApi> {
  return apiRequest<ShareCreateResponseApi>(`/api/radiologist/folders/${folderId}/share`, {
    method: 'POST',
    body: payload,
  });
}

export async function deleteRadiologistDicomFile(
  folderId: string,
  fileId: string
): Promise<DicomFolderApi> {
  return apiRequest<DicomFolderApi>(`/api/radiologist/folders/${folderId}/files/${fileId}`, {
    method: 'DELETE',
  });
}

export async function shareRadiologistReport(payload: {
  report: SharedReportApi;
  label?: string;
  dicomFolderId?: string;
}): Promise<ShareCreateResponseApi> {
  return apiRequest<ShareCreateResponseApi>('/api/radiologist/share/report', {
    method: 'POST',
    body: payload,
  });
}
