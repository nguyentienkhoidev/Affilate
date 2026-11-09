/**
 * Canonical public origin of the site (no trailing slash).
 * Configure via NEXT_PUBLIC_SITE_URL; falls back to local dev.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

/** Build an absolute URL from a site-relative path (e.g. ROUTES.PUBLIC.POST_DETAIL(slug)). */
export const absoluteUrl = (path = '/') => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

