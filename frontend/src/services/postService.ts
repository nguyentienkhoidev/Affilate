import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { Article, ArticleSidebarConfig } from '@/types/deals';

export interface PostFilterParams {
  page?: number;
  size?: number;
  categoryId?: number | number[];
  categorySlug?: string | string[];
  category?: string | string[];
  storeSlug?: string;
  featured?: boolean;
  search?: string;
  sortBy?: 'newest' | 'popular';
  tag?: string | string[];
}

export interface PaginatedPostsResult {
  items: Article[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export function mapBackendPostToArticle(p: any): Article {
  let img = typeof (p.image ?? p.imageUrl) === 'string' ? String(p.image ?? p.imageUrl).trim() : '';
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && img.startsWith('http://')) {
    try {
      const parsed = new URL(img);
      if (parsed.hostname === window.location.hostname) {
        parsed.protocol = 'https:';
        img = parsed.toString();
      }
    } catch {}
  }

  let parsedTags: string[] = [];
  if (Array.isArray(p.tags)) {
    parsedTags = p.tags.map((t: unknown) => String(t).trim()).filter(Boolean);
  } else if (typeof p.tags === 'string' && p.tags.trim().length > 0) {
    try {
      const parsed = JSON.parse(p.tags);
      if (Array.isArray(parsed)) {
        parsedTags = parsed.map((t: unknown) => String(t).trim()).filter(Boolean);
      } else {
        parsedTags = p.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
    } catch {
      parsedTags = p.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }
  } else if (typeof p.metaKeywords === 'string' && p.metaKeywords.trim().length > 0) {
    parsedTags = p.metaKeywords.split(/[,;]+/).map((t: string) => t.trim()).filter(Boolean);
  }

  let formattedDate = '';
  if (p.publishedAt) {
    try {
      formattedDate = new Date(p.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      formattedDate = String(p.publishedAt).split('T')[0];
    }
  }

  const rawRating = p.rating ?? p.ratingScore;
  const ratingStr =
    rawRating !== null && rawRating !== undefined && String(rawRating).trim() !== ''
      ? Number(rawRating).toFixed(1).replace(/\.0$/, '.0')
      : undefined;

  let sidebarConfig: ArticleSidebarConfig | undefined;
  if (p.sidebarConfig && typeof p.sidebarConfig === 'object') {
    sidebarConfig = p.sidebarConfig as ArticleSidebarConfig;
  } else if (typeof p.sidebarConfig === 'string' && p.sidebarConfig.trim()) {
    try {
      sidebarConfig = JSON.parse(p.sidebarConfig) as ArticleSidebarConfig;
    } catch {
      sidebarConfig = undefined;
    }
  }

  return {
    id: String(p.id),
    slug: String(p.slug || ''),
    title: String(p.title || ''),
    excerpt: String(p.excerpt || ''),
    content: p.content !== undefined && p.content !== null ? String(p.content) : undefined,
    categoryId: p.categoryId ? Number(p.categoryId) : undefined,
    category: String(p.categoryName || p.category || 'Editorial'),
    categorySlug: p.categorySlug ? String(p.categorySlug) : undefined,
    storeId: p.storeId ? Number(p.storeId) : undefined,
    storeSlug: p.storeSlug ? String(p.storeSlug) : undefined,
    storeName: p.storeName ? String(p.storeName) : undefined,
    author: {
      name: String(p.authorName || 'Editorial Team'),
      role: String(p.authorRole || 'Editorial Desk'),
      avatar: typeof p.authorAvatar === 'string' ? p.authorAvatar.trim() : '',
      bio: typeof p.authorBio === 'string' ? p.authorBio.trim() : undefined,
    },
    publishedAt: formattedDate,
    publishedIso: p.publishedAt ? String(p.publishedAt) : undefined,
    readTime: String(p.readTime || '5 min read'),
    imageUrl: img,
    featured: Boolean(p.isFeatured ?? p.featured),
    tags: parsedTags,
    rating: ratingStr,
    viewCount: Number(p.viewCount ?? 0),
    metaTitle: p.metaTitle ? String(p.metaTitle) : undefined,
    metaDescription: p.metaDescription ? String(p.metaDescription) : undefined,
    canonicalUrl: p.canonicalUrl ? String(p.canonicalUrl) : undefined,
    sidebarConfig,
  };
}

class PostService {
  /**
   * Fetch articles with filtering and pagination directly from PostgreSQL database.
   */
  async getPosts(params: PostFilterParams = {}): Promise<PaginatedPostsResult> {
    const page = params.page || 1;
    const size = params.size || 6;

    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.POSTS, {
        params: {
          page: page - 1,
          size,
          categoryId: params.categoryId,
          categorySlug: Array.isArray(params.categorySlug)
            ? (params.categorySlug.length > 0 ? params.categorySlug.join(',') : undefined)
            : (params.categorySlug && params.categorySlug.toLowerCase() !== 'all' ? params.categorySlug : undefined),
          category: Array.isArray(params.category)
            ? (params.category.length > 0 ? params.category.join(',') : undefined)
            : (params.category && params.category.toLowerCase() !== 'all' ? params.category : undefined),
          storeSlug: params.storeSlug || undefined,
          featured: params.featured,
          search: params.search || undefined,
          tag: Array.isArray(params.tag)
            ? (params.tag.length > 0 ? params.tag.join(',') : undefined)
            : (params.tag && params.tag.toLowerCase() !== 'all' ? params.tag : undefined),
          sortBy: params.sortBy === 'popular' ? 'viewCount' : 'publishedAt',
          direction: 'desc',
        },
        timeout: 8000,
      });

      const pageData = res.data?.data;
      const content = pageData?.content || pageData?.items || (Array.isArray(pageData) ? pageData : null);

      if (content && Array.isArray(content)) {
        const total = Number(pageData.totalElements ?? pageData.totalItems ?? content.length);
        const totalPages = Math.max(1, Number(pageData.totalPages ?? Math.ceil(total / size)));
        return {
          items: content.map(mapBackendPostToArticle),
          total,
          page,
          size,
          totalPages,
        };
      }
    } catch (err) {
      console.warn('Failed to fetch public posts from backend API:', err);
    }

    return {
      items: [],
      total: 0,
      page,
      size,
      totalPages: 1,
    };
  }

  /**
   * Fetch featured hero article from database
   */
  async getFeaturedArticle(): Promise<Article | null> {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.POSTS_FEATURED, { timeout: 8000 });
      if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
        return mapBackendPostToArticle(res.data.data[0]);
      }
      const pageRes = await this.getPosts({ size: 1 });
      return pageRes.items[0] || null;
    } catch {
      return null;
    }
  }

  /**
   * Fetch Editor's Picks list from database
   */
  async getEditorPicks(): Promise<Article[]> {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.POSTS_EDITOR_PICKS, { timeout: 8000 });
      if (Array.isArray(res.data?.data)) {
        return res.data.data.map(mapBackendPostToArticle);
      }
    } catch {
      // Return empty array cleanly on error
    }
    return [];
  }

  /**
   * Fetch article detail by slug from database
   */
  async getPostBySlug(slug: string): Promise<Article | null> {
    if (!slug || !slug.trim()) return null;
    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.POST_DETAIL(slug.trim()), { timeout: 8000 });
      if (res.data?.data) {
        return mapBackendPostToArticle(res.data.data);
      }
    } catch {
      // 404 or offline -> return null cleanly
    }
    return null;
  }
}

export const postService = new PostService();
export default postService;
