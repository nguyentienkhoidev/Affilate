'use client';

import { useState } from 'react';
import {
  Hash,
  Plus,
  Search,
  Sparkles,
  Edit2,
  Trash2,
  Copy,
  Check,
  FileText,
  Image as ImageIcon,
  Store,
  Tag,
  Layers,
} from 'lucide-react';
import Pagination from '@/components/admin/Pagination';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminFilterBar from '@/components/admin/AdminFilterBar';
import AdminTableShell from '@/components/admin/AdminTableShell';
import { adminSelectClass, adminSearchInputClass } from '@/components/admin/adminStyles';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { useServerPagination } from '@/lib/admin/useServerPagination';
import { usePermission } from '@/lib/admin/usePermission';
import { useToast } from '@/context/ToastContext';
import { useAdminI18n } from '@/context/AdminI18nContext';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { tagService, type TagItem } from '@/services/tagService';
import TagFormModal from './_components/TagFormModal';

type FeaturedFilter = 'ALL' | 'FEATURED' | 'REGULAR';
type EntityTypeFilter = 'ALL' | 'POST' | 'STORE' | 'OFFER' | 'MEDIA' | 'UNUSED';
type SortBy = 'name-asc' | 'name-desc' | 'id-desc';

const ENTITY_TYPE_OPTIONS = [
  { value: 'ALL' as const, label: 'All Entities', icon: Layers },
  { value: 'POST' as const, label: 'Posts & Reviews', icon: FileText },
  { value: 'STORE' as const, label: 'Stores', icon: Store },
  { value: 'OFFER' as const, label: 'Offers & Deals', icon: Tag },
  { value: 'MEDIA' as const, label: 'Media Assets', icon: ImageIcon },
  { value: 'UNUSED' as const, label: 'Unused Tags', icon: Sparkles },
];

const TABLE_COLUMNS = [
  { label: 'Tag Name & Badge', className: 'min-w-[200px]' },
  { label: 'Slug', className: 'min-w-[140px]' },
  { label: 'Description', className: 'min-w-[200px]' },
  { label: 'Featured', className: 'w-20 text-center' },
  { label: 'Status', className: 'w-20 text-center' },
  { label: 'Connected Entities (Usage)', className: 'min-w-[260px] text-center' },
  { label: 'Actions', className: 'text-right w-24 min-w-[90px]' },
];

export default function AdminTagsPage() {
  const { hasPermission } = usePermission();
  const { t, locale } = useAdminI18n();
  const { toast, confirm: confirmModal } = useToast();

  const [search, setSearch] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>('ALL');
  const [entityTypeFilter, setEntityTypeFilter] = useState<EntityTypeFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('name-asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const {
    items: tags,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    setCurrentPage,
    setPageSize,
    setParam,
    refresh: refreshTags,
  } = useServerPagination<TagItem>({
    endpoint: API_ENDPOINTS.ADMIN.TAGS,
    defaultPageSize: 15,
    initialParams: {
      search: '',
      sortBy: 'name',
      direction: 'asc',
    },
    mapItem: (item: any): TagItem => ({
      id: Number(item.id),
      name: item.name || '',
      slug: item.slug || '',
      description: item.description || '',
      color: item.color || '#6366f1',
      isFeatured: Boolean(item.isFeatured),
      isActive: item.isActive !== false,
      postsCount: Number(item.postsCount || 0),
      storesCount: Number(item.storesCount || 0),
      offersCount: Number(item.offersCount || 0),
      mediaCount: Number(item.mediaCount || 0),
      totalUsageCount: Number(item.totalUsageCount || 0),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }),
    fallbackItems: [],
  });

  if (!hasPermission('tag.view')) {
    return <UnauthorizedAccess />;
  }

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setParam('search', val.trim() || undefined);
  };

  const handleFeaturedChange = (val: FeaturedFilter) => {
    setFeaturedFilter(val);
    if (val === 'FEATURED') {
      setParam('isFeatured', true);
    } else if (val === 'REGULAR') {
      setParam('isFeatured', false);
    } else {
      setParam('isFeatured', undefined);
    }
  };

  const handleEntityTypeChange = (val: EntityTypeFilter) => {
    setEntityTypeFilter(val);
    setParam('entityType', val === 'ALL' ? undefined : val);
  };

  const handleSortChange = (val: SortBy) => {
    setSortBy(val);
    if (val === 'name-asc') {
      setParam('sortBy', 'name');
      setParam('direction', 'asc');
    } else if (val === 'name-desc') {
      setParam('sortBy', 'name');
      setParam('direction', 'desc');
    } else {
      setParam('sortBy', 'id');
      setParam('direction', 'desc');
    }
  };

  const isFiltered = search !== '' || featuredFilter !== 'ALL' || entityTypeFilter !== 'ALL' || sortBy !== 'name-asc';

  const handleResetFilters = () => {
    setSearch('');
    setFeaturedFilter('ALL');
    setEntityTypeFilter('ALL');
    setSortBy('name-asc');
    setParam('search', undefined);
    setParam('isFeatured', undefined);
    setParam('entityType', undefined);
    setParam('sortBy', 'name');
    setParam('direction', 'asc');
  };

  const handleOpenCreate = () => {
    setEditingTag(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (tag: TagItem) => {
    setEditingTag(tag);
    setModalOpen(true);
  };

  const handleCopySlug = (slug: string) => {
    navigator.clipboard.writeText(slug);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 1800);
  };

  const handleDelete = async (tag: TagItem) => {
    const confirmed = await confirmModal({
      title: t('Confirm Tag Deletion'),
      message: (
        <span>
          Are you sure you want to delete tag{' '}
          <strong className="text-rose-600 font-bold">#{tag.slug}</strong> ({tag.name})?
          Articles and media items will be unlinked.
        </span>
      ),
      confirmText: t('Delete Tag'),
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (confirmed) {
      try {
        await tagService.deleteTag(tag.id);
        toast.success(t('Tag deleted successfully'));
        refreshTags();
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Failed to delete tag';
        toast.error(errMsg);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        icon={Hash}
        title={t('Tag Management')}
        badge={`${totalItems} ${t('Tags Total')}`}
        description={t('Organize, categorize and index articles and media assets with high-performance taxonomy tags.')}
      >
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          {t('Add New Tag')}
        </button>
      </AdminPageHeader>

      {/* Quick Entity Type Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-0.5">
        {ENTITY_TYPE_OPTIONS.map((opt) => {
          const isSelected = entityTypeFilter === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleEntityTypeChange(opt.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-950 font-bold shadow-xs scale-[1.02]'
                  : 'bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t(opt.label)}</span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <AdminFilterBar
        totalItems={totalItems}
        itemName="tags"
        isFiltered={isFiltered}
        onReset={handleResetFilters}
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t('Search tags by name, slug...')}
              className={adminSearchInputClass}
            />
          </div>

          {/* Entity Type Filter */}
          <div>
            <select
              value={entityTypeFilter}
              onChange={(e) => handleEntityTypeChange(e.target.value as EntityTypeFilter)}
              className={adminSelectClass}
            >
              <option value="ALL">{t('All Entities')}</option>
              <option value="POST">{t('Posts & Reviews')}</option>
              <option value="STORE">{t('Stores')}</option>
              <option value="OFFER">{t('Offers & Deals')}</option>
              <option value="MEDIA">{t('Media Assets')}</option>
              <option value="UNUSED">{t('Unused / Standalone')}</option>
            </select>
          </div>

          {/* Featured Filter */}
          <div>
            <select
              value={featuredFilter}
              onChange={(e) => handleFeaturedChange(e.target.value as FeaturedFilter)}
              className={adminSelectClass}
            >
              <option value="ALL">{t('All Tags')}</option>
              <option value="FEATURED">{t('Featured Tags')}</option>
              <option value="REGULAR">{t('Regular Tags')}</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortBy)}
              className={adminSelectClass}
            >
              <option value="name-asc">{t('Name: A → Z')}</option>
              <option value="name-desc">{t('Name: Z → A')}</option>
              <option value="id-desc">{t('Newest First')}</option>
            </select>
          </div>
        </div>
      </AdminFilterBar>

      {/* Table Shell */}
      <AdminTableShell
        columns={TABLE_COLUMNS.map((col) => ({ ...col, label: t(col.label) }))}
        isEmpty={tags.length === 0}
        emptyMessage={t('No tags found matching your filters.')}
        footer={
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 15, 25, 50, 100]}
          />
        }
      >
        {tags.map((tag) => {
          const color = tag.color || '#6366f1';
          return (
            <tr
              key={tag.id}
              className="group hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors border-b border-slate-100 dark:border-zinc-800 text-xs"
            >
              {/* Tag Name & Badge */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: `${color}18`,
                      color: color,
                      border: `1px solid ${color}40`,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                    #{tag.name}
                  </span>
                  {tag.isFeatured && (
                    <span
                      title={t('Featured Tag')}
                      className="inline-flex items-center text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded font-medium border border-amber-500/20"
                    >
                      <Sparkles className="w-2.5 h-2.5 mr-1 fill-amber-500" />
                      {t('Featured')}
                    </span>
                  )}
                </div>
              </td>

              {/* Slug */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-1.5">
                  <code className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                    {tag.slug}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopySlug(tag.slug)}
                    title={t('Copy slug')}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition"
                  >
                    {copiedSlug === tag.slug ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </td>

              {/* Description */}
              <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">
                <p className="line-clamp-1 text-xs">
                  {tag.description || <span className="text-slate-400 italic">—</span>}
                </p>
              </td>

              {/* Featured */}
              <td className="py-3 px-4 text-center">
                {tag.isFeatured ? (
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
                ) : (
                  <span className="inline-block w-2 h-2 rounded-full bg-slate-300 dark:bg-zinc-700" />
                )}
              </td>

              {/* Status */}
              <td className="py-3 px-4 text-center">
                {tag.isActive ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {t('Active')}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/10 text-slate-500 border border-slate-500/20">
                    {t('Inactive')}
                  </span>
                )}
              </td>

              {/* Usage Count Across All 4 Entities */}
              <td className="py-3 px-4 text-center">
                <div className="flex items-center justify-center gap-1.5 text-[11px]">
                  <span
                    className="font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200/80 dark:border-zinc-700"
                    title={
                      locale === 'vi'
                        ? `Tổng số liên kết: ${tag.totalUsageCount ?? (tag.postsCount + tag.storesCount + tag.offersCount + tag.mediaCount)}`
                        : `Total connected items: ${tag.totalUsageCount ?? (tag.postsCount + tag.storesCount + tag.offersCount + tag.mediaCount)}`
                    }
                  >
                    {tag.totalUsageCount ?? (tag.postsCount + tag.storesCount + tag.offersCount + tag.mediaCount)}
                  </span>

                  <div className="flex items-center gap-1 text-[10px]">
                    <span
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                      title={locale === 'vi' ? `Bài viết & Đánh giá: ${tag.postsCount}` : `Posts & Reviews: ${tag.postsCount}`}
                    >
                      <FileText className="w-2.5 h-2.5" />
                      {tag.postsCount}
                    </span>
                    <span
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold"
                      title={locale === 'vi' ? `Cửa hàng: ${tag.storesCount}` : `Stores: ${tag.storesCount}`}
                    >
                      <Store className="w-2.5 h-2.5" />
                      {tag.storesCount}
                    </span>
                    <span
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-semibold"
                      title={locale === 'vi' ? `Mã giảm giá & Ưu đãi: ${tag.offersCount}` : `Offers & Deals: ${tag.offersCount}`}
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag.offersCount}
                    </span>
                    <span
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-semibold"
                      title={locale === 'vi' ? `Tài nguyên Media: ${tag.mediaCount}` : `Media Assets: ${tag.mediaCount}`}
                    >
                      <ImageIcon className="w-2.5 h-2.5" />
                      {tag.mediaCount}
                    </span>
                  </div>
                </div>
              </td>

              {/* Actions */}
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(tag)}
                    title={t('Edit Tag')}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(tag)}
                    title={t('Delete Tag')}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </AdminTableShell>

      {/* Create & Edit Modal */}
      <TagFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tag={editingTag}
        onSuccess={refreshTags}
      />
    </div>
  );
}
