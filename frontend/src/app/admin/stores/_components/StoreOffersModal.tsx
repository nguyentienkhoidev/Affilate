'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  X,
  Search,
  Tag,
  Plus,
  ExternalLink,
  Edit2,
  Eye,
  Star,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Check,
  Sparkles,
  Users,
  Loader2,
} from 'lucide-react';
import { type AdminStore } from '../_lib/data';
import { type OfferItem } from '../../offers/_lib/data';
import { offerService } from '@/services/offerService';

interface StoreOffersModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: AdminStore | null;
}

export default function StoreOffersModal({
  isOpen,
  onClose,
  store,
}: StoreOffersModalProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CODES' | 'DEALS' | 'EXCLUSIVE'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Server data state
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filter or store changes
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, pageSize, store?.id]);

  // Single Paginated API call with AbortController to guarantee exactly 1 request per user action
  const inFlightControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isOpen || !store) return;

    if (inFlightControllerRef.current) {
      inFlightControllerRef.current.abort();
    }
    const controller = new AbortController();
    inFlightControllerRef.current = controller;

    const numericStoreId = Number(store.id);
    setLoading(true);

    const typeParam =
      typeFilter === 'CODES' ? 'coupon' : typeFilter === 'DEALS' ? 'deal' : undefined;
    const verifiedParam = typeFilter === 'EXCLUSIVE' ? true : undefined;

    offerService.getAdminOffers({
      storeId: numericStoreId || undefined,
      page: currentPage - 1,
      size: pageSize,
      search: debouncedSearch.trim() || undefined,
      type: typeParam,
      verified: verifiedParam,
      sortBy: 'sortOrder',
      direction: 'asc',
    })
      .then((res) => {
        const rawContent = res.content || [];
        const mapped: OfferItem[] = rawContent.map((o) => ({
          id: Number(o.id),
          storeId: Number(o.storeId),
          storeName: o.storeName || store.name,
          storeSlug: o.storeSlug || store.slug,
          title: o.name,
          discount: o.discountValue || 'Special Offer',
          couponCode: o.code || null,
          offerType: o.code ? 'coupon' : 'deal',
          isExclusive: Boolean(o.isVerified),
          isActive: o.isActive !== false,
          isVerified: Boolean(o.isVerified),
          usesCount: Number((o as any).usesCount ?? 0),
          destinationUrl: o.urlRef || `/out/${o.id}`,
          terms: o.description || `Valid on ${store.name} official store.`,
          imageUrl: o.image || o.imageUrl || o.storeLogo || store.logoUrl || undefined,
        }));

        setOffers(mapped);
        setTotalElements(res.totalElements ?? mapped.length);
        setTotalPages(res.totalPages || Math.max(1, Math.ceil((res.totalElements ?? mapped.length) / pageSize)));
      })
      .catch((err) => {
        console.warn('Store offers API error:', err);
        setOffers([]);
        setTotalElements(0);
        setTotalPages(1);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, store?.id, currentPage, pageSize, debouncedSearch, typeFilter]);

  if (!isOpen || !store) return null;

  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startItem = totalElements === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalElements);

  const handleCopyCode = (id: number, code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#C62828] shrink-0 overflow-hidden shadow-2xs">
              {store.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <Tag size={20} />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                  Coupons, Promo Codes &amp; Deals in &ldquo;{store.name}&rdquo;
                </h2>
                <span className="text-[11px] font-bold bg-[#C62828] text-white px-2.5 py-0.5 rounded-full shadow-2xs whitespace-nowrap">
                  {totalElements || store.activeCoupons || 0} Offers
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="font-mono text-[#C62828] font-semibold whitespace-nowrap">
                  /store/{store.slug}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="truncate hidden sm:inline">
                  {store.shortDescription || store.description?.replace(/<[^>]*>/g, '') || `${store.domain} official offers`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            <Link
              href={`/store/${store.slug}`}
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#C62828] bg-white border border-slate-200 hover:border-[#C62828]/40 px-3 py-1.5 rounded-xl transition shadow-2xs cursor-pointer whitespace-nowrap"
              title="View store page on client website"
            >
              <span>View Live</span>
              <ExternalLink size={12} />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Action Toolbar & Filters */}
        <div className="p-4 border-b border-slate-100 bg-white space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by offer title, promo code, discount..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-7 py-2 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Action Links */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/admin/offers?store=${encodeURIComponent(store.name)}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#C62828] bg-slate-100 hover:bg-slate-200/80 px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap"
              >
                <SlidersHorizontal size={13} />
                <span>Manage in Offers</span>
              </Link>

              <Link
                href={`/admin/offers/create?store=${encodeURIComponent(store.name)}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#C62828] hover:bg-[#B71C1C] px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer whitespace-nowrap"
              >
                <Plus size={14} />
                <span>Create Offer</span>
              </Link>
            </div>
          </div>

          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1.5 text-xs border-t border-slate-100 pt-2.5 overflow-x-auto select-none">
            <button
              type="button"
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                typeFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All {typeFilter === 'ALL' ? `(${totalElements})` : ''}
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('CODES')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                typeFilter === 'CODES'
                  ? 'bg-[#C62828] text-white shadow-2xs'
                  : 'bg-red-50 text-[#C62828] hover:bg-red-100'
              }`}
            >
              Promo Codes {typeFilter === 'CODES' ? `(${totalElements})` : ''}
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('DEALS')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                typeFilter === 'DEALS'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              Deals {typeFilter === 'DEALS' ? `(${totalElements})` : ''}
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('EXCLUSIVE')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                typeFilter === 'EXCLUSIVE'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              ★ Exclusive {typeFilter === 'EXCLUSIVE' ? `(${totalElements})` : ''}
            </button>
          </div>
        </div>

        {/* Modal Scrollable Offer List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 relative min-h-[220px]">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={24} className="animate-spin text-[#C62828]" />
              <span className="text-xs font-semibold text-slate-600">Loading coupons &amp; deals from PostgreSQL...</span>
            </div>
          ) : offers.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
              {offers.map((offer) => {
                const isCode = offer.offerType === 'coupon' && Boolean(offer.couponCode);
                return (
                  <div
                    key={offer.id}
                    className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group"
                  >
                    {/* Left: Content */}
                    <div className="flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 relative shrink-0 border border-slate-200 flex items-center justify-center">
                        <Tag size={22} className="text-slate-400" />
                        <span className="absolute bottom-1 left-1 bg-[#C62828] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs max-w-[90%] truncate">
                          {offer.discount}
                        </span>
                        {offer.isExclusive && (
                          <span
                            className="absolute top-1 left-1 bg-amber-500 text-white p-0.5 rounded shadow-xs"
                            title="Exclusive Offer"
                          >
                            <Star size={10} fill="currentColor" />
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap text-[11px]">
                          {isCode ? (
                            <button
                              type="button"
                              onClick={() => handleCopyCode(offer.id, offer.couponCode!)}
                              className="inline-flex items-center gap-1 font-mono font-bold text-[#C62828] bg-red-50 hover:bg-red-100 border border-dashed border-red-300 px-2 py-0.5 rounded cursor-pointer transition"
                              title="Click to copy promo code"
                            >
                              <span>{offer.couponCode}</span>
                              {copiedId === offer.id ? (
                                <Check size={11} className="text-emerald-600" />
                              ) : (
                                <Copy size={10} />
                              )}
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold text-[10px] whitespace-nowrap">
                              <Sparkles size={10} /> Direct Deal
                            </span>
                          )}

                          {offer.isExclusive && (
                            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold text-[10px] whitespace-nowrap">
                              ★ Exclusive
                            </span>
                          )}

                          <span className="text-slate-400 inline-flex items-center gap-1 whitespace-nowrap">
                            <Users size={11} /> {offer.usesCount.toLocaleString()} uses
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#C62828] transition-colors leading-snug line-clamp-1 sm:line-clamp-2">
                          <Link href={`/admin/offers/${offer.id}/edit`}>{offer.title}</Link>
                        </h4>

                        <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                          {offer.terms || `Save ${offer.discount} at ${store.name} official store.`}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Link
                        href={`/store/${store.slug}?offer=${offer.id}`}
                        target="_blank"
                        className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold inline-flex items-center gap-1 transition shadow-2xs cursor-pointer whitespace-nowrap"
                        title="Preview offer on store page"
                      >
                        <Eye size={13} />
                        <span className="hidden sm:inline">Preview</span>
                      </Link>

                      <Link
                        href={`/admin/offers/${offer.id}/edit`}
                        className="h-8 px-3 rounded-lg bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold inline-flex items-center gap-1.5 transition shadow-2xs cursor-pointer whitespace-nowrap"
                        title="Edit offer"
                      >
                        <Edit2 size={12} />
                        <span>Edit</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 px-4 text-center space-y-4 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Tag size={24} />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-sm font-bold text-slate-900">
                  {search ? 'No offers match your search' : 'No coupons or deals for this store yet'}
                </h3>
                <p className="text-xs text-slate-500">
                  {search
                    ? 'Try searching with a different keyword or clear the filter tab.'
                    : `There are currently no coupons or deals assigned to "${store.name}". Create the first offer now.`}
                </p>
              </div>
              <div>
                <Link
                  href={`/admin/offers/create?store=${encodeURIComponent(store.name)}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#C62828] hover:bg-[#B71C1C] px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Create First Offer</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Server-Side Pagination */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-3 whitespace-nowrap font-medium text-slate-600">
            {totalElements === 0 ? (
              <span>0 offers</span>
            ) : (
              <span>
                Showing <strong className="text-slate-900">{startItem}</strong>–
                <strong className="text-slate-900">{endItem}</strong> of{' '}
                <strong className="text-slate-900">{totalElements}</strong> offers
              </span>
            )}

            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="text-[11px] font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:border-[#C62828] cursor-pointer"
              title="Items per page"
            >
              <option value={3}>3 / page</option>
              <option value={4}>4 / page</option>
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
            </select>
          </div>

          {totalElements > 0 && (
            <div className="flex items-center gap-1 select-none">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={safePage <= 1}
                className="w-7 h-7 inline-flex items-center justify-center border border-slate-200 bg-white rounded-lg hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed transition cursor-pointer"
                title="First Page"
              >
                <ChevronsLeft size={13} />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="w-7 h-7 inline-flex items-center justify-center border border-slate-200 bg-white rounded-lg hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed transition cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft size={13} />
              </button>

              {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  disabled={totalPages <= 1}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                    safePage === p
                      ? 'bg-[#C62828] text-white shadow-2xs'
                      : 'border border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="w-7 h-7 inline-flex items-center justify-center border border-slate-200 bg-white rounded-lg hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed transition cursor-pointer"
                title="Next Page"
              >
                <ChevronRight size={13} />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safePage >= totalPages}
                className="w-7 h-7 inline-flex items-center justify-center border border-slate-200 bg-white rounded-lg hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed transition cursor-pointer"
                title="Last Page"
              >
                <ChevronsRight size={13} />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 transition shadow-2xs cursor-pointer whitespace-nowrap"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
