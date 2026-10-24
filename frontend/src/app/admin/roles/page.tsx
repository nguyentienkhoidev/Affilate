'use client';

import { useState } from 'react';
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
import { ROUTES } from '@/constants/routes';
import {
  ROLES_STORE_KEY,
  DEFAULT_ROLES,
  PERMISSION_CATALOG,
  CORE_PERMISSION_CODES,
  isCorePermission,
  type RoleItem,
  type PermissionGroup,
} from './_lib/data';
import { usePermission } from '@/lib/admin/usePermission';
import { useAdminCollection } from '@/lib/admin/useAdminCollection';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';

export default function AdminRolesPage() {
  const { hasPermission } = usePermission();
  const { items: roles, setItems, remove } = useAdminCollection<RoleItem>(ROLES_STORE_KEY, DEFAULT_ROLES);

  if (!hasPermission('role.view')) {
    return <UnauthorizedAccess requiredPermission="role.view" moduleName="Roles & RBAC Permission Matrix" />;
  }

  const [selectedRole, setSelectedRole] = useState<RoleItem>(roles[1] ?? roles[0]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(() => {
    const initial = roles[1]?.permissions ?? roles[0]?.permissions ?? [];
    return initial.includes('ALL') ? initial : Array.from(new Set([...initial, ...CORE_PERMISSION_CODES]));
  });
  const [roleSearch, setRoleSearch] = useState('');
  const [permissionSearch, setPermissionSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const activeRole = roles.find((r) => r.id === selectedRole?.id) ?? roles[0];

  const handleSelectRole = (role: RoleItem) => {
    setSelectedRole(role);
    const perms = role.permissions.includes('ALL')
      ? role.permissions
      : Array.from(new Set([...role.permissions, ...CORE_PERMISSION_CODES]));
    setSelectedPermissions(perms);
  };

  const togglePermission = (code: string) => {
    if (activeRole.isSystem) return; // Super Administrator is fully locked
    if (isCorePermission(code)) return; // Core permissions are permanently granted & locked
    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleModuleAll = (group: PermissionGroup) => {
    if (activeRole.isSystem || group.isCore) return;
    const groupCodes = group.permissions.filter((p) => !p.isLocked && !isCorePermission(p.code)).map((p) => p.code);
    const hasAll = groupCodes.every((c) => selectedPermissions.includes(c));

    if (hasAll) {
      setSelectedPermissions((prev) => prev.filter((c) => !groupCodes.includes(c)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...groupCodes])));
    }
  };

  const handleDeleteRole = (id: number) => {
    if (confirm('Delete this operational role? Staff members assigned to it will revert to basic viewer.')) {
      remove(id);
      setSelectedRole(roles[0]);
      setSelectedPermissions(roles[0].permissions);
    }
  };

  const handleSaveMatrix = () => {
    const finalPermissions = activeRole.isSystem
      ? ['ALL']
      : Array.from(new Set([...selectedPermissions, ...CORE_PERMISSION_CODES]));
    setItems((prev) =>
      prev.map((r) =>
        r.id === activeRole.id ? { ...r, permissions: finalPermissions } : r
      )
    );
    setSelectedPermissions(finalPermissions);
    alert(`Đã lưu phân quyền thành công cho vai trò: ${activeRole.name}`);
  };

  // Filter Roles
  const filteredRoles = roles.filter(
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

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            Role-Based Access Control (Dynamic RBAC)
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Thiết lập quyền hạn vận hành cho từng vai trò nhân sự. Các quyền cơ bản của hệ thống được cấp mặc định và cố định cho mọi vai trò.
          </p>
        </div>

        <Link href={ROUTES.ADMIN.ROLE_CREATE}>
          <Button size="sm">
            <Plus size={14} /> Create Custom Role
          </Button>
        </Link>
      </div>

      {/* Main 2-Column RBAC Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Role List Selection */}
        <Card className="lg:col-span-4 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <CardTitle className="text-sm">Configured Roles</CardTitle>
              <CardDescription className="text-xs">Chọn vai trò để quản lý phân quyền</CardDescription>
            </div>
            <Badge variant="outline">{roles.length} Roles</Badge>
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
                      {role.isSystem ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                          <Lock size={10} /> System
                        </span>
                      ) : (
                        <button
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
                      <Users size={12} /> {role.usersCount} Nhân sự
                    </span>
                    <span className="font-mono text-zinc-500 text-[10px]">
                      {role.permissions.includes('ALL') ? 'Toàn quyền (All 45+)' : `${role.permissions.length} actions`}
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
                {activeRole?.isSystem && (
                  <Badge variant="indigo">Full Superuser Authorization</Badge>
                )}
              </div>
              <CardDescription className="text-xs mt-0.5">
                {activeRole?.description}
              </CardDescription>
            </div>

            {!activeRole?.isSystem && (
              <Button onClick={handleSaveMatrix} size="sm">
                <Check size={14} /> Lưu Phân Quyền
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
                const isSuper = activeRole?.isSystem;
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
                            Mặc định • Cố định mọi Role
                          </span>
                        )}
                      </div>

                      {!isSuper && !group.isCore ? (
                        <button
                          onClick={() => toggleModuleAll(group)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                        >
                          {hasAll ? 'Deselect All' : 'Select All'}
                        </button>
                      ) : group.isCore ? (
                        <span className="text-[11px] text-emerald-700 font-medium hidden sm:inline">
                          Luôn cấp sẵn (Không thể tắt)
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
                            onClick={() => !isCore && togglePermission(perm.code)}
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
                                ? 'Quyền cơ bản mặc định của hệ thống — Mọi vai trò đều bắt buộc phải có, không thể chỉnh sửa.'
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
                                    <Lock size={9} /> Bắt buộc
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
