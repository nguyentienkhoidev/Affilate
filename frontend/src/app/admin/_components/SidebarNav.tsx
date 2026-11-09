import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  count?: string;
  badge?: string;
  permission?: string;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

interface SidebarNavProps {
  navGroups: NavGroup[];
  collapsed: boolean;
  /** Filter items based on RBAC permission key */
  hasPermission: (permission?: string) => boolean;
}

/** Renders all navigation groups and items in the sidebar. */
export default function SidebarNav({ navGroups, collapsed, hasPermission }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className={`flex-1 py-4 space-y-6 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'}`}>
      {navGroups.map((group, gIdx) => {
        const visibleItems = group.items.filter((item) => hasPermission(item.permission));
        if (visibleItems.length === 0) return null;

        return (
          <div key={gIdx} className="space-y-1">
            {/* Group label or divider */}
            {!collapsed ? (
              <div className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                {group.group}
              </div>
            ) : gIdx > 0 ? (
              <div className="w-6 mx-auto border-t border-zinc-800/80 my-2" />
            ) : null}

            {visibleItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center rounded-lg text-xs font-medium transition-colors ${
                    collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'
                  } ${
                    isActive
                      ? 'bg-[#C62828] text-white font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={16} className="shrink-0" />
                  {!collapsed && (
                    <div className="flex-1 flex items-center justify-between gap-1.5">
                      <span className="truncate">{item.label}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span className="bg-[#C62828]/20 text-[#EF4444] border border-[#C62828]/40 text-[9px] px-1.5 py-0.5 rounded font-bold">
                            {item.badge}
                          </span>
                        )}
                        {item.count && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                              isActive
                                ? 'bg-[#991B1B] text-white'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {item.count}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
