import {
  DocumentFolderApi,
  MedicalDocumentApi,
  ScopeStatusResponse,
  ShareCreateResponseApi,
} from '../../types/api';
import { apiRequest } from './client';

export async function getPatientDashboard(): Promise<ScopeStatusResponse> {
  return apiRequest<ScopeStatusResponse>('/api/patient/dashboard');
}

export async function listPatientDocuments(params?: {
  search?: string;
  type?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}): Promise<MedicalDocumentApi[]> {
  const q = new URLSearchParams();
  if (params?.search) q.set('search', params.search);
  if (params?.type) q.set('type', params.type);
  if (params?.sort) q.set('sort', params.sort);
  if (params?.order) q.set('order', params.order);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  return apiRequest<MedicalDocumentApi[]>(`/api/patient/documents${suffix}`);
}

export async function createPatientDocument(body: Partial<MedicalDocumentApi> & Pick<MedicalDocumentApi, 'name' | 'type' | 'date'>): Promise<MedicalDocumentApi> {
  return apiRequest<MedicalDocumentApi>('/api/patient/documents', { method: 'POST', body });
}

export async function getPatientDocument(id: string): Promise<MedicalDocumentApi> {
  return apiRequest<MedicalDocumentApi>(`/api/patient/documents/${id}`);
}

export async function deletePatientDocument(id: string): Promise<void> {
  await apiRequest<null>(`/api/patient/documents/${id}`, { method: 'DELETE' });
}

export async function listPatientFolders(): Promise<DocumentFolderApi[]> {
  return apiRequest<DocumentFolderApi[]>('/api/patient/folders');
}

export async function createPatientFolder(body: { name: string; description?: string }): Promise<DocumentFolderApi> {
  return apiRequest<DocumentFolderApi>('/api/patient/folders', { method: 'POST', body });
}

export async function setFolderDocuments(folderId: string, documentIds: string[]): Promise<DocumentFolderApi> {
  return apiRequest<DocumentFolderApi>(`/api/patient/folders/${folderId}/documents`, {
    method: 'PUT',
    body: { documentIds },
  });
}

export async function deletePatientFolder(folderId: string): Promise<void> {
  await apiRequest<null>(`/api/patient/folders/${folderId}`, { method: 'DELETE' });
}

export async function sharePatientDocument(docId: string): Promise<ShareCreateResponseApi> {
  return apiRequest<ShareCreateResponseApi>(`/api/patient/documents/${docId}/share`, { method: 'POST', body: {} });
}

export async function sharePatientFolder(folderId: string): Promise<ShareCreateResponseApi> {
  return apiRequest<ShareCreateResponseApi>(`/api/patient/folders/${folderId}/share`, { method: 'POST', body: {} });
}
