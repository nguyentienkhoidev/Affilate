import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { StaticPageData } from '@/app/admin/pages/_lib/data';

export interface PublicPageSummary {
  id: number;
  title: string;
  slug: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  updatedAt?: string;
}

const BUILTIN_PAGE_ROUTES = new Set([
  'about-us',
  'contact-us',
  'editorial-guidelines',
  'affiliate-disclosure',
  'privacy-policy',
  'terms',
]);

export function resolvePublicPageHref(slug: string): string {
  const clean = slug.replace(/^\/+/, '').trim().toLowerCase();
  if (!clean) return '/';
  if (BUILTIN_PAGE_ROUTES.has(clean)) {
    return `/${clean}`;
  }
  return `/pages/${clean}`;
}

class PageService {
  private detailCache = new Map<string, StaticPageData | null>();
  private listCache: PublicPageSummary[] | null = null;

  async getPublicPages(): Promise<PublicPageSummary[]> {
    if (this.listCache) {
      return this.listCache;
    }

    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.PAGES, { timeout: 6000 });
      const list = res.data?.data;
      if (Array.isArray(list)) {
        const mapped: PublicPageSummary[] = list.map((p: any) => ({
          id: Number(p.id),
          title: String(p.title || ''),
          slug: String(p.slug || ''),
          image: p.image ? String(p.image) : undefined,
          isActive: p.isActive !== false,
          sortOrder: Number(p.sortOrder ?? 9999),
          updatedAt: p.updatedAt ? String(p.updatedAt) : undefined,
        }));
        this.listCache = mapped;
        return mapped;
      }
    } catch (err) {
      console.warn('Failed to fetch public pages list from backend:', err);
    }

    return [];
  }

  async getPublicPage(slug: string): Promise<StaticPageData | null> {
    const cleanSlug = slug.replace(/^\/+/, '').trim().toLowerCase();
    if (!cleanSlug) return null;

    if (this.detailCache.has(cleanSlug)) {
      return this.detailCache.get(cleanSlug) || null;
    }

    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.PAGE_DETAIL(cleanSlug), { timeout: 6000 });
      const data = res.data?.data;
      if (data && (data.id || data.title)) {
        const mapped: StaticPageData = {
          id: Number(data.id),
          title: String(data.title || ''),
          slug: String(data.slug || cleanSlug),
          content: String(data.content || ''),
          metaTitle: String(data.metaTitle || ''),
          metaDescription: String(data.metaDescription || ''),
          updatedAt: data.updatedAt
            ? new Date(data.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : '',
          sortOrder: Number(data.sortOrder ?? 1),
          isActive: data.isActive !== false,
        };
        this.detailCache.set(cleanSlug, mapped);
        return mapped;
      }
    } catch {
      // 404 or backend unavailable -> return null cleanly
    }

    return null;
  }

  async getPageBySlug(slug: string): Promise<StaticPageData | null> {
    return this.getPublicPage(slug);
  }
}

export const pageService = new PageService();
export default pageService;
