'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Menu as MenuIcon,
  X,
  Zap,
  ArrowRight,
  Sun,
  Moon,
} from 'lucide-react';
import { useSiteSettings } from '@/lib/admin/useSiteSettings';
import { useTheme } from '@/context/ThemeContext';
import { type MenuItem } from '@/app/admin/menus/_lib/data';
import { menuService, resolveMenuHref } from '@/services/menuService';
import { pageService, resolvePublicPageHref, type PublicPageSummary } from '@/services/pageService';
import { categoryService, type CategoryItem } from '@/services/categoryService';
import { postService } from '@/services/postService';
import { tagService } from '@/services/tagService';
import { type Article } from '@/types/deals';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { settings } = useSiteSettings();
  const { isDark, toggleTheme } = useTheme();
  const [dynamicMenus, setDynamicMenus] = useState<MenuItem[]>([]);
  const [fallbackCategories, setFallbackCategories] = useState<CategoryItem[]>([]);
  const [publicPages, setPublicPages] = useState<PublicPageSummary[]>([]);
  const [recentPosts, setRecentPosts] = useState<Article[]>([]);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  const [hasLoadedTags, setHasLoadedTags] = useState(false);
  const [mobileMenuForPath, setMobileMenuForPath] = useState<string | null>(null);
  const [searchOpenForPath, setSearchOpenForPath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let active = true;

    menuService.getPublicMenus('main').then((items) => {
      if (!active) return;
      if (items.length > 0) {
        setDynamicMenus(items);
      } else {
        categoryService.getCategories('post').then((cats) => {
          if (active) setFallbackCategories(cats);
        });
      }
    });

    pageService.getPublicPages().then((pages) => {
      if (active) setPublicPages(pages);
    });

    postService.getPosts({ size: 6 }).then((res) => {
      if (active) {
        setRecentPosts(res.items);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const mobileMenuOpen = mobileMenuForPath === pathname;
  const searchOpen = searchOpenForPath === pathname;

  const setMobileMenuOpen = (open: boolean) => {
    setMobileMenuForPath(open ? pathname : null);
  };

  const setSearchOpen = (open: boolean) => {
    setSearchOpenForPath(open ? pathname : null);
    if (open && !hasLoadedTags) {
      setHasLoadedTags(true);
      tagService.getTrendingTags().then((tags) => {
        setTrendingTags(tags);
      });
    }
  };

  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      router.push(`${ROUTES.PUBLIC.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Main navigation strictly from PostgreSQL (`menus` where position='main', or active DB categories)
  const mainNavItems = dynamicMenus
    .filter((m) => m.position === 'main' && m.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const hasHome = mainNavItems.some(
    (m) => m.targetValue === '/' || m.title.trim().toLowerCase() === 'home'
  );

  const navLinks: Array<{ label: string; href: string }> =
    mainNavItems.length > 0
      ? [
          ...(hasHome ? [] : [{ label: 'HOME', href: ROUTES.PUBLIC.HOME }]),
          ...mainNavItems.map((m) => ({
            label: m.title.toUpperCase(),
            href: resolveMenuHref(m),
          })),
        ]
      : [
          { label: 'HOME', href: ROUTES.PUBLIC.HOME },
          ...fallbackCategories.slice(0, 7).map((c) => ({
            label: c.name.toUpperCase(),
            href: ROUTES.PUBLIC.CATEGORY_DETAIL(c.slug),
          })),
        ];

  // Top utility bar links strictly from active DB pages (`/api/v1/pages`) + Contact Us route
  const activePageLinks = publicPages
    .filter((p) => p.isActive)
    .map((p) => ({
      label: p.title,
      href: resolvePublicPageHref(p.slug),
    }));

  const hasContactPage = activePageLinks.some((p) => p.href === ROUTES.PUBLIC.CONTACT_US);
  const siteLinks = hasContactPage
    ? activePageLinks
    : [...activePageLinks, { label: 'Contact Us', href: ROUTES.PUBLIC.CONTACT_US }];

  const tags =
    trendingTags.length > 0
      ? trendingTags.slice(0, 8)
      : Array.from(
          new Set(
            recentPosts
              .flatMap((p) => (Array.isArray(p.tags) ? p.tags : []))
              .map((t) => t.trim())
              .filter(Boolean)
          )
        ).slice(0, 8);

  const flashNews = recentPosts.slice(0, 6).map((p) => ({ title: p.title, slug: p.slug }));

  const brandName = settings.siteName || 'HeyGoodly';
  const brandTagline = settings.tagline || '';
  const sponsorDestinationUrl = settings.headerAdsBannerUrl || ROUTES.PUBLIC.STORES;

  return (
    <header className="w-full bg-white border-b border-[#E7E7E5]">
      {/* 1. TOP UTILITY BAR */}
      <div className="bg-[#F8F8F6] border-b border-[#E7E7E5] text-[11px] text-[#737373] py-1.5 px-4 sm:px-6">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#171717]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C62828]" />
              <span>{currentDate}</span>
            </span>

            {siteLinks.length > 0 && (
              <>
                <span className="text-[#E7E7E5] hidden md:inline">|</span>
                <nav className="hidden md:flex items-center gap-3 text-[11px] font-normal text-[#737373]">
                  {siteLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="hover:text-[#171717] transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </>
            )}
          </div>

          {/* Right: Configured Contact / Social Channels from System Settings */}
          <div className="flex items-center gap-3.5 text-[#737373]">
            {settings.contactEmail && (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="hidden sm:inline hover:text-[#171717] transition-colors text-[11px]"
              >
                {settings.contactEmail}
              </a>
            )}
            <div className="hidden sm:flex items-center gap-3">
              {settings.socialFacebook && (
                <a
                  href={settings.socialFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#171717] transition-colors text-[11px] font-semibold"
                  title="Facebook"
                >
                  FB
                </a>
              )}
              {settings.socialTwitter && (
                <a
                  href={settings.socialTwitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#171717] transition-colors text-[11px] font-semibold"
                  title="X / Twitter"
                >
                  X
                </a>
              )}
              {settings.socialYoutube && (
                <a
                  href={settings.socialYoutube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#171717] transition-colors text-[11px] font-semibold"
                  title="YouTube"
                >
                  YT
                </a>
              )}
              {settings.socialTiktok && (
                <a
                  href={settings.socialTiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#171717] transition-colors text-[11px] font-semibold"
                  title="TikTok"
                >
                  TT
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. BRANDING MASTHEAD */}
      <div className="bg-white py-6 px-4 sm:px-6 border-b border-[#E7E7E5]">
        <div className="max-w-[1240px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <Link href={ROUTES.PUBLIC.HOME} className="flex flex-col items-center lg:items-start text-center lg:text-left group shrink-0">
            <div className="flex items-center gap-3">
              {settings.logoUrl && settings.logoUrl !== '/logo.png' && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.logoUrl}
                  alt={brandName}
                  className="h-10 sm:h-12 w-auto max-w-[160px] rounded-lg object-contain shrink-0"
                />
              )}
              <span className="font-editorial text-4xl sm:text-5xl lg:text-[54px] font-bold text-[#171717] tracking-tight leading-none">
                {brandName}
                <span className="text-[#C62828]">.</span>
              </span>
            </div>
            {brandTagline && (
              <span className="text-[11px] tracking-widest uppercase font-semibold text-[#737373] mt-2">
                {brandTagline}
              </span>
            )}
          </Link>

          {/* 728x90 Advertisement Slot (Configured via Admin -> System Settings -> Monetization & Ads) */}
          {settings.loaded && settings.headerAdsActive && settings.headerAdsTitle && (
            <div className="w-full lg:max-w-[728px] min-h-[82px] sm:h-[90px] py-2.5 sm:py-0 rounded-lg bg-[#171717] text-white flex items-center justify-between px-4 sm:px-7 relative overflow-hidden border border-[#E7E7E5]/20">
              {settings.headerAdsBannerImg && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.headerAdsBannerImg}
                  alt={settings.headerAdsTitle}
                  className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
                />
              )}
              <div className="space-y-1 relative z-10 min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  {settings.headerAdsBadge && (
                    <span className="text-[9px] uppercase font-bold tracking-widest text-[#EAB308] bg-[#EAB308]/15 px-2 py-0.5 rounded">
                      {settings.headerAdsBadge}
                    </span>
                  )}
                  {settings.headerAdsSubtitle && (
                    <span className="text-[10px] text-[#737373] hidden sm:inline">
                      • {settings.headerAdsSubtitle}
                    </span>
                  )}
                </div>
                <h4 className="text-xs sm:text-base font-semibold text-white tracking-wide line-clamp-2 sm:truncate leading-snug">
                  {settings.headerAdsTitle}
                </h4>
                {settings.headerAdsDescription && (
                  <p className="text-[11px] text-[#A8A8A2] line-clamp-1 hidden sm:block">
                    {settings.headerAdsDescription}
                  </p>
                )}
              </div>

              <div className="shrink-0 relative z-10 ml-3 sm:ml-4">
                <a
                  href={sponsorDestinationUrl}
                  target={sponsorDestinationUrl.startsWith('http') ? '_blank' : undefined}
                  rel={sponsorDestinationUrl.startsWith('http') ? 'nofollow sponsored noopener noreferrer' : undefined}
                  className="bg-[#C62828] hover:bg-[#B71C1C] text-white font-semibold text-xs px-3.5 py-1.5 rounded transition inline-flex items-center gap-1.5"
                >
                  <span>{settings.headerAdsButtonText || 'Discover'}</span>
                  <ArrowRight size={12} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. PRIMARY EDITORIAL NAVIGATION */}
      <nav className="bg-white border-b border-[#E7E7E5] sticky top-0 z-40">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={`${link.label}-${link.href}`}
                  href={link.href}
                  className={`text-xs font-semibold tracking-wider uppercase px-3.5 py-3 transition-colors border-b-2 ${
                    isActive
                      ? 'border-[#C62828] text-[#C62828]'
                      : 'border-transparent text-[#171717] hover:text-[#C62828]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="lg:hidden py-2.5">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-[#171717] hover:text-[#C62828] rounded flex items-center gap-1.5 text-xs font-semibold"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
              <span>Menu</span>
            </button>
          </div>

          <div className="relative py-2 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-[#E7E7E5] text-[#737373] hover:text-[#171717] transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Toggle dark mode"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
            </button>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 text-[#737373] hover:text-[#171717] transition-colors flex items-center gap-2 text-xs cursor-pointer"
              aria-label="Search articles"
            >
              <Search size={16} />
              <span className="hidden sm:inline font-medium">Search</span>
            </button>
          </div>
        </div>

        {/* Search Dropdown */}
        {searchOpen && (
          <div className="border-t border-[#E7E7E5] p-4 bg-[#F8F8F6] animate-fadeIn">
            <div className="max-w-xl mx-auto space-y-3">
              <form noValidate onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search size={17} className="absolute left-3.5 text-[#737373] pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, lab reviews, buying guides, coupons..."
                  className="w-full pl-10 pr-24 py-2 bg-white border border-[#E7E7E5] rounded-md text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#171717]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-1.5 bg-[#171717] hover:bg-[#C62828] text-white text-xs font-medium px-3.5 py-1.5 rounded transition-colors"
                >
                  Search
                </button>
              </form>
              {tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="font-semibold text-[#737373] mr-1">Popular Topics:</span>
                  {tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`${ROUTES.PUBLIC.SEARCH}?q=${encodeURIComponent(tag)}`}
                      onClick={() => setSearchOpen(false)}
                      className="px-2.5 py-0.5 bg-white border border-[#E7E7E5] rounded-full text-[#171717] hover:border-[#C62828] hover:text-[#C62828] transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E7E7E5] p-4 sm:p-5 bg-white space-y-4 animate-fadeIn shadow-lg">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C62828] mb-2 block">
                Navigation
              </span>
              <div className="grid grid-cols-1 gap-1">
                {navLinks.map((link) => {
                  const isActive =
                    pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={`${link.label}-${link.href}`}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition ${
                        isActive
                          ? 'bg-[#C62828]/10 text-[#C62828] border-l-2 border-[#C62828]'
                          : 'text-[#171717] hover:bg-[#F8F8F6] hover:text-[#C62828]'
                      }`}
                    >
                      <span>{link.label}</span>
                      <ArrowRight size={13} className="opacity-50" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {siteLinks.length > 0 && (
              <div className="border-t border-[#E7E7E5] pt-3.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#737373] mb-2 block">
                  About {brandName}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {siteLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-2.5 py-1.5 text-xs text-[#737373] hover:text-[#171717] hover:bg-[#F8F8F6] rounded-md transition truncate"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* 4. DEDICATED FLASH NEWS TICKER (Rendered strictly when live database posts exist) */}
      {flashNews.length > 0 && (
        <div className="border-b border-[#E7E7E5] bg-[#F8F8F6] py-2 px-4 sm:px-6 overflow-hidden select-none">
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @keyframes flashNewsMarquee {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-50%, 0, 0); }
            }
            .flash-news-track {
              display: inline-flex;
              white-space: nowrap;
              will-change: transform;
              animation: flashNewsMarquee 35s linear infinite;
            }
            .flash-news-track:hover {
              animation-play-state: paused;
            }
            @keyframes redLivePulse {
              0%, 100% {
                opacity: 1;
                box-shadow: 0 0 0 0 rgba(198, 40, 40, 0.7);
              }
              50% {
                opacity: 0.35;
                box-shadow: 0 0 0 5px rgba(198, 40, 40, 0);
              }
            }
            .live-blink-dot {
              animation: redLivePulse 1.4s infinite cubic-bezier(0.4, 0, 0.6, 1);
            }
          `,
            }}
          />

          <div className="max-w-[1240px] mx-auto flex items-center h-6 relative">
            <div className="z-10 bg-[#F8F8F6] pr-3 shrink-0 flex items-center border-r border-[#E7E7E5] mr-3">
              <span className="bg-[#C62828] text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shrink-0 flex items-center gap-1 shadow-2xs whitespace-nowrap">
                <Zap size={11} className="fill-white" />
                <span>Flash News</span>
              </span>
            </div>

            <div className="overflow-hidden flex-1 relative h-full flex items-center">
              <div className="flash-news-track items-center text-xs">
                {[...flashNews, ...flashNews].map((news, idx) => (
                  <Link
                    key={`${news.slug}-${idx}`}
                    href={ROUTES.PUBLIC.POST_DETAIL(news.slug)}
                    className="inline-flex items-center text-xs sm:text-sm text-[#171717] hover:text-[#C62828] font-medium whitespace-nowrap transition-colors px-6 group shrink-0"
                  >
                    <span className="relative flex h-2 w-2 mr-2.5 shrink-0 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C62828] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C62828] live-blink-dot" />
                    </span>
                    <span className="group-hover:underline">{news.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
