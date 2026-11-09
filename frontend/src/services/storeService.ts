import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { Store } from '@/types/deals';

export function mapBackendStoreToStore(s: any): Store {
  const maxOfferNum = Number(s.maxOffer ?? 0);
  const maxOfferVal = maxOfferNum > 0 ? `Up to ${maxOfferNum}% OFF` : 'Verified Offers';
  const domain = s.afWebsite
    ? String(s.afWebsite).replace(/^https?:\/\//i, '').replace(/\/.*$/, '').replace(/^www\./i, '')
    : (s.domain ? String(s.domain) : '');

  return {
    id: String(s.id),
    name: String(s.name || ''),
    slug: String(s.slug || ''),
    logoText: String(s.name || '').substring(0, 2).toUpperCase(),
    logoBg: '#0f172a',
    logoUrl: s.logo || s.logoUrl || undefined,
    bannerUrl: s.socialCardImage || s.bannerUrl || undefined,
    categoryId: s.categoryId ? Number(s.categoryId) : undefined,
    category: String(s.categoryName || s.category || 'Uncategorized'),
    rating: Number(s.ratingScore ?? s.rating ?? 0),
    reviewCount: Number(s.ratingCount ?? s.reviewCount ?? s.reviewsCount ?? 0),
    couponsCount: Number(s.activeOffersCount ?? s.activeCoupons ?? s.couponsCount ?? 0),
    maxDiscount: s.maxDiscount ? String(s.maxDiscount) : maxOfferVal,
    maxOfferPercent: maxOfferNum > 0 ? maxOfferNum : undefined,
    description: String(s.aboutStore || s.description || ''),
    shortDescription: s.socialDescription || s.metaDescription || s.shortDescription || undefined,
    popularSearches: Array.isArray(s.popularSearches) ? s.popularSearches : [],
    faqs: Array.isArray(s.faqs) ? s.faqs : [],
    affiliateUrl: `/go/${s.slug}`,
    featured: Boolean(s.isFeatured || s.featured),
    isFeatured: Boolean(s.isFeatured || s.featured),
    websiteUrl: s.afWebsite || (domain ? `https://${domain}` : ''),
    domain,
    clicks: Number(s.afVisitCount ?? s.clicks ?? 0),
    isActive: s.isActive !== false,
  };
}

class StoreService {
  /**
   * Fetch stores directly from backend API (PostgreSQL + Redis).
   */
  async getStores(params?: {
    category?: string;
    featured?: boolean;
    search?: string;
    size?: number;
  }): Promise<Store[]> {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.STORES, {
        params: {
          page: 0,
          size: params?.size ?? 50,
          search: params?.search || undefined,
          category:
            params?.category && params.category.toLowerCase() !== 'all'
              ? params.category
              : undefined,
          featured: params?.featured,
        },
        timeout: 6000,
      });

      const pageData = res.data?.data;
      const list =
        pageData?.content ||
        pageData?.items ||
        (Array.isArray(pageData) ? pageData : Array.isArray(res.data) ? res.data : null);
      if (list && Array.isArray(list)) {
        return list.map(mapBackendStoreToStore);
      }
    } catch (err) {
      console.warn('Failed to fetch public stores from backend:', err);
    }
    return [];
  }

  /**
   * Fetch paginated public stores directly from backend API.
   */
  async getPaginatedStores(params?: {
    page?: number;
    size?: number;
    search?: string;
    letter?: string;
    category?: string | string[];
    featured?: boolean;
    tag?: string | string[];
    sortBy?: string;
    direction?: string;
  }): Promise<{ content: Store[]; totalElements: number; totalPages: number; pageNumber: number }> {
    const page = params?.page ?? 0;
    const size = params?.size ?? 24;

    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.STORES, {
        params: {
          page,
          size,
          search: params?.search || undefined,
          letter: params?.letter && params.letter !== 'ALL' ? params.letter : undefined,
          category: Array.isArray(params?.category)
            ? (params.category.length > 0 ? params.category.join(',') : undefined)
            : (params?.category && params.category.toUpperCase() !== 'ALL' ? params.category : undefined),
          featured: params?.featured,
          tag: Array.isArray(params?.tag)
            ? (params.tag.length > 0 ? params.tag.join(',') : undefined)
            : (params?.tag && params.tag.toUpperCase() !== 'ALL' ? params.tag : undefined),
          sortBy: params?.sortBy ?? 'sortOrder',
          direction: params?.direction ?? 'asc',
        },
      });

      const pageData = res.data?.data;
      if (pageData && Array.isArray(pageData.content)) {
        return {
          content: pageData.content.map(mapBackendStoreToStore),
          totalElements: Number(pageData.totalElements ?? pageData.content.length),
          totalPages: Math.max(1, Number(pageData.totalPages ?? 1)),
          pageNumber: Number(pageData.pageNumber ?? page),
        };
      }
    } catch (err) {
      console.warn('Backend public stores API error:', err);
    }

    return {
      content: [],
      totalElements: 0,
      totalPages: 1,
      pageNumber: page,
    };
  }

  /**
   * Get single store by slug
   */
  async getStoreBySlug(slug: string): Promise<Store | null> {
    if (!slug || !slug.trim()) return null;
    const cleanSlug = slug.trim().replace(/-store$/i, '').toLowerCase();

    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.STORE_DETAIL(cleanSlug), {
        timeout: 6000,
      });
      const data = res.data?.data || res.data;
      if (data && data.id && data.name) {
        return mapBackendStoreToStore(data);
      }
    } catch {
      // 404 or offline -> return null cleanly
    }

    return null;
  }

  /**
   * Get featured stores
   */
  async getFeaturedStores(size = 8): Promise<Store[]> {
    return this.getStores({ featured: true, size });
  }

  /**
   * Admin: Get all stores with pagination and search
   */
  async getAdminStores(params?: {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
    categoryId?: number;
  }): Promise<{ content: any[]; totalElements: number }> {
    const res = await apiClient.get(API_ENDPOINTS.ADMIN.STORES, {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 100,
        search: params?.search,
        status: params?.status,
        categoryId: params?.categoryId,
      },
    });
    return res.data?.data || { content: [], totalElements: 0 };
  }

  async getAdminStoreById(id: string | number): Promise<any> {
    const res = await apiClient.get(API_ENDPOINTS.ADMIN.STORE_DETAIL(id));
    return res.data?.data || res.data;
  }

  async createStore(payload: any): Promise<any> {
    const res = await apiClient.post(API_ENDPOINTS.ADMIN.STORES, payload);
    return res.data?.data || res.data;
  }

  async updateStore(id: string | number, payload: any): Promise<any> {
    const res = await apiClient.put(API_ENDPOINTS.ADMIN.STORE_DETAIL(id), payload);
    return res.data?.data || res.data;
  }

  async toggleStoreStatus(id: string | number): Promise<any> {
    const res = await apiClient.patch(API_ENDPOINTS.ADMIN.STORE_TOGGLE(id));
    return res.data?.data || res.data;
  }

  async cloneStore(id: string | number): Promise<any> {
    const res = await apiClient.post(API_ENDPOINTS.ADMIN.STORE_CLONE(id));
    return res.data?.data || res.data;
  }

  async deleteStore(id: string | number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ADMIN.STORE_DETAIL(id));
  }
}

const storeService = new StoreService();
export default storeService;
