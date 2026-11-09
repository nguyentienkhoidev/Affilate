'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Menu as MenuIcon,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Loader2,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useServerPagination } from '@/lib/admin/useServerPagination';
import { useToast } from '@/context/ToastContext';
import Pagination from '@/components/admin/Pagination';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminFilterBar from '@/components/admin/AdminFilterBar';
import AdminTableShell from '@/components/admin/AdminTableShell';
import { adminSelectClass, adminSearchInputClass } from '@/components/admin/adminStyles';
import { type MenuItem } from './_lib/data';
import MenuTableRow from './_components/MenuTableRow';
import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

type TabPosition = 'all' | 'main' | 'footer';
type StatusFilter = 'all' | 'active' | 'inactive';
type SortBy = 'order-asc' | 'order-desc' | 'title-asc' | 'title-desc';

const TABLE_COLUMNS = [
  { label: 'Order', className: 'w-16' },
  { label: 'Menu Label' },
  { label: 'Placement' },
  { label: 'Destination Type' },
  { label: 'Target Destination' },
  { label: 'Status' },
  { label: 'Actions', className: 'text-right w-28 min-w-[112px]' },
];

export default function AdminMenusPage() {
  const { toast, confirm: confirmModal } = useToast();

  const [activeTab, setActiveTab] = useState<TabPosition>('all');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('order-asc');

  const {
    items: displayedMenus,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    loading,
    setCurrentPage,
    setPageSize,
    refresh,
  } = useServerPagination<MenuItem>({
    endpoint: API_ENDPOINTS.ADMIN.MENUS,
    defaultPageSize: 10,
    search,
    filters: {
      position: activeTab !== 'all' ? activeTab : undefined,
    },
    transformItem: (m: any) => ({
      id: Number(m.id),
      title: m.title || '',
      position: (m.position || 'main') as any,
      targetType: (m.targetType || 'category') as any,
      targetValue: m.targetValue || '',
      imageIcon: m.imageIcon,
      sortOrder: Number(m.sortOrder || 1),
      isActive: Boolean(m.isActive),
    }),
    fallbackItems: [],
  });

  const isFiltered =
    activeTab !== 'all' ||
    search.trim() !== '' ||
    typeFilter !== 'all' ||
    statusFilter !== 'all' ||
    sortBy !== 'order-asc';

  const handleResetFilters = () => {
    setActiveTab('all');
    setSearch('');
    setTypeFilter('all');
    setStatusFilter('all');
    setSortBy('order-asc');
  };

  const handleDelete = async (id: number) => {
    const item = displayedMenus.find((m: MenuItem) => m.id === id);
    const confirmed = await confirmModal({
      title: 'Delete Menu Item',
      message: (
        <span>
          Are you sure you want to delete{' '}
          <strong className="text-rose-600 font-bold">{item?.title || 'this item'}</strong>?
        </span>
      ),
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      try {
        await apiClient.delete(`${API_ENDPOINTS.ADMIN.MENUS}/${id}`);
        refresh();
        toast.success('Menu item deleted successfully');
      } catch (err) {
        toast.error('Failed to delete menu item');
      }
    }
  };

  const mainCount = displayedMenus.filter((m: MenuItem) => m.position === 'main').length;
  const footerCount = displayedMenus.filter((m: MenuItem) => m.position === 'footer').length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <AdminPageHeader
        icon={MenuIcon}
        title="Navigation Menus Manager"
        badge={`${totalElements} Links Total`}
        description="Configure primary header links, footer sitemaps, category drop-downs, and custom affiliate routes."
      >
        <Link
          href={ROUTES.ADMIN.MENU_CREATE}
          className="h-9 px-4 inline-flex items-center justify-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus size={15} /> Add Menu Item
        </Link>
      </AdminPageHeader>

      {/* Advanced Filter Box */}
      <AdminFilterBar
        totalItems={totalElements}
        itemName="menu items"
        isFiltered={isFiltered}
        onReset={handleResetFilters}
      >
        <div className="space-y-3">
          {/* Position Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`h-8 px-3.5 inline-flex items-center justify-center text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Placements ({totalElements})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('main')}
              className={`h-8 px-3.5 inline-flex items-center justify-center text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'main'
                  ? 'bg-white text-[#C62828] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Header Main Nav ({mainCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('footer')}
              className={`h-8 px-3.5 inline-flex items-center justify-center text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'footer'
                  ? 'bg-white text-[#C62828] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Footer Links ({footerCount})
            </button>
          </div>

          {/* Filter controls row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t border-slate-100">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by label or URL..."
                className={adminSearchInputClass}
              />
            </div>

            {/* Target Type Filter */}
            <div className="flex items-center gap-1.5">
              <Filter size={14} className="text-slate-400 shrink-0" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={adminSelectClass}
              >
                <option value="all">All Destination Types</option>
                <option value="custom">Custom External URL</option>
                <option value="page">Static Page</option>
                <option value="category">Category</option>
                <option value="store">Merchant Store</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className={adminSelectClass}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            {/* Sort By */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown size={14} className="text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className={adminSelectClass}
              >
                <option value="order-asc">Order (1 → 99)</option>
                <option value="order-desc">Order (99 → 1)</option>
                <option value="title-asc">Label (A → Z)</option>
                <option value="title-desc">Label (Z → A)</option>
              </select>
            </div>
          </div>
        </div>
      </AdminFilterBar>

      {/* Menus Table */}
      <AdminTableShell
        columns={TABLE_COLUMNS}
        isEmpty={displayedMenus.length === 0}
        emptyMessage="No navigation items found. Try adjusting your search query, placement, or filters."
        footer={
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalElements}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        }
      >
        {displayedMenus.map((item) => (
          <MenuTableRow key={item.id} item={item} onDelete={handleDelete} />
        ))}
      </AdminTableShell>
    </div>
  );
}
