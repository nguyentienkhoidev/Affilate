import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { Deal, Coupon } from '@/types/deals';
import mockDealsData from '@/lib/data/mock-deals.json';
import mockCouponsData from '@/lib/data/mock-coupons.json';

class DealService {
  /**
   * Fetch product deals
   */
  async getDeals(params?: { category?: string; storeSlug?: string; limit?: number }): Promise<Deal[]> {
    try {
      const res = await apiClient.get('/api/v1/public/deals', {
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
      // Fallback to mock data
    }

    let deals = (mockDealsData as Deal[]) || [];
    if (params?.category && params.category !== 'all') {
      deals = deals.filter(d => d.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params?.storeSlug) {
      deals = deals.filter(d => d.storeSlug.toLowerCase() === params.storeSlug!.toLowerCase());
    }
    if (params?.limit) {
      deals = deals.slice(0, params.limit);
    }
    return deals;
  }

  /**
   * Fetch single deal by slug
   */
  async getDealBySlug(slug: string): Promise<Deal | null> {
    try {
      const res = await apiClient.get(`/api/v1/public/deals/${slug}`, {
        timeout: 2000,
      });
      if (res.data) {
        return res.data as Deal;
      }
    } catch {
      // Fallback to mock
    }

    const deals = (mockDealsData as Deal[]) || [];
    return deals.find(d => d.slug === slug) || null;
  }

  /**
   * Fetch all coupons or by store
   */
  async getCoupons(storeSlug?: string): Promise<Coupon[]> {
    if (storeSlug) {
      return this.getCouponsByStoreSlug(storeSlug);
    }

    try {
      const res = await apiClient.get('/api/v1/public/coupons', {
        timeout: 2000,
      });
      if (res.data && Array.isArray(res.data)) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    return (mockCouponsData as Coupon[]) || [];
  }

  /**
   * Fetch coupons for a specific store slug
   */
  async getCouponsByStoreSlug(storeSlug: string): Promise<Coupon[]> {
    const cleanSlug = storeSlug.replace('-store', '').toLowerCase();

    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.STORE_OFFERS(cleanSlug), {
        timeout: 2000,
      });
      if (res.data && Array.isArray(res.data)) {
        return res.data;
      }
      if (res.data && Array.isArray(res.data.items)) {
        return res.data.items;
      }
    } catch {
      // Fallback
    }

    const allCoupons = (mockCouponsData as Coupon[]) || [];
    const matched = allCoupons.filter(
      c => c.storeSlug.toLowerCase() === cleanSlug || c.storeSlug.toLowerCase() === storeSlug.toLowerCase()
    );

    // If store has no specific coupons, return general coupons so page is not empty
    if (matched.length === 0) {
      return allCoupons.slice(0, 4);
    }

    return matched;
  }
}

const dealService = new DealService();
export default dealService;
