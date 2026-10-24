import { Deal, Coupon, Store, Article } from '@/types/deals';
import mockStoresJson from './mock-stores.json';
import mockDealsJson from './mock-deals.json';
import mockCouponsJson from './mock-coupons.json';
import mockArticlesJson from './mock-articles.json';
import mockCategoriesJson from './mock-categories.json';

// Re-export from central JSON mock files to preserve backwards compatibility
export const MOCK_STORES: Store[] = mockStoresJson as Store[];
export const MOCK_DEALS: Deal[] = mockDealsJson as Deal[];
export const MOCK_COUPONS: Coupon[] = mockCouponsJson as Coupon[];
export const MOCK_ARTICLES: Article[] = mockArticlesJson as unknown as Article[];

export const CATEGORIES_LIST = [
  { slug: 'all', name: 'All Categories', icon: 'Sparkles' },
  ...mockCategoriesJson.map(c => ({
    slug: c.slug,
    name: c.name,
    icon: c.icon || 'Layers',
  }))
];
