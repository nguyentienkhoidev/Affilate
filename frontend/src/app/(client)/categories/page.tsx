'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { ArrowRight, Layers, BookOpen, Loader2 } from 'lucide-react';
import { formatCurrentMonthYear } from '@/lib/utils/formatters';
import categoryService, { CategoryItem } from '@/services/categoryService';
import Pagination from '@/components/admin/Pagination';

export default function CategoriesDirectoryPage() {
  const currentMonthYear = formatCurrentMonthYear();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      const res = await categoryService.getPaginatedCategories({
        page: currentPage - 1,
        size: 12,
        search: search.trim() || undefined,
        type: 'post',
      });
      if (isMounted) {
        setCategories(res.content);
        setTotalPages(Math.max(1, res.totalPages));
        setTotalCount(res.totalElements);
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      load();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search, currentPage]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">

        {/* Header Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#c62828] uppercase tracking-widest">
            <Layers size={16} /> Article Categories &amp; Editorial Taxonomy
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Articles &amp; Buying Guides by Category ({currentMonthYear})
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            Browse editorial categories grouping independent product reviews, lab evaluations, and consumer buying guides.
          </p>

          {/* Quick Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="max-w-md w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Filter article categories..."
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#c62828]/20 focus:border-[#c62828]"
              />
            </div>
            <div className="text-xs text-slate-500 font-semibold shrink-0">
              Showing <strong className="text-slate-900">{totalCount}</strong> editorial categories
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 font-medium text-sm flex flex-col items-center justify-center gap-2">
            <Loader2 size={24} className="animate-spin text-[#c62828]" />
            <p>Loading editorial categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <Layers size={40} className="mx-auto text-slate-300" />
            <h3 className="font-bold text-slate-900 text-base">No matching records found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn&apos;t find any categories matching your query.
            </p>
            {search && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="text-xs font-bold text-[#c62828] hover:underline cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-red-300 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl p-3 bg-red-50 rounded-2xl border border-red-100">
                        {cat.icon || '📰'}
                      </span>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <BookOpen size={12} /> {cat.count} Articles
                        </span>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#c62828] transition-colors">
                        <Link href={ROUTES.PUBLIC.CATEGORY_DETAIL(cat.slug)}>
                          {cat.name}
                        </Link>
                      </h2>
                      {cat.subtitle && (
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">
                          {cat.subtitle}
                        </p>
                      )}
                      {cat.description && (
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
                    <Link
                      href={ROUTES.PUBLIC.CATEGORY_DETAIL(cat.slug)}
                      className="text-xs font-bold text-[#c62828] group-hover:text-red-700 inline-flex items-center gap-1.5"
                    >
                      View Category Articles <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <span className="text-[11px] text-slate-400 font-medium">Editorial</span>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={12}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

      </div>
    </div>
  );
}
