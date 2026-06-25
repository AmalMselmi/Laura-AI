import type { APIRequestContext } from '@playwright/test';
import { E2E_SEED_ACCOUNTS } from './seedCredentials';

export const API_BASE = process.env.VITE_API_URL || 'http://127.0.0.1:8000';

export async function apiLogin(
  request: APIRequestContext,
  email: string,
  password: string,
  role: 'patient' | 'radiologist'
): Promise<{ access_token: string }> {
  const res = await request.post(`${API_BASE}/api/auth/login`, {
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({ email, password, role }),
  });
  if (!res.ok()) throw new Error(`login failed ${res.status()}: ${await res.text()}`);
  return res.json() as Promise<{ access_token: string }>;
}

export async function apiAdminLogin(
  request: APIRequestContext,
  email = E2E_SEED_ACCOUNTS.admin.email,
  password = E2E_SEED_ACCOUNTS.admin.password
): Promise<{ access_token: string }> {
  const res = await request.post(`${API_BASE}/api/auth/admin/login`, {
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({ email, password }),
  });
  if (!res.ok()) throw new Error(`admin login failed ${res.status()}`);
  return res.json() as Promise<{ access_token: string }>;
}

/** Minimal 1×1 PNG (bytes). */
export function tinyPngBuffer(): Buffer {
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
}
