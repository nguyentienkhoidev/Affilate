'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Filter,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Eye,
  X,
  LayoutGrid,
  List,
  Sparkles,
  Loader2,
  FolderOpen,
  Calendar,
  HardDrive,
  Maximize2,
  Plus,
  ArrowUpDown,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Pagination from '@/components/admin/Pagination';
import { useAdminCollection } from '@/lib/admin/useAdminCollection';
import { MEDIA_STORE_KEY, DEFAULT_MEDIA, type MediaItem } from './_lib/data';

export default function AdminMediaPage() {
  const { items: mediaList, setItems: setMediaList, remove } = useAdminCollection<MediaItem>(
    MEDIA_STORE_KEY,
    DEFAULT_MEDIA
  );

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'size-desc' | 'name-asc'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [selectedAsset, setSelectedAsset] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState<'stores' | 'articles' | 'banners' | 'icons'>('articles');
  const [showUploadZone, setShowUploadZone] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this media asset?')) {
      remove(id as any);
      if (selectedAsset?.id === id) setSelectedAsset(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', uploadFolder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        const newItem: MediaItem = {
          id: `m-${Date.now()}`,
          name: data.filename || file.name,
          url: data.url,
          category: uploadFolder,
          size: `${Math.round(file.size / 1024)} KB`,
          dimensions: 'Optimized',
          format: file.name.split('.').pop()?.toUpperCase() || 'WEBP',
          createdAt: new Date().toISOString().split('T')[0],
        };

        setMediaList((prev) => [newItem, ...prev]);
        setSelectedAsset(newItem);
      } else {
        throw new Error(data.error || 'Server upload failed');
      }
    } catch {
      // Local fallback preview if endpoint is offline
      const localUrl = URL.createObjectURL(file);
      const newItem: MediaItem = {
        id: `m-${Date.now()}`,
        name: file.name,
        url: localUrl,
        category: uploadFolder,
        size: `${Math.round(file.size / 1024)} KB`,
        dimensions: 'Original',
        format: file.name.split('.').pop()?.toUpperCase() || 'WEBP',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setMediaList((prev) => [newItem, ...prev]);
      setSelectedAsset(newItem);
    } finally {
      setUploading(false);
      setShowUploadZone(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Filter & Search Logic
  const filtered = mediaList.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (formatFilter !== 'all' && item.format.toLowerCase() !== formatFilter.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchFormat = item.format.toLowerCase().includes(q);
      if (!matchName && !matchCategory && !matchFormat) return false;
    }
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'oldest') return a.createdAt.localeCompare(b.createdAt);
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'size-desc') {
      const sizeA = parseInt(a.size.replace(/\D/g, ''), 10) || 0;
      const sizeB = parseInt(b.size.replace(/\D/g, ''), 10) || 0;
      return sizeB - sizeA;
    }
    return b.createdAt.localeCompare(a.createdAt);
  });

  const totalItems = filtered.length;
  const paginatedMedia = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const categories = [
    { id: 'all', label: 'All Media Assets', count: mediaList.length },
    { id: 'stores', label: 'Merchant Stores', count: mediaList.filter((m) => m.category === 'stores').length },
    { id: 'articles', label: 'Editorial Articles', count: mediaList.filter((m) => m.category === 'articles').length },
    { id: 'banners', label: 'Sponsor Banners', count: mediaList.filter((m) => m.category === 'banners').length },
    { id: 'icons', label: 'System Icons', count: mediaList.filter((m) => m.category === 'icons').length },
  ];

  const categoryLabels: Record<string, string> = {
    stores: 'Merchant Store',
    articles: 'Editorial Story',
    banners: 'Sponsor Ad',
    icons: 'Brand Icon',
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <ImageIcon className="text-[#C62828]" size={26} /> Media &amp; Digital Asset Library
            </h1>
            <span className="bg-[#C62828]/10 text-[#C62828] text-xs font-bold px-2.5 py-0.5 rounded-full">
              {mediaList.length} Assets Total
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Centralized digital asset management for article hero images, merchant brand logos, and advertising creatives.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => setShowUploadZone(!showUploadZone)}
            className="h-9 px-4 inline-flex items-center justify-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Upload size={15} /> Upload Media Asset
          </button>
        </div>
      </div>

      {/* 2. Interactive Upload Zone Dropdown */}
      {showUploadZone && (
        <Card className="p-6 bg-rose-50/40 border-dashed border-2 border-[#C62828]/30 rounded-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Sparkles size={16} className="text-[#C62828]" /> Upload &amp; Optimize New Image
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Automatically converted to modern WebP with lossy compression and responsive aspect ratios.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-600">Target Folder:</span>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value as any)}
                className="text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] cursor-pointer"
              >
                <option value="articles">Editorial Articles</option>
                <option value="stores">Merchant Stores</option>
                <option value="banners">Sponsor Banners</option>
                <option value="icons">System Icons</option>
              </select>
            </div>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-zinc-300 hover:border-[#C62828] bg-white rounded-xl p-8 text-center cursor-pointer transition hover:bg-zinc-50/50 space-y-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#C62828] flex items-center justify-center mx-auto shadow-2xs">
              {uploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-800">
                {uploading ? 'Processing & Optimizing Image...' : 'Click to select or drag & drop files here'}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">PNG, JPG, WEBP, SVG or GIF up to 10MB</p>
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
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentPage(1);
              }}
              className={`h-8 px-3.5 inline-flex items-center justify-center text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Search, Format Filter, Sort & View Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-zinc-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by filename, extension, or dimensions..."
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828]"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Format Filter */}
            <select
              value={formatFilter}
              onChange={(e) => {
                setFormatFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] cursor-pointer"
            >
              <option value="all">All Formats</option>
              <option value="webp">WebP Only</option>
              <option value="png">PNG Only</option>
              <option value="jpg">JPG Only</option>
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
              <option value="newest">Newest Uploads</option>
              <option value="oldest">Oldest First</option>
              <option value="size-desc">Largest Size</option>
              <option value="name-asc">Filename (A → Z)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-zinc-200 rounded-xl p-0.5 bg-zinc-50 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`w-8 h-8 inline-flex items-center justify-center rounded-lg transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-zinc-900 shadow-2xs font-bold' : 'text-zinc-500 hover:text-zinc-800'
                }`}
                title="Grid Gallery View"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`w-8 h-8 inline-flex items-center justify-center rounded-lg transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-zinc-900 shadow-2xs font-bold' : 'text-zinc-500 hover:text-zinc-800'
                }`}
                title="Table List View"
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
          {paginatedMedia.length === 0 ? (
            <div className="col-span-full py-16 text-center text-zinc-400 bg-white rounded-2xl border border-zinc-200">
              <ImageIcon className="mx-auto text-zinc-300 mb-2" size={36} />
              <p className="text-xs font-bold text-zinc-600">No media assets found</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Try adjusting your keyword query or category tab.</p>
            </div>
          ) : (
            paginatedMedia.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  className="group bg-white border border-zinc-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all flex flex-col"
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-square bg-zinc-100 overflow-hidden cursor-pointer" onClick={() => setSelectedAsset(item)}>
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
                        title="View Full Resolution"
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
                        title="Copy CDN Link"
                      >
                        {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Card Metadata Details */}
                  <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4
                        className="text-xs font-bold text-zinc-900 truncate hover:text-[#C62828] cursor-pointer"
                        title={item.name}
                        onClick={() => setSelectedAsset(item)}
                      >
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        {item.dimensions} • {item.size}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-[10px] text-zinc-500">
                      <span className="font-semibold text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded">
                        {categoryLabels[item.category] || item.category}
                      </span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-zinc-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                        title="Delete Asset"
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
                  <th className="py-3 px-4 w-16">Preview</th>
                  <th className="py-3 px-4">Asset Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Dimensions</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Added Date</th>
                  <th className="py-3 px-4 text-right w-36 min-w-[144px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {paginatedMedia.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-400">
                      <ImageIcon className="mx-auto text-zinc-300 mb-2" size={32} />
                      <p className="font-semibold text-zinc-600">No media assets match your filters</p>
                    </td>
                  </tr>
                ) : (
                  paginatedMedia.map((item) => {
                    const isCopied = copiedId === item.id;
                    return (
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
                          <span className="bg-zinc-100 text-zinc-700 font-bold px-2 py-0.5 rounded text-[10px]">
                            {categoryLabels[item.category] || item.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-zinc-500 font-medium">
                          {item.dimensions}
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
                              onClick={() => handleCopyUrl(item.url, item.id)}
                              className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-indigo-50/50 text-zinc-600 hover:text-indigo-600 hover:border-indigo-300 transition shrink-0 shadow-2xs cursor-pointer"
                              title="Copy Direct URL"
                            >
                              {isCopied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                            </button>
                            <button
                              onClick={() => setSelectedAsset(item)}
                              className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-rose-50/60 text-zinc-600 hover:text-[#C62828] hover:border-[#C62828]/40 transition shrink-0 shadow-2xs cursor-pointer"
                              title="Inspect Asset"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-rose-50/60 text-zinc-400 hover:text-rose-600 hover:border-rose-300 transition shrink-0 shadow-2xs cursor-pointer"
                              title="Delete Asset"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Pagination */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xs overflow-hidden">
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[12, 24, 48, 96]}
          itemName="assets"
        />
      </div>

      {/* 6. High-Res Media Inspector Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">{selectedAsset.name}</h3>
                <p className="text-xs text-slate-500 font-mono">ID: #{selectedAsset.id}</p>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Large Preview */}
            <div className="relative rounded-2xl bg-zinc-900 border border-zinc-200/80 overflow-hidden flex items-center justify-center max-h-[380px] p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedAsset.url}
                alt={selectedAsset.name}
                className="max-h-[360px] w-auto max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>

            {/* Technical Metadata Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80 text-xs">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Dimensions</span>
                <span className="font-bold text-zinc-800 font-mono">{selectedAsset.dimensions}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">File Size</span>
                <span className="font-bold text-zinc-800 font-mono">{selectedAsset.size}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Format</span>
                <span className="font-bold text-indigo-700 uppercase">{selectedAsset.format}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Uploaded</span>
                <span className="font-bold text-zinc-800">{selectedAsset.createdAt}</span>
              </div>
            </div>

            {/* Direct CDN URL Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700">Public CDN Asset URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={selectedAsset.url}
                  className="w-full text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-600 focus:outline-none"
                />
                <button
                  onClick={() => handleCopyUrl(selectedAsset.url, selectedAsset.id)}
                  className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
                >
                  {copiedId === selectedAsset.id ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedId === selectedAsset.id ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={selectedAsset.url}
                target="_blank"
                rel="noreferrer"
                className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 border border-zinc-200 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0"
              >
                <ExternalLink size={14} /> Open Full Asset
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(selectedAsset.id)}
                  className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Trash2 size={14} /> Delete Asset
                </button>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="h-9 px-4 inline-flex items-center justify-center text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
