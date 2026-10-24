'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { STORAGE_KEYS } from '@/constants/ui-constants';
import { 
  LayoutDashboard, 
  Store, 
  Tag, 
  FileText, 
  FolderTree, 
  Menu as MenuIcon, 
  Layers, 
  MessageSquare, 
  Image as ImageIcon,
  ShieldCheck, 
  Users, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  KeyRound,
  ExternalLink,
  Search,
  Bell,
  Command,
  ChevronDown,
  User,
  History,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useAdminCounts } from '@/lib/admin/useAdminCounts';
import { usePermission, type RoleType } from '@/lib/admin/usePermission';

interface NavItem {
  label: string;
  icon: any;
  href: string;
  count?: string;
  badge?: string;
  permission?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const counts = useAdminCounts();
  const { currentRole, switchRole, hasPermission, availableRoles } = usePermission();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
    router.push(ROUTES.AUTH.LOGIN);
  };

  const navGroups: NavGroup[] = [
    {
      group: 'OPERATIONS',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, href: ROUTES.ADMIN.DASHBOARD },
        { label: 'Stores Directory', icon: Store, href: ROUTES.ADMIN.STORES, count: String(counts.storesCount), permission: 'store.view' },
        { label: 'Offers & Coupons', icon: Tag, href: ROUTES.ADMIN.OFFERS, count: String(counts.offersCount), permission: 'offer.view' },
        { label: 'Articles & Reviews', icon: FileText, href: ROUTES.ADMIN.POSTS, count: String(counts.postsCount), permission: 'post.view' },
        { label: 'Categories', icon: FolderTree, href: ROUTES.ADMIN.CATEGORIES, count: String(counts.categoriesCount), permission: 'category.view' },
      ],
    },
    {
      group: 'CMS & CHANNELS',
      items: [
        { label: 'Media Library', icon: ImageIcon, href: ROUTES.ADMIN.MEDIA, count: String(counts.mediaCount), permission: 'file.upload' },
        { label: 'Navigation Menus', icon: MenuIcon, href: ROUTES.ADMIN.MENUS, count: String(counts.menusCount), permission: 'menu.manage' },
        { label: 'Static & Policy Pages', icon: Layers, href: ROUTES.ADMIN.PAGES, count: String(counts.pagesCount), permission: 'page.view' },
        {
          label: 'Customer Inquiries',
          icon: MessageSquare,
          href: ROUTES.ADMIN.FEEDBACK,
          count: String(counts.feedbackCount),
          badge: counts.unreadFeedbackCount > 0 ? `${counts.unreadFeedbackCount} New` : undefined,
          permission: 'feedback.view',
        },
      ],
    },
    {
      group: 'SECURITY & SYSTEM',
      items: [
        { label: 'Staff Accounts', icon: Users, href: ROUTES.ADMIN.USERS, count: String(counts.usersCount), permission: 'user.view' },
        { label: 'Roles & RBAC Matrix', icon: ShieldCheck, href: ROUTES.ADMIN.ROLES, count: String(counts.rolesCount), permission: 'role.view' },
        { label: 'Action Tracing & Audit', icon: History, href: ROUTES.ADMIN.TRACING, count: String(counts.tracingCount), permission: 'audit.view' },
        { label: 'System Settings', icon: Settings, href: ROUTES.ADMIN.SETTINGS, permission: 'setting.general' },
      ],
    },
  ];

  // Derive breadcrumb label from pathname
  const getCurrentPageTitle = () => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (pathname === item.href) return item.label;
      }
    }
    if (pathname.includes('/tracing')) return 'Action Tracing & Audit Logs';
    if (pathname.endsWith('/create')) return 'Create New';
    if (pathname.endsWith('/edit')) return 'Edit Record';
    if (pathname.includes('/stores/')) return 'Store Details';
    if (pathname.includes('/posts/')) return 'Article Editor';
    return 'Control Panel';
  };

  return (
    <div className="h-screen w-full bg-zinc-50 flex flex-col md:flex-row antialiased text-zinc-900 font-sans overflow-hidden">
      
      {/* Enterprise ProCMS Sidebar */}
      <aside
        className={`bg-zinc-950 text-zinc-300 flex flex-col transition-all duration-300 shrink-0 border-r border-zinc-800/80 z-30 select-none h-full md:h-screen sticky top-0 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div
          className={`h-16 flex items-center border-b border-zinc-800/80 bg-zinc-950 shrink-0 ${
            collapsed ? 'px-2 justify-between' : 'px-4 justify-between'
          }`}
        >
          {collapsed ? (
            <div className="w-full flex items-center justify-between gap-1">
              <Link
                href={ROUTES.ADMIN.DASHBOARD}
                className="w-8 h-8 rounded-lg bg-[#C62828] hover:bg-[#B71C1C] text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0 transition"
                title="Bargorya CMS Dashboard"
              >
                B
              </Link>
              <button
                onClick={() => setCollapsed(false)}
                className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer shrink-0"
                title="Expand Sidebar"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <>
              <Link href={ROUTES.ADMIN.DASHBOARD} className="flex items-center gap-2.5 overflow-hidden group">
                <div className="w-8 h-8 rounded-lg bg-[#C62828] text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0">
                  B
                </div>
                <div className="flex flex-col">
                  <span className="font-editorial font-bold text-white text-base tracking-tight leading-none">
                    Bargorya<span className="text-[#C62828]">.</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    Editorial CMS &amp; Ops
                  </span>
                </div>
              </Link>

              <button
                onClick={() => setCollapsed(true)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer shrink-0"
                title="Collapse Sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            </>
          )}
        </div>

        {/* Navigation Group Sections */}
        <nav className={`flex-1 py-4 space-y-6 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'}`}>
          {navGroups.map((group, gIdx) => {
            const visibleItems = group.items.filter((item) => hasPermission(item.permission));
            if (visibleItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
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

        {/* User Card & Logout */}
        <div className={`border-t border-zinc-800/80 bg-zinc-950/70 shrink-0 ${collapsed ? 'p-2' : 'p-3'}`}>
          {!collapsed ? (
            <div className="flex items-center justify-between gap-2">
              <Link
                href={ROUTES.ADMIN.PROFILE}
                className="flex items-center gap-2.5 overflow-hidden hover:opacity-90 transition group cursor-pointer"
                title="View My Profile & 2FA"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {currentRole.roleSlug === 'admin' ? 'AD' : 'ST'}
                </div>
                <div className="truncate text-xs">
                  <div className="font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                    {currentRole.roleName}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <KeyRound size={10} /> 2FA Active
                  </div>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Link
                href={ROUTES.ADMIN.PROFILE}
                className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs hover:ring-2 hover:ring-indigo-400 transition"
                title={`${currentRole.roleName} - 2FA & Profile`}
              >
                {currentRole.roleSlug === 'admin' ? 'AD' : 'ST'}
              </Link>
              <button
                onClick={handleLogout}
                className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition cursor-pointer shrink-0"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Enterprise App Shell */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-6 flex items-center justify-between shrink-0 shadow-2xs z-20 sticky top-0">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#C62828] font-bold">Bargorya CMS</span>
            <span className="text-zinc-300">/</span>
            <span className="font-semibold text-zinc-900">
              {getCurrentPageTitle()}
            </span>
          </div>

          {/* Quick Actions, Role Simulator & Profile Link */}
          <div className="flex items-center gap-2.5">
            {/* Interactive RBAC Role Simulator */}
            <div className="h-8 inline-flex items-center gap-1.5 bg-zinc-100 border border-zinc-200/80 px-2.5 rounded-xl whitespace-nowrap">
              <ShieldCheck size={14} className="text-indigo-600 shrink-0" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider hidden md:inline">Role:</span>
              <select
                value={currentRole.roleSlug}
                onChange={(e) => switchRole(e.target.value as RoleType)}
                className="text-xs font-bold text-zinc-800 bg-transparent focus:outline-none cursor-pointer"
                title="Switch Active RBAC Role"
              >
                {availableRoles.map((r) => (
                  <option key={r.roleSlug} value={r.roleSlug}>
                    {r.roleName}
                  </option>
                ))}
              </select>
            </div>

            <Link
              href={ROUTES.ADMIN.PROFILE}
              className="h-8 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-zinc-200/80 px-3 rounded-xl transition whitespace-nowrap shadow-2xs"
            >
              <User size={13} className="text-indigo-600 shrink-0" />
              <span className="hidden sm:inline">2FA &amp; Profile</span>
            </Link>

            <div className="h-8 hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono bg-zinc-100 text-zinc-500 border border-zinc-200/80 px-2.5 rounded-xl whitespace-nowrap">
              <Command size={11} /> K
            </div>

            <Link
              href="/"
              target="_blank"
              className="h-8 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-[#C62828] bg-white hover:bg-rose-50/50 border border-zinc-200/80 px-3 rounded-xl transition whitespace-nowrap shadow-2xs"
            >
              <span>Live Site</span>
              <ExternalLink size={13} className="shrink-0" />
            </Link>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full">
          {children}
        </main>

      </div>
    </div>
  );
}
