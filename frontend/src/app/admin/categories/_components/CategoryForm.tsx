'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Plus, ExternalLink, Edit2, Eye, Monitor, Tablet, Smartphone, FolderTree, RefreshCw, AlertCircle } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import AdminFormPage, {
  FormLoading,
  FormNotFound,
  FormSection,
  inputClass,
  labelClass,
} from '@/components/admin/AdminFormPage';
import { ROUTES } from '@/constants/routes';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { apiClient } from '@/lib/api/axios-client';
import { useToast } from '@/context/ToastContext';
import { useAdminI18n } from '@/context/AdminI18nContext';
import { type CategoryData } from '../_lib/data';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { type AdminArticle } from '../../posts/_lib/data';

type CategoryFormState = Pick<CategoryData, 'name' | 'slug' | 'description' | 'sortOrder' | 'isActive'> & {
  imageUrl: string;
};

const FORM_ID = 'category-form';

export default function CategoryForm({ id }: { id?: string }) {
  const isEdit = id !== undefined;
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;
    let mounted = true;
    setLoading(true);

    apiClient
      .get(`${API_ENDPOINTS.ADMIN.CATEGORIES}/${id}`)
      .then((res) => {
        if (!mounted) return;
        const data = res.data?.data;
        if (data && (data.id || data.name)) {
          setCategoryData({
            id: Number(data.id),
            name: data.name || '',
            slug: data.slug || '',
            description: data.description || '',
            articlesCount: Number(data.postCount || 0),
            sortOrder: Number(data.sortOrder || 1),
            isActive: data.isActive !== false,
            imageUrl: data.image || data.imageUrl || '',
          });
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Failed to load category from backend:', err);
        setNotFound(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  if (isEdit && loading) return <FormLoading />;
  if (isEdit && (notFound || !categoryData)) return <FormNotFound backHref={ROUTES.ADMIN.CATEGORIES} entity="Category" />;

  const existing = categoryData || undefined;

  const initial: CategoryFormState = existing
    ? {
        name: existing.name,
        slug: existing.slug,
        description: existing.description,
        sortOrder: existing.sortOrder,
        imageUrl: existing.imageUrl || '',
        isActive: existing.isActive,
      }
    : { name: '', slug: '', description: '', sortOrder: 1, imageUrl: '', isActive: true };

  return <CategoryFormInner key={id ?? 'new'} existing={existing} initial={initial} />;
}

function CategoryFormInner({ existing, initial }: { existing?: CategoryData; initial: CategoryFormState }) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useAdminI18n();
  const [form, setForm] = useState<CategoryFormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const [categoryArticles, setCategoryArticles] = useState<AdminArticle[]>([]);
  const [articlesLoaded, setArticlesLoaded] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(false);

  const loadCategoryArticlesOnDemand = async () => {
    if (!existing?.id || articlesLoaded || loadingArticles) return;
    setLoadingArticles(true);
    try {
      const res = await apiClient.get(API_ENDPOINTS.ADMIN.POSTS, {
        params: { categoryId: existing.id, size: 20 },
      });
      const list = res.data?.data?.content || res.data?.data;
      if (Array.isArray(list)) {
        setCategoryArticles(
          list.map((p: any): AdminArticle => ({
            id: String(p.id),
            title: p.title || '',
            slug: p.slug || '',
            excerpt: p.excerpt || '',
            content: '',
            imageUrl: p.image || '',
            category: p.categoryName || existing.name,
            categoryId: existing.id,
            author: {
              name: p.authorName || 'HeyGoodly Editorial',
              role: p.authorRole || '',
              avatar: p.authorAvatar || '',
            },
            status: (p.status || 'PUBLISHED') as any,
            views: Number(p.viewCount || 0),
            rating: p.rating ? String(p.rating) : '',
            featured: Boolean(p.isFeatured),
            tags: Array.isArray(p.tags) ? p.tags : [],
            publishedAt: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : '',
            readTime: p.readTime || '',
          }))
        );
      }
      setArticlesLoaded(true);
    } catch {
      setCategoryArticles([]);
      setArticlesLoaded(true);
    } finally {
      setLoadingArticles(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const fieldErrors: Record<string, string> = {};
    if (!form.name.trim()) {
      fieldErrors.name = t('Category name is required');
    }
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error(fieldErrors.name || t('Please review highlighted form errors.'));
      return;
    }

    const cleanSlug = form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload = {
      name: form.name.trim(),
      slug: cleanSlug,
      description: form.description?.trim() || '',
      sortOrder: form.sortOrder,
      isActive: form.isActive,
      image: form.imageUrl || '',
    };

    try {
      if (existing) {
        const res = await apiClient.put(`${API_ENDPOINTS.ADMIN.CATEGORIES}/${existing.id}`, payload);
        toast.success(res.data?.message || `Updated category "${form.name}" successfully!`);
      } else {
        const res = await apiClient.post(API_ENDPOINTS.ADMIN.CATEGORIES, payload);
        toast.success(res.data?.message || `Created category "${form.name}" successfully!`);
      }
      router.push(ROUTES.ADMIN.CATEGORIES);
    } catch (err: any) {
      if (err?.response?.data?.errors && typeof err.response.data.errors === 'object') {
        setErrors(err.response.data.errors);
      }
      const msg = err?.response?.data?.message || err?.message || 'Failed to save category.';
      toast.error(msg);
    }
  };

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
        onClick={() => {
          setActiveTab('preview');
          loadCategoryArticlesOnDemand();
        }}
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
      title={existing ? `Edit Category: ${existing.name}` : 'Create New Category'}
      description="Configure editorial taxonomy shown in client navigation bars and category landing pages."
      backHref={ROUTES.ADMIN.CATEGORIES}
      backLabel="Back to categories"
      formId={FORM_ID}
      submitLabel={existing ? 'Save Category' : 'Create Category'}
      headerActions={headerActions}
      width="full"
    >
      {activeTab === 'edit' ? (
        <form noValidate id={FORM_ID} onSubmit={handleSave} className="space-y-6">
          {/* TOP ROW: CATEGORY IDENTITY & MEDIA + DISPLAY & PREVIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Main Column (Left - 2 Cols) */}
            <div className="lg:col-span-2 space-y-6">
              <FormSection title="Category Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={labelClass}>Category Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => {
                        setForm({ ...form, name: e.target.value });
                        if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                      }}
                      placeholder="e.g. Technology & Computing"
                      className={`${inputClass} ${errors.name ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                    />
                    {errors.name && (
                      <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className={labelClass}>URL Slug *</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => {
                        setForm({ ...form, slug: e.target.value });
                        if (errors.slug) setErrors((prev) => ({ ...prev, slug: '' }));
                      }}
                      placeholder="e.g. tech"
                      className={`${inputClass} font-mono ${errors.slug ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                    />
                    {errors.slug && (
                      <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {errors.slug}
                      </p>
                    )}
                  </div>
                </div>
              </FormSection>

              <FormSection title="Category Media & Cover">
                <ImageUpload
                  value={form.imageUrl}
                  onChange={(url) => setForm({ ...form, imageUrl: url })}
                  folder="categories"
                  label="Category Header Banner (Optional)"
                  description="Wide cover banner displayed at the top of category landing page."
                  aspectRatio="banner"
                />
              </FormSection>
            </div>

            {/* Sidebar Column (Right - 1 Col) */}
            <div className="lg:col-span-1 space-y-6">
              <FormSection title="Display & Taxonomy">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className={labelClass}>Navigation Sort Order</label>
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 1 })}
                      className={inputClass}
                    />
                    <span className="text-[11px] text-slate-400">Order shown in header nav</span>
                  </div>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Category Active</span>
                      <span className="text-[11px] text-slate-400">Visible in navigation bar</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-[#C62828] focus:ring-[#C62828]"
                    />
                  </label>
                </div>
              </FormSection>

              {/* Quick Card Preview */}
              <FormSection title="Quick Card Preview">
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-2xs">
                  {form.imageUrl ? (
                    <div className="h-28 w-full overflow-hidden bg-slate-200 relative">
                      <img src={form.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-20 w-full bg-linear-to-r from-slate-800 to-slate-900 flex items-center justify-center text-white/40 text-xs font-mono">
                      No banner uploaded
                    </div>
                  )}
                  <div className="p-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">
                        {form.name || 'Category Name'}
                      </h4>
                      <span className="text-[10px] font-mono font-semibold bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">
                        /{form.slug || 'slug'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {form.description ? form.description.replace(/<[^>]*>?/gm, '') : 'Category overview description...'}
                    </p>
                  </div>
                </div>
              </FormSection>
            </div>

          </div>

          {/* FULL-WIDTH 100% ROW: DESCRIPTION & EDITORIAL NOTES WORD STUDIO */}
          <div className="w-full">
            <FormSection
              title="Description & Editorial Notes"
              description="Microsoft Word Studio Editor • 100% full-width canvas with full Ribbon support for Font Family, Font Size, Data Tables & Affiliate Blocks"
              headerRight={
                <span className="text-[11px] font-bold text-[#2b579a] bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#2b579a] animate-pulse"></span>
                  <span>Word Studio 100%</span>
                </span>
              }
            >
              <RichTextEditor
                value={form.description}
                onChange={(html) => setForm({ ...form, description: html })}
                minHeight="420px"
                initialPaperView={false}
                placeholder="Enter category overview, buying guides, and editorial testing criteria..."
              />
            </FormSection>
          </div>

          {/* FULL-WIDTH ROW: ARTICLES IN THIS CATEGORY */}
          {existing && (
            <div className="w-full">
              <FormSection
                title={`Articles in "${existing.name}" (${articlesLoaded ? categoryArticles.length : existing.articlesCount})`}
                headerRight={
                  <div className="flex items-center gap-2">
                    {!articlesLoaded && existing.articlesCount > 0 && (
                      <button
                        type="button"
                        onClick={loadCategoryArticlesOnDemand}
                        disabled={loadingArticles}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg inline-flex items-center gap-1 transition cursor-pointer"
                      >
                        <RefreshCw size={11} className={loadingArticles ? 'animate-spin' : ''} />
                        <span>{loadingArticles ? 'Loading...' : 'Load Articles'}</span>
                      </button>
                    )}
                    <Link
                      href={`/admin/posts?category=${encodeURIComponent(existing.name)}`}
                      className="text-xs font-bold text-slate-600 hover:text-[#C62828] inline-flex items-center gap-1"
                    >
                      <span>Manage All</span>
                      <ExternalLink size={11} />
                    </Link>
                    <Link
                      href={`/admin/posts/create?category=${encodeURIComponent(existing.name)}`}
                      className="text-xs font-bold text-white bg-[#C62828] hover:bg-[#B71C1C] px-2.5 py-1 rounded-lg inline-flex items-center gap-1 shadow-2xs"
                    >
                      <Plus size={12} />
                      <span>Write Article</span>
                    </Link>
                  </div>
                }
              >
                {!articlesLoaded && existing.articlesCount > 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 space-y-2">
                    <p>This category contains <strong>{existing.articlesCount}</strong> assigned articles in PostgreSQL.</p>
                    <button
                      type="button"
                      onClick={loadCategoryArticlesOnDemand}
                      disabled={loadingArticles}
                      className="inline-flex items-center gap-1.5 font-bold text-[#C62828] hover:underline cursor-pointer"
                    >
                      <RefreshCw size={13} className={loadingArticles ? 'animate-spin' : ''} />
                      <span>{loadingArticles ? 'Fetching articles...' : 'Click to load category articles on demand'}</span>
                    </button>
                  </div>
                ) : categoryArticles.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1 divide-y divide-slate-100">
                    {categoryArticles.map((art) => (
                      <div
                        key={art.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-2xs transition gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {art.imageUrl ? (
                            <img src={art.imageUrl} alt={art.title} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-200 shrink-0 flex items-center justify-center text-slate-400">
                              <BookOpen size={16} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#C62828] transition-colors">
                              {art.title}
                            </h5>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span>{art.author?.name}</span>
                              <span>•</span>
                              <span>{art.publishedAt}</span>
                              <span>•</span>
                              <span className="font-semibold text-emerald-600">{art.status}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Link
                            href={`/post/${art.slug}`}
                            target="_blank"
                            className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition shadow-2xs"
                            title="Preview on live site"
                          >
                            <Eye size={12} />
                          </Link>
                          <Link
                            href={`/admin/posts/${art.id}/edit`}
                            className="w-7 h-7 rounded-lg bg-[#C62828] hover:bg-[#B71C1C] text-white flex items-center justify-center transition shadow-2xs"
                            title="Edit article"
                          >
                            <Edit2 size={12} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-500 space-y-2">
                    <p>No articles currently assigned to this category.</p>
                    <Link
                      href={`/admin/posts/create?category=${encodeURIComponent(existing.name)}`}
                      className="inline-flex items-center gap-1.5 font-bold text-[#C62828] hover:underline"
                    >
                      <Plus size={13} />
                      <span>Write the first article in &ldquo;{existing.name}&rdquo;</span>
                    </Link>
                  </div>
                )}
              </FormSection>
            </div>
          )}
        </form>
      ) : (
        /* LIVE CLIENT CATEGORY LANDING PAGE PREVIEW */
        <div className="space-y-6 animate-fadeIn">
          {/* Preview Toolbar with Device Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-[#C62828]">
                <Eye size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Category Landing Page Preview</h3>
                <p className="text-[11px] text-slate-400">URL: https://heygoodly.com/categories/{form.slug || 'category-name'}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  previewDevice === 'desktop' ? 'bg-[#C62828] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor size={13} />
                <span>Desktop (1000px)</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('tablet')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  previewDevice === 'tablet' ? 'bg-[#C62828] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tablet size={13} />
                <span>Tablet (768px)</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  previewDevice === 'mobile' ? 'bg-[#C62828] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone size={13} />
                <span>Mobile (375px)</span>
              </button>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="flex justify-center items-start overflow-x-auto py-2">
            <div
              className={`transition-all duration-300 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden ${
                previewDevice === 'desktop'
                  ? 'w-full max-w-[1000px]'
                  : previewDevice === 'tablet'
                  ? 'w-[768px]'
                  : 'w-[375px] border-4 border-slate-800'
              }`}
            >
              {/* Browser mockup header */}
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                </div>
                <div className="flex-1 bg-white border border-slate-200 rounded px-2.5 py-0.5 text-[11px] text-slate-500 font-mono truncate">
                  https://heygoodly.com/categories/{form.slug || 'category-name'}
                </div>
              </div>

              {/* Category Hero / Header */}
              <div className="relative bg-linear-to-r from-slate-900 via-slate-800 to-slate-950 text-white overflow-hidden">
                {form.imageUrl && (
                  <div className="absolute inset-0 z-0">
                    <img src={form.imageUrl} alt={form.name} className="w-full h-full object-cover opacity-35" />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/70 to-transparent"></div>
                  </div>
                )}

                <div className="relative z-10 px-6 sm:px-10 py-10 max-w-4xl">
                  {/* Breadcrumb */}
                  <div className="flex items-center gap-2 text-xs text-slate-300 mb-4 font-medium">
                    <span>Home</span>
                    <span>/</span>
                    <span>Categories</span>
                    <span>/</span>
                    <span className="text-white font-bold">{form.name || 'Category'}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#C62828] text-white">
                      Editorial Category
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-white/10 text-slate-200 border border-white/15">
                      /{form.slug || 'slug'}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                    {form.name || 'Category Title'}
                  </h1>

                  <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
                    Explore in-depth buying guides, objective lab reviews, and the best verified promo codes for {form.name || 'this category'}.
                  </p>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="p-6 sm:p-10 space-y-10">
                {/* Editorial Description / Buying Guide Box */}
                <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-6 sm:p-8">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C62828] mb-4">
                    <FolderTree size={16} />
                    <span>Editorial Buying Guide &amp; Category Overview</span>
                  </div>

                  {form.description ? (
                    <div
                      className="article-content font-serif text-slate-800 leading-relaxed text-sm sm:text-base space-y-4 prose prose-slate max-w-none"
                      dangerouslySetInnerHTML={{ __html: form.description }}
                    />
                  ) : (
                    <div className="text-center py-6 text-sm text-slate-400 italic">
                      No editorial description added yet. Switch to the Editor tab to compose content.
                    </div>
                  )}
                </div>

                {/* Articles & Deals in this Category */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Latest Articles &amp; Reviews in This Category
                      </h2>
                      <p className="text-xs text-slate-500">Curated and updated continuously by our editorial team</p>
                    </div>
                    <span className="text-xs font-bold text-[#C62828] bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                      {categoryArticles.length} articles
                    </span>
                  </div>

                  {categoryArticles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {categoryArticles.map((art) => (
                        <div
                          key={art.id}
                          className="border border-slate-200 rounded-xl p-4 bg-white hover:shadow-md transition space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            {art.imageUrl && (
                              <img
                                src={art.imageUrl}
                                alt={art.title}
                                className="w-full h-36 object-cover rounded-lg border border-slate-100"
                              />
                            )}
                            <h4 className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-[#C62828] transition-colors">
                              {art.title}
                            </h4>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
                            <span>{art.author?.name}</span>
                            <span>{art.publishedAt}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                      No articles have been assigned to this category yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Mock Footer */}
              <div className="bg-slate-900 border-t border-slate-800 p-6 text-center text-xs text-slate-400">
                <p>© 2026 HeyGoodly Editorial. All reviews and curated deals are independently verified.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminFormPage>
  );
}
