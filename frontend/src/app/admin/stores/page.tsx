'use client';

import { useState } from 'react';
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
  Check,
  Globe,
  SlidersHorizontal
} from 'lucide-react';
import Pagination from '@/components/admin/Pagination';
import { ROUTES } from '@/constants/routes';
import { STORES_STORE_KEY, DEFAULT_STORES, type AdminStore } from './_lib/data';
import { usePermission } from '@/lib/admin/usePermission';
import { useAdminCollection } from '@/lib/admin/useAdminCollection';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';

export default function AdminStoresPage() {
  const { hasPermission } = usePermission();
  const { items: stores, create, remove } = useAdminCollection<AdminStore>(STORES_STORE_KEY, DEFAULT_STORES);

  if (!hasPermission('store.view')) {
    return <UnauthorizedAccess requiredPermission="store.view" moduleName="Stores & Merchants" />;
  }
  const [search, setSearch] = useState('');
  const [networkFilter, setNetworkFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'FEATURED'>('ALL');
  const [sortBy, setSortBy] = useState<'name-asc' | 'rating-desc' | 'coupons-desc' | 'clicks-desc'>('name-asc');
  const [notification, setNotification] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleClone = (store: AdminStore) => {
    const cloned: AdminStore = {
      ...store,
      id: `s-${Date.now()}`,
      name: `${store.name} (Copy)`,
      slug: `${store.slug}-copy-${Date.now().toString().slice(-4)}`,
      clicks: 0,
      activeCoupons: 0,
    };
    create(cloned);
    showToast(`Duplicated store "${store.name}"`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete store: "${name}"?`)) {
      remove(id);
      showToast('Store deleted successfully');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setNetworkFilter('ALL');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
    setSortBy('name-asc');
    setCurrentPage(1);
  };

  // Filter & Sort
  const filtered = stores
    .filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.domain.toLowerCase().includes(search.toLowerCase()) ||
        s.slug.toLowerCase().includes(search.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(search.toLowerCase()));

      const matchNetwork = networkFilter === 'ALL' || s.network === networkFilter;
      const matchCategory = categoryFilter === 'ALL' || s.category === categoryFilter;

      let matchStatus = true;
      if (statusFilter === 'ACTIVE') matchStatus = s.isActive;
      else if (statusFilter === 'INACTIVE') matchStatus = !s.isActive;
      else if (statusFilter === 'FEATURED') matchStatus = s.isFeatured;

      return matchSearch && matchNetwork && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'coupons-desc') return (b.activeCoupons || 0) - (a.activeCoupons || 0);
      if (sortBy === 'clicks-desc') return (b.clicks || 0) - (a.clicks || 0);
      return a.name.localeCompare(b.name);
    });

  // Unique categories for filter dropdown
  const availableCategories = Array.from(new Set(stores.map((s) => s.category).filter(Boolean)));

  const isFiltered =
    search !== '' ||
    networkFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    sortBy !== 'name-asc';

  // Pagination Slice
  const totalItems = filtered.length;
  const paginatedStores = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-fadeIn">
          <Check size={16} className="text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <StoreIcon className="text-[#C62828]" size={26} /> Merchant Stores Directory
            </h1>
            <span className="bg-[#C62828]/10 text-[#C62828] text-xs font-bold px-2.5 py-0.5 rounded-full">
              {stores.length} Stores Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage merchant brand profiles, logos, affiliate networks, and verified discount coupons.
          </p>
        </div>

        {hasPermission('store.create') && (
          <Link
            href={ROUTES.ADMIN.STORE_CREATE}
            className="h-9 px-4 inline-flex items-center justify-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus size={16} /> Add New Store
          </Link>
        )}
      </div>

      {/* 2. Advanced Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3.5">
        
        {/* Top Search & Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search store name, slug, domain..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
              <option value="FEATURED">Featured Directory Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] cursor-pointer"
            >
              <option value="name-asc">Sort: Name (A to Z)</option>
              <option value="rating-desc">Sort: Highest Rating</option>
              <option value="coupons-desc">Sort: Most Coupons</option>
              <option value="clicks-desc">Sort: Highest Traffic / Clicks</option>
            </select>
          </div>
        </div>

        {/* Network Filter Pills & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 font-bold">
            <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
              <SlidersHorizontal size={12} /> Network:
            </span>
            {(['ALL', 'partnerboost', 'impact', 'shareasale', 'cj', 'direct'] as const).map((net) => (
              <button
                key={net}
                onClick={() => {
                  setNetworkFilter(net);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg transition text-[11px] uppercase tracking-wider cursor-pointer whitespace-nowrap ${
                  networkFilter === net
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {net}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500 font-medium">
              Found <strong className="text-slate-900">{totalItems}</strong> matching stores
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-[#C62828] hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 3. Stores Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Merchant Brand</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Network & Deals</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right w-44 min-w-[176px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No merchant stores match your current filters.
                  </td>
                </tr>
              ) : (
                paginatedStores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-50/60 transition-colors group">
                    
                    {/* Brand Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                          {store.logoUrl ? (
                            <Image
                              src={store.logoUrl}
                              alt={store.name}
                              width={40}
                              height={40}
                              className="object-contain w-full h-full"
                            />
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
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                Featured
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-mono text-slate-400">/{store.slug}</span>
                            <span>•</span>
                            <a
                              href={`https://${store.domain}`}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline flex items-center gap-0.5 text-slate-500 hover:text-slate-800"
                            >
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

                    {/* Network & Active Coupons */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className="inline-block font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                          {store.network}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                          <Tag size={12} className="text-[#C62828]" />
                          <span>{store.activeCoupons} Coupons ({store.maxDiscount})</span>
                        </div>
                      </div>
                    </td>

                    {/* Rating & Reviews */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-800 font-bold">
                        <Star size={13} className="text-amber-500 fill-amber-500" />
                        <span>{store.rating.toFixed(1)}</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          ({store.reviewsCount})
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {store.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">
                          <XCircle size={12} /> Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap w-44 min-w-[176px]">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/store/${store.slug}`}
                          target="_blank"
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 hover:border-slate-300 transition shrink-0 shadow-2xs"
                          title="View Live Store Page"
                        >
                          <Globe size={13} />
                        </Link>

                        {hasPermission('store.clone') && (
                          <button
                            onClick={() => handleClone(store)}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-indigo-50/50 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition shrink-0 shadow-2xs cursor-pointer"
                            title="Clone Store"
                          >
                            <Copy size={13} />
                          </button>
                        )}

                        {hasPermission('store.update') && (
                          <Link
                            href={ROUTES.ADMIN.STORE_EDIT(store.id)}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-rose-50/60 text-slate-600 hover:text-[#C62828] hover:border-[#C62828]/40 transition shrink-0 shadow-2xs cursor-pointer"
                            title="Edit Store & Logo"
                          >
                            <Edit2 size={13} />
                          </Link>
                        )}

                        {hasPermission('store.delete') && (
                          <button
                            onClick={() => handleDelete(store.id, store.name)}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-rose-50/60 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition shrink-0 shadow-2xs cursor-pointer"
                            title="Delete Store"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 20, 50]}
          itemName="stores"
        />

      </div>

    </div>
  );
}
