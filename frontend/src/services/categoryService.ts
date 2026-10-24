import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import mockCategoriesData from '@/lib/data/mock-categories.json';

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  count: number;
  icon?: string;
  subtitle?: string;
  description?: string;
}

class CategoryService {
  /**
   * Fetch all post categories list.
   * Prioritizes backend API; automatically falls back to Mock JSON if offline.
   */
  async getCategories(): Promise<CategoryItem[]> {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.CATEGORIES, {
        params: { type: 'post' },
        timeout: 2500,
      });

      if (res.data?.data && Array.isArray(res.data.data)) {
        return (res.data.data as Array<Record<string, unknown>>).map((c) => ({
          id: Number(c.id),
          name: String(c.name || ''),
          slug: String(c.slug || ''),
          count: Number(c.postCount || c.count || 0),
          icon: String(c.icon || '📰'),
          subtitle: String(c.subtitle || `${c.name} Editorial & Insights`),
          description: String(c.description || `Independent coverage, reviews, and test reports in ${c.name}.`),
        }));
      }
    } catch {
      // Fallback to Mock JSON
    }

    return mockCategoriesData as CategoryItem[];
  }

  /**
   * Fetch category detail by slug
   */
  async getCategoryBySlug(slug: string): Promise<CategoryItem | null> {
    const normalized = slug.toLowerCase().trim();
    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.CATEGORY_DETAIL(normalized), {
        timeout: 2000,
      });
      if (res.data?.data) {
        const c = res.data.data;
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          count: c.postCount || c.count || 0,
          icon: c.icon || '📰',
          subtitle: c.subtitle || `${c.name} Editorial & Insights`,
          description: c.description || `Independent coverage, reviews, and test reports in ${c.name}.`,
        };
      }
    } catch {
      // fallback
    }

    const categories = mockCategoriesData as CategoryItem[];
    const match = categories.find(c => c.slug.toLowerCase() === normalized);
    if (match) return match;

    // Generated default metadata if new category
    return {
      id: 999,
      name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      slug: normalized,
      count: 0,
      icon: '📰',
      subtitle: `Editorial coverage for ${slug.replace(/-/g, ' ')}`,
      description: `Independent coverage, reviews, and consumer test reports in ${slug.replace(/-/g, ' ')}.`,
    };
  }
}

export const categoryService = new CategoryService();
export default categoryService;
