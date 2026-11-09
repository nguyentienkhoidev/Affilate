'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { copyToClipboard } from '@/lib/utils/clipboard';

export interface CouponModalOffer {
  id: string;
  title: string;
  code?: string;
  discount: string;
  storeName: string;
  storeSlug: string;
  affiliateUrl?: string;
  terms?: string;
  imageUrl?: string;
}

export interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: CouponModalOffer | null;
  /** Whether the coupon was automatically copied upon opening */
  initialCopied?: boolean;
}

export default function CouponModal({
  isOpen,
  onClose,
  offer,
  initialCopied = true,
}: CouponModalProps) {
  const [copied, setCopied] = useState(initialCopied);

  useEffect(() => {
    if (isOpen && offer) {
      setCopied(initialCopied && !!offer.code);
    }
  }, [isOpen, offer, initialCopied]);

  if (!isOpen || !offer) return null;

  const handleCopy = async () => {
    if (offer.code) {
      const ok = await copyToClipboard(offer.code);
      if (ok) setCopied(true);
    }
  };

  const storeInitials = offer.storeName.substring(0, 2).toUpperCase();
  const affiliateDestination =
    offer.affiliateUrl ||
    `${ROUTES.PUBLIC.GO_AFFILIATE(offer.storeSlug)}?offer=${offer.id}`;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden border border-slate-200/90"
      >
        {/* TOP DARK BRAND HEADER */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl overflow-hidden bg-white/10 border border-white/15 flex items-center justify-center shrink-0 shadow-sm">
              {offer.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={offer.imageUrl}
                  alt={offer.storeName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-black text-sm text-white">{storeInitials}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-black text-sm sm:text-base text-white truncate">
                  {offer.storeName}
                </h2>
              </div>
              <p className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Sparkles size={11} className="text-amber-400 shrink-0" />
                <span className="truncate">
                  {offer.code
                    ? `Opened ${offer.storeName} in a new tab & copied code!`
                    : `Direct offer activated at ${offer.storeName}!`}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X size={17} />
          </button>
        </div>

        {/* SINGLE COUPON BODY */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Ticket Top Row: Discount Pill + Title */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#c62828] text-white font-black text-xs px-3 py-1 rounded-lg shadow-2xs">
                {offer.discount}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <ShieldCheck size={12} className="text-emerald-600" />
                {offer.code ? 'Promo Code' : 'Direct Deal'}
              </span>
            </div>

            <h3 className="font-black text-slate-950 text-lg sm:text-xl leading-snug">
              {offer.title}
            </h3>

            {offer.terms && (
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {offer.terms}
              </p>
            )}
          </div>

          {/* Promo Code Box or Instant Deal Banner */}
          {offer.code ? (
            <div className="bg-red-50/40 border-2 border-dashed border-[#c62828]/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center justify-between sm:block">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                  PROMO CODE
                </span>
                <span className="font-mono font-black text-2xl text-slate-950 tracking-wider select-all">
                  {offer.code}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`flex-1 sm:flex-initial font-black text-xs px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                    copied
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-[#c62828] hover:bg-[#b71c1c] text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check size={14} className="stroke-[3]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>

                <a
                  href={affiliateDestination}
                  target="_blank"
                  rel="nofollow sponsored"
                  className="flex-1 sm:flex-initial px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
                >
                  <span>Visit {offer.storeName}</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-emerald-900 font-semibold leading-snug">
                Offer automatically applied at {offer.storeName} checkout (no code required).
              </div>
              <a
                href={affiliateDestination}
                target="_blank"
                rel="nofollow sponsored"
                className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
              >
                <span>Get Deal at {offer.storeName}</span>
                <ExternalLink size={13} />
              </a>
            </div>
          )}

          {/* Clean 3-Step Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2">
              <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <span className="font-medium">Copy promo code</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2">
              <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <span className="font-medium">Shop your items</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2">
              <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <span className="font-medium">Paste at checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
