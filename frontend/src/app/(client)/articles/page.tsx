import Link from 'next/link';
import postService from '@/services/postService';
import { ROUTES } from '@/constants/routes';
import ArticleCard from '@/components/deals/ArticleCard';
import { BookOpen, ChevronRight, Sparkles } from 'lucide-react';

export default async function ArticlesDirectoryPage() {
  const [featuredArticle, postsResult] = await Promise.all([
    postService.getFeaturedArticle(),
    postService.getPosts({ page: 1, size: 24 }),
  ]);

  const regularArticles = postsResult.items.filter(a => a.id !== featuredArticle?.id);

  return (
    <div className="bg-slate-50/60 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 space-y-10">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href={ROUTES.PUBLIC.HOME} className="hover:text-slate-900 transition">Home</Link>
          <ChevronRight size={12} />
          <span className="text-slate-900 font-semibold">Articles & Buying Guides</span>
        </nav>

        {/* Header */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm space-y-3">
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <BookOpen size={13} className="text-emerald-600" />
            <span>Independent Lab Testing & Buying Advice</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Product Reviews & Shopper Buying Guides
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            In-depth comparisons, acoustic decibel tests, off-road lighting analyses, and price tracking reports compiled by Bargorya staff.
          </p>
        </div>

        {/* Featured Story */}
        {featuredArticle && (
          <div className="space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              Featured Cover Story
            </span>
            <div className="grid grid-cols-1 gap-6">
              <ArticleCard article={featuredArticle} featured />
            </div>
          </div>
        )}

        {/* Regular Articles Grid (3 articles per row) */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-black text-slate-950">
            Latest Tested Guides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularArticles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
