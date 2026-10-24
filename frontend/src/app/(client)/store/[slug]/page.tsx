'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { 
  Star, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  Bell, 
  Info, 
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { copyToClipboard } from '@/lib/utils/clipboard';
import GetCodeButton from '@/components/deals/GetCodeButton';

import { Store, Coupon } from '@/types/deals';
import storeService from '@/services/storeService';
import dealService from '@/services/dealService';
import JsonLd from '@/components/seo/JsonLd';

export default function StoreAffiliatePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawSlug = (params?.slug as string) || 'nilight';
  const cleanSlug = rawSlug.replace('-store', '');
  const initialOfferId = searchParams.get('offer');

  const [store, setStore] = useState<Store | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'verified' | 'codes' | 'deals'>('all');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [copied, setCopied] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);

  // Load store and coupons dynamically from Service layer (API or mock JSON)
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [fetchedStore, fetchedCoupons] = await Promise.all([
        storeService.getStoreBySlug(cleanSlug),
        dealService.getCouponsByStoreSlug(cleanSlug),
      ]);
      setStore(fetchedStore);
      setCoupons(fetchedCoupons);
      setIsLoading(false);
    }
    loadData();
  }, [cleanSlug]);

  useEffect(() => {
    if (initialOfferId && coupons.length > 0) {
      const match = coupons.find(c => String(c.id) === String(initialOfferId));
      if (match) {
        setSelectedCoupon(match);
      }
    }
  }, [initialOfferId, coupons]);

  const storeName = store?.name || (cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1) + ' Store');
  const storeRating = store?.rating || 4.9;
  const storeReviews = store?.reviewCount || 120;
  const storeBestOffer = store?.maxDiscount || coupons[0]?.discount || '15% Off';
  const storeAffiliateUrl = store?.affiliateUrl || `https://www.${cleanSlug}.com/?ref=bargorya`;

  const filteredCoupons = coupons.filter((c) => {
    if (activeTab === 'verified') return c.isVerified;
    if (activeTab === 'codes') return c.isCode;
    if (activeTab === 'deals') return !c.isCode;
    return true;
  });

  const handleOpenCouponModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setCopied(false);
  };

  const handleCopyCodeInModal = async () => {
    if (selectedCoupon?.code) {
      const ok = await copyToClipboard(selectedCoupon.code);
      if (ok) setCopied(true);
    }
  };

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bargorya.com' },
          { '@type': 'ListItem', position: 2, name: 'Stores', item: 'https://bargorya.com/stores' },
          { '@type': 'ListItem', position: 3, name: `${storeName} Coupons`, item: `https://bargorya.com/store/${cleanSlug}` },
        ],
      },
      {
        '@type': 'Store',
        '@id': `https://bargorya.com/store/${cleanSlug}#store`,
        name: storeName,
        url: store?.websiteUrl || `https://${cleanSlug}.com`,
        description: store?.description || `${storeName} coupons, promo codes, and verified discount offers.`,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: (store?.rating || 4.9).toString(),
          reviewCount: (store?.reviewCount || 1420).toString(),
          bestRating: '5',
          worstRating: '1',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `How do I apply a ${storeName} coupon code?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Click 'Get Code' to copy the promo code to your clipboard. A new tab will take you to ${storeName}. Paste the code into the voucher box during checkout to save.`,
            },
          },
          {
            '@type': 'Question',
            name: `Are the discounts on Bargorya verified?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Yes, each discount code and deal is hand-tested daily by our team to guarantee valid savings.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="bg-[#f4f5f7] min-h-screen py-6 sm:py-8">
      <JsonLd data={jsonLdData} />
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#c62828] transition">Home</Link>
          <ChevronRight size={12} />
          <span className="text-slate-800 font-semibold">{storeName} Coupons</span>
        </nav>

        {/* Store Title Bar (as in resource/33.jpg) */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {storeName} <span className="text-slate-400 font-normal text-base sm:text-lg">(Updated: 10/19/2026)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            You have a chance to be the first who save money with this {storeName} coupon! Go ahead and shop!
          </p>
        </div>

        {/* Main Affiliate Layout: Sidebar (4 cols) + Coupon Stream (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* =========================================================
              LEFT COLUMN: STORE INFO & STATS WIDGET (resource/33.jpg)
             ========================================================= */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Store Brand Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs text-center space-y-4">
              
              {/* Store Logo with Red Accent */}
              <div className="w-24 h-24 mx-auto bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-3xl shadow-sm border border-slate-100">
                {cleanSlug.substring(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1">
                <h3 className="font-black text-lg text-slate-950">
                  {storeName}
                </h3>

                {/* Interactive Star Rating */}
                <div className="flex items-center justify-center gap-1 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setUserRating(star)}
                      className="focus:outline-none cursor-pointer"
                      title={`Rate ${star} star`}
                    >
                      <Star
                        size={18}
                        className={
                          (userRating || 5) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }
                      />
                    </button>
                  ))}
                </div>
                <div className="text-xs text-slate-500">
                  <span className="font-bold text-slate-800">{storeRating.toFixed(1)}</span> / {storeReviews} votes •{' '}
                  <button onClick={() => alert('Thanks for rating!')} className="text-[#c62828] font-semibold hover:underline">
                    Rate it
                  </button>
                </div>
              </div>

              {/* Get Coupon Alert Button */}
              <button
                onClick={() => setAlertModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-lg border border-[#c62828] text-[#c62828] hover:bg-[#fde8e8] font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Bell size={14} />
                <span>Get Coupon Alert</span>
              </button>
            </div>

            {/* Summary Statistics Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 text-xs">
              <h4 className="font-black text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wider text-[11px]">
                {coupons.length} Offers, {coupons.filter(c => c.isVerified).length} Verified
              </h4>
              <div className="space-y-2.5 text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Coupon Codes:</span>
                  <span className="font-bold text-slate-900">{coupons.filter(c => c.isCode).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Deals:</span>
                  <span className="font-bold text-slate-900">{coupons.filter(c => !c.isCode).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Best Offer:</span>
                  <span className="font-black text-[#c62828]">{storeBestOffer}</span>
                </div>
              </div>
            </div>

            {/* External Store Link Button */}
            <a
              href={storeAffiliateUrl}
              target="_blank"
              rel="nofollow sponsored"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 text-center"
            >
              <span>Visit Official {storeName}</span>
              <ExternalLink size={14} />
            </a>

          </div>

          {/* =========================================================
              RIGHT COLUMN: COUPON STREAM & TABS (resource/33.jpg)
             ========================================================= */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Filter Tabs with Red Active State */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1.5 shadow-2xs">
              {[
                { id: 'all', label: `All(${coupons.length})` },
                { id: 'verified', label: `Verified(${coupons.filter(c => c.isVerified).length})` },
                { id: 'codes', label: `Codes(${coupons.filter(c => c.isCode).length})` },
                { id: 'deals', label: `Deals(${coupons.filter(c => !c.isCode).length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg font-bold text-xs transition cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#c62828] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Coupon Cards List (Affiliate Voucher Notch Style) */}
            <div className="space-y-4">
              {filteredCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left Info */}
                  <div className="space-y-1.5 flex-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-600" /> Verified Code
                    </span>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      <span className="text-[#c62828] mr-2">{coupon.discount}</span>
                      <span>{coupon.title}</span>
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                      {coupon.description}
                    </p>
                  </div>

                  {/* Right Button: Affiliate Dashed Cutout Notch (as in resource/33.jpg) */}
                  <div className="shrink-0 w-full sm:w-auto flex justify-end">
                    <GetCodeButton
                      code={coupon.code}
                      isCode={coupon.isCode}
                      onOpenModal={() => handleOpenCouponModal(coupon)}
                      size="md"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Shopping & Verification Guide */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-3">
              <h4 className="font-black text-slate-900 text-sm">
                About {storeName} Savings & Verification Process
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                All coupon codes listed on Bargorya for {storeName} are routinely checked by our team using real test carts. Copy the code above, paste it into the promo box on checkout, and enjoy your discount.
              </p>
            </div>

            {/* About Store Section (Exact reproduction of resource/34.jpg) */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs space-y-6">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight border-b border-slate-100 pb-4">
                About store
              </h2>

              <div className="space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <div className="space-y-2">
                  <h3 className="font-black text-slate-900 text-base">Who We Are</h3>
                  <p>
                    <strong className="text-slate-900">{storeName}</strong> is a specialized brand dedicated to helping drivers, enthusiasts, and consumer product owners enhance their daily experience. We focus on providing practical, durable products that support functionality, visibility, customization, and lifestyle adventures.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-black text-slate-900 text-base">What We Offer</h3>
                  <p>
                    {storeName} offers a wide selection of premium accessories, high-efficiency equipment, and hardware designed for durability and ease of installation. Our curated catalog provides accessible solutions for both beginners and seasoned enthusiasts.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-black text-slate-900 text-base">Why Choose Us</h3>
                  <p>
                    {storeName} combines functional design, versatile options, and practical installation solutions to meet the needs of modern consumers. Whether customers are upgrading their setup, improving reliability, or customizing their equipment, we aim to provide high-value, cost-effective options backed by responsive customer support.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-black text-slate-900 text-base">Our Mission &amp; Vision</h3>
                  <p>
                    At <strong className="text-slate-900">{storeName}</strong>, our mission is to make quality upgrades and lifestyle solutions accessible to more customers through practical, functional products. Our vision is to become a trusted global choice by supporting customization, improving reliability, and helping customers get more out of every journey.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* =========================================================
          COUPON POPUP MODAL (Exact match to modal design)
          Opens coupon modal; only redirects on "Go to Store" click
         ========================================================= */}
      {selectedCoupon && (
        <div
          onClick={() => setSelectedCoupon(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-5 text-center border border-slate-200"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedCoupon(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Store Monogram / Logo */}
            <div className="w-14 h-14 rounded-xl bg-slate-900 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-sm">
              {cleanSlug.substring(0, 2).toUpperCase()}
            </div>

            {/* Header */}
            <div className="space-y-1">
              <h3 className="font-black text-lg sm:text-xl text-slate-950">
                {selectedCoupon.discount} {storeName} Promo Code
              </h3>
              <p className="text-xs text-slate-500">
                Copy the code and go to {storeName}
              </p>
            </div>

            {/* Dashed Code Box (resource/33.jpg) */}
            {selectedCoupon.code ? (
              <div className="space-y-3">
                <div className="relative p-4 bg-slate-50 border-2 border-dashed border-[#c62828] rounded-2xl flex items-center justify-between gap-3 shadow-inner">
                  <div className="text-left">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      PROMO CODE
                    </span>
                    <span className="font-mono font-black text-xl sm:text-2xl text-slate-900 tracking-wider select-all">
                      {selectedCoupon.code}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyCodeInModal}
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
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                Deal activated! No code needed. Discount is automatically applied in your cart.
              </div>
            )}

            {/* Link & Explicit Destination Button: ONLY clicking this opens new tab */}
            <div className="pt-2 space-y-3">
              <a
                href={`https://www.${cleanSlug}.com/?ref=bargorya&offer=${selectedCoupon.id}`}
                target="_blank"
                rel="nofollow sponsored"
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to {storeName} →</span>
                <ExternalLink size={15} />
              </a>

              <div>
                <button
                  onClick={() => setSelectedCoupon(null)}
                  className="text-xs text-slate-400 hover:text-slate-700 underline"
                >
                  More {storeName} Coupons &gt;&gt;
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Coupon Alert Modal */}
      {alertModalOpen && (
        <div
          onClick={() => setAlertModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-slate-200"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#c62828] flex items-center justify-center mx-auto">
              <Bell size={24} />
            </div>
            <h3 className="font-black text-base text-slate-900">
              Get {storeName} Alerts
            </h3>
            <p className="text-xs text-slate-500">
              Enter your email to receive verified coupons and flash sale notifications for {storeName}.
            </p>
            {alertSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold">
                ✓ You're signed up for {storeName} coupon alerts!
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (alertEmail) {
                    if (typeof window !== 'undefined') {
                      try {
                        const key = 'admin:collection:customer-feedback';
                        const existing = JSON.parse(localStorage.getItem(key) || '[]');
                        const alertLead = {
                          id: Date.now(),
                          name: `Coupon Alert (${storeName})`,
                          email: alertEmail,
                          phone: '',
                          message: `Subscribed to verified coupon notifications for ${storeName} (${cleanSlug}).`,
                          isRead: false,
                          createdAt: 'Just now',
                        };
                        localStorage.setItem(key, JSON.stringify([alertLead, ...existing]));
                      } catch {
                        // ignore
                      }
                    }
                    setAlertSuccess(true);
                  }
                }}
                className="space-y-2"
              >
                <input
                  type="email"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#c62828]"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#c62828] text-white font-bold text-xs rounded-lg shadow-xs hover:bg-[#b71c1c] transition cursor-pointer"
                >
                  Subscribe Free
                </button>
              </form>
            )}
            <button
              onClick={() => { setAlertModalOpen(false); setAlertSuccess(false); }}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
