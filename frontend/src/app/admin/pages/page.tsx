'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Globe,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useAdminCollection } from '@/lib/admin/useAdminCollection';
import Pagination from '@/components/admin/Pagination';
import { PAGES_STORE_KEY, DEFAULT_PAGES, type StaticPageData } from './_lib/data';

export default function AdminPagesPage() {
  const { items: pages, remove } = useAdminCollection<StaticPageData>(PAGES_STORE_KEY, DEFAULT_PAGES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'order-asc' | 'order-desc' | 'title-asc' | 'updated-desc'>('order-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleDelete = (id: number) => {
    if (confirm('Delete this page?')) {
      remove(id);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setSortBy('order-asc');
    setCurrentPage(1);
  };

  const hasActiveFilters = search.trim() !== '' || statusFilter !== 'all' || sortBy !== 'order-asc';

  // Filter & Search
  const filtered = pages.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchSlug = p.slug.toLowerCase().includes(q);
      const matchContent = p.content ? p.content.toLowerCase().includes(q) : false;
      if (!matchTitle && !matchSlug && !matchContent) return false;
    }

    if (statusFilter === 'published' && !p.isActive) return false;
    if (statusFilter === 'draft' && p.isActive) return false;

    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'order-asc') return a.sortOrder - b.sortOrder;
    if (sortBy === 'order-desc') return b.sortOrder - a.sortOrder;
    if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
    if (sortBy === 'updated-desc') return b.updatedAt.localeCompare(a.updatedAt);
    return 0;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const pagedItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const publishedCount = pages.filter((p) => p.isActive).length;
  const draftCount = pages.filter((p) => !p.isActive).length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="text-indigo-600" size={26} /> Static Pages & Legal Compliance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage legal disclosures, affiliate compliance statements, terms of service, and editorial guidelines.
          </p>
        </div>

        <Link
          href={ROUTES.ADMIN.PAGE_CREATE}
          className="h-9 px-4 inline-flex items-center justify-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus size={15} /> Create Static Page
        </Link>
      </div>

      {/* Advanced Filter Box */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Quick status count pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => {
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className={`h-8 px-3.5 inline-flex items-center justify-center text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Pages ({pages.length})
            </button>
            <button
              onClick={() => {
                setStatusFilter('published');
                setCurrentPage(1);
              }}
              className={`h-8 px-3.5 inline-flex items-center justify-center text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                statusFilter === 'published'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Published ({publishedCount})
            </button>
            <button
              onClick={() => {
                setStatusFilter('draft');
                setCurrentPage(1);
              }}
              className={`h-8 px-3.5 inline-flex items-center justify-center text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                statusFilter === 'draft'
                  ? 'bg-white text-slate-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Drafts ({draftCount})
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1 border-t border-slate-100">
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
              placeholder="Search pages by title, slug, or content..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="all">Status: All</option>
            <option value="published">Status: Published Only</option>
            <option value="draft">Status: Drafts Only</option>
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
              <option value="order-asc">Navigation Order (1 → 99)</option>
              <option value="order-desc">Navigation Order (99 → 1)</option>
              <option value="title-asc">Page Title (A → Z)</option>
              <option value="updated-desc">Last Modified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 w-16">Order</th>
                <th className="py-3 px-4">Page Title</th>
                <th className="py-3 px-4">Live URL</th>
                <th className="py-3 px-4">Last Modified</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right w-36 min-w-[144px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Layers className="mx-auto text-slate-300 mb-2" size={32} />
                    <p className="font-semibold text-slate-600">No static pages found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Try adjusting your keyword search or status filter.
                    </p>
                  </td>
                </tr>
              ) : (
                pagedItems.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        #{p.sortOrder}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 text-sm block">
                        {p.title}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        ID: #{p.id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-indigo-600 font-semibold">
                      <Link
                        href={`/${p.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 hover:underline text-indigo-600 font-medium"
                      >
                        <span>/{p.slug}</span>
                        <ExternalLink size={11} className="text-slate-400" />
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {p.updatedAt}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px]">
                          <CheckCircle2 size={12} /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full text-[10px]">
                          <XCircle size={12} /> Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap w-36 min-w-[144px]">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/${p.slug}`}
                          target="_blank"
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 hover:border-slate-300 transition shrink-0 shadow-2xs"
                          title="View Live Page"
                        >
                          <Globe size={13} />
                        </Link>
                        <Link
                          href={ROUTES.ADMIN.PAGE_EDIT(p.id)}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-rose-50/60 text-slate-600 hover:text-[#C62828] hover:border-[#C62828]/40 transition shrink-0 shadow-2xs cursor-pointer"
                          title="Edit Page"
                        >
                          <Edit2 size={13} />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-rose-50/60 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition shrink-0 shadow-2xs cursor-pointer"
                          title="Delete Page"
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
