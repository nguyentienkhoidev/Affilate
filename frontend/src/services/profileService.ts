import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  department?: string;
  timezone?: string;
  bio?: string;
  socialX?: string;
  socialLinkedIn?: string;
  roleName: string;
  roleSlug: string;
  isSuperAdmin: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  passwordUpdatedAt?: string | null;
  permissions: string[];
  notificationPreferences?: Record<string, boolean>;
}

export interface UpdateProfilePayload {
  fullName: string;
  phone?: string;
  avatar?: string;
  department?: string;
  timezone?: string;
  bio?: string;
  socialX?: string;
  socialLinkedIn?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  invalidateOtherSessions?: boolean;
}

export interface DeviceSession {
  id: number;
  device: string;
  browser: string;
  operatingSystem?: string;
  ipAddress: string;
  location?: string;
  isCurrent: boolean;
  createdAt: string;
  lastActive: string;
}

export interface ProfileAuditLog {
  id: number;
  action: string;
  module: string;
  resourceName: string;
  ipAddress: string;
  device: string;
  status: string;
  createdAt: string;
}

export interface NotificationSettings {
  securityLogins: boolean;
  twoFaChanges: boolean;
  commissionSpikes: boolean;
  couponExpirations: boolean;
  customerFeedback: boolean;
  browserPush: boolean;
}

export interface TwoFactorDetails {
  twoFactorEnabled: boolean;
  secretKey?: string;
  qrCodeUri?: string;
  recoveryCodes: string[];
}

class ProfileService {
  async getProfile(): Promise<UserProfile> {
    const res = await apiClient.get(API_ENDPOINTS.PROFILE.ROOT);
    return res.data?.data;
  }

  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    const res = await apiClient.put(API_ENDPOINTS.PROFILE.ROOT, payload);
    return res.data?.data;
  }

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await apiClient.put(API_ENDPOINTS.PROFILE.PASSWORD, payload);
  }

  async verifyPassword(password: string): Promise<boolean> {
    const res = await apiClient.post(API_ENDPOINTS.PROFILE.VERIFY_PASSWORD, { password });
    return Boolean(res.data?.data);
  }

  async unlock2Fa(password: string): Promise<TwoFactorDetails> {
    const res = await apiClient.post(API_ENDPOINTS.PROFILE.UNLOCK_2FA, { password });
    return res.data?.data;
  }

  async regenerateRecoveryCodes(): Promise<string[]> {
    const res = await apiClient.post(API_ENDPOINTS.PROFILE.REGENERATE_RECOVERY_CODES);
    return res.data?.data || [];
  }

  async getSessions(): Promise<DeviceSession[]> {
    const res = await apiClient.get(API_ENDPOINTS.PROFILE.SESSIONS);
    return res.data?.data || [];
  }

  async revokeSession(id: number | string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PROFILE.REVOKE_SESSION(id));
  }

  async revokeOtherSessions(): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PROFILE.REVOKE_OTHER_SESSIONS);
  }

  async getAuditLogs(params?: { type?: string; search?: string }): Promise<ProfileAuditLog[]> {
    const res = await apiClient.get(API_ENDPOINTS.PROFILE.AUDIT, { params });
    return res.data?.data || [];
  }

  async getNotifications(): Promise<NotificationSettings> {
    const res = await apiClient.get(API_ENDPOINTS.PROFILE.NOTIFICATIONS);
    return res.data?.data;
  }

  async updateNotifications(payload: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const res = await apiClient.put(API_ENDPOINTS.PROFILE.NOTIFICATIONS, payload);
    return res.data?.data;
  }
}

export const profileService = new ProfileService();

