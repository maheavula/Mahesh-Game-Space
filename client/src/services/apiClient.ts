let csrfTokenMemory: string | null = null;

export function getCsrfToken(): string | null {
  if (csrfTokenMemory) return csrfTokenMemory;
  const match = document.cookie.match(new RegExp('(^| )mgs_csrf=([^;]+)'));
  return match ? match[2] : null;
}

export function setCsrfTokenMemory(token: string | null) {
  csrfTokenMemory = token;
}

export class ApiError extends Error {
  public code: string;
  public details?: any;
  public statusCode?: number;

  constructor(message: string, code: string = 'API_ERROR', statusCode?: number, details?: any) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  // Attach CSRF header for state-changing HTTP methods
  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const token = getCsrfToken();
    if (token) {
      headers.set('X-CSRF-Token', token);
    }
  }

  const response = await fetch(path, {
    ...options,
    headers,
    credentials: 'include',
  });

  const rawJson = await response.json().catch(() => null);

  // If backend returns a new CSRF token in response data, store it
  if (rawJson?.data?.csrfToken) {
    setCsrfTokenMemory(rawJson.data.csrfToken);
  }

  if (!response.ok || rawJson?.success === false) {
    const errObj = rawJson?.error || {};
    throw new ApiError(
      errObj.message || `Request failed with status ${response.status}`,
      errObj.code || 'UNKNOWN_ERROR',
      response.status,
      errObj.details
    );
  }

  return rawJson.data as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: any) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: any) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: any) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
