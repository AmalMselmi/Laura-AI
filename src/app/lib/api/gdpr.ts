import { apiRequest } from './client';

export interface GdprRequestCreatedApi {
  id: string;
  userId?: string | null;
  userName?: string | null;
  type: string;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function createGdprRequest(body: { type: string; notes?: string | null }): Promise<GdprRequestCreatedApi> {
  return apiRequest<GdprRequestCreatedApi>('/api/gdpr/request', { method: 'POST', body });
}
