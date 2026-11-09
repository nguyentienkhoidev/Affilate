'use client';

import { Tag, X, Loader2, Check } from 'lucide-react';
import MediaTagInput from '@/components/admin/MediaTagInput';
import { useAdminI18n } from '@/context/AdminI18nContext';

interface MediaUploadStagedModalProps {
  isOpen: boolean;
  stagedFile: File | null;
  stagedPreview: string;
  stagedTags: string[];
  uploadFolder: 'stores' | 'articles' | 'banners' | 'icons';
  uploading: boolean;
  onClose: () => void;
  onTagsChange: (tags: string[]) => void;
  onFolderChange: (folder: 'stores' | 'articles' | 'banners' | 'icons') => void;
  onConfirmUpload: () => void;
}

/**
 * Modal to enforce mandatory tags and choose target folder when staging a file upload.
 */
export default function MediaUploadStagedModal({
  isOpen,
  stagedFile,
  stagedPreview,
  stagedTags,
  uploadFolder,
  uploading,
  onClose,
  onTagsChange,
  onFolderChange,
  onConfirmUpload,
}: MediaUploadStagedModalProps) {
  const { t } = useAdminI18n();

  if (!isOpen || !stagedFile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#C62828]">
              <Tag size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">{t('Tag Uploaded Image')}</h3>
              <p className="text-[11px] text-slate-400">
                {t('Tags are required for fast indexing and reuse across the CMS.')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Preview & File Info */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stagedPreview} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-1 overflow-hidden flex-1">
            <p className="text-xs font-bold text-slate-800 truncate">{stagedFile.name}</p>
            <p className="text-[11px] text-slate-400 font-mono">
              {Math.round(stagedFile.size / 1024)} KB • {stagedFile.name.split('.').pop()?.toUpperCase()}
            </p>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-bold text-slate-500">{t('Folder:')}</span>
              <select
                value={uploadFolder}
                onChange={(e) =>
                  onFolderChange(e.target.value as 'stores' | 'articles' | 'banners' | 'icons')
                }
                className="text-[11px] font-bold bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="articles">{t('Articles (articles)')}</option>
                <option value="stores">{t('Stores (stores)')}</option>
                <option value="banners">{t('Banners (banners)')}</option>
                <option value="icons">{t('Icons / Logos (icons)')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mandatory Tag Input */}
        <MediaTagInput
          tags={stagedTags}
          onChange={onTagsChange}
          required={true}
          label="Classification Tags (Minimum 1 required)"
          placeholder="Type a tag and press Enter (e.g. review, tech, m3...)"
          helperText="Tags enable instant filtering and search in the Media Library."
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            {t('Cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirmUpload}
            disabled={stagedTags.length === 0 || uploading}
            className="px-5 py-2.5 bg-[#C62828] hover:bg-[#B71C1C] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> {t('Optimizing & saving...')}
              </>
            ) : (
              <>
                <Check size={14} /> {t('Complete Upload & Save')} ({stagedTags.length} {stagedTags.length === 1 ? t('tag') : t('tags')})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
