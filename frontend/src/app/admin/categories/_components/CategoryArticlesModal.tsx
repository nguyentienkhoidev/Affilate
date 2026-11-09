'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  X,
  Search,
  BookOpen,
  Plus,
  ExternalLink,
  Edit2,
  Calendar,
  Clock,
  Eye,
  CheckCircle2,
  Clock3,
  FileEdit,
  Star,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from 'lucide-react';
import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { ROUTES } from '@/constants/routes';
import { type CategoryData } from '../_lib/data';

interface ModalArticle {
  id: number;
  title: string;
  slug: string;
  imageUrl?: string;
  excerpt?: string;
  category: string;
  author?: {
    name: string;
    avatar?: string;
  };
  featured: boolean;
  status: 'PUBLISHED' | 'DRAFT' | 'SCHEDULED';
  publishedAt: string;
  views: number;
  readTime: string;
  tags?: string[];
}

interface CategoryArticlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryData | null;
  allArticles?: any[];
}

export default function CategoryArticlesModal({
  isOpen,
  onClose,
  category,
}: CategoryArticlesModalProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'SCHEDULED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [articles, setArticles] = useState<ModalArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const pageSize = 5;

  const inFlightControllerRef = useRef<AbortController | null>(null);

  // Fetch real articles from PostgreSQL when category opens
  useEffect(() => {
    if (!isOpen || !category?.id) {
      setArticles([]);
      setSearch('');
      setStatusFilter('ALL');
      setCurrentPage(1);
      return;
    }

    if (inFlightControllerRef.current) {
      inFlightControllerRef.current.abort();
    }
    const controller = new AbortController();
    inFlightControllerRef.current = controller;

    setLoading(true);
    apiClient
      .get(API_ENDPOINTS.ADMIN.POSTS, {
        params: {
          categoryId: category.id,
          size: 50,
        },
        signal: controller.signal,
      })
      .then((res) => {
        const pageData = res.data?.data;
        const list = pageData?.content || pageData?.items || (Array.isArray(pageData) ? pageData : []);
        const mapped: ModalArticle[] = list.map((p: any) => ({
          id: Number(p.id),
          title: p.title || 'Untitled Article',
          slug: p.slug || '',
          imageUrl: p.image || '',
          excerpt: p.excerpt || '',
          category: p.categoryName || category.name,
          author: {
            name: p.authorName || 'HeyGoodly Editors',
          },
          featured: Boolean(p.isFeatured),
          status: (p.status || 'PUBLISHED') as any,
          publishedAt: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : 'Recent',
          views: Number(p.viewCount || 0),
          readTime: p.readTime || '5 min read',
          tags: Array.isArray(p.tags) ? p.tags : [],
        }));
        setArticles(mapped);
      })
      .catch((err) => {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
        console.error('Failed to load category articles:', err);
        setArticles([]);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [isOpen, category?.id]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = (art.title || '').toLowerCase().includes(q);
        const matchExcerpt = (art.excerpt || '').toLowerCase().includes(q);
        const matchAuthor = (art.author?.name || '').toLowerCase().includes(q);
        const matchTags = (art.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchExcerpt && !matchAuthor && !matchTags) return false;
      }

      if (statusFilter !== 'ALL' && art.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [articles, search, statusFilter]);

  if (!isOpen || !category) return null;

  const totalFiltered = filteredArticles.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedArticles = filteredArticles.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const startItem = totalFiltered === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalFiltered);

  const publishedCount = articles.filter((a) => a.status === 'PUBLISHED').length;
  const draftCount = articles.filter((a) => a.status === 'DRAFT').length;
  const scheduledCount = articles.filter((a) => a.status === 'SCHEDULED').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#C62828]/10 border border-[#C62828]/20 flex items-center justify-center text-[#C62828] shrink-0">
              <BookOpen size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                  Articles in &ldquo;{category.name}&rdquo;
                </h2>
                <span className="text-[11px] font-bold bg-[#C62828] text-white px-2.5 py-0.5 rounded-full shadow-2xs whitespace-nowrap">
                  {articles.length} Stories
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="font-mono text-[#C62828] font-semibold whitespace-nowrap">
                  /category/{category.slug}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="truncate hidden sm:inline">
                  {category.description || 'Editorial category archive'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            <Link
              href={`/category/${category.slug}`}
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#C62828] bg-white border border-slate-200 hover:border-[#C62828]/40 px-3 py-1.5 rounded-xl transition shadow-2xs cursor-pointer whitespace-nowrap"
              title="View on client website"
            >
              <span>View Live</span>
              <ExternalLink size={12} />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Action Toolbar & Filters */}
        <div className="p-4 border-b border-slate-100 bg-white space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-2.5 text-slate-400" size={15} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles by title, author, keyword..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Create New Article in this Category Button */}
            <Link
              href={`${ROUTES.ADMIN.POST_CREATE}?category=${encodeURIComponent(category.name)}&categoryId=${category.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#C62828] hover:bg-[#B71C1C] px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer shrink-0 justify-center whitespace-nowrap"
            >
              <Plus size={14} />
              <span>Write Article in &ldquo;{category.name}&rdquo;</span>
            </Link>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider inline-flex items-center gap-1 mr-1">
              <SlidersHorizontal size={11} /> Status:
            </span>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({articles.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PUBLISHED')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === 'PUBLISHED'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Published ({publishedCount})
            </button>
            {draftCount > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter('DRAFT')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                  statusFilter === 'DRAFT'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                Draft ({draftCount})
              </button>
            )}
            {scheduledCount > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter('SCHEDULED')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                  statusFilter === 'SCHEDULED'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Scheduled ({scheduledCount})
              </button>
            )}
          </div>
        </div>

        {/* Modal Scrollable Article List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="flex flex-col items-center justify-center gap-2">
                <Loader2 size={24} className="animate-spin text-[#C62828]" />
                <p className="text-xs font-semibold">Loading articles from database...</p>
              </div>
            </div>
          ) : paginatedArticles.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
              {paginatedArticles.map((art) => (
                <div
                  key={art.id}
                  className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group"
                >
                  {/* Left: Thumbnail & Content */}
                  <div className="flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 relative shrink-0 border border-slate-200">
                      {art.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={art.imageUrl}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <BookOpen size={20} />
                        </div>
                      )}
                      {art.featured && (
                        <span
                          className="absolute top-1 left-1 bg-amber-500 text-white p-0.5 rounded shadow-xs"
                          title="Featured Article"
                        >
                          <Star size={10} fill="currentColor" />
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap text-[11px]">
                        <span className="bg-[#C62828]/10 text-[#C62828] font-bold px-2 py-0.5 rounded whitespace-nowrap">
                          {art.category}
                        </span>
                        {art.status === 'PUBLISHED' && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[10px] whitespace-nowrap">
                            <CheckCircle2 size={10} /> Published
                          </span>
                        )}
                        {art.status === 'DRAFT' && (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold text-[10px] whitespace-nowrap">
                            <FileEdit size={10} /> Draft
                          </span>
                        )}
                        {art.status === 'SCHEDULED' && (
                          <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold text-[10px] whitespace-nowrap">
                            <Clock3 size={10} /> Scheduled
                          </span>
                        )}
                        <span className="text-slate-400 flex items-center gap-1 whitespace-nowrap">
                          <Calendar size={11} /> {art.publishedAt}
                        </span>
                        <span className="text-slate-400 hidden md:inline-flex items-center gap-1 whitespace-nowrap">
                          <Clock size={11} /> {art.readTime}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#C62828] transition-colors leading-snug line-clamp-1 sm:line-clamp-2">
                        <Link href={ROUTES.ADMIN.POST_EDIT(art.id)}>{art.title}</Link>
                      </h4>

                      <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                        {art.excerpt}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                        <span className="font-medium text-slate-700 flex items-center gap-1.5 whitespace-nowrap">
                          <span>{art.author?.name || 'Staff Writer'}</span>
                        </span>
                        {art.tags && art.tags.length > 0 && (
                          <span className="text-slate-400 hidden lg:inline truncate">
                            Tags: {art.tags.slice(0, 3).map((t) => `#${t}`).join(' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Link
                      href={ROUTES.PUBLIC.POST_DETAIL(art.slug)}
                      target="_blank"
                      className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold inline-flex items-center gap-1 transition shadow-2xs cursor-pointer whitespace-nowrap"
                      title="View live article"
                    >
                      <Eye size={13} />
                      <span className="hidden sm:inline">Preview</span>
                    </Link>

                    <Link
                      href={ROUTES.ADMIN.POST_EDIT(art.id)}
                      className="h-8 px-3 rounded-lg bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold inline-flex items-center gap-1.5 transition shadow-2xs cursor-pointer whitespace-nowrap"
                      title="Edit article"
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 px-4 text-center space-y-4 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-sm font-bold text-slate-900">
                  {search ? 'No articles match your search' : 'No articles in this category yet'}
                </h3>
                <p className="text-xs text-slate-500">
                  {search
                    ? 'Try searching with a different keyword or clear the status filter.'
                    : `There are currently no articles assigned to "${category.name}". Write the first article to publish stories in this category.`}
                </p>
              </div>
              <div>
                <Link
                  href={`${ROUTES.ADMIN.POST_CREATE}?category=${encodeURIComponent(category.name)}&categoryId=${category.id}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#C62828] hover:bg-[#B71C1C] px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Create First Article</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer & Pagination */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{startItem}</strong> to{' '}
            <strong className="text-slate-800">{endItem}</strong> of{' '}
            <strong className="text-slate-800">{totalFiltered}</strong> articles
          </div>

          <div className="flex items-center gap-2">
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={safePage === 1}
                  className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-600 transition cursor-pointer"
                  title="First Page"
                >
                  <ChevronsLeft size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-600 transition cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft size={13} />
                </button>
                <span className="text-xs font-bold text-slate-700 px-2 font-mono">
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-600 transition cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safePage === totalPages}
                  className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-600 transition cursor-pointer"
                  title="Last Page"
                >
                  <ChevronsRight size={13} />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="h-8 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer ml-auto sm:ml-2"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
