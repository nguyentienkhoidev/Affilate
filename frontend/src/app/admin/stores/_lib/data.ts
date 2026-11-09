export interface AdminStore {
  id: string;
  name: string;
  slug: string;
  domain: string;
  logoUrl?: string;
  bannerUrl?: string;
  categoryId?: number;
  category: string;
  rating: number;
  reviewsCount: number;
  activeCoupons: number;
  maxDiscount: string;
  affiliateUrl: string;
  description: string;
  shortDescription?: string;
  popularSearches?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  isFeatured: boolean;
  isActive: boolean;
  clicks: number;
  tags?: string[];
}

export const STORES_STORE_KEY = 'stores';

export const DEFAULT_STORES: AdminStore[] = [];
