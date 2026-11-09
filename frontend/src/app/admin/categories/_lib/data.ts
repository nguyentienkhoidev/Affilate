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
