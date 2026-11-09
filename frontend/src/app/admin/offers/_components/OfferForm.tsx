'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import AdminFormPage, {
  FormLoading,
  FormNotFound,
  FormSection,
  inputClass,
  labelClass,
} from '@/components/admin/AdminFormPage';
import ImageUpload from '@/components/admin/ImageUpload';
import TagInput from '@/components/admin/TagInput';
import { ROUTES } from '@/constants/routes';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { apiClient } from '@/lib/api/axios-client';
import { offerService, type AdminOfferPayload } from '@/services/offerService';
import { type OfferItem } from '../_lib/data';
import { useToast } from '@/context/ToastContext';

interface OfferFormState {
  storeId?: number;
  storeName: string;
  offerType: 'coupon' | 'deal';
  title: string;
  couponCode: string;
  discountAmount: string;
  discountUnit: 'percentage' | 'fixed';
  destinationUrl: string;
  isExclusive: boolean;
  isActive: boolean;
  isVerified: boolean;
  terms: string;
  imageUrl: string;
  tags?: string[];
}

const FORM_ID = 'offer-form';

export default function OfferForm({ id }: { id?: string }) {
  return (
    <Suspense fallback={<FormLoading />}>
      <OfferFormContent id={id} />
    </Suspense>
  );
}

function OfferFormContent({ id }: { id?: string }) {
  const searchParams = useSearchParams();
  const storeParam = searchParams.get('store');
  const isEdit = id !== undefined;

  const [offerData, setOfferData] = useState<OfferItem | null>(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit || !id) return;
    let mounted = true;

    offerService.getAdminOfferById(id)
      .then((data) => {
        if (!mounted) return;
        if (data && data.name) {
          const discountStr = data.discountValue || '15% Off';

          const mapped: OfferItem = {
            id: Number(data.id),
            storeId: Number(data.storeId),
            storeName: data.storeName || 'Merchant Partner',
            storeSlug: data.storeSlug || '',
            title: data.name,
            discount: discountStr,
            couponCode: data.code || null,
            offerType: data.code ? 'coupon' : 'deal',
            isExclusive: false,
            isActive: data.isActive !== false,
            isVerified: Boolean(data.isVerified),
            usesCount: 0,
            destinationUrl: data.urlRef || `/out/${data.id}`,
            terms: data.description || 'Valid on regular priced items.',
            imageUrl: data.image || (data as any).imageUrl || undefined,
            tags: Array.isArray(data.tags) ? data.tags : [],
          };
          setOfferData(mapped);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch offer detail from backend:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  if (isEdit && loading) return <FormLoading />;
  if (isEdit && !offerData && !loading) return <FormNotFound backHref={ROUTES.ADMIN.OFFERS} entity="Offer" />;

  const initial: OfferFormState = offerData
    ? {
        storeId: offerData.storeId,
        storeName: offerData.storeName,
        offerType: offerData.offerType,
        title: offerData.title,
        couponCode: offerData.couponCode || '',
        discountAmount: offerData.discount.replace(/[^0-9.]/g, '') || '10',
        discountUnit: offerData.discount.includes('%') ? 'percentage' : 'fixed',
        destinationUrl: offerData.destinationUrl || `https://${offerData.storeSlug || 'store'}.com/?ref=heygoodly`,
        isExclusive: offerData.isExclusive,
        isActive: offerData.isActive,
        isVerified: Boolean(offerData.isVerified),
        terms: offerData.terms || 'Valid on regular priced items.',
        imageUrl: offerData.imageUrl || '',
        tags: offerData.tags || [],
      }
    : {
        storeId: undefined,
        storeName: storeParam || '',
        offerType: 'coupon',
        title: '',
        couponCode: '',
        discountAmount: '15',
        discountUnit: 'percentage',
        destinationUrl: 'https://',
        isExclusive: false,
        isActive: true,
        isVerified: false,
        terms: 'Valid on regular priced items.',
        imageUrl: '',
        tags: [],
      };

  return <OfferFormInner key={offerData?.id ?? 'new'} id={id} existing={offerData ?? undefined} initial={initial} />;
}

function OfferFormInner({ id, existing, initial }: { id?: string; existing?: OfferItem; initial: OfferFormState }) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<OfferFormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stores, setStores] = useState<Array<{ id: number; name: string; slug: string; afWebsite?: string }>>(() => {
    if (existing?.storeName && existing?.storeId) {
      return [{ id: existing.storeId, name: existing.storeName, slug: existing.storeSlug || '' }];
    }
    return [];
  });

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const loadStoresOnDemand = async () => {
    if (stores.length > 1) return;
    try {
      const res = await apiClient.get(API_ENDPOINTS.ADMIN.STORES, { params: { size: 100 } });
      const list = res.data?.data?.content || res.data?.data;
      if (Array.isArray(list)) {
        setStores(
          list.map((s: any) => ({
            id: Number(s.id),
            name: String(s.name),
            slug: String(s.slug),
            afWebsite: s.afWebsite || undefined,
          }))
        );
      }
    } catch {}
  };

  const discountFormatted =
    form.discountUnit === 'percentage'
      ? `${form.discountAmount}% Off`
      : `$${form.discountAmount} Off`;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const selectedStore = stores.find((s) => s.id === form.storeId);
    const storeSlug = selectedStore ? selectedStore.slug : form.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const backendPayload: AdminOfferPayload = {
      storeId: Number(form.storeId),
      name: form.title.trim(),
      discountValue: discountFormatted,
      code: form.offerType === 'deal' ? null : (form.couponCode.trim().toUpperCase() || null),
      urlRef: form.destinationUrl.trim() || (selectedStore?.afWebsite || `https://${storeSlug}.com/?ref=heygoodly`),
      description: form.terms.trim() || null,
      isVerified: form.isVerified,
      isActive: form.isActive,
      sortOrder: 9999,
      image: form.imageUrl?.trim() || null,
      tags: form.tags || [],
    };

    try {
      if (existing && id) {
        const res = await apiClient.put(API_ENDPOINTS.ADMIN.OFFER_DETAIL(id), backendPayload);
        toast.success(res.data?.message || `Updated offer "${form.title}" successfully!`);
      } else {
        const res = await apiClient.post(API_ENDPOINTS.ADMIN.OFFERS, backendPayload);
        toast.success(res.data?.message || `Created offer "${form.title}" successfully!`);
      }
      router.push(ROUTES.ADMIN.OFFERS);
    } catch (err: any) {
      if (err?.response?.data?.errors && typeof err.response.data.errors === 'object') {
        setErrors(err.response.data.errors);
      }
      const msg = err?.response?.data?.message || err?.message || 'Failed to save offer.';
      toast.error(msg);
    }
  };

  return (
    <AdminFormPage
      title={existing ? `Edit Offer: ${existing.title}` : 'Create New Promotional Offer'}
      description="Configure discount voucher codes, merchant affiliate URLs, and offer visibility."
      backHref={ROUTES.ADMIN.OFFERS}
      backLabel="Back to offers"
      formId={FORM_ID}
      submitLabel={existing ? 'Save Offer' : 'Publish Offer'}
      width="full"
    >
      <form noValidate id={FORM_ID} onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Column (Left - 2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="Offer Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Merchant Store *</label>
                  <select
                    value={form.storeId ?? ''}
                    onFocus={loadStoresOnDemand}
                    onClick={loadStoresOnDemand}
                    onChange={(e) => {
                      const sId = Number(e.target.value);
                      const foundStore = stores.find((s) => s.id === sId);
                      setForm({
                        ...form,
                        storeId: sId,
                        storeName: foundStore ? foundStore.name : form.storeName,
                        destinationUrl: form.destinationUrl === 'https://' && foundStore?.afWebsite
                          ? foundStore.afWebsite
                          : form.destinationUrl,
                      });
                    }}
                    className={`${inputClass} ${errors.storeId ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                  >
                    <option value="">Select a Merchant Store</option>
                    {stores.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                  {errors.storeId && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.storeId}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Offer Type *</label>
                  <select
                    value={form.offerType}
                    onChange={(e) => {
                      setForm({ ...form, offerType: e.target.value as 'coupon' | 'deal' });
                      if (errors.couponCode) setErrors((prev) => ({ ...prev, couponCode: '' }));
                    }}
                    className={inputClass}
                  >
                    <option value="coupon">Coupon Code (Requires promo voucher)</option>
                    <option value="deal">Direct Deal (Auto-applied discount link)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Offer Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => {
                    setForm({ ...form, title: e.target.value });
                    if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                  }}
                  placeholder="e.g. 15% Off Sitewide On All LED Light Bars"
                  className={`${inputClass} ${errors.title ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                />
                {errors.title && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.title}
                  </p>
                )}
              </div>

              {form.offerType === 'coupon' && (
                <div className="space-y-1">
                  <label className={labelClass}>Coupon Promo Code *</label>
                  <input
                    type="text"
                    value={form.couponCode}
                    onChange={(e) => {
                      setForm({ ...form, couponCode: e.target.value.toUpperCase() });
                      if (errors.couponCode) setErrors((prev) => ({ ...prev, couponCode: '' }));
                    }}
                    placeholder="e.g. SAVE15NOW"
                    className={`${inputClass} font-mono font-bold tracking-wider ${errors.couponCode ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                  />
                  {errors.couponCode && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.couponCode}
                    </p>
                  )}
                </div>
              )}
            </FormSection>

            <FormSection title="Discount & Destination URL">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Discount Amount *</label>
                  <input
                    type="text"
                    value={form.discountAmount}
                    onChange={(e) => {
                      setForm({ ...form, discountAmount: e.target.value });
                      if (errors.discountAmount) setErrors((prev) => ({ ...prev, discountAmount: '' }));
                    }}
                    placeholder="e.g. 15 or 50"
                    className={`${inputClass} ${errors.discountAmount ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                  />
                  {errors.discountAmount && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.discountAmount}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Discount Unit</label>
                  <select
                    value={form.discountUnit}
                    onChange={(e) => setForm({ ...form, discountUnit: e.target.value as 'percentage' | 'fixed' })}
                    className={inputClass}
                  >
                    <option value="percentage">% Percentage Off</option>
                    <option value="fixed">$ Fixed USD Off</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Destination URL (Tracking Link) *</label>
                <input
                  type="url"
                  value={form.destinationUrl}
                  onChange={(e) => {
                    setForm({ ...form, destinationUrl: e.target.value });
                    if (errors.destinationUrl) setErrors((prev) => ({ ...prev, destinationUrl: '' }));
                  }}
                  placeholder="https://www.nilight.com/?pb_ref=heygoodly"
                  className={`${inputClass} font-mono ${errors.destinationUrl ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                />
                {errors.destinationUrl && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.destinationUrl}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Terms & Exclusions</label>
                <textarea
                  rows={3}
                  value={form.terms}
                  onChange={(e) => setForm({ ...form, terms: e.target.value })}
                  placeholder="Valid on regular priced items only. Not combinable with clearance sales..."
                  className={inputClass}
                />
              </div>
            </FormSection>
          </div>

          {/* Sidebar Column (Right - 1 Col) */}
          <div className="lg:col-span-1 space-y-6">
            <FormSection title="Offer Status & Flags">
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Offer Active</span>
                    <span className="text-[11px] text-slate-400">Display publicly in store directory</span>
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
                    <span className="text-xs font-bold text-slate-800 block">Editor Verified Badge</span>
                    <span className="text-[11px] text-slate-400">Mark verified by HeyGoodly staff</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isVerified}
                    onChange={(e) => setForm({ ...form, isVerified: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Exclusive Deal</span>
                    <span className="text-[11px] text-slate-400">Highlight as exclusive partner deal</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isExclusive}
                    onChange={(e) => setForm({ ...form, isExclusive: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />
                </label>
              </div>
            </FormSection>

            {/* Offer Taxonomy & Tags */}
            <FormSection
              title="Offer Taxonomy & Tags"
              description="Attach centralized tags (e.g. #deals, #black-friday, #tech) for unified discovery across review articles and store pages."
            >
              <TagInput
                tags={form.tags || []}
                onChange={(newTags) => setForm({ ...form, tags: newTags })}
                label="Offer Tags"
                placeholder="Type tag name and press Enter (e.g., deals, tech, apple, free-shipping...)"
                helperText="These tags connect this coupon with related articles, stores, and topic archives."
              />
            </FormSection>

            {/* Product / Offer Image Section */}
            <FormSection title="Product / Offer Image">
              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
                folder="stores"
                label="Promotional Image / Product Photo"
                description="Upload product photo or choose from Media Library."
              />
            </FormSection>

            {/* Live Voucher Preview */}
            <FormSection title="Customer Voucher Preview">
              <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {form.storeName || 'Merchant Partner'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {form.isVerified && (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Verified
                      </span>
                    )}
                    {form.isExclusive && (
                      <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                        ★ Exclusive
                      </span>
                    )}
                  </div>
                </div>

                {/* Thumbnail + Title Details */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 relative">
                    {form.imageUrl ? (
                      <img
                        src={form.imageUrl}
                        alt="Offer preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 text-white font-black text-sm flex items-center justify-center">
                        {(form.storeName || 'ST').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-black text-slate-900 leading-tight">
                      {discountFormatted}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {form.title || 'Special discount offer on selected products'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  {form.offerType === 'coupon' && form.couponCode ? (
                    <div className="bg-slate-100 font-mono text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800">
                      {form.couponCode}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No code needed</span>
                  )}
                  <span className="text-[11px] font-bold text-[#C62828] bg-rose-50 px-2.5 py-1 rounded-lg">
                    Get Deal →
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
