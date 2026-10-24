'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Menu as MenuIcon,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ArrowUpDown,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useAdminCollection } from '@/lib/admin/useAdminCollection';
import Pagination from '@/components/admin/Pagination';
import { MENUS_STORE_KEY, DEFAULT_MENUS, type MenuItem } from './_lib/data';

export default function AdminMenusPage() {
  const { items: menus, remove } = useAdminCollection<MenuItem>(MENUS_STORE_KEY, DEFAULT_MENUS);
  const [activeTab, setActiveTab] = useState<'all' | 'main' | 'footer'>('all');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'order-asc' | 'order-desc' | 'title-asc' | 'title-desc'>('order-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleDelete = (id: number) => {
    if (confirm('Delete this menu item?')) {
      remove(id);
    }
  };

  const handleResetFilters = () => {
    setActiveTab('all');
    setSearch('');
    setTypeFilter('all');
    setStatusFilter('all');
    setSortBy('order-asc');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    activeTab !== 'all' ||
    search.trim() !== '' ||
    typeFilter !== 'all' ||
    statusFilter !== 'all' ||
    sortBy !== 'order-asc';

  // Filter & Search
  const filtered = menus.filter((item) => {
    if (activeTab !== 'all' && item.position !== activeTab) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchLabel = item.title.toLowerCase().includes(q);
      const matchValue = item.targetValue.toLowerCase().includes(q);
      if (!matchLabel && !matchValue) return false;
    }

    if (typeFilter !== 'all' && item.targetType !== typeFilter) return false;

    if (statusFilter === 'active' && !item.isActive) return false;
    if (statusFilter === 'inactive' && item.isActive) return false;

    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'order-asc') return a.sortOrder - b.sortOrder;
    if (sortBy === 'order-desc') return b.sortOrder - a.sortOrder;
    if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
    if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
    return 0;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const pagedItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const mainCount = menus.filter((m) => m.position === 'main').length;
  const footerCount = menus.filter((m) => m.position === 'footer').length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MenuIcon className="text-indigo-600" size={26} /> Navigation Menus Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure primary header links, footer sitemaps, category drop-downs, and custom affiliate routes.
          </p>
        </div>

        <Link
          href={ROUTES.ADMIN.MENU_CREATE}
          className="h-9 px-4 inline-flex items-center justify-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus size={15} /> Add Menu Item
        </Link>
      </div>

      {/* Advanced Filter Box */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Position Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('all');
                setCurrentPage(1);
              }}
              className={`h-8 px-3.5 inline-flex items-center justify-center text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Placements ({menus.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('main');
                setCurrentPage(1);
              }}
              className={`h-8 px-3.5 inline-flex items-center justify-center text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'main'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Header Main Nav ({mainCount})
            </button>
            <button
              onClick={() => {
                setActiveTab('footer');
                setCurrentPage(1);
              }}
              className={`h-8 px-3.5 inline-flex items-center justify-center text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'footer'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Footer Links ({footerCount})
            </button>
          </div>

          {/* Quick Clear */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>

        {/* Filter controls row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t border-slate-100">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by label or URL..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Target Type Filter */}
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-slate-400 shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
              setCurrentPage(1);
            }}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="order-asc">Order (1 → 99)</option>
              <option value="order-desc">Order (99 → 1)</option>
              <option value="title-asc">Label (A → Z)</option>
              <option value="title-desc">Label (Z → A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Menus Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 w-16">Order</th>
                <th className="py-3 px-4">Menu Label</th>
                <th className="py-3 px-4">Placement</th>
                <th className="py-3 px-4">Destination Type</th>
                <th className="py-3 px-4">Target Destination</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right w-28 min-w-[112px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <MenuIcon className="mx-auto text-slate-300 mb-2" size={32} />
                    <p className="font-semibold text-slate-600">No navigation items found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Try adjusting your search query, placement, or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                pagedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        #{item.sortOrder}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      {item.title}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.position === 'main' ? (
                        <span className="inline-flex items-center text-indigo-700 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full text-[10px]">
                          Header Nav
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-slate-600 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full text-[10px]">
                          Footer Sitemap
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                        {item.targetType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-indigo-600 font-semibold max-w-xs truncate">
                      <span title={item.targetValue} className="inline-flex items-center gap-1">
                        {item.targetValue}
                        {item.targetValue.startsWith('http') && <ExternalLink size={11} className="text-slate-400" />}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px]">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full text-[10px]">
                          <XCircle size={12} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap w-28 min-w-[112px]">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={ROUTES.ADMIN.MENU_EDIT(item.id)}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-rose-50/60 text-slate-600 hover:text-[#C62828] hover:border-[#C62828]/40 transition shrink-0 shadow-2xs cursor-pointer"
                          title="Edit Item"
                        >
                          <Edit2 size={13} />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-rose-50/60 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition shrink-0 shadow-2xs cursor-pointer"
                          title="Delete Item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Customizable Pagination */}
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>
    </div>
  );
}
