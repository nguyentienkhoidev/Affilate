'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Deal } from '@/types/deals';
import { ROUTES } from '@/constants/routes';
import { ShieldCheck, Clock, AlertTriangle, ArrowRight, Tag, Star, Sparkles } from 'lucide-react';
import CouponModal from './CouponModal';
import GetCodeButton from './GetCodeButton';

interface DealCardProps {
  deal: Deal;
  featured?: boolean;
}

export default function DealCard({ deal, featured = false }: DealCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const isExpired = deal.status === 'expired';
  const isExpiring = deal.status === 'expiring';
  const savings = (deal.originalPrice - deal.dealPrice).toFixed(2);

  const handleClaim = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setModalOpen(true);
  };

  return (
    <>
      <div 
        className={`group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
          isExpired ? 'opacity-65 grayscale-[30%]' : ''
        } ${featured ? 'md:col-span-2 md:grid md:grid-cols-12 md:items-center' : ''}`}
      >
        {/* Product Media */}
        <div className={`relative overflow-hidden bg-slate-100 ${featured ? 'md:col-span-5 h-full min-h-[260px]' : 'aspect-[16/10]'}`}>
          <Image
            src={deal.imageUrl}
            alt={deal.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className="bg-emerald-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm tracking-wide">
              -{deal.discountPercent}% OFF
            </span>
            {deal.badge && (
              <span className="bg-slate-900/90 backdrop-blur-sm text-amber-300 border border-amber-300/30 text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                <Sparkles size={11} /> {deal.badge}
              </span>
            )}
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3 z-10">
            {isExpired ? (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <AlertTriangle size={11} /> Expired
              </span>
            ) : isExpiring ? (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                <Clock size={11} /> Ends Soon
              </span>
            ) : (
              <span className="bg-white/95 backdrop-blur-sm text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <ShieldCheck size={12} className="text-emerald-600" /> Verified
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className={`p-5 flex-1 flex flex-col justify-between space-y-4 ${featured ? 'md:col-span-7 md:p-7' : ''}`}>
          <div className="space-y-2">
            {/* Store & Category attribution */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <Link 
                href={ROUTES.PUBLIC.STORE_DETAIL(deal.storeSlug)}
                className="font-bold text-slate-900 hover:text-emerald-600 transition flex items-center gap-1.5"
              >
                <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[9px] font-extrabold flex items-center justify-center">
                  {deal.storeName.substring(0, 2).toUpperCase()}
                </span>
                <span>{deal.storeName}</span>
              </Link>
              <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                {deal.category}
              </span>
            </div>

            {/* Title */}
            <h3 className={`font-extrabold text-slate-900 group-hover:text-emerald-700 transition leading-snug line-clamp-2 ${
              featured ? 'text-lg md:text-xl' : 'text-base'
            }`}>
              <Link href={ROUTES.PUBLIC.DEAL_DETAIL(deal.slug)}>
                {deal.title}
              </Link>
            </h3>

            {/* Summary */}
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {deal.summary}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2 pt-0.5 text-xs text-slate-500">
              <div className="flex items-center text-amber-400">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-800 ml-1">{deal.rating}</span>
              </div>
              <span>•</span>
              <span className="text-[11px] text-slate-400">{deal.reviewCount} shopper reviews</span>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-950 tracking-tight">
                  ${deal.dealPrice.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 line-through">
                  ${deal.originalPrice.toFixed(2)}
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600">
                Save ${savings}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={ROUTES.PUBLIC.DEAL_DETAIL(deal.slug)}
                className="hidden sm:inline-flex text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-2 rounded-lg hover:bg-slate-100 transition"
                title="View full specs"
              >
                Details
              </Link>
              {deal.couponCode && !isExpired ? (
                <GetCodeButton
                  code={deal.couponCode}
                  onOpenModal={() => setModalOpen(true)}
                  size="sm"
                />
              ) : (
                <button
                  onClick={handleClaim}
                  disabled={isExpired}
                  className={`text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer ${
                    isExpired 
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <span>Claim Deal</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Popup: Opens only upon clicking Claim Deal / Get Code */}
      <CouponModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        offer={{
          id: deal.id,
          title: deal.title,
          code: deal.couponCode,
          discount: `Save $${savings} (${deal.discountPercent}% Off)`,
          storeName: deal.storeName,
          storeSlug: deal.storeSlug,
          affiliateUrl: deal.affiliateUrl,
          terms: deal.terms,
        }}
      />
    </>
  );
}
