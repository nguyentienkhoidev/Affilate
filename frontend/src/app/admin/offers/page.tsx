'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Tag,
  Plus,
  Search,
  CheckCircle2,
  Copy,
  Edit2,
  Trash2,
  Eye,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Pagination from '@/components/admin/Pagination';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminActionButton from '@/components/admin/AdminActionButton';
import { adminSelectClass } from '@/components/admin/adminStyles';
import { ROUTES } from '@/constants/routes';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { apiClient } from '@/lib/api/axios-client';
import { type OfferItem } from './_lib/data';
import { offerService } from '@/services/offerService';
import { usePermission } from '@/lib/admin/usePermission';
import { useServerPagination } from '@/lib/admin/useServerPagination';
import { useToast } from '@/context/ToastContext';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';

type TypeFilter = 'ALL' | 'COUPONS' | 'DEALS';
type StatusFilter = 'ALL' | 'EXCLUSIVE' | 'ACTIVE';
type SortBy = 'newest' | 'uses-desc' | 'discount-desc' | 'title-asc';

// Global memory cache to prevent duplicate store list API calls across tab switches
let cachedStoreOptions: Array<{ id: number; name: string }> | null = null;
let storeOptionsPromise: Promise<Array<{ id: number; name: string }>> | null = null;

async function fetchStoreOptionsCached(): Promise<Array<{ id: number; name: string }>> {
  if (cachedStoreOptions && cachedStoreOptions.length > 0) {
    return cachedStoreOptions;
  }
  if (storeOptionsPromise) {
    return storeOptionsPromise;
  }
  storeOptionsPromise = apiClient
    .get(API_ENDPOINTS.ADMIN.STORES, { params: { size: 100 } })
    .then((res) => {
      const list = res.data?.data?.content || res.data?.data;
      if (Array.isArray(list)) {
        cachedStoreOptions = list.map((s: any) => ({ id: Number(s.id), name: String(s.name) }));
        return cachedStoreOptions;
      }
      return [];
    })
    .catch(() => [])
    .finally(() => {
      storeOptionsPromise = null;
    });
  return storeOptionsPromise;
}

export default function AdminOffersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-400">Loading offers...</div>}>
      <AdminOffersPageContent />
    </Suspense>
  );
}

function AdminOffersPageContent() {
  const searchParams = useSearchParams();
  const initialStore = searchParams.get('store') || 'ALL';
  const initialNumericStoreId =
    initialStore !== 'ALL' && !Number.isNaN(Number(initialStore))
      ? Number(initialStore)
      : undefined;
  const { hasPermission } = usePermission();
  const { toast, confirm: confirmModal } = useToast();

  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState(initialStore);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [storeOptions, setStoreOptions] = useState<Array<{ id: number; name: string }>>(() => cachedStoreOptions || []);

  const loadStoreOptions = useCallback(async () => {
    if (storeOptions.length > 0) return;
    const opts = await fetchStoreOptionsCached();
    if (opts && opts.length > 0) {
      setStoreOptions(opts);
    }
  }, [storeOptions.length]);

  const {
    items: paginatedOffers,
    loading: isLoading,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    setCurrentPage,
    setPageSize,
    setParam,
    refresh: refreshOffers,
  } = useServerPagination<OfferItem>({
    endpoint: API_ENDPOINTS.ADMIN.OFFERS,
    defaultPageSize: 10,
    initialParams: {
      search: '',
      storeId: initialNumericStoreId,
    },
    mapItem: (o: any): OfferItem => {
      const storeLogo = o.storeLogo || '';
      const offerImage = o.image || o.imageUrl || storeLogo;
      return {
        id: Number(o.id),
        storeId: Number(o.storeId),
        storeName: o.storeName || 'Merchant Partner',
        storeSlug: o.storeSlug || '',
        storeLogo,
        imageUrl: offerImage,
        title: o.name || 'Verified Offer',
        discount: o.discountValue || 'Special Discount',
        couponCode: o.code || null,
        offerType: o.code ? 'coupon' : 'deal',
        isExclusive: Boolean(o.isVerified),
        isActive: o.isActive !== false,
        isVerified: Boolean(o.isVerified),
        usesCount: Number(o.usesCount || 0),
        destinationUrl: o.urlRef || `/out/${o.id}`,
        terms: o.description || 'Verified offer',
      };
    },
    fallbackItems: [],
  });

  // Only auto-load store options if navigating from a link specifying a store (?store=Nike)
  useEffect(() => {
    if (initialStore !== 'ALL') {
      fetchStoreOptionsCached().then((opts) => {
        setStoreOptions(opts);
        if (!initialNumericStoreId) {
          const matched = opts.find((s) => s.name.toLowerCase() === initialStore.toLowerCase());
          if (matched) {
            setParam('storeId', matched.id);
          }
        }
      });
    }
  }, [initialStore, initialNumericStoreId, setParam]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setParam('search', val.trim() || undefined);
  };

  const handleStoreChange = (val: string) => {
    setStoreFilter(val);
    if (val === 'ALL') {
      setParam('storeId', undefined);
    } else {
      const storeObj = storeOptions.find((s) => String(s.id) === val || s.name === val);
      setParam('storeId', storeObj ? storeObj.id : undefined);
    }
    setCurrentPage(1);
  };

  const handleTypeChange = (val: TypeFilter) => {
    setTypeFilter(val);
    setParam('type', val === 'ALL' ? undefined : val === 'COUPONS' ? 'coupon' : 'deal');
    setCurrentPage(1);
  };

  const handleStatusChange = (val: StatusFilter) => {
    setStatusFilter(val);
    setParam('verified', val === 'EXCLUSIVE' ? true : undefined);
    setCurrentPage(1);
  };

  const handleSortChange = (val: SortBy) => {
    setSortBy(val);
    if (val === 'title-asc') {
      setParam('sortBy', 'name');
      setParam('direction', 'asc');
    } else {
      setParam('sortBy', 'id');
      setParam('direction', 'desc');
    }
    setCurrentPage(1);
  };

  const isFiltered = search !== '' || storeFilter !== 'ALL' || typeFilter !== 'ALL' || statusFilter !== 'ALL' || sortBy !== 'newest';

  const handleResetFilters = () => {
    setSearch('');
    setStoreFilter('ALL');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setSortBy('newest');
    setParam('search', undefined);
    setParam('storeId', undefined);
    setParam('type', undefined);
    setParam('verified', undefined);
    setParam('sortBy', 'id');
    setParam('direction', 'desc');
    setCurrentPage(1);
  };

  const handleClone = async (o: OfferItem) => {
    const confirmed = await confirmModal({
      title: 'Clone Offer',
      message: `Duplicate "${o.title}" as a new offer?`,
      confirmText: 'Clone',
      cancelText: 'Cancel',
      variant: 'info',
    });
    if (!confirmed) return;
    try {
      await offerService.cloneOffer(o.id);
      await refreshOffers();
      toast.success(`Cloned offer "${o.title}" successfully!`);
    } catch {
      toast.error('Failed to clone offer.');
    }
  };

  const handleToggleStatus = async (o: OfferItem) => {
    try {
      await offerService.toggleOfferStatus(o.id);
      await refreshOffers();
      toast.success(`Offer "${o.title}" status updated.`);
    } catch {
      toast.error('Failed to toggle offer status.');
    }
  };

  const handleToggleVerify = async (o: OfferItem) => {
    try {
      await offerService.toggleOfferVerify(o.id);
      await refreshOffers();
      toast.success(`Offer "${o.title}" verification updated.`);
    } catch {
      toast.error('Failed to update verification status.');
    }
  };

  const handleDelete = async (o: OfferItem) => {
    const confirmed = await confirmModal({
      title: 'Delete Offer',
      message: (
        <span>
          Permanently delete{' '}
          <strong className="text-rose-600 font-bold">{o.title}</strong>?
        </span>
      ),
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    try {
      await offerService.deleteOffer(o.id);
      await refreshOffers();
      toast.success('Offer deleted successfully');
    } catch {
      toast.error('Failed to delete offer.');
    }
  };

  if (!hasPermission('offer.view')) {
    return <UnauthorizedAccess requiredPermission="offer.view" moduleName="Coupons & Deals" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <Tag className="text-[#C62828]" size={24} /> Coupons, Promo Codes &amp; Deals
            </h1>
            <span className="bg-[#C62828]/10 text-[#C62828] text-xs font-bold px-2.5 py-0.5 rounded-full">
              {`${totalItems} Offers Total`}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Manage discount vouchers, promo codes, and merchant affiliate offers.
          </p>
        </div>
        {hasPermission('offer.create') && (
          <Link href={ROUTES.ADMIN.OFFER_CREATE}>
            <Button size="sm"><Plus size={14} /> Create Offer</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4 space-y-3.5 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Input icon={<Search size={15} />} value={search} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Search title, voucher code, store..." />
          </div>

          <select
            value={storeFilter}
            onFocus={loadStoreOptions}
            onClick={loadStoreOptions}
            onChange={(e) => handleStoreChange(e.target.value)}
            className={adminSelectClass.replace('bg-slate-50 border-slate-200', 'bg-zinc-50 border-zinc-200')}
          >
            <option value="ALL">All Merchant Stores</option>
            {storeOptions.map((st) => (
              <option key={st.id} value={String(st.id)}>
                {st.name}
              </option>
            ))}
          </select>

          <select value={sortBy} onChange={(e) => handleSortChange(e.target.value as SortBy)} className={adminSelectClass.replace('bg-slate-50 border-slate-200', 'bg-zinc-50 border-zinc-200')}>
            <option value="newest">Sort: Newly Created</option>
            <option value="uses-desc">Sort: Most Used & Redeemed</option>
            <option value="discount-desc">Sort: Highest Discount</option>
            <option value="title-asc">Sort: Title (A to Z)</option>
          </select>
        </div>

        {/* Bottom filter row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 font-bold">
            <span className="text-[11px] text-zinc-400 mr-1 flex items-center gap-1"><SlidersHorizontal size={12} /> Type:</span>
            {(['ALL', 'COUPONS', 'DEALS'] as TypeFilter[]).map((t) => (
              <button key={t} onClick={() => handleTypeChange(t)} className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer text-[11px] ${typeFilter === t ? 'bg-zinc-900 text-white shadow-2xs' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80'}`}>
                {t === 'ALL' ? 'All Offers' : t === 'COUPONS' ? 'Coupons (Code)' : 'Deals (Direct Link)'}
              </button>
            ))}
            <div className="w-px h-4 bg-zinc-200 mx-1" />
            <button onClick={() => handleStatusChange(statusFilter === 'EXCLUSIVE' ? 'ALL' : 'EXCLUSIVE')} className={`px-2.5 py-1 rounded-lg transition font-semibold text-[11px] cursor-pointer ${statusFilter === 'EXCLUSIVE' ? 'bg-amber-500 text-white shadow-2xs' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80'}`}>
              ★ Exclusive Only
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-zinc-500">Found <strong className="text-zinc-900">{totalItems}</strong> matching offers</span>
            {isFiltered && (
              <button type="button" onClick={handleResetFilters} className="text-[11px] font-bold text-[#C62828] hover:underline cursor-pointer flex items-center gap-1">
                <RotateCcw size={11} /> Reset filters
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Store &amp; Offer</TableHead>
              <TableHead>Voucher Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead className="text-right w-44 min-w-[176px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOffers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-zinc-400">
                  No promotional offers or coupons match your current filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedOffers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="w-16">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-200 bg-white shrink-0 relative flex items-center justify-center p-1 shadow-2xs">
                      {offer.imageUrl ? (
                        <img src={offer.imageUrl} alt={offer.storeName} className="w-full h-full object-contain" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-white font-bold text-xs rounded">
                          {offer.storeName.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide">{offer.storeName}</span>
                      <p className="font-semibold text-zinc-900 line-clamp-1">{offer.title}</p>
                    </div>
                  </TableCell>

                  <TableCell>
                    {offer.couponCode ? (
                      <span className="font-mono text-xs font-bold text-zinc-800 bg-zinc-100 px-2 py-1 rounded border border-zinc-200">{offer.couponCode}</span>
                    ) : (
                      <span className="text-xs text-zinc-400 italic">No code (Auto-apply)</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <span className="font-bold text-zinc-900 text-xs">{offer.discount}</span>
                  </TableCell>

                  <TableCell>
                    <span className="font-mono text-xs font-semibold text-zinc-700">{offer.usesCount.toLocaleString()}</span>
                  </TableCell>

                  <TableCell className="text-right whitespace-nowrap w-44 min-w-[176px]">
                    <div className="flex items-center justify-end gap-1.5">
                      <AdminActionButton icon={Eye} href={`/store/${offer.storeSlug}?offer=${offer.id}`} target="_blank" title="View on public store coupon page" variant="success" />
                      {hasPermission('offer.clone') && (
                        <AdminActionButton icon={Copy} onClick={() => handleClone(offer)} title="Clone Coupon" variant="indigo" />
                      )}
                      {hasPermission('offer.update') && (
                        <AdminActionButton icon={Edit2} href={ROUTES.ADMIN.OFFER_EDIT(offer.id)} title="Edit Coupon" variant="primary" />
                      )}
                      {hasPermission('offer.delete') && (
                        <AdminActionButton icon={Trash2} onClick={() => handleDelete(offer)} title="Delete Coupon" variant="danger" />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} pageSizeOptions={[5, 10, 20, 50]} itemName="offers" />
      </Card>
    </div>
  );
}
