import { SharedLinkResponse } from '../../types/api';
import { apiRequest } from './client';

export async function getSharedLink(token: string): Promise<SharedLinkResponse> {
  return apiRequest<SharedLinkResponse>(`/api/shared/${token}`, {
    auth: false,
  });
}

export async function revokeSharedLink(token: string): Promise<void> {
  await apiRequest<null>(`/api/shared/${token}`, { method: 'DELETE' });
}
