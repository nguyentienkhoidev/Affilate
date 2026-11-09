'use client';

import { use, useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';
import { Article } from '@/types/deals';
import postService from '@/services/postService';
import categoryService, { CategoryItem } from '@/services/categoryService';
import tagService, { TagItem } from '@/services/tagService';
import Pagination from '@/components/admin/Pagination';
import {
  Calendar,
  Clock,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Tag as TagIcon,
  Flame,
  Layers,
  BookOpen,
  Hash,
  Check,
  Search,
  X,
  ChevronDown,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function NewsCategoryArchivePage({ params }: PageProps) {
  const { slug } = use(params);
  const normalizedSlug = decodeURIComponent(slug).toLowerCase().trim();
  const pageSize = 6;

  const [articles, setArticles] = useState<Article[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [allTags, setAllTags] = useState<TagItem[]>([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [isTopicPopoverOpen, setIsTopicPopoverOpen] = useState(false);
  const [topicSearch, setTopicSearch] = useState('');
  const topicPopoverRef = useRef<HTMLDivElement>(null);
  const [meta, setMeta] = useState<CategoryItem | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (topicPopoverRef.current && !topicPopoverRef.current.contains(event.target as Node)) {
        setIsTopicPopoverOpen(false);
      }
    }
    if (isTopicPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTopicPopoverOpen]);

  const toggleTag = (tagNameOrSlug: string) => {
    const clean = tagNameOrSlug.trim();
    if (!clean) return;
    setActiveTags((prev) => {
      const exists = prev.some((t) => t.toLowerCase() === clean.toLowerCase());
      if (exists) {
        return prev.filter((t) => t.toLowerCase() !== clean.toLowerCase());
      }
      return [...prev, clean];
    });
    setCurrentPage(1);
  };

  const removeTag = (tagToRemove: string) => {
    setActiveTags((prev) => prev.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase()));
    setCurrentPage(1);
  };

  const clearAllTags = () => {
    setActiveTags([]);
    setCurrentPage(1);
  };

  const filteredTopics = useMemo(() => {
    if (!topicSearch.trim()) return allTags;
    const q = topicSearch.trim().toLowerCase();
    return allTags.filter(
      (t) => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q)
    );
  }, [allTags, topicSearch]);

  const visibleTopics = useMemo(() => {
    if (!allTags || allTags.length === 0) return [];
    const sorted = [...allTags].sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      if ((b.postsCount || 0) !== (a.postsCount || 0)) return (b.postsCount || 0) - (a.postsCount || 0);
      return a.name.localeCompare(b.name);
    });
    const topSlice = sorted.slice(0, 12);
    const missingSelected = allTags.filter(
      (t) =>
        activeTags.some(
          (at) => at.toLowerCase() === t.name.toLowerCase() || at.toLowerCase() === t.slug.toLowerCase()
        ) && !topSlice.some((v) => v.id === t.id)
    );
    if (missingSelected.length > 0) {
      return [...missingSelected, ...topSlice.slice(0, Math.max(1, 12 - missingSelected.length))];
    }
    return topSlice;
  }, [allTags, activeTags]);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setIsLoading(true);
      setNotFound(false);

      const [categoryData, tags, postsResult] = await Promise.all([
        categoryService.getCategoryBySlug(normalizedSlug),
        tagService.getPublicTags(),
        postService.getPosts({
          categorySlug: normalizedSlug,
          tag: activeTags.length > 0 ? activeTags.join(',') : undefined,
          page: currentPage,
          size: pageSize,
          sortBy,
        }),
      ]);

      if (!isMounted) return;

      if (!categoryData) {
        setMeta(null);
        setArticles([]);
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setMeta(categoryData);
      setAllTags(tags);
      setArticles(postsResult.items);
      setTotalArticles(postsResult.total);
      setTotalPages(Math.max(1, postsResult.totalPages));
      setIsLoading(false);
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [normalizedSlug, activeTags, currentPage, sortBy]);

  if (!isLoading && (notFound || !meta)) {
    return (
      <div className="bg-[#f4f5f7] min-h-screen py-20">
        <div className="max-w-xl mx-auto px-4 text-center space-y-5 bg-white border border-slate-200 rounded-3xl p-10 shadow-xs">
          <Layers size={44} className="mx-auto text-slate-300" />
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Category Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            This editorial category could not be found or has no active listing in our directory.
          </p>
          <div className="pt-2">
            <Link
              href={ROUTES.PUBLIC.CATEGORIES}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c62828] hover:bg-[#b71c1c] text-white text-xs font-bold rounded-xl transition"
            >
              <ArrowLeft size={14} />
              <span>Browse All Categories</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f5f7] min-h-screen py-8 sm:py-10 text-[#171717]">
      <div className="max-w-7xl mx-auto px-4 space-y-6 sm:space-y-8">

        {/* 1. Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href={ROUTES.PUBLIC.HOME} className="hover:text-[#c62828] transition">Home</Link>
          <ChevronRight size={12} />
          <Link href={ROUTES.PUBLIC.CATEGORIES} className="hover:text-[#c62828] transition">Categories</Link>
          <ChevronRight size={12} />
          <span className="text-slate-900 font-semibold">{meta?.name || normalizedSlug}</span>
        </nav>

        {/* 2. Category Header Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-2xs space-y-4 relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-2.5">
            {meta?.icon && <span className="text-2xl">{meta.icon}</span>}
            <span className="bg-[#c62828] text-white font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded-sm shadow-xs">
              Editorial Desk
            </span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
              {totalArticles} Published Articles
            </span>
          </div>

          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight font-editorial">
              {meta?.name || normalizedSlug}
            </h1>
            {meta?.subtitle && (
              <p className="text-xs sm:text-sm font-bold text-[#c62828]">
                {meta.subtitle}
              </p>
            )}
            {meta?.description && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {meta.description}
              </p>
            )}
          </div>

          {/* Integrated Trending Topics & Multi-Select Filter */}
          {allTags.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-500 text-[11px] shrink-0">
                    <Hash size={13} className="text-[#c62828]" />
                    <span>Topics &amp; Themes</span>
                  </div>

                  {activeTags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => removeTag(t)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-[#c62828] border border-red-200 hover:bg-red-100 transition cursor-pointer"
                      title={`Remove #${t}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span>#{t}</span>
                      <X size={11} className="ml-0.5 text-red-500" />
                    </button>
                  ))}

                  {activeTags.length > 1 && (
                    <button
                      type="button"
                      onClick={clearAllTags}
                      className="text-[11px] font-semibold text-[#c62828] hover:underline cursor-pointer ml-1"
                    >
                      Clear all ({activeTags.length})
                    </button>
                  )}
                </div>

                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  {allTags.length} topics catalogued
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {/* Horizontal Scroll of Topics */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={clearAllTags}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      activeTags.length === 0
                        ? 'bg-[#c62828] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>All Topics</span>
                  </button>

                  {visibleTopics.map((tag) => {
                    const isSelected = activeTags.some(
                      (t) => t.toLowerCase() === tag.name.toLowerCase() || t.toLowerCase() === tag.slug.toLowerCase()
                    );
                    const dotColor = tag.color || '#c62828';
                    return (
                      <button
                        type="button"
                        key={tag.id}
                        onClick={() => toggleTag(tag.name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#c62828] text-white shadow-2xs ring-2 ring-red-600/20'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: isSelected ? '#ffffff' : dotColor }}
                        />
                        <span>#{tag.name}</span>
                        {typeof tag.postsCount === 'number' && tag.postsCount > 0 && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {tag.postsCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Pinned "All Topics" Popover Trigger & Dropdown */}
                {allTags.length > 0 && (
                  <div className="relative shrink-0" ref={topicPopoverRef}>
                    <button
                      type="button"
                      onClick={() => setIsTopicPopoverOpen((prev) => !prev)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border shadow-2xs ${
                        activeTags.length > 0 || isTopicPopoverOpen
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                      }`}
                      aria-expanded={isTopicPopoverOpen}
                    >
                      <Hash size={13} className={activeTags.length > 0 ? 'text-red-400' : 'text-[#c62828]'} />
                      <span>All Topics ({allTags.length})</span>
                      {activeTags.length > 0 && (
                        <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {activeTags.length}
                        </span>
                      )}
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${
                          isTopicPopoverOpen ? 'rotate-180 text-red-500' : 'text-slate-400'
                        }`}
                      />
                    </button>

                    {isTopicPopoverOpen && (
                      <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                        {/* Search Header */}
                        <div className="relative mb-2.5">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <input
                            type="text"
                            value={topicSearch}
                            onChange={(e) => setTopicSearch(e.target.value)}
                            placeholder={`Search ${allTags.length} topics...`}
                            className="w-full bg-slate-50 text-slate-800 placeholder:text-slate-400 text-xs py-2 pl-8.5 pr-8 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#c62828]/20 focus:border-[#c62828] transition"
                            autoFocus
                          />
                          {topicSearch && (
                            <button
                              type="button"
                              onClick={() => setTopicSearch('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>

                        {/* Quick Info & Reset */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pb-2 border-b border-slate-100 font-medium">
                          <span>Showing {filteredTopics.length} of {allTags.length} topics</span>
                          {activeTags.length > 0 && (
                            <button
                              type="button"
                              onClick={clearAllTags}
                              className="text-[#c62828] hover:underline font-bold cursor-pointer"
                            >
                              Reset ({activeTags.length})
                            </button>
                          )}
                        </div>

                        {/* Scrollable Topics List */}
                        <div className="max-h-80 overflow-y-auto space-y-1 pt-2 pr-1 select-none">
                          {filteredTopics.map((tag) => {
                            const isSel = activeTags.some(
                              (t) => t.toLowerCase() === tag.name.toLowerCase() || t.toLowerCase() === tag.slug.toLowerCase()
                            );
                            const dotColor = tag.color || '#c62828';
                            return (
                              <button
                                type="button"
                                key={tag.id}
                                onClick={() => toggleTag(tag.name)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer text-left ${
                                  isSel
                                    ? 'bg-red-50 text-[#c62828] font-bold border border-red-200 shadow-2xs'
                                    : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: dotColor }}
                                  />
                                  <span className="truncate">#{tag.name}</span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                  {typeof tag.postsCount === 'number' && tag.postsCount > 0 && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                      isSel ? 'bg-red-200 text-red-800' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                      {tag.postsCount}
                                    </span>
                                  )}
                                  <div
                                    className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                                      isSel
                                        ? 'bg-[#c62828] border-[#c62828] text-white'
                                        : 'border-slate-300'
                                    }`}
                                  >
                                    {isSel && <Check size={11} className="stroke-[3]" />}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Toolbar & Sorting */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Flame size={15} className="text-[#c62828]" />
            <span>Editorial Articles ({totalArticles})</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => { setSortBy('newest'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                sortBy === 'newest'
                  ? 'bg-[#c62828] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Latest
            </button>
            <button
              type="button"
              onClick={() => { setSortBy('popular'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                sortBy === 'popular'
                  ? 'bg-[#c62828] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Popular
            </button>
          </div>
        </div>

        {/* 4. Article Grid: 3 Articles Per Row */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 border border-slate-200" />
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <Link
                    href={ROUTES.PUBLIC.POST_DETAIL(article.slug)}
                    className="block relative aspect-[16/10] overflow-hidden bg-slate-100"
                  >
                    {article.imageUrl ? (
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
                        <BookOpen size={36} className="text-white/25" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-[#c62828] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded shadow-xs">
                      {article.category}
                    </div>
                  </Link>

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      {article.publishedAt && (
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar size={12} /> {article.publishedAt}
                        </span>
                      )}
                      {article.publishedAt && article.readTime && <span>•</span>}
                      {article.readTime && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {article.readTime}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-[#c62828] transition leading-snug line-clamp-2">
                      <Link href={ROUTES.PUBLIC.POST_DETAIL(article.slug)}>
                        {article.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden relative border border-slate-200 bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {article.author.avatar ? (
                        <Image
                          src={article.author.avatar}
                          alt={article.author.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span>{article.author.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <span className="font-semibold text-slate-700 text-[11px]">
                      {article.author.name}
                    </span>
                  </div>

                  <Link
                    href={ROUTES.PUBLIC.POST_DETAIL(article.slug)}
                    className="text-[#c62828] font-bold text-xs inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Read Review</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <p className="text-slate-500 text-sm font-medium">No published articles found matching the selected topics in this category.</p>
            {activeTags.length > 0 && (
              <button
                type="button"
                onClick={clearAllTags}
                className="text-xs font-bold text-[#c62828] hover:underline cursor-pointer"
              >
                Clear topic filters
              </button>
            )}
          </div>
        )}

        {/* 5. Pagination */}
        {!isLoading && articles.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalArticles}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}

        {/* 6. Editorial Archive Callout */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#c62828] block">
            Editorial Archive
          </span>
          <h3 className="font-editorial text-2xl font-bold text-slate-900 tracking-tight">
            Explore More In-Depth Product Reviews &amp; Guides
          </h3>
          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
            Browse our full library of laboratory benchmarks, hands-on product evaluations, and smart consumer buying guides across all categories.
          </p>
          <div className="pt-2">
            <Link
              href={ROUTES.PUBLIC.POSTS}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#c62828] hover:bg-[#b71c1c] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer hover:shadow"
            >
              <span>Explore Full Editorial Archive</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
