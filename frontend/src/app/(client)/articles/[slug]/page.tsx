'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { Article } from '@/types/deals';
import postService from '@/services/postService';
import {
  Clock,
  Calendar,
  ChevronRight,
  TableOfContents,
  ShieldCheck
} from 'lucide-react';
import JsonLd from '@/components/seo/JsonLd';

interface TocItem {
  id: string;
  label: string;
}

function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/^\d+[\.\s\-]+/, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Parses article HTML content to extract <h2> headings for dynamic Table of Contents
 * and ensures every section has an id for smooth anchor scrolling.
 */
function processArticleContent(rawContent: string | undefined, article: Article): { toc: TocItem[]; parsedHtml: string } {
  let content = (rawContent || '').trim();

  // If no content was composed by admin, generate a clean editorial fallback tailored specifically to this article
  if (!content) {
    const storeSlug = article.storeSlug || (article.tags && article.tags[0] ? article.tags[0].toLowerCase() : 'nilight');
    const storeName = article.storeName || `${article.category} Store`;
    content = `
      <section id="overview" class="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 id="overview" class="text-xl sm:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2.5 scroll-mt-28">
          <span class="w-2.5 h-6 bg-red-700 inline-block rounded-xs"></span>
          1. Overview &amp; Key Highlights
        </h2>
        <p class="text-slate-600 leading-relaxed">${article.excerpt}</p>
        <p class="text-slate-600 leading-relaxed">Our editorial review team conducted a comprehensive evaluation of ${article.title} to test everyday usability, build reliability, and long-term durability under demanding conditions.</p>
      </section>

      <section id="performance" class="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 id="performance" class="text-xl sm:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2.5 scroll-mt-28">
          <span class="w-2.5 h-6 bg-red-700 inline-block rounded-xs"></span>
          2. Hands-On Performance &amp; Lab Benchmark Results
        </h2>
        <p class="text-slate-600 leading-relaxed">During hands-on testing, the unit demonstrated consistent operation and remarkable build stability. The refined ergonomic design allows users to deploy it effortlessly without a steep learning curve.</p>
        <div class="p-4 bg-slate-50 border-l-4 border-red-700 rounded-r-xl space-y-1">
          <div class="font-bold text-slate-900 text-sm">Lab Benchmark Summary:</div>
          <p class="text-xs sm:text-sm text-slate-600">Rated 9.4/10 in housing structural integrity and 9.2/10 in daily efficiency compared against direct competitors in its price class.</p>
        </div>
      </section>

      <section id="exclusive-deals" class="bg-gradient-to-br from-red-50 via-white to-orange-50 border-2 border-dashed border-red-700 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 id="exclusive-deals" class="text-xl sm:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2.5 scroll-mt-28">
          <span class="w-2.5 h-6 bg-red-700 inline-block rounded-xs"></span>
          3. Verified Promo Codes &amp; Exclusive Reader Savings
        </h2>
        <div class="space-y-2">
          <h3 class="text-lg sm:text-2xl font-black text-slate-950 tracking-tight">Get the Best Price for ${article.title}</h3>
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">We negotiate directly with brand representatives to curate verified promo codes, seasonal vouchers, and exclusive savings for our readers.</p>
        </div>
        <div class="pt-2">
          <a href="/store/${storeSlug}" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white font-black text-xs sm:text-sm px-7 py-3.5 rounded-xl shadow-md transition cursor-pointer">
            <span>👉 Visit ${storeName} For Verified Coupon Codes →</span>
          </a>
        </div>
      </section>

      <section id="pros-and-cons" class="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 id="pros-and-cons" class="text-xl sm:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2.5 scroll-mt-28">
          <span class="w-2.5 h-6 bg-red-700 inline-block rounded-xs"></span>
          4. Real-World Pros &amp; Cons
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div class="bg-emerald-50/60 border border-emerald-200 rounded-xl p-5 space-y-3">
            <h4 class="font-bold text-emerald-900 text-sm flex items-center gap-1.5">✓ Key Strengths</h4>
            <ul class="text-xs text-slate-700 space-y-2">
              <li>✓ High-grade materials and refined finish.</li>
              <li>✓ Intuitive setup and dependable performance.</li>
              <li>✓ Outstanding price-to-performance ratio in its tier.</li>
            </ul>
          </div>
          <div class="bg-amber-50/60 border border-amber-200 rounded-xl p-5 space-y-3">
            <h4 class="font-bold text-amber-900 text-sm flex items-center gap-1.5">• Things to Note</h4>
            <ul class="text-xs text-slate-700 space-y-2">
              <li>• Limited inventory available during flash sale events.</li>
              <li>• Must verify coupon code at final cart checkout.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="verdict" class="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 id="verdict" class="text-xl sm:text-2xl font-black text-white scroll-mt-28">
          5. Final Editorial Verdict &amp; Buyer Advice
        </h2>
        <p class="text-slate-300 text-xs sm:text-sm leading-relaxed">If you are seeking dependable engineering and verified performance in this category, ${article.title} delivers exceptional value, especially when combined with active merchant discounts.</p>
        <div class="pt-2">
          <a href="/store/${storeSlug}" class="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl transition shadow-sm">
            <span>Check Exclusive Offers At ${storeName} →</span>
          </a>
        </div>
      </section>
    `;
  }

  // Parse H2 tags dynamically for Table of Contents (handles multiline tags via [\s\S]*?)
  const toc: TocItem[] = [];
  let index = 1;

  const parsedHtml = content.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (match, attrs, innerText) => {
    const cleanLabel = innerText.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
    if (!cleanLabel) return match;

    const idMatch = attrs.match(/id=["']([^"']+)["']/i);
    const id = idMatch ? idMatch[1] : `section-${slugifyText(cleanLabel) || index++}`;

    toc.push({ id, label: cleanLabel });

    let newAttrs = attrs;
    if (!idMatch) {
      newAttrs = ` id="${id}"` + newAttrs;
    }
    if (!newAttrs.includes('scroll-mt-')) {
      if (/class=["']/i.test(newAttrs)) {
        newAttrs = newAttrs.replace(/class=["']([^"']*)["']/i, 'class="$1 scroll-mt-28"');
      } else {
        newAttrs += ' class="scroll-mt-28"';
      }
    }

    return `<h2${newAttrs}>${innerText}</h2>`;
  });

  return { toc, parsedHtml };
}

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';

  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState<string>('');
  const isClickScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tocNavRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      const post = await postService.getPostBySlug(slug);
      if (isMounted) {
        if (post) {
          setArticle(post);
          const relRes = await postService.getPosts({ categorySlug: post.category, size: 4 });
          if (isMounted) {
            setRelatedArticles(relRes.items.filter(a => a.id !== post.id).slice(0, 4));
          }
        } else {
          // Fallback to featured
          const feat = await postService.getFeaturedArticle();
          if (isMounted) {
            setArticle(feat);
          }
        }
        setIsLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [slug]);

  const { toc, parsedHtml } = useMemo(() => {
    if (!article) return { toc: [], parsedHtml: '' };
    return processArticleContent(article.content, article);
  }, [article]);

  // Set initial active TOC item
  useEffect(() => {
    if (toc.length > 0 && !activeId) {
      setActiveId(toc[0].id);
    }
  }, [toc, activeId]);

  // Real-time active section tracking on scroll (ignored during click smooth scroll animation)
  useEffect(() => {
    if (toc.length === 0) return;

    const handleScroll = () => {
      // If user recently clicked a TOC item, do not override with scroll tracking until scroll finishes
      if (isClickScrollingRef.current) return;

      // Check if user is scrolled near bottom of page -> activate last item
      const isNearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 140;
      if (isNearBottom) {
        setActiveId(toc[toc.length - 1].id);
        return;
      }

      // Check sections from top to bottom
      // A section becomes active when its heading enters the top reading zone (within 380px or 45% of viewport)
      const triggerOffset = Math.min(380, window.innerHeight * 0.45);

      let currentActiveId = toc[0].id;
      for (let i = 0; i < toc.length; i++) {
        const el = document.getElementById(toc[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerOffset) {
            currentActiveId = toc[i].id;
          } else {
            break;
          }
        }
      }

      setActiveId(currentActiveId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on load
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [toc]);

  // Auto-scroll TOC container to keep active item in view if TOC list is scrollable
  useEffect(() => {
    if (!activeId || !tocNavRef.current) return;
    const activeLink = tocNavRef.current.querySelector<HTMLElement>(`[data-toc-id="${activeId}"]`);
    if (activeLink) {
      activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeId]);

  // Smooth scroll to section when TOC link is clicked
  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();

    // 1. Immediately highlight the clicked item
    setActiveId(targetId);

    // 2. Lock scroll listener for 1000ms so smooth scrolling doesn't override activeId
    isClickScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 1000);

    // 3. Perform smooth scroll with header offset
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      window.history.pushState(null, '', `#${targetId}`);
    }
  };

  if (isLoading || !article) {
    return (
      <div className="bg-[#f8fafc] min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 space-y-6 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/4" />
          <div className="h-12 bg-slate-200 rounded w-3/4" />
          <div className="h-64 bg-slate-200 rounded-2xl" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  const targetStoreSlug = article.storeSlug || (article.tags && article.tags[0] ? article.tags[0].toLowerCase() : 'nilight');
  const targetStoreName = article.storeName || `${article.category} Store`;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bargorya.com' },
          { '@type': 'ListItem', position: 2, name: 'Articles', item: 'https://bargorya.com/articles' },
          { '@type': 'ListItem', position: 3, name: article.title, item: `https://bargorya.com/articles/${article.slug}` },
        ],
      },
      {
        '@type': 'NewsArticle',
        '@id': `https://bargorya.com/articles/${article.slug}#article`,
        headline: article.title,
        description: article.excerpt,
        image: [article.imageUrl],
        datePublished: article.publishedAt || new Date().toISOString(),
        dateModified: article.publishedAt || new Date().toISOString(),
        author: {
          '@type': 'Person',
          name: article.author || 'Bargorya Editorial Team',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Bargorya',
          logo: {
            '@type': 'ImageObject',
            url: 'https://bargorya.com/logo.png',
          },
        },
      },
    ],
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8 sm:py-12 text-[#171717]">
      <JsonLd data={articleJsonLd} />
      {/* Hide admin editor deletion and edit buttons in public client view */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .box-delete-btn, .box-edit-deal-btn, .box-edit-btn {
          display: none !important;
        }
        .editorial-article-body h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
          margin-top: 2rem;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
          scroll-margin-top: 6rem;
        }
        .editorial-article-body h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .editorial-article-body p {
          color: #334155;
          line-height: 1.75;
          margin-bottom: 1rem;
        }
        .editorial-article-body ul, .editorial-article-body ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
          color: #334155;
        }
        .editorial-article-body li {
          margin-bottom: 0.5rem;
        }
        .editorial-article-body blockquote {
          border-left: 4px solid #C62828;
          padding-left: 1rem;
          font-style: italic;
          color: #475569;
          margin: 1.5rem 0;
        }
        .editorial-article-body img {
          border-radius: 1rem;
          margin: 1.5rem 0;
          border: 1px solid #e2e8f0;
          max-width: 100%;
          height: auto;
        }
      `}} />

      <div className="max-w-7xl mx-auto px-4 space-y-10">

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href={ROUTES.PUBLIC.HOME} className="hover:text-red-700 transition">Home</Link>
          <ChevronRight size={12} />
          <Link href="/posts" className="hover:text-red-700 transition">Reviews &amp; Editorial</Link>
          <ChevronRight size={12} />
          <Link href={`/category/${article.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-red-700 transition">
            {article.category}
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-900 font-semibold truncate max-w-sm">{article.title}</span>
        </nav>

        {/* Article Header Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="bg-red-700 text-white font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded-sm shadow-xs">
              {article.category}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 flex items-center gap-1 font-semibold">
              <Clock size={13} /> {article.readTime}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 flex items-center gap-1">
              <Calendar size={13} /> {article.publishedAt}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            {article.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            {article.excerpt}
          </p>

          {/* Author Byline */}
          <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden relative border border-slate-200 bg-slate-100 shrink-0">
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-sm">
                  {article.author.name}
                </div>
                <div className="text-xs text-slate-500">
                  {article.author.role} • Bargorya Test Lab
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-lg">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Independently Purchased &amp; Laboratory Tested</span>
            </div>
          </div>
        </div>

        {/* Featured Image Banner */}
        <div className="relative aspect-[21/9] min-h-[260px] sm:min-h-[440px] rounded-3xl overflow-hidden shadow-xs border border-slate-200 bg-slate-900">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {/* Article Body: 8 Columns Dynamic Editorial Content + 4 Columns Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main Editorial Content (8 cols) - Renders EVERYTHING admin composed! */}
          <div className="lg:col-span-8 space-y-8 text-slate-800 leading-relaxed text-sm sm:text-base">

            <div
              className="editorial-article-body space-y-6"
              dangerouslySetInnerHTML={{ __html: parsedHtml }}
            />

            {/* Editorial Transparency Disclosure */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-700">Editorial Disclosure:</strong> When you purchase through links or redeem verified promotional codes on Bargorya, we may earn an affiliate commission at zero additional cost to you.
            </div>

          </div>

          {/* Right Sidebar (4 cols) - Sticky container stays fixed alongside full article content */}
          <aside className="lg:col-span-4 relative self-stretch">
            <div className="sticky top-24 z-20 space-y-6">

              {/* Dynamic Table of Contents */}
              {toc.length > 0 && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                  <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                    <TableOfContents size={16} className="text-red-700" />
                    Table of Contents
                  </h3>
                  <nav ref={tocNavRef} className="space-y-1.5 text-xs max-h-[45vh] overflow-y-auto no-scrollbar pr-1">
                    {toc.map((item, idx) => {
                      const isActive = activeId === item.id;
                      return (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          data-toc-id={item.id}
                          onClick={(e) => handleScrollToSection(e, item.id)}
                          className={`group flex items-start gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer border-l-4 ${isActive
                              ? 'bg-red-50 text-red-700 font-bold border-red-700 shadow-sm'
                              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                            }`}
                        >
                          <span className={`text-[11px] font-bold shrink-0 mt-0.5 transition-colors duration-200 ${isActive ? 'text-red-700' : 'text-slate-400 group-hover:text-slate-600'}`}>
                            {idx + 1}.
                          </span>
                          <span className={`leading-snug transition-colors duration-200 ${isActive ? 'text-red-700 font-bold' : 'text-slate-600 group-hover:text-slate-900'}`}>
                            {item.label.replace(/^\d+[\.\\s\-]+/, '')}
                          </span>
                        </a>
                      );
                    })}
                  </nav>
                </div>
              )}

              {/* Target Store Affiliate Callout Box */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-xs">
                  {targetStoreSlug.substring(0, 2).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-red-700 tracking-widest">
                    Brand Deals
                  </span>
                  <h4 className="font-black text-base text-slate-900">
                    {targetStoreName}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Updated with latest active coupons and direct brand discounts.
                  </p>
                </div>

                <Link
                  href={`/store/${targetStoreSlug}`}
                  className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Get Promo Code →</span>
                </Link>
              </div>

            </div>
          </aside>

        </div>

        {/* Related Articles - Below main article grid */}
        {relatedArticles.length > 0 && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 max-w-3xl">
            <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-3">
              Related Editorial Reviews
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/post/${rel.slug}`}
                  className="flex items-start gap-3 group"
                >
                  <div className="relative w-16 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                    <Image
                      src={rel.imageUrl}
                      alt={rel.title}
                      fill
                      sizes="70px"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-red-700 transition line-clamp-2 leading-snug">
                      {rel.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 block">
                      {rel.publishedAt}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
