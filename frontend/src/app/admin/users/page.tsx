'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Filter,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import Pagination from '@/components/admin/Pagination';
import { useAdminCollection } from '@/lib/admin/useAdminCollection';
import { USERS_STORE_KEY, DEFAULT_USERS, type UserData } from './_lib/data';
import { usePermission } from '@/lib/admin/usePermission';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';

export default function AdminUsersPage() {
  const { hasPermission } = usePermission();
  const { items: users, setItems, remove } = useAdminCollection<UserData>(USERS_STORE_KEY, DEFAULT_USERS);

  if (!hasPermission('user.view')) {
    return <UnauthorizedAccess requiredPermission="user.view" moduleName="Staff Accounts" />;
  }
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [twoFactorFilter, setTwoFactorFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'created-desc' | 'role-asc'>('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleToggleStatus = (id: number) => {
    setItems((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          if (u.isSuperAdmin) {
            alert('Cannot deactivate Super Administrator.');
            return u;
          }
          return { ...u, isActive: !u.isActive };
        }
        return u;
      })
    );
  };

  const handleReset2FA = (id: number) => {
    if (confirm('Reset 2-Factor Authentication for this user? They will be prompted to re-configure their TOTP authenticator on next login.')) {
      setItems((prev) =>
        prev.map((u) => (u.id === id ? { ...u, twoFactorEnabled: false } : u))
      );
      alert('2FA has been reset successfully.');
    }
  };

  const handleDeleteUser = (id: number) => {
    const user = users.find((u) => u.id === id);
    if (user?.isSuperAdmin) {
      alert('Cannot delete the root Super Administrator account.');
      return;
    }
    if (confirm(`Are you sure you want to delete user "${user?.fullName}"?`)) {
      remove(id);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setTwoFactorFilter('all');
    setStatusFilter('all');
    setSortBy('name-asc');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    roleFilter !== 'all' ||
    twoFactorFilter !== 'all' ||
    statusFilter !== 'all' ||
    sortBy !== 'name-asc';

  // Extract unique roles for dropdown
  const uniqueRoles = Array.from(new Set(users.map((u) => u.role))).filter(Boolean);

  // Filter & Search
  const filtered = users.filter((u) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = u.fullName.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchRole = u.role.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchRole) return false;
    }

    if (roleFilter !== 'all' && u.role !== roleFilter) return false;

    if (twoFactorFilter === 'enabled' && !u.twoFactorEnabled) return false;
    if (twoFactorFilter === 'disabled' && u.twoFactorEnabled) return false;

    if (statusFilter === 'active' && !u.isActive) return false;
    if (statusFilter === 'inactive' && u.isActive) return false;

    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'name-asc') return a.fullName.localeCompare(b.fullName);
    if (sortBy === 'name-desc') return b.fullName.localeCompare(a.fullName);
    if (sortBy === 'created-desc') return b.createdAt.localeCompare(a.createdAt);
    if (sortBy === 'role-asc') return a.role.localeCompare(b.role);
    return 0;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const pagedItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const activeCount = users.filter((u) => u.isActive).length;
  const twoFactorActiveCount = users.filter((u) => u.twoFactorEnabled).length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="text-indigo-600" size={26} /> Staff & Administrator Accounts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage admin users, granular RBAC privilege tiers, and RFC 6238 TOTP two-factor security status.
          </p>
        </div>

        <Link
          href={ROUTES.ADMIN.USER_CREATE}
          className="h-9 px-4 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus size={16} /> Add Staff User
        </Link>
      </div>

      {/* Advanced Filter Box */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Quick pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => {
                setStatusFilter('all');
                setTwoFactorFilter('all');
                setCurrentPage(1);
              }}
              className={`h-8 px-3.5 inline-flex items-center text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'all' && twoFactorFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Staff ({users.length})
            </button>
            <button
              onClick={() => {
                setStatusFilter('active');
                setCurrentPage(1);
              }}
              className={`h-8 px-3.5 inline-flex items-center text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'active'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => {
                setTwoFactorFilter('enabled');
                setCurrentPage(1);
              }}
              className={`h-8 px-3.5 inline-flex items-center text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                twoFactorFilter === 'enabled'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2FA Protected ({twoFactorActiveCount})
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="h-8 inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t border-slate-100">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name or email..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-slate-400 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Roles</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* 2FA Filter */}
          <select
            value={twoFactorFilter}
            onChange={(e) => {
              setTwoFactorFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="all">2FA: All Security Tiers</option>
            <option value="enabled">2FA: Active Only</option>
            <option value="disabled">2FA: Not Configured</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown size={14} className="text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="name-asc">Full Name (A → Z)</option>
              <option value="name-desc">Full Name (Z → A)</option>
              <option value="created-desc">Created Date (Newest)</option>
              <option value="role-asc">Role Tier</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role Tier</th>
                <th className="py-3 px-4">Two-Factor Auth</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right w-36 min-w-[144px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="mx-auto text-slate-300 mb-2" size={32} />
                    <p className="font-semibold text-slate-600">No staff accounts found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Try adjusting your keyword search or security filters.
                    </p>
                  </td>
                </tr>
              ) : (
                pagedItems.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {u.fullName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">
                            {u.fullName}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.twoFactorEnabled ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] border border-emerald-200">
                          <ShieldCheck size={12} /> 2FA Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full text-[10px] border border-amber-200">
                          <ShieldAlert size={12} /> Not Configured
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className="cursor-pointer"
                        title="Click to toggle status"
                      >
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                            <CheckCircle2 size={12} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">
                            <XCircle size={12} /> Inactive
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {u.createdAt}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap w-36 min-w-[144px]">
                      <div className="flex items-center justify-end gap-1.5">
                        {u.twoFactorEnabled && (
                          <button
                            onClick={() => handleReset2FA(u.id)}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-amber-50 text-slate-400 hover:text-amber-600 hover:border-amber-300 transition shrink-0 shadow-2xs cursor-pointer"
                            title="Reset 2FA"
                          >
                            <KeyRound size={13} />
                          </button>
                        )}
                        <Link
                          href={ROUTES.ADMIN.USER_EDIT(u.id)}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-rose-50/60 text-slate-600 hover:text-[#C62828] hover:border-[#C62828]/40 transition shrink-0 shadow-2xs cursor-pointer"
                          title="Edit User"
                        >
                          <Edit2 size={13} />
                        </Link>
                        {!u.isSuperAdmin && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-rose-50/60 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition shrink-0 shadow-2xs cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Customizable Pagination */}
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>
    </div>
  );
}
