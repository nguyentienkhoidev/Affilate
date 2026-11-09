import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export interface TagItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isFeatured: boolean;
  isActive: boolean;
  postsCount: number;
  storesCount: number;
  offersCount: number;
  mediaCount: number;
  totalUsageCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TagPayload {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface TagQueryCriteria {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
  search?: string;
  isFeatured?: boolean;
  entityType?: 'ALL' | 'POST' | 'STORE' | 'OFFER' | 'MEDIA' | 'UNUSED';
}

export interface TagPaginationResponse {
  content: TagItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

class TagService {
  private cachedTags: string[] | null = null;

  /**
   * Fetch paginated tags for Admin ProCMS
   */
  async getAdminTags(criteria: TagQueryCriteria = {}): Promise<TagPaginationResponse> {
    const params: Record<string, unknown> = {
      page: criteria.page ?? 0,
      size: criteria.size ?? 20,
      sortBy: criteria.sortBy ?? 'name',
      direction: criteria.direction ?? 'asc',
    };

    if (criteria.search?.trim()) {
      params.search = criteria.search.trim();
    }
    if (typeof criteria.isFeatured === 'boolean') {
      params.isFeatured = criteria.isFeatured;
    }
    if (criteria.entityType && criteria.entityType !== 'ALL') {
      params.entityType = criteria.entityType;
    }

    const res = await apiClient.get(API_ENDPOINTS.ADMIN.TAGS, { params });
    return res.data?.data || {
      content: [],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 0,
      totalPages: 0,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    };
  }

  /**
   * Get single tag by ID for admin
   */
  async getAdminTagById(id: number | string): Promise<TagItem | null> {
    const res = await apiClient.get(API_ENDPOINTS.ADMIN.TAG_ADMIN_DETAIL(id));
    return res.data?.data || null;
  }

  /**
   * Create new tag
   */
  async createTag(payload: TagPayload): Promise<TagItem> {
    const res = await apiClient.post(API_ENDPOINTS.ADMIN.TAGS, payload);
    return res.data?.data;
  }

  /**
   * Update existing tag
   */
  async updateTag(id: number | string, payload: TagPayload): Promise<TagItem> {
    const res = await apiClient.put(API_ENDPOINTS.ADMIN.TAG_ADMIN_DETAIL(id), payload);
    return res.data?.data;
  }

  /**
   * Soft-delete tag
   */
  async deleteTag(id: number | string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ADMIN.TAG_ADMIN_DETAIL(id));
  }

  /**
   * Fetch all active tags for public usage
   */
  async getPublicTags(): Promise<TagItem[]> {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.TAGS, { timeout: 6000 });
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch (err) {
      console.warn('Failed to fetch public tags:', err);
      return [];
    }
  }

  /**
   * Fetch featured tags for public badges/carousels
   */
  async getFeaturedTags(): Promise<TagItem[]> {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.TAGS_FEATURED, { timeout: 6000 });
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch (err) {
      console.warn('Failed to fetch featured tags:', err);
      return [];
    }
  }

  /**
   * Fetch single tag by slug for public tag archive page
   */
  async getTagBySlug(slug: string): Promise<TagItem | null> {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.TAG_DETAIL(slug), { timeout: 6000 });
      return res.data?.data || null;
    } catch (err) {
      console.warn('Failed to fetch tag by slug:', err);
      return null;
    }
  }

  /**
   * Fetch trending tags list directly from PostgreSQL via backend API.
   */
  async getTrendingTags(): Promise<string[]> {
    if (this.cachedTags) {
      return this.cachedTags;
    }

    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.TAGS_TRENDING, { timeout: 6000 });
      if (Array.isArray(res.data?.data)) {
        const parsed: string[] = res.data.data
          .map((t: unknown) => String(t).trim())
          .filter(Boolean);
        this.cachedTags = parsed;
        return parsed;
      }
    } catch (err) {
      console.warn('Failed to fetch trending tags from backend:', err);
    }
    return [];
  }
}

export const tagService = new TagService();
export default tagService;
