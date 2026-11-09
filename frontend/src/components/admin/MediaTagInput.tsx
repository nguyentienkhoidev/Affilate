'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag, Plus, X, Sparkles, AlertCircle, ExternalLink, Hash } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { tagService, type TagItem } from '@/services/tagService';
import { useAdminI18n } from '@/context/AdminI18nContext';

interface MediaTagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestedTags?: string[];
  required?: boolean;
  label?: string;
  placeholder?: string;
  helperText?: string;
}

export default function MediaTagInput({
  tags,
  onChange,
  suggestedTags,
  required = true,
  label = 'Category Tags (Required)',
  placeholder = 'Type a tag or click one below (e.g., review, tech, m3...)',
  helperText = 'Centralized tags help images remain easily searchable across all editorial reviews.',
}: MediaTagInputProps) {
  const { t } = useAdminI18n();
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [centralTags, setCentralTags] = useState<TagItem[]>([]);

  useEffect(() => {
    tagService.getPublicTags().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setCentralTags(data);
      }
    }).catch((err) => {
      console.warn('Failed to load central tags:', err);
    });
  }, []);

  const addTag = (rawTag: string) => {
    const cleanTag = rawTag.trim().replace(/^#+/, '').toLowerCase();
    if (!cleanTag) return;

    if (tags.some((t) => t.toLowerCase() === cleanTag)) {
      setInputError(`Tag "${cleanTag}" already exists!`);
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

  // Merge available suggestions from centralized tags table
  const availableCentralTags = centralTags.filter(
    (c) => !tags.some((t) => t.toLowerCase() === c.slug.toLowerCase() || t.toLowerCase() === c.name.toLowerCase())
  );

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Tag size={13} className="text-[#C62828]" />
          <span>{t(label)}</span>
          {required && (
            <span className="text-[10px] font-black uppercase text-[#C62828] bg-rose-50 border border-rose-200/80 px-1.5 py-0.2 rounded">
              {t('Required')}
            </span>
          )}
        </label>
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
          <span className="text-[11px] font-semibold text-slate-400">
            {t('Added:')} <strong className="text-slate-700">{tags.length}</strong> {tags.length === 1 ? t('tag') : t('tags')}
          </span>
        </div>
      </div>

      {/* Tag Input Box */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">#</span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (inputError) setInputError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder={t(placeholder)}
              className="w-full text-xs pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <button
            type="button"
            onClick={() => addTag(inputValue)}
            disabled={!inputValue.trim()}
            className="h-8.5 px-3 bg-slate-900 hover:bg-[#C62828] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus size={13} /> {t('Add Tag')}
          </button>
        </div>

        {inputError && (
          <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
            <AlertCircle size={11} /> {inputError}
          </p>
        )}
      </div>

      {/* Selected Tags Chips */}
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50/80 border border-slate-200/80 rounded-xl min-h-[40px] items-center">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-slate-800 border border-slate-200 shadow-2xs group hover:border-[#C62828]/40 transition"
            >
              <span className="text-[#C62828] font-bold">#</span>
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer ml-0.5"
                title={`${t('Remove tag')} #${tag}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      ) : required ? (
        <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-800 flex items-center gap-2 text-xs">
          <AlertCircle size={14} className="text-amber-600 shrink-0" />
          <span>
            <strong>{t('No tags yet:')}</strong> {t('Please enter or select at least 1 tag below to categorize this image.')}
          </span>
        </div>
      ) : null}

      {/* Centralized Taxonomy Tag Suggestions */}
      {availableCentralTags.length > 0 && (
        <div className="pt-1 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <Sparkles size={11} className="text-amber-500" />
              <span>{t('Centralized tags (click to select):')}</span>
            </span>
            <span className="text-[10px] text-slate-400">
              {availableCentralTags.length} {t('available')}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1.5 bg-slate-50 border border-slate-200/60 rounded-xl">
            {availableCentralTags.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => addTag(item.slug || item.name)}
                className="px-2 py-0.5 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 shadow-2xs hover:scale-105"
                style={{
                  backgroundColor: `${item.color || '#6366f1'}15`,
                  color: item.color || '#6366f1',
                  border: `1px solid ${item.color || '#6366f1'}35`,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color || '#6366f1' }} />
                <span>#{item.name}</span>
                <Plus size={10} />
              </button>
            ))}
          </div>
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-slate-400 italic">
          {t(helperText)}
        </p>
      )}
    </div>
  );
}
