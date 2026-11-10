'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  CheckCircle2,
  Clock,
  CalendarClock,
  FileText,
  ExternalLink,
  Award,
  Eye,
} from 'lucide-react';
import Pagination from '@/components/admin/Pagination';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminFilterBar from '@/components/admin/AdminFilterBar';
import AdminTableShell from '@/components/admin/AdminTableShell';
import AdminActionButton from '@/components/admin/AdminActionButton';
import { adminSelectClass, adminSearchInputClass } from '@/components/admin/adminStyles';
import { ROUTES } from '@/constants/routes';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { apiClient } from '@/lib/api/axios-client';
import { useServerPagination } from '@/lib/admin/useServerPagination';
import type { AdminArticle, CategoryOption } from './_lib/data';
import { usePermission } from '@/lib/admin/usePermission';
import { useToast } from '@/context/ToastContext';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';

type StatusFilter = 'ALL' | 'PUBLISHED' | 'SCHEDULED' | 'DRAFT';
type FeaturedFilter = 'ALL' | 'FEATURED';
type SortBy = 'newest' | 'views-desc' | 'title-asc';

interface PostStats {
  total: number;
  published: number;
  scheduled: number;
  draft: number;
  totalViews: number;
}

const TABLE_COLUMNS = [
  { label: 'Article Headline' },
  { label: 'Category' },
  { label: 'Author' },
  { label: 'Reader Views' },
  { label: 'Status' },
  { label: 'Actions', className: 'text-right w-44 min-w-[176px]' },
];

/** Mini stat card used in the top summary grid */
function StatCard({ label, value, valueColor }: { label: string; value: number | string; valueColor: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{label}</span>
      <span className={`text-xl sm:text-2xl font-black mt-1 block ${valueColor}`}>{value}</span>
    </div>
  );
}

export default function AdminPostsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading articles...</div>}>
      <AdminPostsContent />
    </Suspense>
  );
}

function AdminPostsContent() {
  const { hasPermission } = usePermission();
  const { toast, confirm: confirmModal } = useToast();
  const searchParams = useSearchParams();
  const catParam = searchParams.get('categoryId') || searchParams.get('category');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(catParam || 'ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('newest');

  // Categories list loaded on-demand per Rule 2
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [hasLoadedCategories, setHasLoadedCategories] = useState(false);

  // Global post stats from backend database
  const [stats, setStats] = useState<PostStats>({
    total: 0,
    published: 0,
    scheduled: 0,
    draft: 0,
    totalViews: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiClient.get<{ success: boolean; data: PostStats }>(API_ENDPOINTS.ADMIN.POST_STATS);
      if (res.data?.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch post stats from backend:', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const loadCategoriesOnDemand = async () => {
    if (hasLoadedCategories) return;
    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.CATEGORIES);
      const list = res.data?.data?.content || res.data?.data;
      if (Array.isArray(list)) {
        setCategories(
          list.map((c: any) => ({
            id: Number(c.id),
            name: String(c.name),
            slug: String(c.slug),
          }))
        );
        setHasLoadedCategories(true);
      }
    } catch (err) {
      console.warn('Failed to load categories on-demand:', err);
    }
  };

  const {
    items: pagedItems,
    loading: isLoading,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    setCurrentPage,
    setPageSize,
    setParam,
    refresh: refreshPosts,
  } = useServerPagination<AdminArticle>({
    endpoint: API_ENDPOINTS.ADMIN.POSTS,
    defaultPageSize: 8,
    initialParams: {
      search: '',
      categoryId: catParam && catParam !== 'ALL' && !isNaN(Number(catParam)) ? Number(catParam) : undefined,
      status: undefined,
      active: undefined,
      featured: undefined,
      sortBy: 'id',
      direction: 'desc',
    },
    mapItem: (p: any): AdminArticle => {
      const now = Date.now();
      const pubTime = p.publishedAt ? new Date(p.publishedAt).getTime() : 0;
      const isFuture = pubTime > now;
      let status: 'PUBLISHED' | 'DRAFT' | 'SCHEDULED' = 'DRAFT';
      if (p.status === 'PUBLISHED' || p.status === 'SCHEDULED' || p.status === 'DRAFT') {
        status = p.status;
      } else if (p.isActive) {
        status = isFuture ? 'SCHEDULED' : 'PUBLISHED';
      }

      let postImg = p.image || '';
      if (typeof window !== 'undefined' && window.location.protocol === 'https:' && postImg.startsWith('http://')) {
        try {
          const parsed = new URL(postImg);
          if (parsed.hostname === window.location.hostname) {
            parsed.protocol = 'https:';
            postImg = parsed.toString();
          }
        } catch {}
      }

      return {
        id: String(p.id),
        title: p.title || '',
        slug: p.slug || '',
        excerpt: p.excerpt || '',
        content: p.excerpt || '',
        imageUrl: postImg,
        category: p.categoryName || 'General',
        categoryId: p.categoryId ? Number(p.categoryId) : undefined,
        author: {
          name: p.authorName || 'HeyGoodly Editorial',
          role: p.authorRole || '',
          avatar: p.authorAvatar || '',
        },
        status,
        views: Number(p.viewCount || 0),
        rating: p.rating ? String(p.rating) : '',
        featured: Boolean(p.isFeatured),
        tags: Array.isArray(p.tags) ? p.tags : [],
        storeSlug: p.storeSlug || undefined,
        storeName: p.storeName || undefined,
        publishedAt: p.publishedAt
          ? new Date(p.publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Today',
        scheduledAt: isFuture ? p.publishedAt : undefined,
        readTime: p.readTime || '',
      };
    },
    fallbackItems: [],
  });

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setParam('search', val.trim() || undefined);
  };

  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    setParam('categoryId', val !== 'ALL' ? Number(val) : undefined);
  };

  const handleStatusChange = (val: StatusFilter) => {
    setStatusFilter(val);
    if (val === 'ALL') {
      setParam('status', undefined);
      setParam('active', undefined);
    } else {
      setParam('status', val);
      setParam('active', undefined);
    }
  };

  const handleFeaturedChange = (val: FeaturedFilter) => {
    setFeaturedFilter(val);
    setParam('featured', val === 'FEATURED' ? true : undefined);
  };

  const handleSortChange = (val: SortBy) => {
    setSortBy(val);
    if (val === 'views-desc') {
      setParam('sortBy', 'viewCount');
      setParam('direction', 'desc');
    } else if (val === 'title-asc') {
      setParam('sortBy', 'title');
      setParam('direction', 'asc');
    } else {
      setParam('sortBy', 'id');
      setParam('direction', 'desc');
    }
  };

  const isFiltered = search !== '' || categoryFilter !== 'ALL' || statusFilter !== 'ALL' || featuredFilter !== 'ALL' || sortBy !== 'newest';

  const handleResetFilters = () => {
    setSearch('');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
    setFeaturedFilter('ALL');
    setSortBy('newest');
    setParam('search', undefined);
    setParam('categoryId', undefined);
    setParam('status', undefined);
    setParam('active', undefined);
    setParam('featured', undefined);
    setParam('sortBy', 'id');
    setParam('direction', 'desc');
  };

  const handleClone = async (art: AdminArticle) => {
    const confirmed = await confirmModal({
      title: 'Clone Article',
      message: `Duplicate "${art.title}" as a new draft copy?`,
      confirmText: 'Clone',
      cancelText: 'Cancel',
      variant: 'info',
    });
    if (!confirmed) return;
    try {
      await apiClient.post(API_ENDPOINTS.ADMIN.POST_CLONE(art.id));
      refreshPosts();
      fetchStats();
      toast.success(`Duplicated "${art.title}" as a new draft`);
    } catch {
      toast.error('Failed to clone article');
    }
  };

  const handleDelete = async (art: AdminArticle) => {
    const confirmed = await confirmModal({
      title: 'Delete Article',
      message: (
        <span>
          Are you sure you want to permanently delete{' '}
          <strong className="text-rose-600 font-bold">{art.title}</strong>?
        </span>
      ),
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    try {
      await apiClient.delete(API_ENDPOINTS.ADMIN.POST_DETAIL(art.id));
      refreshPosts();
      fetchStats();
      toast.success('Article deleted successfully');
    } catch {
      toast.error('Failed to delete article');
    }
  };

  if (!hasPermission('post.view')) {
    return <UnauthorizedAccess requiredPermission="post.view" moduleName="Articles & Reviews" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        icon={BookOpen}
        title="Editorial Articles & Reviews"
        badge={`${stats.total || totalItems} Articles Total`}
        description="Author and publish independent product tests, buying guides, and breaking editorial dispatches."
      >
        <Link
          href="/posts"
          target="_blank"
          className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-2xs whitespace-nowrap shrink-0"
        >
          <span>Live Journal</span>
          <ExternalLink size={13} />
        </Link>
        {hasPermission('post.create') && (
          <Link
            href={ROUTES.ADMIN.POST_CREATE}
            className="h-9 px-4 inline-flex items-center justify-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus size={16} /> Write New Article
          </Link>
        )}
      </AdminPageHeader>

      {/* Stats overview (100% DB-driven from /api/v1/admin/posts/stats) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Published Stories"
          value={stats.published}
          valueColor="text-emerald-600"
        />
        <StatCard
          label="Scheduled Releases"
          value={stats.scheduled}
          valueColor="text-indigo-600"
        />
        <StatCard
          label="Pending Drafts"
          value={stats.draft}
          valueColor="text-amber-600"
        />
        <StatCard
          label="Total Reader Views"
          value={(stats.totalViews || 0).toLocaleString()}
          valueColor="text-slate-900"
        />
      </div>

      {/* Filters */}
      <AdminFilterBar totalItems={totalItems} itemName="articles" isFiltered={isFiltered} onReset={handleResetFilters}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search headline, author, tag, slug..."
              className={adminSearchInputClass}
            />
          </div>

          <select
            value={categoryFilter}
            onFocus={loadCategoriesOnDemand}
            onClick={loadCategoriesOnDemand}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={adminSelectClass}
          >
            <option value="ALL">All Editorial Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </option>
            ))}
          </select>

          <select value={statusFilter} onChange={(e) => handleStatusChange(e.target.value as StatusFilter)} className={adminSelectClass}>
            <option value="ALL">All Publishing Statuses</option>
            <option value="PUBLISHED">Published Only</option>
            <option value="SCHEDULED">Scheduled Only</option>
            <option value="DRAFT">Drafts Only</option>
          </select>

          <select value={sortBy} onChange={(e) => handleSortChange(e.target.value as SortBy)} className={adminSelectClass}>
            <option value="newest">Sort: Newly Created</option>
            <option value="views-desc">Sort: Highest Reader Views</option>
            <option value="title-asc">Sort: Title (A to Z)</option>
          </select>
        </div>

        {/* Featured filter pill */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-bold">
            <Award size={12} /> Highlights:
          </span>
          <button
            type="button"
            onClick={() => handleFeaturedChange(featuredFilter === 'FEATURED' ? 'ALL' : 'FEATURED')}
            className={`px-3 py-1 rounded-lg font-semibold transition text-[11px] cursor-pointer ${
              featuredFilter === 'FEATURED'
                ? 'bg-[#C62828] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ★ Featured Editor Picks
          </button>
        </div>
      </AdminFilterBar>

      {/* Table */}
      <AdminTableShell
        columns={TABLE_COLUMNS}
        rowCount={pagedItems.length}
        emptyMessage="No articles match your current search and filter criteria."
      >
        {pagedItems.map((art) => (
          <tr key={art.id} className="hover:bg-slate-50/60 transition-colors group">
            {/* Headline + thumbnail */}
            <td className="py-3.5 px-4 max-w-md">
              <div className="flex items-center gap-3">
                <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 relative border border-slate-200 shadow-2xs">
                  {art.imageUrl ? (
                    <Image src={art.imageUrl} alt={art.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <BookOpen size={16} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-[#C62828] transition-colors">
                      {art.title}
                    </span>
                    {art.featured && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0">Hero</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-mono text-slate-400">/post/{art.slug}</span>
                    {art.readTime && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock size={11} /> {art.readTime}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{art.publishedAt}</span>
                  </div>
                </div>
              </div>
            </td>

            {/* Category */}
            <td className="py-3.5 px-4">
              <span className="inline-block bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-[11px]">{art.category}</span>
            </td>

            {/* Author */}
            <td className="py-3.5 px-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 shrink-0 relative border border-slate-300">
                  {art.author.avatar ? (
                    <Image src={art.author.avatar} alt={art.author.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {art.author.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="font-medium text-slate-800 text-xs">{art.author.name}</span>
              </div>
            </td>

            {/* Reader Views */}
            <td className="py-3.5 px-4">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                <Eye size={13} className="text-slate-400" />
                <span className="font-mono text-xs">{(art.views || 0).toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 font-normal">views</span>
              </div>
            </td>

            {/* Status */}
            <td className="py-3.5 px-4 whitespace-nowrap">
              {art.status === 'PUBLISHED' ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[10px] shadow-2xs">
                  <CheckCircle2 size={12} /> Published
                </span>
              ) : art.status === 'SCHEDULED' ? (
                <div className="space-y-0.5">
                  <span className="inline-flex items-center gap-1.5 text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 text-[10px] shadow-2xs">
                    <CalendarClock size={12} className="text-indigo-600" /> Scheduled
                  </span>
                  <span className="text-[10px] text-indigo-600 font-mono block">
                    {art.scheduledAt
                      ? new Date(art.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : art.publishedAt}
                  </span>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-[10px] shadow-2xs">
                  <FileText size={12} /> Draft
                </span>
              )}
            </td>

            {/* Actions */}
            <td className="py-3.5 px-4 text-right whitespace-nowrap w-44 min-w-[176px]">
              <div className="flex items-center justify-end gap-1.5">
                <AdminActionButton icon={ExternalLink} href={`/post/${art.slug}`} target="_blank" title="View Live on Client Website" variant="default" />
                {hasPermission('post.clone') && (
                  <AdminActionButton icon={Copy} onClick={() => handleClone(art)} title="Clone Article" variant="indigo" />
                )}
                {hasPermission('post.update') && (
                  <AdminActionButton icon={Edit2} href={ROUTES.ADMIN.POST_EDIT(art.id)} title="Edit Article & Content" variant="primary" />
                )}
                {hasPermission('post.delete') && (
                  <AdminActionButton icon={Trash2} onClick={() => handleDelete(art)} title="Delete Article" variant="danger" />
                )}
              </div>
            </td>
          </tr>
        ))}
      </AdminTableShell>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[4, 8, 16, 32]}
        itemName="articles"
      />
    </div>
  );
}
