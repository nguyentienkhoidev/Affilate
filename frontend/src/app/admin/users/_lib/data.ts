export interface UserLoginRecord {
  id: number | string;
  userId?: number;
  timestamp?: string;
  createdAt?: string;
  ipAddress: string;
  location: string;
  device: string;
  authMethod: string;
  status: string;
  duration?: string;
}

export interface UserData {
  id: number;
  fullName: string;
  email: string;
  role: string;
  roleId?: number;
  roleName?: string;
  roleSlug?: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt?: string;
  avatar?: string;
  phone?: string;
  department?: string;
  timezone?: string;
  bio?: string;
  socialX?: string;
  socialLinkedIn?: string;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  loginCount?: number;
  passwordUpdatedAt?: string;
  loginHistory?: UserLoginRecord[];
  mustChangePassword?: boolean;
}

export const USERS_STORE_KEY = 'staff-users';
export const DEFAULT_USER_PASSWORD = 'HeyGoodly@2026';

export function formatLoginTime(iso?: string | null): string {
  if (!iso) return 'Just now';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).replace(',', '').replace(/(\d{4})\s/, '$1 • ');
  } catch {
    return iso;
  }
}

/**
 * Normalizes user record from API ensuring consistent fields for UI rendering.
 * Strictly database-driven without fabricated fake login history.
 */
export function resolveUserWithDefaults(user: UserData): UserData {
  return {
    ...user,
    role: user.role || user.roleName || (user.isSuperAdmin ? 'Administrator' : 'Staff'),
    avatar: user.avatar || '',
    phone: user.phone || '',
    department: user.department || '',
    timezone: user.timezone || 'Asia/Ho_Chi_Minh (ICT / UTC+7)',
    bio: user.bio || '',
    socialX: user.socialX || '',
    socialLinkedIn: user.socialLinkedIn || '',
    lastLoginAt: user.lastLoginAt ? formatLoginTime(user.lastLoginAt) : 'Never signed in',
    lastLoginIp: user.lastLoginIp || '—',
    loginCount: user.loginCount ?? (user.loginHistory?.length || 0),
    loginHistory: user.loginHistory ?? [],
  };
}
