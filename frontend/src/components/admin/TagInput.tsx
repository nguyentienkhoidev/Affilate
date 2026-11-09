'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Tag, Plus, X, Sparkles, AlertCircle, ExternalLink, Hash, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { tagService, type TagItem } from '@/services/tagService';
import { useAdminI18n } from '@/context/AdminI18nContext';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  required?: boolean;
  label?: string;
  placeholder?: string;
  helperText?: string;
}

export default function TagInput({
  tags,
  onChange,
  required = false,
  label = 'Taxonomy Tags',
  placeholder = 'Type a tag name and press Enter (e.g., tech, apple, deals...)',
  helperText = 'Centralized tags help connect this item with reviews, stores, offers, and media.',
}: TagInputProps) {
  const { t } = useAdminI18n();
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [centralTags, setCentralTags] = useState<TagItem[]>([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const [tagFilterQuery, setTagFilterQuery] = useState('');

  useEffect(() => {
    let active = true;
    tagService.getPublicTags().then((data) => {
      if (active && Array.isArray(data) && data.length > 0) {
        setCentralTags(data);
      }
    }).catch((err) => {
      console.warn('Failed to load central tags:', err);
    });
    return () => {
      active = false;
    };
  }, []);

  const addTag = (rawTag: string) => {
    const cleanTag = rawTag.trim().replace(/^#+/, '');
    if (!cleanTag) return;

    if (tags.some((t) => t.toLowerCase() === cleanTag.toLowerCase())) {
      setInputError(`Tag "${cleanTag}" is already attached!`);
      setTimeout(() => setInputError(null), 2500);
      return;
    }

    onChange([...tags, cleanTag]);
    setInputValue('');
    setInputError(null);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase()));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const availableCentralTags = useMemo(() => {
    const unselected = centralTags.filter(
      (ct) => !tags.some((t) => t.toLowerCase() === ct.name.toLowerCase() || t.toLowerCase() === ct.slug.toLowerCase())
    );
    if (!tagFilterQuery.trim()) return unselected;
    const q = tagFilterQuery.toLowerCase().trim();
    return unselected.filter(
      (ct) => ct.name.toLowerCase().includes(q) || ct.slug.toLowerCase().includes(q)
    );
  }, [centralTags, tags, tagFilterQuery]);

  const displayedCentralTags = showAllTags || tagFilterQuery.trim()
    ? availableCentralTags
    : availableCentralTags.slice(0, 20);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-rose-600" />
          <span>{label}</span>
          {required && <span className="text-rose-500">*</span>}
        </label>
        <Link
          href={ROUTES.ADMIN.TAGS}
          target="_blank"
          className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 hover:underline"
        >
          <span>{t('Manage All Tags')}</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Input container */}
      <div className="min-h-[46px] p-2 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 rounded-xl focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-500 transition-all flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => {
          const matchedMeta = centralTags.find(
            (ct) => ct.name.toLowerCase() === tag.toLowerCase() || ct.slug.toLowerCase() === tag.toLowerCase()
          );
          const colorDot = matchedMeta?.color || '#6366f1';

          return (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded-lg text-xs font-semibold shadow-2xs group animate-fadeIn"
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: colorDot }} />
              <span>#{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                aria-label={`Remove tag ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) {
              addTag(inputValue);
            }
          }}
          placeholder={tags.length === 0 ? placeholder : 'Add more tags...'}
          className="flex-1 min-w-[160px] bg-transparent border-none text-xs text-slate-900 dark:text-zinc-100 focus:outline-hidden placeholder:text-slate-400 dark:placeholder:text-zinc-500 py-1 px-1"
        />
      </div>

      {/* Error message */}
      {inputError && (
        <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{inputError}</span>
        </div>
      )}

      {/* Suggested Central Tags */}
      {availableCentralTags.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-bold text-slate-500 dark:text-zinc-400">
            <span className="uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Suggested Central Tags:</span>
            </span>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
              <span>{availableCentralTags.length} available</span>
              {availableCentralTags.length > 20 && !tagFilterQuery && (
                <button
                  type="button"
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="text-rose-600 dark:text-rose-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  {showAllTags ? (
                    <>
                      <span>Show less</span>
                      <ChevronUp size={11} />
                    </>
                  ) : (
                    <>
                      <span>View all ({availableCentralTags.length})</span>
                      <ChevronDown size={11} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Quick filter for central tags */}
          {availableCentralTags.length > 15 && (
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={tagFilterQuery}
                onChange={(e) => setTagFilterQuery(e.target.value)}
                placeholder="Search central tags..."
                className="w-full text-[11px] pl-7 pr-6 py-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              {tagFilterQuery && (
                <button
                  type="button"
                  onClick={() => setTagFilterQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          )}

          <div className={`flex flex-wrap gap-1.5 ${showAllTags || tagFilterQuery ? 'max-h-48 overflow-y-auto p-1.5 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700/80 rounded-xl' : ''}`}>
            {displayedCentralTags.map((ct) => (
              <button
                type="button"
                key={ct.id}
                onClick={() => addTag(ct.name)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:border-rose-400 dark:hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ct.color || '#6366f1' }} />
                <span>#{ct.name}</span>
                <Plus className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Helper text */}
      {helperText && (
        <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
          {helperText}
        </p>
      )}
    </div>
  );
}

