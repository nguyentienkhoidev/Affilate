'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/deals';
import postService from '@/services/postService';
import categoryService, { CategoryItem } from '@/services/categoryService';
import ArticleCard from '@/components/deals/ArticleCard';
import { 
  ShieldCheck, 
  ChevronRight, 
  ArrowRight
} from 'lucide-react';

export default function EditorialArticlesOnlyHomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [leadArticle, setLeadArticle] = useState<Article | null>(null);
  const [editorPicks, setEditorPicks] = useState<Article[]>([]);
  const [spotlightArticles, setSpotlightArticles] = useState<Article[]>([]);
  const [streamArticles, setStreamArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data dynamically through postService and categoryService
  useEffect(() => {
    async function initHomePage() {
      setIsLoading(true);

      // 1. Lead story & Editor's picks
      const featured = await postService.getFeaturedArticle();
      const picks = await postService.getEditorPicks();
      setLeadArticle(featured);
      setEditorPicks(picks);

      // 2. Spotlight 3 articles
      const spotlightRes = await postService.getPosts({ page: 1, size: 3 });
      setSpotlightArticles(spotlightRes.items);

      // 3. Category tabs
      const cats = await categoryService.getCategories();
      setCategories(cats);

      setIsLoading(false);
    }

    initHomePage();
  }, []);

  // Filter stream articles when category changes
  useEffect(() => {
    async function loadStream() {
      const res = await postService.getPosts({
        categorySlug: selectedCategory === 'All' ? undefined : selectedCategory,
        page: 1,
        size: 6,
      });
      setStreamArticles(res.items);
    }

    loadStream();
  }, [selectedCategory]);

  return (
    <div className="bg-[#F8F8F6] min-h-screen py-8 sm:py-12 text-[#171717]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-14 sm:space-y-18">
        
        {/* =========================================================
            1. HERO MAGAZINE: 1 LEAD STORY + 4 EDITOR'S PICKS
           ========================================================= */}
        {leadArticle && (
          <section aria-label="Lead Editorial Feature" className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            
            {/* Dominant Featured Story (8 cols) */}
            <div className="lg:col-span-8 flex flex-col">
              <Link 
                href={`/post/${leadArticle.slug}`}
                className="group relative block w-full h-full min-h-[440px] sm:min-h-[520px] rounded-2xl overflow-hidden bg-[#171717] border border-[#E7E7E5] shadow-xs flex flex-col justify-end"
              >
                <Image
                  src={leadArticle.imageUrl}
                  alt={leadArticle.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                />

                {/* Bottom gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                {/* Text Content */}
                <div className="relative z-10 p-6 sm:p-10 space-y-3.5 text-white max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-[#C62828] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded shadow-xs inline-flex items-center gap-1.5">
                      <span>{leadArticle.category}</span>
                    </span>
                    <span className="text-xs text-white/90 font-medium hidden sm:inline-flex items-center gap-1">
                      <ShieldCheck size={14} className="text-emerald-400" />
                      <span>Verified Lab Review</span>
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
                    <span>•</span>
                    <span>{leadArticle.publishedAt}</span>
                    <span>•</span>
                    <span>{leadArticle.readTime}</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Curated Editor's Picks Column (4 cols) */}
            <div className="lg:col-span-4 bg-white border border-[#E7E7E5] rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs">
              <div>
                {/* Header */}
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

                {/* List */}
                <div className="space-y-3.5">
                  {editorPicks.map((pick) => (
                    <ArticleCard key={pick.id} article={pick} variant="compact" />
                  ))}
                </div>
              </div>

              {/* Bottom Link */}
              <div className="mt-4 pt-3 border-t border-[#E7E7E5] text-center">
                <Link 
                  href="/category/reviews"
                  className="text-xs font-bold text-[#171717] hover:text-[#C62828] inline-flex items-center gap-1 transition-colors"
                >
                  <span>Browse all editorial tests</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>

          </section>
        )}

        {/* =========================================================
            2. SPOTLIGHT IN-DEPTH FIELD REVIEWS (3-CARD GRID)
           ========================================================= */}
        <section aria-label="Spotlight Reviews" className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-[#E7E7E5] pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C62828] block mb-0.5">
                In-Depth Field Tests
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight">
                Featured Product Evaluations
              </h2>
            </div>
            <Link
              href="/category/reviews"
              className="text-xs font-bold text-[#737373] hover:text-[#C62828] flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {spotlightArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="standard" />
            ))}
          </div>
        </section>

        {/* =========================================================
            3. LATEST EDITORIAL ARTICLES WITH CATEGORY TABS
           ========================================================= */}
        <section aria-label="Latest Articles" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#E7E7E5] pb-3 gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C62828] block mb-0.5">
                The Journal Stream
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight">
                Latest Articles & Analysis
              </h2>
            </div>

            {/* Category Filter Pills (loaded dynamically from categoryService) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-[#171717] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    selectedCategory === cat.slug
                      ? 'bg-[#171717] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Articles: 3 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {streamArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="standard" />
            ))}
          </div>

          {/* Explore Full Editorial Archive link */}
          <div className="pt-6 text-center">
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-[#171717] text-[#171717] hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-200 transition-all shadow-xs cursor-pointer"
            >
              <span>Explore Full Editorial Archive</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* =========================================================
            4. MINIMALIST NEWSLETTER DISPATCH
           ========================================================= */}
        <section aria-label="Editorial Dispatch Newsletter" className="bg-white border border-[#E7E7E5] rounded-2xl p-8 sm:p-10 shadow-xs">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#C62828] block">
              The Bargorya Dispatch
            </span>
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight">
              Independent Reviews & Product Tests, Weekly
            </h3>
            <p className="text-xs sm:text-sm text-[#737373] leading-relaxed max-w-lg mx-auto">
              Zero sponsored ranking manipulation. Join 45,000+ smart readers who rely on our independent testing laboratory.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to Bargorya Dispatch!'); }} className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                className="w-full px-4 py-2.5 bg-[#F8F8F6] border border-[#E7E7E5] rounded-xl text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#C62828]"
              />
              <button
                type="submit"
                className="w-full sm:w-auto bg-[#C62828] hover:bg-[#b71c1c] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>

      </div>
    </div>
  );
}
