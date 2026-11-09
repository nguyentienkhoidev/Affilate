'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useSiteSettings } from '@/lib/admin/useSiteSettings';
import { useAdminI18n } from '@/context/AdminI18nContext';

interface SidebarBrandProps {
  collapsed: boolean;
  onCollapse: () => void;
  onExpand: () => void;
}

/** Logo block and collapse/expand toggle at the top of the sidebar. */
export default function SidebarBrand({ collapsed, onCollapse, onExpand }: SidebarBrandProps) {
  const { settings } = useSiteSettings();
  const { t } = useAdminI18n();
  const brandName = settings.siteName || 'HeyGoodly';
  const brandInitial = brandName.charAt(0).toUpperCase();

  return (
    <div
      className={`h-16 flex items-center border-b border-zinc-800/80 bg-zinc-950 shrink-0 ${
        collapsed ? 'px-2 justify-between' : 'px-4 justify-between'
      }`}
    >
      {collapsed ? (
        <div className="w-full flex items-center justify-between gap-1">
          <Link
            href={ROUTES.ADMIN.DASHBOARD}
            className="w-8 h-8 rounded-lg bg-[#C62828] hover:bg-[#B71C1C] text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0 transition overflow-hidden"
            title={`${brandName} CMS Dashboard`}
          >
            {settings.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logoUrl} alt={brandName} className="w-full h-full object-cover" />
            ) : (
              brandInitial
            )}
          </Link>
          <button
            onClick={onExpand}
            className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer shrink-0"
            title={t('Expand Sidebar')}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        <>
          <Link href={ROUTES.ADMIN.DASHBOARD} className="flex items-center gap-2.5 overflow-hidden group">
            <div className="w-8 h-8 rounded-lg bg-[#C62828] text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0 overflow-hidden">
              {settings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.logoUrl} alt={brandName} className="w-full h-full object-cover" />
              ) : (
                brandInitial
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-editorial font-bold text-white text-base tracking-tight leading-none">
                {brandName}<span className="text-[#C62828]">.</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                {t('Editorial CMS & Ops')}
              </span>
            </div>
          </Link>

          <button
            onClick={onCollapse}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer shrink-0"
            title={t('Collapse Sidebar')}
          >
            <ChevronLeft size={16} />
          </button>
        </>
      )}
    </div>
  );
}
