'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminFormPage, {
  FormSection,
  inputClass,
  labelClass,
} from '@/components/admin/AdminFormPage';
import { ROUTES } from '@/constants/routes';
import { useAdminCollection } from '@/lib/admin/useAdminCollection';
import {
  ROLES_STORE_KEY,
  DEFAULT_ROLES,
  PERMISSION_CATALOG,
  CORE_PERMISSION_CODES,
  isCorePermission,
  type RoleItem,
  type PermissionGroup,
} from '../_lib/data';
import { CheckSquare, Square, Lock } from 'lucide-react';

const FORM_ID = 'role-create-form';

export default function CreateRolePage() {
  const router = useRouter();
  const { create } = useAdminCollection<RoleItem>(ROLES_STORE_KEY, DEFAULT_ROLES);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    ...CORE_PERMISSION_CODES,
    'store.view',
    'offer.view',
    'post.view',
  ]);

  const togglePermission = (code: string) => {
    if (isCorePermission(code)) return; // Core permissions cannot be unselected
    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleModuleAll = (group: PermissionGroup) => {
    if (group.isCore) return;
    const groupCodes = group.permissions.filter((p) => !p.isLocked && !isCorePermission(p.code)).map((p) => p.code);
    const hasAll = groupCodes.every((c) => selectedPermissions.includes(c));

    if (hasAll) {
      setSelectedPermissions((prev) => prev.filter((c) => !groupCodes.includes(c)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...groupCodes])));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newRole: RoleItem = {
      id: Date.now(),
      name,
      slug,
      description: description || 'Custom operational role',
      isSystem: false,
      usersCount: 0,
      permissions: Array.from(new Set([...selectedPermissions, ...CORE_PERMISSION_CODES])),
    };

    create(newRole);
    router.push(ROUTES.ADMIN.ROLES);
  };

  return (
    <AdminFormPage
      title="Create Custom Operational Role"
      description="Định nghĩa vai trò mới và cấu hình chi tiết phân quyền theo từng nghiệp vụ. Các quyền cơ bản của hệ thống được cấp mặc định và cố định."
      backHref={ROUTES.ADMIN.ROLES}
      backLabel="Back to roles"
      formId={FORM_ID}
      submitLabel="Create Role"
      width="wide"
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Role Information">
          <div className="space-y-1">
            <label className={labelClass}>Role Name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. SEO Campaign Lead"
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this role is authorized to perform..."
              className={`${inputClass} resize-none`}
            />
          </div>
        </FormSection>

        <FormSection
          title="Module Permissions"
          description={`Selected ${selectedPermissions.length} permissions for this role.`}
        >
          <div className="space-y-6">
            {PERMISSION_CATALOG.map((group, idx) => {
              const groupCodes = group.permissions.map((p) => p.code);
              const groupSelectedCount = group.isCore
                ? groupCodes.length
                : groupCodes.filter((c) => selectedPermissions.includes(c)).length;
              const hasAll = groupSelectedCount === groupCodes.length;

              return (
                <div
                  key={idx}
                  className={`border rounded-xl p-4 space-y-3 ${
                    group.isCore
                      ? 'border-emerald-200/90 bg-emerald-50/40'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {group.isCore && (
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <Lock size={11} />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-slate-900">{group.module}</h3>
                          {group.isCore && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-300/80 px-2 py-0.5 rounded-full">
                              Cố định • Bắt buộc mọi Role
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {group.isCore
                            ? 'Quyền bắt buộc để đăng nhập và vận hành tối thiểu'
                            : `${groupSelectedCount} of ${groupCodes.length} active`}
                        </p>
                      </div>
                    </div>

                    {!group.isCore ? (
                      <button
                        type="button"
                        onClick={() => toggleModuleAll(group)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                      >
                        {hasAll ? 'Deselect All' : 'Select All'}
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-700 font-medium hidden sm:inline">
                        Luôn cấp sẵn
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    {group.permissions.map((perm) => {
                      const isCore = isCorePermission(perm.code);
                      const active = isCore || selectedPermissions.includes(perm.code);

                      return (
                        <div
                          key={perm.code}
                          onClick={() => !isCore && togglePermission(perm.code)}
                          className={`p-3 rounded-xl border transition-all flex items-start gap-3 select-none ${
                            isCore
                              ? 'bg-emerald-50/50 border-emerald-200/90 cursor-not-allowed'
                              : active
                              ? 'bg-white border-indigo-300 shadow-2xs cursor-pointer'
                              : 'bg-white/60 border-slate-200 hover:border-slate-300 cursor-pointer'
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
                                : active
                                ? 'text-indigo-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {active ? <CheckSquare size={16} /> : <Square size={16} />}
                          </div>

                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1.5">
                              <p className="text-xs font-bold text-slate-800">{perm.label}</p>
                              {isCore && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded shrink-0">
                                  <Lock size={9} /> Bắt buộc
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 leading-tight">
                              {perm.description}
                            </p>
                            <code
                              className={`text-[10px] font-mono block mt-1 ${
                                isCore ? 'text-emerald-700' : 'text-slate-400'
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
            })}
          </div>
        </FormSection>
      </form>
    </AdminFormPage>
  );
}
