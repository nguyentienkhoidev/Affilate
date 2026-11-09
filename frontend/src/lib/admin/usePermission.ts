'use client';

import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '@/constants/ui-constants';
import { authService } from '@/services/authService';

export type RoleType = 'admin' | 'staff';

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
    roleName: 'Staff',
    isSuperAdmin: false,
    permissions: [
      'backend.access',
      'dashboard.view',
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
      'tag.view',
      'tag.create',
      'tag.update',
      'file.upload',
      'user.2fa_self',
      'audit.view',
    ],
  },
};

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
      // 1. Read real authenticated user from session
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.isSuperAdmin || parsed.roleSlug === 'admin') {
          setActiveRoleKey('admin');
        } else if (parsed.roleSlug === 'staff') {
          setActiveRoleKey('staff');
        } else {
          setActiveRoleKey('admin');
        }
      } else {
        setActiveRoleKey('admin');
      }

      // 2. Clean up any stale mock role keys from localStorage
      localStorage.removeItem('admin:active_role');
    } catch {
      setActiveRoleKey('admin');
    }
    setMounted(true);
  }, []);

  const currentRole = ROLE_PRESETS[activeRoleKey] || ROLE_PRESETS.admin;

  const switchRole = useCallback((role: RoleType) => {
    setActiveRoleKey(role);
  }, []);

  const hasPermission = useCallback(
    (permissionCode?: string): boolean => {
      if (!permissionCode) return true;
      if (currentRole.isSuperAdmin || currentRole.permissions.includes('ALL')) return true;

      // Core permissions are permanently active across ALL roles
      if (CORE_PERMISSION_CODES.includes(permissionCode)) return true;

      // Evaluate permissions packaged directly in user's JWT access token
      const tokenPerms = authService.getPermissions();
      if (tokenPerms.length > 0) {
        if (tokenPerms.includes('ALL') || tokenPerms.includes('*') || tokenPerms.includes(permissionCode)) {
          return true;
        }
      }

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
