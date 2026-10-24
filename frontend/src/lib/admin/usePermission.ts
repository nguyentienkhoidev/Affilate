'use client';

import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '@/constants/ui-constants';

export type RoleType = 'admin' | 'staff' | 'content_writer' | 'deals_hunter';

export interface UserRoleProfile {
  roleSlug: RoleType;
  roleName: string;
  isSuperAdmin: boolean;
  permissions: string[];
}

export const ROLE_PRESETS: Record<RoleType, UserRoleProfile> = {
  admin: {
    roleSlug: 'admin',
    roleName: 'Super Administrator',
    isSuperAdmin: true,
    permissions: ['ALL'],
  },
  staff: {
    roleSlug: 'staff',
    roleName: 'Nhân viên Vận hành (Staff)',
    isSuperAdmin: false,
    permissions: [
      'backend.access',
      'store.view',
      'store.create',
      'store.update',
      'offer.view',
      'offer.create',
      'offer.update',
      'offer.verify',
      'offer.clone',
      'post.view',
      'post.create',
      'post.update',
      'post.clone',
      'category.view',
      'file.upload',
      'user.2fa_self',
      'audit.view',
    ],
  },
  content_writer: {
    roleSlug: 'content_writer',
    roleName: 'Cộng tác viên Content',
    isSuperAdmin: false,
    permissions: [
      'backend.access',
      'post.view',
      'post.create',
      'post.update',
      'post.clone',
      'category.view',
      'file.upload',
      'user.2fa_self',
    ],
  },
  deals_hunter: {
    roleSlug: 'deals_hunter',
    roleName: 'Nhân viên Săn Deals / Coupon',
    isSuperAdmin: false,
    permissions: [
      'backend.access',
      'store.view',
      'store.update',
      'offer.view',
      'offer.create',
      'offer.update',
      'offer.verify',
      'offer.clone',
      'file.upload',
      'user.2fa_self',
    ],
  },
};

const STORAGE_ROLE_KEY = 'admin:active_role';

export const CORE_PERMISSION_CODES: string[] = [
  'backend.access',
  'dashboard.view',
  'user.2fa_self',
  'file.upload',
];

export function usePermission() {
  const [activeRoleKey, setActiveRoleKey] = useState<RoleType>('admin');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ROLE_KEY) as RoleType | null;
      if (stored && ROLE_PRESETS[stored]) {
        setActiveRoleKey(stored);
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  const currentRole = ROLE_PRESETS[activeRoleKey] || ROLE_PRESETS.admin;

  const switchRole = useCallback((role: RoleType) => {
    setActiveRoleKey(role);
    try {
      localStorage.setItem(STORAGE_ROLE_KEY, role);
      // Sync with user data
      const current = {
        id: 1,
        fullName: ROLE_PRESETS[role].roleName,
        email: 'admin@bargorya.com',
        roleName: ROLE_PRESETS[role].roleName,
        roleSlug: role,
        isSuperAdmin: ROLE_PRESETS[role].isSuperAdmin,
        permissions: Array.from(new Set([...ROLE_PRESETS[role].permissions, ...CORE_PERMISSION_CODES])),
      };
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(current));
    } catch {
      // ignore
    }
  }, []);

  const hasPermission = useCallback(
    (permissionCode?: string): boolean => {
      if (!permissionCode) return true;
      if (currentRole.isSuperAdmin || currentRole.permissions.includes('ALL')) return true;
      // Core permissions are permanently active across ALL roles and cannot be restricted
      if (CORE_PERMISSION_CODES.includes(permissionCode)) return true;
      return currentRole.permissions.includes(permissionCode);
    },
    [currentRole]
  );

  return {
    activeRoleKey,
    currentRole,
    switchRole,
    hasPermission,
    availableRoles: Object.values(ROLE_PRESETS),
    mounted,
  };
}
