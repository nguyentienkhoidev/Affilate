'use client';

import { use, useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';
import { Article } from '@/types/deals';
import postService from '@/services/postService';
import tagService, { type TagItem } from '@/services/tagService';
import Pagination from '@/components/admin/Pagination';
import {
  Calendar,
  Clock,
  ChevronRight,
  ArrowRight,
  Tag as TagIcon,
  Flame,
  BookOpen,
  Hash,
  Search,
  X,
  ChevronDown,
} from 'lucide-react';

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export default function TagArchivePage({ params }: TagPageProps) {
  const { slug } = use(params);
  const rawTag = decodeURIComponent(slug).replace(/-/g, ' ');
  const normalizedTag = rawTag.toLowerCase().trim();
  const pageSize = 6;

  const [articles, setArticles] = useState<Article[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [allTags, setAllTags] = useState<TagItem[]>([]);
  const [isTopicPopoverOpen, setIsTopicPopoverOpen] = useState(false);
  const [topicSearch, setTopicSearch] = useState('');
  const topicPopoverRef = useRef<HTMLDivElement>(null);
  const [tagData, setTagData] = useState<TagItem | null>(null);
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
    return sorted.slice(0, 14);
  }, [allTags]);

  useEffect(() => {
    let active = true;
    tagService.getTagBySlug(slug).then((data) => {
      if (active && data) setTagData(data);
    });
    tagService.getPublicTags().then((tags) => {
      if (active && tags) setAllTags(tags);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    let isMounted = true;

    async function fetchTagArticles() {
      setIsLoading(true);
      const res = await postService.getPosts({
        tag: rawTag,
        page: currentPage,
        size: pageSize,
        sortBy,
      });

      if (isMounted) {
        setArticles(res.items);
        setTotalArticles(res.total);
        setTotalPages(Math.max(1, res.totalPages));
        setIsLoading(false);
      }
    }

    fetchTagArticles();

    return () => {
      isMounted = false;
    };
  }, [rawTag, currentPage, sortBy]);

  return (
    <div className="bg-[#f4f5f7] min-h-screen py-8 sm:py-10 text-[#171717]">
      <div className="max-w-7xl mx-auto px-4 space-y-6 sm:space-y-8">

        {/* 1. Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href={ROUTES.PUBLIC.HOME} className="hover:text-[#c62828] transition">Home</Link>
          <ChevronRight size={12} />
          <Link href={ROUTES.PUBLIC.POSTS} className="hover:text-[#c62828] transition">Topics</Link>
          <ChevronRight size={12} />
          <span className="text-slate-900 font-semibold">#{rawTag}</span>
        </nav>

        {/* 2. Tag Header Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-2xs space-y-4 relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="text-white font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded-sm shadow-xs flex items-center gap-1.5"
              style={{ backgroundColor: tagData?.color || '#c62828' }}
            >
              <TagIcon size={12} /> Topic Coverage
            </span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md font-mono">
              {totalArticles} Published Articles
            </span>
            {tagData?.isFeatured && (
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Flame size={12} className="text-amber-500 fill-amber-500" /> Featured Topic
              </span>
            )}
          </div>

          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight font-editorial">
              #{tagData?.name || rawTag}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-[#c62828]">
              Topic Archive &amp; Independent Consumer Analysis
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {tagData?.description || (
                <>Curated list of editorial articles, test lab findings, and product analyses filed under <strong>#{tagData?.name || rawTag}</strong>.</>
              )}
            </p>
          </div>

          {/* Integrated Related Topics Horizontal Scroll & Popover */}
          {allTags.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-500 text-[11px] shrink-0">
                  <Hash size={13} className="text-[#c62828]" />
                  <span>Related Topics &amp; Themes</span>
                </div>

                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  {allTags.length} topics catalogued
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {/* Horizontal Scroll of Related Topics */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 flex-1 min-w-0">
                  {visibleTopics.map((tag) => {
                    const isCurrent = normalizedTag === tag.name.toLowerCase().trim() || normalizedTag === tag.slug.toLowerCase().trim();
                    const dotColor = tag.color || '#c62828';
                    return (
                      <Link
                        key={tag.id}
                        href={ROUTES.PUBLIC.TAG_DETAIL(tag.slug || tag.name.toLowerCase().replace(/\s+/g, '-'))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                          isCurrent
                            ? 'bg-[#c62828] text-white shadow-2xs font-bold ring-2 ring-red-600/20'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: isCurrent ? '#ffffff' : dotColor }}
                        />
                        <span>#{tag.name}</span>
                        {typeof tag.postsCount === 'number' && tag.postsCount > 0 && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            isCurrent ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {tag.postsCount}
                          </span>
                        )}
                      </Link>
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
                        isTopicPopoverOpen
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                      }`}
                      aria-expanded={isTopicPopoverOpen}
                    >
                      <Hash size={13} className="text-[#c62828]" />
                      <span>All Topics ({allTags.length})</span>
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

                        {/* Quick Info */}
                        <div className="text-[11px] text-slate-400 px-1 pb-2 border-b border-slate-100 font-medium">
                          <span>Showing {filteredTopics.length} of {allTags.length} topics</span>
                        </div>

                        {/* Scrollable Topics List */}
                        <div className="max-h-80 overflow-y-auto space-y-1 pt-2 pr-1 select-none">
                          {filteredTopics.map((tag) => {
                            const isCurrent = normalizedTag === tag.name.toLowerCase().trim() || normalizedTag === tag.slug.toLowerCase().trim();
                            const dotColor = tag.color || '#c62828';
                            return (
                              <Link
                                key={tag.id}
                                href={ROUTES.PUBLIC.TAG_DETAIL(tag.slug || tag.name.toLowerCase().replace(/\s+/g, '-'))}
                                onClick={() => setIsTopicPopoverOpen(false)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer text-left ${
                                  isCurrent
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
                                      isCurrent ? 'bg-red-200 text-red-800' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                      {tag.postsCount}
                                    </span>
                                  )}
                                </div>
                              </Link>
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

        {/* 4. Article Grid */}
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
            <p className="text-slate-500 text-sm font-medium">No articles found filed under #{rawTag}.</p>
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
