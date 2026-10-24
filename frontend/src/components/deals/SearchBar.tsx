'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Tag } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

interface SearchBarProps {
  placeholder?: string;
  initialQuery?: string;
  onSearch?: (query: string) => void;
  showQuickPills?: boolean;
}

export default function SearchBar({
  placeholder = 'Search deals, stores, products, or promo codes...',
  initialQuery = '',
  onSearch,
  showQuickPills = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (onSearch) {
      onSearch(trimmed);
    } else if (trimmed) {
      router.push(`${ROUTES.PUBLIC.DEALS}?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  const handlePillClick = (term: string) => {
    setQuery(term);
    if (onSearch) {
      onSearch(term);
    } else {
      router.push(`${ROUTES.PUBLIC.DEALS}?q=${encodeURIComponent(term)}`);
    }
  };

  return (
    <div className="w-full space-y-2">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex items-center">
          <Search size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (onSearch) onSearch(e.target.value);
            }}
            placeholder={placeholder}
            className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent shadow-sm transition"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>

      {showQuickPills && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-slate-500 no-scrollbar">
          <span className="font-semibold text-slate-400 shrink-0 flex items-center gap-1">
            <Tag size={12} /> Popular:
          </span>
          {['Anker', 'Nilight', 'Headphones', 'Hosting', 'LED Light', 'Nike'].map((tag) => (
            <button
              key={tag}
              onClick={() => handlePillClick(tag)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium shrink-0 transition cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
