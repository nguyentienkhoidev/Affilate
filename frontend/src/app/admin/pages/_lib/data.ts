export interface StaticPageData {
  id: number;
  title: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export const PAGES_STORE_KEY = 'static-pages';

export const DEFAULT_PAGES: StaticPageData[] = [];
