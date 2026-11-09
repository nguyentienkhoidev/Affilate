'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  KeyRound,
  RotateCcw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  ShieldOff,
  Mail,
  Phone,
  Briefcase,
  Globe,
  Clock,
  Calendar,
  History,
  Monitor,
  MapPin,
  PlusCircle,
  Trash2,
  Edit2,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import AdminFormPage, {
  FormLoading,
  FormNotFound,
  FormSection,
  inputClass,
  labelClass,
} from '@/components/admin/AdminFormPage';
import ImageUpload from '@/components/admin/ImageUpload';
import Pagination from '@/components/admin/Pagination';
import { Badge } from '@/components/ui/Badge';
import { ROUTES } from '@/constants/routes';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { apiClient } from '@/lib/api/axios-client';
import { useToast } from '@/context/ToastContext';
import {
  DEFAULT_USER_PASSWORD,
  formatLoginTime,
  resolveUserWithDefaults,
  type UserData,
  type UserLoginRecord,
} from '../_lib/data';

interface UserFormState {
  fullName: string;
  email: string;
  password: string;
  role: string;
  roleId?: number;
  isActive: boolean;
  twoFactorEnabled: boolean;
  avatar: string;
  phone: string;
  department: string;
  timezone: string;
  bio: string;
  socialX: string;
  socialLinkedIn: string;
  mustChangePassword: boolean;
}

interface RoleOption {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

const TIMEZONE_OPTIONS = [
  'America/New_York (EST / UTC-5)',
  'America/Chicago (CST / UTC-6)',
  'America/Los_Angeles (PST / UTC-8)',
  'Europe/London (GMT / UTC+0)',
  'Europe/Berlin (CET / UTC+1)',
  'Asia/Ho_Chi_Minh (ICT / UTC+7)',
  'Asia/Singapore (SGT / UTC+8)',
  'Asia/Tokyo (JST / UTC+9)',
];

const FORM_ID = 'user-form';

function generateRandomPassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
  let result = 'Hg!';
  for (let i = 0; i < length - 3; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function UserForm({ id }: { id?: string }) {
  const isEdit = id !== undefined;
  const [userData, setUserData] = useState<UserData | null>(null);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Load available roles dynamically from backend
    apiClient
      .get(API_ENDPOINTS.ADMIN.ROLES)
      .then((res) => {
        if (!mounted) return;
        const data = res.data?.data;
        if (Array.isArray(data)) {
          setRoles(data);
        }
      })
      .catch((err) => console.error('Failed to load roles:', err));

    if (!isEdit || !id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    apiClient
      .get(`${API_ENDPOINTS.ADMIN.USERS}/${id}`)
      .then((res) => {
        if (!mounted) return;
        const data = res.data?.data;
        if (data && (data.id || data.email)) {
          const mapped: UserData = {
            id: Number(data.id),
            fullName: data.fullName || '',
            email: data.email || '',
            role: data.roleName || (Array.isArray(data.roles) && data.roles[0]?.name) || 'Administrator',
            roleId: data.roleId,
            roleName: data.roleName,
            roleSlug: data.roleSlug,
            isSuperAdmin: Boolean(
              data.isSuperAdmin ||
                (Array.isArray(data.roles) &&
                  data.roles.some((r: any) => r.name === 'ROLE_SUPER_ADMIN' || r.code === 'ROLE_SUPER_ADMIN'))
            ),
            isActive: data.isActive !== false,
            twoFactorEnabled: Boolean(data.twoFactorEnabled),
            createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Today',
            avatar: data.avatar || data.avatarUrl || '',
            phone: data.phone || data.phoneNumber || '',
            department: data.department || '',
            timezone: data.timezone || TIMEZONE_OPTIONS[0],
            bio: data.bio || '',
            socialX: data.socialX || '',
            socialLinkedIn: data.socialLinkedIn || '',
            mustChangePassword: false,
            lastLoginAt: data.lastLoginAt,
            lastLoginIp: data.lastLoginIp,
            loginCount: data.loginCount ?? 0,
            passwordUpdatedAt: data.passwordUpdatedAt,
          };
          setUserData(mapped);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Failed to load user from backend:', err);
        setNotFound(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  if (isEdit && loading) return <FormLoading />;
  if (isEdit && (notFound || !userData)) return <FormNotFound backHref={ROUTES.ADMIN.USERS} entity="User" />;

  const existing: UserData | undefined = userData ? resolveUserWithDefaults(userData) : undefined;

  const initial: UserFormState = existing
    ? {
        fullName: existing.fullName,
        email: existing.email,
        password: '',
        role: existing.role,
        roleId: existing.roleId,
        isActive: existing.isActive,
        twoFactorEnabled: existing.twoFactorEnabled,
        avatar: existing.avatar || '',
        phone: existing.phone || '',
        department: existing.department || '',
        timezone: existing.timezone || TIMEZONE_OPTIONS[0],
        bio: existing.bio || '',
        socialX: existing.socialX || '',
        socialLinkedIn: existing.socialLinkedIn || '',
        mustChangePassword: existing.mustChangePassword ?? false,
      }
    : {
        fullName: '',
        email: '',
        password: DEFAULT_USER_PASSWORD,
        role: roles[0]?.name || 'Administrator',
        roleId: roles[0]?.id,
        isActive: true,
        twoFactorEnabled: false,
        avatar: '',
        phone: '',
        department: 'Editorial & Product Testing',
        timezone: TIMEZONE_OPTIONS[0],
        bio: '',
        socialX: '',
        socialLinkedIn: '',
        mustChangePassword: true,
      };

  return <UserFormInner key={id ?? 'new'} existing={existing} initial={initial} roles={roles} />;
}

function UserFormInner({
  existing,
  initial,
  roles,
}: {
  existing?: UserData;
  initial: UserFormState;
  roles: RoleOption[];
}) {
  const router = useRouter();
  const { toast, confirm } = useToast();
  const [form, setForm] = useState<UserFormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password Reset Mode ('default' | 'custom')
  const [passwordMode, setPasswordMode] = useState<'default' | 'custom'>('default');
  const [customPassword, setCustomPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [lastPasswordResetBanner, setLastPasswordResetBanner] = useState<string | null>(null);

  // Login History from Backend
  const [loginHistory, setLoginHistory] = useState<UserLoginRecord[]>([]);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginCount, setLoginCount] = useState<number>(existing?.loginCount ?? 0);
  const [lastLoginAt, setLastLoginAt] = useState<string>(existing?.lastLoginAt ?? 'Never signed in');
  const [lastLoginIp, setLastLoginIp] = useState<string>(existing?.lastLoginIp ?? '—');
  const [tracePage, setTracePage] = useState<number>(1);
  const [tracePageSize, setTracePageSize] = useState<number>(5);

  // Add login form state
  const [isAddingLogin, setIsAddingLogin] = useState(false);
  const [newLoginIp, setNewLoginIp] = useState('127.0.0.1');
  const [newLoginLocation, setNewLoginLocation] = useState('Ho Chi Minh City, VN');
  const [newLoginDevice, setNewLoginDevice] = useState('Desktop Chrome / macOS');
  const [newLoginAuthMethod, setNewLoginAuthMethod] = useState(form.twoFactorEnabled ? '2FA (TOTP)' : 'Password');
  const [newLoginStatus, setNewLoginStatus] = useState('Success');

  // Edit login form state
  const [editingLoginId, setEditingLoginId] = useState<number | string | null>(null);
  const [editLoginIp, setEditLoginIp] = useState('');
  const [editLoginLocation, setEditLoginLocation] = useState('');
  const [editLoginDevice, setEditLoginDevice] = useState('');
  const [editLoginAuthMethod, setEditLoginAuthMethod] = useState('');
  const [editLoginStatus, setEditLoginStatus] = useState('');

  const fetchLogins = useCallback(async () => {
    if (!existing?.id) return;
    setLoginLoading(true);
    try {
      const res = await apiClient.get(`${API_ENDPOINTS.ADMIN.USERS}/${existing.id}/logins`);
      const data = res.data?.data;
      if (Array.isArray(data)) {
        const records: UserLoginRecord[] = data.map((item: any) => ({
          id: item.id,
          userId: item.userId,
          timestamp: formatLoginTime(item.createdAt),
          createdAt: item.createdAt,
          ipAddress: item.ipAddress || '127.0.0.1',
          location: item.location || 'Local Network',
          device: item.device || 'Desktop Chrome / macOS',
          authMethod: item.authMethod || 'Password',
          status: item.status || 'Success',
          duration: item.duration || 'Active now',
        }));
        setLoginHistory(records);
        setLoginCount(records.length);
        if (records.length > 0) {
          setLastLoginAt(records[0].timestamp || 'Just now');
          setLastLoginIp(`${records[0].ipAddress} (${records[0].location})`);
        } else {
          setLastLoginAt('Never signed in');
          setLastLoginIp('—');
        }
      }
    } catch (err) {
      console.error('Failed to load user logins:', err);
    } finally {
      setLoginLoading(false);
    }
  }, [existing?.id]);

  useEffect(() => {
    if (existing?.id) {
      fetchLogins();
    }
  }, [existing?.id, fetchLogins]);

  const totalTracePages = Math.max(1, Math.ceil(loginHistory.length / tracePageSize));
  const safeTracePage = Math.min(Math.max(1, tracePage), totalTracePages);
  const pagedLoginHistory = loginHistory.slice(
    (safeTracePage - 1) * tracePageSize,
    safeTracePage * tracePageSize
  );

  const handleCreateLoginRecord = async () => {
    if (!existing?.id) return;
    try {
      await apiClient.post(`${API_ENDPOINTS.ADMIN.USERS}/${existing.id}/logins`, {
        ipAddress: newLoginIp.trim(),
        location: newLoginLocation.trim(),
        device: newLoginDevice.trim(),
        authMethod: newLoginAuthMethod,
        status: newLoginStatus,
      });
      toast.success(`Recorded login timestamp for "${form.fullName}".`);
      setIsAddingLogin(false);
      await fetchLogins();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to record login.';
      toast.error(msg);
    }
  };

  const handleStartEditLogin = (record: UserLoginRecord) => {
    setEditingLoginId(record.id);
    setEditLoginIp(record.ipAddress);
    setEditLoginLocation(record.location);
    setEditLoginDevice(record.device);
    setEditLoginAuthMethod(record.authMethod);
    setEditLoginStatus(record.status);
  };

  const handleSaveEditLogin = async (recordId: number | string) => {
    if (!existing?.id) return;
    try {
      await apiClient.put(`${API_ENDPOINTS.ADMIN.USERS}/${existing.id}/logins/${recordId}`, {
        ipAddress: editLoginIp.trim(),
        location: editLoginLocation.trim(),
        device: editLoginDevice.trim(),
        authMethod: editLoginAuthMethod,
        status: editLoginStatus,
      });
      toast.success('Login record updated.');
      setEditingLoginId(null);
      await fetchLogins();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update record.';
      toast.error(msg);
    }
  };

  const handleDeleteLoginRecord = async (recordId: number | string) => {
    if (!existing?.id) return;
    const ok = await confirm({
      title: 'Delete Login Record?',
      message: 'Are you sure you want to delete this login record from the database?',
      confirmText: 'Delete Record',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN.USERS}/${existing.id}/logins/${recordId}`);
      toast.success('Login record removed.');
      await fetchLogins();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete record.';
      toast.error(msg);
    }
  };

  const handleClearAllLogins = async () => {
    if (!existing?.id) return;
    const ok = await confirm({
      title: 'Clear All Login History?',
      message: `Are you sure you want to delete all login records for "${form.fullName}"? This action is permanent.`,
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN.USERS}/${existing.id}/logins`);
      toast.success(`Cleared all login records for "${form.fullName}".`);
      await fetchLogins();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to clear login history.';
      toast.error(msg);
    }
  };

  const handleCopy = (value: string, key: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    toast.info('Password copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleResetToDefaultPassword = async () => {
    if (!existing) {
      setForm({ ...form, password: DEFAULT_USER_PASSWORD, mustChangePassword: true });
      toast.success(`Initial password set to default (${DEFAULT_USER_PASSWORD})`);
      return;
    }

    const ok = await confirm({
      title: 'Reset to Default Password?',
      message: `Reset password for "${existing.fullName}" (${existing.email}) back to the system default password (${DEFAULT_USER_PASSWORD})?`,
      confirmText: 'Reset to Default',
      cancelText: 'Cancel',
      variant: 'warning',
    });
    if (!ok) return;

    try {
      await apiClient.put(`${API_ENDPOINTS.ADMIN.USERS}/${existing.id}`, {
        fullName: existing.fullName,
        email: existing.email,
        password: DEFAULT_USER_PASSWORD,
        roleName: form.role,
        roleId: form.roleId,
        isActive: form.isActive,
      });
      setForm((prev) => ({ ...prev, mustChangePassword: true }));
      setLastPasswordResetBanner(`Password reset to default: ${DEFAULT_USER_PASSWORD}`);
      toast.success(`Password for "${existing.fullName}" has been reset to default (${DEFAULT_USER_PASSWORD}).`);
    } catch {
      toast.error('Failed to reset password.');
    }
  };

  const handleApplyCustomPassword = async () => {
    const trimmed = customPassword.trim();
    if (trimmed.length < 6) {
      toast.error('Custom password must be at least 6 characters long.');
      return;
    }

    if (!existing) {
      setForm({ ...form, password: trimmed });
      toast.success('Custom initial password applied to form.');
      return;
    }

    const ok = await confirm({
      title: 'Set Custom Password?',
      message: `Update password for "${existing.fullName}" (${existing.email}) to your custom password?`,
      confirmText: 'Apply Custom Password',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await apiClient.put(`${API_ENDPOINTS.ADMIN.USERS}/${existing.id}`, {
        fullName: existing.fullName,
        email: existing.email,
        password: trimmed,
        roleName: form.role,
        roleId: form.roleId,
        isActive: form.isActive,
      });
      setLastPasswordResetBanner(`Custom password applied: ${trimmed}`);
      toast.success(`Custom password updated for "${existing.fullName}".`);
    } catch {
      toast.error('Failed to update password.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Resolve matching roleId if available
    const matchedRole = roles.find((r) => r.name.toLowerCase() === form.role.toLowerCase() || r.slug === form.role.toLowerCase());
    const roleId = matchedRole ? matchedRole.id : form.roleId;

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      roleId: roleId,
      roleName: form.role,
      isActive: form.isActive,
      phone: form.phone.trim(),
      phoneNumber: form.phone.trim(),
      avatar: form.avatar,
      avatarUrl: form.avatar,
      department: form.department.trim(),
      timezone: form.timezone,
      bio: form.bio.trim(),
      socialX: form.socialX.trim(),
      socialLinkedIn: form.socialLinkedIn.trim(),
    };

    try {
      if (existing) {
        const res = await apiClient.put(`${API_ENDPOINTS.ADMIN.USERS}/${existing.id}`, payload);
        toast.success(res.data?.message || `Saved profile & account settings for "${form.fullName}".`);
      } else {
        const res = await apiClient.post(API_ENDPOINTS.ADMIN.USERS, {
          ...payload,
          password: form.password || DEFAULT_USER_PASSWORD,
        });
        toast.success(res.data?.message || `Created staff account "${form.fullName}".`);
      }
      router.push(ROUTES.ADMIN.USERS);
    } catch (err: any) {
      if (err?.response?.data?.errors && typeof err.response.data.errors === 'object') {
        setErrors(err.response.data.errors);
      }
      const msg = err?.response?.data?.message || err?.message || 'Failed to save staff account.';
      toast.error(msg);
    }
  };

  return (
    <AdminFormPage
      title={existing ? `Edit Staff Profile & Account: ${existing.fullName}` : 'Create Staff User'}
      description="View and edit complete staff profile details, contact information, RBAC role privileges, 2FA security, and default or custom password resets."
      backHref={ROUTES.ADMIN.USERS}
      backLabel="Back to staff accounts"
      formId={FORM_ID}
      submitLabel={existing ? 'Save Profile & Account' : 'Create User'}
      width="wide"
    >
      <form noValidate id={FORM_ID} onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Column (Left - 2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Complete Personal & Contact Profile */}
            <FormSection
              title="User Profile & Contact Information"
              description="Complete personal identity, department title, contact details, and regional timezone."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Full Name *</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => {
                      setForm({ ...form, fullName: e.target.value });
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                    }}
                    placeholder="e.g. Elena Croft"
                    className={`${inputClass} ${errors.fullName ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                  />
                  {errors.fullName && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Email Address *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    placeholder="elena@heygoodly.com"
                    className={`${inputClass} ${errors.email ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => {
                      setForm({ ...form, phone: e.target.value });
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                    }}
                    placeholder="+1 (415) 890-4412"
                    className={`${inputClass} ${errors.phone ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                  />
                  {errors.phone && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Department / Job Title</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    placeholder="e.g. Senior Consumer Tech Reviewer"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className={labelClass}>Regional Timezone</label>
                  <select
                    value={form.timezone}
                    onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                    className={inputClass}
                  >
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 pt-1">
                  <ImageUpload
                    label="Staff Avatar / Profile Photo"
                    value={form.avatar}
                    onChange={(url) => setForm({ ...form, avatar: url })}
                    aspectRatio="square"
                    description="Square profile photo displayed on editorial author bylines and ProCMS header."
                  />
                </div>
              </div>
            </FormSection>

            {/* 2. Editorial Bio & Social Links */}
            <FormSection
              title="Editorial Biography & Social Profiles"
              description="Public author biography and professional social links shown on review articles."
            >
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className={labelClass}>Editorial Author Bio</label>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Write a concise professional bio describing this team member's testing expertise and editorial beat..."
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={labelClass}>X (Twitter) Profile URL</label>
                    <input
                      type="url"
                      value={form.socialX}
                      onChange={(e) => setForm({ ...form, socialX: e.target.value })}
                      placeholder="https://x.com/username"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={labelClass}>LinkedIn Profile URL</label>
                    <input
                      type="url"
                      value={form.socialLinkedIn}
                      onChange={(e) => setForm({ ...form, socialLinkedIn: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </FormSection>

            {/* 3. Admin Password Reset & Credential Management */}
            <FormSection
              title="Password Management & Admin Reset"
              description="Administrators can reset this user's password back to the system default password or assign a custom password at any time."
            >
              <div className="space-y-4">
                {/* Mode Selector Tabs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPasswordMode('default')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition ${
                      passwordMode === 'default'
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <RotateCcw size={14} className="text-[#C62828]" />
                    <span>Default Password ({DEFAULT_USER_PASSWORD})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPasswordMode('custom')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition ${
                      passwordMode === 'custom'
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <KeyRound size={14} className="text-indigo-600" />
                    <span>Set Custom Password</span>
                  </button>
                </div>

                {lastPasswordResetBanner && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-semibold">
                      <Check size={15} className="text-emerald-600 shrink-0" />
                      <span>{lastPasswordResetBanner}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          passwordMode === 'default' ? DEFAULT_USER_PASSWORD : customPassword,
                          'banner'
                        )
                      }
                      className="text-[11px] font-bold underline hover:no-underline shrink-0"
                    >
                      Copy Password
                    </button>
                  </div>
                )}

                {passwordMode === 'default' ? (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          System Default Password
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Standard temporary credential for new or reset staff accounts.
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-xs font-bold text-[#C62828]">
                          {DEFAULT_USER_PASSWORD}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy(DEFAULT_USER_PASSWORD, 'default')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
                          title="Copy default password"
                        >
                          {copiedKey === 'default' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          <span>{copiedKey === 'default' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/70">
                      <span className="text-[11px] text-slate-500">
                        {existing
                          ? 'Click to immediately reset this user account password to the default system password in the database.'
                          : 'This new user account will be initialized with the default password above.'}
                      </span>
                      <button
                        type="button"
                        onClick={handleResetToDefaultPassword}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                      >
                        <RotateCcw size={13} />
                        <span>{existing ? 'Reset to Default Password' : 'Use Default Password'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className={labelClass}>Custom Password *</label>
                        <button
                          type="button"
                          onClick={() => {
                            const generated = generateRandomPassword(12);
                            setCustomPassword(generated);
                            setShowPassword(true);
                            if (!existing) {
                              setForm({ ...form, password: generated });
                            }
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700"
                        >
                          <Sparkles size={12} />
                          <span>Generate Strong Password</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={customPassword}
                            onChange={(e) => {
                              setCustomPassword(e.target.value);
                              if (!existing) {
                                setForm({ ...form, password: e.target.value });
                              }
                              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                            }}
                            placeholder="Enter custom password (min. 6 characters)..."
                            className={`${inputClass} pr-9 font-mono ${errors.password ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            title={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopy(customPassword, 'custom')}
                          disabled={!customPassword}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-semibold text-slate-700 transition"
                          title="Copy custom password"
                        >
                          {copiedKey === 'custom' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          <span>{copiedKey === 'custom' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                          <AlertCircle size={11} /> {errors.password}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/70">
                      <span className="text-[11px] text-slate-500">
                        Enter any custom password or click &ldquo;Generate Strong Password&rdquo;.
                      </span>
                      <button
                        type="button"
                        onClick={handleApplyCustomPassword}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                      >
                        <KeyRound size={13} />
                        <span>{existing ? 'Apply Custom Password' : 'Set as Initial Password'}</span>
                      </button>
                    </div>
                  </div>
                )}

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Require Password Change on Next Sign-In
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Force user to choose a new personal password the next time they log in.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.mustChangePassword}
                    onChange={(e) => setForm({ ...form, mustChangePassword: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-[#C62828] focus:ring-[#C62828]"
                  />
                </label>
              </div>
            </FormSection>

            {/* 4. Login History & Session Trace (Database-Driven) */}
            {existing && (
              <FormSection
                title="Login History & Session Trace"
                description="Chronological audit trail of sign-in timestamps, IP addresses, browser devices, and authentication methods recorded directly in PostgreSQL."
              >
                <div className="space-y-4">
                  {/* Top Summary Metrics & Live Trace Trigger */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Last Sign-In Time
                        </span>
                        <span className="font-mono font-bold text-slate-900">{lastLoginAt}</span>
                      </div>
                      <div className="h-7 w-px bg-slate-200 hidden sm:block" />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Last IP & Location
                        </span>
                        <span className="font-mono text-slate-700">{lastLoginIp}</span>
                      </div>
                      <div className="h-7 w-px bg-slate-200 hidden sm:block" />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Total Recorded Logins
                        </span>
                        <span className="font-bold text-indigo-600">{loginCount} sessions</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingLogin(!isAddingLogin)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition cursor-pointer shrink-0"
                      >
                        <PlusCircle size={13} />
                        <span>{isAddingLogin ? 'Close Form' : 'Add Login Record'}</span>
                      </button>
                      {loginHistory.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAllLogins}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition cursor-pointer shrink-0"
                        >
                          <Trash2 size={13} />
                          <span>Clear All</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Add Login Form Inline */}
                  {isAddingLogin && (
                    <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                          <PlusCircle size={14} className="text-indigo-600" />
                          Record New Login Entry
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsAddingLogin(false)}
                          className="text-[11px] text-slate-400 hover:text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-1">IP Address</label>
                          <input
                            type="text"
                            value={newLoginIp}
                            onChange={(e) => setNewLoginIp(e.target.value)}
                            placeholder="127.0.0.1"
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-1">Location</label>
                          <input
                            type="text"
                            value={newLoginLocation}
                            onChange={(e) => setNewLoginLocation(e.target.value)}
                            placeholder="Ho Chi Minh City, VN"
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-1">Device / OS</label>
                          <input
                            type="text"
                            value={newLoginDevice}
                            onChange={(e) => setNewLoginDevice(e.target.value)}
                            placeholder="Chrome 130 • macOS"
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-1">Auth Method</label>
                          <select
                            value={newLoginAuthMethod}
                            onChange={(e) => setNewLoginAuthMethod(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                          >
                            <option value="Password">Password</option>
                            <option value="2FA (TOTP)">2FA (TOTP)</option>
                            <option value="API Key">API Key</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-1">Status</label>
                          <select
                            value={newLoginStatus}
                            onChange={(e) => setNewLoginStatus(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                          >
                            <option value="Success">Success</option>
                            <option value="Failed">Failed</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleCreateLoginRecord}
                          className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                        >
                          Save Record
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Chronological Login Timeline Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="py-2.5 px-3.5">Login Timestamp</th>
                            <th className="py-2.5 px-3.5">Device & Browser</th>
                            <th className="py-2.5 px-3.5">IP & Location</th>
                            <th className="py-2.5 px-3.5">Auth Method</th>
                            <th className="py-2.5 px-3.5">Status</th>
                            <th className="py-2.5 px-3.5 text-right w-24">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {loginLoading ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400">
                                <div className="flex items-center justify-center gap-2">
                                  <Loader2 size={16} className="animate-spin text-indigo-600" />
                                  <span>Loading records from database...</span>
                                </div>
                              </td>
                            </tr>
                          ) : pagedLoginHistory.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-6 text-center text-slate-400">
                                No login sessions recorded for this user yet.
                              </td>
                            </tr>
                          ) : (
                            pagedLoginHistory.map((item, idx) => {
                              const isLatest = (safeTracePage - 1) * tracePageSize + idx === 0;
                              const isEditing = editingLoginId === item.id;

                              if (isEditing) {
                                return (
                                  <tr key={item.id} className="bg-indigo-50/60">
                                    <td className="py-2.5 px-3.5 font-mono text-slate-600">
                                      {item.timestamp}
                                    </td>
                                    <td className="py-2.5 px-3.5">
                                      <input
                                        type="text"
                                        value={editLoginDevice}
                                        onChange={(e) => setEditLoginDevice(e.target.value)}
                                        className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1"
                                      />
                                    </td>
                                    <td className="py-2.5 px-3.5 space-y-1">
                                      <input
                                        type="text"
                                        value={editLoginIp}
                                        onChange={(e) => setEditLoginIp(e.target.value)}
                                        className="w-full text-xs font-mono bg-white border border-slate-300 rounded px-2 py-1"
                                        placeholder="IP"
                                      />
                                      <input
                                        type="text"
                                        value={editLoginLocation}
                                        onChange={(e) => setEditLoginLocation(e.target.value)}
                                        className="w-full text-[11px] bg-white border border-slate-300 rounded px-2 py-1"
                                        placeholder="Location"
                                      />
                                    </td>
                                    <td className="py-2.5 px-3.5">
                                      <select
                                        value={editLoginAuthMethod}
                                        onChange={(e) => setEditLoginAuthMethod(e.target.value)}
                                        className="text-xs bg-white border border-slate-300 rounded px-2 py-1"
                                      >
                                        <option value="Password">Password</option>
                                        <option value="2FA (TOTP)">2FA (TOTP)</option>
                                        <option value="API Key">API Key</option>
                                      </select>
                                    </td>
                                    <td className="py-2.5 px-3.5">
                                      <select
                                        value={editLoginStatus}
                                        onChange={(e) => setEditLoginStatus(e.target.value)}
                                        className="text-xs bg-white border border-slate-300 rounded px-2 py-1"
                                      >
                                        <option value="Success">Success</option>
                                        <option value="Failed">Failed</option>
                                      </select>
                                    </td>
                                    <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                                      <div className="flex items-center justify-end gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleSaveEditLogin(item.id)}
                                          className="p-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                          title="Save changes"
                                        >
                                          <Check size={13} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingLoginId(null)}
                                          className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                                          title="Cancel"
                                        >
                                          <X size={13} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              }

                              return (
                                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                  <td className="py-3 px-3.5 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <History
                                        size={13}
                                        className={isLatest ? 'text-emerald-600' : 'text-slate-400'}
                                      />
                                      <span className="font-mono font-semibold text-slate-800">
                                        {item.timestamp}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-3.5">
                                    <span className="inline-flex items-center gap-1.5 text-slate-700">
                                      <Monitor size={12} className="text-slate-400 shrink-0" />
                                      <span>{item.device}</span>
                                    </span>
                                  </td>
                                  <td className="py-3 px-3.5">
                                    <div className="font-mono text-[11px] text-slate-800">
                                      {item.ipAddress}
                                    </div>
                                    <div className="text-[10px] text-slate-400 inline-flex items-center gap-1">
                                      <MapPin size={10} />
                                      <span>{item.location}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-3.5 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                        item.authMethod === '2FA (TOTP)'
                                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      {item.authMethod}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3.5 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        item.status === 'Success'
                                          ? 'bg-emerald-50 text-emerald-700'
                                          : 'bg-rose-50 text-rose-700'
                                      }`}
                                    >
                                      {item.status}
                                    </span>
                                    {item.duration && (
                                      <span className="block text-[10px] text-slate-400 mt-0.5 font-mono">
                                        {item.duration}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3.5 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditLogin(item)}
                                        className="w-7 h-7 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-indigo-600 transition cursor-pointer"
                                        title="Edit login record"
                                      >
                                        <Edit2 size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteLoginRecord(item.id)}
                                        className="w-7 h-7 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition cursor-pointer"
                                        title="Delete login record"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      currentPage={safeTracePage}
                      totalPages={totalTracePages}
                      totalItems={loginHistory.length}
                      pageSize={tracePageSize}
                      onPageChange={setTracePage}
                      onPageSizeChange={(newSize) => {
                        setTracePageSize(newSize);
                        setTracePage(1);
                      }}
                      pageSizeOptions={[3, 5, 10, 20]}
                      itemName="sessions"
                    />
                  </div>
                </div>
              </FormSection>
            )}
          </div>

          {/* Sidebar Column (Right - 1 Col) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Live Executive Profile Card */}
            <FormSection title="User Profile Overview">
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full bg-slate-900 text-white font-bold text-lg flex items-center justify-center overflow-hidden shrink-0 border-2 border-slate-200">
                    {form.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.avatar}
                        alt={form.fullName || 'Avatar'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (form.fullName || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm truncate">
                      {form.fullName || 'Unnamed Staff User'}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {form.department || form.role}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <Badge variant={form.isActive ? 'success' : 'secondary'}>
                        {form.isActive ? 'Active' : 'Suspended'}
                      </Badge>
                      <Badge variant={form.twoFactorEnabled ? 'indigo' : 'warning'}>
                        {form.twoFactorEnabled ? '2FA Enabled' : '2FA Pending'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {form.bio && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                    {form.bio}
                  </p>
                )}

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between gap-2 text-slate-600">
                    <span className="inline-flex items-center gap-1.5 text-slate-400">
                      <Mail size={13} />
                      <span>Email</span>
                    </span>
                    <span className="font-medium text-slate-800 truncate">{form.email || '—'}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-slate-600">
                    <span className="inline-flex items-center gap-1.5 text-slate-400">
                      <Phone size={13} />
                      <span>Phone</span>
                    </span>
                    <span className="font-medium text-slate-800">{form.phone || 'Not provided'}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-slate-600">
                    <span className="inline-flex items-center gap-1.5 text-slate-400">
                      <Briefcase size={13} />
                      <span>Role</span>
                    </span>
                    <span className="font-semibold text-slate-800">{form.role}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-slate-600">
                    <span className="inline-flex items-center gap-1.5 text-slate-400">
                      <Globe size={13} />
                      <span>Timezone</span>
                    </span>
                    <span className="font-medium text-slate-800 truncate max-w-[170px]">
                      {form.timezone}
                    </span>
                  </div>

                  {existing && (
                    <>
                      <div className="flex items-center justify-between gap-2 text-slate-600">
                        <span className="inline-flex items-center gap-1.5 text-slate-400">
                          <Clock size={13} />
                          <span>Last Login</span>
                        </span>
                        <span className="font-mono font-medium text-slate-800 text-[11px]">
                          {lastLoginAt || 'Never'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-slate-600">
                        <span className="inline-flex items-center gap-1.5 text-slate-400">
                          <History size={13} />
                          <span>Total Logins</span>
                        </span>
                        <span className="font-bold text-indigo-600">
                          {loginCount} sessions
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-slate-600">
                        <span className="inline-flex items-center gap-1.5 text-slate-400">
                          <Calendar size={13} />
                          <span>Password Reset</span>
                        </span>
                        <span className="font-medium text-slate-800">
                          {existing.passwordUpdatedAt || existing.createdAt}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </FormSection>

            {/* Role, Status & 2FA Controls */}
            <FormSection title="Role & Security Controls">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className={labelClass}>Assigned Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      const matched = roles.find((r) => r.name === selectedName);
                      setForm({
                        ...form,
                        role: selectedName,
                        roleId: matched ? matched.id : form.roleId,
                      });
                    }}
                    className={inputClass}
                  >
                    {roles.length > 0 ? (
                      roles.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Administrator">Administrator (Full Access)</option>
                        <option value="Staff">Staff (Editorial CMS)</option>
                      </>
                    )}
                  </select>
                </div>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Account Active</span>
                    <span className="text-[11px] text-slate-400">Allow login to ProCMS</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-[#C62828] focus:ring-[#C62828]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                  <div className="flex items-start gap-2">
                    {form.twoFactorEnabled ? (
                      <ShieldCheck size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldOff size={15} className="text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Two-Factor Authentication (2FA)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {form.twoFactorEnabled
                          ? 'TOTP Authenticator active (reset via actions bar)'
                          : 'Not enrolled in 2FA yet'}
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    disabled
                    checked={form.twoFactorEnabled}
                    className="w-4 h-4 rounded border-slate-300 text-slate-400 cursor-not-allowed"
                  />
                </label>
              </div>
            </FormSection>

            {/* Quick Role Summary Card */}
            <FormSection title="Privilege Scope">
              <div className="text-xs space-y-2 text-slate-600">
                <div className="font-bold text-slate-800">
                  {form.role.toLowerCase().includes('admin')
                    ? '👑 Full Superuser Access'
                    : '✍️ Granular Operational Access'}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {form.role.toLowerCase().includes('admin')
                    ? 'Can configure system settings, add/remove staff accounts, manage RBAC matrix, and publish all content.'
                    : 'Role privileges are dynamically governed by the system RBAC permission matrix configured in Roles & Permissions.'}
                </p>
              </div>
            </FormSection>
          </div>
        </div>
      </form>
    </AdminFormPage>
  );
}
