'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { absoluteUrl } from '@/constants/site';
import { Article, Store, Coupon } from '@/types/deals';
import postService from '@/services/postService';
import storeService from '@/services/storeService';
import dealService from '@/services/dealService';
import { useSiteSettings } from '@/lib/admin/useSiteSettings';
import {
  Clock,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Tag,
  Star,
  Sparkles,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import JsonLd from '@/components/seo/JsonLd';

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const { settings } = useSiteSettings();

  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [matchedStore, setMatchedStore] = useState<Store | null>(null);
  const [storeCoupons, setStoreCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!slug) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setNotFound(false);

      const post = await postService.getPostBySlug(slug);
      if (!isMounted) return;

      if (!post) {
        setArticle(null);
        setMatchedStore(null);
        setStoreCoupons([]);
        setRelatedArticles([]);
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setArticle(post);

      const linkedStoreSlug = post.storeSlug ? post.storeSlug.trim() : '';

      const [storeRes, couponsRes, relRes] = await Promise.all([
        linkedStoreSlug ? storeService.getStoreBySlug(linkedStoreSlug) : Promise.resolve(null),
        linkedStoreSlug ? dealService.getCouponsByStoreSlug(linkedStoreSlug) : Promise.resolve([]),
        postService.getPosts({
          categorySlug: post.categorySlug || undefined,
          page: 1,
          size: 6,
        }),
      ]);

      if (!isMounted) return;
      setMatchedStore(storeRes);
      setStoreCoupons((couponsRes || []).slice(0, 3));
      setRelatedArticles(relRes.items.filter((a) => a.id !== post.id).slice(0, 4));
      setIsLoading(false);
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
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

  if (notFound || !article) {
    return (
      <div className="bg-[#f8fafc] min-h-screen py-20">
        <div className="max-w-xl mx-auto px-4 text-center space-y-5 bg-white border border-slate-200 rounded-3xl p-10 shadow-xs">
          <BookOpen size={44} className="mx-auto text-slate-300" />
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Article Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The review or editorial article you are looking for does not exist or is no longer published.
          </p>
          <div className="pt-2">
            <Link
              href={ROUTES.PUBLIC.POSTS}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl transition"
            >
              <ArrowLeft size={14} />
              <span>Browse Editorial Archive</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const targetStoreSlug = matchedStore?.slug || article.storeSlug || '';
  const targetStoreName = matchedStore?.name || article.storeName || '';
  const targetStoreRating =
    typeof matchedStore?.rating === 'number' && matchedStore.rating > 0 ? matchedStore.rating : null;
  const rawMaxDiscount = matchedStore?.maxDiscount || storeCoupons[0]?.discount || null;
  const formattedMaxDiscount = rawMaxDiscount
    ? rawMaxDiscount.toLowerCase().startsWith('up to') || rawMaxDiscount.toLowerCase() === 'verified offers'
      ? rawMaxDiscount
      : `Up to ${rawMaxDiscount}`
    : null;

  const sidebarConfig = article.sidebarConfig || {};
  const showBrandCard = sidebarConfig.showBrandCard !== false && Boolean(targetStoreSlug && targetStoreName);
  const showStoreCoupons = sidebarConfig.showStoreCoupons !== false && Boolean(targetStoreSlug) && storeCoupons.length > 0;
  const showRelatedReviews = sidebarConfig.showRelatedReviews !== false && relatedArticles.length > 0;
  const showGuaranteeCard = sidebarConfig.showGuaranteeCard !== false;

  const categorySlug =
    article.categorySlug || article.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const canonicalArticleUrl = absoluteUrl(ROUTES.PUBLIC.POST_DETAIL(article.slug));
  const publisherName = settings.siteName || 'HeyGoodly';
  const publisherLogo = settings.logoUrl || settings.faviconUrl || absoluteUrl('/favicon.ico');

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl(ROUTES.PUBLIC.HOME) },
          { '@type': 'ListItem', position: 2, name: 'Reviews & Editorial', item: absoluteUrl(ROUTES.PUBLIC.POSTS) },
          { '@type': 'ListItem', position: 3, name: article.title, item: canonicalArticleUrl },
        ],
      },
      {
        '@type': 'NewsArticle',
        '@id': `${canonicalArticleUrl}#article`,
        headline: article.title,
        description: article.excerpt,
        ...(article.imageUrl ? { image: [article.imageUrl] } : {}),
        ...(article.publishedAt ? { datePublished: article.publishedAt, dateModified: article.publishedAt } : {}),
        author: {
          '@type': 'Person',
          name: article.author?.name || `${publisherName} Editorial Team`,
        },
        publisher: {
          '@type': 'Organization',
          name: publisherName,
          logo: {
            '@type': 'ImageObject',
            url: publisherLogo,
          },
        },
      },
    ],
  };

  const hasRichContent = Boolean(article.content && article.content.trim().length > 0);

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8 sm:py-12 text-[#171717]">
      <JsonLd data={articleJsonLd} />
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .box-delete-btn, .box-edit-deal-btn, .box-edit-btn, [data-box-type="toc"] {
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
        html.dark .editorial-article-body h1,
        html.dark .editorial-article-body h2,
        html.dark .editorial-article-body h3,
        html.dark .editorial-article-body h4 {
          color: #f8fafc !important;
        }
        html.dark .editorial-article-body p,
        html.dark .editorial-article-body ul,
        html.dark .editorial-article-body ol,
        html.dark .editorial-article-body li {
          color: #cbd5e1 !important;
        }
        html.dark .editorial-article-body blockquote {
          color: #e2e8f0 !important;
          background-color: #161d2b !important;
          border-left-color: #ef4444 !important;
        }
        html.dark .editorial-article-body img {
          border-color: #242d42 !important;
        }
      `,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 space-y-10">

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href={ROUTES.PUBLIC.HOME} className="hover:text-red-700 transition">Home</Link>
          <ChevronRight size={12} />
          <Link href={ROUTES.PUBLIC.POSTS} className="hover:text-red-700 transition">Reviews &amp; Editorial</Link>
          {categorySlug && (
            <>
              <ChevronRight size={12} />
              <Link href={ROUTES.PUBLIC.CATEGORY_DETAIL(categorySlug)} className="hover:text-red-700 transition">
                {article.category}
              </Link>
            </>
          )}
          <ChevronRight size={12} />
          <span className="text-slate-900 font-semibold truncate max-w-sm">{article.title}</span>
        </nav>

        {/* Article Header Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="bg-red-700 text-white font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded-sm shadow-xs">
              {article.category}
            </span>
            {article.readTime && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 flex items-center gap-1 font-semibold">
                  <Clock size={13} /> {article.readTime}
                </span>
              </>
            )}
            {article.publishedAt && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar size={13} /> {article.publishedAt}
                </span>
              </>
            )}
            {article.rating && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-amber-600 font-bold inline-flex items-center gap-1">
                  <Star size={13} className="fill-amber-400 text-amber-400" /> {article.rating}/5.0
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              {article.excerpt}
            </p>
          )}

          {/* Author Byline */}
          <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden relative border border-slate-200 bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
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
              <div>
                <div className="font-extrabold text-slate-900 text-sm">
                  {article.author.name}
                </div>
                <div className="text-xs text-slate-500">
                  {article.author.role} • {publisherName} Test Lab
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
        {article.imageUrl && (
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
        )}

        {/* Article Body: 8 Columns Dynamic Editorial Content + 4 Columns Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-8 space-y-8 text-slate-800 leading-relaxed text-sm sm:text-base">
            {hasRichContent ? (
              <div
                className="editorial-article-body bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6"
                dangerouslySetInnerHTML={{ __html: article.content || '' }}
              />
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
                <p className="text-slate-700 leading-relaxed">
                  {article.excerpt || 'No article body has been published for this entry yet.'}
                </p>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-700">Editorial Disclosure:</strong>{' '}
              {settings.affiliateDisclosure ||
                `When you purchase through links or redeem verified promotional codes on ${publisherName}, we may earn an affiliate commission at zero additional cost to you.`}
            </div>
          </div>

          <aside className="lg:col-span-4 relative self-stretch">
            <div className="sticky top-24 z-20 space-y-6">

              {/* 1. Target Store Affiliate Callout Box (Strictly only when post is linked to a real Store) */}
              {showBrandCard && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-xs overflow-hidden border border-slate-200">
                    {matchedStore?.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={matchedStore.logoUrl}
                        alt={targetStoreName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{targetStoreName.substring(0, 2).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {formattedMaxDiscount && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-red-700 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full tracking-widest">
                        <Sparkles size={11} /> Brand Deals • {formattedMaxDiscount}
                      </span>
                    )}
                    <h4 className="font-black text-lg text-slate-900">
                      {targetStoreName}
                    </h4>
                    {targetStoreRating && (
                      <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                        <div className="flex items-center text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={13} className="fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="font-bold text-slate-800 ml-1">{targetStoreRating.toFixed(1)}</span>
                      </div>
                    )}
                    <p className="text-xs text-slate-500 leading-relaxed pt-1">
                      {sidebarConfig.brandDescription ||
                        matchedStore?.shortDescription ||
                        `Hand-tested promo codes and direct manufacturer offers for ${targetStoreName}.`}
                    </p>
                  </div>

                  <Link
                    href={ROUTES.PUBLIC.STORE_DETAIL(targetStoreSlug)}
                    className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>
                      {sidebarConfig.ctaText ||
                        (storeCoupons.length > 0
                          ? `Get Promo Code (${storeCoupons.length} Active) →`
                          : `Visit ${targetStoreName} Store →`)}
                    </span>
                  </Link>
                </div>
              )}

              {/* 2. Live Active Coupons for this Linked Store */}
              {showStoreCoupons && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <Tag size={15} className="text-red-700" />
                      <span>Active {targetStoreName} Codes</span>
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {storeCoupons.map((c) => (
                      <Link
                        key={c.id}
                        href={`${ROUTES.PUBLIC.STORE_DETAIL(targetStoreSlug)}?offer=${c.id}`}
                        className="block p-3 rounded-xl border border-slate-200/90 hover:border-red-300 bg-slate-50/60 hover:bg-red-50/30 transition group space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                            {c.discount}
                          </span>
                          {c.code ? (
                            <span className="font-mono text-[11px] font-bold text-slate-800 bg-white border border-dashed border-slate-300 px-2 py-0.5 rounded group-hover:border-red-400 group-hover:text-red-700 transition">
                              {c.code}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 size={11} /> Instant Deal
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-red-700 transition line-clamp-1">
                          {c.title}
                        </p>
                      </Link>
                    ))}
                  </div>

                  <Link
                    href={ROUTES.PUBLIC.STORE_DETAIL(targetStoreSlug)}
                    className="w-full py-2 text-center text-xs font-bold text-slate-600 hover:text-red-700 flex items-center justify-center gap-1 pt-1 transition"
                  >
                    <span>View all {targetStoreName} coupons</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              )}

              {/* 3. Related Editorial Reviews in Sidebar */}
              {showRelatedReviews && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <BookOpen size={15} className="text-red-700" />
                      <span>Related Lab Reviews</span>
                    </h3>
                    <Link href={ROUTES.PUBLIC.POSTS} className="text-[11px] font-bold text-red-700 hover:underline">
                      See all
                    </Link>
                  </div>

                  <div className="space-y-3.5">
                    {relatedArticles.map((rel) => (
                      <Link
                        key={rel.id}
                        href={ROUTES.PUBLIC.POST_DETAIL(rel.slug)}
                        className="flex items-start gap-3 group"
                      >
                        <div className="relative w-16 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200 flex items-center justify-center">
                          {rel.imageUrl ? (
                            <Image
                              src={rel.imageUrl}
                              alt={rel.title}
                              fill
                              sizes="70px"
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <BookOpen size={16} className="text-slate-400" />
                          )}
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block">
                            {rel.category}
                          </span>
                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-red-700 transition line-clamp-2 leading-snug">
                            {rel.title}
                          </h4>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Article Tags & Independent Testing Guarantee */}
              {showGuaranteeCard && (
                <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <ShieldCheck size={16} />
                    <span>{sidebarConfig.guaranteeTitle || `${publisherName} Testing Guarantee`}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {sidebarConfig.guaranteeText ||
                      'Every product reviewed is independently evaluated against real-world benchmarks. We never accept paid placements to alter lab scores.'}
                  </p>
                  {article.tags && article.tags.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                      {article.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={ROUTES.PUBLIC.TAG_DETAIL(tag.toLowerCase().replace(/\s+/g, '-'))}
                          className="text-[11px] font-medium bg-slate-800 hover:bg-red-700 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg transition"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
                  href={ROUTES.PUBLIC.POST_DETAIL(rel.slug)}
                  className="flex items-start gap-3 group"
                >
                  <div className="relative w-16 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200 flex items-center justify-center">
                    {rel.imageUrl ? (
                      <Image
                        src={rel.imageUrl}
                        alt={rel.title}
                        fill
                        sizes="70px"
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <BookOpen size={16} className="text-slate-400" />
                    )}
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
