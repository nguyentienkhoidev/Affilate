import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export interface AdminOfferPayload {
  storeId: number;
  name: string;
  discountValue: string;
  code?: string | null;
  urlRef: string;
  description?: string | null;
  image?: string | null;
  isVerified?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  expireAt?: string | null;
  tags?: string[];
}

export interface AdminOfferDetail {
  id: number;
  storeId: number;
  storeName?: string;
  storeSlug?: string;
  storeLogo?: string | null;
  image?: string | null;
  imageUrl?: string | null;
  name: string;
  discountValue: string;
  code?: string | null;
  urlRef: string;
  description?: string | null;
  isVerified: boolean;
  isActive: boolean;
  sortOrder: number;
  expireAt?: string | null;
  usesCount?: number;
  tags?: string[];
}

class OfferService {
  /**
   * Admin: List offers with pagination and filters
   */
  async getAdminOffers(params?: {
    page?: number;
    size?: number;
    storeId?: number;
    search?: string;
    type?: string;
    verified?: boolean;
    sortBy?: string;
    direction?: string;
  }): Promise<{ content: AdminOfferDetail[]; totalElements: number; totalPages: number }> {
    const res = await apiClient.get(API_ENDPOINTS.ADMIN.OFFERS, {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 100,
        storeId: params?.storeId,
        search: params?.search,
        type: params?.type,
        verified: params?.verified,
        sortBy: params?.sortBy ?? 'id',
        direction: params?.direction ?? 'desc',
      },
    });
    return res.data?.data || { content: [], totalElements: 0, totalPages: 1 };
  }

  /**
   * Admin: Get single offer detail by ID
   */
  async getAdminOfferById(id: string | number): Promise<AdminOfferDetail> {
    const res = await apiClient.get(API_ENDPOINTS.ADMIN.OFFER_DETAIL(id));
    return res.data?.data || res.data;
  }

  /**
   * Admin: Create offer
   */
  async createOffer(payload: AdminOfferPayload): Promise<AdminOfferDetail> {
    const res = await apiClient.post(API_ENDPOINTS.ADMIN.OFFERS, payload);
    return res.data?.data || res.data;
  }

  /**
   * Admin: Update offer
   */
  async updateOffer(id: string | number, payload: AdminOfferPayload): Promise<AdminOfferDetail> {
    const res = await apiClient.put(API_ENDPOINTS.ADMIN.OFFER_DETAIL(id), payload);
    return res.data?.data || res.data;
  }

  /**
   * Admin: Toggle offer active status
   */
  async toggleOfferStatus(id: string | number): Promise<AdminOfferDetail> {
    const res = await apiClient.patch(API_ENDPOINTS.ADMIN.OFFER_TOGGLE(id));
    return res.data?.data || res.data;
  }

  /**
   * Admin: Toggle offer verified status
   */
  async toggleOfferVerify(id: string | number): Promise<AdminOfferDetail> {
    const res = await apiClient.patch(API_ENDPOINTS.ADMIN.OFFER_VERIFY(id));
    return res.data?.data || res.data;
  }

  /**
   * Admin: Clone offer
   */
  async cloneOffer(id: string | number): Promise<AdminOfferDetail> {
    const res = await apiClient.post(API_ENDPOINTS.ADMIN.OFFER_CLONE(id));
    return res.data?.data || res.data;
  }

  /**
   * Admin: Delete offer
   */
  async deleteOffer(id: string | number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ADMIN.OFFER_DETAIL(id));
  }
}

export const offerService = new OfferService();
export default offerService;

