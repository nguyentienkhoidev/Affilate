'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  Tag,
  FileText,
  FolderTree,
  Hash,
  Menu as MenuIcon,
  Layers,
  MessageSquare,
  Image as ImageIcon,
  ShieldCheck,
  Users,
  Settings,
  History,
  Mail,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { STORAGE_KEYS } from '@/constants/ui-constants';
import { authService, isValidJwtFormat, isTokenExpired } from '@/services/authService';
import { useAdminCounts } from '@/lib/admin/useAdminCounts';
import { usePermission, type RoleType } from '@/lib/admin/usePermission';
import { ToastProvider } from '@/context/ToastContext';
import { AdminI18nProvider, useAdminI18n } from '@/context/AdminI18nContext';
import SidebarBrand from './_components/SidebarBrand';
import SidebarNav, { type NavGroup } from './_components/SidebarNav';
import SidebarUserCard from './_components/SidebarUserCard';
import AdminHeaderBar from './_components/AdminHeaderBar';
import AdminCommandPalette from './_components/AdminCommandPalette';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminI18nProvider>
      <ToastProvider>
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </ToastProvider>
    </AdminI18nProvider>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [, setMounted] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const counts = useAdminCounts();
  const { currentRole, switchRole, hasPermission, availableRoles } = usePermission();
  const { t } = useAdminI18n();

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      // Case 1: Missing token
      if (!token) {
        authService.logout();
        router.replace(`${ROUTES.AUTH.LOGIN}?reason=missing_token&redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // Case 2: Malformed or invalid token format
      if (!isValidJwtFormat(token)) {
        authService.logout();
        router.replace(`${ROUTES.AUTH.LOGIN}?reason=invalid_token`);
        return;
      }

      // Case 3: Expired access token with no refresh token
      if (isTokenExpired(token) && !refreshToken) {
        authService.logout();
        router.replace(`${ROUTES.AUTH.LOGIN}?reason=session_expired`);
        return;
      }
    }
  }, [pathname, router]);

  const handleLogout = async () => {
    await authService.logout();
    router.push(ROUTES.AUTH.LOGIN);
  };

  const navGroups: NavGroup[] = [
    {
      group: t('OPERATIONS'),
      items: [
        { label: t('Dashboard'), icon: LayoutDashboard, href: ROUTES.ADMIN.DASHBOARD },
        { label: t('Stores Directory'), icon: Store, href: ROUTES.ADMIN.STORES, count: String(counts.storesCount), permission: 'store.view' },
        { label: t('Offers & Coupons'), icon: Tag, href: ROUTES.ADMIN.OFFERS, count: String(counts.offersCount), permission: 'offer.view' },
        { label: t('Articles & Reviews'), icon: FileText, href: ROUTES.ADMIN.POSTS, count: String(counts.postsCount), permission: 'post.view' },
        { label: t('Categories'), icon: FolderTree, href: ROUTES.ADMIN.CATEGORIES, count: String(counts.categoriesCount), permission: 'category.view' },
        { label: t('Tags'), icon: Hash, href: ROUTES.ADMIN.TAGS, permission: 'tag.view' },
      ],
    },
    {
      group: t('CMS & CHANNELS'),
      items: [
        { label: t('Media Library'), icon: ImageIcon, href: ROUTES.ADMIN.MEDIA, count: String(counts.mediaCount), permission: 'file.upload' },
        { label: t('Navigation Menus'), icon: MenuIcon, href: ROUTES.ADMIN.MENUS, count: String(counts.menusCount), permission: 'menu.manage' },
        { label: t('Static & Policy Pages'), icon: Layers, href: ROUTES.ADMIN.PAGES, count: String(counts.pagesCount), permission: 'page.view' },
        {
          label: t('Customer Inquiries'),
          icon: MessageSquare,
          href: ROUTES.ADMIN.FEEDBACK,
          count: String(counts.feedbackCount),
          badge: counts.unreadFeedbackCount > 0 ? t(`${counts.unreadFeedbackCount} New`) : undefined,
          permission: 'feedback.view',
        },
        {
          label: t('Newsletter Subscribers'),
          icon: Mail,
          href: ROUTES.ADMIN.SUBSCRIBERS,
          count: String(counts.subscribersCount),
          permission: 'feedback.view',
        },
      ],
    },
    {
      group: t('SECURITY & SYSTEM'),
      items: [
        { label: t('Staff Accounts'), icon: Users, href: ROUTES.ADMIN.USERS, count: String(counts.usersCount), permission: 'user.view' },
        { label: t('Roles & RBAC Matrix'), icon: ShieldCheck, href: ROUTES.ADMIN.ROLES, count: String(counts.rolesCount), permission: 'role.view' },
        { label: t('Action Tracing & Audit'), icon: History, href: ROUTES.ADMIN.TRACING, count: String(counts.tracingCount), permission: 'audit.view' },
        { label: t('System Settings'), icon: Settings, href: ROUTES.ADMIN.SETTINGS, permission: 'setting.general' },
      ],
    },
  ];

  /** Resolve current page title from pathname for the breadcrumb */
  const getCurrentPageTitle = (): string => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (pathname === item.href) return item.label;
      }
    }
    if (pathname.includes('/tracing')) return t('Action Tracing & Audit Logs');
    if (pathname.endsWith('/create')) return t('Create New');
    if (pathname.endsWith('/edit')) return t('Edit Record');
    if (pathname.includes('/stores/')) return t('Store Details');
    if (pathname.includes('/posts/')) return t('Article Editor');
    return t('Control Panel');
  };

  return (
      <div className="h-screen w-full bg-zinc-50 flex flex-col md:flex-row antialiased text-zinc-900 font-sans overflow-hidden">

        {/* Sidebar */}
        <aside
          className={`bg-zinc-950 text-zinc-300 flex flex-col transition-all duration-300 shrink-0 border-r border-zinc-800/80 z-30 select-none h-full md:h-screen sticky top-0 ${
            collapsed ? 'w-20' : 'w-64'
          }`}
        >
          <SidebarBrand
            collapsed={collapsed}
            onCollapse={() => setCollapsed(true)}
            onExpand={() => setCollapsed(false)}
          />
          <SidebarNav
            navGroups={navGroups}
            collapsed={collapsed}
            hasPermission={hasPermission}
          />
          <SidebarUserCard
            collapsed={collapsed}
            roleSlug={currentRole.roleSlug}
            roleName={currentRole.roleName}
            onLogout={handleLogout}
          />
        </aside>

        {/* Main app shell */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          <AdminHeaderBar
            pageTitle={getCurrentPageTitle()}
            currentRoleSlug={currentRole.roleSlug}
            availableRoles={availableRoles}
            onRoleSwitch={(role) => switchRole(role as RoleType)}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full">
            {children}
          </main>
        </div>

        {/* Command Palette Modal */}
        <AdminCommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />
      </div>
  );
}
