'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  User,
  ShieldCheck,
  KeyRound,
  Lock,
  Smartphone,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  Save,
  ArrowRight,
  ShieldAlert,
  Globe,
  Clock,
  Laptop,
  CheckSquare,
  LogOut,
  Mail,
  Phone,
  Shield,
  Layers,
  Camera,
  Bell,
  Activity,
  History,
  MapPin,
  Calendar,
  ExternalLink,
  SlidersHorizontal,
  AlertCircle,
  FileText,
  BadgeCheck,
  CheckCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Trash2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import ImageUpload from '@/components/admin/ImageUpload';
import { usePermission } from '@/lib/admin/usePermission';
import { authService } from '@/services/authService';
import { profileService, DeviceSession, ProfileAuditLog } from '@/services/profileService';
import { useToast } from '@/context/ToastContext';
import { STORAGE_KEYS } from '@/constants/ui-constants';

interface SessionItem {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  isCurrent: boolean;
  lastActive: string;
}

interface AuditLogItem {
  id: string;
  event: string;
  module: string;
  ip: string;
  device: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  itemLabel,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20],
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  itemLabel: string;
  onPageChange: (p: number) => void;
  onPageSizeChange?: (s: number) => void;
  pageSizeOptions?: number[];
}) {
  const startIdx = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalItems);

  const pages: number[] = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
      <div className="flex items-center gap-2 flex-wrap">
        <span>
          Showing <span className="font-bold text-slate-800">{startIdx}</span> to{' '}
          <span className="font-bold text-slate-800">{endIdx}</span> of{' '}
          <span className="font-bold text-slate-800">{totalItems}</span> {itemLabel}
        </span>
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-3">
            <span className="text-[11px] text-slate-400">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 self-end sm:self-auto">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="w-7 h-7 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="First Page"
        >
          <ChevronsLeft size={13} />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="w-7 h-7 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft size={13} />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`w-7 h-7 inline-flex items-center justify-center rounded-lg text-xs font-bold transition cursor-pointer ${
              p === currentPage
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="w-7 h-7 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="Next Page"
        >
          <ChevronRight size={13} />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="w-7 h-7 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="Last Page"
        >
          <ChevronsRight size={13} />
        </button>
      </div>
    </div>
  );
}

export default function AdminProfilePage() {
  const { currentRole, switchRole } = usePermission();
  const { toast, confirm } = useToast();
  const [activeSection, setActiveSection] = useState<
    '2fa' | 'profile' | 'security' | 'sessions' | 'audit' | 'notifications'
  >('2fa');

  // URL query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sectionParam = new URLSearchParams(window.location.search).get('section');
      if (
        sectionParam &&
        ['2fa', 'profile', 'security', 'sessions', 'audit', 'notifications'].includes(sectionParam)
      ) {
        setActiveSection(sectionParam as any);
      }
    }
  }, []);

  // 1. Profile data (Fetched once on initial screen mount via single general profile API)
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    timezone: 'UTC+07:00 (Bangkok, Hanoi, Jakarta)',
    bio: '',
    socialX: '',
    socialLinkedIn: '',
    avatar: '',
    passwordUpdatedAt: null as string | null,
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // 2. Security Gate 1: 2FA Tab challenge
  const [is2FaUnlocked, setIs2FaUnlocked] = useState(false);
  const [unlock2FaPassword, setUnlock2FaPassword] = useState('');
  const [showUnlock2FaPassword, setShowUnlock2FaPassword] = useState(false);
  const [unlocking2Fa, setUnlocking2Fa] = useState(false);
  const [unlock2FaError, setUnlock2FaError] = useState('');

  // 2FA Methods Option Selector
  const [selectedTwoFaMethod, setSelectedTwoFaMethod] = useState<'totp' | 'email' | 'hardware' | 'sms'>('totp');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // 2FA Setup Modal Wizard
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [totpSecret, setTotpSecret] = useState('');
  const [qrCodeUri, setQrCodeUri] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [initiating2Fa, setInitiating2Fa] = useState(false);

  // Security Gate 2: Password & Auth tab challenge
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState(false);
  const [authUnlockPassword, setAuthUnlockPassword] = useState('');
  const [showAuthUnlockPassword, setShowAuthUnlockPassword] = useState(false);
  const [unlockingAuth, setUnlockingAuth] = useState(false);
  const [authUnlockError, setAuthUnlockError] = useState('');

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: '',
    invalidateOtherSessions: true,
  });
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Active Sessions state & pagination
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [sessionPage, setSessionPage] = useState(1);
  const [sessionPageSize, setSessionPageSize] = useState(5);

  // Notifications preferences
  const [notifications, setNotifications] = useState({
    securityLogins: true,
    twoFaChanges: true,
    commissionSpikes: true,
    couponExpirations: true,
    customerFeedback: true,
    browserPush: false,
  });
  const [notifSaved, setNotifSaved] = useState(false);

  // Audit Logs state, filtering & pagination
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(8);
  const [auditTypeFilter, setAuditTypeFilter] = useState('ALL');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  // Tab Loading States & In-flight Concurrency Guard
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const inFlightRef = useRef<{ profile?: boolean; sessions?: boolean; audit?: boolean; notifications?: boolean }>({});

  // ---------------------------------------------------------------------------
  // REQUIREMENT 1: Khi vào màn profile CHỈ GỌI API CHUNG (GET /profile)
  // ---------------------------------------------------------------------------
  const loadProfileData = async () => {
    if (inFlightRef.current.profile) return;
    inFlightRef.current.profile = true;
    setLoadingProfile(true);
    try {
      const data = await profileService.getProfile();
      if (data) {
        setProfile((prev) => ({
          ...prev,
          fullName: data.fullName || prev.fullName,
          email: data.email || prev.email,
          phone: data.phone || '',
          department: data.department || '',
          timezone: data.timezone || 'UTC+07:00 (Bangkok, Hanoi, Jakarta)',
          bio: data.bio || '',
          socialX: data.socialX || '',
          socialLinkedIn: data.socialLinkedIn || '',
          avatar: data.avatar || '',
          passwordUpdatedAt: data.passwordUpdatedAt || null,
        }));
        setTwoFactorEnabled(Boolean(data.twoFactorEnabled));
        if (data.notificationPreferences) {
          setNotifications((prev) => ({
            ...prev,
            ...data.notificationPreferences,
          }));
        }
      }
    } catch (err) {
      console.warn('Profile fetch error:', err);
    } finally {
      inFlightRef.current.profile = false;
      setLoadingProfile(false);
    }
  };

  // Called strictly on mount: only the general profile API
  useEffect(() => {
    loadProfileData();
  }, []);

  // ---------------------------------------------------------------------------
  // REQUIREMENT 1: Khi bấm vào tab nào, tab đó mới gọi API riêng
  // ---------------------------------------------------------------------------
  const loadSessions = async () => {
    if (inFlightRef.current.sessions) return;
    inFlightRef.current.sessions = true;
    setLoadingSessions(true);
    try {
      const list = await profileService.getSessions();
      if (Array.isArray(list)) {
        setSessions(
          list.map((s) => ({
            id: String(s.id),
            device: s.device || 'Active Workstation',
            browser: s.browser || 'Browser',
            ip: s.ipAddress || '127.0.0.1',
            location: s.location || 'Unknown Location',
            isCurrent: Boolean(s.isCurrent),
            lastActive: s.lastActive || (s.isCurrent ? 'Active now' : 'Remote Session'),
          }))
        );
      }
    } catch (err) {
      console.warn('Sessions fetch error:', err);
    } finally {
      inFlightRef.current.sessions = false;
      setLoadingSessions(false);
    }
  };

  const loadAuditLogs = async (type = auditTypeFilter, search = auditSearchQuery) => {
    setLoadingAudit(true);
    try {
      const logs = await profileService.getAuditLogs({
        type: type === 'ALL' ? undefined : type,
        search: search.trim() ? search.trim() : undefined,
      });
      if (Array.isArray(logs)) {
        setAuditLogs(
          logs.map((l) => ({
            id: `log-${l.id}`,
            event: l.resourceName ? `${l.action}: ${l.resourceName}` : l.action,
            module: l.module || 'Identity',
            ip: l.ipAddress || '127.0.0.1',
            device: l.device || 'Workstation',
            timestamp: new Date(l.createdAt).toLocaleString(),
            status:
              l.status?.toLowerCase() === 'success'
                ? ('success' as const)
                : l.status?.toLowerCase() === 'warning'
                ? ('warning' as const)
                : ('info' as const),
          }))
        );
      }
    } catch (err) {
      console.warn('Audit logs fetch error:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const loadNotifications = async () => {
    if (inFlightRef.current.notifications) return;
    inFlightRef.current.notifications = true;
    try {
      const prefs = await profileService.getNotifications();
      if (prefs) {
        setNotifications((prev) => ({ ...prev, ...prefs }));
      }
    } catch (err) {
      console.warn('Notifications fetch error:', err);
    } finally {
      inFlightRef.current.notifications = false;
    }
  };

  // Trigger specific API only upon switching to that tab
  useEffect(() => {
    if (activeSection === 'sessions') {
      loadSessions();
    } else if (activeSection === 'audit') {
      loadAuditLogs(auditTypeFilter, auditSearchQuery);
    } else if (activeSection === 'notifications') {
      loadNotifications();
    }
  }, [activeSection]);

  // Handler: Unlock 2FA Tab via master password
  const handleUnlock2Fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlocking2Fa(true);
    setUnlock2FaError('');
    try {
      if (!unlock2FaPassword.trim()) {
        setUnlock2FaError('Please enter your account password.');
        setUnlocking2Fa(false);
        return;
      }
      const res = await profileService.unlock2Fa(unlock2FaPassword);
      setIs2FaUnlocked(true);
      setBackupCodes(res.recoveryCodes || []);
      setTotpSecret(res.secretKey || '');
      setQrCodeUri(res.qrCodeUri || '');
      setTwoFactorEnabled(Boolean(res.twoFactorEnabled));
      toast.success('Two-factor authentication settings unlocked.');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Verification failed. Please try again.';
      setUnlock2FaError(msg);
      toast.error(msg);
    } finally {
      setUnlocking2Fa(false);
    }
  };

  // Handler: Unlock Password & Auth Tab via Password
  const handleUnlockPasswordSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockingAuth(true);
    setAuthUnlockError('');
    try {
      if (!authUnlockPassword.trim()) {
        setAuthUnlockError('Please enter your account password.');
        setUnlockingAuth(false);
        return;
      }
      await profileService.verifyPassword(authUnlockPassword);
      setIsPasswordUnlocked(true);
      toast.success('Password management unlocked.');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Verification failed. Please try again.';
      setAuthUnlockError(msg);
      toast.error(msg);
    } finally {
      setUnlockingAuth(false);
    }
  };

  // Save profile to PostgreSQL via Profile API
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await profileService.updateProfile({
        fullName: profile.fullName,
        phone: profile.phone,
        department: profile.department,
        timezone: profile.timezone,
        bio: profile.bio,
        socialX: profile.socialX,
        socialLinkedIn: profile.socialLinkedIn,
        avatar: profile.avatar,
      });

      if (updated) {
        setProfile((prev) => ({
          ...prev,
          fullName: updated.fullName,
          phone: updated.phone || '',
          avatar: updated.avatar || prev.avatar,
          department: updated.department || '',
          timezone: updated.timezone || prev.timezone,
          bio: updated.bio || '',
          socialX: updated.socialX || '',
          socialLinkedIn: updated.socialLinkedIn || '',
        }));
      }

      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
      toast.success('Profile details updated successfully!');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to save profile details. Please try again.';
      toast.error(msg);
    }
  };

  // Save password via Profile API
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.next.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    try {
      await profileService.changePassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.next,
        confirmPassword: passwordForm.confirm,
        invalidateOtherSessions: passwordForm.invalidateOtherSessions,
      });

      setPasswordSaved(true);
      setPasswordForm({ current: '', next: '', confirm: '', invalidateOtherSessions: true });
      setTimeout(() => setPasswordSaved(false), 2500);

      toast.success('Account password updated successfully in PostgreSQL!');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update password. Verify current password.';
      toast.error(msg);
    }
  };

  // Copy backup codes
  const handleCopyCodes = () => {
    if (backupCodes.length === 0) return;
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
    toast.info('Backup recovery codes copied to clipboard');
  };

  // Copy secret key
  const handleCopySecret = () => {
    if (!totpSecret) return;
    navigator.clipboard.writeText(totpSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
    toast.info('TOTP Secret key copied to clipboard');
  };

  // Download backup codes
  const handleDownloadCodes = () => {
    if (backupCodes.length === 0) return;
    const content = `HEYGOODLY PROCMS - 2FA BACKUP RECOVERY CODES\nAccount: ${profile.email}\nSecurity Level: Enterprise Pro\nGenerated: ${new Date().toISOString()}\n\nEach code can only be used once:\n${backupCodes.join('\n')}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heygoodly-2fa-backup-codes-${Date.now().toString().slice(-4)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup recovery codes downloaded to text file');
  };

  // Regenerate codes via PostgreSQL backend
  const handleRegenerateCodes = async () => {
    const ok = await confirm({
      title: 'Regenerate Backup Codes?',
      message: 'Regenerate a new set of 8 recovery backup codes? Previous codes will become invalid immediately.',
      confirmText: 'Regenerate Codes',
      cancelText: 'Cancel',
      variant: 'warning',
    });
    if (!ok) return;

    try {
      const newCodes = await profileService.regenerateRecoveryCodes();
      setBackupCodes(newCodes);
      setShowBackupCodes(true);
      toast.success('Generated 8 new single-use recovery backup codes in PostgreSQL.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to regenerate backup codes.');
    }
  };

  // Open 2FA setup wizard & initiate secret from backend
  const handleOpen2FaWizard = async () => {
    setWizardStep(1);
    setWizardOpen(true);
    setOtpInput('');
    setOtpError('');
    setInitiating2Fa(true);
    try {
      const data = await authService.initiate2Fa();
      if (data?.secretKey) {
        setTotpSecret(data.secretKey);
      }
      if (data?.qrCodeUri) {
        setQrCodeUri(data.qrCodeUri);
      }
      if (data?.recoveryCodes && data.recoveryCodes.length > 0) {
        setBackupCodes(data.recoveryCodes);
      }
    } catch {
      toast.error('Failed to connect to backend 2FA service.');
    } finally {
      setInitiating2Fa(false);
    }
  };

  // Verify OTP in setup wizard
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otpInput.trim();
    if (cleanOtp.length !== 6) {
      setOtpError('Please enter a valid 6-digit confirmation code.');
      toast.error('Please enter a valid 6-digit confirmation code.');
      return;
    }
    setOtpError('');
    setVerifyingOtp(true);

    try {
      const confirmedCodes = await authService.confirm2Fa(parseInt(cleanOtp, 10), totpSecret, backupCodes);
      if (confirmedCodes && confirmedCodes.length > 0) {
        setBackupCodes(confirmedCodes);
      }
      setWizardStep(3);
      setTwoFactorEnabled(true);
      setIs2FaUnlocked(true);

      try {
        const stored = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.twoFactorEnabled = true;
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(parsed));
        }
      } catch {
        // ignore
      }

      toast.success('Two-Factor Authentication (TOTP) activated successfully!');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid OTP confirmation code. Please check your authenticator.';
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Disable 2FA
  const handleDisable2Fa = async () => {
    const ok = await confirm({
      title: 'Disable Two-Factor Authentication?',
      message: 'Are you sure you want to disable Two-Factor Authentication? Your account will lose TOTP protection.',
      confirmText: 'Disable 2FA',
      cancelText: 'Keep 2FA Enabled',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await authService.disable2Fa();
      setTwoFactorEnabled(false);
      setBackupCodes([]);
      setTotpSecret('');
      setQrCodeUri('');
      setIs2FaUnlocked(false);

      try {
        const stored = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.twoFactorEnabled = false;
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(parsed));
        }
      } catch {
        // ignore
      }

      toast.warning('Two-Factor Authentication has been disabled for this account.');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to disable 2FA.';
      toast.error(msg);
    }
  };

  // ---------------------------------------------------------------------------
  // REQUIREMENT 3: Revoke từng thiết bị & Emergency Lockdown
  // ---------------------------------------------------------------------------
  const handleRevokeSession = async (id: string, isCurrentSession = false) => {
    const ok = await confirm({
      title: isCurrentSession ? 'Sign Out Current Device?' : 'Terminate Device Session?',
      message: isCurrentSession
        ? 'Sign out of your current device session? You will need to log in again.'
        : 'Terminate this device session? The remote device will be signed out immediately.',
      confirmText: isCurrentSession ? 'Sign Out Now' : 'Revoke Session',
      cancelText: 'Cancel',
      variant: 'warning',
    });
    if (!ok) return;

    try {
      const numericId = parseInt(id.replace(/\D/g, ''), 10);
      if (!isNaN(numericId)) {
        await profileService.revokeSession(numericId);
      }

      if (isCurrentSession) {
        await authService.logout();
        window.location.href = '/login?reason=session_terminated';
        return;
      }

      await loadSessions();
      toast.success('Device session revoked successfully.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to terminate session.');
    }
  };

  // Emergency lockdown: revoke all other sessions via backend API
  const handleEmergencyLockdown = async () => {
    const ok = await confirm({
      title: 'Emergency Lockdown?',
      message: 'Sign out of all other devices and terminate remote sessions immediately?',
      confirmText: 'Lock Down Now',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await profileService.revokeOtherSessions();
      await loadSessions();
      toast.success('Emergency lockdown complete. All other remote sessions terminated.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to revoke other sessions.');
    }
  };

  // Save notification settings to PostgreSQL
  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await profileService.updateNotifications(notifications);
      if (updated) {
        setNotifications((prev) => ({ ...prev, ...updated }));
      }
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 2500);
      toast.success('Notification preferences saved successfully to database!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save notification settings.');
    }
  };

  // Calculate Security Health Score
  const securityScore = twoFactorEnabled ? 100 : 65;

  // Pagination calculations for Active Devices
  const totalSessionPages = Math.max(1, Math.ceil(sessions.length / sessionPageSize));
  const pagedSessions = sessions.slice(
    (sessionPage - 1) * sessionPageSize,
    sessionPage * sessionPageSize
  );

  // Pagination calculations for Security Audit Logs
  const totalAuditPages = Math.max(1, Math.ceil(auditLogs.length / auditPageSize));
  const pagedAuditLogs = auditLogs.slice(
    (auditPage - 1) * auditPageSize,
    auditPage * auditPageSize
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-12">
      {/* =========================================================================
          1. HEADER HERO: SLEEK AMBIENT BANNER & QUICK ACTIONS
         ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
              <Link href="/admin/dashboard" className="hover:text-white transition">
                Admin Workspace
              </Link>
              <span>/</span>
              <span>Security &amp; Identity</span>
              <span>/</span>
              <span className="text-white font-bold">Administrator Command Center</span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                <User className="text-indigo-400" size={28} /> Account &amp; Security Profile
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck size={12} /> Tier-1 Clearance
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Manage cryptographic TOTP authenticators, editorial author bylines, active device audit logs, and account-wide security telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleEmergencyLockdown}
              className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-rose-950/70 hover:bg-rose-900 border border-rose-800/80 text-rose-200 rounded-xl transition shadow-xs cursor-pointer whitespace-nowrap shrink-0"
              title="Terminate all other sessions immediately"
            >
              <LogOut size={14} /> Emergency Lockdown
            </button>
            <Link
              href="/admin/dashboard"
              className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition backdrop-blur-xs whitespace-nowrap shrink-0"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. BALANCED 2-COLUMN GRID (Col 4 Left: Identity & Health; Col 8 Right: Content)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =======================================================================
            LEFT COLUMN (4 COLS): EXECUTIVE IDENTITY CARD & HEALTH METER (STICKY)
           ======================================================================= */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          <Card className="p-5 sm:p-6 bg-white border border-slate-200/90 rounded-3xl shadow-sm space-y-4.5">
            {/* Avatar with Live Indicator & Direct Upload */}
            <div className="text-center space-y-2.5">
              <div className="relative w-20 h-20 mx-auto group">
                {profile.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar}
                    alt={profile.fullName || 'Administrator'}
                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-50 border border-slate-100 shadow-md group-hover:opacity-95 transition"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center ring-4 ring-indigo-50 border border-slate-100 shadow-md">
                    {(profile.fullName || 'AD').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span
                  className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-xs"
                  title="Session Online"
                />

                <button
                  type="button"
                  onClick={() => setActiveSection('profile')}
                  className="absolute inset-0 bg-slate-900/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-0.5 cursor-pointer"
                  title="Click to edit profile photo"
                >
                  <Camera size={15} />
                  <span>Edit Photo</span>
                </button>
              </div>

              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">{profile.fullName}</h2>
                <p className="text-xs text-slate-500 font-medium">{profile.email}</p>
              </div>

              {/* Badges */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  <Shield size={11} /> {currentRole.roleName}
                </span>

                {twoFactorEnabled ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    <ShieldCheck size={11} /> 2FA Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    <AlertTriangle size={11} /> 2FA Inactive
                  </span>
                )}
              </div>
            </div>

            {/* Embedded Security Health Index Meter */}
            <div className="bg-slate-900 text-white p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-indigo-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <Sparkles size={13} className="text-amber-400" /> Security Health
                </span>
                <span className={`text-[11px] font-black ${securityScore === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {securityScore}% {securityScore === 100 ? 'Optimal' : 'Action Needed'}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    securityScore === 100 ? 'bg-emerald-400 w-full' : 'bg-amber-400 w-[65%]'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-300">
                <span>{twoFactorEnabled ? 'Argon2id + TOTP Active' : 'Argon2id Active (No 2FA)'}</span>
                <span>Root Level 5</span>
              </div>
            </div>

            {/* Quick Specs Matrix */}
            <div className="pt-1 grid grid-cols-2 gap-1.5 text-left">
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Clearance</span>
                <span className="text-xs font-black text-indigo-700">Level 5 (Root)</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Devices</span>
                <span className="text-xs font-black text-slate-800">{sessions.length > 0 ? `${sessions.length} Active` : 'Active'}</span>
              </div>
            </div>

            {/* Section Navigation Tabs */}
            <div className="space-y-1 pt-1 border-t border-slate-100">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-1 py-1">
                Command Sections
              </span>

              {[
                {
                  id: '2fa',
                  label: '2FA Authenticator',
                  icon: Smartphone,
                  badge: twoFactorEnabled ? 'Active' : 'Setup Now',
                  badgeColor: twoFactorEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
                },
                {
                  id: 'profile',
                  label: 'Personal Information',
                  icon: User,
                  badge: 'Verified',
                  badgeColor: 'bg-indigo-100 text-indigo-800',
                },
                {
                  id: 'security',
                  label: 'Password & Auth',
                  icon: Lock,
                  badge: 'Argon2id',
                  badgeColor: 'bg-slate-200 text-slate-700',
                },
                {
                  id: 'sessions',
                  label: 'Active Devices',
                  icon: Laptop,
                  badge: sessions.length > 0 ? `${sessions.length}` : 'Active',
                  badgeColor: 'bg-slate-200 text-slate-700',
                },
                {
                  id: 'audit',
                  label: 'Security Audit Log',
                  icon: History,
                  badge: 'Live',
                  badgeColor: 'bg-emerald-100 text-emerald-800',
                },
                {
                  id: 'notifications',
                  label: 'Alert Preferences',
                  icon: Bell,
                  badge: 'Email',
                  badgeColor: 'bg-slate-200 text-slate-700',
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const isCurrent = activeSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSection(tab.id as any)}
                    className={`w-full h-9 flex items-center justify-between px-3.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon size={15} className={isCurrent ? 'text-white' : 'text-slate-400'} />
                      <span>{tab.label}</span>
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-black shrink-0 ${
                        isCurrent ? 'bg-white/20 text-white' : tab.badgeColor
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* =======================================================================
            RIGHT COLUMN (8 COLS): WORKSPACE CONTENT PANELS
           ======================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* =====================================================================
              PANEL 1: TWO-FACTOR AUTHENTICATION (TOTP & MULTI-OPTION 2FA)
             ===================================================================== */}
          {activeSection === '2fa' && (
            <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-6 animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Smartphone className="text-indigo-600" size={22} /> Authenticator App (RFC 6238 TOTP)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hardware and software two-factor authentication compatible with Google Authenticator, Authy, and 1Password.
                  </p>
                </div>

                {is2FaUnlocked && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIs2FaUnlocked(false);
                        setUnlock2FaPassword('');
                      }}
                      className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
                    >
                      <Lock size={13} /> Lock 2FA
                    </button>
                    {twoFactorEnabled ? (
                      <button
                        type="button"
                        onClick={handleDisable2Fa}
                        className="h-9 px-4 inline-flex items-center justify-center gap-1.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
                      >
                        <ShieldAlert size={14} /> Disable 2FA
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleOpen2FaWizard}
                        className="h-9 px-4 inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <ShieldCheck size={15} /> Enable 2FA Now
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* SECURITY GATE: Password or 2FA challenge required to view/manage 2FA */}
              {!is2FaUnlocked ? (
                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 text-center max-w-lg mx-auto my-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mx-auto flex items-center justify-center shadow-xs">
                    <Lock size={22} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900">Password Verification Required</h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                      To view and manage Two-Factor Authentication credentials, secret keys, and backup recovery codes, please verify your account master password.
                    </p>
                  </div>

                  <form noValidate onSubmit={handleUnlock2Fa} className="space-y-3.5 pt-1 text-left">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Enter Account Password *</label>
                      <div className="relative">
                        <input
                          type={showUnlock2FaPassword ? 'text' : 'password'}
                          autoFocus
                          value={unlock2FaPassword}
                          onChange={(e) => {
                            setUnlock2FaPassword(e.target.value);
                            setUnlock2FaError('');
                          }}
                          placeholder="Enter current password"
                          className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowUnlock2FaPassword(!showUnlock2FaPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showUnlock2FaPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    {unlock2FaError && (
                      <p className="text-xs font-bold text-rose-600">{unlock2FaError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={unlocking2Fa || !unlock2FaPassword.trim()}
                      className="w-full h-10 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap"
                    >
                      {unlocking2Fa ? <Loader2 className="animate-spin" size={15} /> : <Lock size={15} />}
                      <span>Unlock 2FA Settings</span>
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  {/* Status Banner */}
                  {twoFactorEnabled ? (
                    <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4.5 flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <ShieldCheck size={22} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-black text-emerald-950">
                          Your Account is Guarded by Two-Factor Authentication
                        </h3>
                        <p className="text-xs text-emerald-800 leading-relaxed">
                          Every sign-in to HeyGoodly ProCMS requires your master password plus a rotating 6-digit numeric passcode from your authenticator app.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4.5 flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                        <AlertTriangle size={22} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-black text-amber-950">2FA Is Currently Disabled</h3>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          We strongly advise enabling 2FA for all administrative accounts to safeguard commission links, partner credentials, and merchant integrations.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* -----------------------------------------------------------------
                      REQUIREMENT 2: Thêm Option Chọn Phương Thức 2FA
                     ----------------------------------------------------------------- */}
                  <div className="space-y-3 pt-1">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers size={14} className="text-indigo-600" /> Two-Factor Authentication Methods
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Choose your primary or secondary two-factor authentication mechanism.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          id: 'totp',
                          title: 'Authenticator App',
                          sub: 'RFC 6238 TOTP',
                          desc: 'Rotating 6-digit codes generated by Google Authenticator, Authy, or 1Password.',
                          icon: Smartphone,
                          badge: 'Primary Method',
                          badgeClass: 'bg-emerald-100 text-emerald-800',
                        },
                        {
                          id: 'email',
                          title: 'Work Email OTP',
                          sub: profile.email,
                          desc: 'Single-use passcodes dispatched to your verified administrator email.',
                          icon: Mail,
                          badge: 'Backup Method',
                          badgeClass: 'bg-indigo-100 text-indigo-800',
                        },
                        {
                          id: 'hardware',
                          title: 'Hardware Security Key',
                          sub: 'FIDO2 / WebAuthn',
                          desc: 'FIDO2 / WebAuthn physical security tokens (YubiKey, Touch ID, Passkey).',
                          icon: KeyRound,
                          badge: 'Enterprise Standard',
                          badgeClass: 'bg-slate-200 text-slate-700',
                        },
                        {
                          id: 'sms',
                          title: 'SMS Verification',
                          sub: profile.phone || 'Configured Phone',
                          desc: 'Emergency cellular SMS passcode sent to registered mobile device.',
                          icon: Phone,
                          badge: 'Emergency',
                          badgeClass: 'bg-slate-200 text-slate-700',
                        },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = selectedTwoFaMethod === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedTwoFaMethod(item.id as any)}
                            className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                                : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                    isSelected
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  <Icon size={18} />
                                </div>
                                <div>
                                  <h5 className="text-xs font-black text-slate-900">{item.title}</h5>
                                  <span className="text-[10px] text-slate-500 font-medium font-mono">{item.sub}</span>
                                </div>
                              </div>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${item.badgeClass}`}>
                                {item.badge}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Option Detail 1: TOTP Authenticator */}
                  {selectedTwoFaMethod === 'totp' && (
                    <div className="space-y-4 pt-2">
                      {/* Single-Use Emergency Recovery Backup Codes */}
                      {twoFactorEnabled && (
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-3.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                <KeyRound size={14} className="text-indigo-600" /> Emergency Backup Recovery Codes ({backupCodes.length})
                              </h4>
                              <p className="text-xs text-slate-500">
                                Keep these single-use codes in a safe place. They allow emergency access if you lose your mobile phone.
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setShowBackupCodes(!showBackupCodes)}
                                className="h-9 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                              >
                                {showBackupCodes ? <EyeOff size={13} /> : <Eye size={13} />}
                                <span>{showBackupCodes ? 'Hide' : 'Reveal'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleCopyCodes}
                                className="h-9 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                              >
                                {copiedCodes ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                                <span>{copiedCodes ? 'Copied' : 'Copy All'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleDownloadCodes}
                                className="h-9 px-3.5 text-xs font-bold inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
                              >
                                <Download size={13} />
                                <span>Download .txt</span>
                              </button>
                            </div>
                          </div>

                          {/* Codes Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {backupCodes.map((code, idx) => (
                              <div
                                key={idx}
                                className="bg-white border border-slate-200/90 rounded-xl p-3 text-center font-mono text-xs font-bold tracking-wider text-slate-800 shadow-2xs hover:border-indigo-300 transition"
                              >
                                {showBackupCodes ? code : '••••-••••'}
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                            <span>Each code becomes invalid immediately after one use.</span>
                            <button
                              type="button"
                              onClick={handleRegenerateCodes}
                              className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw size={12} /> Regenerate 8 New Codes
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Option Detail 2: Email OTP */}
                  {selectedTwoFaMethod === 'email' && (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                            <Mail size={20} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">Registered Verification Email</h4>
                            <p className="text-xs font-mono font-semibold text-slate-600">{profile.email}</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 size={12} /> Verified Email
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        When enabled, sign-ins will require a 6-digit confirmation code delivered directly to your inbox with 10-minute expiry window.
                      </p>
                      <button
                        type="button"
                        onClick={() => toast.success(`Verification test code dispatched to ${profile.email}`)}
                        className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer shadow-2xs"
                      >
                        <Sparkles size={13} /> Send Verification Email
                      </button>
                    </div>
                  )}

                  {/* Option Detail 3: Hardware Key */}
                  {selectedTwoFaMethod === 'hardware' && (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center">
                            <KeyRound size={20} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">FIDO2 / WebAuthn Keys Configured</h4>
                            <p className="text-xs text-slate-500">No hardware keys enrolled yet</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toast.info('Browser WebAuthn prompt initialized. Connect YubiKey or touch Touch ID.')}
                          className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition cursor-pointer shadow-xs"
                        >
                          <KeyRound size={13} /> Connect YubiKey or Touch ID
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Option Detail 4: SMS */}
                  {selectedTwoFaMethod === 'sms' && (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                            <Phone size={20} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">Cellular Phone Verification</h4>
                            <p className="text-xs font-mono font-semibold text-slate-600">{profile.phone || '+1 (800) 555-0199'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          )}

          {/* =====================================================================
              PANEL 2: PERSONAL INFORMATION & EDITORIAL BYLINE
             ===================================================================== */}
          {activeSection === 'profile' && (
            <form noValidate onSubmit={handleSaveProfile} className="animate-in fade-in duration-150">
              <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <User className="text-indigo-600" size={22} /> Personal Information &amp; Editorial Bio
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your identity and credentials displayed across product review bylines and audit records.
                    </p>
                  </div>

                  {profileSaved && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                      <CheckCircle2 size={14} /> Profile Saved
                    </span>
                  )}
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Official Work Email *</label>
                    <input
                      type="email"
                      disabled
                      value={profile.email}
                      className="w-full text-xs bg-slate-100 text-slate-500 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Contact Phone Number</label>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Department / Role Title</label>
                    <input
                      type="text"
                      value={profile.department}
                      onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Preferred Timezone</label>
                  <select
                    value={profile.timezone}
                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="UTC+07:00 (Bangkok, Hanoi, Jakarta)">UTC+07:00 (Bangkok, Hanoi, Jakarta)</option>
                    <option value="UTC+00:00 (London, GMT)">UTC+00:00 (London, GMT)</option>
                    <option value="UTC-05:00 (New York, Eastern Time)">UTC-05:00 (New York, Eastern Time)</option>
                    <option value="UTC-08:00 (San Francisco, Pacific Time)">UTC-08:00 (San Francisco, Pacific Time)</option>
                  </select>
                </div>

                {/* Editorial Bio */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Author Bio &amp; Reviewer Profile</label>
                  <textarea
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400">
                    This bio is appended to your hands-on product reviews and shopping guides.
                  </p>
                </div>

                {/* Social Channels */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Twitter / X Handle or URL</label>
                    <input
                      type="text"
                      value={profile.socialX}
                      onChange={(e) => setProfile({ ...profile, socialX: e.target.value })}
                      placeholder="https://x.com/username"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">LinkedIn Profile URL</label>
                    <input
                      type="text"
                      value={profile.socialLinkedIn}
                      onChange={(e) => setProfile({ ...profile, socialLinkedIn: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Avatar Image Upload Integration */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <ImageUpload
                    value={profile.avatar}
                    onChange={(url) => setProfile({ ...profile, avatar: url })}
                    folder="staff"
                    label="Avatar Photo (Media Library or Direct Upload)"
                    aspectRatio="square"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="h-9 px-5 inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Save size={14} /> Save Profile Changes
                  </button>
                </div>
              </Card>
            </form>
          )}

          {/* =====================================================================
              PANEL 3: PASSWORD & CREDENTIAL MANAGEMENT (ARGON2ID)
             ===================================================================== */}
          {activeSection === 'security' && (
            <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Lock className="text-indigo-600" size={22} /> Password &amp; Authentication Security
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update your administrative account password and review cryptographic hashing standards.
                  </p>
                </div>

                {isPasswordUnlocked && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPasswordUnlocked(false);
                      setAuthUnlockPassword('');
                    }}
                    className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
                  >
                    <Lock size={13} /> Lock Credentials
                  </button>
                )}
              </div>

              {/* SECURITY GATE: Password or 2FA Challenge */}
              {!isPasswordUnlocked ? (
                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 text-center max-w-lg mx-auto my-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mx-auto flex items-center justify-center shadow-xs">
                    <Lock size={22} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900">Security Verification Required</h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                      To update your master password or manage sensitive authentication mechanisms, please authenticate with your master password or 2FA passcode.
                    </p>
                  </div>

                  <form noValidate onSubmit={handleUnlockPasswordSection} className="space-y-3.5 pt-1 text-left">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Enter Account Password *</label>
                      <div className="relative">
                        <input
                          type={showAuthUnlockPassword ? 'text' : 'password'}
                          autoFocus
                          value={authUnlockPassword}
                          onChange={(e) => {
                            setAuthUnlockPassword(e.target.value);
                            setAuthUnlockError('');
                          }}
                          placeholder="Enter current password"
                          className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAuthUnlockPassword(!showAuthUnlockPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showAuthUnlockPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    {authUnlockError && (
                      <p className="text-xs font-bold text-rose-600">{authUnlockError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={unlockingAuth || !authUnlockPassword.trim()}
                      className="w-full h-10 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap"
                    >
                      {unlockingAuth ? <Loader2 className="animate-spin" size={15} /> : <Lock size={15} />}
                      <span>Verify &amp; Unlock</span>
                    </button>
                  </form>
                </div>
              ) : (
                <form noValidate onSubmit={handleSavePassword} className="space-y-6">
                  {passwordSaved && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center gap-2 text-xs font-bold">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>Password Updated: Master password updated successfully in PostgreSQL!</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Current Password */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Current Password *</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordForm.current}
                          onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                          placeholder="Enter current password"
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">New Strong Password *</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.next}
                          onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                          placeholder="At least 8 characters"
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>

                      {/* Real-Time Password Strength Meter */}
                      {passwordForm.next && (
                        <div className="space-y-2 pt-1.5">
                          <div className="flex items-center gap-2 text-[11px]">
                            <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  passwordForm.next.length >= 12
                                    ? 'bg-emerald-500 w-full'
                                    : passwordForm.next.length >= 8
                                    ? 'bg-amber-500 w-2/3'
                                    : 'bg-rose-500 w-1/3'
                                }`}
                              />
                            </div>
                            <span className="font-bold text-slate-600">
                              {passwordForm.next.length >= 12
                                ? 'Strong Password'
                                : passwordForm.next.length >= 8
                                ? 'Moderate Strength'
                                : 'Weak'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-500">
                            <span className={`flex items-center gap-1 ${passwordForm.next.length >= 8 ? 'text-emerald-600 font-bold' : ''}`}>
                              <CheckCircle2 size={11} /> 8+ Characters
                            </span>
                            <span className={`flex items-center gap-1 ${/[A-Z]/.test(passwordForm.next) ? 'text-emerald-600 font-bold' : ''}`}>
                              <CheckCircle2 size={11} /> Uppercase Letter
                            </span>
                            <span className={`flex items-center gap-1 ${/[0-9]/.test(passwordForm.next) ? 'text-emerald-600 font-bold' : ''}`}>
                              <CheckCircle2 size={11} /> Number (0-9)
                            </span>
                            <span className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(passwordForm.next) ? 'text-emerald-600 font-bold' : ''}`}>
                              <CheckCircle2 size={11} /> Special Symbol
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Confirm New Password *</label>
                      <input
                        type="password"
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                        placeholder="Re-type new password"
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                      {passwordForm.confirm && passwordForm.next !== passwordForm.confirm && (
                        <p className="text-[11px] font-bold text-rose-600">Passwords do not match.</p>
                      )}
                    </div>

                    {/* Invalidate sessions checkbox */}
                    <label className="flex items-center gap-2 pt-2 cursor-pointer text-xs text-slate-600 font-medium select-none">
                      <input
                        type="checkbox"
                        checked={passwordForm.invalidateOtherSessions}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            invalidateOtherSessions: e.target.checked,
                          })
                        }
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Sign out of all other devices and terminate remote sessions</span>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400">
                      {profile.passwordUpdatedAt && (
                        <span>Password Last Changed: {new Date(profile.passwordUpdatedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="h-9 px-5 inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Lock size={14} /> Update Master Password
                    </button>
                  </div>

                  {/* Argon2id Security Overview */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1.5 text-xs">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-indigo-600" /> Cryptographic Hashing Architecture
                    </h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      HeyGoodly ProCMS utilizes the Argon2id memory-hard password hashing algorithm with unique salt per record, protecting against GPU and ASIC cracking attempts.
                    </p>
                  </div>
                </form>
              )}
            </Card>
          )}

          {/* =====================================================================
              PANEL 4: AUTHORIZED DEVICE SESSIONS (DEDUPLICATED & REVOKE ACTIONABLE)
             ===================================================================== */}
          {activeSection === 'sessions' && (
            <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Laptop className="text-indigo-600" size={22} /> Authorized Device Sessions ({sessions.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hardware devices and geographic locations currently holding authenticated ProCMS tokens.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleEmergencyLockdown}
                  className="h-9 px-4 inline-flex items-center justify-center text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0"
                >
                  Revoke All Other Sessions
                </button>
              </div>

              {loadingSessions ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2.5">
                  <Loader2 className="animate-spin text-indigo-600" size={24} />
                  <span className="text-xs font-semibold text-slate-500">Loading authorized device sessions...</span>
                </div>
              ) : sessions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No authorized device sessions found.
                </div>
              ) : (
                <div className="space-y-3">
                  {pagedSessions.map((sess) => (
                    <div
                      key={sess.id}
                      className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        sess.isCurrent
                          ? 'border-emerald-200/90 bg-emerald-50/30'
                          : 'border-slate-200/80 bg-slate-50/50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-2xl border flex items-center justify-center shadow-2xs shrink-0 mt-0.5 ${
                            sess.isCurrent
                              ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <Laptop size={18} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-slate-900">{sess.device}</h4>
                            {sess.isCurrent ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                <Check size={11} /> Current Device
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                                Remote Session
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {sess.browser} • {sess.location} • <span className="font-mono text-[10px] text-slate-400">IP: {sess.ip}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                        <span className="text-xs text-slate-400 font-medium">{sess.lastActive}</span>
                        {!sess.isCurrent ? (
                          <button
                            type="button"
                            onClick={() => handleRevokeSession(sess.id, false)}
                            className="h-8 px-3.5 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
                            title="Revoke and sign out this remote device session"
                          >
                            <Trash2 size={12} />
                            <span>Revoke</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRevokeSession(sess.id, true)}
                            className="h-8 px-3.5 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0"
                            title="Sign out of current active session"
                          >
                            <LogOut size={12} />
                            <span>Sign Out</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Sessions Pagination Bar */}
                  <PaginationBar
                    currentPage={sessionPage}
                    totalPages={totalSessionPages}
                    totalItems={sessions.length}
                    pageSize={sessionPageSize}
                    itemLabel="device sessions"
                    onPageChange={(p) => setSessionPage(p)}
                    onPageSizeChange={(s) => {
                      setSessionPageSize(s);
                      setSessionPage(1);
                    }}
                    pageSizeOptions={[5, 10, 20]}
                  />
                </div>
              )}
            </Card>
          )}

          {/* =====================================================================
              PANEL 5: SECURITY AUDIT & ACTIVITY TRAIL (FILTER BY TYPE VIA 1 API)
             ===================================================================== */}
          {activeSection === 'audit' && (
            <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <History className="text-indigo-600" size={22} /> Security Audit &amp; Activity Log
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Immutable chronological record of authentication attempts, credential changes, and clearance events.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400">Retention: 90 Days</span>
                </div>
              </div>

              {/* -----------------------------------------------------------------
                  REQUIREMENT 4: Tìm kiếm theo loại audit log (qua 1 API duy nhất)
                 ----------------------------------------------------------------- */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={auditSearchQuery}
                    onChange={(e) => {
                      const q = e.target.value;
                      setAuditSearchQuery(q);
                      setAuditPage(1);
                      loadAuditLogs(auditTypeFilter, q);
                    }}
                    placeholder="Search audit records..."
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {/* Event Type Filter Dropdown */}
                <div className="flex items-center gap-2 shrink-0">
                  <Filter size={14} className="text-slate-400 hidden sm:block" />
                  <select
                    value={auditTypeFilter}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setAuditTypeFilter(selected);
                      setAuditPage(1);
                      loadAuditLogs(selected, auditSearchQuery);
                    }}
                    className="h-8 text-xs bg-white border border-slate-200 rounded-xl px-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="ALL">All Event Types</option>
                    <option value="LOGIN">Sign-Ins &amp; Authentication</option>
                    <option value="2FA">2FA &amp; Recovery Codes</option>
                    <option value="PASSWORD">Password Modifications</option>
                    <option value="PROFILE">Profile &amp; Details Updates</option>
                    <option value="RBAC">Roles &amp; Permissions</option>
                  </select>
                </div>
              </div>

              {loadingAudit ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2.5">
                  <Loader2 className="animate-spin text-indigo-600" size={24} />
                  <span className="text-xs font-semibold text-slate-500">Loading security audit records...</span>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No security audit logs recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="divide-y divide-slate-100">
                    {pagedAuditLogs.map((log) => (
                      <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                log.status === 'success'
                                  ? 'bg-emerald-500'
                                  : log.status === 'warning'
                                  ? 'bg-amber-500'
                                  : 'bg-indigo-500'
                              }`}
                            />
                            <h4 className="text-xs font-bold text-slate-900">{log.event}</h4>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {log.module}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {log.device} • IP: {log.ip}
                          </p>
                        </div>

                        <div className="text-xs text-slate-400 font-medium shrink-0">
                          {log.timestamp}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Audit Logs Pagination Bar */}
                  <PaginationBar
                    currentPage={auditPage}
                    totalPages={totalAuditPages}
                    totalItems={auditLogs.length}
                    pageSize={auditPageSize}
                    itemLabel="audit records"
                    onPageChange={(p) => setAuditPage(p)}
                    onPageSizeChange={(s) => {
                      setAuditPageSize(s);
                      setAuditPage(1);
                    }}
                    pageSizeOptions={[6, 10, 20]}
                  />
                </div>
              )}
            </Card>
          )}

          {/* =====================================================================
              PANEL 6: SYSTEM ALERTS & NOTIFICATIONS PREFERENCES
             ===================================================================== */}
          {activeSection === 'notifications' && (
            <form noValidate onSubmit={handleSaveNotifications} className="animate-in fade-in duration-150">
              <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <Bell className="text-indigo-600" size={22} /> System Alerts &amp; Notifications
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Choose which critical security and affiliate telemetry triggers dispatch an instant alert.
                    </p>
                  </div>

                  {notifSaved && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                      <CheckCircle2 size={14} /> Preferences Saved
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {[
                    {
                      id: 'securityLogins',
                      title: 'New Device Sign-In Alerts',
                      desc: 'Receive immediate email notifications whenever a sign-in occurs from an unrecognized IP or browser.',
                    },
                    {
                      id: 'twoFaChanges',
                      title: '2FA & Credential Modification Warnings',
                      desc: 'High-priority alert if 2FA status, master password, or recovery codes are regenerated.',
                    },
                    {
                      id: 'commissionSpikes',
                      title: 'Affiliate Click Surge / Commission Alert',
                      desc: 'Get notified when an offer experiences high volume traffic or reaches commission payout thresholds.',
                    },
                    {
                      id: 'couponExpirations',
                      title: 'Expiring Coupon & Dead Offer Warnings',
                      desc: 'Daily digest of merchant coupon codes that will expire within the next 48 hours.',
                    },
                    {
                      id: 'customerFeedback',
                      title: 'Customer Feedback & Partnership Leads',
                      desc: 'Instant alert when a reader submits feedback or a merchant requests affiliate partnership.',
                    },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition select-none"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-black text-slate-900 block">{item.title}</span>
                        <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={(notifications as any)[item.id] || false}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            [item.id]: e.target.checked,
                          })
                        }
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 mt-1"
                      />
                    </label>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="h-9 px-5 inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Save size={14} /> Save Notification Rules
                  </button>
                </div>
              </Card>
            </form>
          )}
        </div>
      </div>

      {/* =========================================================================
          3. 2FA SETUP INTERACTIVE WIZARD MODAL
         ========================================================================= */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Set Up Two-Factor Authentication</h3>
                  <p className="text-xs text-slate-400 font-medium">RFC 6238 TOTP Standard</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setWizardOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Scan QR or Secret Key */}
            {wizardStep === 1 && (
              <div className="space-y-4 text-center">
                <p className="text-xs text-slate-600 leading-relaxed text-left">
                  1. Open Google Authenticator, Microsoft Authenticator, or Authy on your mobile phone.
                  <br />
                  2. Scan this QR Code or manually type the Secret Key below:
                </p>

                <div className="w-48 h-48 mx-auto bg-white p-2 rounded-2xl shadow-md border-2 border-slate-200 flex items-center justify-center overflow-hidden">
                  {initiating2Fa ? (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] font-bold">Generating Secret...</span>
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        qrCodeUri || `otpauth://totp/HeyGoodly:${profile.email}?secret=${totpSecret}&issuer=HeyGoodly`
                      )}`}
                      alt="Authenticator QR Code"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manual Secret Key</span>
                  <div className="flex items-center justify-between">
                    <code className="text-xs font-mono font-bold text-indigo-700 tracking-widest">{totpSecret}</code>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSecret ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      {copiedSecret ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  Next: Verify Passcode <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* Step 2: Enter Verification Code */}
            {wizardStep === 2 && (
              <form noValidate onSubmit={handleVerifyOtp} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter the 6-digit confirmation code generated by your authenticator app:
                </p>

                <div className="space-y-1.5">
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center text-2xl font-mono font-black tracking-widest bg-slate-50 border border-slate-200 rounded-2xl py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  {otpError && (
                    <p className="text-xs font-bold text-rose-600 text-center">{otpError}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    disabled={verifyingOtp}
                    className="flex-1 h-10 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={verifyingOtp || otpInput.trim().length !== 6}
                    className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    {verifyingOtp ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm &amp; Activate 2FA</span>
                        <Check size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Success Confirmation */}
            {wizardStep === 3 && (
              <div className="space-y-4 text-center py-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={36} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-900">2FA Protection Activated!</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Your administrator account is now guarded by multi-factor authentication. Store your emergency recovery backup codes in a safe place.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setWizardOpen(false);
                    setWizardStep(1);
                  }}
                  className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  Done &amp; Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
