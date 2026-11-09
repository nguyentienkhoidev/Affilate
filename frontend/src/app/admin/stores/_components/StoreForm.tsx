'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/admin/ImageUpload';
import TagInput from '@/components/admin/TagInput';
import AdminFormPage, {
  FormLoading,
  FormNotFound,
  FormSection,
  inputClass,
  labelClass,
} from '@/components/admin/AdminFormPage';
import { ROUTES } from '@/constants/routes';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { apiClient } from '@/lib/api/axios-client';
import storeService from '@/services/storeService';
import { type AdminStore } from '../_lib/data';
import { useToast } from '@/context/ToastContext';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { 
  Eye, 
  Edit2, 
  Monitor, 
  Tablet, 
  Smartphone, 
  ExternalLink, 
  Star, 
  CheckCircle2,
  Plus,
  Trash2,
  HelpCircle,
  Tag,
  ShieldCheck,
  Clock,
  Users,
  Sparkles,
  ChevronDown,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface StoreFormState {
  name: string;
  slug: string;
  domain: string;
  logoUrl: string;
  bannerUrl: string;
  categoryId?: number;
  category: string;
  rating: number;
  reviewsCount?: number;
  maxDiscount: string;
  affiliateUrl: string;
  shortDescription?: string;
  description: string;
  popularSearchesText?: string;
  faqs: Array<{ question: string; answer: string }>;
  isFeatured: boolean;
  isActive: boolean;
  tags?: string[];
}

const FORM_ID = 'store-form';

export default function StoreForm({ id }: { id?: string }) {
  const isEdit = id !== undefined;
  const [storeData, setStoreData] = useState<AdminStore | null>(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit || !id) return;
    let isMounted = true;
    storeService.getAdminStoreById(id)
      .then((data) => {
        if (!isMounted) return;
        if (data && data.name) {
          const mapped: AdminStore = {
            id: String(data.id),
            name: data.name,
            slug: data.slug,
            domain: data.afWebsite
              ? data.afWebsite.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').replace(/^www\./i, '')
              : `${data.slug}.com`,
            logoUrl: data.logo || '',
            bannerUrl: data.socialCardImage || '',
            categoryId: data.categoryId ? Number(data.categoryId) : undefined,
            category: data.categoryName || 'General',
            rating: Number(data.ratingScore ?? 4.8),
            reviewsCount: Number(data.ratingCount ?? 0),
            activeCoupons: 0,
            maxDiscount: data.maxOffer ? `Up to ${data.maxOffer}% OFF` : '20%',
            affiliateUrl: data.afWebsite || `/go/${data.slug}`,
            description: data.aboutStore || '',
            shortDescription: data.socialDescription || '',
            popularSearches: data.popularSearches || [],
            faqs: data.faqs || [],
            isFeatured: Boolean(data.isFeatured),
            isActive: data.isActive !== false,
            clicks: Number(data.afVisitCount ?? 0),
            tags: Array.isArray(data.tags) ? data.tags : [],
          };
          setStoreData(mapped);
        }
      })
      .catch((err) => {
        console.error('Failed to load store detail from backend:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, isEdit]);

  if (isEdit && loading) return <FormLoading />;
  if (isEdit && !storeData && !loading) return <FormNotFound backHref={ROUTES.ADMIN.STORES} entity="Store" />;

  const initial: StoreFormState = storeData
    ? {
      name: storeData.name,
      slug: storeData.slug,
      domain: storeData.domain,
      logoUrl: storeData.logoUrl || '',
      bannerUrl: storeData.bannerUrl || '',
      categoryId: storeData.categoryId,
      category: storeData.category,
      rating: storeData.rating,
      reviewsCount: storeData.reviewsCount,
      maxDiscount: storeData.maxDiscount,
      affiliateUrl: storeData.affiliateUrl,
      shortDescription: storeData.shortDescription || '',
      description: storeData.description,
      popularSearchesText: storeData.popularSearches ? storeData.popularSearches.join(', ') : '',
      faqs: storeData.faqs || [],
      isFeatured: storeData.isFeatured,
      isActive: storeData.isActive,
      tags: storeData.tags || [],
    }
    : {
      name: '',
      slug: '',
      domain: '',
      logoUrl: '',
      bannerUrl: '',
      category: 'Technology & Gear',
      rating: 4.8,
      reviewsCount: 0,
      maxDiscount: '20%',
      affiliateUrl: 'https://',
      shortDescription: '',
      description: '',
      popularSearchesText: '',
      faqs: [],
      isFeatured: false,
      isActive: true,
      tags: [],
    };

  return <StoreFormInner key={storeData?.id ?? 'new'} id={id} existing={storeData ?? undefined} initial={initial} />;
}

function StoreFormInner({ id, existing, initial }: { id?: string; existing?: AdminStore; initial: StoreFormState }) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<StoreFormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([
    { id: 1, name: 'Automotive & Accessories' },
    { id: 2, name: 'Electronics & Gadgets' },
    { id: 3, name: 'Gaming & Collectibles' },
    { id: 4, name: 'Home & Garden' },
    { id: 5, name: 'Hosting & Software' },
    { id: 6, name: 'Technology & Gear' },
    { id: 7, name: 'Business & Economy' },
    { id: 8, name: 'Entertainment & Culture' },
    { id: 9, name: 'US Politics & Global' },
    { id: 10, name: 'Product Reviews' },
    { id: 11, name: 'Lifestyle & Living' },
  ]);

  const loadCategoriesOnDemand = async () => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.ADMIN.CATEGORIES, { params: { size: 100 } });
      const list = res.data?.data?.content || res.data?.data;
      if (Array.isArray(list) && list.length > 0) {
        setCategories(list.map((c: any) => ({ id: Number(c.id), name: String(c.name) })));
      }
    } catch {}
  };

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const handleAddFaq = () => {
    setForm((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }],
    }));
  };

  const handleUpdateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    setForm((prev) => {
      const updated = [...prev.faqs];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, faqs: updated };
    });
  };

  const handleRemoveFaq = (index: number) => {
    setForm((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const cleanSlug = form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const popularSearches = form.popularSearchesText
      ? form.popularSearchesText
          .split(/[\n,]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    const maxOfferNum = parseInt(form.maxDiscount.replace(/[^0-9]/g, ''), 10) || 50;
    
    let finalCategoryId = form.categoryId;
    if (!finalCategoryId && form.category) {
      const matched = categories.find((c) => c.name.toLowerCase() === form.category.toLowerCase());
      if (matched) finalCategoryId = matched.id;
    }

    const backendPayload = {
      name: form.name.trim(),
      slug: cleanSlug,
      categoryId: finalCategoryId || null,
      logo: form.logoUrl || null,
      socialCardImage: form.bannerUrl || null,
      socialDescription: form.shortDescription || null,
      aboutStore: form.description || null,
      afWebsite: form.affiliateUrl || null,
      maxOffer: maxOfferNum,
      ratingScore: form.rating,
      ratingCount: form.reviewsCount ?? (existing?.reviewsCount ?? 0),
      isActive: form.isActive,
      isSearchable: true,
      isFeatured: form.isFeatured,
      popularSearches: popularSearches || [],
      faqs: form.faqs.filter((f) => f.question.trim() || f.answer.trim()),
      tags: form.tags || [],
    };

    const localPayload = {
      ...form,
      slug: cleanSlug,
      categoryId: finalCategoryId,
      popularSearches,
      faqs: form.faqs.filter((f) => f.question.trim() || f.answer.trim()),
    };

    try {
      const targetId = existing?.id || id;
      if (existing && targetId) {
        const res = await apiClient.put(API_ENDPOINTS.ADMIN.STORE_DETAIL(targetId), backendPayload);
        toast.success(res.data?.message || `Updated store "${form.name}" successfully!`);
      } else {
        const res = await apiClient.post(API_ENDPOINTS.ADMIN.STORES, backendPayload);
        toast.success(res.data?.message || `Created store "${form.name}" successfully!`);
      }
      router.push(ROUTES.ADMIN.STORES);
    } catch (err: any) {
      if (err?.response?.data?.errors && typeof err.response.data.errors === 'object') {
        setErrors(err.response.data.errors);
      }
      const msg = err?.response?.data?.message || err?.message || 'Failed to save store.';
      toast.error(msg);
    }
  };

  const headerActions = (
    <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-xl text-xs font-bold mr-2">
      <button
        type="button"
        onClick={() => setActiveTab('edit')}
        className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
          activeTab === 'edit'
            ? 'bg-white text-slate-900 shadow-2xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Edit2 size={13} />
        <span>Editor</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('preview')}
        className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
          activeTab === 'preview'
            ? 'bg-[#C62828] text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Eye size={13} />
        <span>Live Preview</span>
      </button>
    </div>
  );

  return (
    <AdminFormPage
      title={existing ? `Edit Store: ${existing.name}` : 'Add New Merchant Store'}
      description="Configure merchant credentials, logos, referral URLs, and SEO taxonomy."
      backHref={ROUTES.ADMIN.STORES}
      backLabel="Back to stores"
      formId={FORM_ID}
      submitLabel={existing ? 'Save Store' : 'Add Store'}
      headerActions={headerActions}
      width="full"
    >
      {activeTab === 'edit' ? (
        <form noValidate id={FORM_ID} onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Column (Left - 2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="Store Identity & Domain">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Store Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                    }}
                    placeholder="e.g. Nilight Official"
                    className={`${inputClass} ${errors.name ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>URL Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => {
                      setForm({ ...form, slug: e.target.value });
                      if (errors.slug) setErrors((prev) => ({ ...prev, slug: '' }));
                    }}
                    placeholder="nilight"
                    className={`${inputClass} font-mono ${errors.slug ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                  />
                  {errors.slug && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.slug}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Official Domain *</label>
                  <input
                    type="text"
                    value={form.domain}
                    onChange={(e) => {
                      setForm({ ...form, domain: e.target.value });
                      if (errors.domain) setErrors((prev) => ({ ...prev, domain: '' }));
                    }}
                    placeholder="nilight.com"
                    className={`${inputClass} ${errors.domain ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                  />
                  {errors.domain && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.domain}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Category</label>
                  <select
                    value={form.categoryId ?? (categories.find(c => c.name.toLowerCase() === form.category.toLowerCase())?.id || '')}
                    onFocus={loadCategoriesOnDemand}
                    onClick={loadCategoriesOnDemand}
                    onChange={(e) => {
                      const val = e.target.value;
                      const catId = val ? Number(val) : undefined;
                      const matched = categories.find((c) => c.id === catId);
                      setForm({
                        ...form,
                        categoryId: catId,
                        category: matched ? matched.name : form.category,
                      });
                    }}
                    className={inputClass}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Affiliate Tracking URL *</label>
                <input
                  type="url"
                  value={form.affiliateUrl}
                  onChange={(e) => {
                    setForm({ ...form, affiliateUrl: e.target.value });
                    if (errors.affiliateUrl) setErrors((prev) => ({ ...prev, affiliateUrl: '' }));
                  }}
                  placeholder="https://www.nilight.com/?ref=heygoodly"
                  className={`${inputClass} font-mono ${errors.affiliateUrl ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                />
                {errors.affiliateUrl && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.affiliateUrl}
                  </p>
                )}
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

            <FormSection
              title="Store Taxonomy & Tags"
              description="Connect this store to centralized tags (e.g. #tech, #apple, #deals) for unified discovery across editorial reviews and coupon alerts."
            >
              <TagInput
                tags={form.tags || []}
                onChange={(newTags) => setForm({ ...form, tags: newTags })}
                label="Store Tags"
                placeholder="Type tag name and press Enter (e.g., tech, accessories, anker...)"
                helperText="These tags link this merchant with reviews, offers, and topic pages across the portal."
              />
            </FormSection>

            <FormSection
              title="Store Short Summary"
              description="Concise summary paragraph (clamped to 2–3 lines on client) displayed right above the 'Get Coupon Alerts' button."
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Short Summary (2–3 Lines)</label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {(form.shortDescription || '').length} chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={form.shortDescription || ''}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  placeholder="e.g. Leading tech accessories and GaN charging station brand. Browse active 15% - 40% off promo codes updated daily..."
                  className={`${inputClass} resize-y leading-relaxed text-xs`}
                />
                <p className="text-[11px] text-slate-500">
                  💡 Tip: Enter 2–3 concise sentences so shoppers quickly grasp the brand highlights. Clamped to 3 lines on the client store page.
                </p>
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

            {/* Performance & Outbound Links */}
            <FormSection title="Affiliate Configuration">
              <div className="space-y-4">
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

        {/* Full-Width 100% Sections: Word Studio Editor, Popular Searches, FAQs */}
        <div className="w-full space-y-6">
          {/* Word Studio Editor */}
          <FormSection
            title="Editorial Overview & Description"
            description="Compose the brand overview and promo code redemption guide in Word Studio (100% Full-Width Canvas)"
            headerRight={
              <span className="text-[11px] font-bold text-[#2b579a] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2b579a] animate-pulse"></span>
                <span>Word Studio 100%</span>
              </span>
            }
          >
            <RichTextEditor
              value={form.description}
              onChange={(html) => setForm({ ...form, description: html })}
              minHeight="450px"
              initialPaperView={false}
              placeholder="Enter refund policies, shipping thresholds, and coupon stacking tips for this store..."
            />
          </FormSection>

          {/* Popular Searches Config Section (100% Full Width) */}
          <FormSection
            title="Popular Searches Pills"
            description="Quick-search keyword pills displayed above the store review section for SEO and shopper convenience."
          >
            <div className="space-y-3">
              <div className="space-y-1">
                <label className={labelClass}>Search Keywords (Comma- or newline-separated)</label>
                <textarea
                  rows={3}
                  value={form.popularSearchesText || ''}
                  onChange={(e) => setForm({ ...form, popularSearchesText: e.target.value })}
                  placeholder="e.g. Anker coupon code, Anker promo code, Anker discounts, Anker free shipping, Anker sale 20% off"
                  className={`${inputClass} resize-y text-xs leading-relaxed`}
                />
                <p className="text-[11px] text-slate-500">
                  💡 Leave blank to automatically generate 7 standard search keywords based on the store name ({form.name || 'Store'}).
                </p>
              </div>

              {/* Live Preview of Tag Pills */}
              {form.popularSearchesText && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">Tag Pills Preview:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {form.popularSearchesText
                      .split(/[\n,]+/)
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-full text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </FormSection>

          {/* Store FAQs Config Section (100% Full Width) */}
          <FormSection
            title="Store FAQs & Schema Q&A"
            description="Configure frequently asked questions and answers displayed at the bottom of the store page."
            headerRight={
              <button
                type="button"
                onClick={handleAddFaq}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1 cursor-pointer transition"
              >
                <Plus size={13} />
                <span>Add FAQ</span>
              </button>
            }
          >
            <div className="space-y-3">
              {form.faqs.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 text-center space-y-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                    <HelpCircle size={16} />
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    No custom FAQs added for this store yet.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    The store page automatically displays 5 default FAQs (how to redeem codes, return policy, coupon stacking, free shipping). Click below to add custom questions.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200/80 transition cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add First Question</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {form.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 relative group hover:border-slate-300 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center">
                            Q{idx + 1}
                          </span>
                          <span>Question #{idx + 1}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                          title="Remove FAQ"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Question *</label>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => handleUpdateFaq(idx, 'question', e.target.value)}
                          placeholder={`e.g. How do I apply a ${form.name || 'Store'} promo code at checkout?`}
                          className={`${inputClass} text-xs`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Answer *</label>
                        <textarea
                          rows={2}
                          value={faq.answer}
                          onChange={(e) => handleUpdateFaq(idx, 'answer', e.target.value)}
                          placeholder="Enter a helpful answer for shoppers..."
                          className={`${inputClass} text-xs resize-y leading-relaxed`}
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="w-full py-2 rounded-xl border border-dashed border-slate-300 text-xs font-bold text-slate-600 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/40 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Another Question</span>
                  </button>
                </div>
              )}
            </div>
          </FormSection>
        </div>
      </form>
      ) : (
        /* LIVE CLIENT STORE PAGE PREVIEW VIEW */
        <div className="space-y-6 animate-fadeIn">
          {/* Preview Toolbar with Device Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-[#C62828]">
                <Eye size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Client Store Landing Page Preview</h3>
                <p className="text-[11px] text-slate-400">URL: https://heygoodly.com/stores/{form.slug || 'store-name'}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  previewDevice === 'desktop' ? 'bg-[#C62828] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor size={13} />
                <span>Desktop (1000px)</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('tablet')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  previewDevice === 'tablet' ? 'bg-[#C62828] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tablet size={13} />
                <span>Tablet (768px)</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  previewDevice === 'mobile' ? 'bg-[#C62828] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone size={13} />
                <span>Mobile (375px)</span>
              </button>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="flex justify-center items-start overflow-x-auto py-2">
            <div
              className={`transition-all duration-300 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden ${
                previewDevice === 'desktop'
                  ? 'w-full max-w-[1000px]'
                  : previewDevice === 'tablet'
                  ? 'w-[768px]'
                  : 'w-[375px] border-4 border-slate-800'
              }`}
            >
              {/* Browser mockup header */}
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                </div>
                <div className="flex-1 bg-white border border-slate-200 rounded px-2.5 py-0.5 text-[11px] text-slate-500 font-mono truncate">
                  https://heygoodly.com/stores/{form.slug || 'store-name'}
                </div>
              </div>

              {/* Store Header Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 p-6 sm:p-8 text-white relative">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-white p-2 shadow-lg flex items-center justify-center shrink-0 border border-slate-200">
                    {form.logoUrl ? (
                      <img src={form.logoUrl} alt={form.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-2xl font-black text-slate-400">{form.name?.[0] || 'S'}</span>
                    )}
                  </div>
                  <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-black text-white">{form.name || 'Store Name Preview'}</h1>
                    </div>
                    <p className="text-xs text-slate-300 flex items-center justify-center sm:justify-start gap-3">
                      <span>Website: <strong className="text-white font-mono">{form.domain || 'domain.com'}</strong></span>
                      <span>•</span>
                      <span>Category: <strong className="text-white">{form.category}</strong></span>
                      <span>•</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1">★ {form.rating || 4.8} / 5.0</span>
                    </p>
                    {form.shortDescription && (
                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed pt-1 max-w-xl">
                        {form.shortDescription}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 pt-2 sm:pt-0">
                    <a
                      href={form.affiliateUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
                    >
                      <span>Visit Store &amp; Claim Deals</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Store Body & Full-Width 100% Sections Preview */}
              <div className="p-6 sm:p-8 space-y-6 bg-slate-50/50">
                
                {/* 1. Trust Value Props Bar */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    <div className="flex items-center gap-2.5 pt-1 md:pt-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold text-slate-900 leading-tight">Hand-Tested</h5>
                        <p className="text-[10px] text-slate-400">Tested at checkout</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 pt-1 md:pt-0 md:pl-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                        <Clock size={16} />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold text-slate-900 leading-tight">Updated Daily</h5>
                        <p className="text-[10px] text-slate-400">Fresh deals every day</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 pt-1 md:pt-0 md:pl-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                        <Tag size={16} />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold text-slate-900 leading-tight">Save up to {form.maxDiscount || '70%'}</h5>
                        <p className="text-[10px] text-slate-400">Exclusive brand codes</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 pt-1 md:pt-0 md:pl-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                        <Users size={16} />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold text-slate-900 leading-tight">Shopper Trusted</h5>
                        <p className="text-[10px] text-slate-400">Thousands of happy savers</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Popular Searches Preview */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2.5">
                  <h4 className="text-xs font-black text-slate-900">
                    Popular Searches Related to {form.name || 'Store'} Coupons
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(form.popularSearchesText
                      ? form.popularSearchesText.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)
                      : [
                          `${form.name || 'Store'} coupon code`,
                          `${form.name || 'Store'} promo code`,
                          `${form.name || 'Store'} discounts`,
                          `${form.name || 'Store'} free shipping`,
                          `${form.name || 'Store'} sale`,
                          `${form.name || 'Store'} 20% off`,
                        ]
                    ).map((q, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50/70 border border-emerald-200"
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. Editorial Description from Word Studio */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
                  <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
                    About {form.name || 'Store'}
                  </h2>
                  <div
                    className="prose prose-slate max-w-none text-xs text-slate-700 leading-relaxed font-sans"
                    dangerouslySetInnerHTML={{
                      __html: form.description || '<p class="text-slate-400 italic">Store editorial overview is being drafted in Word Studio...</p>',
                    }}
                  />
                </div>

                {/* 5. FAQs Preview */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2">
                    <HelpCircle size={16} className="text-emerald-600" />
                    <h3 className="font-black text-sm text-slate-900">
                      Frequently Asked Questions (FAQ) About {form.name || 'Store'}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {(form.faqs.length > 0
                      ? form.faqs
                      : [
                          {
                            question: `How do I apply a ${form.name || 'Store'} promo code?`,
                            answer: `Click 'Get Code' on HeyGoodly to copy the code and open the official ${form.name || 'Store'} website, then paste it into the Promo Code box at checkout.`,
                          },
                          {
                            question: `Can I stack multiple promo codes at ${form.name || 'Store'}?`,
                            answer: `Typically only one promo code can be applied per order, though it can often be combined with sitewide free shipping promotions.`,
                          },
                        ]
                    ).map((faq, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-1">
                        <p className="text-xs font-bold text-slate-900">❓ {faq.question}</p>
                        <p className="text-[11px] text-slate-600 leading-relaxed pl-4">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </AdminFormPage>
  );
}
