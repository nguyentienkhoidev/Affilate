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
import { STORES_STORE_KEY, DEFAULT_STORES, type AdminStore } from '../_lib/data';

interface StoreFormState {
  name: string;
  slug: string;
  domain: string;
  logoUrl: string;
  bannerUrl: string;
  category: string;
  network: AdminStore['network'];
  rating: number;
  maxDiscount: string;
  affiliateUrl: string;
  description: string;
  isFeatured: boolean;
  isActive: boolean;
}

const FORM_ID = 'store-form';

export default function StoreForm({ id }: { id?: string }) {
  const { hydrated, getById } = useAdminCollection<AdminStore>(STORES_STORE_KEY, DEFAULT_STORES);
  const isEdit = id !== undefined;
  const existing = getById(id);

  if (isEdit && !hydrated) return <FormLoading />;
  if (isEdit && !existing) return <FormNotFound backHref={ROUTES.ADMIN.STORES} entity="Store" />;

  const initial: StoreFormState = existing
    ? {
      name: existing.name,
      slug: existing.slug,
      domain: existing.domain,
      logoUrl: existing.logoUrl || '',
      bannerUrl: existing.bannerUrl || '',
      category: existing.category,
      network: existing.network,
      rating: existing.rating,
      maxDiscount: existing.maxDiscount,
      affiliateUrl: existing.affiliateUrl,
      description: existing.description,
      isFeatured: existing.isFeatured,
      isActive: existing.isActive,
    }
    : {
      name: '',
      slug: '',
      domain: '',
      logoUrl: '',
      bannerUrl: '',
      category: 'Electronics',
      network: 'partnerboost',
      rating: 4.8,
      maxDiscount: '20%',
      affiliateUrl: 'https://',
      description: '',
      isFeatured: false,
      isActive: true,
    };

  return <StoreFormInner key={id ?? 'new'} existing={existing} initial={initial} />;
}

function StoreFormInner({ existing, initial }: { existing?: AdminStore; initial: StoreFormState }) {
  const router = useRouter();
  const { create, update } = useAdminCollection<AdminStore>(STORES_STORE_KEY, DEFAULT_STORES);
  const [form, setForm] = useState<StoreFormState>(initial);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (existing) {
      update(existing.id, {
        ...form,
        slug: cleanSlug,
      });
    } else {
      create({
        id: `s-${Date.now()}`,
        ...form,
        slug: cleanSlug,
        clicks: 0,
        activeCoupons: 0,
        reviewsCount: 0,
      });
    }
    router.push(ROUTES.ADMIN.STORES);
  };

  return (
    <AdminFormPage
      title={existing ? `Edit Store: ${existing.name}` : 'Add New Merchant Store'}
      description="Configure merchant credentials, logos, affiliate network URLs, and SEO taxonomy."
      backHref={ROUTES.ADMIN.STORES}
      backLabel="Back to stores"
      formId={FORM_ID}
      submitLabel={existing ? 'Save Store' : 'Add Store'}
      width="wide"
    >
      <form id={FORM_ID} onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Column (Left - 2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="Store Identity & Domain">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Store Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Nilight Official"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>URL Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="nilight"
                    className={`${inputClass} font-mono`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Official Domain *</label>
                  <input
                    type="text"
                    required
                    value={form.domain}
                    onChange={(e) => setForm({ ...form, domain: e.target.value })}
                    placeholder="nilight.com"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={inputClass}
                  >
                    <option value="Automotive">Automotive</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Tech & Gear">Tech & Gear</option>
                    <option value="Software & Hosting">Software & Hosting</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Affiliate Tracking URL *</label>
                <input
                  type="url"
                  required
                  value={form.affiliateUrl}
                  onChange={(e) => setForm({ ...form, affiliateUrl: e.target.value })}
                  placeholder="https://www.nilight.com/?ref=bargorya"
                  className={`${inputClass} font-mono`}
                />
              </div>
            </FormSection>

            <FormSection title="Visual Assets">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <ImageUpload
                    value={form.logoUrl}
                    onChange={(url) => setForm({ ...form, logoUrl: url })}
                    folder="store-logos"
                    label="Store Brand Logo *"
                    description="Square logo (PNG or JPG). Recommended 200x200."
                    aspectRatio="square"
                  />
                </div>

                <div className="space-y-1">
                  <ImageUpload
                    value={form.bannerUrl}
                    onChange={(url) => setForm({ ...form, bannerUrl: url })}
                    folder="store-banners"
                    label="Store Banner / Cover (Optional)"
                    description="Wide banner for store coupon landing page."
                    aspectRatio="video"
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Editorial Overview & Description">
              <div className="space-y-1">
                <label className={labelClass}>Store Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short overview of merchant products, warranties, return policies, and shipping..."
                  className={inputClass}
                />
              </div>
            </FormSection>
          </div>

          {/* Sidebar Column (Right - 1 Col) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status & Visibility Card */}
            <FormSection title="Status & Visibility">
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Active Status</span>
                    <span className="text-[11px] text-slate-400">Publicly visible on website</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-[#C62828] focus:ring-[#C62828]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Featured Store</span>
                    <span className="text-[11px] text-slate-400">Pin to top store directory</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-[#C62828] focus:ring-[#C62828]"
                  />
                </label>
              </div>
            </FormSection>

            {/* Network & Performance */}
            <FormSection title="Affiliate Configuration">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className={labelClass}>Affiliate Network</label>
                  <select
                    value={form.network}
                    onChange={(e) => setForm({ ...form, network: e.target.value as AdminStore['network'] })}
                    className={inputClass}
                  >
                    <option value="partnerboost">PartnerBoost</option>
                    <option value="impact">Impact</option>
                    <option value="shareasale">ShareASale</option>
                    <option value="cj">CJ Affiliate</option>
                    <option value="direct">Direct Merchant</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Max Discount Display</label>
                  <input
                    type="text"
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                    placeholder="e.g. 25% Off"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Rating Score (1.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 4.8 })}
                    className={inputClass}
                  />
                </div>
              </div>
            </FormSection>

            {/* Live Preview Card */}
            <FormSection title="Live Card Preview">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    {form.logoUrl ? (
                      <img src={form.logoUrl} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-sm font-black text-slate-400">
                        {form.name ? form.name.charAt(0).toUpperCase() : 'S'}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {form.name || 'Store Name Preview'}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono truncate">
                      {form.domain || 'domain.com'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60">
                  <span className="font-bold text-[#C62828] bg-rose-50 px-2 py-0.5 rounded">
                    Up to {form.maxDiscount || '20% Off'}
                  </span>
                  <span className="text-amber-500 font-bold flex items-center gap-1">
                    ★ {form.rating || 4.8}
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
