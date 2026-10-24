'use client';

import { useState, useRef } from 'react';
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
  Filter,
} from 'lucide-react';
import { useAdminCollection } from '@/lib/admin/useAdminCollection';
import { MEDIA_STORE_KEY, DEFAULT_MEDIA, type MediaItem } from '@/app/admin/media/_lib/data';

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
  const { items: mediaList, setItems: setMediaList, remove } = useAdminCollection<MediaItem>(MEDIA_STORE_KEY, DEFAULT_MEDIA);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredMedia = mediaList.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.format.toLowerCase().includes(q);
    }
    return true;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', defaultFolder);

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
          category: defaultFolder,
          size: `${Math.round(file.size / 1024)} KB`,
          dimensions: 'Optimized',
          format: file.name.split('.').pop()?.toUpperCase() || 'WEBP',
          createdAt: new Date().toISOString().split('T')[0],
        };

        setMediaList((prev) => [newItem, ...prev]);
        setSelectedItem(newItem);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch {
      // Fallback: simulate local preview if server route has issue
      const localUrl = URL.createObjectURL(file);
      const newItem: MediaItem = {
        id: `m-${Date.now()}`,
        name: file.name,
        url: localUrl,
        category: defaultFolder,
        size: `${Math.round(file.size / 1024)} KB`,
        dimensions: 'Original',
        format: 'IMAGE',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setMediaList((prev) => [newItem, ...prev]);
      setSelectedItem(newItem);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this asset from library?')) {
      remove(id as any);
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const handleConfirmSelect = () => {
    if (selectedItem) {
      onSelect(selectedItem.url);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ImageIcon size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">{title}</h2>
              <p className="text-xs text-slate-500">
                Optimized WebP media files, CDN-ready assets, and brand logos.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar: Search, Filters & Upload */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search media by filename, extension..."
                className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(['all', 'stores', 'articles', 'banners'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg capitalize transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Uploading WebP...
                </>
              ) : (
                <>
                  <Upload size={14} /> Upload New File
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Content: Gallery Grid (Left) + Detail Inspector (Right) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Gallery Grid */}
          <div className="md:col-span-8 p-5 overflow-y-auto max-h-[58vh]">
            {filteredMedia.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <ImageIcon size={36} className="mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">No media assets found</p>
                <p className="text-xs text-slate-400">Try adjusting your search keyword or upload a new image.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {filteredMedia.map((item) => {
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

                      <div className="p-2.5 space-y-0.5">
                        <p className="text-xs font-bold text-slate-800 truncate" title={item.name}>
                          {item.name}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
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
          <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-slate-100 p-5 bg-slate-50/60 flex flex-col justify-between overflow-y-auto max-h-[58vh]">
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

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">File Details</span>
                    <button
                      onClick={() => handleDelete(selectedItem.id)}
                      className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Name:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[160px]">{selectedItem.name}</span>
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

                {/* Direct Link & Copy */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600">Asset URL</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={selectedItem.url}
                      className="w-full text-[11px] font-mono bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 select-all"
                    />
                    <button
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
                <p className="text-xs font-semibold">Select an image to inspect details</p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200/80 flex items-center justify-end gap-2 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSelect}
                disabled={!selectedItem}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
              >
                <Check size={14} /> Insert Selected Image
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
