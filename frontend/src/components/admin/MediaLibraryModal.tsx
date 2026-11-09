'use client';

import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  X,
  Upload,
  Search,
  Check,
  Trash2,
  Copy,
  CheckCircle2,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Loader2,
  Tag,
  Hash,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import {
  type MediaItem,
  SUGGESTED_TAGS,
} from '@/app/admin/media/_lib/data';
import MediaTagInput from './MediaTagInput';
import { useOptionalToast } from '@/context/ToastContext';
import { mediaService } from '@/services/mediaService';
import { tagService, type TagItem } from '@/services/tagService';

export type { MediaItem };

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
  defaultFolder?: 'stores' | 'articles' | 'banners' | 'icons';
}

export default function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Media & Asset Library',
  defaultFolder = 'articles',
}: MediaLibraryModalProps) {
  const toastCtx = useOptionalToast();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  // Server-side pagination state
  const [items, setItems] = useState<MediaItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLibraryAssets, setTotalLibraryAssets] = useState(0);
  const [loading, setLoading] = useState(false);

  // Dynamic tag counts from backend
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  const [centralTags, setCentralTags] = useState<TagItem[]>([]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load total unfiltered assets count for library
  const loadTotalLibraryAssets = useCallback(async () => {
    try {
      const res = await mediaService.getMedia({ page: 0, size: 1 });
      if (res && typeof res.totalElements === 'number') {
        setTotalLibraryAssets(res.totalElements);
      }
    } catch {}
  }, []);

  // Load tag counts from backend API
  const loadTagCounts = useCallback(async () => {
    try {
      const counts = await mediaService.getTagCounts();
      if (counts && Object.keys(counts).length > 0) {
        setTagCounts(counts);
      }
    } catch {}
  }, []);

  // Load tag counts & total library count on open
  useEffect(() => {
    if (isOpen) {
      loadTagCounts();
      loadTotalLibraryAssets();
      tagService.getPublicTags().then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCentralTags(data);
        }
      }).catch(console.warn);
    }
  }, [isOpen, loadTagCounts, loadTotalLibraryAssets]);

  // In-flight request controller to prevent duplicate calls
  const inFlightControllerRef = useRef<AbortController | null>(null);

  // Fetch paginated media from backend
  const fetchMedia = useCallback(async () => {
    if (!isOpen) return;

    if (inFlightControllerRef.current) {
      inFlightControllerRef.current.abort();
    }
    const controller = new AbortController();
    inFlightControllerRef.current = controller;

    setLoading(true);
    try {
      const res = await mediaService.getMedia({
        page: currentPage - 1,
        size: pageSize,
        search: debouncedSearch.trim() || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        tag: selectedTag || undefined,
        sortBy: 'newest',
      });

      if (controller.signal.aborted) return;

      const rawContent = res?.content || [];
      const mapped: MediaItem[] = rawContent.map((m: any) => ({
        id: m.id,
        name: m.name,
        url: m.url,
        category: m.category,
        size: m.size || '100 KB',
        dimensions: m.dimensions || 'Optimized',
        format: m.format || 'WEBP',
        createdAt: m.createdAt ? m.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        tags: m.tags || [],
      }));

      setItems(mapped);
      const total = res?.totalElements ?? mapped.length;
      setTotalElements(total);
      setTotalPages(res?.totalPages || Math.max(1, Math.ceil(total / pageSize)));
      if (!debouncedSearch.trim() && selectedCategory === 'all' && !selectedTag) {
        setTotalLibraryAssets(total);
      }
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      console.warn('Backend media API error:', err);
      setItems([]);
      setTotalElements(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [isOpen, currentPage, pageSize, debouncedSearch, selectedCategory, selectedTag]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Staging upload with mandatory tags
  const [stagingFile, setStagingFile] = useState<File | null>(null);
  const [stagingPreview, setStagingPreview] = useState<string>('');
  const [stagingTags, setStagingTags] = useState<string[]>([]);
  const [stagingFolder, setStagingFolder] = useState<'stores' | 'articles' | 'banners' | 'icons'>(defaultFolder);
  const [showTaggingModal, setShowTaggingModal] = useState(false);

  // Inspector tag addition
  const [newTagInput, setNewTagInput] = useState('');

  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handler for category filter toggle
  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  // Handler for tag pill toggle
  const handleTagToggle = (tag: string | null) => {
    setSelectedTag((prev) => (prev === tag ? null : tag));
    setCurrentPage(1);
  };

  // Step 1: User picks file -> Stage file and open tagging dialog
  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStagingFile(file);
    setStagingPreview(URL.createObjectURL(file));
    setStagingFolder(defaultFolder);
    const initialTags = [defaultFolder === 'stores' ? 'store' : defaultFolder === 'banners' ? 'banner' : 'article'];
    setStagingTags(initialTags);
    setShowTaggingModal(true);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Step 2: User confirms upload with mandatory tags to PostgreSQL & MinIO
  const handleConfirmUpload = async () => {
    if (!stagingFile) return;
    if (stagingTags.length === 0) {
      toastCtx?.toast.error('Please enter at least 1 tag for the image before uploading!');
      return;
    }

    setUploading(true);
    try {
      const data = await mediaService.uploadMedia(stagingFile, stagingFolder, stagingTags);
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
          tags: data.tags || stagingTags,
        };

        setSelectedItem(newItem);
        toastCtx?.toast.success('Image uploaded and saved to library!');
        fetchMedia();
        loadTagCounts();
        loadTotalLibraryAssets();
      } else {
        throw new Error('Upload failed');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to upload image.';
      toastCtx?.toast.error(msg);
    } finally {
      setUploading(false);
      setShowTaggingModal(false);
      setStagingFile(null);
      setStagingPreview('');
      setStagingTags([]);
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDelete = async (id: string | number) => {
    if (toastCtx) {
      const ok = await toastCtx.confirm({
        title: 'Delete Media Image?',
        message: 'Are you sure you want to delete this image from the Media Library? This action cannot be undone.',
        confirmText: 'Delete Image',
        cancelText: 'Cancel',
        variant: 'danger',
      });
      if (!ok) return;
    }
    try {
      await mediaService.deleteMedia(id);
      if (selectedItem && String(selectedItem.id) === String(id)) setSelectedItem(null);
      toastCtx?.toast.success('Image deleted from Media Library.');
      fetchMedia();
      loadTagCounts();
      loadTotalLibraryAssets();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete image.';
      toastCtx?.toast.error(msg);
    }
  };

  const handleConfirmSelect = () => {
    if (selectedItem) {
      onSelect(selectedItem.url);
      onClose();
    }
  };

  // Add tag to currently selected item
  const handleAddTagToSelectedItem = async () => {
    if (!selectedItem || !newTagInput.trim()) return;
    const clean = newTagInput.trim().replace(/^#+/, '').toLowerCase();
    const currentTags = selectedItem.tags || [];
    if (currentTags.some((t) => t.toLowerCase() === clean)) {
      setNewTagInput('');
      return;
    }
    const updatedTags = [...currentTags, clean];
    try {
      await mediaService.updateTags(selectedItem.id, updatedTags);
      const updatedItem = { ...selectedItem, tags: updatedTags };
      setSelectedItem(updatedItem);
      setItems((prev) => prev.map((m) => (String(m.id) === String(selectedItem.id) ? updatedItem : m)));
      setNewTagInput('');
      loadTagCounts();
      toastCtx?.toast.success(`Added tag #${clean}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update tags.';
      toastCtx?.toast.error(msg);
    }
  };

  // Remove tag from currently selected item
  const handleRemoveTagFromSelectedItem = async (tagToRemove: string) => {
    if (!selectedItem) return;
    const currentTags = selectedItem.tags || [];
    const updatedTags = currentTags.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase());
    try {
      await mediaService.updateTags(selectedItem.id, updatedTags);
      const updatedItem = { ...selectedItem, tags: updatedTags };
      setSelectedItem(updatedItem);
      setItems((prev) => prev.map((m) => (String(m.id) === String(selectedItem.id) ? updatedItem : m)));
      loadTagCounts();
      toastCtx?.toast.success(`Removed tag #${tagToRemove}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to remove tag.';
      toastCtx?.toast.error(msg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ImageIcon size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">{title}</h2>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                  {selectedTag || debouncedSearch.trim() || selectedCategory !== 'all'
                    ? `${totalElements} Filtered / ${totalLibraryAssets || totalElements} Total`
                    : `${totalLibraryAssets || totalElements} Tagged Assets`}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Centralized media library: All assets are categorized with tags for fast lookup.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar: Search, Category Filters, Tag Filters & Upload */}
        <div className="p-4 border-b border-slate-100 space-y-2.5 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by filename, tag (#review, #apple, #tech)..."
                  className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                />
              </div>

              {/* Category buttons & Tag Dropdown */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  {(['all', 'stores', 'articles', 'banners'] as const).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className={`px-3 py-1 rounded-lg capitalize transition cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-white text-slate-900 shadow-xs font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Tag Filter Dropdown */}
                {Object.keys(tagCounts).length > 0 && (
                  <select
                    value={selectedTag || 'all'}
                    onChange={(e) => handleTagToggle(e.target.value === 'all' ? null : e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="all">
                      All Tags ({Object.keys(tagCounts).length})
                    </option>
                    {Object.entries(tagCounts).map(([tag, count]) => (
                      <option key={tag} value={tag}>
                        #{tag} ({count})
                      </option>
                    ))}
                  </select>
                )}

                {/* Active Tag Chip Indicator */}
                {selectedTag && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 text-[#C62828] border border-rose-200/80 shrink-0 shadow-2xs">
                    <Tag size={12} />
                    <span>#{selectedTag}</span>
                    <button
                      type="button"
                      onClick={() => handleTagToggle(null)}
                      className="hover:bg-rose-200/60 rounded-full p-0.5 cursor-pointer ml-0.5"
                      title="Clear tag filter"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFilePicked}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Upload size={14} /> Upload New Image (Tag Required)
              </button>
            </div>
          </div>
        </div>

        {/* Main Content: Gallery Grid (Left) + Detail Inspector (Right) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          
          {/* Gallery Grid */}
          <div className="md:col-span-8 p-5 overflow-y-auto max-h-[52vh]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-2 text-slate-400">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
                <p className="text-xs font-semibold text-slate-500">Loading media assets...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <ImageIcon size={36} className="mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">No matching images found</p>
                <p className="text-xs text-slate-400">
                  Try searching with a different keyword, clearing the tag filter, or clicking &quot;Upload New Image&quot;.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {items.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`group relative rounded-2xl border overflow-hidden cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-600/30 shadow-md bg-indigo-50/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-xs'
                      }`}
                    >
                      <div className="aspect-4/3 w-full bg-slate-100 relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="text-[9px] font-black uppercase tracking-wider bg-slate-900/80 text-white px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                            {item.format}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-sm">
                            <Check size={14} />
                          </div>
                        )}
                      </div>

                      <div className="p-2.5 space-y-1.5">
                        <p className="text-xs font-bold text-slate-800 truncate" title={item.name}>
                          {item.name}
                        </p>

                        {/* Tag Badges on Card */}
                        {item.tags && item.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-[#C62828] border border-rose-200/60 truncate max-w-[80px]"
                                title={`#${tag}`}
                              >
                                #{tag}
                              </span>
                            ))}
                            {item.tags.length > 2 && (
                              <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-slate-100 text-slate-500">
                                +{item.tags.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[9px] text-amber-600 italic">Untagged</span>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 border-t border-slate-100">
                          <span>{item.dimensions}</span>
                          <span>{item.size}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Asset Inspector Panel */}
          <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-slate-100 p-5 bg-slate-50/60 flex flex-col justify-between overflow-y-auto max-h-[52vh]">
            {selectedItem ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white p-2 shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.name}
                    className="w-full aspect-16/10 object-contain rounded-xl bg-slate-100"
                  />
                </div>

                {/* File Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">File Details</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedItem.id)}
                      className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <Trash2 size={12} /> Delete Image
                    </button>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Filename:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[150px]">{selectedItem.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dimensions:</span>
                      <span className="font-semibold text-slate-800">{selectedItem.dimensions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Size:</span>
                      <span className="font-semibold text-slate-800">{selectedItem.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Format:</span>
                      <span className="font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                        {selectedItem.format}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tag Inspector & Management */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Tag size={11} className="text-[#C62828]" /> Search Tags ({selectedItem.tags?.length || 0})
                  </span>

                  <div className="bg-white rounded-xl p-3 border border-slate-200/80 space-y-2">
                    {/* Tags list */}
                    <div className="flex flex-wrap gap-1.5">
                      {selectedItem.tags && selectedItem.tags.length > 0 ? (
                        selectedItem.tags.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-[#C62828] border border-rose-200/80"
                          >
                            <span>#{t}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTagFromSelectedItem(t)}
                              className="text-rose-400 hover:text-rose-700 cursor-pointer ml-0.5"
                              title={`Remove tag #${t}`}
                            >
                              <X size={10} />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No tags assigned</span>
                      )}
                    </div>

                    {/* Quick Add Tag Input */}
                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTagToSelectedItem();
                          }
                        }}
                        placeholder="Add new tag..."
                        className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={handleAddTagToSelectedItem}
                        disabled={!newTagInput.trim()}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    {/* Tag Suggestions from Central Hub */}
                    {(() => {
                      const currentTags = selectedItem.tags || [];
                      const centralNames = centralTags.map((c) => c.slug || c.name);
                      const backendTagList = Object.keys(tagCounts);
                      const pool = Array.from(new Set([...centralNames, ...backendTagList]));
                      const unused = pool.filter(
                        (s) => !currentTags.some((t) => t.toLowerCase() === s.toLowerCase())
                      );
                      const matching = newTagInput.trim()
                        ? unused.filter((s) => s.toLowerCase().includes(newTagInput.trim().toLowerCase()))
                        : unused;
                      if (matching.length === 0) return null;
                      return (
                        <div className="pt-2 border-t border-slate-100 space-y-1">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                            <Sparkles size={11} className="text-amber-500" />
                            <span>Centralized tag suggestions (click to quick-add):</span>
                          </div>
                          <div className="flex flex-wrap gap-1 max-h-44 overflow-y-auto">
                            {matching.map((sug) => {
                              const matchedEntity = centralTags.find(
                                (c) => c.slug?.toLowerCase() === sug.toLowerCase() || c.name?.toLowerCase() === sug.toLowerCase()
                              );
                              const color = matchedEntity?.color || '#6366f1';
                              return (
                                <button
                                  key={sug}
                                  type="button"
                                  onClick={async () => {
                                    const updatedTags = [...currentTags, sug];
                                    const updatedItem = { ...selectedItem, tags: updatedTags };
                                    setSelectedItem(updatedItem);
                                    setItems((prev) => prev.map((m) => (m.id === selectedItem.id ? updatedItem : m)));
                                    await mediaService.updateTags(selectedItem.id, updatedTags).catch(console.warn);
                                    setNewTagInput('');
                                    loadTagCounts();
                                  }}
                                  className="px-2 py-0.5 rounded-lg text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 shadow-2xs hover:scale-105"
                                  style={{
                                    backgroundColor: `${color}15`,
                                    color: color,
                                    border: `1px solid ${color}35`,
                                  }}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                                  <span>#{sug}</span>
                                  <Plus size={10} />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Direct Link & Copy */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600">CDN / Public URL</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={selectedItem.url}
                      className="w-full text-[11px] font-mono bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedItem.url)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition shrink-0 cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedUrl ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 space-y-2 text-slate-400">
                <Layers size={32} className="mx-auto text-slate-300" />
                <p className="text-xs font-semibold">Select an image to view details and tags</p>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            BOTTOM BAR: SERVER-SIDE PAGINATION (LEFT) + ACTION BUTTONS (RIGHT)
           ========================================================================= */}
        <div className="px-6 py-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          
          {/* Pagination Controls */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              {totalElements === 0 ? (
                'Showing 0 of 0 assets'
              ) : (
                <>
                  Showing <span className="font-bold text-slate-800">{(currentPage - 1) * pageSize + 1}</span>–
                  <span className="font-bold text-slate-800">{Math.min(currentPage * pageSize, totalElements)}</span> of{' '}
                  <span className="font-bold text-slate-800">{totalElements}</span> assets
                </>
              )}
            </span>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value={6}>6 / page</option>
              <option value={12}>12 / page</option>
              <option value={24}>24 / page</option>
            </select>

            {/* Always visible pagination controls */}
            <div className="flex items-center gap-1 select-none">
              <button
                type="button"
                disabled={currentPage <= 1 || loading}
                onClick={() => setCurrentPage(1)}
                className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                title="First page"
              >
                <ChevronsLeft size={13} />
              </button>

              <button
                type="button"
                disabled={currentPage <= 1 || loading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                title="Previous page"
              >
                <ChevronLeft size={13} />
              </button>

              {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((p) => {
                if (
                  totalPages <= 7 ||
                  p === 1 ||
                  p === totalPages ||
                  (p >= currentPage - 1 && p <= currentPage + 1)
                ) {
                  const isActive = p === currentPage;
                  return (
                    <button
                      key={p}
                      type="button"
                      disabled={loading || totalPages <= 1}
                      onClick={() => setCurrentPage(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  );
                }
                if (p === currentPage - 2 || p === currentPage + 2) {
                  return (
                    <span key={p} className="text-xs text-slate-400 px-0.5">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                type="button"
                disabled={currentPage >= totalPages || loading}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                title="Next page"
              >
                <ChevronRight size={13} />
              </button>

              <button
                type="button"
                disabled={currentPage >= totalPages || loading}
                onClick={() => setCurrentPage(totalPages)}
                className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                title="Last page"
              >
                <ChevronsRight size={13} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleConfirmSelect}
              disabled={!selectedItem}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
            >
              <Check size={14} /> Insert Selected Image
            </button>
          </div>
        </div>

        {/* =========================================================================
            SUB-MODAL: MANDATORY TAGGING WHEN UPLOADING NEW IMAGE
           ========================================================================= */}
        {showTaggingModal && stagingFile && (
          <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#C62828]">
                    <Tag size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Tag New Image</h3>
                    <p className="text-[11px] text-slate-400">Tags are required so this asset can be searched and filtered later.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowTaggingModal(false);
                    setStagingFile(null);
                  }}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Preview & File Info */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stagingPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1 overflow-hidden flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{stagingFile.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {Math.round(stagingFile.size / 1024)} KB • {stagingFile.name.split('.').pop()?.toUpperCase()}
                  </p>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] font-bold text-slate-500">Folder:</span>
                    <select
                      value={stagingFolder}
                      onChange={(e) => setStagingFolder(e.target.value as any)}
                      className="text-[11px] font-bold bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-slate-700 focus:outline-none"
                    >
                      <option value="articles">Articles (articles)</option>
                      <option value="stores">Stores (stores)</option>
                      <option value="banners">Banners (banners)</option>
                      <option value="icons">Icons / Logos (icons)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Mandatory Tag Input */}
              <MediaTagInput
                tags={stagingTags}
                onChange={setStagingTags}
                required={true}
                label="Category Tags (Required)"
                placeholder="Type a tag and press Enter (e.g., smartphone, anker, review...)"
                helperText="You must enter at least 1 tag before completing the upload."
              />

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowTaggingModal(false);
                    setStagingFile(null);
                  }}
                  disabled={uploading}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUpload}
                  disabled={stagingTags.length === 0 || uploading}
                  className="px-5 py-2.5 bg-[#C62828] hover:bg-[#B71C1C] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Optimizing &amp; saving...
                    </>
                  ) : (
                    <>
                      <Check size={14} /> Complete Upload &amp; Save ({stagingTags.length} {stagingTags.length === 1 ? 'tag' : 'tags'})
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
