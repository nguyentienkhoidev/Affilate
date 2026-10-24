export interface MediaItem {
  id: string;
  name: string;
  url: string;
  category: 'stores' | 'articles' | 'banners' | 'icons';
  size: string;
  dimensions: string;
  format: string;
  createdAt: string;
}

export const MEDIA_STORE_KEY = 'admin:media:items';

export const DEFAULT_MEDIA: MediaItem[] = [
  {
    id: 'm-1',
    name: 'nilight-hero-banner.webp',
    url: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=80',
    category: 'stores',
    size: '142 KB',
    dimensions: '1200 x 630',
    format: 'WEBP',
    createdAt: '2026-10-23',
  },
  {
    id: 'm-2',
    name: 'neo-sabers-combat.webp',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    category: 'articles',
    size: '185 KB',
    dimensions: '1200 x 720',
    format: 'WEBP',
    createdAt: '2026-10-22',
  },
  {
    id: 'm-3',
    name: 'auxito-led-headlights.webp',
    url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80',
    category: 'stores',
    size: '98 KB',
    dimensions: '800 x 800',
    format: 'WEBP',
    createdAt: '2026-10-21',
  },
  {
    id: 'm-4',
    name: 'anker-charger-review.webp',
    url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=80',
    category: 'articles',
    size: '210 KB',
    dimensions: '1280 x 720',
    format: 'WEBP',
    createdAt: '2026-10-20',
  },
  {
    id: 'm-5',
    name: 'header-ads-728x90.webp',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=728&h=90&fit=crop&q=80',
    category: 'banners',
    size: '45 KB',
    dimensions: '728 x 90',
    format: 'WEBP',
    createdAt: '2026-10-19',
  },
  {
    id: 'm-6',
    name: 'tech-gadgets-collection.webp',
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    category: 'articles',
    size: '175 KB',
    dimensions: '1200 x 800',
    format: 'WEBP',
    createdAt: '2026-10-18',
  },
  {
    id: 'm-7',
    name: 'apple-silicon-m3.webp',
    url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
    category: 'articles',
    size: '192 KB',
    dimensions: '1200 x 800',
    format: 'WEBP',
    createdAt: '2026-10-17',
  },
  {
    id: 'm-8',
    name: 'sony-wh1000xm5.webp',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    category: 'articles',
    size: '115 KB',
    dimensions: '800 x 800',
    format: 'WEBP',
    createdAt: '2026-10-16',
  },
  {
    id: 'm-9',
    name: 'brand-logo-dark.webp',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80',
    category: 'icons',
    size: '32 KB',
    dimensions: '512 x 512',
    format: 'PNG',
    createdAt: '2026-10-15',
  },
  {
    id: 'm-10',
    name: 'cyber-monday-promo.webp',
    url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
    category: 'banners',
    size: '228 KB',
    dimensions: '1200 x 600',
    format: 'WEBP',
    createdAt: '2026-10-14',
  },
];
