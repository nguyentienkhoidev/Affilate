'use client';

import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Trash2,
  Copy,
  LayoutGrid,
  List,
  Sparkles,
  FolderOpen,
  Maximize2,
  Tag,
  Hash,
  X,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { Card } from '@/components/ui/Card';
import Pagination from '@/components/admin/Pagination';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { useServerPagination } from '@/lib/admin/useServerPagination';
import { useToast } from '@/context/ToastContext';
import { mediaService } from '@/services/mediaService';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { useAdminI18n } from '@/context/AdminI18nContext';
import {
  type MediaItem,
  SUGGESTED_TAGS,
} from './_lib/data';
import MediaUploadStagedModal from './_components/MediaUploadStagedModal';
import MediaAssetDetailModal from './_components/MediaAssetDetailModal';

export default function AdminMediaPage() {
  const { t, locale } = useAdminI18n();
  const { toast, confirm: confirmModal } = useToast();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'size-desc' | 'name-asc'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [selectedAsset, setSelectedAsset] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState<'stores' | 'articles' | 'banners' | 'icons'>('articles');
  const [showUploadZone, setShowUploadZone] = useState(false);

  const {
    items: displayedMedia,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    refresh,
  } = useServerPagination<MediaItem>({
    endpoint: API_ENDPOINTS.ADMIN.MEDIA,
    defaultPageSize: 12,
    search,
    filters: {
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      tag: selectedTag || undefined,
      format: formatFilter !== 'all' ? formatFilter : undefined,
      sortBy,
    },
    transformItem: (m: any) => ({
      id: m.id,
      name: m.name,
      url: m.url,
      category: m.category,
      size: m.size || '100 KB',
      dimensions: m.dimensions || 'Optimized',
      format: m.format || 'WEBP',
      createdAt: m.createdAt ? m.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      tags: m.tags || [],
    }),
    fallbackItems: [],
  });

  // Staged Upload Modal with Mandatory Tags
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [stagedPreview, setStagedPreview] = useState<string>('');
  const [stagedTags, setStagedTags] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Modal tag editor
  const [newTagInput, setNewTagInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneInputRef = useRef<HTMLInputElement>(null);

  // Dynamic tag counts from backend API
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});

  const loadTagCounts = useCallback(async () => {
    try {
      const counts = await mediaService.getTagCounts();
      if (counts) {
        setTagCounts(counts);
      }
    } catch (err) {
      console.warn('Failed to load tag counts:', err);
    }
  }, []);

  // Only load tag counts if needed
  useEffect(() => {
    loadTagCounts();
  }, [loadTagCounts]);

  const allUniqueTags = useMemo(() => {
    return Object.keys(tagCounts);
  }, [tagCounts]);

  const handleCopyUrl = (url: string, id: string | number) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success(t('Copied image URL to clipboard'));
  };

  const handleDelete = async (id: string | number) => {
    const confirmed = await confirmModal({
      title: t('Delete Media Asset'),
      message: t('Are you sure you want to delete this image permanently? This action cannot be undone.'),
      confirmText: t('Delete Image'),
      cancelText: t('Cancel'),
      variant: 'danger',
    });
    if (confirmed) {
      try {
        await mediaService.deleteMedia(id);
        if (selectedAsset && String(selectedAsset.id) === String(id)) setSelectedAsset(null);
        toast.success(t('Image deleted from media library'));
        loadTagCounts();
        refresh();
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || t('Failed to delete media asset.');
        toast.error(msg);
      }
    }
  };

  // Step 1: User selects file -> stage it and open Mandatory Tagging Dialog
  const handleStageFile = (file: File) => {
    setStagedFile(file);
    setStagedPreview(URL.createObjectURL(file));
    const initialTags = [uploadFolder === 'stores' ? 'stores' : uploadFolder === 'banners' ? 'banner' : 'articles'];
    setStagedTags(initialTags);
    setShowUploadModal(true);
    setShowUploadZone(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (dropzoneInputRef.current) dropzoneInputRef.current.value = '';
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleStageFile(file);
  };

  // Step 2: Confirm upload with mandatory tags to PostgreSQL & MinIO / storage
  const handleConfirmUpload = async () => {
    if (!stagedFile) return;
    if (stagedTags.length === 0) {
      toast.error(t('Please add at least 1 tag to categorize and index this image!'));
      return;
    }

    setUploading(true);
    try {
      const data = await mediaService.uploadMedia(stagedFile, uploadFolder, stagedTags);
      if (data && data.url) {
        const newItem: MediaItem = {
          id: data.id,
          name: data.name,
          url: data.url,
          category: data.category,
          size: data.size,
          dimensions: data.dimensions,
          format: data.format,
          createdAt: data.createdAt ? data.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          tags: data.tags || stagedTags,
        };

        setSelectedAsset(newItem);
        toast.success(t('Image uploaded and saved to PostgreSQL library!'));
        loadTagCounts();
        refresh();
      } else {
        throw new Error('Server upload failed');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t('Failed to upload image.');
      toast.error(msg);
    } finally {
      setUploading(false);
      setShowUploadModal(false);
      setStagedFile(null);
    }
  };

  const handleAddTagToSelectedAsset = async () => {
    if (!selectedAsset || !newTagInput.trim()) return;
    const cleanTag = newTagInput.trim().toLowerCase().replace(/^#/, '');
    const currentTags = selectedAsset.tags || [];
    if (currentTags.some((t) => t.toLowerCase() === cleanTag)) {
      setNewTagInput('');
      return;
    }
    const updatedTags = [...currentTags, cleanTag];
    try {
      await mediaService.updateTags(selectedAsset.id, updatedTags);
      const updated = { ...selectedAsset, tags: updatedTags };
      setSelectedAsset(updated);
      setNewTagInput('');
      loadTagCounts();
      refresh();
      toast.success(t(`Added tag #${cleanTag}`));
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t('Failed to update tags.');
      toast.error(msg);
    }
  };

  const handleRemoveTagFromSelectedAsset = async (tagToRemove: string) => {
    if (!selectedAsset) return;
    const currentTags = selectedAsset.tags || [];
    const updatedTags = currentTags.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase());
    try {
      await mediaService.updateTags(selectedAsset.id, updatedTags);
      const updated = { ...selectedAsset, tags: updatedTags };
      setSelectedAsset(updated);
      toast.success(t(`Removed tag #${tagToRemove}`));
      loadTagCounts();
      refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t('Failed to remove tag.');
      toast.error(msg);
    }
  };

  const categories = [
    { id: 'all', label: 'All Assets', count: totalElements },
    { id: 'stores', label: 'Stores' },
    { id: 'articles', label: 'Articles' },
    { id: 'banners', label: 'Banners' },
    { id: 'icons', label: 'Icons' },
  ];

  const getCategoryDisplayName = (cat: string): string => {
    const lower = (cat || '').toLowerCase().trim();
    if (lower.startsWith('store')) return t('Stores');
    if (lower.startsWith('article') || lower === 'staff' || lower.includes('bài')) return t('Articles');
    if (lower.includes('banner')) return t('Banners');
    if (lower.includes('icon') || lower.includes('logo')) return t('Icons');
    return t(cat);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <AdminPageHeader
        icon={ImageIcon}
        title="Media Library & Asset Management"
        badge={`${totalElements} Media Files`}
        description="Centralized image repository. Mandatory tag indexing is enforced on upload for instant search and reuse."
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="h-9 px-4 inline-flex items-center justify-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Upload size={15} /> {t('Upload Image (Tag Required)')}
        </button>
      </AdminPageHeader>

      {/* 2. Interactive Upload Zone Dropdown */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowUploadZone(!showUploadZone)}
          className="text-xs font-bold text-zinc-600 hover:text-[#C62828] flex items-center gap-1.5 cursor-pointer"
        >
          <FolderOpen size={14} />
          <span>{showUploadZone ? t('Hide Drag & Drop Upload Zone') : t('Open Drag & Drop Upload Zone')}</span>
        </button>
      </div>

      {showUploadZone && (
        <Card className="p-6 bg-rose-50/40 border-dashed border-2 border-[#C62828]/30 rounded-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Sparkles size={16} className="text-[#C62828]" /> {t('Upload & Optimize New Image')}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {t('Automatically converts to optimized WebP. You will be prompted to add at least one search tag.')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-600">{t('Target Folder:')}</span>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value as any)}
                className="text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] cursor-pointer"
              >
                <option value="articles">{t('Articles')}</option>
                <option value="stores">{t('Stores')}</option>
                <option value="banners">{t('Promotional Banners')}</option>
                <option value="icons">{t('Logos & Icons')}</option>
              </select>
            </div>
          </div>

          <input
            type="file"
            ref={dropzoneInputRef}
            onChange={handleFileInputChange}
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={() => dropzoneInputRef.current?.click()}
            className="border border-dashed border-zinc-300 hover:border-[#C62828] bg-white rounded-xl p-8 text-center cursor-pointer transition hover:bg-zinc-50/50 space-y-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#C62828] flex items-center justify-center mx-auto shadow-2xs">
              <Upload size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-800">
                {t('Click to select an image or drag and drop files here')}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{t('PNG, JPG, WEBP, SVG up to 10MB')}</p>
            </div>
          </div>
        </Card>
      )}

      {/* 3. Filter Toolbar & Folder Tabs */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-2xs space-y-3.5">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl overflow-x-auto">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentPage(1);
              }}
              className={`h-8 px-3.5 inline-flex items-center justify-center text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-white text-zinc-900 shadow-2xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {t(cat.label)} {cat.count !== undefined ? `(${cat.count})` : ''}
            </button>
          ))}
        </div>

        {/* Search, Tag Filter, Format Filter, Sort & View Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-zinc-100">
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-zinc-400" size={15} />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={t('Search by file name, tag (#review, #apple, #tech)...')}
                className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] text-zinc-800 placeholder:text-zinc-400"
              />
            </div>

            {/* Active Tag Chip Indicator */}
            {selectedTag && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-[#C62828] border border-rose-200/80 shrink-0 shadow-2xs">
                <Tag size={12} />
                <span>#{selectedTag}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTag(null);
                    setCurrentPage(1);
                  }}
                  className="hover:bg-rose-200/60 rounded-full p-0.5 cursor-pointer ml-0.5"
                  title={locale === 'vi' ? 'Bỏ chọn thẻ' : 'Clear tag'}
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Tag Filter Dropdown & Centralized Hub Link */}
            {Object.keys(tagCounts).length > 0 && (
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedTag || 'all'}
                  onChange={(e) => {
                    setSelectedTag(e.target.value === 'all' ? null : e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] cursor-pointer"
                >
                  <option value="all">
                    {locale === 'vi' ? 'Tất cả thẻ' : 'All Tags'} ({Object.keys(tagCounts).length})
                  </option>
                  {Object.entries(tagCounts).map(([tag, count]) => (
                    <option key={tag} value={tag}>
                      #{tag} ({count})
                    </option>
                  ))}
                </select>
                <Link
                  href={ROUTES.ADMIN.TAGS}
                  className="p-2 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 rounded-xl transition shadow-2xs"
                  title={t('Manage all tags centrally')}
                >
                  <Hash size={14} />
                </Link>
              </div>
            )}

            {/* Format Filter */}
            <select
              value={formatFilter}
              onChange={(e) => {
                setFormatFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] cursor-pointer"
            >
              <option value="all">{t('All Formats')}</option>
              <option value="webp">WebP</option>
              <option value="png">PNG</option>
              <option value="jpg">JPG / JPEG</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] cursor-pointer"
            >
              <option value="newest">{t('Newest Uploaded')}</option>
              <option value="oldest">{t('Oldest First')}</option>
              <option value="size-desc">{t('Largest Size')}</option>
              <option value="name-asc">{t('File Name (A → Z)')}</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-zinc-200 rounded-xl p-0.5 bg-zinc-50 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`w-8 h-8 inline-flex items-center justify-center rounded-lg transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-zinc-900 shadow-2xs font-bold' : 'text-zinc-500 hover:text-zinc-800'
                }`}
                title={t('Grid View')}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`w-8 h-8 inline-flex items-center justify-center rounded-lg transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-zinc-900 shadow-2xs font-bold' : 'text-zinc-500 hover:text-zinc-800'
                }`}
                title={t('Table View')}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Main Media Showcase */}
      {viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {displayedMedia.length === 0 ? (
            <div className="col-span-full py-16 text-center text-zinc-400 bg-white rounded-2xl border border-zinc-200">
              <ImageIcon className="mx-auto text-zinc-300 mb-2" size={36} />
              <p className="text-xs font-bold text-zinc-600">{t('No matching media files found')}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{t('Try changing your search query or clearing tag filters.')}</p>
            </div>
          ) : (
            displayedMedia.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  className="group bg-white border border-zinc-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all flex flex-col"
                >
                  {/* Thumbnail Container */}
                  <div
                    className="relative aspect-square bg-zinc-100 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedAsset(item)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Format Badge Overlay */}
                    <span className="absolute top-2 left-2 text-[10px] font-extrabold uppercase bg-black/60 backdrop-blur-xs text-white px-1.5 py-0.5 rounded shadow-2xs">
                      {item.format}
                    </span>

                    {/* Hover Inspect Quick Trigger */}
                    <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAsset(item);
                        }}
                        className="w-8 h-8 rounded-lg bg-white/90 hover:bg-white text-zinc-900 flex items-center justify-center transition shadow-sm cursor-pointer"
                        title={t('View Details & Tags')}
                      >
                        <Maximize2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUrl(item.url, item.id);
                        }}
                        className="w-8 h-8 rounded-lg bg-white/90 hover:bg-white text-zinc-900 flex items-center justify-center transition shadow-sm cursor-pointer"
                        title={isCopied ? t('Copied!') : t('Copy Image URL')}
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4
                        className="text-xs font-bold text-zinc-900 truncate hover:text-[#C62828] cursor-pointer"
                        title={item.name}
                        onClick={() => setSelectedAsset(item)}
                      >
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        {item.dimensions === 'Optimized' ? t('Optimized') : item.dimensions} • {item.size}
                      </p>

                      {/* Tag Badges */}
                      {item.tags && item.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {item.tags.slice(0, 2).map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTag(tag);
                                setCurrentPage(1);
                              }}
                              className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-[#C62828] hover:bg-rose-100 border border-rose-200/60 truncate max-w-[80px] cursor-pointer"
                              title={`${t('Filter by')} #${tag}`}
                            >
                              #{tag}
                            </button>
                          ))}
                          {item.tags.length > 2 && (
                            <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-zinc-100 text-zinc-500">
                              +{item.tags.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-zinc-400 italic mt-1">{t('Untagged')}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-[10px] text-zinc-500">
                      <span className="font-semibold text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded">
                        {getCategoryDisplayName(item.category)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-zinc-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                        title={t('Delete image')}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-16">{t('Preview')}</th>
                  <th className="py-3 px-4">{t('File Name')}</th>
                  <th className="py-3 px-4">{t('Search Tags')}</th>
                  <th className="py-3 px-4">{t('Folder')}</th>
                  <th className="py-3 px-4">{t('Dimensions')}</th>
                  <th className="py-3 px-4">{t('Size')}</th>
                  <th className="py-3 px-4">{t('Format')}</th>
                  <th className="py-3 px-4">{t('Uploaded')}</th>
                  <th className="py-3 px-4 text-right w-36 min-w-[144px]">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {displayedMedia.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-zinc-400">
                      <ImageIcon className="mx-auto text-zinc-300 mb-2" size={32} />
                      <p className="font-semibold text-zinc-600">{t('No matching media files found')}</p>
                    </td>
                  </tr>
                ) : (
                  displayedMedia.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-2.5 px-4">
                        <div
                          onClick={() => setSelectedAsset(item)}
                          className="w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden cursor-pointer shrink-0"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          onClick={() => setSelectedAsset(item)}
                          className="font-bold text-zinc-900 block hover:text-[#C62828] cursor-pointer"
                        >
                          {item.name}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400 truncate max-w-xs block">
                          {item.url}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        {item.tags && item.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {item.tags.map((tItem) => (
                              <button
                                key={tItem}
                                type="button"
                                onClick={() => {
                                  setSelectedTag(tItem);
                                  setCurrentPage(1);
                                }}
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-[#C62828] border border-rose-200/60 cursor-pointer"
                              >
                                #{tItem}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic text-[11px]">{t('Untagged')}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="bg-zinc-100 text-zinc-700 font-bold px-2 py-0.5 rounded text-[10px]">
                          {getCategoryDisplayName(item.category)}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-zinc-500 font-medium">
                        {item.dimensions === 'Optimized' ? t('Optimized') : item.dimensions}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-zinc-500">
                        {item.size}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded text-[10px] uppercase">
                          {item.format}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-zinc-500">
                        {item.createdAt}
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap w-36 min-w-[144px]">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(item.url, item.id)}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-indigo-50/50 text-zinc-600 hover:text-indigo-600 hover:border-indigo-300 transition shrink-0 shadow-2xs cursor-pointer"
                            title={t('Copy URL')}
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedAsset(item)}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-rose-50/60 text-zinc-600 hover:text-[#C62828] hover:border-[#C62828]/40 transition shrink-0 shadow-2xs cursor-pointer"
                            title={t('View Details & Manage Tags')}
                          >
                            <Maximize2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-rose-50/60 text-zinc-400 hover:text-rose-600 hover:border-rose-300 transition shrink-0 shadow-2xs cursor-pointer"
                            title={t('Delete file')}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalElements}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        pageSizeOptions={[12, 24, 48, 96]}
      />

      {/* Modal 1: Staged Upload */}
      <MediaUploadStagedModal
        isOpen={showUploadModal}
        stagedFile={stagedFile}
        stagedPreview={stagedPreview}
        stagedTags={stagedTags}
        uploadFolder={uploadFolder}
        uploading={uploading}
        onClose={() => {
          setShowUploadModal(false);
          setStagedFile(null);
        }}
        onTagsChange={setStagedTags}
        onFolderChange={setUploadFolder}
        onConfirmUpload={handleConfirmUpload}
      />

      {/* Modal 2: Asset Inspector & Tag Editor */}
      <MediaAssetDetailModal
        asset={selectedAsset}
        copiedId={copiedId}
        newTagInput={newTagInput}
        allUniqueTags={allUniqueTags}
        suggestedTags={SUGGESTED_TAGS}
        onClose={() => setSelectedAsset(null)}
        onCopyUrl={handleCopyUrl}
        onDelete={handleDelete}
        onNewTagInputChange={setNewTagInput}
        onAddTag={handleAddTagToSelectedAsset}
        onRemoveTag={handleRemoveTagFromSelectedAsset}
        onAddSuggestedTag={async (sug) => {
          if (!selectedAsset) return;
          const currentTags = selectedAsset.tags || [];
          if (currentTags.some((tItem) => tItem.toLowerCase() === sug.toLowerCase())) return;
          const updatedTags = [...currentTags, sug];
          try {
            await mediaService.updateTags(selectedAsset.id, updatedTags);
            const updated = { ...selectedAsset, tags: updatedTags };
            setSelectedAsset(updated);
            setNewTagInput('');
            loadTagCounts();
            refresh();
            toast.success(t(`Added tag #${sug}`));
          } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || t('Failed to update tags.');
            toast.error(msg);
          }
        }}
      />
    </div>
  );
}
