import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { Article, Coupon, Store } from '@/types/deals';
import { mapBackendStoreToStore } from '@/services/storeService';
import { mapBackendOfferToCoupon } from '@/services/dealService';
import { mapBackendPostToArticle } from '@/services/postService';

export interface UniversalSearchResult {
  query: string;
  stores: Store[];
  coupons: Coupon[];
  posts: Article[];
  totalResults: number;
}

class SearchService {
  async searchAll(params: {
    q?: string;
    tag?: string;
    limit?: number;
    signal?: AbortSignal;
  }): Promise<UniversalSearchResult> {
    const cleanQuery = (params.q || '').trim();
    const cleanTag = (params.tag || '').trim();

    if (!cleanQuery && !cleanTag) {
      return {
        query: '',
        stores: [],
        coupons: [],
        posts: [],
        totalResults: 0,
      };
    }

    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.SEARCH, {
        params: {
          q: cleanQuery || undefined,
          tag: cleanTag || undefined,
          limit: params.limit ?? 24,
        },
        signal: params.signal,
        timeout: 8000,
      });

      const data = res.data?.data;
      if (data && typeof data === 'object') {
        const stores = Array.isArray(data.stores) ? data.stores.map(mapBackendStoreToStore) : [];
        const coupons = Array.isArray(data.offers) ? data.offers.map(mapBackendOfferToCoupon) : [];
        const posts = Array.isArray(data.posts) ? data.posts.map(mapBackendPostToArticle) : [];
        return {
          query: String(data.query || cleanQuery || cleanTag),
          stores,
          coupons,
          posts,
          totalResults: Number(data.totalResults ?? stores.length + coupons.length + posts.length),
        };
      }
    } catch (err: any) {
      if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
        console.warn('Universal search API error:', err);
      }
    }

    return {
      query: cleanQuery || cleanTag,
      stores: [],
      coupons: [],
      posts: [],
      totalResults: 0,
    };
  }
}

export const searchService = new SearchService();
export default searchService;

