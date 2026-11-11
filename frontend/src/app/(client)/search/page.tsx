'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { Search, Tag, Store as StoreIcon, BookOpen, Star, Loader2 } from 'lucide-react';
import { formatCurrentMonthYear } from '@/lib/utils/formatters';
import searchService from '@/services/searchService';
import tagService from '@/services/tagService';
import { Store, Coupon, Article } from '@/types/deals';
import GetCodeButton from '@/components/deals/GetCodeButton';
import CouponModal from '@/components/deals/CouponModal';
import { triggerDualActionCoupon } from '@/lib/deals/affiliateAction';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('tag') || '';
  const currentMonthYear = formatCurrentMonthYear();

  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState<'all' | 'stores' | 'offers' | 'posts'>('all');

  const [stores, setStores] = useState<Store[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [posts, setPosts] = useState<Article[]>([]);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(initialQuery.trim()));
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const inFlightControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    tagService.getTrendingTags().then((tags) => {
      if (active) setTrendingTags(tags);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const urlQuery = searchParams.get('q') ?? searchParams.get('tag');
    if (urlQuery !== null) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    const cleanQ = query.trim();

    if (inFlightControllerRef.current) {
      inFlightControllerRef.current.abort();
    }

    if (!cleanQ) {
      setStores([]);
      setCoupons([]);
      setPosts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const controller = new AbortController();
    inFlightControllerRef.current = controller;

    const timer = setTimeout(async () => {
      const isTag = cleanQ.startsWith('#');
      const res = await searchService.searchAll({
        q: isTag ? cleanQ.replace(/^#+/, '') : cleanQ,
        tag: isTag ? cleanQ.replace(/^#+/, '') : undefined,
        limit: 24,
        signal: controller.signal,
      });

      if (!controller.signal.aborted) {
        setStores(res.stores);
        setCoupons(res.coupons);
        setPosts(res.posts);
        setIsLoading(false);
      }
    }, 220);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const cleanQ = query.trim();

  const selectedStoreLogo = selectedCoupon
    ? stores.find((s) => s.slug.toLowerCase() === selectedCoupon.storeSlug.toLowerCase())?.logoUrl
    : undefined;

  const handleOpenOffer = (offer: Coupon) => {
    triggerDualActionCoupon({
      code: offer.code,
      storeSlug: offer.storeSlug,
      offerId: offer.id,
      customUrl: offer.affiliateUrl,
      onOpenModal: () => setSelectedCoupon(offer),
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">

        {/* Search Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Search Discounts &amp; Editorial Reviews ({currentMonthYear})
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Search across partner brand stores, active promotional coupon codes, and editorial buying guides.
            </p>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stores, promo codes, or product reviews..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 sm:py-3.5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#c62828]/20 focus:border-[#c62828] shadow-inner"
              autoFocus
            />
          </div>

          {/* Trending Topic Suggestions */}
          {trendingTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">Popular Topics:</span>
              {trendingTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQuery(tag)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#c62828] text-slate-700 hover:text-white text-[11px] font-semibold transition cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Filter Tabs */}
          {cleanQ && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTab('all')}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                  tab === 'all' ? 'bg-[#c62828] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Results ({stores.length + coupons.length + posts.length})
              </button>
              <button
                type="button"
                onClick={() => setTab('stores')}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                  tab === 'stores' ? 'bg-[#c62828] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Stores ({stores.length})
              </button>
              <button
                type="button"
                onClick={() => setTab('offers')}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                  tab === 'offers' ? 'bg-[#c62828] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Coupons ({coupons.length})
              </button>
              <button
                type="button"
                onClick={() => setTab('posts')}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                  tab === 'posts' ? 'bg-[#c62828] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Articles &amp; Guides ({posts.length})
              </button>
            </div>
          )}
        </div>

        {/* Results Sections */}
        {!cleanQ ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <Search size={36} className="mx-auto text-slate-300" />
            <h2 className="text-base font-bold text-slate-900">Enter a keyword to search</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Type a merchant brand name, coupon code, or product topic above—or select one of the popular topics to explore live results.
            </p>
          </div>
        ) : isLoading ? (
          <div className="py-16 text-center text-slate-400 text-sm font-medium flex flex-col items-center justify-center gap-2">
            <Loader2 size={24} className="animate-spin text-[#c62828]" />
            <span>Searching stores, promo codes, and editorial reviews...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stores Result */}
            {(tab === 'all' || tab === 'stores') && stores.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <StoreIcon size={18} className="text-[#c62828]" /> Stores Matching Search ({stores.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stores.map((s) => (
                    <Link
                      key={s.slug}
                      href={ROUTES.PUBLIC.STORE_DETAIL(s.slug)}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-[#c62828] hover:shadow transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-[#c62828] bg-red-50 px-2 py-0.5 rounded">
                          {s.category}
                        </span>
                        {s.rating > 0 && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                            <Star size={11} className="fill-amber-400 text-amber-400" /> {s.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 group-hover:text-[#c62828] transition-colors text-sm">
                        {s.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1">{s.couponsCount ?? 0} active coupons</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Offers Result */}
            {(tab === 'all' || tab === 'offers') && coupons.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Tag size={18} className="text-[#c62828]" /> Coupons &amp; Promo Codes ({coupons.length})
                </h2>
                <div className="space-y-3">
                  {coupons.map((o) => (
                    <div
                      key={o.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                          {o.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={o.imageUrl}
                              alt={o.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                              {(o.storeName || 'HG').substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-black text-[#c62828] bg-red-50 border border-red-100 px-2 py-0.5 rounded shrink-0">
                              {o.discount}
                            </span>
                            {o.storeSlug && (
                              <Link
                                href={ROUTES.PUBLIC.STORE_DETAIL(o.storeSlug)}
                                className="text-[11px] font-bold text-slate-500 hover:text-[#c62828] transition truncate"
                              >
                                {o.storeName}
                              </Link>
                            )}
                          </div>
                          <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 sm:line-clamp-1">
                            {o.title}
                          </h3>
                        </div>
                      </div>

                      <div className="shrink-0 w-full sm:w-auto">
                        <GetCodeButton
                          code={o.code}
                          isCode={o.isCode}
                          size="sm"
                          onOpenModal={() => handleOpenOffer(o)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Posts Result */}
            {(tab === 'all' || tab === 'posts') && posts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen size={18} className="text-[#c62828]" /> Articles &amp; Buying Guides ({posts.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {posts.map((p) => (
                    <Link
                      key={p.slug}
                      href={ROUTES.PUBLIC.POST_DETAIL(p.slug)}
                      className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-[#c62828] transition-all group block space-y-2"
                    >
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-bold text-[#c62828]">{p.category}</span>
                        {p.readTime && (
                          <>
                            <span>•</span>
                            <span>{p.readTime}</span>
                          </>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#c62828] transition-colors">
                        {p.title}
                      </h3>
                      {p.excerpt && (
                        <p className="text-xs text-slate-500 line-clamp-2">{p.excerpt}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {stores.length === 0 && coupons.length === 0 && posts.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
                <p className="text-sm font-bold text-slate-800">No matching records found for &ldquo;{cleanQ}&rdquo;</p>
                <p className="text-xs text-slate-500">Try searching with a different store name, category, or product keyword.</p>
              </div>
            )}
          </div>
        )}

      </div>

      <CouponModal
        isOpen={Boolean(selectedCoupon)}
        onClose={() => setSelectedCoupon(null)}
        offer={
          selectedCoupon
            ? {
                id: selectedCoupon.id,
                title: selectedCoupon.title,
                code: selectedCoupon.code,
                discount: selectedCoupon.discount,
                storeName: selectedCoupon.storeName,
                storeSlug: selectedCoupon.storeSlug,
                affiliateUrl: selectedCoupon.affiliateUrl,
                terms: selectedCoupon.terms,
                imageUrl: selectedCoupon.imageUrl || selectedStoreLogo,
              }
            : null
        }
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 py-16 text-center text-slate-400 text-sm">Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
