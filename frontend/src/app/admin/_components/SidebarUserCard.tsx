import Link from 'next/link';
import { KeyRound, LogOut } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useAdminI18n } from '@/context/AdminI18nContext';

interface SidebarUserCardProps {
  collapsed: boolean;
  roleSlug: string;
  roleName: string;
  onLogout: () => void;
}

/** User profile card and logout button at the bottom of the sidebar. */
export default function SidebarUserCard({
  collapsed,
  roleSlug,
  roleName,
  onLogout,
}: SidebarUserCardProps) {
  const { t } = useAdminI18n();
  const initials = roleSlug === 'admin' ? 'AD' : 'ST';

  return (
    <div className={`border-t border-zinc-800/80 bg-zinc-950/70 shrink-0 ${collapsed ? 'p-2' : 'p-3'}`}>
      {!collapsed ? (
        <div className="flex items-center justify-between gap-2">
          <Link
            href={ROUTES.ADMIN.PROFILE}
            className="flex items-center gap-2.5 overflow-hidden hover:opacity-90 transition group cursor-pointer"
            title={t('View My Profile & 2FA')}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {initials}
            </div>
            <div className="truncate text-xs">
              <div className="font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                {roleName}
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                <KeyRound size={10} /> {t('2FA Active')}
              </div>
            </div>
          </Link>
          <button
            onClick={onLogout}
            className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
            title={t('Sign Out')}
          >
            <LogOut size={16} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Link
            href={ROUTES.ADMIN.PROFILE}
            className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs hover:ring-2 hover:ring-indigo-400 transition"
            title={`${roleName} - ${t('2FA & Profile')}`}
          >
            {initials}
          </Link>
          <button
            onClick={onLogout}
            className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition cursor-pointer shrink-0"
            title={t('Sign Out')}
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
