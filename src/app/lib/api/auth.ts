import {
  AuthResponse,
  AuthUser,
  LoginPayload,
  MessageResponse,
  RegisterPayload,
} from '../../types/api';
import { apiRequest } from './client';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}

export async function adminLogin(payload: Omit<LoginPayload, 'role'>): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/admin/login', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}

export async function refresh(): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/refresh', {
    method: 'POST',
    auth: false,
    retryOn401: false,
  });
}

export async function me(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/api/auth/me');
}

export async function logout(): Promise<MessageResponse> {
  return apiRequest<MessageResponse>('/api/auth/logout', {
    method: 'POST',
    auth: false,
    retryOn401: false,
  });
}

export async function forgotPassword(email: string): Promise<MessageResponse> {
  return apiRequest<MessageResponse>('/api/auth/forgot-password', {
    method: 'POST',
    body: { email },
    auth: false,
  });
}
