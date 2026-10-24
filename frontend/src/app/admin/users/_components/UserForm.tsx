'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminFormPage, {
  FormLoading,
  FormNotFound,
  FormSection,
  inputClass,
  labelClass,
} from '@/components/admin/AdminFormPage';
import { ROUTES } from '@/constants/routes';
import { useAdminCollection } from '@/lib/admin/useAdminCollection';
import { USERS_STORE_KEY, DEFAULT_USERS, type UserData } from '../_lib/data';

interface UserFormState {
  fullName: string;
  email: string;
  password?: string;
  role: string;
  isActive: boolean;
}

const FORM_ID = 'user-form';

export default function UserForm({ id }: { id?: string }) {
  const { hydrated, getById } = useAdminCollection<UserData>(USERS_STORE_KEY, DEFAULT_USERS);
  const isEdit = id !== undefined;
  const existing = getById(id);

  if (isEdit && !hydrated) return <FormLoading />;
  if (isEdit && !existing) return <FormNotFound backHref={ROUTES.ADMIN.USERS} entity="User" />;

  const initial: UserFormState = existing
    ? {
        fullName: existing.fullName,
        email: existing.email,
        password: '',
        role: existing.role,
        isActive: existing.isActive,
      }
    : {
        fullName: '',
        email: '',
        password: '',
        role: 'Staff Editor',
        isActive: true,
      };

  return <UserFormInner key={id ?? 'new'} existing={existing} initial={initial} />;
}

function UserFormInner({ existing, initial }: { existing?: UserData; initial: UserFormState }) {
  const router = useRouter();
  const { create, update } = useAdminCollection<UserData>(USERS_STORE_KEY, DEFAULT_USERS);
  const [form, setForm] = useState<UserFormState>(initial);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (existing) {
      update(existing.id, {
        fullName: form.fullName,
        email: form.email,
        role: form.role,
        isActive: form.isActive,
      });
    } else {
      create({
        id: Date.now(),
        fullName: form.fullName,
        email: form.email,
        role: form.role,
        isSuperAdmin: false,
        isActive: form.isActive,
        twoFactorEnabled: false,
        createdAt: 'Today',
      });
    }
    router.push(ROUTES.ADMIN.USERS);
  };

  return (
    <AdminFormPage
      title={existing ? `Edit Staff Account: ${existing.fullName}` : 'Create Staff User'}
      description="Manage administrative users, access credentials, and granular RBAC permission roles."
      backHref={ROUTES.ADMIN.USERS}
      backLabel="Back to staff accounts"
      formId={FORM_ID}
      submitLabel={existing ? 'Save User' : 'Create User'}
      width="wide"
    >
      <form id={FORM_ID} onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Column (Left - 2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="Account Identity">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="e.g. Elena Croft"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="elena@bargorya.com"
                    className={inputClass}
                  />
                </div>
              </div>

              {!existing ? (
                <div className="space-y-1">
                  <label className={labelClass}>Initial Temporary Password *</label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimum 8 characters with numbers and symbols"
                    className={inputClass}
                  />
                  <p className="text-[11px] text-slate-400">
                    User will be prompted to set a permanent password and enroll in 2FA upon first sign-in.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                  <span className="font-bold text-slate-800">Password & Security</span>
                  <p className="text-slate-500 text-[11px]">
                    To reset this user&apos;s password or emergency 2FA authenticator, use the security action on the staff accounts list table.
                  </p>
                </div>
              )}
            </FormSection>
          </div>

          {/* Sidebar Column (Right - 1 Col) */}
          <div className="lg:col-span-1 space-y-6">
            <FormSection title="Role & Permissions">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className={labelClass}>Assigned Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className={inputClass}
                  >
                    <option value="Administrator">Administrator (Full Access)</option>
                    <option value="Staff Editor">Staff Editor (CMS & Stores)</option>
                    <option value="Affiliate Manager">Affiliate Manager (Deals & Offers)</option>
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
              </div>
            </FormSection>

            {/* Quick Role Summary Card */}
            <FormSection title="Privilege Scope">
              <div className="text-xs space-y-2 text-slate-600">
                <div className="font-bold text-slate-800">
                  {form.role === 'Administrator' && '👑 Full Superuser Access'}
                  {form.role === 'Staff Editor' && '✍️ Editorial & Content CMS'}
                  {form.role === 'Affiliate Manager' && '🏷️ Merchant Deals & Affiliates'}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {form.role === 'Administrator' &&
                    'Can configure system settings, add/remove staff accounts, manage RBAC matrix, and publish all content.'}
                  {form.role === 'Staff Editor' &&
                    'Can write, edit, and publish articles, reviews, manage store directory profiles and coupons.'}
                  {form.role === 'Affiliate Manager' &&
                    'Can manage merchant partnerships, verify coupon voucher codes, update affiliate tracking links.'}
                </p>
              </div>
            </FormSection>
          </div>

        </div>
      </form>
    </AdminFormPage>
  );
}
