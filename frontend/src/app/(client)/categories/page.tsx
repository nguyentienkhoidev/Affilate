'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { Tag, ArrowRight, Layers, BookOpen } from 'lucide-react';
import { formatCurrentMonthYear } from '@/lib/utils/formatters';
import categoryService, { CategoryItem } from '@/services/categoryService';

export default function CategoriesDirectoryPage() {
  const currentMonthYear = formatCurrentMonthYear();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase())) ||
    (c.subtitle && c.subtitle.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        
        {/* Header Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-widest">
            <Layers size={16} /> Editorial Categories & Taxonomy
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Articles & Guides by Category ({currentMonthYear})
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
            Find active editorial reviews, shopping advice, and tech comparisons categorized by topic. Hand-verified daily by Bargorya editors.
          </p>

          {/* Quick Search */}
          <div className="max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter categories (e.g. Technology, Business, Reviews)..."
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
        </div>

        {/* Categories Grid (3 per row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cat) => (
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
                      <BookOpen size={12} /> {cat.count}+ Stories
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#c62828] transition-colors">
                    <Link href={`/category/${cat.slug}`}>
                      {cat.name}
                    </Link>
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {cat.subtitle}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
                <Link
                  href={`/category/${cat.slug}`}
                  className="text-xs font-bold text-[#c62828] group-hover:text-red-700 inline-flex items-center gap-1.5"
                >
                  View Category Stories <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <span className="text-[11px] text-slate-400 font-medium">Curated Section</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
