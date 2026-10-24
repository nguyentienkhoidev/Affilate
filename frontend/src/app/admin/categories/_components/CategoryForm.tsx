'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/admin/ImageUpload';
import AdminFormPage, {
  FormLoading,
  FormNotFound,
  FormSection,
  inputClass,
  labelClass,
} from '@/components/admin/AdminFormPage';
import { ROUTES } from '@/constants/routes';
import { useAdminCollection } from '@/lib/admin/useAdminCollection';
import { CATEGORIES_STORE_KEY, DEFAULT_CATEGORIES, type CategoryData } from '../_lib/data';

type CategoryFormState = Pick<CategoryData, 'name' | 'slug' | 'description' | 'sortOrder' | 'isActive'> & {
  imageUrl: string;
};

const FORM_ID = 'category-form';

export default function CategoryForm({ id }: { id?: string }) {
  const { items, hydrated, getById } = useAdminCollection<CategoryData>(CATEGORIES_STORE_KEY, DEFAULT_CATEGORIES);
  const isEdit = id !== undefined;
  const existing = getById(id);

  if (isEdit && !hydrated) return <FormLoading />;
  if (isEdit && !existing) return <FormNotFound backHref={ROUTES.ADMIN.CATEGORIES} entity="Category" />;

  const initial: CategoryFormState = existing
    ? {
        name: existing.name,
        slug: existing.slug,
        description: existing.description,
        sortOrder: existing.sortOrder,
        imageUrl: existing.imageUrl || '',
        isActive: existing.isActive,
      }
    : { name: '', slug: '', description: '', sortOrder: items.length + 1, imageUrl: '', isActive: true };

  return <CategoryFormInner key={id ?? 'new'} existing={existing} initial={initial} />;
}

function CategoryFormInner({ existing, initial }: { existing?: CategoryData; initial: CategoryFormState }) {
  const router = useRouter();
  const { create, update } = useAdminCollection<CategoryData>(CATEGORIES_STORE_KEY, DEFAULT_CATEGORIES);
  const [form, setForm] = useState<CategoryFormState>(initial);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (existing) {
      update(existing.id, { ...form, slug: cleanSlug });
    } else {
      create({ id: Date.now(), articlesCount: 0, ...form, slug: cleanSlug });
    }
    router.push(ROUTES.ADMIN.CATEGORIES);
  };

  return (
    <AdminFormPage
      title={existing ? `Edit Category: ${existing.name}` : 'Create New Category'}
      description="Configure editorial taxonomy shown in client navigation bars and category landing pages."
      backHref={ROUTES.ADMIN.CATEGORIES}
      backLabel="Back to categories"
      formId={FORM_ID}
      submitLabel={existing ? 'Save Category' : 'Create Category'}
      width="wide"
    >
      <form id={FORM_ID} onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Column (Left - 2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="Category Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Category Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Technology & Computing"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>URL Slug *</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="e.g. tech"
                    className={`${inputClass} font-mono`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Summary for category landing page, meta description, and SEO indexing..."
                  className={`${inputClass} resize-none`}
                />
              </div>
            </FormSection>

            <FormSection title="Category Media & Cover">
              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
                folder="categories"
                label="Category Header Banner (Optional)"
                description="Wide cover banner displayed at the top of category landing page."
                aspectRatio="banner"
              />
            </FormSection>
          </div>

          {/* Sidebar Column (Right - 1 Col) */}
          <div className="lg:col-span-1 space-y-6">
            <FormSection title="Display & Taxonomy">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className={labelClass}>Navigation Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 1 })}
                    className={inputClass}
                  />
                  <span className="text-[11px] text-slate-400">Order shown in header nav</span>
                </div>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Category Active</span>
                    <span className="text-[11px] text-slate-400">Visible in navigation bar</span>
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

            {/* Live Category Card Preview */}
            <FormSection title="Category Card Preview">
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-2xs">
                {form.imageUrl ? (
                  <div className="h-28 w-full overflow-hidden bg-slate-200 relative">
                    <img src={form.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-20 w-full bg-linear-to-r from-slate-800 to-slate-900 flex items-center justify-center text-white/40 text-xs font-mono">
                    No banner uploaded
                  </div>
                )}
                <div className="p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">
                      {form.name || 'Category Name'}
                    </h4>
                    <span className="text-[10px] font-mono font-semibold bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">
                      /{form.slug || 'slug'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {form.description || 'Category overview description...'}
                  </p>
                </div>
              </div>
            </FormSection>
          </div>

        </div>
      </form>
    </AdminFormPage>
  );
}
