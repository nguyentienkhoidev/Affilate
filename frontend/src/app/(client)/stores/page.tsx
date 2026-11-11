'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import {
  Store as StoreIcon,
  Star,
  ArrowRight,
  ShieldCheck,
  Search,
  Tag,
  Loader2,
  Layers,
  ChevronDown,
  Check,
  X,
} from 'lucide-react';
import storeService from '@/services/storeService';
import categoryService, { CategoryItem } from '@/services/categoryService';
import Pagination from '@/components/admin/Pagination';
import { Store } from '@/types/deals';
import { formatCurrentMonthYear } from '@/lib/utils/formatters';

export default function StoresDirectoryPage() {
  const currentMonthYear = formatCurrentMonthYear();
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Category Popover State
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const categoryPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryPopoverRef.current && !categoryPopoverRef.current.contains(event.target as Node)) {
        setIsCategoryPopoverOpen(false);
      }
    }
    if (isCategoryPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryPopoverOpen]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const q = categorySearch.trim().toLowerCase();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [categories, categorySearch]);

  const toggleCategory = (catSlug: string) => {
    const clean = catSlug.trim();
    if (!clean || clean.toUpperCase() === 'ALL') {
      setSelectedCategories([]);
      setCurrentPage(1);
      return;
    }
    setSelectedCategories((prev) => {
      const exists = prev.some((c) => c.toLowerCase() === clean.toLowerCase());
      if (exists) {
        return prev.filter((c) => c.toLowerCase() !== clean.toLowerCase());
      }
      return [...prev, clean];
    });
    setCurrentPage(1);
  };

  const removeCategory = (catSlug: string) => {
    setSelectedCategories((prev) => prev.filter((c) => c.toLowerCase() !== catSlug.toLowerCase()));
    setCurrentPage(1);
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
    setCurrentPage(1);
  };

  useEffect(() => {
    let active = true;
    categoryService.getCategories('store').then((cats) => {
      if (active && cats) {
        setCategories(cats);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadStores() {
      setIsLoading(true);
      const res = await storeService.getPaginatedStores({
        page: currentPage - 1,
        size: 24,
        search: search.trim() || undefined,
        category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
      });

      if (isMounted) {
        setStores(res.content);
        setTotalPages(Math.max(1, res.totalPages));
        setTotalCount(res.totalElements);
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadStores();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search, selectedCategories, currentPage]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-10 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#c62828] uppercase tracking-widest">
            <StoreIcon size={16} /> Official Merchant Directory &amp; Brand Partners
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
            All Partner Stores ({currentMonthYear})
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            Discover active promo codes and hand-tested discounts directly from manufacturer stores. Our editorial team tests checkout carts regularly to verify valid vouchers.
          </p>

          {/* Search Bar & Stats */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search partner stores..."
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#c62828]/20 focus:border-[#c62828]"
              />
            </div>
            <div className="text-xs text-slate-500 font-semibold shrink-0">
              Showing <strong className="text-slate-900">{totalCount}</strong> partner brands
            </div>
          </div>

          {/* Category Filter Pills & Popover */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-500 text-[11px] shrink-0">
                  <Layers size={13} className="text-[#c62828]" />
                  <span>Category</span>
                </div>

                {selectedCategories.map((cSlug) => {
                  const catObj = categories.find((c) => c.slug.toLowerCase() === cSlug.toLowerCase());
                  const name = catObj ? catObj.name : cSlug;
                  return (
                    <button
                      key={cSlug}
                      type="button"
                      onClick={() => removeCategory(cSlug)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-[#c62828] border border-red-200 hover:bg-red-100 transition cursor-pointer"
                      title={`Remove ${name}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span>{name}</span>
                      <X size={11} className="ml-0.5 text-red-500" />
                    </button>
                  );
                })}

                {selectedCategories.length > 1 && (
                  <button
                    type="button"
                    onClick={clearAllCategories}
                    className="text-[11px] font-semibold text-[#c62828] hover:underline cursor-pointer ml-1"
                  >
                    Clear all ({selectedCategories.length})
                  </button>
                )}
              </div>

              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                {categories.length} categories
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {/* Horizontal Scroll of Categories */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={clearAllCategories}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                    selectedCategories.length === 0
                      ? 'bg-[#c62828] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => {
                  const isSelected = selectedCategories.some(
                    (c) => c.toLowerCase() === cat.slug.toLowerCase()
                  );
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => toggleCategory(cat.slug)}
                      className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#c62828] text-white shadow-2xs ring-2 ring-red-600/20'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.icon && <span className="text-sm">{cat.icon}</span>}
                      <span>{cat.name}</span>
                      {typeof cat.storeCount === 'number' && cat.storeCount > 0 ? (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {cat.storeCount}
                        </span>
                      ) : ''}
                    </button>
                  );
                })}
              </div>

              {/* Pinned "All Categories" Popover Trigger & Dropdown */}
              {categories.length > 0 && (
                <div className="relative shrink-0" ref={categoryPopoverRef}>
                  <button
                    type="button"
                    onClick={() => setIsCategoryPopoverOpen((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border shadow-2xs ${
                      selectedCategories.length > 0 || isCategoryPopoverOpen
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                    }`}
                    aria-expanded={isCategoryPopoverOpen}
                  >
                    <Layers size={13} className={selectedCategories.length > 0 ? 'text-red-400' : 'text-[#c62828]'} />
                    <span>All Categories ({categories.length})</span>
                    {selectedCategories.length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {selectedCategories.length}
                      </span>
                    )}
                    <ChevronDown
                      size={13}
                      className={`transition-transform duration-200 ${
                        isCategoryPopoverOpen ? 'rotate-180 text-red-500' : 'text-slate-400'
                      }`}
                    />
                  </button>

                {isCategoryPopoverOpen && (
                  <div className="absolute right-0 top-full mt-2 w-[min(20rem,calc(100vw-3rem))] sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* Search Header */}
                    <div className="relative mb-2.5">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder={`Search ${categories.length} categories...`}
                        className="w-full bg-slate-50 text-slate-800 placeholder:text-slate-400 text-xs py-2 pl-8.5 pr-8 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#c62828]/20 focus:border-[#c62828] transition"
                        autoFocus
                      />
                      {categorySearch && (
                        <button
                          type="button"
                          onClick={() => setCategorySearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {/* Quick Info & Reset */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pb-2 border-b border-slate-100 font-medium">
                      <span>Showing {filteredCategories.length} of {categories.length} categories</span>
                      {selectedCategories.length > 0 && (
                        <button
                          type="button"
                          onClick={clearAllCategories}
                          className="text-[#c62828] hover:underline font-bold cursor-pointer"
                        >
                          Reset to All
                        </button>
                      )}
                    </div>

                    {/* Scrollable Categories List */}
                    <div className="max-h-80 overflow-y-auto space-y-1 pt-2 pr-1 select-none">
                      {/* Option: All Categories */}
                      <button
                        type="button"
                        onClick={clearAllCategories}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer text-left ${
                          selectedCategories.length === 0
                            ? 'bg-red-50 text-[#c62828] font-bold border border-red-200 shadow-2xs'
                            : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm">🌐</span>
                          <span className="truncate">All Categories</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                              selectedCategories.length === 0
                                ? 'bg-[#c62828] border-[#c62828] text-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {selectedCategories.length === 0 && <Check size={11} className="stroke-[3]" />}
                          </div>
                        </div>
                      </button>

                      {filteredCategories.map((cat) => {
                        const isSel = selectedCategories.some(
                          (c) => c.toLowerCase() === cat.slug.toLowerCase()
                        );
                        return (
                          <button
                            type="button"
                            key={cat.id || cat.slug}
                            onClick={() => toggleCategory(cat.slug)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer text-left ${
                              isSel
                                ? 'bg-red-50 text-[#c62828] font-bold border border-red-200 shadow-2xs'
                                : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {cat.icon ? <span className="text-sm">{cat.icon}</span> : <span className="w-2 h-2 rounded-full bg-[#c62828]/80 shrink-0" />}
                              <span className="truncate">{cat.name}</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              {typeof cat.storeCount === 'number' && cat.storeCount > 0 && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  isSel ? 'bg-red-200 text-red-800' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {cat.storeCount}
                                </span>
                              )}
                              <div
                                className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                                  isSel
                                    ? 'bg-[#c62828] border-[#c62828] text-white'
                                    : 'border-slate-300'
                                }`}
                              >
                                {isSel && <Check size={11} className="stroke-[3]" />}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Stores Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 font-medium text-sm flex flex-col items-center justify-center gap-2">
            <Loader2 size={24} className="animate-spin text-[#c62828]" />
            <p>Loading partner stores...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <StoreIcon size={40} className="mx-auto text-slate-300" />
            <h3 className="font-bold text-slate-900 text-base">No matching records found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn&apos;t find any stores matching your search query or category filter.
            </p>
            {(search || selectedCategories.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  clearAllCategories();
                }}
                className="text-xs font-bold text-[#c62828] hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Store Logo */}
                    <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs border border-slate-100">
                      {store.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={store.logoUrl}
                          alt={store.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <span className="font-black text-xl tracking-wider">
                          {store.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        {store.category}
                      </span>
                      <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-[#c62828] transition truncate">
                        {store.name}
                      </h3>

                      {store.rating > 0 && (
                        <div className="flex items-center gap-1 pt-0.5">
                          <Star size={13} className="fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-slate-800">
                            {store.rating.toFixed(1)}
                          </span>
                          {store.reviewCount > 0 && (
                            <span className="text-[11px] text-slate-400">
                              ({store.reviewCount})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges: Max Discount & Active Coupons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {store.maxDiscount && (
                      <span className="inline-flex items-center gap-1 text-xs font-black text-[#c62828] bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-lg">
                        <Tag size={12} /> {store.maxDiscount}
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                      <ShieldCheck size={12} /> {store.couponsCount ?? 0} Offers
                    </span>
                  </div>

                  {/* Store Description */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {store.shortDescription || store.description}
                  </p>

                  {/* Bottom CTA */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link
                      href={ROUTES.PUBLIC.STORE_DETAIL(store.slug)}
                      className="w-full py-2.5 bg-slate-900 hover:bg-[#c62828] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 text-center shadow-2xs"
                    >
                      <span>View Coupons &amp; Deals</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={24}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

      </div>
    </div>
  );
}
