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
import { PAGES_STORE_KEY, DEFAULT_PAGES, type StaticPageData } from '../_lib/data';

interface PageFormState {
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  sortOrder: number;
  isActive: boolean;
}

const FORM_ID = 'static-page-form';

export default function PageForm({ id }: { id?: string }) {
  const { items, hydrated, getById } = useAdminCollection<StaticPageData>(PAGES_STORE_KEY, DEFAULT_PAGES);
  const isEdit = id !== undefined;
  const existing = getById(id);

  if (isEdit && !hydrated) return <FormLoading />;
  if (isEdit && !existing) return <FormNotFound backHref={ROUTES.ADMIN.PAGES} entity="Page" />;

  const initial: PageFormState = existing
    ? {
        title: existing.title,
        slug: existing.slug,
        content: existing.content || '',
        metaTitle: existing.metaTitle || `${existing.title} - Bargorya`,
        metaDescription: existing.metaDescription || `Read about ${existing.title} on Bargorya.`,
        sortOrder: existing.sortOrder,
        isActive: existing.isActive,
      }
    : {
        title: '',
        slug: '',
        content: '',
        metaTitle: '',
        metaDescription: '',
        sortOrder: items.length + 1,
        isActive: true,
      };

  return <PageFormInner key={id ?? 'new'} existing={existing} initial={initial} />;
}

function PageFormInner({ existing, initial }: { existing?: StaticPageData; initial: PageFormState }) {
  const router = useRouter();
  const { create, update } = useAdminCollection<StaticPageData>(PAGES_STORE_KEY, DEFAULT_PAGES);
  const [form, setForm] = useState<PageFormState>(initial);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = form.slug.trim() || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (existing) {
      update(existing.id, {
        ...form,
        slug: cleanSlug,
        updatedAt: 'Just now',
      });
    } else {
      create({
        id: Date.now(),
        ...form,
        slug: cleanSlug,
        updatedAt: 'Today',
      });
    }
    router.push(ROUTES.ADMIN.PAGES);
  };

  return (
    <AdminFormPage
      title={existing ? `Edit Page: ${existing.title}` : 'Create Static Page'}
      description="Publish or update legal disclosures, about information, and compliance policy pages."
      backHref={ROUTES.ADMIN.PAGES}
      backLabel="Back to pages"
      formId={FORM_ID}
      submitLabel={existing ? 'Save Page' : 'Publish Page'}
      width="wide"
    >
      <form id={FORM_ID} onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Column (Left - 2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="Page Content & Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Page Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm({
                        ...form,
                        title: val,
                        metaTitle: form.metaTitle || `${val} - Bargorya`,
                      });
                    }}
                    placeholder="e.g. Editorial Guidelines & Policy"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>URL Slug *</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="e.g. editorial-guidelines"
                    className={`${inputClass} font-mono`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>HTML / Markdown Body Content</label>
                <textarea
                  rows={14}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="<h2>Our Editorial Standards</h2><p>Describe your standards...</p>"
                  className={`${inputClass} font-mono text-[11px] leading-relaxed`}
                />
              </div>
            </FormSection>

            <FormSection title="Search Engine Optimization (SEO)">
              <div className="space-y-1">
                <label className={labelClass}>Meta Title</label>
                <input
                  type="text"
                  value={form.metaTitle}
                  onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                  placeholder="e.g. Editorial Guidelines - Bargorya"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Meta Description</label>
                <textarea
                  rows={3}
                  value={form.metaDescription}
                  onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                  placeholder="Brief description for search engines..."
                  className={inputClass}
                />
              </div>
            </FormSection>
          </div>

          {/* Sidebar Column (Right - 1 Col) */}
          <div className="lg:col-span-1 space-y-6">
            <FormSection title="Publishing Status">
              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Published & Active</span>
                    <span className="text-[11px] text-slate-400">Accessible on live site</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-[#C62828] focus:ring-[#C62828]"
                  />
                </label>

                <div className="space-y-1">
                  <label className={labelClass}>Display Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 1 })}
                    className={inputClass}
                  />
                  <span className="text-[11px] text-slate-400">Position in footer / legal list</span>
                </div>
              </div>
            </FormSection>

            {/* Google SERP Preview Card */}
            <FormSection title="Google Search Preview">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                  <span>bargorya.com</span>
                  <span>›</span>
                  <span className="truncate">{form.slug || 'page-slug'}</span>
                </div>
                <h4 className="text-sm font-semibold text-[#1a0dab] hover:underline cursor-pointer truncate">
                  {form.metaTitle || form.title || 'Page Title'}
                </h4>
                <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                  {form.metaDescription || 'Read our official legal disclosure, terms of service, and editorial guidelines on Bargorya...'}
                </p>
              </div>
            </FormSection>
          </div>

        </div>
      </form>
    </AdminFormPage>
  );
}
