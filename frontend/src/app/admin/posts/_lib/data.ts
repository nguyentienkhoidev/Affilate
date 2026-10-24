import mockArticlesData from '@/lib/data/mock-articles.json';

export interface AdminArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  scheduledAt?: string; // ISO / YYYY-MM-DDTHH:mm for scheduled release
  readTime: string;
  imageUrl: string;
  featured: boolean;
  tags: string[];
  rating: string;
  status: 'PUBLISHED' | 'DRAFT' | 'SCHEDULED';
  views: number;
}

export const CLIENT_CATEGORIES = [
  'Tech',
  'Business',
  'Entertainment',
  'US Politics',
  'Reviews',
  'Lifestyle',
  'Tech & Gear',
  'Automotive Tech',
  'Audio Gear'
];

export const POSTS_STORE_KEY = 'posts';

export const DEFAULT_ARTICLES: AdminArticle[] = (mockArticlesData as Array<Record<string, unknown>>).map((art, idx) => {
  const authorObj = (art.author as Record<string, string> | undefined) || {};
  let status: AdminArticle['status'] = 'PUBLISHED';
  let scheduledAt: string | undefined = undefined;
  let publishedAt = String(art.publishedAt || 'Today');

  if (idx === 2) {
    status = 'SCHEDULED';
    scheduledAt = '2026-10-28T09:30';
    publishedAt = 'Oct 28, 2026 09:30';
  } else if (idx === 5) {
    status = 'SCHEDULED';
    scheduledAt = '2026-11-02T15:00';
    publishedAt = 'Nov 02, 2026 15:00';
  } else if (idx > 7) {
    status = 'DRAFT';
    publishedAt = 'Draft';
  }

  return {
    id: String(art.id || `art-${idx + 1}`),
    slug: String(art.slug),
    title: String(art.title),
    excerpt: String(art.excerpt || ''),
    content: String(art.content || ''),
    category: String(art.category || 'Reviews'),
    author: {
      name: authorObj.name || 'Marcus Vance',
      role: authorObj.role || 'Senior Hardware Reviewer',
      avatar: authorObj.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    publishedAt,
    scheduledAt,
    readTime: String(art.readTime || '6 min read'),
    imageUrl: String(art.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'),
    featured: Boolean(art.featured || false),
    tags: (art.tags as string[]) || ['Reviews', 'Testing', 'Bargorya Lab'],
    rating: (4.7 + (idx % 3) * 0.1).toFixed(1),
    status,
    views: 1200 + (idx * 640),
  };
});
