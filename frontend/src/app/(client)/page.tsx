'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';
import { Article } from '@/types/deals';
import postService from '@/services/postService';
import categoryService, { CategoryItem } from '@/services/categoryService';
import ArticleCard from '@/components/deals/ArticleCard';
import { useSiteSettings } from '@/lib/admin/useSiteSettings';
import subscriberService from '@/services/subscriberService';
import {
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Sparkles,
  BookOpen,
  Layers,
  ChevronDown,
  Check,
  Search,
  X,
} from 'lucide-react';

export default function EditorialArticlesOnlyHomePage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [leadArticle, setLeadArticle] = useState<Article | null>(null);
  const [editorPicks, setEditorPicks] = useState<Article[]>([]);
  const [spotlightArticles, setSpotlightArticles] = useState<Article[]>([]);
  const [streamArticles, setStreamArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStreamLoading, setIsStreamLoading] = useState(true);

  // Category Popover State
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const categoryPopoverRef = useRef<HTMLDivElement>(null);

  const toggleCategory = (catSlug: string) => {
    const clean = catSlug.trim();
    if (!clean || clean.toUpperCase() === 'ALL') {
      setSelectedCategories([]);
      return;
    }
    setSelectedCategories((prev) => {
      const exists = prev.some((c) => c.toLowerCase() === clean.toLowerCase());
      if (exists) {
        return prev.filter((c) => c.toLowerCase() !== clean.toLowerCase());
      }
      return [...prev, clean];
    });
  };

  const removeCategory = (catSlug: string) => {
    setSelectedCategories((prev) => prev.filter((c) => c.toLowerCase() !== catSlug.toLowerCase()));
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryPopoverRef.current && !categoryPopoverRef.current.contains(event.target as Node)) {
        setIsCategoryPopoverOpen(false);
      }
    }
    if (isCategoryPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryPopoverOpen]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const q = categorySearch.trim().toLowerCase();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [categories, categorySearch]);

  const { settings: newsletter } = useSiteSettings();
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeDone, setSubscribeDone] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = subscribeEmail.trim().toLowerCase();
    if (!email) return;

    await subscriberService.subscribe(email, 'homepage-dispatch');
    setSubscribeEmail('');
    setSubscribeDone(true);
  };

  useEffect(() => {
    let active = true;
    async function initHomePage() {
      setIsLoading(true);

      const [featured, picks, spotlightRes, cats] = await Promise.all([
        postService.getFeaturedArticle(),
        postService.getEditorPicks(),
        postService.getPosts({ page: 1, size: 3 }),
        categoryService.getCategories('post'),
      ]);

      if (!active) return;
      setLeadArticle(featured);
      setEditorPicks(picks);
      setSpotlightArticles(spotlightRes.items);
      setCategories(cats);
      setIsLoading(false);
    }

    initHomePage();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadStream() {
      setIsStreamLoading(true);
      const res = await postService.getPosts({
        categorySlug: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
        page: 1,
        size: 6,
      });
      if (!active) return;
      setStreamArticles(res.items);
      setIsStreamLoading(false);
    }

    loadStream();
    return () => {
      active = false;
    };
  }, [selectedCategories]);

  return (
    <div className="bg-[#F8F8F6] min-h-screen py-8 sm:py-12 text-[#171717]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-14 sm:space-y-18">

        {/* 1. HERO MAGAZINE: 1 LEAD STORY + EDITOR'S PICKS */}
        {isLoading ? (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch animate-pulse">
            <div className="lg:col-span-8 min-h-[440px] sm:min-h-[520px] rounded-2xl bg-slate-200" />
            <div className="lg:col-span-4 rounded-2xl bg-white border border-[#E7E7E5] p-6 space-y-4">
              <div className="h-5 w-1/3 bg-slate-200 rounded" />
              <div className="h-20 bg-slate-100 rounded-xl" />
              <div className="h-20 bg-slate-100 rounded-xl" />
              <div className="h-20 bg-slate-100 rounded-xl" />
            </div>
          </section>
        ) : leadArticle ? (
          <section aria-label="Lead Editorial Feature" className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">

            {/* Dominant Featured Story (8 cols) */}
            <div className="lg:col-span-8 flex flex-col">
              <Link
                href={ROUTES.PUBLIC.POST_DETAIL(leadArticle.slug)}
                className="group relative block w-full h-full min-h-[440px] sm:min-h-[520px] rounded-2xl overflow-hidden bg-[#171717] border border-[#E7E7E5] shadow-xs flex flex-col justify-end"
              >
                {leadArticle.imageUrl ? (
                  <Image
                    src={leadArticle.imageUrl}
                    alt={leadArticle.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 flex items-center justify-center">
                    <BookOpen size={64} className="text-white/15" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                <div className="relative z-10 p-6 sm:p-10 space-y-3.5 text-white max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-[#C62828] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded shadow-xs inline-flex items-center gap-1.5">
                      <span>{leadArticle.category}</span>
                    </span>
                    <span className="text-xs text-white/90 font-medium hidden sm:inline-flex items-center gap-1">
                      <ShieldCheck size={14} className="text-emerald-400" />
                      <span>Independent Lab Review</span>
                    </span>
                  </div>

                  <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight drop-shadow-xs group-hover:text-amber-100 transition-colors">
                    {leadArticle.title}
                  </h1>

                  <p className="text-xs sm:text-sm text-[#D4D4D0] line-clamp-2 leading-relaxed">
                    {leadArticle.excerpt}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-[#A8A8A2] pt-2 border-t border-white/20">
                    <span className="font-semibold text-white">
                      By {leadArticle.author.name}
                    </span>
                    {leadArticle.publishedAt && (
                      <>
                        <span>•</span>
                        <span>{leadArticle.publishedAt}</span>
                      </>
                    )}
                    {leadArticle.readTime && (
                      <>
                        <span>•</span>
                        <span>{leadArticle.readTime}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            </div>

            {/* Curated Editor's Picks Column (4 cols) */}
            <div className="lg:col-span-4 bg-white border border-[#E7E7E5] rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="border-b border-[#E7E7E5] pb-3 mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#C62828] block mb-0.5">
                      Curated Desk
                    </span>
                    <h2 className="font-editorial text-lg font-bold text-[#171717] tracking-tight">
                      Editor&apos;s Picks
                    </h2>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-[#737373] font-bold bg-[#F8F8F6] px-2 py-0.5 rounded border border-[#E7E7E5]">
                    Top Stories
                  </span>
                </div>

                {editorPicks.length > 0 ? (
                  <div className="space-y-3.5">
                    {editorPicks.map((pick) => (
                      <ArticleCard key={pick.id} article={pick} variant="compact" />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-8 text-center">
                    No editor&apos;s picks available right now.
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#E7E7E5] text-center">
                <Link
                  href={ROUTES.PUBLIC.POSTS}
                  className="text-xs font-bold text-[#171717] hover:text-[#C62828] inline-flex items-center gap-1 transition-colors"
                >
                  <span>Browse all editorial tests</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>

          </section>
        ) : null}

        {/* 2. SPOTLIGHT IN-DEPTH FIELD REVIEWS (3-CARD GRID) */}
        <section aria-label="Spotlight Reviews" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200/90 pb-4 gap-3">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-50 border border-red-200/80 text-red-700 text-[10px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                <span>In-Depth Field Tests</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Featured Product Evaluations
              </h2>
            </div>
            <Link
              href={ROUTES.PUBLIC.POSTS}
              className="text-xs font-bold text-slate-600 hover:text-red-700 inline-flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 shrink-0 self-start sm:self-auto"
            >
              <span>View All Evaluations</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {spotlightArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {spotlightArticles.map((article) => (
                <ArticleCard key={article.id} article={article} variant="standard" />
              ))}
            </div>
          ) : !isLoading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-xs text-slate-500">
              No featured product evaluations published yet.
            </div>
          ) : null}
        </section>

        {/* 3. LATEST EDITORIAL ARTICLES WITH CATEGORY TABS */}
        <section aria-label="Latest Articles" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200/90">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-50 border border-red-200/80 text-red-700 text-[10px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                <span>The Journal Stream</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Latest Articles &amp; In-Depth Analysis
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Independent lab tests, buyer intelligence, and expert technology reports.
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500 shrink-0">
              <span>Category:</span>
              <span className="px-3 py-1 bg-white rounded-lg border border-slate-200 text-slate-900 font-bold shadow-2xs">
                {selectedCategories.length === 0
                  ? 'All Coverage'
                  : selectedCategories.length === 1
                  ? categories.find((c) => c.slug.toLowerCase() === selectedCategories[0].toLowerCase())?.name || selectedCategories[0]
                  : `${selectedCategories.length} Categories`}
              </span>
            </div>
          </div>

          {/* Active Category Chips */}
          {selectedCategories.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap -mt-2">
              {selectedCategories.map((cSlug) => {
                const catObj = categories.find((c) => c.slug.toLowerCase() === cSlug.toLowerCase());
                const name = catObj ? catObj.name : cSlug;
                return (
                  <button
                    key={cSlug}
                    type="button"
                    onClick={() => removeCategory(cSlug)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-950 text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
                    title={`Remove ${name}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>{name}</span>
                    <X size={12} className="ml-0.5 text-slate-400 hover:text-white" />
                  </button>
                );
              })}
              {selectedCategories.length > 1 && (
                <button
                  type="button"
                  onClick={clearAllCategories}
                  className="text-xs font-semibold text-[#C62828] hover:underline cursor-pointer ml-1"
                >
                  Clear all ({selectedCategories.length})
                </button>
              )}
            </div>
          )}

          {/* Dedicated Category Filter Bar with Unclipped Popover */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-1 min-w-0">
              <button
                type="button"
                onClick={clearAllCategories}
                className={`group shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                  selectedCategories.length === 0
                    ? 'bg-slate-950 text-white shadow-md shadow-slate-950/20 scale-[1.02]'
                    : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-950 border border-slate-200/90 shadow-2xs'
                }`}
              >
                <Sparkles
                  size={13}
                  className={selectedCategories.length === 0 ? 'text-amber-300' : 'text-slate-400 group-hover:text-slate-600'}
                />
                <span>All Articles</span>
              </button>
              {categories.map((cat) => {
                const isActive = selectedCategories.some(
                  (c) => c.toLowerCase() === cat.slug.toLowerCase()
                );
                return (
                  <button
                    type="button"
                    key={cat.slug}
                    onClick={() => toggleCategory(cat.slug)}
                    className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-slate-950 text-white shadow-md shadow-slate-950/20 scale-[1.02]'
                        : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-950 border border-slate-200/90 shadow-2xs'
                    }`}
                  >
                    {cat.icon && <span className="text-sm">{cat.icon}</span>}
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Pinned "All Categories" Popover Trigger & Dropdown */}
            {categories.length > 0 && (
              <div className="relative shrink-0" ref={categoryPopoverRef}>
                <button
                  type="button"
                  onClick={() => setIsCategoryPopoverOpen((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border shadow-2xs ${
                    selectedCategories.length > 0 || isCategoryPopoverOpen
                      ? 'bg-slate-950 text-white border-slate-950 shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200/90'
                  }`}
                  aria-expanded={isCategoryPopoverOpen}
                >
                  <Layers size={13} className={selectedCategories.length > 0 ? 'text-amber-300' : 'text-slate-500'} />
                  <span>All Categories ({categories.length})</span>
                  {selectedCategories.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {selectedCategories.length}
                    </span>
                  )}
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${
                      isCategoryPopoverOpen ? 'rotate-180 text-amber-300' : 'text-slate-400'
                    }`}
                  />
                </button>

                {isCategoryPopoverOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* Search Header */}
                    <div className="relative mb-2.5">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder={`Search ${categories.length} categories...`}
                        className="w-full bg-slate-50 text-slate-800 placeholder:text-slate-400 text-xs py-2 pl-8.5 pr-8 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                        autoFocus
                      />
                      {categorySearch && (
                        <button
                          type="button"
                          onClick={() => setCategorySearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {/* Quick Info & Reset */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pb-2 border-b border-slate-100 font-medium">
                      <span>Showing {filteredCategories.length} of {categories.length} sections</span>
                      {selectedCategories.length > 0 && (
                        <button
                          type="button"
                          onClick={clearAllCategories}
                          className="text-[#C62828] hover:underline font-bold cursor-pointer"
                        >
                          Reset to All
                        </button>
                      )}
                    </div>

                    {/* Scrollable Categories List */}
                    <div className="max-h-80 overflow-y-auto space-y-1 pt-2 pr-1 select-none">
                      {/* Option: All Coverage */}
                      <button
                        type="button"
                        onClick={clearAllCategories}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer text-left ${
                          selectedCategories.length === 0
                            ? 'bg-slate-950 text-white font-bold shadow-2xs'
                            : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm">✨</span>
                          <span className="truncate">All Articles</span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                            selectedCategories.length === 0
                              ? 'bg-white text-slate-900 border-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {selectedCategories.length === 0 && <Check size={11} className="stroke-[3]" />}
                        </div>
                      </button>

                      {filteredCategories.map((cat) => {
                        const isSel = selectedCategories.some(
                          (c) => c.toLowerCase() === cat.slug.toLowerCase()
                        );
                        return (
                          <button
                            type="button"
                            key={cat.id || cat.slug}
                            onClick={() => toggleCategory(cat.slug)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer text-left ${
                              isSel
                                ? 'bg-slate-950 text-white font-bold shadow-2xs'
                                : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {cat.icon ? <span className="text-sm">{cat.icon}</span> : <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />}
                              <span className="truncate">{cat.name}</span>
                            </div>

                            <div
                              className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                                isSel
                                  ? 'bg-white text-slate-900 border-white'
                                  : 'border-slate-300'
                              }`}
                            >
                              {isSel && <Check size={11} className="stroke-[3]" />}
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

          {/* Grid of Articles: 3 columns */}
          {isStreamLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 animate-pulse">
                  <div className="w-full h-44 bg-slate-100 rounded-xl" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : streamArticles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {streamArticles.map((article) => (
                <ArticleCard key={article.id} article={article} variant="standard" />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700">No articles found in this category yet.</p>
              {selectedCategories.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllCategories}
                  className="text-xs font-bold text-[#C62828] hover:underline cursor-pointer"
                >
                  View all articles
                </button>
              )}
            </div>
          )}

          {/* Explore Full Editorial Archive link */}
          <div className="pt-6 text-center">
            <Link
              href={ROUTES.PUBLIC.POSTS}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-950 text-slate-900 hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-xl border border-slate-200 transition-all shadow-2xs hover:shadow-md cursor-pointer group"
            >
              <span>Explore Full Editorial Archive</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* 4. MINIMALIST NEWSLETTER DISPATCH */}
        {newsletter.newsletterEnabled && (
          <section aria-label="Editorial Dispatch Newsletter" className="bg-white border border-[#E7E7E5] rounded-2xl p-8 sm:p-10 shadow-xs">
            <div className="max-w-2xl mx-auto text-center space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C62828] block">
                {newsletter.newsletterEyebrow}
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight">
                {newsletter.newsletterTitle}
              </h3>
              <p className="text-xs sm:text-sm text-[#737373] leading-relaxed max-w-lg mx-auto">
                {newsletter.newsletterDescription}
              </p>

              {subscribeDone ? (
                <p className="pt-2 text-xs sm:text-sm font-semibold text-emerald-700 inline-flex items-center gap-1.5">
                  <ShieldCheck size={15} /> {newsletter.newsletterSuccessMessage}
                </p>
              ) : (
                <form noValidate onSubmit={handleSubscribe} className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
                  <input
                    type="email"
                    value={subscribeEmail}
                    onChange={(e) => setSubscribeEmail(e.target.value)}
                    placeholder={newsletter.newsletterPlaceholder}
                    className="w-full px-4 py-2.5 bg-[#F8F8F6] border border-[#E7E7E5] rounded-xl text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#C62828]"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-[#C62828] hover:bg-[#b71c1c] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    {newsletter.newsletterButtonText}
                  </button>
                </form>
              )}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
