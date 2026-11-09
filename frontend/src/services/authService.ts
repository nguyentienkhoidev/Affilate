import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { STORAGE_KEYS } from '@/constants/ui-constants';

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  roleName: string;
  roleSlug: string;
  avatar?: string | null;
  isSuperAdmin: boolean;
  twoFactorEnabled: boolean;
  permissions?: string[];
}

/**
 * Safely decodes base64url payload from a JWT token
 */
export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Extracts permissions list packaged inside the JWT token claims
 */
export function extractPermissionsFromToken(token: string): string[] {
  const payload = decodeJwtPayload(token);
  if (!payload) return [];
  const perms = payload.permissions || payload.authorities || [];
  return Array.isArray(perms) ? perms : [];
}

/**
 * Checks if a JWT token is expired (including a 10s buffer for clock skew)
 */
export function isTokenExpired(token?: string | null): boolean {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  // Buffer 10 seconds to handle network latency & clock skew
  return Date.now() >= payload.exp * 1000 - 10000;
}

/**
 * Checks if a JWT token has a valid 3-part structure and valid JSON payload
 */
export function isValidJwtFormat(token?: string | null): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  return decodeJwtPayload(token) !== null;
}

export interface LoginResponseData {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  requiresTwoFactor: boolean;
  tempToken?: string;
  user?: UserProfile;
}

export interface TwoFactorSetupData {
  secretKey: string;
  qrCodeUri: string;
  recoveryCodes: string[];
}

class AuthService {
  /**
   * Primary Login via email & password (optional OTP)
   */
  async login(email: string, password: string, otpCode?: number): Promise<LoginResponseData> {
    const res = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      email: email.trim().toLowerCase(),
      password,
      otpCode: otpCode || undefined,
    });

    const data = (res.data?.data || res.data) as LoginResponseData;

    if (!data.requiresTwoFactor && data.accessToken && data.user) {
      this.saveSession(data.accessToken, data.refreshToken, data.user);
    } else if (data.requiresTwoFactor && data.tempToken) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin:tempToken', data.tempToken);
        localStorage.setItem('admin:tempEmail', email.trim().toLowerCase());
      }
    }

    return data;
  }

  /**
   * Step 2: Verify 2FA TOTP code or Backup Recovery Code
   */
  async verify2Fa(tempToken: string, otpCode?: number, recoveryCode?: string): Promise<LoginResponseData> {
    const res = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_2FA, {
      tempToken,
      otpCode: otpCode || undefined,
      recoveryCode: recoveryCode ? recoveryCode.trim().toUpperCase() : undefined,
    });

    const data = (res.data?.data || res.data) as LoginResponseData;

    if (data.accessToken && data.user) {
      this.saveSession(data.accessToken, data.refreshToken, data.user);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin:tempToken');
        localStorage.removeItem('admin:tempEmail');
      }
    }

    return data;
  }

  /**
   * Refresh JWT Session
   */
  async refreshToken(refreshToken: string): Promise<LoginResponseData> {
    const res = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
    const data = (res.data?.data || res.data) as LoginResponseData;
    if (data.accessToken && data.user) {
      this.saveSession(data.accessToken, data.refreshToken, data.user);
    }
    return data;
  }

  /**
   * Get Current Authenticated User Profile
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const res = await apiClient.get(API_ENDPOINTS.AUTH.ME);
      return (res.data?.data || res.data) as UserProfile;
    } catch {
      return null;
    }
  }

  /**
   * Initiate RFC 6238 2FA Setup (generates QR & Secret)
   */
  async initiate2Fa(): Promise<TwoFactorSetupData> {
    const res = await apiClient.post(API_ENDPOINTS.AUTH.INITIATE_2FA);
    return (res.data?.data || res.data) as TwoFactorSetupData;
  }

  /**
   * Confirm 2FA Setup with 6-digit verification code
   */
  async confirm2Fa(otpCode: number, secretKey: string, recoveryCodes?: string[]): Promise<string[]> {
    const res = await apiClient.post(
      API_ENDPOINTS.AUTH.CONFIRM_2FA,
      { otpCode, secretKey, recoveryCodes },
      { params: { secretKey } }
    );
    return (res.data?.data || []) as string[];
  }

  /**
   * Disable 2FA on Current Account
   */
  async disable2Fa(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.DISABLE_2FA);
  }

  /**
   * Save Token & User profile in localStorage, extracting permissions directly from JWT
   */
  saveSession(accessToken: string, refreshToken: string | undefined, user: UserProfile): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    const tokenPerms = extractPermissionsFromToken(accessToken);
    const enrichedUser: UserProfile = {
      ...user,
      permissions: user.permissions && user.permissions.length > 0 ? user.permissions : tokenPerms,
    };
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(enrichedUser));
    localStorage.setItem('admin:2fa:lastVerified', new Date().toISOString());
  }

  /**
   * Get permissions packaged directly in current JWT token or active session
   */
  getPermissions(): string[] {
    if (typeof window === 'undefined') return [];
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      const perms = extractPermissionsFromToken(token);
      if (perms.length > 0) return perms;
    }
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (Array.isArray(parsed.permissions)) return parsed.permissions;
      } catch {
        // ignore
      }
    }
    return [];
  }

  /**
   * Logout and notify server to blacklist tokens in Redis, then clear all client auth keys
   */
  async logout(): Promise<void> {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    if (token) {
      try {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
      } catch {
        // Continue clearing client state even if network fails or backend is unreachable
      }
    }

    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem('admin:tempToken');
    localStorage.removeItem('admin:tempEmail');
    localStorage.removeItem('admin:2fa:lastVerified');
  }

  /**
   * Check if user is currently logged in with a valid, non-expired access token
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token || !isValidJwtFormat(token)) return false;
    return !isTokenExpired(token);
  }

  /**
   * Check if user has an active session (either valid access token or refresh token)
   */
  hasSession(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    return Boolean(token || refreshToken);
  }
}

export const authService = new AuthService();

