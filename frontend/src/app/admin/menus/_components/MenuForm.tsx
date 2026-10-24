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
import { MENUS_STORE_KEY, DEFAULT_MENUS, type MenuItem } from '../_lib/data';

type MenuFormState = Omit<MenuItem, 'id'>;

const FORM_ID = 'menu-form';

export default function MenuForm({ id }: { id?: string }) {
  const { items, hydrated, getById } = useAdminCollection<MenuItem>(MENUS_STORE_KEY, DEFAULT_MENUS);
  const isEdit = id !== undefined;
  const existing = getById(id);

  if (isEdit && !hydrated) return <FormLoading />;
  if (isEdit && !existing) return <FormNotFound backHref={ROUTES.ADMIN.MENUS} entity="Menu item" />;

  const initial: MenuFormState = existing
    ? {
        title: existing.title,
        position: existing.position,
        targetType: existing.targetType,
        targetValue: existing.targetValue,
        sortOrder: existing.sortOrder,
        isActive: existing.isActive,
      }
    : {
        title: '',
        position: 'main',
        targetType: 'url',
        targetValue: '',
        sortOrder: items.length + 1,
        isActive: true,
      };

  return <MenuFormInner key={id ?? 'new'} existing={existing} initial={initial} />;
}

function MenuFormInner({ existing, initial }: { existing?: MenuItem; initial: MenuFormState }) {
  const router = useRouter();
  const { create, update } = useAdminCollection<MenuItem>(MENUS_STORE_KEY, DEFAULT_MENUS);
  const [form, setForm] = useState<MenuFormState>(initial);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (existing) {
      update(existing.id, form);
    } else {
      create({ id: Date.now(), ...form });
    }
    router.push(ROUTES.ADMIN.MENUS);
  };

  return (
    <AdminFormPage
      title={existing ? `Edit Menu Item: ${existing.title}` : 'Add Menu Item'}
      description="Configure navigation link label, location, and destination URL."
      backHref={ROUTES.ADMIN.MENUS}
      backLabel="Back to menus"
      formId={FORM_ID}
      submitLabel={existing ? 'Save Menu Item' : 'Add Menu Item'}
      width="wide"
    >
      <form id={FORM_ID} onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Column (Left - 2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="Menu Item Configuration">
              <div className="space-y-1">
                <label className={labelClass}>Menu Label / Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Stores, Top Deals, About Us"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Target Link Type</label>
                  <select
                    value={form.targetType}
                    onChange={(e) => setForm({ ...form, targetType: e.target.value as MenuItem['targetType'] })}
                    className={inputClass}
                  >
                    <option value="url">Custom URL Path</option>
                    <option value="page">Static CMS Page</option>
                    <option value="category">Category Landing</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Destination Target *</label>
                  <input
                    type="text"
                    required
                    value={form.targetValue}
                    onChange={(e) => setForm({ ...form, targetValue: e.target.value })}
                    placeholder="e.g. /stores, /about-us, or https://..."
                    className={`${inputClass} font-mono`}
                  />
                </div>
              </div>
            </FormSection>
          </div>

          {/* Sidebar Column (Right - 1 Col) */}
          <div className="lg:col-span-1 space-y-6">
            <FormSection title="Placement & Priority">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className={labelClass}>Navigation Bar Position</label>
                  <select
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value as MenuItem['position'] })}
                    className={inputClass}
                  >
                    <option value="main">Header Main Nav</option>
                    <option value="footer">Footer Sitemap</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Display Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 1 })}
                    className={inputClass}
                  />
                  <span className="text-[11px] text-slate-400">Lower numbers appear first</span>
                </div>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Link Active</span>
                    <span className="text-[11px] text-slate-400">Render in public menu</span>
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

            {/* Menu Preview */}
            <FormSection title="Live Preview">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {form.position === 'main' ? 'Header Navigation Link' : 'Footer Sitemap Link'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold text-slate-900 rounded-lg shadow-2xs">
                    {form.title || 'Menu Label'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono truncate">
                    → {form.targetValue || '/path'}
                  </span>
                </div>
              </div>
            </FormSection>
          </div>

        </div>
      </form>
    </AdminFormPage>
  );
}
