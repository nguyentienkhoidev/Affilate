'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Star,
  ShieldCheck,
  ExternalLink,
  Bell,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  Tag,
  Users,
  HelpCircle,
  Store as StoreIcon,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { absoluteUrl } from '@/constants/site';
import GetCodeButton from '@/components/deals/GetCodeButton';
import CouponModal from '@/components/deals/CouponModal';
import { triggerDualActionCoupon } from '@/lib/deals/affiliateAction';
import { Store, Coupon } from '@/types/deals';
import storeService from '@/services/storeService';
import dealService from '@/services/dealService';
import JsonLd from '@/components/seo/JsonLd';
import subscriberService from '@/services/subscriberService';

export default function StoreAffiliatePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawSlug = (params?.slug as string) || '';
  const cleanSlug = rawSlug.replace(/-store$/, '');
  const initialOfferId = searchParams.get('offer');

  const [store, setStore] = useState<Store | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'codes' | 'deals'>('all');
  const [couponPage, setCouponPage] = useState(1);
  const couponPageSize = 5;
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    async function loadData() {
      if (!cleanSlug) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setNotFound(false);

      const [fetchedStore, fetchedCoupons] = await Promise.all([
        storeService.getStoreBySlug(cleanSlug),
        dealService.getCouponsByStoreSlug(cleanSlug),
      ]);

      if (!active) return;

      if (!fetchedStore) {
        setStore(null);
        setCoupons([]);
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setStore(fetchedStore);
      setCoupons(fetchedCoupons);
      setIsLoading(false);
    }

    loadData();
    return () => {
      active = false;
    };
  }, [cleanSlug]);

  useEffect(() => {
    if (initialOfferId && coupons.length > 0) {
      const match = coupons.find((c) => String(c.id) === String(initialOfferId));
      if (match) {
        setSelectedCoupon(match);
      }
    }
  }, [initialOfferId, coupons]);

  if (isLoading) {
    return (
      <div className="bg-[#f4f5f7] min-h-screen py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 size={28} className="animate-spin text-[#c62828]" />
        <p className="text-xs font-semibold">Loading merchant profile and active offers...</p>
      </div>
    );
  }

  if (notFound || !store) {
    return (
      <div className="bg-[#f4f5f7] min-h-screen py-20">
        <div className="max-w-xl mx-auto px-4 text-center space-y-5 bg-white border border-slate-200 rounded-3xl p-10 shadow-xs">
          <StoreIcon size={44} className="mx-auto text-slate-300" />
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Store Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            This merchant profile could not be found or is currently inactive in our partner directory.
          </p>
          <div className="pt-2">
            <Link
              href={ROUTES.PUBLIC.STORES}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c62828] hover:bg-[#b71c1c] text-white text-xs font-bold rounded-xl transition"
            >
              <ArrowLeft size={14} />
              <span>Browse All Partner Stores</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const storeName = store.name;
  const storeRating = typeof store.rating === 'number' && store.rating > 0 ? store.rating : null;
  const storeReviews = typeof store.reviewCount === 'number' && store.reviewCount > 0 ? store.reviewCount : null;
  const storeBestOffer = store.maxDiscount || coupons[0]?.discount || null;
  const storeAffiliateUrl = store.affiliateUrl || ROUTES.PUBLIC.GO_AFFILIATE(store.slug);
  const rawDescription = store.shortDescription || store.description || '';
  const cleanDescription =
    rawDescription.replace(/<[^>]*>?/gm, '').trim() ||
    `Browse verified promo codes and active deals from ${storeName}.`;

  const popularSearches = store.popularSearches && store.popularSearches.length > 0 ? store.popularSearches : [];
  const storeFaqs =
    store.faqs && store.faqs.length > 0
      ? store.faqs.map((f) => ({ q: f.question, a: f.answer }))
      : [];

  const filteredCoupons = coupons.filter((c) => {
    if (activeTab === 'codes') return c.isCode;
    if (activeTab === 'deals') return !c.isCode;
    return true;
  });

  const totalCouponPages = Math.max(1, Math.ceil(filteredCoupons.length / couponPageSize));
  const safeCouponPage = Math.min(Math.max(1, couponPage), totalCouponPages);
  const paginatedCoupons = filteredCoupons.slice(
    (safeCouponPage - 1) * couponPageSize,
    safeCouponPage * couponPageSize
  );

  const handleOpenCouponModal = (coupon: Coupon) => {
    triggerDualActionCoupon({
      code: coupon.code,
      storeSlug: store.slug,
      offerId: coupon.id,
      customUrl: coupon.affiliateUrl || store.affiliateUrl,
      onOpenModal: () => {
        setSelectedCoupon(coupon);
      },
    });
  };

  const jsonLdGraph: Record<string, unknown>[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl(ROUTES.PUBLIC.HOME) },
        { '@type': 'ListItem', position: 2, name: 'Stores', item: absoluteUrl(ROUTES.PUBLIC.STORES) },
        { '@type': 'ListItem', position: 3, name: `${storeName} Coupons`, item: absoluteUrl(ROUTES.PUBLIC.STORE_DETAIL(store.slug)) },
      ],
    },
    {
      '@type': 'Store',
      '@id': `${absoluteUrl(ROUTES.PUBLIC.STORE_DETAIL(store.slug))}#store`,
      name: storeName,
      ...(store.websiteUrl ? { url: store.websiteUrl } : {}),
      description: cleanDescription,
      ...(storeRating && storeReviews
        ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: storeRating.toString(),
              reviewCount: storeReviews.toString(),
              bestRating: '5',
              worstRating: '1',
            },
          }
        : {}),
    },
  ];

  if (storeFaqs.length > 0) {
    jsonLdGraph.push({
      '@type': 'FAQPage',
      mainEntity: storeFaqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      })),
    });
  }

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@graph': jsonLdGraph,
  };

  return (
    <div className="bg-[#f4f5f7] min-h-screen py-6 sm:py-8">
      <JsonLd data={jsonLdData} />
      <div className="max-w-7xl mx-auto px-4 space-y-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href={ROUTES.PUBLIC.HOME} className="hover:text-[#c62828] transition">Home</Link>
          <ChevronRight size={12} />
          <Link href={ROUTES.PUBLIC.STORES} className="hover:text-[#c62828] transition">Stores</Link>
          <ChevronRight size={12} />
          <span className="text-slate-800 font-semibold">{storeName} Coupons</span>
        </nav>

        {/* Main Affiliate Layout: Sidebar (4 cols) + Coupon Stream (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: STORE INFO & STATS WIDGET */}
          <div className="lg:col-span-4 space-y-5">

            {/* Store Brand Card */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs text-center">
              {store.bannerUrl && (
                <div className="w-full h-28 overflow-hidden relative bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={store.bannerUrl}
                    alt={`${storeName} banner`}
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
              )}

              <div className={`p-6 ${store.bannerUrl ? '-mt-12 pt-0 relative z-10' : ''} space-y-4`}>
                <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden flex items-center justify-center shadow-md border-2 border-white bg-slate-900 text-white">
                  {store.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={store.logoUrl}
                      alt={storeName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-black text-3xl">{storeName.substring(0, 2).toUpperCase()}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <h1 className="font-black text-xl text-slate-950">
                    {storeName}
                  </h1>

                  {storeRating && (
                    <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-slate-500">
                      <Star size={16} className="fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-800">{storeRating.toFixed(1)}</span>
                      {storeReviews && <span>/ {storeReviews.toLocaleString()} ratings</span>}
                    </div>
                  )}
                </div>

                <p
                  className="text-xs text-slate-500 leading-relaxed line-clamp-3 text-center px-1 pt-2 border-t border-slate-100"
                  title={cleanDescription}
                >
                  {cleanDescription}
                </p>

                <button
                  type="button"
                  onClick={() => setAlertModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-lg border border-[#c62828] text-[#c62828] hover:bg-[#fde8e8] font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Bell size={14} />
                  <span>Get Coupon Alert</span>
                </button>
              </div>
            </div>

            <div className="hidden lg:block space-y-5">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 text-xs">
                <h4 className="font-black text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wider text-[11px]">
                  {coupons.length} Active Offers
                </h4>
                <div className="space-y-2.5 text-slate-600">
                  <div className="flex justify-between items-center">
                    <span>Coupon Codes:</span>
                    <span className="font-bold text-slate-900">{coupons.filter((c) => c.isCode).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Deals:</span>
                    <span className="font-bold text-slate-900">{coupons.filter((c) => !c.isCode).length}</span>
                  </div>
                  {storeBestOffer && (
                    <div className="flex justify-between items-center">
                      <span>Best Offer:</span>
                      <span className="font-black text-[#c62828]">{storeBestOffer}</span>
                    </div>
                  )}
                </div>
                {coupons.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedCoupon(coupons[0])}
                    className="w-full mt-2 py-2 px-3 rounded-lg bg-red-50 hover:bg-[#c62828] text-[#c62828] hover:text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-red-200/80"
                  >
                    <Tag size={13} />
                    <span>View All {coupons.length} Codes &amp; Deals</span>
                  </button>
                )}
              </div>

              <a
                href={storeAffiliateUrl}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 text-center"
              >
                <span>Visit Official {storeName}</span>
                <ExternalLink size={14} />
              </a>
            </div>

          </div>

          {/* RIGHT COLUMN: COUPON STREAM & TABS */}
          <div className="lg:col-span-8 space-y-4">

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1.5 shadow-2xs">
              {[
                { id: 'all' as const, label: `All (${coupons.length})` },
                { id: 'codes' as const, label: `Codes (${coupons.filter((c) => c.isCode).length})` },
                { id: 'deals' as const, label: `Deals (${coupons.filter((c) => !c.isCode).length})` },
              ].map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCouponPage(1);
                  }}
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

            {/* Coupon Cards List */}
            {paginatedCoupons.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-2 shadow-2xs">
                <Tag size={32} className="mx-auto text-slate-300" />
                <h3 className="font-bold text-slate-900 text-sm">
                  No active {activeTab === 'codes' ? 'coupon codes' : activeTab === 'deals' ? 'deals' : 'offers'} available right now
                </h3>
                <p className="text-xs text-slate-500">
                  There are currently 0 matching offers for {storeName}. Subscribe to coupon alerts to get notified as soon as new codes arrive.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedCoupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">

                      <div className="relative w-full sm:w-28 h-32 sm:h-28 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        {coupon.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={coupon.imageUrl}
                            alt={coupon.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white font-black text-xl">
                            <span>{storeName.substring(0, 2).toUpperCase()}</span>
                            <span className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-wider">{storeName}</span>
                          </div>
                        )}

                        <div className="absolute bottom-1.5 left-1.5 bg-[#c62828] text-white text-[11px] font-black px-2 py-0.5 rounded shadow-sm">
                          {coupon.discount}
                        </div>
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <ShieldCheck size={11} className="text-emerald-600" />{' '}
                            {coupon.isCode ? 'Promo Code' : 'Direct Deal'}
                          </span>
                          {coupon.isExclusive && (
                            <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              ★ Exclusive
                            </span>
                          )}
                        </div>

                        <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug line-clamp-2">
                          {!coupon.title.toLowerCase().startsWith(coupon.discount.toLowerCase()) && (
                            <span className="text-[#c62828] mr-2">{coupon.discount}</span>
                          )}
                          <span>{coupon.title}</span>
                        </h3>

                        {coupon.description && (
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                            {coupon.description}
                          </p>
                        )}

                        {coupon.terms && coupon.terms !== coupon.description && (
                          <p className="text-[10px] text-slate-400 italic line-clamp-1">
                            Terms: {coupon.terms}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 w-full md:w-auto flex justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
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
            )}

            {/* Store Coupon Stream Pagination Bar (always rendered consistently when >= 0 offers) */}
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <span>
                {filteredCoupons.length === 0 ? (
                  <>Showing <strong className="text-slate-900">0</strong> offers</>
                ) : (
                  <>
                    Showing{' '}
                    <strong className="text-slate-900">
                      {(safeCouponPage - 1) * couponPageSize + 1}
                    </strong>
                    –
                    <strong className="text-slate-900">
                      {Math.min(safeCouponPage * couponPageSize, filteredCoupons.length)}
                    </strong>{' '}
                    of <strong className="text-slate-900">{filteredCoupons.length}</strong> offers
                  </>
                )}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCouponPage((p) => Math.max(1, p - 1))}
                  disabled={safeCouponPage <= 1}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalCouponPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCouponPage(p)}
                    className={`w-8 h-8 rounded-lg font-bold transition cursor-pointer ${
                      safeCouponPage === p
                        ? 'bg-[#c62828] text-white shadow-2xs'
                        : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCouponPage((p) => Math.min(totalCouponPages, p + 1))}
                  disabled={safeCouponPage >= totalCouponPages}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Full-Width Sections */}
        <div className="w-full space-y-6 pt-2">
          {/* 1. Trust Value Props Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="flex items-center gap-3 pt-2 md:pt-0">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 leading-tight">Hand-Tested Coupons</h5>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Verified checkout carts</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 md:pt-0 md:pl-4">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Clock size={18} />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 leading-tight">Regularly Audited</h5>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Live database sync</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 md:pt-0 md:pl-4">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Tag size={18} />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 leading-tight">Direct Partner Links</h5>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Official merchant offers</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 md:pt-0 md:pl-4">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Users size={18} />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 leading-tight">Editorial Standards</h5>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Zero fabricated codes</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Popular Searches (Only when present in DB) */}
          {popularSearches.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
              <h4 className="text-xs font-black text-slate-900 tracking-tight">
                Popular Searches Related to {storeName} Coupons
              </h4>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((query, idx) => (
                  <Link
                    key={idx}
                    href={`${ROUTES.PUBLIC.SEARCH}?q=${encodeURIComponent(query)}`}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50/70 border border-emerald-200 hover:bg-emerald-100/70 transition cursor-pointer"
                  >
                    {query}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 3. About Store Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                About {storeName}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Merchant overview and coupon verification details.
              </p>
            </div>

            {store.description && store.description.trim() ? (
              <div
                className="article-content font-sans text-slate-800 leading-relaxed text-sm prose prose-slate max-w-none space-y-4"
                dangerouslySetInnerHTML={{ __html: store.description }}
              />
            ) : (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {cleanDescription}
              </p>
            )}

            {/* FAQ Section (Only when store has database-backed FAQs) */}
            {storeFaqs.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <HelpCircle size={18} className="text-emerald-600" />
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    Frequently Asked Questions About {storeName}
                  </h3>
                </div>
                <div className="space-y-2.5">
                  {storeFaqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-xl overflow-hidden transition"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-slate-900 hover:bg-slate-50 transition cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        {openFaq === idx ? (
                          <ChevronUp size={16} className="text-slate-400 shrink-0 ml-2" />
                        ) : (
                          <ChevronDown size={16} className="text-slate-400 shrink-0 ml-2" />
                        )}
                      </button>
                      {openFaq === idx && (
                        <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Unified Dual-Action Coupon Modal */}
      <CouponModal
        isOpen={!!selectedCoupon}
        onClose={() => setSelectedCoupon(null)}
        offer={
          selectedCoupon
            ? {
                id: String(selectedCoupon.id),
                title: selectedCoupon.title,
                code: selectedCoupon.code,
                discount: selectedCoupon.discount,
                storeName: storeName,
                storeSlug: store.slug,
                affiliateUrl: selectedCoupon.affiliateUrl || storeAffiliateUrl,
                terms: selectedCoupon.terms,
                imageUrl: selectedCoupon.imageUrl,
              }
            : null
        }
      />

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
              Enter your email to receive active coupons and flash sale notifications for {storeName}.
            </p>
            {alertSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold">
                ✓ You&apos;re signed up for {storeName} coupon alerts!
              </div>
            ) : (
              <form
                noValidate
                onSubmit={async (e) => {
                  e.preventDefault();
                  const cleanEmail = alertEmail.trim().toLowerCase();
                  if (cleanEmail) {
                    await subscriberService.subscribe(cleanEmail, 'store-alert');
                    setAlertSuccess(true);
                  }
                }}
                className="space-y-2"
              >
                <input
                  type="email"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
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
              type="button"
              onClick={() => { setAlertModalOpen(false); setAlertSuccess(false); }}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
