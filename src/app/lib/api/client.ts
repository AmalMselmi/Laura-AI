type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  auth?: boolean;
  retryOn401?: boolean;
  credentials?: RequestCredentials;
}

type RefreshHandler = () => Promise<boolean>;

/** In dev, empty base uses Vite proxy (`vite.config.ts`) → same host as the UI. */
const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? '' : 'http://127.0.0.1:8000');

let accessToken: string | null = null;
let refreshHandler: RefreshHandler | null = null;
let refreshInFlight: Promise<boolean> | null = null;

export class ApiError extends Error {
  status: number;
  code?: string;
  payload?: unknown;

  constructor(message: string, status: number, code?: string, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function registerRefreshHandler(handler: RefreshHandler): void {
  refreshHandler = handler;
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractErrorMessageAndCode(
  payload: unknown,
  status: number,
): { message: string; code?: string } {
  const body = (payload ?? {}) as Record<string, unknown>;
  const detail = body.detail;
  if (typeof detail === 'object' && detail !== null && !Array.isArray(detail)) {
    const o = detail as { code?: string; message?: string };
    const msg =
      (typeof o.message === 'string' && o.message.trim()) ||
      (typeof o.code === 'string' && o.code) ||
      `HTTP ${status}`;
    return { message: msg, code: typeof o.code === 'string' ? o.code : undefined };
  }
  if (typeof detail === 'string') {
    return { message: detail };
  }
  if (Array.isArray(detail) && detail.length > 0 && typeof detail[0] === 'object') {
    const first = detail[0] as { msg?: string };
    if (typeof first.msg === 'string') return { message: first.msg };
  }
  const topMsg = typeof body.message === 'string' ? body.message : undefined;
  const topCode = typeof body.code === 'string' ? body.code : undefined;
  return { message: topMsg || `HTTP ${status}`, code: topCode };
}

function buildApiError(response: Response, payload: unknown): ApiError {
  const { message, code } = extractErrorMessageAndCode(payload, response.status);
  return new ApiError(message || `HTTP ${response.status}`, response.status, code, payload);
}

async function refreshAccessTokenOnce(): Promise<boolean> {
  if (!refreshHandler) return false;
  if (!refreshInFlight) {
    refreshInFlight = refreshHandler().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    headers,
    auth = true,
    retryOn401 = true,
    credentials = 'include',
  } = options;

  const requestHeaders = new Headers(headers);
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && !isFormData && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }
  if (auth && accessToken) {
    requestHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials,
    headers: requestHeaders,
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  if (response.status === 401 && retryOn401 && auth) {
    const refreshed = await refreshAccessTokenOnce();
    if (refreshed && accessToken) {
      return apiRequest<T>(path, { ...options, retryOn401: false });
    }
  }

  const payload = await parseJsonSafe(response);
  if (!response.ok) {
    throw buildApiError(response, payload);
  }

  return payload as T;
}
