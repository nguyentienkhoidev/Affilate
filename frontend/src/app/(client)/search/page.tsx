'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { Search, Tag, Store as StoreIcon, BookOpen, Star, ArrowRight } from 'lucide-react';
import { formatCurrentMonthYear } from '@/lib/utils/formatters';
import storeService from '@/services/storeService';
import dealService from '@/services/dealService';
import postService from '@/services/postService';
import { Store, Coupon, Article } from '@/types/deals';

export default function SearchPage() {
  const currentMonthYear = formatCurrentMonthYear();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'stores' | 'offers' | 'posts'>('all');

  const [stores, setStores] = useState<Store[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [posts, setPosts] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [storesData, couponsData, postsRes] = await Promise.all([
        storeService.getStores(),
        dealService.getCoupons(),
        postService.getPosts({ page: 1, size: 24 }),
      ]);
      setStores(storesData);
      setCoupons(couponsData);
      setPosts(postsRes.items);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.category.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase())
  );

  const filteredOffers = coupons.filter(
    (o) =>
      o.title.toLowerCase().includes(query.toLowerCase()) ||
      o.storeName.toLowerCase().includes(query.toLowerCase()) ||
      (o.code && o.code.toLowerCase().includes(query.toLowerCase())) ||
      o.discount.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        
        {/* Search Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Search Bargorya Discounts & Reviews ({currentMonthYear})
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Search across verified brand stores, active promotional coupon codes, and expert editorial buying guides.
            </p>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stores (e.g. Nilight, Anker), promo codes, or articles..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#c62828]/20 focus:border-[#c62828] shadow-inner"
              autoFocus
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setTab('all')}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                tab === 'all' ? 'bg-[#c62828] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Results
            </button>
            <button
              onClick={() => setTab('stores')}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                tab === 'stores' ? 'bg-[#c62828] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Stores ({filteredStores.length})
            </button>
            <button
              onClick={() => setTab('offers')}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                tab === 'offers' ? 'bg-[#c62828] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Coupons ({filteredOffers.length})
            </button>
            <button
              onClick={() => setTab('posts')}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                tab === 'posts' ? 'bg-[#c62828] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Articles & Guides ({filteredPosts.length})
            </button>
          </div>
        </div>

        {/* Results Sections */}
        <div className="space-y-8">
          
          {/* Stores Result */}
          {(tab === 'all' || tab === 'stores') && filteredStores.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <StoreIcon size={18} className="text-[#c62828]" /> Stores Matching Search
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredStores.map((s) => (
                  <Link
                    key={s.slug}
                    href={ROUTES.PUBLIC.STORE_DETAIL(s.slug)}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-[#c62828] hover:shadow transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-[#c62828] bg-red-50 px-2 py-0.5 rounded">
                        {s.category}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                        <Star size={11} className="fill-amber-400 text-amber-400" /> {s.rating}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 group-hover:text-[#c62828] transition-colors text-sm">
                      {s.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">{s.couponsCount || 6} active coupons</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Offers Result */}
          {(tab === 'all' || tab === 'offers') && filteredOffers.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Tag size={18} className="text-[#c62828]" /> Coupons & Promo Codes
              </h2>
              <div className="space-y-3">
                {filteredOffers.map((o) => (
                  <div
                    key={o.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-[#c62828] bg-red-50 border border-red-100 px-2.5 py-1.5 rounded-lg shrink-0">
                        {o.discount}
                      </span>
                      <div>
                        <Link
                          href={ROUTES.PUBLIC.STORE_DETAIL(o.storeSlug)}
                          className="text-[11px] font-bold text-[#c62828] hover:underline"
                        >
                          {o.storeName}
                        </Link>
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5">
                          {o.title}
                        </h3>
                      </div>
                    </div>

                    <Link
                      href={ROUTES.PUBLIC.STORE_DETAIL(o.storeSlug)}
                      className="shrink-0 bg-slate-900 hover:bg-[#c62828] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      Get Code <ArrowRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts Result */}
          {(tab === 'all' || tab === 'posts') && filteredPosts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen size={18} className="text-[#c62828]" /> Articles & Buying Guides
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPosts.map((p) => (
                  <Link
                    key={p.slug}
                    href={ROUTES.PUBLIC.POST_DETAIL(p.slug)}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-[#c62828] transition-all group block space-y-2"
                  >
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-bold text-[#c62828]">{p.category}</span>
                      <span>•</span>
                      <span>{p.readTime}</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#c62828] transition-colors">
                      {p.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
