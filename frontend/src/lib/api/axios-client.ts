import axios, { AxiosAdapter, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { STORAGE_KEYS } from '@/constants/ui-constants';
import { ROUTES } from '@/constants/routes';

// In-flight GET request deduplication cache to eliminate duplicate network calls (e.g. React Strict Mode in dev)
const inFlightRequests = new Map<string, Promise<AxiosResponse<any>>>();

const getDedupKey = (config: InternalAxiosRequestConfig): string => {
  const method = (config.method || 'get').toLowerCase();
  const base = config.baseURL || '';
  const url = config.url || '';
  const params = config.params
    ? Object.keys(config.params)
        .sort()
        .map((k) => `${k}=${String(config.params[k])}`)
        .join('&')
    : '';
  return `${method}:${base}:${url}:${params}`;
};

const defaultAdapter = axios.getAdapter(axios.defaults.adapter);

const dedupAdapter: AxiosAdapter = (config) => {
  const method = (config.method || 'get').toLowerCase();
  const isSafeMethod = method === 'get' || method === 'head';

  if (!isSafeMethod || (config as any).skipDedup) {
    return defaultAdapter(config);
  }

  const key = getDedupKey(config);
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key)!;
  }

  const promise = (async () => {
    try {
      return await defaultAdapter(config);
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, promise);
  return promise;
};

const resolveApiBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    const internalBase =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:8080';
    return internalBase.replace(/\/api\/v1\/?$/, '');
  }
  // In the browser: on production domains/IPs use same-origin gateway; keep localhost port override for local dev
  if (typeof window !== 'undefined') {
    const isLocalHost =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocalHost) {
      return window.location.origin;
    }
    if (window.location.protocol === 'https:' && process.env.NEXT_PUBLIC_API_URL?.startsWith('http://')) {
      return window.location.origin;
    }
    const publicUrl = process.env.NEXT_PUBLIC_API_URL;
    if (publicUrl && publicUrl.trim() !== '') {
      return publicUrl.replace(/\/api\/v1\/?$/, '');
    }
    return window.location.origin;
  }
  return '';
};

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  adapter: dedupAdapter,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to decode token expiry
function isJwtExpired(token?: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(json);
    if (!payload || typeof payload.exp !== 'number') return true;
    return Date.now() >= payload.exp * 1000 - 15000; // 15-second buffer
  } catch {
    return true;
  }
}

let activeRefreshPromise: Promise<string | null> | null = null;

async function getOrRefreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

  // If token is still valid, return it immediately
  if (token && !isJwtExpired(token)) {
    return token;
  }

  // If token is expired or expiring soon, but we have a refresh token:
  if (refreshToken) {
    if (activeRefreshPromise) {
      return activeRefreshPromise;
    }

    activeRefreshPromise = (async () => {
      try {
        const res = await axios.post(
          `${apiClient.defaults.baseURL}/api/v1/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );
        const data = res.data?.data || res.data;
        const newAccess = data?.accessToken;
        const newRefresh = data?.refreshToken;
        if (newAccess) {
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccess);
          if (newRefresh) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefresh);
          }
          return newAccess;
        }
        return null;
      } catch {
        return null;
      } finally {
        activeRefreshPromise = null;
      }
    })();

    return activeRefreshPromise;
  }

  return token;
}

// Request interceptor: attach fresh bearer token proactively
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const requestUrl = config.url || '';
    const isAuthEndpoint =
      requestUrl.includes('/api/v1/auth/login') ||
      requestUrl.includes('/api/v1/auth/refresh') ||
      requestUrl.includes('/api/v1/auth/verify-2fa');

    if (typeof window !== 'undefined' && config.headers) {
      const adminLocale = localStorage.getItem('admin:locale') || 'en';
      config.headers['Accept-Language'] = adminLocale;
      config.headers['X-Locale'] = adminLocale;
    }

    if (!isAuthEndpoint && typeof window !== 'undefined') {
      const validToken = await getOrRefreshAccessToken();
      if (validToken && config.headers) {
        config.headers.Authorization = `Bearer ${validToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Concurrency queue for in-flight token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const handleAuthCleanupAndRedirect = (reason: 'session_expired' | 'invalid_token' | 'missing_token') => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);

  const currentPath = window.location.pathname;
  if (currentPath.startsWith('/admin') && !currentPath.includes('/login')) {
    window.location.href = `${ROUTES.AUTH.LOGIN}?reason=${reason}&redirect=${encodeURIComponent(currentPath)}`;
  }
};

// Response interceptor: handle 401, invalid token, expired token, and refresh token rotation
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ code?: string; message?: string }>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const errorCode = error.response.data?.code;
    const requestUrl = originalRequest.url || '';

    // Ignore auth endpoints from retry loops
    const isAuthEndpoint =
      requestUrl.includes('/api/v1/auth/login') ||
      requestUrl.includes('/api/v1/auth/refresh') ||
      requestUrl.includes('/api/v1/auth/verify-2fa');

    if (status === 401 && !isAuthEndpoint) {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) : null;

      // If token is invalid or tampered (not simply expired) and no refresh token, cleanup immediately
      if (errorCode === 'TOKEN_INVALID' && !refreshToken) {
        handleAuthCleanupAndRedirect('invalid_token');
        return Promise.reject(error);
      }

      // If no token at all
      if (errorCode === 'TOKEN_MISSING' && !refreshToken) {
        handleAuthCleanupAndRedirect('missing_token');
        return Promise.reject(error);
      }

      // Attempt token refresh if refresh token is available and request hasn't been retried
      if (refreshToken && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((newAccessToken) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              }
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshRes = await axios.post(
            `${apiClient.defaults.baseURL}/api/v1/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const responseData = refreshRes.data?.data || refreshRes.data;
          const newAccessToken = responseData?.accessToken;
          const newRefreshToken = responseData?.refreshToken;

          if (newAccessToken) {
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
            }

            processQueue(null, newAccessToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return apiClient(originalRequest);
          } else {
            throw new Error('Refresh response did not return an access token');
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          handleAuthCleanupAndRedirect('session_expired');
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      } else {
        // No refresh token available or retry failed
        handleAuthCleanupAndRedirect('session_expired');
      }
    }

    return Promise.reject(error);
  }
);
