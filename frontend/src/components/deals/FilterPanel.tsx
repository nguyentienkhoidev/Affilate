'use client';

import { X, RotateCcw, SlidersHorizontal, Check } from 'lucide-react';
import mockCategoriesData from '@/lib/data/mock-categories.json';
import mockStoresData from '@/lib/data/mock-stores.json';

const CATEGORIES_LIST = [
  { slug: 'all', name: 'All Categories' },
  ...mockCategoriesData.map(c => ({ slug: c.slug, name: c.name }))
];
const STORES_LIST = mockStoresData;

export interface FilterState {
  category: string;
  store: string;
  minDiscount: number;
  status: string;
  sortBy: 'newest' | 'popular' | 'discount' | 'price-asc' | 'price-desc';
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  isMobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
  totalResults?: number;
}

export default function FilterPanel({
  filters,
  onChange,
  onReset,
  isMobileDrawerOpen = false,
  onCloseMobileDrawer,
  totalResults,
}: FilterPanelProps) {
  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
          <SlidersHorizontal size={16} />
          <span>Filters</span>
          {totalResults !== undefined && (
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {totalResults} deals
            </span>
          )}
        </div>
        <button
          onClick={onReset}
          className="text-xs font-bold text-slate-500 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="newest">Newest First</option>
          <option value="popular">Most Popular</option>
          <option value="discount">Highest Discount %</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {/* Deal Status */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Deal Status
        </label>
        <div className="space-y-1">
          {[
            { id: 'all', label: 'All Deals' },
            { id: 'active', label: 'Active & Verified Only' },
            { id: 'expiring', label: 'Ending Soon (< 48h)' },
            { id: 'expired', label: 'Expired (Past Archive)' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onChange({ ...filters, status: item.id })}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                filters.status === item.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{item.label}</span>
              {filters.status === item.id && <Check size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Category
        </label>
        <div className="space-y-1">
          {CATEGORIES_LIST.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => onChange({ ...filters, category: cat.slug })}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                filters.category === cat.slug
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{cat.name}</span>
              {filters.category === cat.slug && <Check size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* Store */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Store
        </label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onChange({ ...filters, store: 'all' })}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
              filters.store === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>All Stores</span>
            {filters.store === 'all' && <Check size={14} />}
          </button>
          {STORES_LIST.map((s) => (
            <button
              key={s.slug}
              onClick={() => onChange({ ...filters, store: s.slug })}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                filters.store === s.slug
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{s.name}</span>
              {filters.store === s.slug && <Check size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* Minimum Discount % */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Minimum Discount
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 20, 40, 50].map((disc) => (
            <button
              key={disc}
              onClick={() => onChange({ ...filters, minDiscount: disc })}
              className={`py-2 text-xs font-extrabold rounded-xl border transition cursor-pointer text-center ${
                filters.minDiscount === disc
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {disc === 0 ? 'All' : `${disc}%+`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm sticky top-24 self-start">
        {content}
      </aside>

      {/* Mobile Drawer / Bottom Sheet */}
      {isMobileDrawerOpen && (
        <div 
          onClick={onCloseMobileDrawer}
          className="lg:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm animate-fadeIn flex flex-col justify-end"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative"
          >
            {/* Handle Bar */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />

            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900">
                Filter & Sort Deals
              </h3>
              <button
                onClick={onCloseMobileDrawer}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {content}

            <button
              onClick={onCloseMobileDrawer}
              className="w-full py-3.5 bg-slate-900 text-white font-bold text-sm rounded-xl shadow cursor-pointer"
            >
              Apply Filters ({totalResults !== undefined ? `${totalResults} deals` : 'Done'})
            </button>
          </div>
        </div>
      )}
    </>
  );
}
