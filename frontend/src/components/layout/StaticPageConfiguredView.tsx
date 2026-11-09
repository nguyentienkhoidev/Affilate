'use client';

import { type ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, ShieldAlert } from 'lucide-react';
import { type StaticPageData } from '@/app/admin/pages/_lib/data';
import { ROUTES } from '@/constants/routes';
import { pageService } from '@/services/pageService';

interface StaticPageConfiguredViewProps {
  /** Slug matching `StaticPageData.slug` in Admin -> Static & Policy Pages */
  slug: string;
  /** Optional fallback layout rendered only when the database record has empty content */
  children?: ReactNode;
}

/**
 * Connects public static pages (`/about-us`, `/privacy-policy`, `/terms`,
 * `/affiliate-disclosure`, `/editorial-guidelines`, and `/pages/[slug]`) to
 * PostgreSQL Database via `pageService.getPublicPage(slug)`.
 */
export default function StaticPageConfiguredView({ slug, children }: StaticPageConfiguredViewProps) {
  const [page, setPage] = useState<StaticPageData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const cleanSlug = slug.replace(/^\/+/, '').toLowerCase();

  useEffect(() => {
    let active = true;
    setLoaded(false);
    pageService.getPublicPage(cleanSlug).then((data) => {
      if (active) {
        setPage(data);
        setLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, [cleanSlug]);

  if (!loaded) {
    return (
      <div className="bg-slate-50 min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-4 space-y-8 animate-pulse">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-4">
            <div className="h-5 w-40 bg-slate-200 rounded-full" />
            <div className="h-10 w-2/3 bg-slate-200 rounded-xl" />
            <div className="h-4 w-32 bg-slate-100 rounded" />
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-4">
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="h-4 w-5/6 bg-slate-100 rounded" />
            <div className="h-4 w-4/6 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // 1. Page disabled in Database
  if (page && page.isActive === false) {
    return (
      <div className="bg-slate-50 min-h-[60vh] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <ShieldAlert size={22} />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Page Currently Unavailable</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            This policy or information page has been temporarily unpublished by the editorial administrator.
          </p>
          <Link
            href={ROUTES.PUBLIC.HOME}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C62828] hover:underline pt-2"
          >
            <ArrowLeft size={14} /> Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // 2. Database has custom HTML content
  if (page && page.content && page.content.trim().length > 0) {
    return (
      <div className="bg-slate-50 min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#C62828] bg-red-50 px-3 py-1 rounded-full uppercase tracking-widest border border-red-200">
              <FileText size={14} /> Official Policy &amp; Information
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-editorial">
              {page.title}
            </h1>
            {page.updatedAt && (
              <p className="text-xs sm:text-sm text-slate-500">
                Last updated: {page.updatedAt}
              </p>
            )}
          </div>

          <div
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </div>
    );
  }

  // 3. Fallback built-in layout only when page exists with empty body
  if (page && children) {
    return <>{children}</>;
  }

  // 4. Not found
  return (
    <div className="bg-slate-50 min-h-[60vh] py-16 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900">Page Not Found</h1>
        <p className="text-xs text-slate-500">The requested page does not exist or has been removed.</p>
        <Link
          href={ROUTES.PUBLIC.HOME}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C62828] hover:underline pt-2"
        >
          <ArrowLeft size={14} /> Return to Homepage
        </Link>
      </div>
    </div>
  );
}
