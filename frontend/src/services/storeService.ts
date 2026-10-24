import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { Store } from '@/types/deals';
import mockStoresData from '@/lib/data/mock-stores.json';

class StoreService {
  /**
   * Fetch all stores.
   * Dual-mode: Calls backend API; automatically falls back to mock-stores.json if offline.
   */
  async getStores(params?: { category?: string; featured?: boolean }): Promise<Store[]> {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.STORES, {
        params,
        timeout: 2000,
      });

      if (res.data && Array.isArray(res.data.items)) {
        return res.data.items;
      }
      if (res.data && Array.isArray(res.data)) {
        return res.data;
      }
    } catch {
      // API offline or error -> Fallback gracefully to mock data
    }

    let stores = (mockStoresData as Store[]) || [];
    if (params?.category && params.category !== 'all') {
      stores = stores.filter(s => s.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params?.featured) {
      stores = stores.filter(s => s.featured || s.isFeatured);
    }
    return stores;
  }

  /**
   * Get single store by slug
   */
  async getStoreBySlug(slug: string): Promise<Store | null> {
    const cleanSlug = slug.replace('-store', '').toLowerCase();

    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.STORE_DETAIL(cleanSlug), {
        timeout: 2000,
      });
      if (res.data) {
        return res.data as Store;
      }
    } catch {
      // API offline or error -> Fallback gracefully to mock data
    }

    const stores = (mockStoresData as Store[]) || [];
    const found = stores.find(
      s => s.slug.toLowerCase() === cleanSlug || s.slug.toLowerCase() === slug.toLowerCase()
    );

    return found || null;
  }

  /**
   * Get featured stores
   */
  async getFeaturedStores(): Promise<Store[]> {
    return this.getStores({ featured: true });
  }
}

const storeService = new StoreService();
export default storeService;
