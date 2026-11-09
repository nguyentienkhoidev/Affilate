'use client';

import { useToast } from '@/context/ToastContext';
import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { DEFAULT_USER_PASSWORD, type UserData } from '../_lib/data';

/**
 * Encapsulates all user action handlers (toggle status, toggle 2FA, delete, reset password)
 * calling Spring Boot Backend APIs directly without localStorage.
 */
export function useUserActions() {
  const { toast, confirm: confirmModal, alertModal } = useToast();

  const handleToggleStatus = async (id: number, users: UserData[] = [], onRefresh?: () => void) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    if (user.isSuperAdmin) {
      await alertModal({
        title: 'Action Not Permitted',
        message: 'Cannot deactivate the Super Administrator account.',
        variant: 'danger',
      });
      return;
    }

    const newStatus = !user.isActive;
    const actionText = newStatus ? 'reactivate' : 'deactivate';

    const confirmed = await confirmModal({
      title: newStatus ? 'Confirm Account Activation' : 'Confirm Account Deactivation',
      message: (
        <span>
          Are you sure you want to {actionText} the account for{' '}
          <strong className="text-slate-900 font-bold">{user.fullName}</strong> ({user.email})?{' '}
          {!newStatus && 'This account will be temporarily locked and unable to sign in.'}
        </span>
      ),
      confirmText: newStatus ? 'Activate Now' : 'Deactivate',
      cancelText: 'Cancel',
      variant: newStatus ? 'info' : 'warning',
    });

    if (confirmed) {
      try {
        await apiClient.patch(`${API_ENDPOINTS.ADMIN.USERS}/${id}/status`, { isActive: newStatus });
        onRefresh?.();
        if (newStatus) {
          toast.success(`Account "${user.fullName}" reactivated successfully!`);
        } else {
          toast.warning(`Account "${user.fullName}" has been deactivated.`);
        }
      } catch {
        toast.error('Failed to update account status.');
      }
    }
  };

  const handleToggle2FA = async (id: number, users: UserData[] = [], onRefresh?: () => void) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    const new2FA = !user.twoFactorEnabled;
    const actionText = new2FA ? 'enable' : 'disable';

    const confirmed = await confirmModal({
      title: new2FA ? 'Enable Two-Factor Authentication (2FA)' : 'Disable Two-Factor Authentication (2FA)',
      message: (
        <span>
          Are you sure you want to {actionText} two-factor authentication (TOTP) for{' '}
          <strong className="text-slate-900 font-bold">{user.fullName}</strong>?{' '}
          {!new2FA
            ? 'Account security will be reduced to password-only sign-in.'
            : 'The user will be required to enter a 6-digit verification code (Google Authenticator / Authy) upon sign-in.'}
        </span>
      ),
      confirmText: new2FA ? 'Enable 2FA' : 'Confirm Disable',
      cancelText: 'Cancel',
      variant: new2FA ? 'info' : 'warning',
    });

    if (confirmed) {
      try {
        if (!new2FA) {
          await apiClient.post(`${API_ENDPOINTS.ADMIN.USERS}/${id}/reset-2fa`);
        }
        onRefresh?.();
        if (new2FA) {
          toast.success(`2FA enabled for "${user.fullName}"!`);
        } else {
          toast.info(`2FA disabled for "${user.fullName}".`);
        }
      } catch {
        toast.error('Failed to update 2FA configuration.');
      }
    }
  };

  const handleDeleteUser = async (id: number, users: UserData[] = [], onRefresh?: () => void) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    if (user.isSuperAdmin) {
      await alertModal({
        title: 'Action Not Permitted',
        message: 'Cannot delete the Super Administrator account.',
        variant: 'danger',
      });
      return;
    }

    const confirmed = await confirmModal({
      title: 'Confirm Permanent Account Deletion',
      message: (
        <span>
          Are you sure you want to delete the account{' '}
          <strong className="text-rose-600 font-bold">{user.fullName}</strong> ({user.email})?{' '}
          All associated operational privileges and records will be permanently removed.
        </span>
      ),
      confirmText: 'Delete Account',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (confirmed) {
      try {
        await apiClient.delete(`${API_ENDPOINTS.ADMIN.USERS}/${id}`);
        onRefresh?.();
        toast.success(`Account "${user.fullName}" permanently deleted!`);
      } catch {
        toast.error('Failed to delete staff account.');
      }
    }
  };

  const handleResetPassword = async (id: number, users: UserData[] = [], onRefresh?: () => void) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    const confirmed = await confirmModal({
      title: 'Reset to Default Password?',
      message: (
        <span>
          Are you sure you want to reset the password for{' '}
          <strong className="text-slate-900 font-bold">{user.fullName}</strong> ({user.email}) back to the system default password{' '}
          <code className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-xs font-bold text-[#C62828]">
            {DEFAULT_USER_PASSWORD}
          </code>
          ?
        </span>
      ),
      confirmText: 'Reset to Default',
      cancelText: 'Cancel',
      variant: 'warning',
    });

    if (confirmed) {
      try {
        await apiClient.put(`${API_ENDPOINTS.ADMIN.USERS}/${id}`, {
          fullName: user.fullName,
          email: user.email,
          password: DEFAULT_USER_PASSWORD,
          roleName: user.role,
          isActive: user.isActive,
        });
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(DEFAULT_USER_PASSWORD).catch(() => {});
        }
        onRefresh?.();
        toast.success(
          `Password for "${user.fullName}" reset to default (${DEFAULT_USER_PASSWORD}) and copied to clipboard!`
        );
      } catch {
        toast.error('Failed to reset password.');
      }
    }
  };

  return { handleToggleStatus, handleToggle2FA, handleDeleteUser, handleResetPassword };
}
