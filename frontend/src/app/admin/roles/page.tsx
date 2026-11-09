'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Check,
  CheckSquare,
  Square,
  Users,
  Lock,
  Search,
  Filter,
} from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { ROUTES } from '@/constants/routes';
import {
  PERMISSION_CATALOG,
  CORE_PERMISSION_CODES,
  isCorePermission,
  type RoleItem,
  type PermissionGroup,
} from './_lib/data';
import { usePermission } from '@/lib/admin/usePermission';
import { useToast } from '@/context/ToastContext';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export default function AdminRolesPage() {
  const { hasPermission } = usePermission();
  const { toast, confirm: confirmModal } = useToast();

  const [apiRoles, setApiRoles] = useState<RoleItem[]>([]);

  useEffect(() => {
    let mounted = true;
    apiClient.get(API_ENDPOINTS.ADMIN.ROLES, { params: { size: 50 } })
      .then((res) => {
        const pageData = res.data?.data;
        const list = pageData?.content || pageData?.items || (Array.isArray(pageData) ? pageData : null);
        if (mounted && list && Array.isArray(list) && list.length > 0) {
          const mapped: RoleItem[] = list.map((r: any) => ({
            id: Number(r.id),
            name: r.name,
            slug: r.slug,
            description: r.description || '',
            isSystem: Boolean(r.isSystem),
            usersCount: Number(r.userCount || r.usersCount || 0),
            permissions: Array.isArray(r.permissions) ? r.permissions : [],
          }));
          setApiRoles(mapped);
          if (mapped.length > 0) {
            setSelectedRole(mapped[1] ?? mapped[0]);
            const initPerms = mapped[1]?.permissions ?? mapped[0]?.permissions ?? [];
            setSelectedPermissions(initPerms.includes('ALL') ? initPerms : Array.from(new Set([...initPerms, ...CORE_PERMISSION_CODES])));
          }
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const activeRolesList = apiRoles;

  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [roleSearch, setRoleSearch] = useState('');
  const [permissionSearch, setPermissionSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const activeRole = (selectedRole ? activeRolesList.find((r) => r.id === selectedRole.id) : null) ?? activeRolesList[0];
  const isSuperAdminRole = activeRole?.slug === 'admin' || (Boolean(activeRole?.isSystem) && activeRole?.name?.toLowerCase().includes('administrator'));

  const handleSelectRole = (role: RoleItem) => {
    setSelectedRole(role);
    const perms = role.permissions.includes('ALL') || role.slug === 'admin'
      ? role.permissions
      : Array.from(new Set([...role.permissions, ...CORE_PERMISSION_CODES]));
    setSelectedPermissions(perms);
  };

  const togglePermission = (code: string) => {
    if (!activeRole || isSuperAdminRole) return; // Only Super Administrator is locked
    if (isCorePermission(code)) return; // Core permissions are permanently granted & locked
    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleModuleAll = (group: PermissionGroup) => {
    if (!activeRole || isSuperAdminRole || group.isCore) return;
    const groupCodes = group.permissions.filter((p) => !p.isLocked && !isCorePermission(p.code)).map((p) => p.code);
    const hasAll = groupCodes.every((c) => selectedPermissions.includes(c));

    if (hasAll) {
      setSelectedPermissions((prev) => prev.filter((c) => !groupCodes.includes(c)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...groupCodes])));
    }
  };

  const handleDeleteRole = async (id: number) => {
    const roleItem = activeRolesList.find((r) => r.id === id);
    if (roleItem?.isSystem || roleItem?.slug === 'admin' || roleItem?.slug === 'staff') {
      toast.error('System roles cannot be deleted.');
      return;
    }
    const confirmed = await confirmModal({
      title: 'Delete Operational Role',
      message: (
        <span>
          Are you sure you want to delete role{' '}
          <strong className="text-rose-600 font-bold">{roleItem?.name || 'this role'}</strong>?
          Staff members assigned to it will revert to basic viewer.
        </span>
      ),
      confirmText: 'Delete Role',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      try {
        await apiClient.delete(`${API_ENDPOINTS.ADMIN.ROLES}/${id}`);
        setApiRoles((prev) => prev.filter((r) => r.id !== id));
        if (activeRolesList.length > 1) {
          const remaining = activeRolesList.filter((r) => r.id !== id);
          setSelectedRole(remaining[0]);
          setSelectedPermissions(remaining[0].permissions);
        }
        toast.success('Role deleted successfully');
      } catch {
        toast.error('Failed to delete role');
      }
    }
  };

  const handleSaveMatrix = async () => {
    if (!activeRole || isSuperAdminRole) return;
    const finalPermissions = Array.from(new Set([...selectedPermissions, ...CORE_PERMISSION_CODES]));
    try {
      await apiClient.put(`${API_ENDPOINTS.ADMIN.ROLES}/${activeRole.id}`, {
        name: activeRole.name,
        slug: activeRole.slug,
        description: activeRole.description,
        permissions: finalPermissions,
      });
      setApiRoles((prev) =>
        prev.map((r) =>
          r.id === activeRole.id ? { ...r, permissions: finalPermissions } : r
        )
      );
      setSelectedPermissions(finalPermissions);
      toast.success(`Permissions saved successfully for role: ${activeRole.name}`);
    } catch {
      toast.error('Failed to save permissions');
    }
  };

  // Filter Roles
  const filteredRoles = activeRolesList.filter(
    (r) =>
      r.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
      r.description.toLowerCase().includes(roleSearch.toLowerCase())
  );

  // Filter Modules & Permissions
  const filteredModules = PERMISSION_CATALOG.filter((group) => {
    if (moduleFilter !== 'all' && group.module !== moduleFilter) return false;
    if (!permissionSearch.trim()) return true;

    const q = permissionSearch.toLowerCase();
    const matchModuleName = group.module.toLowerCase().includes(q);
    const matchAnyPerm = group.permissions.some(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
    return matchModuleName || matchAnyPerm;
  }).map((group) => {
    if (!permissionSearch.trim()) return group;
    const q = permissionSearch.toLowerCase();
    const matchedPerms = group.permissions.filter(
      (p) =>
        group.module.toLowerCase().includes(q) ||
        p.label.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
    return { ...group, permissions: matchedPerms };
  }).filter((group) => group.permissions.length > 0);

  if (!hasPermission('role.view')) {
    return <UnauthorizedAccess requiredPermission="role.view" moduleName="Roles & RBAC Permission Matrix" />;
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <AdminPageHeader
        icon={ShieldCheck}
        title="Role-Based Access Control (Dynamic RBAC)"
        badge={`${activeRolesList.length} Roles Configured`}
        description="Configure operational privileges for each staff role. Core system permissions are granted by default and locked across all roles."
      >
        <Link
          href={ROUTES.ADMIN.ROLE_CREATE}
          className="h-9 px-4 inline-flex items-center justify-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus size={15} /> Create Custom Role
        </Link>
      </AdminPageHeader>

      {/* Main 2-Column RBAC Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Role List Selection */}
        <Card className="lg:col-span-4 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <CardTitle className="text-sm">Configured Roles</CardTitle>
              <CardDescription className="text-xs">Select a role to manage its permissions</CardDescription>
            </div>
            <Badge variant="outline">{activeRolesList.length} Roles</Badge>
          </div>

          {/* Role search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-zinc-400" size={14} />
            <input
              type="text"
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              placeholder="Filter roles by name..."
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredRoles.map((role) => {
              const isSelected = activeRole?.id === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => handleSelectRole(role)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-200 ring-1 ring-indigo-500/20'
                      : 'bg-white border-zinc-200/80 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck
                        size={16}
                        className={isSelected ? 'text-indigo-600' : 'text-zinc-400'}
                      />
                      <span className="font-bold text-xs text-zinc-900">{role.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {role.isSystem || role.slug === 'admin' || role.slug === 'staff' ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                          <Lock size={10} /> System
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRole(role.id);
                          }}
                          className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                          title="Delete Role"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                    {role.description}
                  </p>

                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-zinc-100 text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {role.usersCount} Staff
                    </span>
                    <span className="font-mono text-zinc-500 text-[10px]">
                      {role.permissions.includes('ALL') || role.slug === 'admin' ? 'Full Access (All 47)' : `${role.permissions.length} actions`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right: Permission Matrix Editor */}
        <Card className="lg:col-span-8 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>{activeRole?.name} Matrix</CardTitle>
                {isSuperAdminRole ? (
                  <Badge variant="indigo">Full Superuser Authorization (Immutable)</Badge>
                ) : (
                  <Badge variant="outline">Configurable Operational Role</Badge>
                )}
              </div>
              <CardDescription className="text-xs mt-0.5">
                {activeRole?.description}
              </CardDescription>
            </div>

            {!isSuperAdminRole && (
              <Button onClick={handleSaveMatrix} size="sm">
                <Check size={14} /> Save Permissions
              </Button>
            )}
          </div>

          {/* Matrix Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-50/80 p-3 rounded-xl border border-zinc-200/60">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-zinc-400" size={14} />
              <input
                type="text"
                value={permissionSearch}
                onChange={(e) => setPermissionSearch(e.target.value)}
                placeholder="Search actions (e.g. view, create, delete)..."
                className="w-full text-xs bg-white border border-zinc-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={14} className="text-zinc-400 shrink-0" />
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="all">All Functional Modules ({PERMISSION_CATALOG.length})</option>
                {PERMISSION_CATALOG.map((g) => (
                  <option key={g.module} value={g.module}>
                    {g.module}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Module Permission Groups */}
          <div className="space-y-6">
            {filteredModules.length === 0 ? (
              <div className="text-center py-10 text-zinc-400">
                <p className="text-xs font-semibold">No permissions match your filter query</p>
              </div>
            ) : (
              filteredModules.map((group, gIdx) => {
                const isSuper = isSuperAdminRole;
                const groupCodes = group.permissions.map((p) => p.code);
                const hasAll = isSuper || group.isCore || groupCodes.every((c) => selectedPermissions.includes(c));

                return (
                  <div key={gIdx} className="space-y-3">
                    {/* Group Header */}
                    <div
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border ${
                        group.isCore
                          ? 'bg-emerald-50/90 border-emerald-200/90 text-emerald-950'
                          : 'bg-zinc-50 border-zinc-200/60 text-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {group.isCore && (
                          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Lock size={11} />
                          </div>
                        )}
                        <span className="text-xs font-bold tracking-wide">
                          {group.module}
                        </span>
                        {group.isCore && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-300/80 px-2 py-0.5 rounded-full">
                            Default • Locked for All Roles
                          </span>
                        )}
                      </div>

                      {!isSuper && !group.isCore ? (
                        <button
                          type="button"
                          onClick={() => toggleModuleAll(group)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                        >
                          {hasAll ? 'Deselect All' : 'Select All'}
                        </button>
                      ) : group.isCore ? (
                        <span className="text-[11px] text-emerald-700 font-medium hidden sm:inline">
                          Always Granted (Cannot Disable)
                        </span>
                      ) : null}
                    </div>

                    {/* Group Permissions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {group.permissions.map((perm) => {
                        const isCore = isCorePermission(perm.code);
                        const isGranted = isSuper || isCore || selectedPermissions.includes(perm.code);

                        return (
                          <div
                            key={perm.code}
                            onClick={() => !isCore && !isSuper && togglePermission(perm.code)}
                            className={`p-3 rounded-xl border text-xs flex items-start gap-3 transition-colors ${
                              isCore
                                ? 'bg-emerald-50/40 border-emerald-200/80 cursor-not-allowed select-none'
                                : isSuper
                                ? 'bg-zinc-50 border-zinc-200 cursor-not-allowed opacity-90'
                                : isGranted
                                ? 'bg-indigo-50/50 border-indigo-200 cursor-pointer hover:border-indigo-300'
                                : 'bg-white border-zinc-200/80 hover:border-zinc-300 cursor-pointer'
                            }`}
                            title={
                              isCore
                                ? 'Mandatory core system permission — required for all roles and cannot be modified.'
                                : undefined
                            }
                          >
                            <div
                              className={`mt-0.5 shrink-0 ${
                                isCore
                                  ? 'text-emerald-600'
                                  : isGranted
                                  ? 'text-indigo-600'
                                  : 'text-zinc-300'
                              }`}
                            >
                              {isGranted ? <CheckSquare size={16} /> : <Square size={16} />}
                            </div>

                            <div className="space-y-0.5 flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1.5">
                                <p className="font-semibold text-zinc-900">{perm.label}</p>
                                {isCore && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-300/80 px-1.5 py-0.5 rounded shrink-0">
                                    <Lock size={9} /> Required
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-500 leading-tight">
                                {perm.description}
                              </p>
                              <code
                                className={`text-[10px] font-mono block mt-1 ${
                                  isCore ? 'text-emerald-700' : 'text-zinc-400'
                                }`}
                              >
                                {perm.code}
                              </code>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
