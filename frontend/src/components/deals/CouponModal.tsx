'use client';

import { useState, useEffect } from 'react';
import { X, Check, Copy, ExternalLink, ShieldCheck } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { copyToClipboard } from '@/lib/utils/clipboard';

export interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: {
    id: string;
    title: string;
    code?: string;
    discount: string;
    storeName: string;
    storeSlug: string;
    affiliateUrl?: string;
    terms?: string;
  } | null;
}

export default function CouponModal({ isOpen, onClose, offer }: CouponModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [isOpen, offer?.code]);

  if (!isOpen || !offer) return null;

  const handleCopy = async () => {
    if (offer.code) {
      const ok = await copyToClipboard(offer.code);
      if (ok) setCopied(true);
    }
  };

  const storeInitials = offer.storeName.substring(0, 2).toUpperCase();
  const affiliateDestination = ROUTES.PUBLIC.GO_AFFILIATE(offer.storeSlug) + `?offer=${offer.id}`;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-5 text-center transform transition-all border border-slate-100"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Store Monogram */}
        <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-md">
          {storeInitials}
        </div>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <ShieldCheck size={12} className="text-emerald-600" />
            <span>Exclusive Verified Offer</span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl leading-snug">
            {offer.discount} at {offer.storeName}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2">
            {offer.title}
          </p>
        </div>

        {/* Coupon Code Section */}
        {offer.code ? (
          <div className="space-y-3">
            <div className="relative p-4 bg-slate-50 border-2 border-dashed border-[#c62828] rounded-2xl flex items-center justify-between gap-3 shadow-inner">
              <div className="text-left">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  PROMO CODE
                </span>
                <span className="font-mono font-black text-xl sm:text-2xl text-slate-900 tracking-wider select-all">
                  {offer.code}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className={`font-black text-xs px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-md shrink-0 active:scale-95 ${
                  copied
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-[#c62828] hover:bg-[#b71c1c] text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={15} className="text-amber-200 stroke-[3]" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={15} /> Copy Code
                  </>
                )}
              </button>
            </div>
            {copied && (
              <div className="py-1.5 px-3 bg-emerald-50 border border-emerald-200 rounded-full inline-flex items-center gap-1.5 text-xs text-emerald-800 font-bold animate-fadeIn">
                <Check size={14} className="text-emerald-600 stroke-[3]" /> Code copied to your clipboard!
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-semibold leading-relaxed">
            Deal activated! No coupon code needed. Your discount will be automatically applied at {offer.storeName}'s checkout.
          </div>
        )}

        {/* 3 Step Instruction */}
        <div className="bg-slate-50 rounded-xl p-3.5 text-left space-y-2 text-xs text-slate-600 border border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
            <span>Click <strong>"Go to {offer.storeName} Store"</strong> below to open their website.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
            <span>Add your chosen items to your shopping cart.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
            <span>
              {offer.code 
                ? `Paste the copied code into the Promo / Discount box at checkout.` 
                : `Enjoy your automatic savings during final checkout.`}
            </span>
          </div>
        </div>

        {/* Dedicated Store Button: ONLY this button opens the partner site */}
        <a
          href={affiliateDestination}
          target="_blank"
          rel="nofollow sponsored"
          className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition shadow flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>Go to {offer.storeName} Store</span>
          <ExternalLink size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </a>

        {offer.terms && (
          <p className="text-[10px] text-slate-400 leading-tight">
            Terms: {offer.terms}
          </p>
        )}
      </div>
    </div>
  );
}
