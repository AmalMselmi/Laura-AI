import {
  AdminComplianceApi,
  AdminGdprRequestApi,
  AdminPlanApi,
  AdminStatsApi,
  AdminStorageApi,
  AdminUserRowApi,
  ScopeStatusResponse,
} from '../../types/api';
import { apiRequest, getAccessToken } from './client';

export async function getAdminOverview(): Promise<ScopeStatusResponse> {
  return apiRequest<ScopeStatusResponse>('/api/admin/overview');
}

export async function getAdminStats(): Promise<AdminStatsApi> {
  return apiRequest<AdminStatsApi>('/api/admin/stats');
}

export interface AdminUsersQuery {
  search?: string;
  role?: string;
  status?: string;
}

export async function getAdminUsers(params?: AdminUsersQuery): Promise<AdminUserRowApi[]> {
  const q = new URLSearchParams();
  if (params?.search) q.set('search', params.search);
  if (params?.role) q.set('role', params.role);
  if (params?.status) q.set('status', params.status);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  return apiRequest<AdminUserRowApi[]>(`/api/admin/users${suffix}`);
}

export async function patchAdminUserStatus(
  userId: string,
  body: { status: 'active' | 'suspended' | 'pending' }
): Promise<AdminUserRowApi> {
  return apiRequest<AdminUserRowApi>(`/api/admin/users/${userId}/status`, { method: 'PATCH', body });
}

export async function patchAdminUserPlan(userId: string, body: { planId: string }): Promise<AdminUserRowApi> {
  return apiRequest<AdminUserRowApi>(`/api/admin/users/${userId}/plan`, { method: 'PATCH', body });
}

export async function deleteAdminUser(userId: string): Promise<void> {
  await apiRequest<unknown>(`/api/admin/users/${userId}`, { method: 'DELETE' });
}

export async function getAdminPlans(): Promise<AdminPlanApi[]> {
  return apiRequest<AdminPlanApi[]>('/api/admin/plans');
}

export async function putAdminPlan(planId: string, body: Record<string, unknown>): Promise<AdminPlanApi> {
  return apiRequest<AdminPlanApi>(`/api/admin/plans/${planId}`, { method: 'PUT', body });
}

export async function getAdminStorage(): Promise<AdminStorageApi> {
  return apiRequest<AdminStorageApi>('/api/admin/storage');
}

export async function getAdminGdprRequests(): Promise<AdminGdprRequestApi[]> {
  return apiRequest<AdminGdprRequestApi[]>('/api/admin/gdpr/requests');
}

export async function patchAdminGdprRequest(
  requestId: string,
  body: { status: 'pending' | 'in_progress' | 'completed'; notes?: string }
): Promise<AdminGdprRequestApi> {
  return apiRequest<AdminGdprRequestApi>(`/api/admin/gdpr/requests/${requestId}`, { method: 'PATCH', body });
}

export async function getAdminGdprCompliance(): Promise<AdminComplianceApi> {
  return apiRequest<AdminComplianceApi>('/api/admin/gdpr/compliance');
}

function apiPublicOrigin(): string {
  return import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? '' : 'http://127.0.0.1:8000');
}

export function getAdminGdprExportUrl(userId: string): string {
  const base = apiPublicOrigin();
  return `${base}/api/admin/gdpr/export/${userId}`;
}

export async function fetchAdminUserExportCsv(userId: string): Promise<string> {
  const base = apiPublicOrigin();
  const token = getAccessToken();
  const res = await fetch(`${base}/api/admin/gdpr/export/${userId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
  });
  if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
  return res.text();
}
