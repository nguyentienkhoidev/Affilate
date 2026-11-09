'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Tag,
  Hash,
  X,
  Sparkles,
  Plus,
  ExternalLink,
  Trash2,
  Check,
  Copy,
} from 'lucide-react';
import type { MediaItem } from '../_lib/data';
import { useAdminI18n } from '@/context/AdminI18nContext';
import { ROUTES } from '@/constants/routes';
import { tagService, type TagItem } from '@/services/tagService';

interface MediaAssetDetailModalProps {
  asset: MediaItem | null;
  copiedId: string | number | null;
  newTagInput: string;
  allUniqueTags: string[];
  suggestedTags: readonly string[];
  onClose: () => void;
  onCopyUrl: (url: string, id: string | number) => void;
  onDelete: (id: string | number) => void;
  onNewTagInputChange: (val: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onAddSuggestedTag: (tag: string) => void;
}

/**
 * High-res image inspection & tag management modal for media items.
 */
export default function MediaAssetDetailModal({
  asset,
  copiedId,
  newTagInput,
  allUniqueTags,
  suggestedTags,
  onClose,
  onCopyUrl,
  onDelete,
  onNewTagInputChange,
  onAddTag,
  onRemoveTag,
  onAddSuggestedTag,
}: MediaAssetDetailModalProps) {
  const { t } = useAdminI18n();
  const [centralTags, setCentralTags] = useState<TagItem[]>([]);

  useEffect(() => {
    tagService.getPublicTags().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setCentralTags(data);
      }
    }).catch(console.warn);
  }, []);

  if (!asset) return null;

  const currentTags = asset.tags || [];
  const centralNames = centralTags.map((c) => c.slug || c.name);
  const pool = Array.from(new Set([...centralNames, ...allUniqueTags]));
  const unused = pool.filter(
    (s) => !currentTags.some((t) => t.toLowerCase() === s.toLowerCase())
  );
  const matching = newTagInput.trim()
    ? unused.filter((s) => s.toLowerCase().includes(newTagInput.trim().toLowerCase()))
    : unused;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900">{asset.name}</h3>
            <p className="text-xs text-slate-500 font-mono">ID: #{asset.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Large Preview */}
        <div className="relative rounded-2xl bg-zinc-950 border border-zinc-200/80 overflow-hidden flex items-center justify-center max-h-[380px] p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset.url}
            alt={asset.name}
            className="max-h-[360px] w-auto max-w-full object-contain rounded-lg shadow-sm"
          />
        </div>

        {/* Tag Management Section */}
        <div className="bg-rose-50/40 border border-rose-200/80 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
              <Tag size={13} className="text-[#C62828]" /> {t('Manage Search Tags')} ({asset.tags?.length || 0})
            </span>
            <div className="flex items-center gap-3">
              <Link
                href={ROUTES.ADMIN.TAGS}
                target="_blank"
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
                title={t('Open Tag Management in new tab')}
              >
                <Hash size={11} />
                <span>{t('Manage Tags')}</span>
                <ExternalLink size={10} />
              </Link>
              <span className="text-[11px] text-zinc-400">{t('Click "x" to remove')}</span>
            </div>
          </div>

          {/* Tag Pills */}
          <div className="flex flex-wrap gap-1.5">
            {asset.tags && asset.tags.length > 0 ? (
              asset.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-[#C62828] border border-rose-200 shadow-2xs"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveTag(tag)}
                    className="text-zinc-400 hover:text-rose-600 cursor-pointer ml-1"
                    title={`${t('Remove tag')} #${tag}`}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-xs text-zinc-400 italic">{t('No tags assigned yet')}</span>
            )}
          </div>

          {/* Quick Add Tag Bar */}
          <div className="flex items-center gap-2 pt-1 border-t border-rose-200/60">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => onNewTagInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAddTag();
                }
              }}
              placeholder={t('Enter a new tag for this image...')}
              className="flex-1 text-xs px-3 py-1.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-[#C62828] text-zinc-800"
            />
            <button
              type="button"
              onClick={onAddTag}
              disabled={!newTagInput.trim()}
              className="h-8 px-3.5 bg-[#C62828] hover:bg-[#B71C1C] disabled:bg-zinc-200 disabled:text-zinc-400 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
            >
              {t('+ Add Tag')}
            </button>
          </div>

          {/* Tag Suggestions from Central Hub */}
          {matching.length > 0 && (
            <div className="pt-2 border-t border-rose-200/40 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500">
                <span className="flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-500" />
                  <span>{t('Centralized tags (click to quick-add):')}</span>
                </span>
                <span className="text-[10px] text-zinc-400">
                  {matching.length} {t('available')}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto">
                {matching.map((sug) => {
                  const matchedEntity = centralTags.find(
                    (c) => c.slug?.toLowerCase() === sug.toLowerCase() || c.name?.toLowerCase() === sug.toLowerCase()
                  );
                  const color = matchedEntity?.color || '#6366f1';
                  return (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => onAddSuggestedTag(sug)}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 shadow-2xs hover:scale-105"
                      style={{
                        backgroundColor: `${color}15`,
                        color: color,
                        border: `1px solid ${color}35`,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                      #{sug}
                      <Plus size={10} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Technical Metadata Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80 text-xs">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">{t('Dimensions')}</span>
            <span className="font-bold text-zinc-800 font-mono">
              {asset.dimensions === 'Optimized' ? t('Optimized') : asset.dimensions}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">{t('File Size')}</span>
            <span className="font-bold text-zinc-800 font-mono">{asset.size}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">{t('Format')}</span>
            <span className="font-bold text-indigo-700 uppercase">{asset.format}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">{t('Uploaded')}</span>
            <span className="font-bold text-zinc-800">{asset.createdAt}</span>
          </div>
        </div>

        {/* Direct CDN URL Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700">{t('Public / CDN URL')}</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={asset.url}
              className="w-full text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onCopyUrl(asset.url, asset.id)}
              className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
            >
              {copiedId === asset.id ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedId === asset.id ? t('Copied!') : t('Copy Link')}</span>
            </button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <a
            href={asset.url}
            target="_blank"
            rel="noreferrer"
            className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 border border-zinc-200 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <ExternalLink size={14} /> {t('Open Original')}
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDelete(asset.id)}
              className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <Trash2 size={14} /> {t('Delete Image')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 inline-flex items-center justify-center text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0"
            >
              {t('Close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
