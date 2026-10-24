import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { Article } from '@/types/deals';
import mockArticlesData from '@/lib/data/mock-articles.json';

export interface PostFilterParams {
  page?: number;
  size?: number;
  categoryId?: number;
  categorySlug?: string;
  search?: string;
  sortBy?: 'newest' | 'popular';
  tag?: string;
}

export interface PaginatedPostsResult {
  items: Article[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

// Convert Spring Boot PostSummaryResponse to Frontend Article interface if needed
function mapBackendPostToArticle(post: Record<string, unknown>): Article {
  const publishedAtStr = post.publishedAt as string | undefined;
  return {
    id: String(post.id),
    slug: String(post.slug || ''),
    title: String(post.title || ''),
    excerpt: String(post.excerpt || ''),
    content: String(post.content || ''),
    category: String(post.categoryName || 'General'),
    author: {
      name: String(post.authorName || 'Bargorya Staff'),
      avatar: String(post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
      role: 'Staff Writer'
    },
    publishedAt: publishedAtStr ? new Date(publishedAtStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
    readTime: String(post.readTime || '6 min read'),
    imageUrl: String(post.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80'),
    featured: Boolean(post.isFeatured),
    tags: Array.isArray(post.tags) ? (post.tags as string[]) : [],
    storeSlug: post.storeSlug ? String(post.storeSlug) : undefined,
    storeName: post.storeName ? String(post.storeName) : undefined,
  };
}

class PostService {
  /**
   * Fetch articles with filtering and pagination.
   * Prioritizes backend API; automatically falls back to Mock JSON if offline.
   */
  async getPosts(params: PostFilterParams = {}): Promise<PaginatedPostsResult> {
    const page = params.page || 1;
    const size = params.size || 6;

    try {
      // 1. Try real backend API
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.POSTS, {
        params: {
          page: page - 1, // Spring Boot 0-indexed
          size,
          categoryId: params.categoryId,
          search: params.search,
          sortBy: params.sortBy === 'popular' ? 'viewCount' : 'publishedAt',
        },
        timeout: 2500, // Fast timeout if backend is not running
      });

      if (res.data?.data?.items) {
        const pageData = res.data.data;
        return {
          items: pageData.items.map(mapBackendPostToArticle),
          total: pageData.totalItems || pageData.items.length,
          page,
          size,
          totalPages: pageData.totalPages || Math.ceil(pageData.items.length / size),
        };
      }
    } catch {
      // 2. Seamless fallback to Mock JSON data
    }

    // Filter and paginate on Mock JSON
    let filtered = [...(mockArticlesData as Article[])];

    if (params.categorySlug && params.categorySlug !== 'all') {
      const slugLower = params.categorySlug.toLowerCase();
      filtered = filtered.filter(a => 
        a.category.toLowerCase().includes(slugLower) ||
        a.tags.some(t => t.toLowerCase().includes(slugLower)) ||
        (slugLower === 'tech' && a.category.toLowerCase().includes('hardware'))
      );
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)
      );
    }

    if (params.tag) {
      const tagLower = params.tag.toLowerCase().replace(/-/g, ' ').trim();
      const matched = filtered.filter(a => 
        a.tags.some(t => {
          const tLower = t.toLowerCase().replace(/-/g, ' ').trim();
          return tLower.includes(tagLower) || tagLower.includes(tLower);
        }) ||
        a.title.toLowerCase().includes(tagLower) ||
        a.category.toLowerCase().includes(tagLower) ||
        a.excerpt.toLowerCase().includes(tagLower)
      );
      if (matched.length > 0) {
        filtered = matched;
      }
    }

    // Sort order
    if (params.sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / size));
    const items = filtered.slice((page - 1) * size, page * size);

    return {
      items,
      total,
      page,
      size,
      totalPages,
    };
  }

  /**
   * Fetch featured hero article
   */
  async getFeaturedArticle(): Promise<Article> {
    try {
      const res = await apiClient.get('/api/v1/public/posts/featured', { timeout: 2000 });
      if (res.data?.data?.[0]) {
        return mapBackendPostToArticle(res.data.data[0]);
      }
    } catch {
      // fallback
    }
    const articles = mockArticlesData as Article[];
    return articles.find(a => a.featured) || articles[0];
  }

  /**
   * Fetch Editor's Picks list
   */
  async getEditorPicks(): Promise<Article[]> {
    try {
      const res = await apiClient.get('/api/v1/public/posts/editor-picks', { timeout: 2000 });
      if (res.data?.data?.length) {
        return res.data.data.map(mapBackendPostToArticle);
      }
    } catch {
      // fallback
    }
    const articles = mockArticlesData as Article[];
    return articles.slice(3, 7);
  }

  /**
   * Fetch article detail by slug
   */
  async getPostBySlug(slug: string): Promise<Article | null> {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.POST_DETAIL(slug), { timeout: 2000 });
      if (res.data?.data) {
        return mapBackendPostToArticle(res.data.data);
      }
    } catch {
      // fallback
    }
    const articles = mockArticlesData as Article[];
    return articles.find(a => a.slug === slug) || null;
  }
}

export const postService = new PostService();
export default postService;
