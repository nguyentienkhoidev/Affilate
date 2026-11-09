import type { ArticleSidebarConfig } from '@/types/deals';

export interface AdminArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  categoryId?: number;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  scheduledAt?: string;
  readTime: string;
  imageUrl: string;
  featured: boolean;
  tags: string[];
  rating: string;
  status: 'PUBLISHED' | 'DRAFT' | 'SCHEDULED';
  views: number;
  storeSlug?: string;
  storeName?: string;
  sidebarConfig?: ArticleSidebarConfig;
}

export interface CategoryOption {
  id: number;
  name: string;
  slug: string;
}

export const POSTS_STORE_KEY = 'posts';
