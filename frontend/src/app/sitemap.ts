import { MetadataRoute } from 'next';
import { ROUTES } from '@/constants/routes';
import { absoluteUrl } from '@/constants/site';
import { resolvePublicPageHref } from '@/services/pageService';

const BACKEND_BASE =
  process.env.BACKEND_INTERNAL_URL ||
  (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080').replace(/\/api\/v1\/?$/, '');

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BACKEND_BASE}${path}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const body = await res.json();
    return (body?.data ?? null) as T | null;
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [storesPage, postsPage, categoriesList, pagesList] = await Promise.all([
    fetchJson<{ content?: Array<{ slug: string; updatedAt?: string }> }>(
      '/api/v1/public/stores?page=0&size=500'
    ),
    fetchJson<{ content?: Array<{ slug: string; publishedAt?: string }> }>(
      '/api/v1/public/posts?page=0&size=500'
    ),
    fetchJson<Array<{ slug: string }>>('/api/v1/public/categories?type=post'),
    fetchJson<Array<{ slug: string; updatedAt?: string }>>('/api/v1/pages'),
  ]);

  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl(ROUTES.PUBLIC.HOME),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: absoluteUrl(ROUTES.PUBLIC.STORES),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: absoluteUrl(ROUTES.PUBLIC.POSTS),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: absoluteUrl(ROUTES.PUBLIC.CATEGORIES),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: absoluteUrl(ROUTES.PUBLIC.CONTACT_US),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const pageRoutes: MetadataRoute.Sitemap = Array.isArray(pagesList)
    ? pagesList
        .filter((p) => Boolean(p?.slug))
        .map((p) => ({
          url: absoluteUrl(resolvePublicPageHref(p.slug)),
          lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
          changeFrequency: 'monthly' as const,
          priority: 0.4,
        }))
    : [];

  const storeRoutes: MetadataRoute.Sitemap = Array.isArray(storesPage?.content)
    ? storesPage!.content
        .filter((store) => Boolean(store?.slug))
        .map((store) => ({
          url: absoluteUrl(ROUTES.PUBLIC.STORE_DETAIL(store.slug)),
          lastModified: store.updatedAt ? new Date(store.updatedAt) : now,
          changeFrequency: 'daily' as const,
          priority: 0.85,
        }))
    : [];

  const articleRoutes: MetadataRoute.Sitemap = Array.isArray(postsPage?.content)
    ? postsPage!.content
        .filter((post) => Boolean(post?.slug))
        .map((post) => ({
          url: absoluteUrl(ROUTES.PUBLIC.POST_DETAIL(post.slug)),
          lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }))
    : [];

  const categoryRoutes: MetadataRoute.Sitemap = Array.isArray(categoriesList)
    ? categoriesList
        .filter((cat) => Boolean(cat?.slug))
        .map((cat) => ({
          url: absoluteUrl(ROUTES.PUBLIC.CATEGORY_DETAIL(cat.slug)),
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }))
    : [];

  const seen = new Set<string>();
  return [...coreRoutes, ...pageRoutes, ...storeRoutes, ...articleRoutes, ...categoryRoutes].filter(
    (entry) => {
      if (seen.has(entry.url)) return false;
      seen.add(entry.url);
      return true;
    }
  );
}
