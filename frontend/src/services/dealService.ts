import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { Deal, Coupon, DealStatus } from '@/types/deals';

export function mapBackendOfferToCoupon(o: any): Coupon {
  const isCode = Boolean(o.code && String(o.code).trim().length > 0);
  const storeSlug = String(o.storeSlug || '').toLowerCase();
  const isVerified = Boolean(o.isVerified);
  const usesCount = Number(o.usesCount ?? 0);
  const resolvedImage = typeof (o.image || o.imageUrl || o.storeLogo) === 'string'
    ? String(o.image || o.imageUrl || o.storeLogo).trim()
    : undefined;

  let formattedExpiry: string | undefined;
  if (o.expireAt) {
    try {
      formattedExpiry = new Date(o.expireAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      formattedExpiry = String(o.expireAt);
    }
  }

  return {
    id: String(o.id),
    code: isCode ? String(o.code).trim() : undefined,
    discount: String(o.discountValue || 'Special Offer'),
    title: String(o.name || ''),
    description: String(o.description || ''),
    storeName: String(o.storeName || ''),
    storeSlug,
    successRate: isVerified ? 100 : 0,
    isVerified,
    usesCount,
    isExclusive: Boolean(o.isExclusive),
    isCode,
    terms: o.description ? String(o.description) : undefined,
    expiryDate: formattedExpiry,
    imageUrl: resolvedImage,
    affiliateUrl: `/out/${o.id}`,
  };
}

export function mapBackendOfferToDeal(o: any): Deal {
  const storeSlug = String(o.storeSlug || '').toLowerCase();
  const resolvedImage = typeof (o.image || o.imageUrl || o.storeLogo) === 'string'
    ? String(o.image || o.imageUrl || o.storeLogo).trim()
    : '';

  let discountNum = 0;
  if (o.discountValue) {
    const match = String(o.discountValue).match(/(\d+)\s*%/);
    if (match) discountNum = parseInt(match[1], 10);
  }

  let formattedExpiry = '';
  if (o.expireAt) {
    try {
      formattedExpiry = new Date(o.expireAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      formattedExpiry = String(o.expireAt);
    }
  }

  const isVerified = Boolean(o.isVerified);
  const usesCount = Number(o.usesCount ?? 0);

  return {
    id: String(o.id),
    slug: `deal-${o.id}-${storeSlug || 'offer'}`,
    title: String(o.name || ''),
    summary: String(o.description || ''),
    description: String(o.description || ''),
    category: String(o.category || ''),
    storeName: String(o.storeName || ''),
    storeSlug,
    storeLogo: o.storeLogo ? String(o.storeLogo) : undefined,
    originalPrice: 0,
    dealPrice: 0,
    discountPercent: discountNum,
    discountLabel: String(o.discountValue || 'Special Offer'),
    couponCode: o.code ? String(o.code).trim() : undefined,
    affiliateUrl: `/out/${o.id}`,
    imageUrl: resolvedImage,
    badge: isVerified ? 'Verified' : undefined,
    status: (o.isActive === false ? 'expired' : 'active') as DealStatus,
    expiryDate: formattedExpiry,
    verifiedDate: isVerified ? 'Verified' : '',
    rating: 0,
    reviewCount: 0,
    usesCount,
    isVerified,
    isHot: discountNum >= 30,
    isStaffPick: isVerified,
  };
}

class DealService {
  /**
   * Fetch product deals directly from Spring Boot backend.
   */
  async getDeals(params?: { category?: string; storeSlug?: string; limit?: number }): Promise<Deal[]> {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.DEALS, {
        params: {
          search: params?.storeSlug || params?.category || undefined,
          size: params?.limit || 24,
        },
        timeout: 6000,
      });

      const pageData = res.data?.data;
      const list =
        pageData?.content ||
        pageData?.items ||
        (Array.isArray(pageData) ? pageData : Array.isArray(res.data) ? res.data : null);
      if (list && Array.isArray(list)) {
        let deals = list.map(mapBackendOfferToDeal);
        if (params?.storeSlug) {
          deals = deals.filter((d) => d.storeSlug.toLowerCase() === params.storeSlug!.toLowerCase());
        }
        return deals;
      }
    } catch (err) {
      console.warn('Failed to fetch public deals from backend:', err);
    }
    return [];
  }

  /**
   * Fetch single deal by slug or id
   */
  async getDealBySlug(slug: string): Promise<Deal | null> {
    const idMatch = slug.match(/deal-(\d+)/);
    const offerId = idMatch ? idMatch[1] : slug;

    if (/^\d+$/.test(offerId)) {
      try {
        const res = await apiClient.get(API_ENDPOINTS.PUBLIC.OFFER_DETAIL(offerId), { timeout: 6000 });
        if (res.data?.data) {
          return mapBackendOfferToDeal(res.data.data);
        }
      } catch (err) {
        console.warn(`Failed to fetch deal by ID ${offerId}:`, err);
      }
    }
    return null;
  }

  /**
   * Fetch active coupons across merchants or for a specific store.
   */
  async getCoupons(storeSlug?: string, size = 50): Promise<Coupon[]> {
    if (storeSlug) {
      return this.getCouponsByStoreSlug(storeSlug);
    }

    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.OFFERS, {
        params: { size },
        timeout: 6000,
      });

      const pageData = res.data?.data;
      const list =
        pageData?.content ||
        pageData?.items ||
        (Array.isArray(pageData) ? pageData : Array.isArray(res.data) ? res.data : null);
      if (list && Array.isArray(list)) {
        return list.map(mapBackendOfferToCoupon);
      }
    } catch (err) {
      console.warn('Failed to fetch public coupons from backend:', err);
    }
    return [];
  }

  /**
   * Fetch coupons for a specific store slug via `/api/v1/public/stores/{slug}/offers`.
   */
  async getCouponsByStoreSlug(storeSlug: string): Promise<Coupon[]> {
    if (!storeSlug || !storeSlug.trim()) return [];
    const cleanSlug = storeSlug.trim().replace(/-store$/i, '').toLowerCase();

    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.STORE_OFFERS(cleanSlug), {
        timeout: 6000,
      });
      const data = res.data?.data;
      if (Array.isArray(data)) {
        return data.map(mapBackendOfferToCoupon);
      }
    } catch (err) {
      console.warn(`Failed to fetch coupons for store '${cleanSlug}':`, err);
    }
    return [];
  }
}

export const dealService = new DealService();
export default dealService;
