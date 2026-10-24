'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Star,
  SlidersHorizontal,
  Tag as TagIcon,
  Check,
  Award,
} from 'lucide-react';
import Pagination from '@/components/admin/Pagination';
import { ROUTES } from '@/constants/routes';
import { useAdminCollection } from '@/lib/admin/useAdminCollection';
import {
  POSTS_STORE_KEY,
  DEFAULT_ARTICLES,
  CLIENT_CATEGORIES,
  type AdminArticle,
} from './_lib/data';
import { usePermission } from '@/lib/admin/usePermission';

export default function AdminPostsPage() {
  const { hasPermission } = usePermission();
  const { items: articles, create, remove } = useAdminCollection<AdminArticle>(POSTS_STORE_KEY, DEFAULT_ARTICLES);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'SCHEDULED' | 'DRAFT'>('ALL');
  const [featuredFilter, setFeaturedFilter] = useState<'ALL' | 'FEATURED' | 'STANDARD'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'views-desc' | 'rating-desc' | 'title-asc'>('newest');
  const [notification, setNotification] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Actions
  const handleClone = (art: AdminArticle) => {
    const cloned: AdminArticle = {
      ...art,
      id: `art-${Date.now()}`,
      title: `${art.title} (Draft Copy)`,
      slug: `${art.slug}-copy-${Date.now().toString().slice(-4)}`,
      status: 'DRAFT',
      views: 0,
      publishedAt: 'Draft',
    };
    create(cloned);
    showToast(`Duplicated "${art.title}" as a new draft`);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete article: "${title}"?`)) {
      remove(id);
      showToast('Article deleted successfully');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
    setFeaturedFilter('ALL');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const isFiltered =
    search !== '' ||
    categoryFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    featuredFilter !== 'ALL' ||
    sortBy !== 'newest';

  // Filter calculations & sorting
  const filtered = articles
    .filter((art) => {
      const matchSearch =
        art.title.toLowerCase().includes(search.toLowerCase()) ||
        art.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        art.slug.toLowerCase().includes(search.toLowerCase()) ||
        art.author.name.toLowerCase().includes(search.toLowerCase()) ||
        art.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchCategory = categoryFilter === 'ALL' || art.category === categoryFilter;
      const matchStatus = statusFilter === 'ALL' || art.status === statusFilter;

      let matchFeatured = true;
      if (featuredFilter === 'FEATURED') matchFeatured = art.featured;
      else if (featuredFilter === 'STANDARD') matchFeatured = !art.featured;

      return matchSearch && matchCategory && matchStatus && matchFeatured;
    })
    .sort((a, b) => {
      if (sortBy === 'views-desc') return (b.views || 0) - (a.views || 0);
      if (sortBy === 'rating-desc') return parseFloat(b.rating || '0') - parseFloat(a.rating || '0');
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
      return b.id.localeCompare(a.id);
    });

  const totalItems = filtered.length;
  const paginatedArticles = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const publishedCount = articles.filter((a) => a.status === 'PUBLISHED').length;
  const scheduledCount = articles.filter((a) => a.status === 'SCHEDULED').length;
  const draftCount = articles.filter((a) => a.status === 'DRAFT').length;
  const reviewsCount = articles.filter((a) => a.category === 'Reviews').length;
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-fadeIn">
          <Check size={16} className="text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <BookOpen className="text-[#C62828]" size={26} /> Editorial Articles & Reviews
            </h1>
            <span className="bg-[#C62828]/10 text-[#C62828] text-xs font-bold px-2.5 py-0.5 rounded-full">
              {articles.length} Articles Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Author and publish independent product tests, buying guides, and breaking editorial dispatches synchronized with the client journal.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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
        </div>
      </div>

      {/* 2. Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Published Stories</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 block">{publishedCount}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Scheduled Releases</span>
          <span className="text-xl sm:text-2xl font-black text-indigo-600 mt-1 block">{scheduledCount}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pending Drafts</span>
          <span className="text-xl sm:text-2xl font-black text-amber-600 mt-1 block">{draftCount}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Reader Views</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">{totalViews.toLocaleString()}</span>
        </div>
      </div>

      {/* 3. Advanced Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3.5">
        
        {/* Search & Select Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search headline, author, tag, slug..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828]"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] cursor-pointer"
            >
              <option value="ALL">All Editorial Categories</option>
              {CLIENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] cursor-pointer"
            >
              <option value="ALL">All Publishing Statuses</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="SCHEDULED">Scheduled Only (Hẹn giờ)</option>
              <option value="DRAFT">Drafts Only</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] cursor-pointer"
            >
              <option value="newest">Sort: Newly Created</option>
              <option value="views-desc">Sort: Highest Reader Views</option>
              <option value="rating-desc">Sort: Highest Score / Rating</option>
              <option value="title-asc">Sort: Title (A to Z)</option>
            </select>
          </div>
        </div>

        {/* Feature Pills & Clear Action */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-bold">
              <Award size={12} /> Highlights:
            </span>
            <button
              onClick={() => {
                setFeaturedFilter(featuredFilter === 'FEATURED' ? 'ALL' : 'FEATURED');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg font-semibold transition text-[11px] cursor-pointer ${
                featuredFilter === 'FEATURED'
                  ? 'bg-[#C62828] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ★ Featured Editor Picks
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500 font-medium">
              Found <strong className="text-slate-900">{totalItems}</strong> matching articles
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-[#C62828] hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 4. Article Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Article Headline</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Score & Rating</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right w-44 min-w-[176px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No articles match your current search and filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50/60 transition-colors group">
                    
                    {/* Article Headline + Cover thumbnail */}
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 relative border border-slate-200 shadow-2xs">
                          {art.imageUrl ? (
                            <Image
                              src={art.imageUrl}
                              alt={art.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
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
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0">
                                Hero
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-mono text-slate-400">/post/{art.slug}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock size={11} /> {art.readTime}
                            </span>
                            <span>•</span>
                            <span>{art.publishedAt}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-[11px]">
                        {art.category}
                      </span>
                    </td>

                    {/* Author */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 shrink-0 relative border border-slate-300">
                          {art.author.avatar ? (
                            <Image
                              src={art.author.avatar}
                              alt={art.author.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                              {art.author.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-slate-800 text-xs">
                          {art.author.name}
                        </span>
                      </div>
                    </td>

                    {/* Rating & Views */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-800 font-bold">
                          <Star size={13} className="text-amber-500 fill-amber-500" />
                          <span>{art.rating}</span>
                          <span className="text-[10px] text-slate-400 font-normal">/ 5.0</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          {(art.views || 0).toLocaleString()} views
                        </span>
                      </div>
                    </td>

                    {/* Publication Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {art.status === 'PUBLISHED' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[10px] shadow-2xs">
                          <CheckCircle2 size={12} /> Published
                        </span>
                      ) : art.status === 'SCHEDULED' ? (
                        <div className="space-y-0.5">
                          <span
                            className="inline-flex items-center gap-1.5 text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 text-[10px] shadow-2xs"
                            title={`Scheduled for: ${art.scheduledAt || art.publishedAt}`}
                          >
                            <CalendarClock size={12} className="text-indigo-600" /> Scheduled
                          </span>
                          {art.scheduledAt ? (
                            <span className="text-[10px] text-indigo-600 font-mono block">
                              {new Date(art.scheduledAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          ) : (
                            <span className="text-[10px] text-indigo-600 font-mono block">
                              {art.publishedAt}
                            </span>
                          )}
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
                        {/* View live client post */}
                        <Link
                          href={`/post/${art.slug}`}
                          target="_blank"
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 hover:border-slate-300 transition shrink-0 shadow-2xs"
                          title="View Live on Client Website"
                        >
                          <ExternalLink size={13} />
                        </Link>

                        {/* Duplicate */}
                        {hasPermission('post.clone') && (
                          <button
                            onClick={() => handleClone(art)}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-indigo-50/50 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition shrink-0 shadow-2xs cursor-pointer"
                            title="Clone Article"
                          >
                            <Copy size={13} />
                          </button>
                        )}

                        {/* Edit */}
                        {hasPermission('post.update') && (
                          <Link
                            href={ROUTES.ADMIN.POST_EDIT(art.id)}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-rose-50/60 text-slate-600 hover:text-[#C62828] hover:border-[#C62828]/40 transition shrink-0 shadow-2xs cursor-pointer"
                            title="Edit Article & Content"
                          >
                            <Edit2 size={13} />
                          </Link>
                        )}

                        {/* Delete */}
                        {hasPermission('post.delete') && (
                          <button
                            onClick={() => handleDelete(art.id, art.title)}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-rose-50/60 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition shrink-0 shadow-2xs cursor-pointer"
                            title="Delete Article"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[4, 8, 16, 32]}
          itemName="articles"
        />

      </div>

    </div>
  );
}
