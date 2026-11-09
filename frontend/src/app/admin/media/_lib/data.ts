export interface MediaItem {
  id: string | number;
  name: string;
  url: string;
  category: 'stores' | 'articles' | 'banners' | 'icons' | string;
  size: string;
  dimensions: string;
  format: string;
  createdAt: string;
  tags: string[];
}

export const SUGGESTED_TAGS: string[] = [
  'products',
  'review',
  'tech',
  'articles',
  'stores',
  'deals',
  'banner',
  'accessories',
  'headphones',
  'laptop',
  'logo',
  'featured',
  'fashion',
  'home',
];
