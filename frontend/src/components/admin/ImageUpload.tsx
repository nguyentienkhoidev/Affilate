'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  Check,
  Link as LinkIcon,
  Loader2,
  RefreshCw,
  Copy,
  ExternalLink,
  Layers,
} from 'lucide-react';
import MediaLibraryModal from './MediaLibraryModal';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  description?: string;
  aspectRatio?: 'video' | 'square' | 'banner';
}

export default function ImageUpload({
  value = '',
  onChange,
  folder = 'articles',
  label = 'Featured Image / Cover',
  description = 'PNG, JPG, WEBP or GIF (Max 10MB). High resolution recommended.',
  aspectRatio = 'video',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectClass = {
    video: 'aspect-[16/9]',
    square: 'aspect-square max-w-[240px]',
    banner: 'aspect-[21/9]',
  }[aspectRatio];

  const handleUploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP, GIF)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      setUploadProgress(45);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(80);

      if (!response.ok) {
        throw new Error('Upload to local server failed, falling back to data URL');
      }

      const data = await response.json();
      if (data.url) {
        onChange(data.url);
        setIsUploading(false);
        setUploadProgress(100);
        return;
      }
      throw new Error('No URL returned from server');
    } catch (err: any) {
      console.warn('Fallback to browser FileReader due to upload error:', err);
      // Fallback: Read as Base64 Data URL so user is never blocked!
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onChange(result);
        }
        setIsUploading(false);
        setUploadProgress(100);
      };
      reader.onerror = () => {
        setError('Failed to process image');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setError(null);
    }
  };

  const handleCopyUrl = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
          <ImageIcon size={14} className="text-[#C62828]" />
          <span>{label}</span>
        </label>

        {/* Switch mode */}
        <div className="inline-flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 shrink-0">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`h-7 px-2.5 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition cursor-pointer ${mode === 'upload'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
              }`}
          >
            <UploadCloud size={13} className={mode === 'upload' ? 'text-[#C62828]' : 'text-slate-400'} />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`h-7 px-2.5 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition cursor-pointer ${mode === 'url'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
              }`}
          >
            <LinkIcon size={13} className={mode === 'url' ? 'text-[#C62828]' : 'text-slate-400'} />
            <span>Image Link</span>
          </button>
          <button
            type="button"
            onClick={() => setMediaModalOpen(true)}
            className="h-7 px-2.5 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition cursor-pointer text-indigo-700 bg-indigo-50/90 hover:bg-indigo-100/80 border border-indigo-200/60 shadow-2xs"
            title="Open Digital Media Library"
          >
            <Layers size={13} className="text-indigo-600" />
            <span>Library</span>
          </button>
        </div>
      </div>

      {/* When Value Exists: Show Preview */}
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
          <div className={`relative w-full ${aspectClass}`}>
            <Image
              src={value}
              alt="Uploaded Preview"
              fill
              className="object-cover transition duration-300 group-hover:scale-102"
              unoptimized={value.startsWith('data:') || value.startsWith('/uploads/')}
            />
          </div>

          {/* Action overlay */}
          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-3 bg-white text-slate-900 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-100 whitespace-nowrap shrink-0 transition cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Replace</span>
            </button>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-3 bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-700 whitespace-nowrap shrink-0 transition cursor-pointer"
              title="Copy Image URL"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy URL'}</span>
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm whitespace-nowrap shrink-0 transition cursor-pointer"
              title="Remove Image"
            >
              <X size={13} />
              <span>Remove</span>
            </button>
          </div>

          <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-md truncate font-mono">
            {value}
          </div>
        </div>
      ) : (
        /* When No Value: Show Upload Box or URL Input */
        <div className="space-y-2">
          {mode === 'upload' ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragActive
                  ? 'border-[#C62828] bg-rose-50/50 scale-[0.99]'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-50'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {isUploading ? (
                <div className="py-4 space-y-3">
                  <Loader2 size={28} className="mx-auto text-[#C62828] animate-spin" />
                  <p className="text-xs font-bold text-slate-700">Uploading image to server...</p>
                  <div className="w-48 mx-auto bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#C62828] h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-2">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-2xs flex items-center justify-center mx-auto text-[#C62828]">
                    <UploadCloud size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      Click to upload image{' '}
                    </span>
                    <span className="text-xs text-slate-500">or drag & drop</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{description}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/... or image direct link"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  disabled={!urlInput.trim()}
                  className="h-9 px-4 bg-[#C62828] hover:bg-[#B71C1C] disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center justify-center shadow-xs"
                >
                  Set URL
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                You can paste an image URL from Unsplash, Imgur, or direct CDN link.
              </p>
            </div>
          )}

          {error && (
            <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
              <X size={12} /> {error}
            </p>
          )}
        </div>
      )}

      {/* Enterprise Media Asset Library Modal */}
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={(selectedUrl) => {
          onChange(selectedUrl);
          setError(null);
        }}
        defaultFolder={folder as any}
      />
    </div>
  );
}
