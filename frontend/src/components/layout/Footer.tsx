'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useSiteSettings } from '@/lib/admin/useSiteSettings';
import { type MenuItem } from '@/app/admin/menus/_lib/data';
import { menuService, resolveMenuHref } from '@/services/menuService';
import { categoryService, type CategoryItem } from '@/services/categoryService';
import { pageService, resolvePublicPageHref, type PublicPageSummary } from '@/services/pageService';

export default function Footer() {
  const { settings } = useSiteSettings();
  const brandName = settings.siteName || 'HeyGoodly';
  const brandTagline = settings.tagline || '';
  const [footerMenus, setFooterMenus] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [pages, setPages] = useState<PublicPageSummary[]>([]);

  useEffect(() => {
    let active = true;

    menuService.getPublicMenus('footer').then((items) => {
      if (!active) return;
      if (items.length > 0) {
        setFooterMenus(items);
      } else {
        pageService.getPublicPages().then((publicPages) => {
          if (active) setPages(publicPages);
        });
      }
    });

    categoryService.getCategories('post').then((cats) => {
      if (active) setCategories(cats);
    });

    return () => {
      active = false;
    };
  }, []);

  const footerLinks = footerMenus
    .filter((m) => m.position === 'footer' && m.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const effectiveFooterLinks =
    footerLinks.length > 0
      ? footerLinks.map((m) => ({ label: m.title, href: resolveMenuHref(m) }))
      : pages
          .filter((p) => p.isActive)
          .map((p) => ({ label: p.title, href: resolvePublicPageHref(p.slug) }));

  const disclosureText =
    settings.affiliateDisclosure ||
    `${brandName} is reader-supported. When you click partner links or activate coupon vouchers on our site, we may earn an affiliate commission at zero extra cost to you.`;

  const copyrightText =
    settings.footerCopyright ||
    `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`;

  return (
    <footer className="bg-[#171717] text-[#D4D4D0] pt-10 sm:pt-14 pb-8 sm:pb-10 border-t border-[#262626]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
        {/* Column 1: Brand & Editorial Mission */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            {settings.logoUrl && settings.logoUrl !== '/logo.png' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logoUrl}
                alt={brandName}
                className="h-8 w-auto max-w-[120px] rounded object-contain shrink-0"
              />
            )}
            <span className="font-editorial text-2xl font-bold tracking-tight text-white">
              {brandName}
              <span className="text-[#C62828]">.</span>
            </span>
          </div>
          <p className="text-xs text-[#A8A8A2] leading-relaxed">
            {settings.metaDescription ||
              `${brandName} is an independent product review journal and curated deal discovery platform. Our editors test consumer electronics, gear, and promo codes daily to eliminate expired vouchers.`}
          </p>
          <div className="space-y-2 text-xs text-[#A8A8A2] pt-1">
            <div className="flex items-center gap-2 text-white font-medium">
              <CheckCircle2 size={14} className="text-[#C62828]" /> 100% Hand-Tested Promo Codes
            </div>
            <div className="flex items-center gap-2 text-[#A8A8A2]">
              <ShieldCheck size={14} className="text-[#A8A8A2]" /> Zero Sponsored Ranking Manipulation
            </div>
          </div>
        </div>

        {/* Column 2: Editorial Sections (Dynamic from PostgreSQL Categories) */}
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-b border-[#262626] pb-2">
            Editorial Sections
          </h4>
          <ul className="space-y-2.5 text-xs text-[#A8A8A2]">
            {categories.slice(0, 6).map((cat) => (
              <li key={cat.id}>
                <Link
                  href={ROUTES.PUBLIC.CATEGORY_DETAIL(cat.slug)}
                  className="hover:text-white transition-colors"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={ROUTES.PUBLIC.POSTS}
                className="hover:text-[#C62828] transition-colors font-semibold"
              >
                All Feature Articles →
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Trust & Governance (Dynamic from PostgreSQL Footer Menus / Pages) */}
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-b border-[#262626] pb-2">
            Editorial & Trust
          </h4>
          {effectiveFooterLinks.length > 0 ? (
            <ul className="space-y-2.5 text-xs text-[#A8A8A2]">
              {effectiveFooterLinks.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#737373]">No navigation links configured.</p>
          )}
        </div>

        {/* Column 4: Affiliate Transparency Notice */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-b border-[#262626] pb-2">
            Affiliate Transparency
          </h4>
          <p className="text-[11px] text-[#A8A8A2] leading-relaxed">{disclosureText}</p>
          <div className="pt-1">
            <Link
              href={ROUTES.PUBLIC.AFFILIATE_DISCLOSURE}
              className="text-xs font-semibold text-[#C62828] hover:underline inline-flex items-center gap-1"
            >
              Learn about our commission ethics →
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Legal Copyright */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-12 pt-6 border-t border-[#262626] text-xs text-[#737373] flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 text-center sm:text-left">
        <div>{copyrightText}</div>
        {brandTagline && <div className="text-[11px] text-[#737373]">{brandTagline}</div>}
      </div>
    </footer>
  );
}
