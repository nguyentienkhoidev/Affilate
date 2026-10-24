import mockCategoriesData from '@/lib/data/mock-categories.json';

export interface CategoryData {
  id: number;
  name: string;
  slug: string;
  description: string;
  articlesCount: number;
  sortOrder: number;
  imageUrl?: string;
  isActive: boolean;
}

export const CATEGORIES_STORE_KEY = 'categories';

export const DEFAULT_CATEGORIES: CategoryData[] = (mockCategoriesData as Array<Record<string, unknown>>).map((c, idx) => ({
  id: Number(c.id || idx + 1),
  name: String(c.name),
  slug: String(c.slug),
  description: String(c.description || `${c.name} category`),
  articlesCount: Number(c.count || 10),
  sortOrder: idx + 1,
  imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
  isActive: true,
}));
