'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useAdminI18n } from '@/context/AdminI18nContext';

interface AdminPageHeaderProps {
  /** Lucide icon component */
  icon: LucideIcon;
  /** Page title */
  title: string;
  /** Short description shown below the title */
  description?: string;
  /** Total count badge next to title (e.g. "42 Stores Total") */
  badge?: string;
  /** Action buttons / links rendered on the right (CTA slot) */
  children?: ReactNode;
  /** Extra CSS class for the wrapper div */
  className?: string;
}

/**
 * Standard page header used across all admin list pages.
 * Renders icon + title + optional badge + description + right-side CTA slot.
 */
export default function AdminPageHeader({
  icon: Icon,
  title,
  description,
  badge,
  children,
  className = '',
}: AdminPageHeaderProps) {
  const { t } = useAdminI18n();

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Icon className="text-[#C62828]" size={26} />
            {t(title)}
          </h1>
          {badge && (
            <span className="bg-[#C62828]/10 text-[#C62828] text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
              {t(badge)}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-slate-500 mt-1">{t(description)}</p>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-2.5 shrink-0">{children}</div>
      )}
    </div>
  );
}
