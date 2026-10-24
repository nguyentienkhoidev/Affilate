'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';
import { Article } from '@/types/deals';
import postService from '@/services/postService';
import tagService from '@/services/tagService';
import { 
  Calendar, 
  Clock, 
  ChevronRight, 
  ArrowRight, 
  Tag as TagIcon, 
  Flame 
} from 'lucide-react';

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export default function TagArchivePage({ params }: TagPageProps) {
  const { slug } = use(params);
  const rawTag = decodeURIComponent(slug).replace(/-/g, ' ');
  const normalizedTag = rawTag.toLowerCase().trim();

  const [articles, setArticles] = useState<Article[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load trending tags
  useEffect(() => {
    async function loadTags() {
      const tags = await tagService.getTrendingTags();
      setPopularTags(tags);
    }
    loadTags();
  }, []);

  // Fetch articles via service layer (3 articles per row, 6 articles per page)
  useEffect(() => {
    let isMounted = true;

    async function fetchTagArticles() {
      setIsLoading(true);
      const res = await postService.getPosts({
        tag: rawTag,
        page: currentPage,
        size: 6,
        sortBy,
      });

      if (isMounted) {
        setArticles(res.items);
        setTotalArticles(res.total);
        setTotalPages(res.totalPages);
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
          <Link href="/posts" className="hover:text-[#c62828] transition">Topics</Link>
          <ChevronRight size={12} />
          <span className="text-slate-900 font-semibold">#{rawTag}</span>
        </nav>

        {/* 2. Tag Header Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-2xs space-y-4 relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="bg-[#c62828] text-white font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded-sm shadow-xs flex items-center gap-1.5">
              <TagIcon size={12} /> Topic Coverage
            </span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md font-mono">
              {totalArticles} Published Articles
            </span>
          </div>

          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight font-editorial">
              #{rawTag}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-[#c62828]">
              Topic Archive &amp; Independent Consumer Analysis
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Curated list of editorial articles, test lab findings, and product analyses filed under <strong>#{rawTag}</strong>.
            </p>
          </div>

          {/* Integrated Related Topics */}
          {popularTags.length > 0 && (
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs flex-wrap">
              <span className="flex items-center gap-1 font-bold text-slate-700 text-[11px] uppercase tracking-wider shrink-0">
                <TagIcon size={13} className="text-[#c62828]" /> Related Topics:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {popularTags.map((tag) => {
                  const isCurrent = normalizedTag === tag.toLowerCase().trim();
                  return (
                    <Link
                      key={tag}
                      href={`/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors border ${
                        isCurrent
                          ? 'bg-[#c62828] text-white border-[#c62828] shadow-xs'
                          : 'bg-slate-50 hover:bg-[#c62828] hover:text-white text-slate-600 border-slate-200/80'
                      }`}
                    >
                      #{tag}
                    </Link>
                  );
                })}
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

        {/* 4. Article Grid: 3 Articles Per Row (Full 3-Column Grid) */}
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
                  {/* Thumbnail Image with Category Badge */}
                  <Link 
                    href={`/post/${article.slug}`}
                    className="block relative aspect-[16/10] overflow-hidden bg-slate-100"
                  >
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#c62828] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded shadow-xs">
                      {article.category}
                    </div>
                  </Link>

                  {/* Article Content */}
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar size={12} /> {article.publishedAt}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {article.readTime}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-[#c62828] transition leading-snug line-clamp-2">
                      <Link href={`/post/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Author + Read Link */}
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden relative border border-slate-200 bg-slate-100 shrink-0">
                      <Image
                        src={article.author.avatar}
                        alt={article.author.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="font-semibold text-slate-700 text-[11px]">
                      {article.author.name}
                    </span>
                  </div>

                  <Link
                    href={`/post/${article.slug}`}
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
            <p className="text-slate-500 text-sm">No articles found filed under this tag.</p>
          </div>
        )}

        {/* 5. Pagination & Explore Full Editorial Archive */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Page <strong>{currentPage}</strong> of {totalPages || 1} ({totalArticles} articles)
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                      currentPage === p
                        ? 'bg-[#c62828] text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/posts"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-[#c62828] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <span>Explore Full Editorial Archive</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* 6. Editorial Archive Callout */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#c62828] block">
            Bargorya Editorial Hub
          </span>
          <h3 className="font-editorial text-2xl font-bold text-slate-900 tracking-tight">
            Explore More In-Depth Product Reviews &amp; Guides
          </h3>
          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
            Access our complete catalog of 50+ laboratory benchmarks, long-term road tests, and smart consumer buying guides across all categories.
          </p>
          <div className="pt-2">
            <Link
              href="/posts"
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
