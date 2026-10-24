'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import Pagination from '@/components/admin/Pagination';
import { ROUTES } from '@/constants/routes';
import { useAdminCollection } from '@/lib/admin/useAdminCollection';
import { CATEGORIES_STORE_KEY, DEFAULT_CATEGORIES, type CategoryData } from './_lib/data';

export default function AdminCategoriesPage() {
  const { items: categories, remove } = useAdminCollection<CategoryData>(CATEGORIES_STORE_KEY, DEFAULT_CATEGORIES);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [sortBy, setSortBy] = useState<'order-asc' | 'name-asc' | 'articles-desc'>('order-asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      remove(id);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setSortBy('order-asc');
    setCurrentPage(1);
  };

  const isFiltered = search !== '' || statusFilter !== 'ALL' || sortBy !== 'order-asc';

  const filtered = categories
    .filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(search.toLowerCase()));

      let matchStatus = true;
      if (statusFilter === 'ACTIVE') matchStatus = c.isActive;
      else if (statusFilter === 'INACTIVE') matchStatus = !c.isActive;

      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'articles-desc') return (b.articlesCount || 0) - (a.articlesCount || 0);
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });

  const totalItems = filtered.length;
  const paginatedCategories = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="text-[#C62828]" size={26} /> Editorial Categories Management
            </h1>
            <span className="bg-[#C62828]/10 text-[#C62828] text-xs font-bold px-2.5 py-0.5 rounded-full">
              {categories.length} Categories Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure editorial taxonomy matching client navigation bars: Tech, Business, Entertainment, US Politics, Reviews, and Lifestyle.
          </p>
        </div>

        <Link
          href={ROUTES.ADMIN.CATEGORY_CREATE}
          className="h-9 px-4 inline-flex items-center justify-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus size={15} /> Add Category
        </Link>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              placeholder="Search categories by name, slug..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828]"
            />
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
              <option value="ALL">All Categories</option>
              <option value="ACTIVE">Active in Nav</option>
              <option value="INACTIVE">Inactive / Hidden</option>
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
              <option value="order-asc">Sort: Navigation Order</option>
              <option value="name-asc">Sort: Name (A to Z)</option>
              <option value="articles-desc">Sort: Most Published Articles</option>
            </select>
          </div>
        </div>

        {/* Summary & Reset Action */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] text-slate-500 font-medium">
            Found <strong className="text-slate-900">{totalItems}</strong> matching categories
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

      {/* Category Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Public URL</th>
                <th className="py-3 px-4">Articles</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right w-28 min-w-[112px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-3 px-4 font-mono font-bold text-slate-400">
                    {cat.sortOrder}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 text-sm block group-hover:text-[#C62828] transition-colors">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">
                      {cat.description}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#C62828] font-semibold">
                    <Link
                      href={`/category/${cat.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 hover:underline"
                    >
                      <span>/category/{cat.slug}</span>
                      <ExternalLink size={11} />
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 bg-slate-100 font-bold text-slate-700 px-2 py-0.5 rounded">
                      <BookOpen size={11} /> {cat.articlesCount} stories
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {cat.isActive ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">
                        <XCircle size={12} /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap w-28 min-w-[112px]">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={ROUTES.ADMIN.CATEGORY_EDIT(cat.id)}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-rose-50/60 text-slate-600 hover:text-[#C62828] hover:border-[#C62828]/40 transition shrink-0 shadow-2xs cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit2 size={13} />
                      </Link>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-rose-50/60 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition shrink-0 shadow-2xs cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemName="categories"
        />
      </div>

    </div>
  );
}
