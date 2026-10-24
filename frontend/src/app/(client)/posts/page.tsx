'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';
import { Article } from '@/types/deals';
import postService from '@/services/postService';
import categoryService, { CategoryItem } from '@/services/categoryService';
import tagService from '@/services/tagService';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  ArrowRight, 
  Tag as TagIcon,
  Layers,
  ChevronRight
} from 'lucide-react';
import { formatCurrentMonthYear } from '@/lib/utils/formatters';

export default function PostsDirectoryPage() {
  const currentMonthYear = formatCurrentMonthYear();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTag, setActiveTag] = useState<string>('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load categories and tags once
  useEffect(() => {
    async function loadMeta() {
      const [cats, tags] = await Promise.all([
        categoryService.getCategories(),
        tagService.getTrendingTags()
      ]);
      setCategories(cats);
      setTrendingTags(tags);
    }
    loadMeta();
  }, []);

  // Fetch articles based on filter/pagination
  useEffect(() => {
    let isMounted = true;
    async function fetchPosts() {
      setIsLoading(true);
      const res = await postService.getPosts({
        categorySlug: activeCategory !== 'all' ? activeCategory : undefined,
        tag: activeTag || undefined,
        page: currentPage,
        size: 9, // 3 rows x 3 articles = 9 articles / page
        sortBy: 'newest'
      });

      if (isMounted) {
        setArticles(res.items);
        setTotalPages(res.totalPages);
        setTotalCount(res.total);
        setIsLoading(false);
      }
    }

    fetchPosts();
    return () => { isMounted = false; };
  }, [activeCategory, activeTag, currentPage]);

  const featuredArticle = articles.length > 0 ? articles[0] : null;

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 space-y-8 sm:space-y-10">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href={ROUTES.PUBLIC.HOME} className="hover:text-red-700 transition">Home</Link>
          <ChevronRight size={12} />
          <span className="text-slate-900 font-semibold">Editorial Archive &amp; Reviews</span>
        </nav>

        {/* Page Header Banner */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-red-700 uppercase tracking-widest">
            <BookOpen size={16} /> Bargorya Editorial Archive &amp; Test Lab
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Independent Product Reviews &amp; Buying Guides ({currentMonthYear})
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              Unbiased laboratory tests, comprehensive side-by-side brand comparisons, and smart consumer buying guides written by independent testing specialists.
            </p>
          </div>

          {/* Horizontal Filters: Categories & Trending Tags */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            {/* Categories Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1 shrink-0 mr-1 text-[11px] uppercase tracking-wider">
                <Layers size={13} className="text-slate-500" /> Category:
              </span>
              <button
                onClick={() => { setActiveCategory('all'); setCurrentPage(1); }}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 ${
                  activeCategory === 'all'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({totalCount || articles.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.slug); setCurrentPage(1); }}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 flex items-center gap-1.5 ${
                    activeCategory === cat.slug
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Trending Tags Pills */}
            {trendingTags.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 font-bold flex items-center gap-1 shrink-0 mr-1 text-[11px] uppercase tracking-wider">
                  <TagIcon size={13} className="text-red-600" /> Topics:
                </span>
                {activeTag && (
                  <button
                    onClick={() => { setActiveTag(''); setCurrentPage(1); }}
                    className="px-2.5 py-1 rounded-lg font-bold text-[11px] bg-red-100 text-red-800 hover:bg-red-200 transition shrink-0 flex items-center gap-1"
                  >
                    ✕ Clear: {activeTag}
                  </button>
                )}
                {trendingTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => { 
                      setActiveTag(activeTag === tag ? '' : tag); 
                      setCurrentPage(1); 
                    }}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition shrink-0 ${
                      activeTag === tag
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Featured Editorial Highlight (Only on page 1 with all categories) */}
        {activeCategory === 'all' && !activeTag && currentPage === 1 && featuredArticle && (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow grid grid-cols-1 lg:grid-cols-12 gap-0 group">
            <div className="lg:col-span-7 relative h-64 lg:h-auto min-h-[280px] overflow-hidden bg-slate-100">
              <Image
                src={featuredArticle.imageUrl}
                alt={featuredArticle.title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 bg-red-700 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Featured Editorial
              </span>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-extrabold text-red-700 uppercase tracking-wider">{featuredArticle.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {featuredArticle.readTime}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {featuredArticle.publishedAt}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-950 group-hover:text-red-700 transition-colors leading-tight">
                  <Link href={`/post/${featuredArticle.slug}`}>
                    {featuredArticle.title}
                  </Link>
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {featuredArticle.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden relative border border-slate-200 bg-slate-100 shrink-0">
                    <Image
                      src={featuredArticle.author.avatar}
                      alt={featuredArticle.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">{featuredArticle.author.name}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">{featuredArticle.author.role}</p>
                  </div>
                </div>

                <Link
                  href={`/post/${featuredArticle.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-red-700 hover:text-red-800"
                >
                  Read Review <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 3 Articles Per Row Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
              <span className="w-2 h-5 bg-red-700 rounded-xs inline-block" />
              Editorial Articles ({articles.length})
            </h2>
            <div className="text-xs text-slate-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 animate-pulse">
                  <div className="w-full h-44 bg-slate-100 rounded-xl" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <p className="text-slate-500 font-semibold text-sm">No articles found matching the selected filter criteria.</p>
              <button
                onClick={() => { setActiveCategory('all'); setActiveTag(''); }}
                className="text-xs font-bold text-red-700 hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((art) => (
                <div
                  key={art.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-red-200 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="h-48 overflow-hidden relative bg-slate-100">
                      <Image
                        src={art.imageUrl}
                        alt={art.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-slate-200">
                        {art.category}
                      </span>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1"><Clock size={11} /> {art.readTime}</span>
                        <span>•</span>
                        <span>{art.publishedAt}</span>
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                        <Link href={`/post/${art.slug}`}>
                          {art.title}
                        </Link>
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {art.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden relative border border-slate-200 bg-slate-100 shrink-0">
                        <Image
                          src={art.author.avatar}
                          alt={art.author.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-800 leading-tight">{art.author.name}</p>
                        <p className="text-[9px] text-slate-400 leading-tight">{art.author.role}</p>
                      </div>
                    </div>

                    <Link
                      href={`/post/${art.slug}`}
                      className="text-xs font-bold text-red-700 group-hover:text-red-800 inline-flex items-center gap-1"
                    >
                      Read Review <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition cursor-pointer"
            >
              ← Previous
            </button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition cursor-pointer ${
                    currentPage === i + 1
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition cursor-pointer"
            >
              Next →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
