import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  type: string;
  count: number;
  postCount: number;
  storeCount: number;
  image?: string;
  icon: string;
  subtitle: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
}

function mapBackendCategory(c: Record<string, unknown>, preferStoreCount = false): CategoryItem {
  const postCount = Number(c.postCount ?? c.count ?? 0);
  const storeCount = Number(c.storeCount ?? 0);
  const name = String(c.name || '');

  return {
    id: Number(c.id),
    name,
    slug: String(c.slug || ''),
    type: String(c.type || 'post'),
    count: preferStoreCount ? storeCount : postCount,
    postCount,
    storeCount,
    image: typeof c.image === 'string' && c.image.trim() ? c.image.trim() : undefined,
    icon: String(c.icon || ''),
    subtitle: String(c.metaTitle || `${name} Editorial`),
    description: String(c.description || ''),
    metaTitle: c.metaTitle ? String(c.metaTitle) : undefined,
    metaDescription: c.metaDescription ? String(c.metaDescription) : undefined,
  };
}

class CategoryService {
  /**
   * Fetch categories directly from PostgreSQL via backend API.
   */
  async getCategories(type: 'post' | 'store' | 'all' = 'post'): Promise<CategoryItem[]> {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.CATEGORIES, {
        params: { type },
        timeout: 6000,
      });

      const pageData = res.data?.data;
      const list = pageData?.content || pageData?.items || (Array.isArray(pageData) ? pageData : null);

      if (list && Array.isArray(list)) {
        return (list as Array<Record<string, unknown>>).map((c) =>
          mapBackendCategory(c, type === 'store')
        );
      }
    } catch (err) {
      console.warn('Failed to fetch public categories from backend:', err);
    }
    return [];
  }

  /**
   * Fetch homepage highlighted categories (`showOnHome = true`).
   */
  async getHomeCategories(): Promise<CategoryItem[]> {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.CATEGORY_HOME, { timeout: 6000 });
      const list = res.data?.data;
      if (Array.isArray(list) && list.length > 0) {
        return (list as Array<Record<string, unknown>>).map((c) => mapBackendCategory(c, false));
      }
    } catch {
      // Fallback to active post categories
    }
    return this.getCategories('post');
  }

  /**
   * Fetch paginated categories from backend API.
   */
  async getPaginatedCategories(params?: {
    page?: number;
    size?: number;
    search?: string;
    type?: 'post' | 'store' | 'all';
  }): Promise<{ content: CategoryItem[]; totalElements: number; totalPages: number; pageNumber: number }> {
    const page = params?.page ?? 0;
    const size = params?.size ?? 12;
    const type = params?.type ?? 'post';

    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.CATEGORIES, {
        params: {
          page,
          size,
          search: params?.search || undefined,
          type,
        },
      });

      const pageData = res.data?.data;
      if (pageData && Array.isArray(pageData.content)) {
        return {
          content: pageData.content.map((c: Record<string, unknown>) =>
            mapBackendCategory(c, type === 'store')
          ),
          totalElements: Number(pageData.totalElements ?? pageData.content.length),
          totalPages: Math.max(1, Number(pageData.totalPages ?? 1)),
          pageNumber: Number(pageData.pageNumber ?? page),
        };
      }
    } catch (err) {
      console.warn('Backend public categories API error:', err);
    }

    return {
      content: [],
      totalElements: 0,
      totalPages: 1,
      pageNumber: page,
    };
  }

  /**
   * Fetch category detail by slug
   */
  async getCategoryBySlug(slug: string): Promise<CategoryItem | null> {
    if (!slug || !slug.trim()) return null;
    const normalized = slug.toLowerCase().trim();
    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.CATEGORY_DETAIL(normalized), {
        timeout: 6000,
      });
      if (res.data?.data) {
        return mapBackendCategory(res.data.data as Record<string, unknown>, false);
      }
    } catch {
      // 404 or offline -> return null cleanly
    }
    return null;
  }
}

export const categoryService = new CategoryService();
export default categoryService;
