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
import { OFFERS_STORE_KEY, DEFAULT_OFFERS, type OfferItem } from '../_lib/data';

interface OfferFormState {
  storeName: string;
  offerType: 'coupon' | 'deal';
  title: string;
  couponCode: string;
  discountAmount: string;
  discountUnit: 'percentage' | 'fixed';
  destinationUrl: string;
  isVerified: boolean;
  isExclusive: boolean;
  isActive: boolean;
  terms: string;
}

const FORM_ID = 'offer-form';

export default function OfferForm({ id }: { id?: string }) {
  const { hydrated, getById } = useAdminCollection<OfferItem>(OFFERS_STORE_KEY, DEFAULT_OFFERS);
  const isEdit = id !== undefined;
  const existing = getById(id);

  if (isEdit && !hydrated) return <FormLoading />;
  if (isEdit && !existing) return <FormNotFound backHref={ROUTES.ADMIN.OFFERS} entity="Offer" />;

  const initial: OfferFormState = existing
    ? {
        storeName: existing.storeName,
        offerType: existing.offerType,
        title: existing.title,
        couponCode: existing.couponCode || '',
        discountAmount: existing.discount.replace(/[^0-9.]/g, '') || '10',
        discountUnit: existing.discount.includes('%') ? 'percentage' : 'fixed',
        destinationUrl: existing.destinationUrl || `https://${existing.storeSlug}.com/?ref=bargorya`,
        isVerified: existing.isVerified,
        isExclusive: existing.isExclusive,
        isActive: existing.isActive,
        terms: existing.terms || 'Valid on regular priced items.',
      }
    : {
        storeName: 'Nilight',
        offerType: 'coupon',
        title: '',
        couponCode: '',
        discountAmount: '15',
        discountUnit: 'percentage',
        destinationUrl: 'https://',
        isVerified: true,
        isExclusive: false,
        isActive: true,
        terms: 'Valid on regular priced items.',
      };

  return <OfferFormInner key={id ?? 'new'} existing={existing} initial={initial} />;
}

function OfferFormInner({ existing, initial }: { existing?: OfferItem; initial: OfferFormState }) {
  const router = useRouter();
  const { create, update } = useAdminCollection<OfferItem>(OFFERS_STORE_KEY, DEFAULT_OFFERS);
  const [form, setForm] = useState<OfferFormState>(initial);

  const discountFormatted =
    form.discountUnit === 'percentage'
      ? `${form.discountAmount}% Off`
      : `$${form.discountAmount} Off`;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = form.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (existing) {
      update(existing.id, {
        storeName: form.storeName,
        storeSlug: slug,
        title: form.title,
        discount: discountFormatted,
        couponCode: form.offerType === 'deal' ? null : form.couponCode || null,
        offerType: form.offerType,
        destinationUrl: form.destinationUrl,
        isVerified: form.isVerified,
        isExclusive: form.isExclusive,
        isActive: form.isActive,
        terms: form.terms,
        verifiedAt: form.isVerified ? 'Today' : existing.verifiedAt,
      });
    } else {
      create({
        id: Date.now(),
        storeName: form.storeName,
        storeSlug: slug,
        title: form.title,
        discount: discountFormatted,
        couponCode: form.offerType === 'deal' ? null : form.couponCode || null,
        offerType: form.offerType,
        destinationUrl: form.destinationUrl,
        isVerified: form.isVerified,
        isExclusive: form.isExclusive,
        isActive: form.isActive,
        terms: form.terms,
        usesCount: 0,
        verifiedAt: form.isVerified ? 'Today' : 'Unverified',
      });
    }
    router.push(ROUTES.ADMIN.OFFERS);
  };

  return (
    <AdminFormPage
      title={existing ? `Edit Offer: ${existing.title}` : 'Create New Promotional Offer'}
      description="Configure discount voucher codes, merchant affiliate URLs, and verification status."
      backHref={ROUTES.ADMIN.OFFERS}
      backLabel="Back to offers"
      formId={FORM_ID}
      submitLabel={existing ? 'Save Offer' : 'Publish Offer'}
      width="wide"
    >
      <form id={FORM_ID} onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Column (Left - 2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="Offer Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Merchant Store *</label>
                  <select
                    value={form.storeName}
                    onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                    className={inputClass}
                  >
                    <option value="Nilight">Nilight</option>
                    <option value="Neo Sabers">Neo Sabers</option>
                    <option value="Auxito LED">Auxito LED</option>
                    <option value="Anker Tech">Anker Tech</option>
                    <option value="Hostinger Cloud">Hostinger Cloud</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Offer Type *</label>
                  <select
                    value={form.offerType}
                    onChange={(e) => setForm({ ...form, offerType: e.target.value as 'coupon' | 'deal' })}
                    className={inputClass}
                  >
                    <option value="coupon">Coupon Code (Requires promo code)</option>
                    <option value="deal">Direct Deal (Auto-applied at checkout)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Offer Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. 15% Off Sitewide On All LED Light Bars"
                  className={inputClass}
                />
              </div>

              {form.offerType === 'coupon' && (
                <div className="space-y-1">
                  <label className={labelClass}>Coupon Promo Code *</label>
                  <input
                    type="text"
                    required
                    value={form.couponCode}
                    onChange={(e) => setForm({ ...form, couponCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. NILIGHT15"
                    className={`${inputClass} font-mono font-bold tracking-wider`}
                  />
                </div>
              )}
            </FormSection>

            <FormSection title="Discount & Destination URL">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Discount Amount *</label>
                  <input
                    type="text"
                    required
                    value={form.discountAmount}
                    onChange={(e) => setForm({ ...form, discountAmount: e.target.value })}
                    placeholder="e.g. 15 or 50"
                    className={inputClass}
                  />
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
                  required
                  value={form.destinationUrl}
                  onChange={(e) => setForm({ ...form, destinationUrl: e.target.value })}
                  placeholder="https://www.nilight.com/?pb_ref=bargorya"
                  className={`${inputClass} font-mono`}
                />
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
            <FormSection title="Verification & Status">
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Verified Status</span>
                    <span className="text-[11px] text-slate-400">Tested and verified today</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isVerified}
                    onChange={(e) => setForm({ ...form, isVerified: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-[#C62828] focus:ring-[#C62828]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Exclusive Code</span>
                    <span className="text-[11px] text-slate-400">Exclusive Bargorya partner deal</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isExclusive}
                    onChange={(e) => setForm({ ...form, isExclusive: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-[#C62828] focus:ring-[#C62828]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Offer Active</span>
                    <span className="text-[11px] text-slate-400">Display in store coupon list</span>
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

            {/* Live Voucher Preview */}
            <FormSection title="Customer Voucher Preview">
              <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {form.storeName}
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

                <div>
                  <div className="text-base font-black text-slate-900 leading-tight">
                    {discountFormatted}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {form.title || 'Special discount offer on selected products'}
                  </p>
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
