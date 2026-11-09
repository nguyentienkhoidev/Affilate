'use client';

import Link from 'next/link';
import { ShieldCheck, User, Command, ExternalLink, Sun, Moon, Globe } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import type { RoleType } from '@/lib/admin/usePermission';
import { useTheme } from '@/context/ThemeContext';
import { useAdminI18n } from '@/context/AdminI18nContext';

interface AdminHeaderBarProps {
  /** Page title derived from the current pathname */
  pageTitle: string;
  /** Currently active role slug */
  currentRoleSlug: string;
  /** List of roles available in the system */
  availableRoles?: { roleSlug: string; roleName: string }[];
  /** Optional role switch callback */
  onRoleSwitch?: (role: RoleType) => void;
  /** Opens the command palette search modal */
  onOpenCommandPalette?: () => void;
}

/** Top sticky header bar — breadcrumb, language switcher (EN/VI), dark mode toggle, role switcher, profile link, live site link. */
export default function AdminHeaderBar({
  pageTitle,
  currentRoleSlug,
  availableRoles,
  onRoleSwitch,
  onOpenCommandPalette,
}: AdminHeaderBarProps) {
  const { isDark, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useAdminI18n();

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs z-20 sticky top-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs min-w-0">
        <span className="text-[#C62828] font-bold shrink-0">HeyGoodly CMS</span>
        <span className="text-zinc-300">/</span>
        <span className="font-semibold text-zinc-900 truncate">{pageTitle}</span>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-2">
        {/* Language Switcher (EN / VI) */}
        <div
          data-no-i18n="true"
          className="h-8 inline-flex items-center bg-zinc-100 border border-zinc-200/80 p-0.5 rounded-xl text-[11px] font-bold"
          title={locale === 'vi' ? 'Chuyển đổi ngôn ngữ Admin (EN / VI)' : 'Switch Admin Language (EN / VI)'}
        >
          <Globe size={13} className="text-zinc-500 ml-1.5 mr-1 shrink-0 hidden sm:inline" />
          <button
            type="button"
            onClick={() => setLocale('en')}
            className={`px-2 py-1 rounded-lg transition cursor-pointer ${
              locale === 'en'
                ? 'bg-[#C62828] text-white shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLocale('vi')}
            className={`px-2 py-1 rounded-lg transition cursor-pointer ${
              locale === 'vi'
                ? 'bg-[#C62828] text-white shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            VI
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="h-8 px-2.5 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-zinc-700 bg-white hover:bg-slate-50 border border-zinc-200/80 rounded-xl transition cursor-pointer shadow-2xs"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <>
              <Sun size={14} className="text-amber-400 shrink-0" />
              <span className="hidden lg:inline">{locale === 'vi' ? 'Sáng' : 'Light'}</span>
            </>
          ) : (
            <>
              <Moon size={14} className="text-indigo-600 shrink-0" />
              <span className="hidden lg:inline">{locale === 'vi' ? 'Tối' : 'Dark'}</span>
            </>
          )}
        </button>

        {/* User Role Badge */}
        <div
          className="h-8 inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 px-2.5 rounded-xl whitespace-nowrap shadow-2xs"
          title={`${t('Role:')} ${currentRoleSlug === 'admin' ? t('Super Administrator') : t('Staff')}`}
        >
          <ShieldCheck size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden xl:inline">
            {t('Role:')}
          </span>
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
            {currentRoleSlug === 'admin' ? t('Super Administrator') : t('Staff')}
          </span>
        </div>

        {/* Profile link */}
        <Link
          href={ROUTES.ADMIN.PROFILE}
          className="h-8 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-zinc-200/80 px-3 rounded-xl transition whitespace-nowrap shadow-2xs"
        >
          <User size={13} className="text-indigo-600 shrink-0" />
          <span className="hidden sm:inline">{t('2FA & Profile')}</span>
        </Link>

        {/* Cmd+K Quick Search Button */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="h-8 hidden md:inline-flex items-center gap-1.5 text-[11px] font-mono bg-zinc-100 hover:bg-zinc-200/90 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 px-2.5 rounded-xl whitespace-nowrap transition cursor-pointer shadow-2xs group"
          title={locale === 'vi' ? 'Tìm kiếm nhanh & Điều hướng (⌘K)' : 'Quick Search & Command Palette (⌘K)'}
        >
          <Command size={11} className="group-hover:text-[#C62828] transition-colors" />
          <span className="font-bold">K</span>
        </button>

        {/* Live site */}
        <Link
          href="/"
          target="_blank"
          className="h-8 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-[#C62828] bg-white hover:bg-rose-50/50 border border-zinc-200/80 px-3 rounded-xl transition whitespace-nowrap shadow-2xs"
        >
          <span>{t('Live Site')}</span>
          <ExternalLink size={13} className="shrink-0" />
        </Link>
      </div>
    </header>
  );
}
