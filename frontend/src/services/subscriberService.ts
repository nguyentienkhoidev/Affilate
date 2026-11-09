import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { SubscriberItem } from '@/app/admin/subscribers/_lib/data';

export interface SubscriberRequestPayload {
  email: string;
  source?: string;
}

class SubscriberService {
  /**
   * Submit new newsletter subscription to backend API.
   */
  async subscribe(email: string, source: string = 'homepage_footer'): Promise<SubscriberItem | null> {
    try {
      const res = await apiClient.post(API_ENDPOINTS.PUBLIC.SUBSCRIBERS, {
        email: email.trim().toLowerCase(),
        source,
      });
      return res.data?.data || null;
    } catch (err) {
      console.warn('Backend subscriber API error, using local fallback:', err);
      return null;
    }
  }

  /**
   * Fetch paginated subscribers list for Admin ProCMS.
   */
  async getAdminSubscribers(params?: {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
    source?: string;
  }) {
    try {
      const res = await apiClient.get(API_ENDPOINTS.ADMIN.SUBSCRIBERS, { params });
      return res.data?.data || null;
    } catch (err) {
      console.warn('Backend admin subscribers API error:', err);
      return null;
    }
  }

  /**
   * Delete subscriber by ID.
   */
  async deleteSubscriber(id: number | string): Promise<boolean> {
    try {
      await apiClient.delete(API_ENDPOINTS.ADMIN.SUBSCRIBER_DETAIL(id));
      return true;
    } catch (err) {
      console.warn('Backend delete subscriber API error:', err);
      return false;
    }
  }
}

export const subscriberService = new SubscriberService();
export default subscriberService;

