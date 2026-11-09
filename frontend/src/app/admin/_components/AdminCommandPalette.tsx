'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Store,
  Tag,
  FileText,
  FolderTree,
  Hash,
  PlusCircle,
  Image as ImageIcon,
  Menu as MenuIcon,
  Layers,
  MessageSquare,
  Mail,
  Users,
  ShieldCheck,
  History,
  Settings,
  User,
  Sun,
  Moon,
  Globe,
  ExternalLink,
  X,
  Command,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useAdminI18n } from '@/context/AdminI18nContext';
import { useTheme } from '@/context/ThemeContext';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  keywords?: string;
  category: 'Operations' | 'CMS & Channels' | 'Security & Settings' | 'Quick Actions';
  icon: React.ElementType;
  iconColor: string;
  badge?: string;
  action: () => void;
}

interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminCommandPalette({ isOpen, onClose }: AdminCommandPaletteProps) {
  const router = useRouter();
  const { locale, setLocale, t } = useAdminI18n();
  const { isDark, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  const commandItems: CommandItem[] = useMemo(() => {
    return [
      // Quick Actions
      {
        id: 'toggle-theme',
        title: isDark ? t('Switch to Light Mode') : t('Switch to Dark Mode'),
        subtitle: isDark ? 'Giao diện sáng' : 'Giao diện tối',
        keywords: 'theme dark light mode giao dien sang toi mau',
        category: 'Quick Actions',
        icon: isDark ? Sun : Moon,
        iconColor: isDark ? 'text-amber-500' : 'text-indigo-400',
        action: () => {
          toggleTheme();
          onClose();
        },
      },
      {
        id: 'toggle-language',
        title: locale === 'en' ? 'Chuyển sang Tiếng Việt (VI)' : 'Switch to English (EN)',
        subtitle: locale === 'en' ? 'Bilingual interface' : 'Giao diện tiếng Anh',
        keywords: 'language ngon ngu tieng viet english translate vi en',
        category: 'Quick Actions',
        icon: Globe,
        iconColor: 'text-emerald-500',
        action: () => {
          setLocale(locale === 'en' ? 'vi' : 'en');
          onClose();
        },
      },
      {
        id: 'open-live-site',
        title: t('Live Site'),
        subtitle: 'Mở trang chủ',
        keywords: 'live site trang chu public homepage store post',
        category: 'Quick Actions',
        icon: ExternalLink,
        iconColor: 'text-rose-500',
        action: () => {
          window.open('/', '_blank');
          onClose();
        },
      },

      // Operations
      {
        id: 'nav-dashboard',
        title: t('Dashboard'),
        subtitle: '/admin/dashboard',
        keywords: 'dashboard tong quan thong ke clicks bieu do doanh thu',
        category: 'Operations',
        icon: LayoutDashboard,
        iconColor: 'text-blue-500',
        action: () => navigateTo(ROUTES.ADMIN.DASHBOARD),
      },
      {
        id: 'nav-stores',
        title: t('Stores Directory'),
        subtitle: '/admin/stores',
        keywords: 'stores danh ba thuong hieu merchant merchants cua hang',
        category: 'Operations',
        icon: Store,
        iconColor: 'text-amber-500',
        action: () => navigateTo(ROUTES.ADMIN.STORES),
      },
      {
        id: 'nav-store-create',
        title: t('Add New Store'),
        subtitle: '/admin/stores/create',
        keywords: 'create store them thuong hieu moi merchant add',
        category: 'Operations',
        icon: PlusCircle,
        iconColor: 'text-amber-500',
        badge: 'New',
        action: () => navigateTo(ROUTES.ADMIN.STORE_CREATE),
      },
      {
        id: 'nav-offers',
        title: t('Offers & Coupons'),
        subtitle: '/admin/offers',
        keywords: 'offers coupons ma giam gia uu dai deal deals khuyen mai',
        category: 'Operations',
        icon: Tag,
        iconColor: 'text-emerald-500',
        action: () => navigateTo(ROUTES.ADMIN.OFFERS),
      },
      {
        id: 'nav-offer-create',
        title: t('Add New Offer / Coupon'),
        subtitle: '/admin/offers/create',
        keywords: 'create offer coupon them ma giam gia khuyen mai deal voucher',
        category: 'Operations',
        icon: PlusCircle,
        iconColor: 'text-emerald-500',
        badge: 'New',
        action: () => navigateTo(ROUTES.ADMIN.OFFER_CREATE),
      },
      {
        id: 'nav-posts',
        title: t('Articles & Reviews'),
        subtitle: '/admin/posts',
        keywords: 'articles reviews bai viet danh gia tin tuc editorial post posts',
        category: 'Operations',
        icon: FileText,
        iconColor: 'text-indigo-400',
        action: () => navigateTo(ROUTES.ADMIN.POSTS),
      },
      {
        id: 'nav-post-create',
        title: t('Write New Article'),
        subtitle: '/admin/posts/create',
        keywords: 'write create article post viet bai moi danh gia review',
        category: 'Operations',
        icon: PlusCircle,
        iconColor: 'text-indigo-400',
        badge: 'New',
        action: () => navigateTo(ROUTES.ADMIN.POST_CREATE),
      },
      {
        id: 'nav-categories',
        title: t('Categories'),
        subtitle: '/admin/categories',
        keywords: 'categories chuyen muc danh muc category danh muc bai viet store',
        category: 'Operations',
        icon: FolderTree,
        iconColor: 'text-teal-400',
        action: () => navigateTo(ROUTES.ADMIN.CATEGORIES),
      },
      {
        id: 'nav-tags',
        title: t('Tags'),
        subtitle: '/admin/tags',
        keywords: 'tags the the tag hashtag nhan taxonomy phan loai tu khoa',
        category: 'Operations',
        icon: Hash,
        iconColor: 'text-rose-400',
        action: () => navigateTo(ROUTES.ADMIN.TAGS),
      },

      // CMS & Channels
      {
        id: 'nav-media',
        title: t('Media Library'),
        subtitle: '/admin/media',
        keywords: 'media library thu vien hinh anh asset banner logo upload webp',
        category: 'CMS & Channels',
        icon: ImageIcon,
        iconColor: 'text-purple-400',
        action: () => navigateTo(ROUTES.ADMIN.MEDIA),
      },
      {
        id: 'nav-menus',
        title: t('Navigation Menus'),
        subtitle: '/admin/menus',
        keywords: 'menus menu dieu huong thanh dieu huong header footer',
        category: 'CMS & Channels',
        icon: MenuIcon,
        iconColor: 'text-sky-400',
        action: () => navigateTo(ROUTES.ADMIN.MENUS),
      },
      {
        id: 'nav-pages',
        title: t('Static & Policy Pages'),
        subtitle: '/admin/pages',
        keywords: 'pages trang tinh chinh sach about terms privacy policy',
        category: 'CMS & Channels',
        icon: Layers,
        iconColor: 'text-orange-400',
        action: () => navigateTo(ROUTES.ADMIN.PAGES),
      },
      {
        id: 'nav-feedback',
        title: t('Customer Inquiries'),
        subtitle: '/admin/feedback',
        keywords: 'customer inquiries feedback lien he doc gia tin nhan ho tro',
        category: 'CMS & Channels',
        icon: MessageSquare,
        iconColor: 'text-pink-400',
        action: () => navigateTo(ROUTES.ADMIN.FEEDBACK),
      },
      {
        id: 'nav-subscribers',
        title: t('Newsletter Subscribers'),
        subtitle: '/admin/subscribers',
        keywords: 'newsletter subscribers dang ky ban tin email email marketing',
        category: 'CMS & Channels',
        icon: Mail,
        iconColor: 'text-cyan-400',
        action: () => navigateTo(ROUTES.ADMIN.SUBSCRIBERS),
      },

      // Security & Settings
      {
        id: 'nav-users',
        title: t('Staff Accounts'),
        subtitle: '/admin/users',
        keywords: 'staff accounts tai khoan nhan su user users quan tri vien',
        category: 'Security & Settings',
        icon: Users,
        iconColor: 'text-blue-500',
        action: () => navigateTo(ROUTES.ADMIN.USERS),
      },
      {
        id: 'nav-roles',
        title: t('Roles & RBAC Matrix'),
        subtitle: '/admin/roles',
        keywords: 'roles rbac matrix phan quyen vai tro permissions authorization',
        category: 'Security & Settings',
        icon: ShieldCheck,
        iconColor: 'text-violet-400',
        action: () => navigateTo(ROUTES.ADMIN.ROLES),
      },
      {
        id: 'nav-tracing',
        title: t('Action Tracing & Audit'),
        subtitle: '/admin/tracing',
        keywords: 'action tracing audit logs nhat ky hoat dong truy vet lich su',
        category: 'Security & Settings',
        icon: History,
        iconColor: 'text-amber-500',
        action: () => navigateTo(ROUTES.ADMIN.TRACING),
      },
      {
        id: 'nav-settings',
        title: t('System Settings'),
        subtitle: '/admin/settings',
        keywords: 'system settings cau hinh he thong brand logo seo tagline footer',
        category: 'Security & Settings',
        icon: Settings,
        iconColor: 'text-zinc-400',
        action: () => navigateTo(ROUTES.ADMIN.SETTINGS),
      },
      {
        id: 'nav-profile',
        title: t('2FA & Profile'),
        subtitle: '/admin/profile',
        keywords: 'profile 2fa ho so mat khau password doi mat khau session totp',
        category: 'Security & Settings',
        icon: User,
        iconColor: 'text-rose-500',
        action: () => navigateTo(ROUTES.ADMIN.PROFILE),
      },
    ];
  }, [locale, isDark, t, toggleTheme, setLocale]);

  // Category filters under the search bar
  const categories = useMemo(() => {
    return [
      { id: 'ALL', label: locale === 'vi' ? 'Tất cả' : 'All', count: commandItems.length },
      {
        id: 'Quick Actions',
        label: locale === 'vi' ? 'Thao tác nhanh' : 'Quick Actions',
        count: commandItems.filter((i) => i.category === 'Quick Actions').length,
      },
      {
        id: 'Operations',
        label: locale === 'vi' ? 'Vận hành' : 'Operations',
        count: commandItems.filter((i) => i.category === 'Operations').length,
      },
      {
        id: 'CMS & Channels',
        label: locale === 'vi' ? 'CMS & Kênh' : 'CMS',
        count: commandItems.filter((i) => i.category === 'CMS & Channels').length,
      },
      {
        id: 'Security & Settings',
        label: locale === 'vi' ? 'Cài đặt' : 'Settings',
        count: commandItems.filter((i) => i.category === 'Security & Settings').length,
      },
    ];
  }, [commandItems, locale]);

  // Filter items based on query and active category
  const filteredItems = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    return commandItems.filter((item) => {
      if (activeCategory !== 'ALL' && item.category !== activeCategory) {
        return false;
      }
      if (!trimmed) return true;

      const matchTitle = item.title.toLowerCase().includes(trimmed);
      const matchSubtitle = item.subtitle?.toLowerCase().includes(trimmed);
      const matchKeywords = item.keywords?.toLowerCase().includes(trimmed);
      const matchCategory = item.category.toLowerCase().includes(trimmed);
      return matchTitle || matchSubtitle || matchKeywords || matchCategory;
    });
  }, [commandItems, query, activeCategory]);

  // Reset selected index when filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  // Focus input when opened & reset category
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveCategory('ALL');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filteredItems.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const currentIdx = categories.findIndex((c) => c.id === activeCategory);
      const nextIdx = e.shiftKey
        ? (currentIdx - 1 + categories.length) % categories.length
        : (currentIdx + 1) % categories.length;
      setActiveCategory(categories[nextIdx].id);
      setSelectedIndex(0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Auto scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeElement = listRef.current.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl sm:max-w-[720px] bg-white dark:bg-[#11141c] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transition-all transform scale-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Container (Bo cong mềm mại, KHÔNG tràn viền) */}
        <div className="p-4 sm:p-5 pb-3.5">
          {/* Ô tìm kiếm bo cong mềm mại */}
          <div className="relative flex items-center h-13 sm:h-14 px-5 rounded-full bg-zinc-100/90 dark:bg-zinc-800/50 border border-zinc-200/90 dark:border-zinc-700/60 shadow-xs focus-within:ring-2 focus-within:ring-[#C62828]/25 focus-within:border-[#C62828] focus-within:bg-white dark:focus-within:bg-zinc-800/90 transition-all">
            <Search size={20} className="text-zinc-400 dark:text-zinc-400 shrink-0 mr-3.5" strokeWidth={2} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                locale === 'vi'
                  ? 'Tìm kiếm trang, thao tác, bài viết, cửa hàng...'
                  : 'Search pages, actions, articles, stores...'
              }
              className="flex-1 text-[15px] sm:text-[16px] font-normal bg-transparent border-0 outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition cursor-pointer"
                title="Clear"
              >
                <X size={16} />
              </button>
            ) : (
              <kbd className="px-2.5 py-1 text-[10.5px] font-mono font-medium text-zinc-400 dark:text-zinc-400 bg-white dark:bg-zinc-700/80 border border-zinc-200 dark:border-zinc-600/70 rounded-full shadow-2xs select-none">
                ESC
              </kbd>
            )}
          </div>

          {/* Phân loại danh mục (Category Chips) nằm ngay bên dưới thanh search */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-3 overflow-x-auto no-scrollbar pt-0.5">
            {categories.map((cat) => {
              const isCatActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSelectedIndex(0);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isCatActive
                      ? 'bg-[#C62828] text-white shadow-xs'
                      : 'bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/70 dark:border-zinc-700/60'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isCatActive
                        ? 'bg-white/20 text-white'
                        : 'bg-zinc-200/70 dark:bg-zinc-700/70 text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inset Hairline Divider (Đồng bộ lề mềm mại) */}
        <div className="mx-5 sm:mx-6 h-px bg-zinc-200/70 dark:bg-zinc-800/70" />

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-3 sm:p-4 pt-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-14 text-center text-zinc-400 dark:text-zinc-500 text-sm">
              <Command size={26} className="mx-auto mb-2.5 opacity-30" />
              <p className="font-medium">{locale === 'vi' ? 'Không tìm thấy kết quả nào' : 'No results found'}</p>
              <p className="text-xs text-zinc-400/80 dark:text-zinc-500/80 mt-1">
                {locale === 'vi' ? 'Thử chọn "Tất cả" hoặc tìm từ khóa khác' : 'Try selecting "All" or a different keyword'}
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              const isFirstOfCategory =
                index === 0 || item.category !== filteredItems[index - 1].category;

              return (
                <div key={item.id}>
                  {/* Category Section Header (Chỉ hiện khi ở tab Tất cả và không đang gõ tìm kiếm) */}
                  {activeCategory === 'ALL' && !query && isFirstOfCategory && (
                    <div className="px-3 pt-3.5 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 select-none">
                      {t(item.category)}
                    </div>
                  )}

                  {/* Command Row */}
                  <div
                    data-index={index}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-100 ${
                      isSelected
                        ? 'bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-white ring-1 ring-zinc-300/70 dark:ring-zinc-700/80 shadow-xs'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    {/* Left: Icon + 2-line Content */}
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-800/70 text-zinc-500'
                        }`}
                      >
                        <Icon size={16} className={item.iconColor} />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[13.5px] font-medium truncate ${isSelected ? 'text-zinc-900 dark:text-white font-semibold' : 'text-zinc-800 dark:text-zinc-200'}`}>
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.subtitle && (
                          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono truncate">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Category tag or Enter indicator */}
                    <div className="shrink-0 flex items-center">
                      {isSelected ? (
                        <div className="flex items-center gap-1.5 pl-2 animate-in fade-in duration-100">
                          <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-400 hidden sm:inline">
                            {locale === 'vi' ? 'Nhấn' : 'Press'}
                          </span>
                          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-md shadow-2xs">
                            ↵
                          </kbd>
                        </div>
                      ) : (
                        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2 py-0.5 rounded-md bg-zinc-100/70 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800/50 hidden sm:inline">
                          {t(item.category)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Minimal Footer */}
        <div className="px-5 py-2.5 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-950/50 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 select-none">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-[10px] font-mono border border-zinc-300/40 dark:border-zinc-700/40">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-[10px] font-mono border border-zinc-300/40 dark:border-zinc-700/40">↓</kbd>
              <span>{locale === 'vi' ? 'Di chuyển' : 'Navigate'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-[10px] font-mono border border-zinc-300/40 dark:border-zinc-700/40">↵</kbd>
              <span>{locale === 'vi' ? 'Mở' : 'Open'}</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-[10px] font-mono border border-zinc-300/40 dark:border-zinc-700/40">esc</kbd>
              <span>{locale === 'vi' ? 'Đóng' : 'Close'}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10.5px] text-zinc-400 dark:text-zinc-500 font-medium">HeyGoodly ProCMS</span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 border border-zinc-300/40 dark:border-zinc-700/40">⌘K</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
