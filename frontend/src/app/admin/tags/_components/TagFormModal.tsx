'use client';

import { useState, useEffect } from 'react';
import { X, Hash, Sparkles, Check, Loader2, AlertCircle } from 'lucide-react';
import { tagService, type TagItem, type TagPayload } from '@/services/tagService';
import { useToast } from '@/context/ToastContext';
import { useAdminI18n } from '@/context/AdminI18nContext';

interface TagFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tag: TagItem | null;
  onSuccess: () => void;
}

const PRESET_COLORS = [
  { label: 'Indigo', hex: '#6366f1' },
  { label: 'Blue', hex: '#3b82f6' },
  { label: 'Sky', hex: '#0284c7' },
  { label: 'Teal', hex: '#14b8a6' },
  { label: 'Emerald', hex: '#10b981' },
  { label: 'Amber', hex: '#f59e0b' },
  { label: 'Orange', hex: '#f97316' },
  { label: 'Rose', hex: '#ef4444' },
  { label: 'Pink', hex: '#ec4899' },
  { label: 'Purple', hex: '#8b5cf6' },
  { label: 'Slate', hex: '#64748b' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default function TagFormModal({ isOpen, onClose, tag, onSuccess }: TagFormModalProps) {
  const { t } = useAdminI18n();
  const { toast } = useToast();
  const isEdit = Boolean(tag);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setErrors({});
    if (tag) {
      setName(tag.name || '');
      setSlug(tag.slug || '');
      setDescription(tag.description || '');
      setColor(tag.color || '#6366f1');
      setIsFeatured(tag.isFeatured || false);
      setIsActive(tag.isActive !== false);
      setSlugManuallyEdited(true);
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setColor('#6366f1');
      setIsFeatured(false);
      setIsActive(true);
      setSlugManuallyEdited(false);
    }
  }, [tag, isOpen]);

  const handleSlugChange = (val: string) => {
    setSlugManuallyEdited(true);
    setSlug(slugify(val));
    if (errors.slug) setErrors((prev) => ({ ...prev, slug: '' }));
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit && !slugManuallyEdited) {
      setSlug(slugify(val));
    }
    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const cleanName = name.trim();
    setSaving(true);
    try {
      const payload: TagPayload = {
        name: cleanName,
        slug: slug.trim() || slugify(cleanName),
        description: description.trim() || undefined,
        color: color.trim() || '#6366f1',
        isFeatured,
        isActive,
      };

      if (isEdit && tag) {
        await tagService.updateTag(tag.id, payload);
        toast.success(t('Tag updated successfully'));
      } else {
        await tagService.createTag(payload);
        toast.success(t('Tag created successfully'));
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      if (err?.response?.data?.errors && typeof err.response.data.errors === 'object') {
        setErrors(err.response.data.errors);
      }
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to save tag';
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
              style={{ backgroundColor: color }}
            >
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                {isEdit ? t('Edit Tag') : t('Add New Tag')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {isEdit ? `#${tag?.slug}` : t('Create a new taxonomy tag for posts & media')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form noValidate onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {/* Live Preview Pill */}
          <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Badge Preview:
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition-all"
              style={{
                backgroundColor: `${color}18`,
                color: color,
                border: `1px solid ${color}40`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              #{name.trim() || 'tag-name'}
              {isFeatured && <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500 ml-0.5" />}
            </span>
          </div>

          {/* Name & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                {t('Tag Name')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Apple Silicon"
                className={`w-full text-xs bg-slate-50 dark:bg-zinc-800/80 border rounded-xl px-3.5 py-2 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 transition ${
                  errors.name
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 focus:ring-rose-500/20 focus:border-rose-500'
                }`}
              />
              {errors.name && (
                <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                {t('Tag Slug')}
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="e.g. apple-silicon"
                className={`w-full text-xs font-mono bg-slate-50 dark:bg-zinc-800/80 border rounded-xl px-3.5 py-2 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 transition ${
                  errors.slug
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 focus:ring-rose-500/20 focus:border-rose-500'
                }`}
              />
              {errors.slug && (
                <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.slug}
                </p>
              )}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              {t('Tag Color')}
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setColor(preset.hex)}
                  title={preset.label}
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                  style={{
                    backgroundColor: preset.hex,
                    outline: color === preset.hex ? `2px solid ${preset.hex}` : 'none',
                    outlineOffset: '2px',
                  }}
                >
                  {color === preset.hex && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </button>
              ))}
              <div className="flex items-center gap-1.5 ml-1">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
                <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase">
                  {color}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              {t('Tag Description')}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description for SEO and taxonomy classification..."
              className="w-full text-xs bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition resize-none"
            />
          </div>

          {/* Toggles: Featured & Active */}
          <div className="pt-1 grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              />
              <div>
                <span className="block text-xs font-semibold text-slate-700 dark:text-zinc-200">
                  {t('Featured Tag')}
                </span>
                <span className="block text-[10px] text-slate-400 dark:text-zinc-400">
                  Highlight in filters & badges
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              />
              <div>
                <span className="block text-xs font-semibold text-slate-700 dark:text-zinc-200">
                  Active Status
                </span>
                <span className="block text-[10px] text-slate-400 dark:text-zinc-400">
                  Visible to public clients
                </span>
              </div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-md shadow-rose-600/20 transition disabled:opacity-50"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEdit ? t('Save Changes') : t('Create Tag')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

