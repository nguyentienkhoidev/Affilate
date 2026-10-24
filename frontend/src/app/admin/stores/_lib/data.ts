import mockStoresData from '@/lib/data/mock-stores.json';

export interface AdminStore {
  id: string;
  name: string;
  slug: string;
  domain: string;
  logoUrl?: string;
  bannerUrl?: string;
  category: string;
  network: 'partnerboost' | 'impact' | 'shareasale' | 'cj' | 'direct';
  rating: number;
  reviewsCount: number;
  activeCoupons: number;
  maxDiscount: string;
  affiliateUrl: string;
  description: string;
  isFeatured: boolean;
  isActive: boolean;
  clicks: number;
}

export const STORES_STORE_KEY = 'stores';

export const DEFAULT_STORES: AdminStore[] = (mockStoresData as Array<Record<string, unknown>>).map((s) => ({
  id: String(s.id),
  name: String(s.name),
  slug: String(s.slug),
  domain: String(s.domain || `${s.slug}.com`),
  logoUrl: s.logoUrl as string | undefined,
  bannerUrl: s.bannerUrl as string | undefined,
  category: String(s.category),
  network: (s.network as AdminStore['network']) || 'direct',
  rating: Number(s.rating || 4.8),
  reviewsCount: Number(s.reviewCount || 100),
  activeCoupons: Number(s.couponsCount || 6),
  maxDiscount: String(s.maxDiscount || '20%'),
  affiliateUrl: String(s.affiliateUrl),
  description: String(s.description),
  isFeatured: Boolean(s.featured || s.isFeatured),
  isActive: s.isActive !== false,
  clicks: Number(s.clicks || 10000),
}));
