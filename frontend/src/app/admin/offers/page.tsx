'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import {
  Tag,
  Plus,
  Search,
  CheckCircle2,
  Copy,
  Edit2,
  Trash2,
  Sparkles,
  Eye,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import Pagination from '@/components/admin/Pagination';
import { OFFERS_STORE_KEY, DEFAULT_OFFERS, type OfferItem } from './_lib/data';
import { usePermission } from '@/lib/admin/usePermission';
import { useAdminCollection } from '@/lib/admin/useAdminCollection';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';

export default function AdminOffersPage() {
  const { hasPermission } = usePermission();
  const { items: offers, create, update, remove } = useAdminCollection<OfferItem>(OFFERS_STORE_KEY, DEFAULT_OFFERS);

  if (!hasPermission('offer.view')) {
    return <UnauthorizedAccess requiredPermission="offer.view" moduleName="Coupons & Deals" />;
  }

  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'COUPONS' | 'DEALS'>('ALL');
  const [verifiedFilter, setVerifiedFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'EXCLUSIVE' | 'ACTIVE'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'uses-desc' | 'discount-desc' | 'title-asc'>('newest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleClone = (o: OfferItem) => {
    const cloned: OfferItem = {
      ...o,
      id: Date.now(),
      title: `${o.title} (Clone)`,
      couponCode: o.couponCode ? `${o.couponCode}_COPY` : null,
      usesCount: 0,
      verifiedAt: 'Just now',
    };
    create(cloned);
  };

  const handleToggleVerified = (id: number) => {
    const target = offers.find((o) => o.id === id);
    if (target) {
      update(id, { isVerified: !target.isVerified, verifiedAt: 'Just now' });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Permanently delete this coupon code / deal?')) {
      remove(id);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStoreFilter('ALL');
    setTypeFilter('ALL');
    setVerifiedFilter('ALL');
    setStatusFilter('ALL');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Distinct stores for dropdown
  const storeOptions = Array.from(new Set(offers.map((o) => o.storeName).filter(Boolean)));

  const isFiltered =
    search !== '' ||
    storeFilter !== 'ALL' ||
    typeFilter !== 'ALL' ||
    verifiedFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    sortBy !== 'newest';

  const filtered = offers
    .filter((o) => {
      const matchSearch =
        o.title.toLowerCase().includes(search.toLowerCase()) ||
        o.storeName.toLowerCase().includes(search.toLowerCase()) ||
        (o.couponCode && o.couponCode.toLowerCase().includes(search.toLowerCase()));

      const matchStore = storeFilter === 'ALL' || o.storeName === storeFilter;

      const matchType =
        typeFilter === 'ALL' ||
        (typeFilter === 'COUPONS' && o.offerType === 'coupon') ||
        (typeFilter === 'DEALS' && o.offerType === 'deal');

      const matchVerified =
        verifiedFilter === 'ALL' ||
        (verifiedFilter === 'VERIFIED' && o.isVerified) ||
        (verifiedFilter === 'UNVERIFIED' && !o.isVerified);

      let matchStatus = true;
      if (statusFilter === 'EXCLUSIVE') matchStatus = o.isExclusive;
      else if (statusFilter === 'ACTIVE') matchStatus = o.isActive;

      return matchSearch && matchStore && matchType && matchVerified && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'uses-desc') return (b.usesCount || 0) - (a.usesCount || 0);
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
      if (sortBy === 'discount-desc') {
        const numA = parseFloat(a.discount.replace(/[^0-9.]/g, '')) || 0;
        const numB = parseFloat(b.discount.replace(/[^0-9.]/g, '')) || 0;
        return numB - numA;
      }
      return b.id - a.id;
    });

  const totalItems = filtered.length;
  const paginatedOffers = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <Tag className="text-[#C62828]" size={24} /> Coupons, Promo Codes & Deals
            </h1>
            <span className="bg-[#C62828]/10 text-[#C62828] text-xs font-bold px-2.5 py-0.5 rounded-full">
              {offers.length} Offers Total
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Manage tested discount vouchers, verification statuses, and merchant affiliate offers.
          </p>
        </div>

        {hasPermission('offer.create') && (
          <Link href={ROUTES.ADMIN.OFFER_CREATE}>
            <Button size="sm">
              <Plus size={14} /> Create Offer
            </Button>
          </Link>
        )}
      </div>

      {/* Advanced Filter Toolbar */}
      <Card className="p-4 space-y-3.5 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Input
              icon={<Search size={15} />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search title, voucher code, store..."
            />
          </div>

          {/* Store Filter */}
          <div>
            <select
              value={storeFilter}
              onChange={(e) => {
                setStoreFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] cursor-pointer"
            >
              <option value="ALL">All Merchant Stores</option>
              {storeOptions.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Filter */}
          <div>
            <select
              value={verifiedFilter}
              onChange={(e) => {
                setVerifiedFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] cursor-pointer"
            >
              <option value="ALL">All Verification Statuses</option>
              <option value="VERIFIED">Verified Only (Green Badge)</option>
              <option value="UNVERIFIED">Unverified Only</option>
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
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] cursor-pointer"
            >
              <option value="newest">Sort: Newly Created</option>
              <option value="uses-desc">Sort: Most Used & Redeemed</option>
              <option value="discount-desc">Sort: Highest Discount</option>
              <option value="title-asc">Sort: Title (A to Z)</option>
            </select>
          </div>
        </div>

        {/* Bottom Filter Tabs & Summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 font-bold">
            <span className="text-[11px] text-zinc-400 mr-1 flex items-center gap-1">
              <SlidersHorizontal size={12} /> Type:
            </span>
            {(['ALL', 'COUPONS', 'DEALS'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTypeFilter(t);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer text-[11px] ${
                  typeFilter === t
                    ? 'bg-zinc-900 text-white shadow-2xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80'
                }`}
              >
                {t === 'ALL' ? 'All Offers' : t === 'COUPONS' ? 'Coupons (Code)' : 'Deals (Direct Link)'}
              </button>
            ))}

            <div className="w-px h-4 bg-zinc-200 mx-1" />

            <button
              onClick={() => {
                setStatusFilter(statusFilter === 'EXCLUSIVE' ? 'ALL' : 'EXCLUSIVE');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg transition font-semibold text-[11px] cursor-pointer ${
                statusFilter === 'EXCLUSIVE'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80'
              }`}
            >
              ★ Exclusive Only
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-zinc-500">
              Found <strong className="text-zinc-900">{totalItems}</strong> matching offers
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-[#C62828] hover:underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw size={11} /> Reset filters
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card className="overflow-hidden shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store & Offer</TableHead>
              <TableHead>Voucher Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Verification</TableHead>
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
                  <TableCell>
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide">
                        {offer.storeName}
                      </span>
                      <p className="font-semibold text-zinc-900 line-clamp-1">
                        {offer.title}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    {offer.couponCode ? (
                      <span className="font-mono text-xs font-bold text-zinc-800 bg-zinc-100 px-2 py-1 rounded border border-zinc-200">
                        {offer.couponCode}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400 italic">No code (Auto-apply)</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <span className="font-bold text-zinc-900 text-xs">
                      {offer.discount}
                    </span>
                  </TableCell>

                  <TableCell>
                    <button
                      onClick={() => handleToggleVerified(offer.id)}
                      className="flex items-center gap-1 text-xs cursor-pointer group"
                      title="Click to toggle verification status"
                    >
                      {offer.isVerified ? (
                        <Badge variant="success">
                          <CheckCircle2 size={11} className="mr-0.5" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline">Unverified</Badge>
                      )}
                    </button>
                  </TableCell>

                  <TableCell>
                    <span className="font-mono text-xs text-zinc-500">
                      {offer.usesCount.toLocaleString()}
                    </span>
                  </TableCell>

                  <TableCell className="text-right whitespace-nowrap w-44 min-w-[176px]">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/store/${offer.storeSlug}?offer=${offer.id}`}
                        target="_blank"
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 hover:border-emerald-300 transition shrink-0 shadow-2xs"
                        title="View on public store coupon page"
                      >
                        <Eye size={13} />
                      </Link>
                      {hasPermission('offer.clone') && (
                        <button
                          onClick={() => handleClone(offer)}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-indigo-50/50 text-zinc-500 hover:text-indigo-600 hover:border-indigo-300 transition shrink-0 shadow-2xs cursor-pointer"
                          title="Clone Coupon"
                        >
                          <Copy size={13} />
                        </button>
                      )}
                      {hasPermission('offer.update') && (
                        <Link
                          href={ROUTES.ADMIN.OFFER_EDIT(offer.id)}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-rose-50/60 text-zinc-600 hover:text-[#C62828] hover:border-[#C62828]/40 transition shrink-0 shadow-2xs cursor-pointer"
                          title="Edit Coupon"
                        >
                          <Edit2 size={13} />
                        </Link>
                      )}
                      {hasPermission('offer.delete') && (
                        <button
                          onClick={() => handleDelete(offer.id)}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-rose-50/60 text-zinc-400 hover:text-rose-600 hover:border-rose-300 transition shrink-0 shadow-2xs cursor-pointer"
                          title="Delete Coupon"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 20, 50]}
          itemName="offers"
        />
      </Card>

    </div>
  );
}
