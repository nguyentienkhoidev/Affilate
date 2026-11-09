'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Store as StoreIcon,
  Plus,
  Search,
  Star,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Tag,
  Globe,
  SlidersHorizontal,
  Eye,
} from 'lucide-react';
import Pagination from '@/components/admin/Pagination';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminFilterBar from '@/components/admin/AdminFilterBar';
import AdminTableShell from '@/components/admin/AdminTableShell';
import AdminActionButton from '@/components/admin/AdminActionButton';
import { adminSelectClass, adminSearchInputClass } from '@/components/admin/adminStyles';
import { ROUTES } from '@/constants/routes';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { apiClient } from '@/lib/api/axios-client';
import storeService from '@/services/storeService';
import { type AdminStore } from './_lib/data';
import StoreOffersModal from './_components/StoreOffersModal';
import { usePermission } from '@/lib/admin/usePermission';
import { useServerPagination } from '@/lib/admin/useServerPagination';
import { useToast } from '@/context/ToastContext';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'FEATURED';
type SortBy = 'name-asc' | 'rating-desc' | 'coupons-desc' | 'clicks-desc';

interface CategoryOption {
  id: number;
  name: string;
}

// Global memory cache to prevent duplicate category list API calls across tab switches
let cachedCategories: CategoryOption[] | null = null;
let categoriesPromise: Promise<CategoryOption[]> | null = null;

async function fetchCategoriesCached(): Promise<CategoryOption[]> {
  if (cachedCategories && cachedCategories.length > 0) {
    return cachedCategories;
  }
  if (categoriesPromise) {
    return categoriesPromise;
  }
  categoriesPromise = apiClient
    .get(API_ENDPOINTS.ADMIN.CATEGORIES, { params: { size: 100 } })
    .then((res) => {
      const list = res.data?.data?.content || res.data?.data;
      if (Array.isArray(list)) {
        cachedCategories = list.map((c: any) => ({
          id: Number(c.id),
          name: String(c.name),
        }));
        return cachedCategories;
      }
      return [];
    })
    .catch(() => [])
    .finally(() => {
      categoriesPromise = null;
    });
  return categoriesPromise;
}

const TABLE_COLUMNS = [
  { label: 'Merchant Brand' },
  { label: 'Category' },
  { label: 'Coupons & Deals' },
  { label: 'Rating' },
  { label: 'Status' },
  { label: 'Actions', className: 'text-right w-48 min-w-[192px]' },
];

export default function AdminStoresPage() {
  const { hasPermission } = usePermission();
  const { toast, confirm: confirmModal } = useToast();

  const [selectedStoreForOffers, setSelectedStoreForOffers] = useState<AdminStore | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('name-asc');
  const [availableCategories, setAvailableCategories] = useState<CategoryOption[]>(() => cachedCategories || []);

  const loadCategories = useCallback(async () => {
    if (availableCategories.length > 0) return;
    const cats = await fetchCategoriesCached();
    if (cats && cats.length > 0) {
      setAvailableCategories(cats);
    }
  }, [availableCategories.length]);

  const {
    items: pagedItems,
    loading: isLoading,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    setCurrentPage,
    setPageSize,
    setParam,
    refresh: refreshStores,
  } = useServerPagination<AdminStore>({
    endpoint: API_ENDPOINTS.ADMIN.STORES,
    defaultPageSize: 10,
    initialParams: {
      search: '',
      status: undefined,
      sortBy: 'name',
      direction: 'asc',
    },
    mapItem: (s: any): AdminStore => ({
      id: String(s.id),
      name: String(s.name),
      slug: String(s.slug),
      domain: s.afWebsite
        ? s.afWebsite.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').replace(/^www\./i, '')
        : (s.domain || `${s.slug}.com`),
      logoUrl: s.logo || s.logoUrl,
      categoryId: s.categoryId ? Number(s.categoryId) : undefined,
      category: s.categoryName || s.category || 'General',
      rating: Number(s.ratingScore ?? 4.8),
      reviewsCount: Number(s.ratingCount ?? 0),
      activeCoupons: Number(s.activeOffersCount ?? 0),
      maxDiscount: s.maxOffer ? `Up to ${s.maxOffer}% OFF` : '20%',
      affiliateUrl: s.afWebsite || `/go/${s.slug}`,
      description: s.aboutStore || s.description || `${s.name} promo codes`,
      isFeatured: Boolean(s.isFeatured || s.featured),
      isActive: s.isActive !== false,
      clicks: Number(s.afVisitCount ?? 0),
    }),
    fallbackItems: [],
  });

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setParam('search', val.trim() || undefined);
  };

  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    if (val === 'ALL') {
      setParam('categoryId', undefined);
      setParam('category', undefined);
    } else {
      setParam('categoryId', Number(val));
    }
  };

  const handleStatusChange = (val: StatusFilter) => {
    setStatusFilter(val);
    setParam('status', val !== 'ALL' ? val : undefined);
  };

  const handleSortChange = (val: SortBy) => {
    setSortBy(val);
    if (val === 'rating-desc') {
      setParam('sortBy', 'ratingScore');
      setParam('direction', 'desc');
    } else if (val === 'coupons-desc') {
      setParam('sortBy', 'sortOrder');
      setParam('direction', 'asc');
    } else if (val === 'clicks-desc') {
      setParam('sortBy', 'afVisitCount');
      setParam('direction', 'desc');
    } else {
      setParam('sortBy', 'name');
      setParam('direction', 'asc');
    }
  };

  const isFiltered = search !== '' || categoryFilter !== 'ALL' || statusFilter !== 'ALL' || sortBy !== 'name-asc';

  const handleResetFilters = () => {
    setSearch('');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
    setSortBy('name-asc');
    setParam('search', undefined);
    setParam('categoryId', undefined);
    setParam('category', undefined);
    setParam('status', undefined);
    setParam('sortBy', 'name');
    setParam('direction', 'asc');
  };

  const handleClone = async (store: AdminStore) => {
    const confirmed = await confirmModal({
      title: 'Clone store',
      message: `Duplicate "${store.name}" as a draft copy?`,
      confirmText: 'Clone',
      cancelText: 'Cancel',
      variant: 'info',
    });
    if (!confirmed) return;
    try {
      await storeService.cloneStore(store.id);
      await refreshStores();
      toast.success(`Cloned store "${store.name}" successfully!`);
    } catch {
      toast.error('Failed to clone store.');
    }
  };

  const handleToggleStatus = async (store: AdminStore) => {
    try {
      await storeService.toggleStoreStatus(store.id);
      await refreshStores();
      toast.success(`Store "${store.name}" status updated.`);
    } catch {
      toast.error('Failed to toggle store status.');
    }
  };

  const handleDelete = async (store: AdminStore) => {
    const confirmed = await confirmModal({
      title: 'Delete store permanently',
      message: (
        <span>
          Are you sure you want to delete{' '}
          <strong className="text-rose-600 font-bold">{store.name}</strong>?
        </span>
      ),
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    try {
      await storeService.deleteStore(store.id);
      await refreshStores();
      toast.success(`Store "${store.name}" deleted successfully`);
    } catch {
      toast.error('Failed to delete store.');
    }
  };

  if (!hasPermission('store.view')) {
    return <UnauthorizedAccess requiredPermission="store.view" moduleName="Stores & Merchants" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        icon={StoreIcon}
        title="Merchant Stores Directory"
        badge={`${totalItems} Stores Total`}
        description="Manage merchant brand profiles, logos, and verified discount coupons."
      >
        {hasPermission('store.create') && (
          <Link
            href={ROUTES.ADMIN.STORE_CREATE}
            className="h-9 px-4 inline-flex items-center justify-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus size={16} /> Add New Store
          </Link>
        )}
      </AdminPageHeader>

      {/* Filters */}
      <AdminFilterBar totalItems={totalItems} itemName="stores" isFiltered={isFiltered} onReset={handleResetFilters}>
        {/* Top row: search + selects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search store name, slug, domain..."
              className={adminSearchInputClass}
            />
          </div>

          <select
            value={categoryFilter}
            onFocus={loadCategories}
            onClick={loadCategories}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={adminSelectClass}
          >
            <option value="ALL">All Categories</option>
            {availableCategories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>

          <select value={statusFilter} onChange={(e) => handleStatusChange(e.target.value as StatusFilter)} className={adminSelectClass}>
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
            <option value="FEATURED">Featured Directory Only</option>
          </select>

          <select value={sortBy} onChange={(e) => handleSortChange(e.target.value as SortBy)} className={adminSelectClass}>
            <option value="name-asc">Sort: Name (A to Z)</option>
            <option value="rating-desc">Sort: Highest Rating</option>
            <option value="coupons-desc">Sort: Most Coupons</option>
            <option value="clicks-desc">Sort: Highest Traffic / Clicks</option>
          </select>
        </div>
      </AdminFilterBar>

      {/* Table */}
      <AdminTableShell
        columns={TABLE_COLUMNS}
        rowCount={pagedItems.length}
        emptyMessage="No merchant stores match your current filters."
      >
        {pagedItems.map((store) => {
          const liveOffersCount = store.activeCoupons ?? 0;
          return (
            <tr key={store.id} className="hover:bg-slate-50/60 transition-colors group">
              {/* Brand */}
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    {store.logoUrl ? (
                      <Image src={store.logoUrl} alt={store.name} width={40} height={40} className="object-contain w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 text-slate-400 font-black flex items-center justify-center text-xs">
                        {store.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-sm group-hover:text-[#C62828] transition-colors">
                        {store.name}
                      </span>
                      {store.isFeatured && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded">Featured</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-mono text-slate-400">/{store.slug}</span>
                      <span>•</span>
                      <a href={`https://${store.domain}`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-0.5 text-slate-500 hover:text-slate-800">
                        <span>{store.domain}</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </div>
              </td>

              {/* Category */}
              <td className="py-3.5 px-4">
                <span className="inline-block bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-[11px]">
                  {store.category}
                </span>
              </td>

              {/* Coupons & Deals Popup Trigger Button */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => setSelectedStoreForOffers(store)}
                  className="w-40 h-8 inline-flex items-center justify-between bg-slate-100 hover:bg-[#C62828] hover:text-white text-slate-700 font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer group/btn shadow-2xs whitespace-nowrap border border-slate-200/80 shrink-0"
                  title="Click to view all coupons, promo codes & deals in this store"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Tag size={13} className="text-[#C62828] group-hover/btn:text-white transition-colors shrink-0" />
                    <span className="font-bold text-xs">{liveOffersCount}</span>
                    <span className="text-slate-500 group-hover/btn:text-white/90 text-xs font-medium">offers</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-white group-hover/btn:bg-white/20 text-slate-600 group-hover/btn:text-white px-1.5 py-0.5 rounded-md border border-slate-200/60 group-hover/btn:border-transparent transition-colors shrink-0">
                    View
                  </span>
                </button>
              </td>

              {/* Rating */}
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-1 text-slate-800 font-bold">
                  <Star size={13} className="text-amber-500 fill-amber-500" />
                  <span>{store.rating.toFixed(1)}</span>
                  <span className="text-[11px] text-slate-400 font-normal">({store.reviewsCount})</span>
                </div>
              </td>

              {/* Status */}
              <td className="py-3.5 px-4">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(store)}
                  title="Click to toggle active status"
                  className="cursor-pointer hover:opacity-80 transition inline-block"
                >
                  {store.isActive ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                      <CheckCircle2 size={12} /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">
                      <XCircle size={12} /> Inactive
                    </span>
                  )}
                </button>
              </td>

              {/* Actions */}
              <td className="py-3.5 px-4 text-right whitespace-nowrap w-48 min-w-[192px]">
                <div className="flex items-center justify-end gap-1.5">
                  <AdminActionButton
                    icon={Eye}
                    onClick={() => setSelectedStoreForOffers(store)}
                    title="View Coupons, Promo Codes & Deals in this store"
                    variant="default"
                  />
                  <AdminActionButton icon={Globe} href={`/store/${store.slug}`} target="_blank" title="View Live Store Page" variant="default" />
                  {hasPermission('store.clone') && (
                    <AdminActionButton icon={Copy} onClick={() => handleClone(store)} title="Clone Store" variant="indigo" />
                  )}
                  {hasPermission('store.update') && (
                    <AdminActionButton icon={Edit2} href={ROUTES.ADMIN.STORE_EDIT(store.id)} title="Edit Store & Logo" variant="primary" />
                  )}
                  {hasPermission('store.delete') && (
                    <AdminActionButton icon={Trash2} onClick={() => handleDelete(store)} title="Delete Store" variant="danger" />
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </AdminTableShell>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[5, 10, 20, 50]}
        itemName="stores"
      />

      {/* Store Offers Popup Modal */}
      <StoreOffersModal
        isOpen={selectedStoreForOffers !== null}
        onClose={() => setSelectedStoreForOffers(null)}
        store={selectedStoreForOffers}
      />
    </div>
  );
}
