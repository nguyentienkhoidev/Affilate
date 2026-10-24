'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Coupon } from '@/types/deals';
import { ROUTES } from '@/constants/routes';
import { ShieldCheck, Copy, Check, ArrowRight, ExternalLink, Sparkles } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils/clipboard';
import CouponModal from './CouponModal';
import GetCodeButton from './GetCodeButton';

interface CouponCardProps {
  coupon: Coupon;
}

export default function CouponCard({ coupon }: CouponCardProps) {
  const [copied, setCopied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (coupon.code) {
      const ok = await copyToClipboard(coupon.code);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
    setModalOpen(true);
  };

  const handleOpenModal = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (coupon.code) {
      copyToClipboard(coupon.code);
      setCopied(true);
    }
    setModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all p-5 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4">
        {/* Top: Store & Discount */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-sm">
              {coupon.storeName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <Link 
                href={ROUTES.PUBLIC.STORE_DETAIL(coupon.storeSlug)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 transition"
              >
                {coupon.storeName}
              </Link>
              <h4 className="font-extrabold text-base text-slate-950 leading-tight">
                {coupon.discount}
              </h4>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <ShieldCheck size={11} className="text-emerald-600" />
              <span>{coupon.successRate}% Success</span>
            </span>
            {coupon.isExclusive && (
              <span className="text-[10px] font-extrabold text-amber-600 flex items-center gap-0.5">
                <Sparkles size={10} /> Exclusive
              </span>
            )}
          </div>
        </div>

        {/* Middle: Title & Terms */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">
            {coupon.title}
          </p>
          <p className="text-[11px] text-slate-500 line-clamp-1">
            {coupon.description}
          </p>
        </div>

        {/* Bottom: Code & Action Button */}
        <div className="pt-3 border-t border-slate-100">
          <GetCodeButton
            code={coupon.code}
            isCode={!!coupon.code}
            onOpenModal={handleOpenModal}
            fullWidth={true}
            size="md"
          />
        </div>
      </div>

      <CouponModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        offer={{
          id: coupon.id,
          title: coupon.title,
          code: coupon.code,
          discount: coupon.discount,
          storeName: coupon.storeName,
          storeSlug: coupon.storeSlug,
          terms: coupon.terms,
        }}
      />
    </>
  );
}
