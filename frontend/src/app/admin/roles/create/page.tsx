'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminFormPage, {
  FormSection,
  inputClass,
  labelClass,
} from '@/components/admin/AdminFormPage';
import { ROUTES } from '@/constants/routes';
import { useToast } from '@/context/ToastContext';
import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import {
  PERMISSION_CATALOG,
  CORE_PERMISSION_CODES,
  isCorePermission,
  type RoleItem,
  type PermissionGroup,
} from '../_lib/data';
import { CheckSquare, Square, Lock, AlertCircle } from 'lucide-react';

const FORM_ID = 'role-create-form';

export default function CreateRolePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const payload = {
        name: name.trim(),
        slug,
        description: description.trim() || 'Custom operational role',
        permissions: Array.from(new Set([...selectedPermissions, ...CORE_PERMISSION_CODES])),
      };

      await apiClient.post(API_ENDPOINTS.ADMIN.ROLES, payload);
      toast.success(`Role "${name}" created successfully!`);
      router.push(ROUTES.ADMIN.ROLES);
    } catch (err: any) {
      const respData = err?.response?.data;
      if (respData?.errors && typeof respData.errors === 'object') {
        setErrors(respData.errors);
      }
      toast.error(respData?.message || 'Failed to create role.');
    }
  };

  return (
    <AdminFormPage
      title="Create Custom Operational Role"
      description="Define a new operational role and configure granular module permissions. Core system permissions are granted by default and locked."
      backHref={ROUTES.ADMIN.ROLES}
      backLabel="Back to roles"
      formId={FORM_ID}
      submitLabel="Create Role"
      width="wide"
    >
      <form noValidate id={FORM_ID} onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Role Information">
          <div className="space-y-1">
            <label className={labelClass}>Role Name *</label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. SEO Campaign Lead"
              className={`${inputClass} ${errors.name ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
            />
            {errors.name && (
              <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle size={11} /> {errors.name}
              </p>
            )}
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
                              Locked • Required for All Roles
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {group.isCore
                            ? 'Mandatory baseline permissions required to sign in and operate'
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
                        Always Granted
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
                              ? 'Mandatory core system permission — required for all roles and cannot be modified.'
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
                                  <Lock size={9} /> Required
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
