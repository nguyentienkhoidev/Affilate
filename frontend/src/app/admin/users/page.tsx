'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  History,
  Monitor,
  MapPin,
  X,
  Edit2,
  Trash2,
  Loader2,
  PlusCircle,
  RotateCcw,
  Check,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { apiClient } from '@/lib/api/axios-client';
import Pagination from '@/components/admin/Pagination';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { usePermission } from '@/lib/admin/usePermission';
import { useServerPagination } from '@/lib/admin/useServerPagination';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { useToast } from '@/context/ToastContext';
import { useUserActions } from './_hooks/useUserActions';
import UserFiltersBar from './_components/UserFiltersBar';
import UserTableRow from './_components/UserTableRow';
import UserTableEmptyState from './_components/UserTableEmptyState';
import {
  resolveUserWithDefaults,
  formatLoginTime,
  type UserData,
  type UserLoginRecord,
} from './_lib/data';

type TwoFactorFilter = 'all' | 'enabled' | 'disabled';
type StatusFilter = 'all' | 'active' | 'inactive';
type SortBy = 'name-asc' | 'name-desc' | 'created-desc' | 'role-asc';

export default function AdminUsersPage() {
  const { hasPermission } = usePermission();
  const { toast, confirm: confirmModal } = useToast();
  const { handleToggleStatus, handleToggle2FA, handleDeleteUser, handleResetPassword } = useUserActions();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [twoFactorFilter, setTwoFactorFilter] = useState<TwoFactorFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('name-asc');
  const [roles, setRoles] = useState<{ id: number; name: string; slug: string }[]>([]);

  // Trace Modal state
  const [traceUser, setTraceUser] = useState<UserData | null>(null);
  const [traceLogins, setTraceLogins] = useState<UserLoginRecord[]>([]);
  const [traceLoginsLoading, setTraceLoginsLoading] = useState(false);
  const [modalTracePage, setModalTracePage] = useState<number>(1);
  const [modalTracePageSize, setModalTracePageSize] = useState<number>(5);

  // Add login form state inside modal
  const [isAddingLogin, setIsAddingLogin] = useState(false);
  const [newLoginIp, setNewLoginIp] = useState('127.0.0.1');
  const [newLoginDevice, setNewLoginDevice] = useState('Desktop Chrome / macOS');
  const [newLoginLocation, setNewLoginLocation] = useState('Ho Chi Minh City, VN');
  const [newLoginAuthMethod, setNewLoginAuthMethod] = useState('Password');
  const [newLoginStatus, setNewLoginStatus] = useState('Success');

  // Edit login form state inside modal
  const [editingLoginId, setEditingLoginId] = useState<number | string | null>(null);
  const [editLoginIp, setEditLoginIp] = useState('');
  const [editLoginDevice, setEditLoginDevice] = useState('');
  const [editLoginLocation, setEditLoginLocation] = useState('');
  const [editLoginAuthMethod, setEditLoginAuthMethod] = useState('');
  const [editLoginStatus, setEditLoginStatus] = useState('');

  // Load roles dynamically for filters
  useEffect(() => {
    let active = true;
    apiClient
      .get(API_ENDPOINTS.ADMIN.ROLES)
      .then((res) => {
        if (!active) return;
        const data = res.data?.data;
        if (Array.isArray(data)) {
          setRoles(data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const {
    items: displayedUsers,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    loading,
    setCurrentPage,
    setPageSize,
    refresh,
  } = useServerPagination<UserData>({
    endpoint: API_ENDPOINTS.ADMIN.USERS,
    defaultPageSize: 10,
    search,
    filters: {
      isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      twoFactorEnabled: twoFactorFilter === 'enabled' ? true : twoFactorFilter === 'disabled' ? false : undefined,
      role: roleFilter !== 'all' ? roleFilter : undefined,
      sortBy: sortBy === 'name-desc' || sortBy === 'name-asc' ? 'fullName' : sortBy === 'created-desc' ? 'createdAt' : 'id',
      direction: sortBy === 'name-asc' ? 'asc' : 'desc',
    },
    transformItem: (u: any) =>
      resolveUserWithDefaults({
        id: Number(u.id),
        fullName: u.fullName || 'Administrator',
        email: u.email || '',
        role: (u.roleName || (u.isSuperAdmin ? 'Administrator' : 'Staff')) as any,
        roleId: u.roleId,
        roleName: u.roleName,
        roleSlug: u.roleSlug,
        department: u.department,
        timezone: u.timezone,
        bio: u.bio,
        socialX: u.socialX,
        socialLinkedIn: u.socialLinkedIn,
        phone: u.phone,
        avatar: u.avatar,
        isActive: u.isActive !== false,
        isSuperAdmin: Boolean(u.isSuperAdmin),
        twoFactorEnabled: Boolean(u.twoFactorEnabled),
        lastLoginAt: u.lastLoginAt,
        lastLoginIp: u.lastLoginIp,
        loginCount: u.loginCount,
        passwordUpdatedAt: u.passwordUpdatedAt,
        createdAt: u.createdAt || '2026-10-31',
      }),
    fallbackItems: [],
  });

  const fetchTraceLogins = useCallback(async (userId: number) => {
    setTraceLoginsLoading(true);
    try {
      const res = await apiClient.get(`${API_ENDPOINTS.ADMIN.USERS}/${userId}/logins`);
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
        setTraceLogins(records);
      } else {
        setTraceLogins([]);
      }
    } catch (err) {
      console.error('Failed to fetch user login history:', err);
      setTraceLogins([]);
    } finally {
      setTraceLoginsLoading(false);
    }
  }, []);

  const handleOpenTrace = (user: UserData) => {
    setTraceUser(user);
    setModalTracePage(1);
    setIsAddingLogin(false);
    setEditingLoginId(null);
    setNewLoginAuthMethod(user.twoFactorEnabled ? '2FA (TOTP)' : 'Password');
    fetchTraceLogins(user.id);
  };

  const handleAddLoginRecord = async () => {
    if (!traceUser) return;
    try {
      await apiClient.post(`${API_ENDPOINTS.ADMIN.USERS}/${traceUser.id}/logins`, {
        ipAddress: newLoginIp.trim(),
        location: newLoginLocation.trim(),
        device: newLoginDevice.trim(),
        authMethod: newLoginAuthMethod,
        status: newLoginStatus,
      });
      toast.success(`Added login record for "${traceUser.fullName}".`);
      setIsAddingLogin(false);
      await fetchTraceLogins(traceUser.id);
      refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to add login record.';
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
    if (!traceUser) return;
    try {
      await apiClient.put(`${API_ENDPOINTS.ADMIN.USERS}/${traceUser.id}/logins/${recordId}`, {
        ipAddress: editLoginIp.trim(),
        location: editLoginLocation.trim(),
        device: editLoginDevice.trim(),
        authMethod: editLoginAuthMethod,
        status: editLoginStatus,
      });
      toast.success('Login record updated successfully.');
      setEditingLoginId(null);
      await fetchTraceLogins(traceUser.id);
      refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update login record.';
      toast.error(msg);
    }
  };

  const handleDeleteLoginRecord = async (recordId: number | string) => {
    if (!traceUser) return;
    const ok = await confirmModal({
      title: 'Delete Login Record?',
      message: 'Are you sure you want to delete this login record? This cannot be undone.',
      confirmText: 'Delete Record',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN.USERS}/${traceUser.id}/logins/${recordId}`);
      toast.success('Login record deleted.');
      await fetchTraceLogins(traceUser.id);
      refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete record.';
      toast.error(msg);
    }
  };

  const handleClearAllLogins = async () => {
    if (!traceUser) return;
    const ok = await confirmModal({
      title: 'Clear All Login History?',
      message: `Are you sure you want to delete all recorded sign-in sessions for "${traceUser.fullName}"? This action is permanent.`,
      confirmText: 'Clear All Sessions',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN.USERS}/${traceUser.id}/logins`);
      toast.success(`Cleared all login history for "${traceUser.fullName}".`);
      await fetchTraceLogins(traceUser.id);
      refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to clear login history.';
      toast.error(msg);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setTwoFactorFilter('all');
    setStatusFilter('all');
    setSortBy('name-asc');
  };

  const uniqueRoles =
    roles.length > 0
      ? roles.map((r) => r.name)
      : Array.from(new Set(displayedUsers.map((u) => u.role))).filter(Boolean);

  const activeCount = displayedUsers.filter((u) => u.isActive).length;
  const twoFactorCount = displayedUsers.filter((u) => u.twoFactorEnabled).length;

  const totalModalTracePages = Math.max(1, Math.ceil(traceLogins.length / modalTracePageSize));
  const safeModalTracePage = Math.min(Math.max(1, modalTracePage), totalModalTracePages);
  const pagedModalTraceHistory = traceLogins.slice(
    (safeModalTracePage - 1) * modalTracePageSize,
    safeModalTracePage * modalTracePageSize
  );

  if (!hasPermission('user.view')) {
    return <UnauthorizedAccess requiredPermission="user.view" moduleName="Staff Accounts" />;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <AdminPageHeader
        icon={Users}
        title="Staff & Administrator Accounts"
        badge={`${totalElements} Users Total`}
        description="Manage admin users, granular RBAC privilege tiers, and RFC 6238 TOTP two-factor security status."
      >
        <Link
          href={ROUTES.ADMIN.USER_CREATE}
          className="h-9 px-4 inline-flex items-center justify-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus size={16} /> Add Staff User
        </Link>
      </AdminPageHeader>

      {/* Filters */}
      <UserFiltersBar
        search={search}
        roleFilter={roleFilter}
        twoFactorFilter={twoFactorFilter}
        statusFilter={statusFilter}
        sortBy={sortBy}
        totalCount={totalElements}
        activeCount={activeCount}
        twoFactorCount={twoFactorCount}
        uniqueRoles={uniqueRoles}
        onSearchChange={setSearch}
        onRoleFilterChange={setRoleFilter}
        onTwoFactorFilterChange={setTwoFactorFilter}
        onStatusFilterChange={setStatusFilter}
        onSortByChange={setSortBy}
        onResetFilters={handleResetFilters}
      />

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role Tier</th>
                <th className="py-3 px-4">Two-Factor Auth</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login & Trace</th>
                <th className="py-3 px-4 text-right w-56 min-w-[220px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 size={24} className="animate-spin text-[#C62828]" />
                      <p className="text-xs font-semibold">Loading staff accounts...</p>
                    </div>
                  </td>
                </tr>
              ) : displayedUsers.length === 0 ? (
                <UserTableEmptyState />
              ) : (
                displayedUsers.map((user) => (
                  <UserTableRow
                    key={user.id}
                    user={user}
                    onToggleStatus={async (id) => {
                      await handleToggleStatus(id, displayedUsers, refresh);
                    }}
                    onToggle2FA={async (id) => {
                      await handleToggle2FA(id, displayedUsers, refresh);
                    }}
                    onResetPassword={(id) => handleResetPassword(id, displayedUsers, refresh)}
                    onTraceLogins={handleOpenTrace}
                    onDelete={async (id) => {
                      await handleDeleteUser(id, displayedUsers, refresh);
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalElements}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* Quick User Login Trace Modal */}
      {traceUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setTraceUser(null)}
        >
          <div
            className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                  <History size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Login History & Session Trace: {traceUser.fullName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {traceUser.email} • {traceUser.role} • {traceLogins.length} sessions recorded in database
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingLogin(!isAddingLogin)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition cursor-pointer"
                >
                  <PlusCircle size={14} />
                  <span>{isAddingLogin ? 'Close Form' : 'Add Login Record'}</span>
                </button>
                {traceLogins.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllLogins}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer"
                    title="Clear all login sessions for this user"
                  >
                    <Trash2 size={13} />
                    <span>Clear All</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setTraceUser(null)}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer ml-1"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Summary Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Last Sign-In Time
                  </span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block truncate">
                    {traceLogins[0]?.timestamp || traceUser.lastLoginAt || 'Never signed in'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Last IP & Location
                  </span>
                  <span className="font-mono text-slate-700 mt-0.5 block truncate">
                    {traceLogins[0]?.ipAddress
                      ? `${traceLogins[0].ipAddress} (${traceLogins[0].location})`
                      : traceUser.lastLoginIp || '—'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Total Logins & Created
                  </span>
                  <span className="font-bold text-indigo-600 mt-0.5 block">
                    {traceLogins.length} sessions • Joined {traceUser.createdAt}
                  </span>
                </div>
              </div>

              {/* Add Login Form (Collapsible) */}
              {isAddingLogin && (
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <PlusCircle size={14} className="text-indigo-600" />
                      Add Manual / Verified Login Record
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
                      onClick={handleAddLoginRecord}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      Save Login Record
                    </button>
                  </div>
                </div>
              )}

              {/* Login Records Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
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
                    {traceLoginsLoading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 size={20} className="animate-spin text-indigo-600" />
                            <p className="text-xs font-semibold">Loading real login records from database...</p>
                          </div>
                        </td>
                      </tr>
                    ) : traceLogins.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No login records recorded for this user yet.
                        </td>
                      </tr>
                    ) : (
                      pagedModalTraceHistory.map((item, idx) => {
                        const isLatest = (safeModalTracePage - 1) * modalTracePageSize + idx === 0;
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
                          <tr key={item.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-3.5 font-mono font-semibold text-slate-800 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5">
                                <History size={12} className={isLatest ? 'text-emerald-600' : 'text-slate-400'} />
                                <span>{item.timestamp}</span>
                              </span>
                            </td>
                            <td className="py-3 px-3.5 text-slate-700">
                              <span className="inline-flex items-center gap-1.5">
                                <Monitor size={12} className="text-slate-400 shrink-0" />
                                <span>{item.device}</span>
                              </span>
                            </td>
                            <td className="py-3 px-3.5">
                              <div className="font-mono text-[11px] text-slate-800">{item.ipAddress}</div>
                              <div className="text-[10px] text-slate-400 inline-flex items-center gap-1">
                                <MapPin size={10} />
                                <span>{item.location}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3.5">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.authMethod === '2FA (TOTP)'
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {item.authMethod}
                              </span>
                            </td>
                            <td className="py-3 px-3.5">
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

                <Pagination
                  currentPage={safeModalTracePage}
                  totalPages={totalModalTracePages}
                  totalItems={traceLogins.length}
                  pageSize={modalTracePageSize}
                  onPageChange={setModalTracePage}
                  onPageSizeChange={(newSize) => {
                    setModalTracePageSize(newSize);
                    setModalTracePage(1);
                  }}
                  pageSizeOptions={[3, 5, 10, 20]}
                  itemName="sessions"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0">
              <Link
                href={ROUTES.ADMIN.USER_EDIT(traceUser.id)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C62828] hover:underline"
              >
                <Edit2 size={13} />
                <span>Edit Full User Profile & Password</span>
              </Link>
              <button
                type="button"
                onClick={() => setTraceUser(null)}
                className="h-8 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
