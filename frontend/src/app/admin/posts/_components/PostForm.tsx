'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Edit2,
  Eye,
  Clock,
  Calendar,
  CalendarClock,
  ChevronRight,
  ShieldCheck,
  Star,
  FileText,
  CheckCircle2,
  ListTree,
  Trash2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import RichTextEditor, { extractTocFromHtml, type ArticleTocItem } from '@/components/admin/RichTextEditor';
import AdminFormPage, {
  FormLoading,
  FormNotFound,
  FormSection,
  inputClass,
  labelClass,
} from '@/components/admin/AdminFormPage';
import { ROUTES } from '@/constants/routes';
import { useAdminCollection } from '@/lib/admin/useAdminCollection';
import {
  POSTS_STORE_KEY,
  DEFAULT_ARTICLES,
  CLIENT_CATEGORIES,
  type AdminArticle,
} from '../_lib/data';

interface PostFormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  authorName: string;
  authorRole: string;
  readTime: string;
  rating: string;
  status: AdminArticle['status'];
  publishedAt: string;
  scheduledAt: string;
  imageUrl: string;
  featured: boolean;
  tags: string;
}

const FORM_ID = 'post-form';

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getDefaultScheduledTime(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = tomorrow.getFullYear();
  const mm = pad(tomorrow.getMonth() + 1);
  const dd = pad(tomorrow.getDate());
  const hh = pad(tomorrow.getHours());
  const min = pad(tomorrow.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export default function PostForm({ id }: { id?: string }) {
  const { hydrated, getById } = useAdminCollection<AdminArticle>(POSTS_STORE_KEY, DEFAULT_ARTICLES);
  const isEdit = id !== undefined;
  const existing = getById(id);

  if (isEdit && !hydrated) return <FormLoading />;
  if (isEdit && !existing) return <FormNotFound backHref={ROUTES.ADMIN.POSTS} entity="Article" />;

  const defaultArticle = DEFAULT_ARTICLES.find((a) => a.id === existing?.id || a.slug === existing?.slug);
  const hasSubstantialContent = (c?: string) => {
    if (!c) return false;
    const stripped = c.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    return stripped.length > 25 || c.includes('<section') || c.includes('<img');
  };
  const resolvedContent = hasSubstantialContent(existing?.content)
    ? (existing?.content as string)
    : (defaultArticle?.content || existing?.content || '');

  const initial: PostFormState = existing
    ? {
        title: existing.title,
        slug: existing.slug,
        excerpt: existing.excerpt,
        content: resolvedContent,
        category: existing.category,
        authorName: existing.author.name,
        authorRole: existing.author.role,
        readTime: existing.readTime,
        rating: existing.rating,
        status: existing.status,
        publishedAt: existing.publishedAt || 'Today',
        scheduledAt: existing.scheduledAt || getDefaultScheduledTime(),
        imageUrl: existing.imageUrl,
        featured: existing.featured,
        tags: existing.tags.join(', '),
      }
    : {
        title: '',
        slug: '',
        excerpt: '',
        content:
          '<h2>Introduction & Testing Methodology</h2><p>Provide a detailed introduction to the product review or news analysis...</p>',
        category: 'Reviews',
        authorName: 'Marcus Vance',
        authorRole: 'Senior Hardware Reviewer',
        readTime: '5 min read',
        rating: '4.8',
        status: 'PUBLISHED',
        publishedAt: 'Today',
        scheduledAt: getDefaultScheduledTime(),
        imageUrl:
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        featured: false,
        tags: 'Tech, Hardware, Lab Test',
      };

  return <PostFormInner key={id ?? 'new'} existing={existing} initial={initial} />;
}

function PostFormInner({ existing, initial }: { existing?: AdminArticle; initial: PostFormState }) {
  const router = useRouter();
  const { create, update } = useAdminCollection<AdminArticle>(POSTS_STORE_KEY, DEFAULT_ARTICLES);
  const [form, setForm] = useState<PostFormState>(initial);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const tocItems = useMemo(() => extractTocFromHtml(form.content), [form.content]);

  // Jump to section in editor from right sidebar TOC
  const handleJumpToSection = (label: string, index: number) => {
    const editorEl = document.querySelector('[contenteditable="true"]');
    if (editorEl) {
      const headings = Array.from(editorEl.querySelectorAll('h2, h3, h4'));
      const target = headings.find((h) => h.textContent?.trim() === label) || headings[index];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('ring-2', 'ring-[#C62828]', 'bg-rose-50/70', 'transition-all', 'duration-500');
        setTimeout(() => {
          target.classList.remove('ring-2', 'ring-[#C62828]', 'bg-rose-50/70', 'transition-all', 'duration-500');
        }, 1800);
        return;
      }
      editorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Delete a section directly from the TOC outline
  const handleDeleteSection = (label: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!form.content) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(form.content, 'text/html');
    const headings = Array.from(doc.querySelectorAll('h2, h3, h4'));
    const target = headings.find((h) => h.textContent?.trim() === label) || headings[index];
    if (target) {
      const section = target.closest('section, .editorial-box, .article-component, figure') || target;
      section.remove();
      setForm((prev) => ({ ...prev, content: doc.body.innerHTML }));
    }
  };

  // Move section up
  const handleMoveSectionUp = (label: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!form.content) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(form.content, 'text/html');
    const headings = Array.from(doc.querySelectorAll('h2, h3, h4'));
    const target = headings.find((h) => h.textContent?.trim() === label) || headings[index];
    if (target) {
      const section = target.closest('section, .editorial-box, .article-component, figure') || target;
      const prev = section.previousElementSibling;
      if (prev) {
        section.parentElement?.insertBefore(section, prev);
        setForm((prev) => ({ ...prev, content: doc.body.innerHTML }));
      }
    }
  };

  // Move section down
  const handleMoveSectionDown = (label: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!form.content) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(form.content, 'text/html');
    const headings = Array.from(doc.querySelectorAll('h2, h3, h4'));
    const target = headings.find((h) => h.textContent?.trim() === label) || headings[index];
    if (target) {
      const section = target.closest('section, .editorial-box, .article-component, figure') || target;
      const next = section.nextElementSibling;
      if (next) {
        section.parentElement?.insertBefore(next, section);
        setForm((prev) => ({ ...prev, content: doc.body.innerHTML }));
      }
    }
  };

  const setQuickSchedule = (hoursAhead: number) => {
    const d = new Date();
    d.setHours(d.getHours() + hoursAhead);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const val = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setForm((prev) => ({ ...prev, scheduledAt: val }));
  };

  const setTomorrowSchedule = (hour: number) => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(hour, 0, 0, 0);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const val = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setForm((prev) => ({ ...prev, scheduledAt: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = form.slug.trim() || generateSlug(form.title);
    const parsedTags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    let finalPublishedAt = form.publishedAt;
    if (form.status === 'SCHEDULED') {
      const scheduleDate = new Date(form.scheduledAt);
      const formattedDate = !isNaN(scheduleDate.getTime())
        ? scheduleDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : form.scheduledAt;
      finalPublishedAt = `${formattedDate} (Scheduled)`;
    } else if (form.status === 'DRAFT') {
      finalPublishedAt = 'Draft';
    } else {
      finalPublishedAt = form.publishedAt.trim() || 'Today';
    }

    if (existing) {
      update(existing.id, {
        title: form.title,
        slug: cleanSlug,
        excerpt: form.excerpt,
        content: form.content,
        category: form.category,
        author: {
          name: form.authorName,
          role: form.authorRole,
          avatar: existing.author.avatar,
        },
        readTime: form.readTime,
        rating: form.rating,
        status: form.status,
        publishedAt: finalPublishedAt,
        scheduledAt: form.status === 'SCHEDULED' ? form.scheduledAt : undefined,
        imageUrl: form.imageUrl,
        featured: form.featured,
        tags: parsedTags,
      });
    } else {
      create({
        id: `art-${Date.now()}`,
        title: form.title,
        slug: cleanSlug,
        excerpt: form.excerpt,
        content: form.content,
        category: form.category,
        author: {
          name: form.authorName,
          role: form.authorRole,
          avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        },
        publishedAt: finalPublishedAt,
        scheduledAt: form.status === 'SCHEDULED' ? form.scheduledAt : undefined,
        readTime: form.readTime,
        imageUrl: form.imageUrl,
        featured: form.featured,
        tags: parsedTags,
        rating: form.rating,
        status: form.status,
        views: 0,
      });
    }
    router.push(ROUTES.ADMIN.POSTS);
  };

  const submitLabel =
    form.status === 'SCHEDULED'
      ? existing
        ? 'Update Schedule'
        : 'Schedule Article'
      : form.status === 'DRAFT'
      ? 'Save as Draft'
      : existing
      ? 'Save Article'
      : 'Publish Live';

  const headerActions = (
    <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-xl text-xs font-bold mr-2">
      <button
        type="button"
        onClick={() => setActiveTab('edit')}
        className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
          activeTab === 'edit'
            ? 'bg-white text-slate-900 shadow-2xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Edit2 size={13} />
        <span>Editor</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('preview')}
        className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
          activeTab === 'preview'
            ? 'bg-[#C62828] text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Eye size={13} />
        <span>Live Preview</span>
      </button>
    </div>
  );

  return (
    <AdminFormPage
      title={existing ? `Edit Article: ${existing.title}` : 'Write New Article & Review'}
      description="Craft in-depth product reviews, buyer guides, and industry news with live preview."
      backHref={ROUTES.ADMIN.POSTS}
      backLabel="Back to articles"
      formId={FORM_ID}
      submitLabel={submitLabel}
      headerActions={headerActions}
      width="full"
    >
      {activeTab === 'edit' ? (
        <form id={FORM_ID} onSubmit={handleSave} className="space-y-6">
          {/* TOP ROW: HEADLINE & SUMMARY + PUBLISHING SETTINGS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Cols: Headline & Excerpt */}
            <div className="lg:col-span-2">
              <FormSection title="Headline & Summary">
                <div className="space-y-1">
                  <label className={labelClass}>Headline / Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setForm({
                        ...form,
                        title: newTitle,
                        slug: existing ? form.slug : generateSlug(newTitle),
                      });
                    }}
                    placeholder="e.g. Nilight 20-Inch Curved LED Light Bar: 500-Mile Extreme Off-Road Test"
                    className={`${inputClass} font-semibold`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`${labelClass} flex items-center justify-between`}>
                    <span>Article URL Slug *</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Preview: /post/{form.slug || 'your-slug'}
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="nilight-led-light-bar-review"
                    className={`${inputClass} font-mono`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Summary / Lead Excerpt *</label>
                  <textarea
                    rows={3}
                    required
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    placeholder="Concise 1-2 sentence executive summary displayed on cards and under headline..."
                    className={inputClass}
                  />
                </div>
              </FormSection>
            </div>

            {/* Right 1 Col: Publishing & Schedule */}
            <div className="lg:col-span-1">
              <FormSection
                title="Publishing & Scheduled Release"
                description="Control article visibility, schedule publication time, and placement"
              >
                {/* 3 Status Cards */}
                <div className="space-y-1.5">
                  <label className={labelClass}>Publication Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, status: 'PUBLISHED' })}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                        form.status === 'PUBLISHED'
                          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20 shadow-2xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className={form.status === 'PUBLISHED' ? 'text-emerald-600' : 'text-slate-400'} />
                        <span className="text-xs font-bold">Publish Live</span>
                      </div>
                      <span className="text-[10px] text-slate-400 leading-tight">Live immediately</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm({ ...form, status: 'SCHEDULED' })}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                        form.status === 'SCHEDULED'
                          ? 'border-indigo-500 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500/20 shadow-2xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <CalendarClock size={14} className={form.status === 'SCHEDULED' ? 'text-indigo-600' : 'text-slate-400'} />
                        <span className="text-xs font-bold">Schedule</span>
                      </div>
                      <span className="text-[10px] text-slate-400 leading-tight">Set time & date</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm({ ...form, status: 'DRAFT' })}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                        form.status === 'DRAFT'
                          ? 'border-amber-500 bg-amber-50/70 text-amber-950 ring-2 ring-amber-500/20 shadow-2xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <FileText size={14} className={form.status === 'DRAFT' ? 'text-amber-600' : 'text-slate-400'} />
                        <span className="text-xs font-bold">Draft</span>
                      </div>
                      <span className="text-[10px] text-slate-400 leading-tight">Internal review</span>
                    </button>
                  </div>
                </div>

                {/* If SCHEDULED: Scheduled Publishing Date & Time configuration */}
                {form.status === 'SCHEDULED' && (
                  <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-3 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                          <CalendarClock size={14} className="text-indigo-600" />
                          <span>Thời gian Public (Scheduled Time) *</span>
                        </label>
                        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                          GMT+7 VN
                        </span>
                      </div>
                      <input
                        type="datetime-local"
                        required
                        value={form.scheduledAt}
                        onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                        className="w-full text-xs bg-white border border-indigo-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 shadow-2xs cursor-pointer"
                      />
                    </div>

                    {/* Quick Presets */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block">
                        Quick Presets
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setQuickSchedule(1)}
                          className="text-[11px] font-medium bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer shadow-2xs"
                        >
                          +1 Giờ
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickSchedule(3)}
                          className="text-[11px] font-medium bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer shadow-2xs"
                        >
                          +3 Giờ
                        </button>
                        <button
                          type="button"
                          onClick={() => setTomorrowSchedule(9)}
                          className="text-[11px] font-medium bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer shadow-2xs"
                        >
                          Sáng mai (09:00)
                        </button>
                        <button
                          type="button"
                          onClick={() => setTomorrowSchedule(20)}
                          className="text-[11px] font-medium bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer shadow-2xs"
                        >
                          Tối mai (20:00)
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-indigo-700/80 leading-relaxed">
                      💡 Bài viết sẽ được tự động xuất bản công khai lên trang chủ và các chuyên mục vào đúng thời gian đã lên lịch.
                    </p>
                  </div>
                )}

                {/* If PUBLISHED: Custom Published Date timestamp */}
                {form.status === 'PUBLISHED' && (
                  <div className="space-y-1 pt-1">
                    <label className={`${labelClass} flex items-center justify-between`}>
                      <span>Ngày hiển thị công khai (Public Date)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Mặc định: Today</span>
                    </label>
                    <input
                      type="text"
                      value={form.publishedAt}
                      onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                      placeholder="e.g. October 24, 2026 or Today"
                      className={inputClass}
                    />
                  </div>
                )}

                {/* Hero / Spotlight Toggle */}
                <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-slate-100">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="rounded border-slate-300 text-[#C62828] focus:ring-[#C62828]"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Feature on Homepage Hero / Spotlight
                  </span>
                </label>
              </FormSection>
            </div>
          </div>

          {/* MIDDLE FULL-WIDTH ROW: ARTICLE BODY CONTENT AT 100% WIDTH */}
          <div className="w-full">
            <FormSection
              title="Article Body Content"
              description="Không gian soạn thảo toàn màn hình 100% • Hỗ trợ Tiêu đề, Hộp Deal, Bảng Pros/Cons, Media & Tùy biến Style"
              headerRight={
                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl shadow-2xs">
                  Không gian 100% Full-Width
                </span>
              }
            >
              <RichTextEditor
                value={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
                minHeight="560px"
              />
            </FormSection>
          </div>

          {/* BOTTOM METADATA GRID: TOC, CATEGORY & MEDIA, AUTHOR & BENCHMARKS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {/* Live Table of Contents (Mục Lục) */}
            <FormSection
              title="Table of Contents (Mục Lục)"
              description="Dàn ý nội dung bài viết thời gian thực — click để nhảy nhanh đến vị trí trong bài"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ListTree size={13} className="text-[#C62828]" />
                    <span>Cấu trúc đề mục</span>
                  </span>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                    {tocItems.length} mục
                  </span>
                </div>

                {tocItems.length === 0 ? (
                  <div className="p-3.5 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center space-y-1">
                    <p className="text-xs font-semibold text-slate-600">Chưa có tiêu đề bài viết</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Thêm tiêu đề H2 hoặc bấm <strong>+ Thêm Component</strong> để tự động hiển thị mục lục tại đây.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {tocItems.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleJumpToSection(item.label, idx)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs transition flex items-center justify-between group cursor-pointer border ${
                          item.level === 'h2'
                            ? 'bg-white hover:bg-rose-50/70 border-slate-200/80 text-slate-800 font-bold shadow-2xs'
                            : 'bg-slate-50/70 hover:bg-slate-100 border-transparent text-slate-600 font-medium pl-4 text-[11px]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              item.level === 'h2' ? 'bg-[#C62828]' : 'bg-slate-400'
                            }`}
                          />
                          <span className="truncate group-hover:text-[#C62828] transition">
                            {item.label}
                          </span>
                        </div>

                        {/* Quick Actions: Move Up, Move Down, Delete Section */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleMoveSectionUp(item.label, idx, e)}
                            className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer"
                            title="Di chuyển lên"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleMoveSectionDown(item.label, idx, e)}
                            className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer"
                            title="Di chuyển xuống"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSection(item.label, idx, e)}
                            className="p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                            title="Xóa đề mục này"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormSection>

            {/* Category & Media */}
            <FormSection title="Category & Media">
              <div className="space-y-1">
                <label className={labelClass}>Editorial Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={inputClass}
                >
                  {CLIENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 pt-2">
                <ImageUpload
                  value={form.imageUrl}
                  onChange={(url) => setForm({ ...form, imageUrl: url })}
                  folder="article-covers"
                  label="Featured Cover Image"
                  aspectRatio="video"
                />
              </div>
            </FormSection>

            {/* Author & Benchmarks */}
            <FormSection title="Author & Benchmarks">
              <div className="space-y-1">
                <label className={labelClass}>Author Name</label>
                <input
                  type="text"
                  value={form.authorName}
                  onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Author Role / Beat</label>
                <input
                  type="text"
                  value={form.authorRole}
                  onChange={(e) => setForm({ ...form, authorRole: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className={labelClass}>Lab Score (0 - 5.0)</label>
                  <input
                    type="text"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    placeholder="4.8"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Read Time</label>
                  <input
                    type="text"
                    value={form.readTime}
                    onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                    placeholder="6 min read"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <label className={labelClass}>Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="Tech, LED, Review, 2026"
                  className={inputClass}
                />
              </div>
            </FormSection>
          </div>
        </form>
      ) : (
        /* LIVE PREVIEW TAB */
        <div className="bg-[#F8F8F6] border border-slate-200 rounded-2xl p-4 sm:p-8 space-y-6">
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-amber-700 shrink-0" />
              <span>
                <strong>Live Reader Mode:</strong> Simulating reader experience on the public portal.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className="bg-amber-200/80 hover:bg-amber-300 font-bold px-3 py-1 rounded-lg transition cursor-pointer"
            >
              Back to Edit
            </button>
          </div>

          <div className="max-w-5xl mx-auto space-y-8">
            <nav className="flex items-center gap-2 text-xs text-slate-500">
              <span>Home</span>
              <ChevronRight size={12} />
              <span>{form.category}</span>
              <ChevronRight size={12} />
              <span className="text-slate-900 font-semibold truncate max-w-sm">
                {form.title || 'Untitled Article'}
              </span>
            </nav>

            <div className="bg-white border border-[#E7E7E5] rounded-2xl p-6 sm:p-10 shadow-2xs space-y-5">
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <span className="bg-[#C62828] text-white font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-sm shadow-2xs">
                  {form.category}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 flex items-center gap-1 font-semibold">
                  <Clock size={13} /> {form.readTime}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar size={13} /> Today
                </span>
              </div>

              <h1 className="font-editorial text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
                {form.title || 'Your Article Headline Will Appear Here'}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
                {form.excerpt || 'Write an executive summary of this review or investigative dispatch...'}
              </p>

              <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border border-slate-300 relative shrink-0 flex items-center justify-center font-bold text-slate-600">
                    {form.authorName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm">{form.authorName}</div>
                    <div className="text-xs text-slate-500">{form.authorRole} • Bargorya Staff</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-lg">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Verified Testing & Lab Benchmarks</span>
                </div>
              </div>
            </div>

            {form.imageUrl && (
              <div className="relative aspect-[21/9] rounded-2xl overflow-hidden shadow-xs border border-slate-200 bg-slate-900">
                <Image
                  src={form.imageUrl}
                  alt={form.title}
                  fill
                  className="object-cover"
                  unoptimized={form.imageUrl.startsWith('data:') || form.imageUrl.startsWith('/uploads/')}
                />
              </div>
            )}

            <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#EAB308]">
                  Independent Evaluation
                </span>
                <h4 className="text-base font-bold text-white">Bargorya Lab Score & Verdict</h4>
                <p className="text-xs text-slate-400">
                  Based on durability benchmarks, pricing accuracy, and hands-on testing.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl">
                <Star size={20} className="fill-amber-400 text-amber-400" />
                <span className="text-2xl font-black text-white">{form.rating}</span>
                <span className="text-xs text-slate-400">/ 5.0</span>
              </div>
            </div>

            <div className="bg-white border border-[#E7E7E5] rounded-2xl p-6 sm:p-10 shadow-2xs space-y-6">
              {tocItems.length > 0 && (
                <nav
                  aria-label="Mục lục bài viết"
                  className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50 via-white to-slate-50/60 p-5 sm:p-6 shadow-2xs space-y-4"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/70">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 text-[#C62828] flex items-center justify-center shrink-0 shadow-2xs">
                        <ListTree size={16} />
                      </div>
                      <div>
                        <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          Mục Lục Bài Viết
                          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full normal-case">
                            {tocItems.length} đề mục
                          </span>
                        </h2>
                        <p className="text-[11px] text-slate-400">Chọn đề mục để chuyển nhanh đến nội dung bài đánh giá</p>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                      <span>Click để cuộn nhanh</span>
                      <ChevronRight size={13} />
                    </div>
                  </div>

                  {/* 1 Item Per Row (Mỗi cái 1 hàng) Vertical Directory */}
                  <div className="flex flex-col space-y-2">
                    {tocItems.map((item, idx) => {
                      const isH2 = item.level === 'h2';
                      const numMatch = item.label.match(/^(\d+)[\.\s]/);
                      const sectionNum = numMatch
                        ? numMatch[1].padStart(2, '0')
                        : (idx + 1).toString().padStart(2, '0');
                      const displayLabel = numMatch
                        ? item.label.replace(/^\d+[\.\s]+/, '')
                        : item.label;

                      if (isH2) {
                        return (
                          <a
                            key={idx}
                            href={`#${item.id}`}
                            className="group flex items-center justify-between p-3 sm:px-4 sm:py-3 rounded-xl bg-white hover:bg-rose-50/70 border border-slate-200/90 hover:border-rose-300 shadow-2xs transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0 pr-2">
                              <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-black flex items-center justify-center shrink-0 border border-slate-200/80 group-hover:bg-[#C62828] group-hover:text-white group-hover:border-[#C62828] transition-colors shadow-2xs">
                                {sectionNum}
                              </span>
                              <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#C62828] transition-colors truncate">
                                {displayLabel}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 group-hover:bg-rose-100 group-hover:text-[#C62828] transition-colors">
                                Phần {sectionNum}
                              </span>
                              <ChevronRight
                                size={14}
                                className="text-slate-300 group-hover:text-[#C62828] group-hover:translate-x-1 transition-all"
                              />
                            </div>
                          </a>
                        );
                      }

                      // Sub-item (H3/H4) with clean indent
                      return (
                        <a
                          key={idx}
                          href={`#${item.id}`}
                          className="group flex items-center justify-between p-2 sm:px-4 rounded-xl ml-4 sm:ml-8 bg-slate-50/60 hover:bg-slate-100/90 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-[#C62828] shrink-0 transition-colors" />
                            <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors truncate">
                              {item.label}
                            </span>
                          </div>

                          <ChevronRight
                            size={12}
                            className="text-slate-300 group-hover:text-slate-600 transition shrink-0"
                          />
                        </a>
                      );
                    })}
                  </div>
                </nav>
              )}

              <div className="w-full">
                <div
                  className="prose prose-slate max-w-none text-slate-800 leading-relaxed font-sans prose-headings:font-bold prose-h2:text-2xl prose-h2:font-editorial prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-xl prose-h3:mt-5 prose-h3:mb-2 prose-p:my-3 prose-p:leading-relaxed prose-a:text-[#C62828] prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-[#C62828] prose-blockquote:italic prose-blockquote:pl-4 prose-blockquote:my-4 prose-img:rounded-xl prose-ul:list-disc prose-ol:list-decimal"
                  dangerouslySetInnerHTML={{ __html: form.content }}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-bold text-slate-500">Related Tags:</span>
              {form.tags.split(',').map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-white border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-lg"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminFormPage>
  );
}
