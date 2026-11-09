import { MetadataRoute } from 'next';
import { SITE_URL } from '@/constants/site';

const BACKEND_BASE =
  process.env.BACKEND_INTERNAL_URL ||
  (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080').replace(/\/api\/v1\/?$/, '');

export default async function robots(): Promise<MetadataRoute.Robots> {
  let noIndex = false;
  try {
    const res = await fetch(`${BACKEND_BASE}/api/v1/settings/public`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const json = await res.json();
      const map = json?.data?.settings || json?.data;
      noIndex = map?.no_index === 'true';
    }
  } catch {
    // Use standard crawl rules if settings fetch fails
  }

  if (noIndex) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
      sitemap: `${SITE_URL}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/go/',
          '/out/',
          '/api/',
          '/login',
          '/search',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
