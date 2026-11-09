import { apiClient } from '@/lib/api/axios-client';
import { STORAGE_KEYS } from '@/constants/ui-constants';

export interface DashboardStats {
  totalClicks: number;
  activeStoresCount: number;
  featuredStoresCount?: number;
  activeOffersCount: number;
  couponCodesCount: number;
  dealsCount: number;
  exclusiveOffersCount?: number;
  totalArticleViews: number;
  postsCount: number;
  categoriesCount: number;
  subscribersCount: number;
  unreadFeedbackCount: number;
  pendingUserReportsCount?: number;
  unreadInquiriesCount?: number;
  peakClicks?: number;
  avgDailyClicks?: number;
  clicksGrowthRate?: number;
  usersCount: number;
  rolesCount: number;
  auditLogsCount: number;
  mediaCount?: number;
  menusCount?: number;
  pagesCount?: number;
  topStores: Array<{
    id: number;
    name: string;
    slug: string;
    logo?: string;
    website?: string;
    categoryName?: string;
    clicks: number;
    ratingScore: number;
    ratingCount: number;
    activeOffersCount: number;
  }>;
  topOffers: Array<{
    id: number;
    storeId?: number;
    storeName?: string;
    name: string;
    discountValue: string;
    code?: string;
    usesCount: number;
  }>;
  recentActivities: Array<{
    id: number;
    action: string;
    module: string;
    resourceName: string;
    userEmail: string;
    createdAt: string;
  }>;
  chart7d?: Array<{ date: string; clicks: number; conversions: number }>;
  chart30d?: Array<{ date: string; clicks: number; conversions: number }>;
  chart90d?: Array<{ date: string; clicks: number; conversions: number }>;
}

type StatsListener = (stats: DashboardStats) => void;

class DashboardService {
  private cachedStats: DashboardStats | null = null;
  private listeners = new Set<StatsListener>();
  private inFlightPromise: Promise<DashboardStats | null> | null = null;

  subscribe(listener: StatsListener): () => void {
    this.listeners.add(listener);
    if (this.cachedStats) {
      listener(this.cachedStats);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  getCachedStats(): DashboardStats | null {
    return this.cachedStats;
  }

  async getStats(forceRefresh = false): Promise<DashboardStats | null> {
    if (!forceRefresh && this.cachedStats) {
      return this.cachedStats;
    }
    if (this.inFlightPromise) {
      return this.inFlightPromise;
    }

    this.inFlightPromise = this.fetchStatsInternal();
    try {
      const result = await this.inFlightPromise;
      return result;
    } finally {
      this.inFlightPromise = null;
    }
  }

  private async fetchStatsInternal(): Promise<DashboardStats | null> {
    if (typeof window !== 'undefined') {
      const hasToken =
        Boolean(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) ||
        Boolean(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN));
      if (!hasToken) {
        return null;
      }
    }

    try {
      const res = await apiClient.get('/api/v1/admin/dashboard/stats', { timeout: 8000 });
      if (res.data?.success && res.data?.data) {
        return this.updateCache(res.data.data as DashboardStats);
      }
    } catch {
      // Backend offline or unauthorized
    }
    return null;
  }

  private updateCache(stats: DashboardStats): DashboardStats {
    this.cachedStats = stats;
    this.listeners.forEach((listener) => {
      try {
        listener(stats);
      } catch {
        // Ignore subscriber error
      }
    });
    return stats;
  }
}

export const dashboardService = new DashboardService();

